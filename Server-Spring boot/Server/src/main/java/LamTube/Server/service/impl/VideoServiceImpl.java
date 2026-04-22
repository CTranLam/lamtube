package LamTube.Server.service.impl;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.ArrayDeque;
import java.util.Deque;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import LamTube.Server.configuration.RustFsProperties;
import LamTube.Server.dto.comment.CommentCreateRequestDTO;
import LamTube.Server.dto.comment.CommentResponseDTO;
import LamTube.Server.dto.comment.CommentUpdateRequestDTO;
import LamTube.Server.dto.video.VideoReactionSummaryDTO;
import LamTube.Server.dto.video.VideoResponseDTO;
import LamTube.Server.dto.base.PagedResponseDTO;
import LamTube.Server.exception.AccessDeniedException;
import LamTube.Server.exception.ResourceNotFoundException;
import LamTube.Server.model.CommentEntity;
import LamTube.Server.model.UserEntity;
import LamTube.Server.model.VideoEntity;
import LamTube.Server.model.VideoReactionEntity;
import LamTube.Server.repository.CommentRepository;
import LamTube.Server.repository.SubscriptionRepository;
import LamTube.Server.repository.UserProfileRepository;
import LamTube.Server.repository.UserRepository;
import LamTube.Server.repository.VideoReactionRepository;
import LamTube.Server.repository.VideoRepository;
import LamTube.Server.service.IVideoService;
import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;

@Service
@RequiredArgsConstructor
public class VideoServiceImpl implements IVideoService {

    private static final int BUFFER_SIZE = 8192;
    private static final int MAX_COMMENT_LENGTH = 2000;

    private final VideoRepository videoRepository;
    private final CommentRepository commentRepository;
    private final VideoReactionRepository videoReactionRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final RustFsProperties rustFsProperties;
    private final S3Client rustFsS3Client;
    @Override
    public VideoResponseDTO getVideoById(Long videoId, String requesterEmail) {
        VideoEntity videoEntity = videoRepository.findByIdAndIsDeletedFalse(videoId);
        if (videoEntity == null) {
            throw new ResourceNotFoundException("Video không tồn tại hoặc đã bị xóa.");
        }

        String status = videoEntity.getStatus() == null ? "public" : videoEntity.getStatus().trim().toLowerCase();
        if (!"public".equals(status)) {
            if (requesterEmail == null || requesterEmail.isBlank()) {
                throw new AccessDeniedException("Bạn không có quyền xem video này.");
            }

            UserEntity requester = userRepository.findByEmailAndIsDeletedFalse(requesterEmail)
                    .orElseThrow(() -> new AccessDeniedException("Bạn không có quyền xem video này."));

            if (!requester.getId().equals(videoEntity.getUser().getId())) {
                throw new AccessDeniedException("Bạn không có quyền xem video này.");
            }
        }

        return convertToDTO(videoEntity, requesterEmail);
    }

    @Override
    public PagedResponseDTO<VideoResponseDTO> getHomeVideos(int page, int size, Long categoryId, String title) {
        if (page < 0) {
            throw new IllegalArgumentException("Page phải lớn hơn hoặc bằng 0");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Size phải lớn hơn 0");
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Order.desc("viewCount"), Sort.Order.desc("id")));

        String keywordPattern = (title == null || title.isBlank())
                ? null
                : "%" + title.toLowerCase(Locale.ROOT) + "%";

        Page<VideoEntity> videosPage = videoRepository.searchHomeVideos(categoryId, keywordPattern, pageable);

        List<VideoResponseDTO> items = videosPage.getContent()
                .stream()
                .map(video -> convertToDTO(video, null))
                .collect(Collectors.toList());

        return new PagedResponseDTO<>(
                items,
                videosPage.getNumber(),
                videosPage.getSize(),
                videosPage.getTotalElements(),
                videosPage.getTotalPages());
    }

    @Override
    public VideoReactionSummaryDTO getReactionSummary(Long videoId, String requesterEmail) {
        VideoEntity videoEntity = videoRepository.findByIdAndIsDeletedFalse(videoId);
        if (videoEntity == null) {
            throw new ResourceNotFoundException("Video không tồn tại hoặc đã bị xóa.");
        }

        long likeCount = videoReactionRepository.countByVideo_IdAndTypeIgnoreCase(videoId, "like");
        long dislikeCount = videoReactionRepository.countByVideo_IdAndTypeIgnoreCase(videoId, "dislike");

        String userReaction = null;
        if (requesterEmail != null && !requesterEmail.isBlank()) {
            userReaction = videoReactionRepository.findByVideo_IdAndUser_Email(videoId, requesterEmail)
                    .map(VideoReactionEntity::getType)
                    .map(String::toLowerCase)
                    .orElse(null);
        }

        return new VideoReactionSummaryDTO(likeCount, dislikeCount, userReaction);
    }

    @Override
    @Transactional
    public VideoReactionSummaryDTO reactToVideo(Long videoId, String requesterEmail, String type) {
        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new AccessDeniedException("Bạn cần đăng nhập để tương tác video.");
        }
        if (type == null || type.isBlank()) {
            return removeReaction(videoId, requesterEmail);
        }

        String normalizedType = type.trim().toLowerCase(Locale.ROOT);
        if (!Objects.equals(normalizedType, "like") && !Objects.equals(normalizedType, "dislike")) {
            throw new IllegalArgumentException("Loại tương tác chỉ chấp nhận like hoặc dislike.");
        }

        VideoEntity videoEntity = videoRepository.findByIdAndIsDeletedFalse(videoId);
        if (videoEntity == null) {
            throw new ResourceNotFoundException("Video không tồn tại hoặc đã bị xóa.");
        }

        UserEntity user = userRepository.findByEmailAndIsDeletedFalse(requesterEmail)
                .orElseThrow(() -> new AccessDeniedException("Bạn cần đăng nhập để tương tác video."));

        VideoReactionEntity reaction = videoReactionRepository.findByVideo_IdAndUser_Email(videoId, requesterEmail)
                .orElseGet(() -> {
                    VideoReactionEntity newReaction = new VideoReactionEntity();
                    newReaction.setVideo(videoEntity);
                    newReaction.setUser(user);
                    return newReaction;
                });

        reaction.setType(normalizedType);
        videoReactionRepository.save(reaction);

        return getReactionSummary(videoId, requesterEmail);
    }

    @Override
    @Transactional
    public VideoReactionSummaryDTO removeReaction(Long videoId, String requesterEmail) {
        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new AccessDeniedException("Bạn cần đăng nhập để tương tác video.");
        }

        VideoEntity videoEntity = videoRepository.findByIdAndIsDeletedFalse(videoId);
        if (videoEntity == null) {
            throw new ResourceNotFoundException("Video không tồn tại hoặc đã bị xóa.");
        }

        videoReactionRepository.deleteByVideo_IdAndUser_Email(videoId, requesterEmail);
        return getReactionSummary(videoId, requesterEmail);
    }

    @Override
    public ResponseEntity<StreamingResponseBody> streamVideo(Long videoId, String requesterEmail, String rangeHeader,
            String ifRangeHeader) {
        VideoResponseDTO video = getVideoById(videoId, requesterEmail);
        String key = extractS3Key(video.getVideoUrl());

        HeadObjectResponse head = rustFsS3Client.headObject(HeadObjectRequest.builder()
                .bucket(rustFsProperties.getBucketName())
                .key(key)
                .build());

        long totalLength = head.contentLength();
        String contentType = (head.contentType() == null || head.contentType().isBlank())
                ? "video/mp4"
                : head.contentType();

        String etag = normalizeEtag(head.eTag());
        String responseEtag = etag == null ? null : '"' + etag + '"';
        String lastModified = formatHttpDate(head.lastModified());

        ByteRange range = parseRange(rangeHeader, totalLength);
        boolean shouldIgnoreRange = range != null && ifRangeHeader != null && !ifRangeHeader.isBlank()
                && !isIfRangeMatched(ifRangeHeader, etag, lastModified);

        if (range == null || shouldIgnoreRange) {
            StreamingResponseBody body = outputStream -> {
                try (InputStream inputStream = rustFsS3Client.getObject(GetObjectRequest.builder()
                        .bucket(rustFsProperties.getBucketName())
                        .key(key)
                        .build())) {
                    copyExactly(inputStream, outputStream, totalLength);
                }
            };

            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.ACCEPT_RANGES, "bytes");
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentLength(totalLength);
            if (responseEtag != null) {
                headers.set(HttpHeaders.ETAG, responseEtag);
            }
            if (lastModified != null) {
                headers.set(HttpHeaders.LAST_MODIFIED, lastModified);
            }

            return ResponseEntity.ok().headers(headers).body(body);
        }

        if (range.start >= totalLength) {
            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_RANGE, "bytes */" + totalLength);
            return ResponseEntity.status(HttpStatus.REQUESTED_RANGE_NOT_SATISFIABLE)
                    .headers(headers)
                    .build();
        }

        long start = range.start;
        long end = Math.min(range.end, totalLength - 1);
        long length = end - start + 1;

        StreamingResponseBody body = outputStream -> {
            try (InputStream inputStream = rustFsS3Client.getObject(GetObjectRequest.builder()
                    .bucket(rustFsProperties.getBucketName())
                    .key(key)
                    .build())) {
                skipExactly(inputStream, start);
                copyExactly(inputStream, outputStream, length);
            }
        };

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.ACCEPT_RANGES, "bytes");
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentLength(length);
        headers.set(HttpHeaders.CONTENT_RANGE, "bytes " + start + "-" + end + "/" + totalLength);
        if (responseEtag != null) {
            headers.set(HttpHeaders.ETAG, responseEtag);
        }
        if (lastModified != null) {
            headers.set(HttpHeaders.LAST_MODIFIED, lastModified);
        }

        return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT)
                .headers(headers)
                .body(body);
    }

    private VideoResponseDTO convertToDTO(VideoEntity videoEntity, String requesterEmail) {
        VideoResponseDTO videoResponseDTO = new VideoResponseDTO();
        Long channelOwnerId = videoEntity.getUser() != null ? videoEntity.getUser().getId() : null;
        String uploaderEmail = videoEntity.getUser() != null ? videoEntity.getUser().getEmail() : null;
        String uploaderName = uploaderEmail != null && uploaderEmail.contains("@")
                ? uploaderEmail.substring(0, uploaderEmail.indexOf("@"))
                : "LamTube";
        String uploaderAvatarUrl = null;
        if (channelOwnerId != null) {
            var profile = userProfileRepository.findByUser_Id(channelOwnerId).orElse(null);
            if (profile != null) {
                if (profile.getFullName() != null && !profile.getFullName().isBlank()) {
                    uploaderName = profile.getFullName().trim();
                }
                uploaderAvatarUrl = profile.getAvatarUrl();
            }
        }

        videoResponseDTO.setId(videoEntity.getId());
        videoResponseDTO.setChannelId(channelOwnerId);
        videoResponseDTO.setUploaderId(channelOwnerId);
        videoResponseDTO.setTitle(videoEntity.getTitle());
        videoResponseDTO.setDescription(videoEntity.getDescription());
        videoResponseDTO.setThumbnailUrl(videoEntity.getThumbnailUrl());
        videoResponseDTO.setVideoUrl(videoEntity.getVideoUrl());
        videoResponseDTO.setStatus(videoEntity.getStatus());
        videoResponseDTO.setViewCount(videoEntity.getViewCount() == null ? 0L : videoEntity.getViewCount());
        if (videoEntity.getCategory() != null) {
            videoResponseDTO.setCategoryName(videoEntity.getCategory().getName());
            videoResponseDTO.setCategoryId(videoEntity.getCategory().getId());
        }
        videoResponseDTO.setUploaderName(uploaderName);
        videoResponseDTO.setUploaderAvatarUrl(uploaderAvatarUrl);

        if (channelOwnerId != null) {
            long subscriberCount = subscriptionRepository.countByChannelOwner_IdAndChannelOwner_IsDeletedFalse(channelOwnerId);
            videoResponseDTO.setSubscriberCount(subscriberCount);
            boolean isSubscribed = requesterEmail != null
                    && !requesterEmail.isBlank()
                    && subscriptionRepository.existsByFollower_EmailAndChannelOwner_IdAndFollower_IsDeletedFalseAndChannelOwner_IsDeletedFalse(
                            requesterEmail,
                            channelOwnerId);
            videoResponseDTO.setIsSubscribed(isSubscribed);
        } else {
            videoResponseDTO.setSubscriberCount(0L);
            videoResponseDTO.setIsSubscribed(false);
        }

        long likeCount = videoReactionRepository.countByVideo_IdAndTypeIgnoreCase(videoEntity.getId(), "like");
        long dislikeCount = videoReactionRepository.countByVideo_IdAndTypeIgnoreCase(videoEntity.getId(), "dislike");
        long commentCount = commentRepository.countByVideo_IdAndIsDeletedFalse(videoEntity.getId());
        videoResponseDTO.setLikeCount(likeCount);
        videoResponseDTO.setDislikeCount(dislikeCount);
        videoResponseDTO.setCommentCount(commentCount);
        return videoResponseDTO;
    }


    @Override
    @Transactional
    public void updateView(Long videoId) {
        VideoEntity videoEntity = videoRepository.findByIdAndIsDeletedFalse(videoId);
        if (videoEntity == null) {
            throw new ResourceNotFoundException("Video không tồn tại hoặc đã bị xóa.");
        }
        long currentViewCount = videoEntity.getViewCount() == null ? 0L : videoEntity.getViewCount();
        videoEntity.setViewCount(currentViewCount + 1L);
    }


    @Override
    public PagedResponseDTO<CommentResponseDTO> getVideoComments(Long videoId, int page, int size) {
        if (videoId == null || videoId <= 0) {
            throw new IllegalArgumentException("ID video không hợp lệ.");
        }
        if (page < 0) {
            throw new IllegalArgumentException("Page phải lớn hơn hoặc bằng 0.");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Size phải lớn hơn 0.");
        }

        VideoEntity videoEntity = videoRepository.findByIdAndIsDeletedFalse(videoId);
        if (videoEntity == null) {
            throw new ResourceNotFoundException("Video không tồn tại hoặc đã bị xóa.");
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));

        Page<CommentEntity> commentsPage = commentRepository.findByVideo_IdAndIsDeletedFalse(videoId, pageable);

        List<CommentResponseDTO> items = commentsPage.getContent()
                .stream()
                .map(this::convertCommentToDTO)
                .collect(Collectors.toList());

        return new PagedResponseDTO<>(
                items,
                commentsPage.getNumber(),
                commentsPage.getSize(),
                commentsPage.getTotalElements(),
                commentsPage.getTotalPages());
    }

    @Override
    @Transactional
    public CommentResponseDTO createVideoComment(Long videoId, String requesterEmail, CommentCreateRequestDTO request) {
        if (videoId == null || videoId <= 0) {
            throw new IllegalArgumentException("ID video không hợp lệ.");
        }
        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new AccessDeniedException("Bạn cần đăng nhập để bình luận.");
        }
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu bình luận không hợp lệ.");
        }

        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (content.isBlank()) {
            throw new IllegalArgumentException("Nội dung bình luận không được để trống.");
        }
        if (content.length() > MAX_COMMENT_LENGTH) {
            throw new IllegalArgumentException("Nội dung bình luận không được vượt quá " + MAX_COMMENT_LENGTH + " ký tự.");
        }

        VideoEntity videoEntity = videoRepository.findByIdAndIsDeletedFalse(videoId);
        if (videoEntity == null) {
            throw new ResourceNotFoundException("Video không tồn tại hoặc đã bị xóa.");
        }

        UserEntity user = userRepository.findByEmailAndIsDeletedFalse(requesterEmail)
                .orElseThrow(() -> new AccessDeniedException("Bạn cần đăng nhập để bình luận."));

        CommentEntity parent = null;
        if (request.getParentId() != null) {
            parent = commentRepository.findByIdAndIsDeletedFalse(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bình luận cha không tồn tại."));

            Long parentVideoId = parent.getVideo() != null ? parent.getVideo().getId() : null;
            if (!videoId.equals(parentVideoId)) {
                throw new IllegalArgumentException("Bình luận cha không thuộc video này.");
            }
        }

        CommentEntity comment = new CommentEntity();
        comment.setContent(content);
        comment.setIsDeleted(false);
        comment.setUser(user);
        comment.setVideo(videoEntity);
        comment.setParent(parent);
        if (comment.getCreatedAt() == null) {
            comment.setCreatedAt(LocalDateTime.now());
        }

        CommentEntity savedComment = commentRepository.save(comment);
        return convertCommentToDTO(savedComment);
    }

    @Override
    @Transactional
    public CommentResponseDTO updateVideoComment(
            Long videoId,
            Long commentId,
            String requesterEmail,
            CommentUpdateRequestDTO request) {
        if (videoId == null || videoId <= 0) {
            throw new IllegalArgumentException("ID video không hợp lệ.");
        }
        if (commentId == null || commentId <= 0) {
            throw new IllegalArgumentException("ID bình luận không hợp lệ.");
        }
        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new AccessDeniedException("Bạn cần đăng nhập để sửa bình luận.");
        }
        if (request == null) {
            throw new IllegalArgumentException("Dữ liệu bình luận không hợp lệ.");
        }

        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (content.isBlank()) {
            throw new IllegalArgumentException("Nội dung bình luận không được để trống.");
        }
        if (content.length() > MAX_COMMENT_LENGTH) {
            throw new IllegalArgumentException("Nội dung bình luận không được vượt quá " + MAX_COMMENT_LENGTH + " ký tự.");
        }

        UserEntity requester = userRepository.findByEmailAndIsDeletedFalse(requesterEmail)
                .orElseThrow(() -> new AccessDeniedException("Bạn cần đăng nhập để sửa bình luận."));
        CommentEntity comment = getCommentInVideo(commentId, videoId);

        Long commentOwnerId = comment.getUser() != null ? comment.getUser().getId() : null;
        if (commentOwnerId == null || !commentOwnerId.equals(requester.getId())) {
            throw new AccessDeniedException("Bạn chỉ có thể sửa bình luận của chính mình.");
        }

        comment.setContent(content);
        return convertCommentToDTO(commentRepository.save(comment));
    }

    @Override
    @Transactional
    public void deleteVideoComment(Long videoId, Long commentId, String requesterEmail) {
        if (videoId == null || videoId <= 0) {
            throw new IllegalArgumentException("ID video không hợp lệ.");
        }
        if (commentId == null || commentId <= 0) {
            throw new IllegalArgumentException("ID bình luận không hợp lệ.");
        }
        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new AccessDeniedException("Bạn cần đăng nhập để xóa bình luận.");
        }

        VideoEntity videoEntity = videoRepository.findByIdAndIsDeletedFalse(videoId);
        if (videoEntity == null) {
            throw new ResourceNotFoundException("Video không tồn tại hoặc đã bị xóa.");
        }

        UserEntity requester = userRepository.findByEmailAndIsDeletedFalse(requesterEmail)
                .orElseThrow(() -> new AccessDeniedException("Bạn cần đăng nhập để xóa bình luận."));
        CommentEntity comment = getCommentInVideo(commentId, videoId);

        Long commentOwnerId = comment.getUser() != null ? comment.getUser().getId() : null;
        Long videoOwnerId = videoEntity.getUser() != null ? videoEntity.getUser().getId() : null;
        boolean isCommentOwner = commentOwnerId != null && commentOwnerId.equals(requester.getId());
        boolean isVideoOwner = videoOwnerId != null && videoOwnerId.equals(requester.getId());
        if (!isCommentOwner && !isVideoOwner) {
            throw new AccessDeniedException("Bạn không có quyền xóa bình luận này.");
        }

        softDeleteCommentTree(comment);
    }

    private CommentEntity getCommentInVideo(Long commentId, Long videoId) {
        CommentEntity comment = commentRepository.findByIdAndIsDeletedFalse(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Bình luận không tồn tại hoặc đã bị xóa."));
        Long commentVideoId = comment.getVideo() != null ? comment.getVideo().getId() : null;
        if (!videoId.equals(commentVideoId)) {
            throw new IllegalArgumentException("Bình luận không thuộc video này.");
        }
        return comment;
    }

    private void softDeleteCommentTree(CommentEntity root) {
        Deque<CommentEntity> stack = new ArrayDeque<>();
        stack.push(root);

        while (!stack.isEmpty()) {
            CommentEntity current = stack.pop();
            if (Boolean.TRUE.equals(current.getIsDeleted())) {
                continue;
            }
            current.setIsDeleted(true);

            List<CommentEntity> children = commentRepository.findByParent_IdAndIsDeletedFalse(current.getId());
            for (CommentEntity child : children) {
                stack.push(child);
            }
        }
    }

    private CommentResponseDTO convertCommentToDTO(CommentEntity commentEntity) {
        String authorName = "Người dùng LamTube";
        String authorAvatarUrl = null;
        Long authorId = null;
        if (commentEntity.getUser() != null) {
            authorId = commentEntity.getUser().getId();
            String email = commentEntity.getUser().getEmail();
            if (email != null && email.contains("@")) {
                authorName = email.substring(0, email.indexOf("@"));
            } else if (email != null && !email.isBlank()) {
                authorName = email;
            }

            Long userId = commentEntity.getUser().getId();
            if (userId != null) {
                var profile = userProfileRepository.findByUser_Id(userId).orElse(null);
                if (profile != null) {
                    if (profile.getFullName() != null && !profile.getFullName().isBlank()) {
                        authorName = profile.getFullName().trim();
                    }
                    authorAvatarUrl = profile.getAvatarUrl();
                }
            }
        }

        Long resolvedParentId = commentEntity.getParentId() != null
                ? commentEntity.getParentId()
                : (commentEntity.getParent() != null ? commentEntity.getParent().getId() : null);

        return new CommentResponseDTO(
                commentEntity.getId(),
                commentEntity.getContent(),
                commentEntity.getCreatedAt(),
                resolvedParentId,
                authorId,
                authorName,
                authorAvatarUrl);
    }

    private String extractS3Key(String videoUrl) {
        if (videoUrl == null || videoUrl.isBlank()) {
            throw new ResourceNotFoundException("Video không có đường dẫn lưu trữ hợp lệ.");
        }

        String bucketName = rustFsProperties.getBucketName();
        String path;
        try {
            path = URI.create(videoUrl).getPath();
        } catch (IllegalArgumentException ex) {
            throw new ResourceNotFoundException("Video URL không hợp lệ.");
        }

        if (path == null) {
            throw new ResourceNotFoundException("Video URL không hợp lệ.");
        }

        String normalizedPath = path.startsWith("/") ? path.substring(1) : path;
        String bucketPrefix = bucketName + "/";
        if (!normalizedPath.startsWith(bucketPrefix) || normalizedPath.length() <= bucketPrefix.length()) {
            throw new ResourceNotFoundException("Video URL không thuộc bucket hợp lệ.");
        }

        return normalizedPath.substring(bucketPrefix.length());
    }

    private ByteRange parseRange(String rangeHeader, long totalLength) {
        if (rangeHeader == null || rangeHeader.isBlank()) {
            return null;
        }

        String value = rangeHeader.trim().toLowerCase(Locale.ROOT);
        if (!value.startsWith("bytes=")) {
            return null;
        }

        String rangeValue = value.substring("bytes=".length()).trim();
        int commaIndex = rangeValue.indexOf(',');
        if (commaIndex >= 0) {
            rangeValue = rangeValue.substring(0, commaIndex).trim();
        }

        int dashIndex = rangeValue.indexOf('-');
        if (dashIndex < 0) {
            return null;
        }

        String startPart = rangeValue.substring(0, dashIndex).trim();
        String endPart = rangeValue.substring(dashIndex + 1).trim();

        try {
            if (startPart.isEmpty()) {
                long suffixLength = Long.parseLong(endPart);
                if (suffixLength <= 0) {
                    return null;
                }
                long start = Math.max(totalLength - suffixLength, 0);
                return new ByteRange(start, totalLength - 1);
            }

            long start = Long.parseLong(startPart);
            long end = endPart.isEmpty() ? totalLength - 1 : Long.parseLong(endPart);
            if (start < 0 || end < start) {
                return null;
            }
            return new ByteRange(start, end);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean isIfRangeMatched(String ifRangeHeader, String etag, String lastModifiedHttpDate) {
        String value = ifRangeHeader.trim();
        if (value.isEmpty()) {
            return true;
        }

        if (value.startsWith("\"") || value.startsWith("W/\"")) {
            if (etag == null) {
                return false;
            }
            return normalizeEtag(value).equals(etag);
        }

        if (lastModifiedHttpDate == null) {
            return false;
        }

        return value.equals(lastModifiedHttpDate);
    }

    private String normalizeEtag(String etag) {
        if (etag == null) {
            return null;
        }

        String normalized = etag.trim();
        if (normalized.startsWith("W/")) {
            normalized = normalized.substring(2).trim();
        }
        if (normalized.startsWith("\"") && normalized.endsWith("\"") && normalized.length() >= 2) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }

        return normalized;
    }

    private String formatHttpDate(Instant value) {
        return value == null ? null
                : DateTimeFormatter.RFC_1123_DATE_TIME.format(ZonedDateTime.ofInstant(value, ZoneOffset.UTC));
    }

    private void skipExactly(InputStream inputStream, long bytesToSkip) throws IOException {
        long remaining = bytesToSkip;
        while (remaining > 0) {
            long skipped = inputStream.skip(remaining);
            if (skipped > 0) {
                remaining -= skipped;
                continue;
            }

            int read = inputStream.read();
            if (read == -1) {
                throw new IOException("Không thể bỏ qua đủ số byte yêu cầu.");
            }
            remaining--;
        }
    }

    private void copyExactly(InputStream inputStream, java.io.OutputStream outputStream, long bytesToCopy)
            throws IOException {
        byte[] buffer = new byte[BUFFER_SIZE];
        long remaining = bytesToCopy;

        while (remaining > 0) {
            int read = inputStream.read(buffer, 0, (int) Math.min(buffer.length, remaining));
            if (read == -1) {
                throw new IOException("Nguồn dữ liệu kết thúc sớm khi đang stream video.");
            }
            outputStream.write(buffer, 0, read);
            remaining -= read;
        }
    }

    private static final class ByteRange {
        private final long start;
        private final long end;

        private ByteRange(long start, long end) {
            this.start = start;
            this.end = end;
        }
    }

    @Override
    public List<VideoResponseDTO> getRelatedVideos(Long videoId, int limit) {
        if (videoId == null || videoId <= 0) {
            throw new IllegalArgumentException("ID video không hợp lệ.");
        }
        if (limit <= 0) {
            throw new IllegalArgumentException("Limit phải lớn hơn 0.");
        }

        VideoEntity videoEntity = videoRepository.findByIdAndIsDeletedFalse(videoId);
        if (videoEntity == null) {
            throw new ResourceNotFoundException("Video không tồn tại hoặc đã bị xóa.");
        }

        int normalizedLimit = Math.min(limit, 50);
        Long categoryId = videoEntity.getCategory() != null ? videoEntity.getCategory().getId() : null;
        Long ownerId = videoEntity.getUser() != null ? videoEntity.getUser().getId() : null;

        List<VideoEntity> relatedVideos = new ArrayList<>();

        if (categoryId != null) {
            List<VideoEntity> sameCategory = videoRepository.findRelatedVideosByCategory(
                    videoId,
                    categoryId,
                    PageRequest.of(0, normalizedLimit));
            relatedVideos.addAll(sameCategory);
        }

        if (relatedVideos.size() < normalizedLimit && ownerId != null) {
            int remaining = normalizedLimit - relatedVideos.size();
            List<Long> excludedIds = relatedVideos.stream()
                    .map(VideoEntity::getId)
                    .collect(Collectors.toCollection(ArrayList::new));
            excludedIds.add(videoId);

            List<VideoEntity> sameOwner = videoRepository.findRelatedVideosByOwner(
                    videoId,
                    ownerId,
                    excludedIds,
                    PageRequest.of(0, remaining));
            relatedVideos.addAll(sameOwner);
        }

        return relatedVideos.stream()
                .map(video -> convertToDTO(video, null))
                .collect(Collectors.toList());
    }
}
