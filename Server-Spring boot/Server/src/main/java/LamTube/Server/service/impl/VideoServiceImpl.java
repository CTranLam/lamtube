package LamTube.Server.service.impl;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
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
import LamTube.Server.dto.VideoReactionSummaryDTO;
import LamTube.Server.dto.VideoResponseDTO;
import LamTube.Server.dto.base.PagedResponseDTO;
import LamTube.Server.exception.AccessDeniedException;
import LamTube.Server.exception.ResourceNotFoundException;
import LamTube.Server.model.UserEntity;
import LamTube.Server.model.UserProfileEntity;
import LamTube.Server.model.VideoEntity;
import LamTube.Server.model.VideoReactionEntity;
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

    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final VideoReactionRepository videoReactionRepository;
    private final RustFsProperties rustFsProperties;
    private final S3Client rustFsS3Client;

    @Override
    public VideoResponseDTO getVideoById(Long videoId, String requesterEmail) {
        VideoEntity videoEntity = getAccessibleVideoEntity(videoId, requesterEmail);
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

        String normalizedTitle = title == null ? null : title.trim();
        if (normalizedTitle != null && normalizedTitle.isEmpty()) {
            normalizedTitle = null;
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Order.desc("viewCount"), Sort.Order.desc("id")));

        Page<VideoEntity> videosPage;
        if (categoryId != null && normalizedTitle != null) {
            videosPage = videoRepository.findByIsDeletedFalseAndStatusAndCategory_IdAndTitleContainingIgnoreCase(
                    "public",
                    categoryId,
                    normalizedTitle,
                    pageable);
        } else if (categoryId != null) {
            videosPage = videoRepository.findByIsDeletedFalseAndStatusAndCategory_Id("public", categoryId, pageable);
        } else if (normalizedTitle != null) {
            videosPage = videoRepository.findByIsDeletedFalseAndStatusAndTitleContainingIgnoreCase(
                    "public",
                    normalizedTitle,
                    pageable);
        } else {
            videosPage = videoRepository.findByIsDeletedFalseAndStatus("public", pageable);
        }

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

    @Override
    public VideoReactionSummaryDTO getVideoReactionSummary(Long videoId, String requesterEmail) {
        VideoEntity video = getAccessibleVideoEntity(videoId, requesterEmail);
        String myReaction = getMyReaction(videoId, requesterEmail);
        return buildReactionSummary(video.getId(), myReaction);
    }

    @Override
    @Transactional
    public VideoReactionSummaryDTO setVideoReaction(Long videoId, String requesterEmail, String reactionType) {
        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new AccessDeniedException("Bạn cần đăng nhập để thực hiện thao tác này.");
        }

        VideoEntity video = getAccessibleVideoEntity(videoId, requesterEmail);
        UserEntity requester = userRepository.findByEmailAndIsDeletedFalse(requesterEmail)
                .orElseThrow(() -> new AccessDeniedException("Bạn cần đăng nhập để thực hiện thao tác này."));

        Optional<VideoReactionEntity> existingReactionOptional = videoReactionRepository
                .findByUser_IdAndVideo_Id(requester.getId(), videoId);

        String normalizedReactionType = normalizeReactionType(reactionType);

        if (normalizedReactionType == null) {
            existingReactionOptional.ifPresent(videoReactionRepository::delete);
            return buildReactionSummary(video.getId(), null);
        }

        VideoReactionEntity reactionEntity = existingReactionOptional.orElseGet(VideoReactionEntity::new);
        reactionEntity.setUser(requester);
        reactionEntity.setVideo(video);
        reactionEntity.setType(normalizedReactionType);
        videoReactionRepository.save(reactionEntity);

        return buildReactionSummary(video.getId(), normalizedReactionType);
    }

    private VideoResponseDTO convertToDTO(VideoEntity videoEntity, String requesterEmail) {
        VideoResponseDTO videoResponseDTO = new VideoResponseDTO();
        videoResponseDTO.setId(videoEntity.getId());
        videoResponseDTO.setTitle(videoEntity.getTitle());
        videoResponseDTO.setDescription(videoEntity.getDescription());
        videoResponseDTO.setThumbnailUrl(videoEntity.getThumbnailUrl());
        videoResponseDTO.setVideoUrl(videoEntity.getVideoUrl());
        videoResponseDTO.setStatus(videoEntity.getStatus());
        videoResponseDTO.setViewCount(videoEntity.getViewCount());
        if (videoEntity.getCategory() != null) {
            videoResponseDTO.setCategoryName(videoEntity.getCategory().getName());
            videoResponseDTO.setCategoryId(videoEntity.getCategory().getId());
        }

        UserEntity uploader = videoEntity.getUser();
        if (uploader != null) {
            videoResponseDTO.setChannelId(uploader.getId());
            videoResponseDTO.setUploaderId(uploader.getId());
            String fallbackName = uploader.getEmail();
            UserProfileEntity uploaderProfile = userProfileRepository.findByUser_Id(uploader.getId())
                    .orElse(null);

            if (uploaderProfile != null && uploaderProfile.getFullName() != null
                    && !uploaderProfile.getFullName().trim().isEmpty()) {
                videoResponseDTO.setUploaderName(uploaderProfile.getFullName().trim());
            } else {
                videoResponseDTO.setUploaderName(fallbackName);
            }

            if (uploaderProfile != null) {
                videoResponseDTO.setUploaderAvatarUrl(uploaderProfile.getAvatarUrl());
            }

            videoResponseDTO.setSubscriberCount(subscriptionRepository.countByChannelOwner_Id(uploader.getId()));

            if (requesterEmail != null && !requesterEmail.isBlank()) {
                userRepository.findByEmailAndIsDeletedFalse(requesterEmail)
                        .ifPresent(requester -> {
                            if (!requester.getId().equals(uploader.getId())) {
                                videoResponseDTO.setSubscribed(subscriptionRepository.existsByFollower_IdAndChannelOwner_Id(
                                        requester.getId(),
                                        uploader.getId()));
                            }
                        });
            }
        }

        videoResponseDTO.setLikeCount(videoReactionRepository.countByVideo_IdAndTypeIgnoreCase(videoEntity.getId(), "like"));
        videoResponseDTO
                .setDislikeCount(videoReactionRepository.countByVideo_IdAndTypeIgnoreCase(videoEntity.getId(), "dislike"));

        return videoResponseDTO;
    }

    private VideoReactionSummaryDTO buildReactionSummary(Long videoId, String myReaction) {
        long likeCount = videoReactionRepository.countByVideo_IdAndTypeIgnoreCase(videoId, "like");
        long dislikeCount = videoReactionRepository.countByVideo_IdAndTypeIgnoreCase(videoId, "dislike");
        return new VideoReactionSummaryDTO(videoId, likeCount, dislikeCount, myReaction);
    }

    private String getMyReaction(Long videoId, String requesterEmail) {
        if (requesterEmail == null || requesterEmail.isBlank()) {
            return null;
        }

        UserEntity requester = userRepository.findByEmailAndIsDeletedFalse(requesterEmail)
                .orElse(null);
        if (requester == null) {
            return null;
        }

        return videoReactionRepository.findByUser_IdAndVideo_Id(requester.getId(), videoId)
                .map(VideoReactionEntity::getType)
                .orElse(null);
    }

    private String normalizeReactionType(String reactionType) {
        if (reactionType == null) {
            return null;
        }

        String normalizedType = reactionType.trim().toLowerCase(Locale.ROOT);
        if (normalizedType.isEmpty()) {
            return null;
        }

        if (!"like".equals(normalizedType) && !"dislike".equals(normalizedType)) {
            throw new IllegalArgumentException("Loại reaction không hợp lệ. Chỉ chấp nhận like, dislike hoặc null.");
        }
        return normalizedType;
    }

    private VideoEntity getAccessibleVideoEntity(Long videoId, String requesterEmail) {
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

        return videoEntity;
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
}