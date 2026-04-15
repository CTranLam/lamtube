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
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import LamTube.Server.configuration.RustFsProperties;
import LamTube.Server.dto.VideoResponseDTO;
import LamTube.Server.dto.base.PagedResponseDTO;
import LamTube.Server.exception.AccessDeniedException;
import LamTube.Server.exception.ResourceNotFoundException;
import LamTube.Server.model.UserEntity;
import LamTube.Server.model.VideoEntity;
import LamTube.Server.repository.UserRepository;
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

        return convertToDTO(videoEntity);
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

        Page<VideoEntity> videosPage = videoRepository.searchHomeVideos(categoryId, title, pageable);

        List<VideoResponseDTO> items = videosPage.getContent()
                .stream()
                .map(this::convertToDTO)
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

    private VideoResponseDTO convertToDTO(VideoEntity videoEntity) {
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
        return videoResponseDTO;
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
