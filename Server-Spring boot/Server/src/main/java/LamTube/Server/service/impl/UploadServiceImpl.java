package LamTube.Server.service.impl;

import java.io.IOException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import LamTube.Server.configuration.RustFsProperties;
import LamTube.Server.dto.VideoRequestDTO;
import LamTube.Server.dto.VideoResponseDTO;
import LamTube.Server.model.CategoryEntity;
import LamTube.Server.model.UserEntity;
import LamTube.Server.model.VideoEntity;
import LamTube.Server.repository.CategoryRepository;
import LamTube.Server.repository.UserRepository;
import LamTube.Server.repository.VideoRepository;
import LamTube.Server.service.IUploadService;
import lombok.RequiredArgsConstructor;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
@RequiredArgsConstructor
public class UploadServiceImpl implements IUploadService {

    private final RustFsProperties rustFsProperties;
    private final S3Client rustFsS3Client;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final VideoRepository videoRepository;

    @Override
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        return uploadFile(file, "images");
    }

    @Override
    public VideoResponseDTO uploadVideo(String email, MultipartFile videoFile, MultipartFile thumbnailFile,
            VideoRequestDTO videoRequest) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email người dùng không hợp lệ");
        }
        if (videoFile == null || videoFile.isEmpty()) {
            throw new IllegalArgumentException("File video không được để trống");
        }
        if (videoRequest == null || videoRequest.getTitle() == null || videoRequest.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Tiêu đề video không được để trống");
        }

        String videoContentType = videoFile.getContentType();
        if (videoContentType == null || !videoContentType.startsWith("video/")) {
            throw new IllegalArgumentException("File video không hợp lệ");
        }

        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            String thumbnailContentType = thumbnailFile.getContentType();
            if (thumbnailContentType == null || !thumbnailContentType.startsWith("image/")) {
                throw new IllegalArgumentException("Thumbnail phải là file ảnh");
            }
        }

        String status = videoRequest.getStatus() == null || videoRequest.getStatus().isBlank()
                ? "public"
                : videoRequest.getStatus().trim().toLowerCase();
        if (!"public".equals(status) && !"private".equals(status)) {
            throw new IllegalArgumentException("Trạng thái video không hợp lệ");
        }

        UserEntity user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        CategoryEntity category = null;
        if (videoRequest.getCategoryId() != null && !videoRequest.getCategoryId().isBlank()) {
            Long categoryId;
            try {
                categoryId = Long.parseLong(videoRequest.getCategoryId().trim());
            } catch (NumberFormatException ex) {
                throw new IllegalArgumentException("Danh mục không hợp lệ");
            }

            category = categoryRepository.findById(categoryId)
                    .filter(item -> !Boolean.TRUE.equals(item.getIsDeleted()))
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        }


        String videoUrl = uploadFile(videoFile, "videos");
        String thumbnailUrl = thumbnailFile != null && !thumbnailFile.isEmpty()
                ? uploadFile(thumbnailFile, "thumbnails")
                : null;

        VideoEntity videoEntity = new VideoEntity();
        videoEntity.setTitle(videoRequest.getTitle().trim());
        videoEntity.setDescription(videoRequest.getDescription() != null ? videoRequest.getDescription().trim() : "");
        videoEntity.setStatus(status);
        videoEntity.setVideoUrl(videoUrl);
        videoEntity.setThumbnailUrl(thumbnailUrl);
        videoEntity.setViewCount(0);
        videoEntity.setUser(user);
        videoEntity.setCategory(category);

        VideoEntity savedVideo = videoRepository.save(videoEntity);

        VideoResponseDTO responseDTO = new VideoResponseDTO();
        responseDTO.setId(savedVideo.getId());
        responseDTO.setTitle(savedVideo.getTitle());
        responseDTO.setDescription(savedVideo.getDescription());
        responseDTO.setVideoUrl(savedVideo.getVideoUrl());
        responseDTO.setThumbnailUrl(savedVideo.getThumbnailUrl());
        responseDTO.setStatus(savedVideo.getStatus());
        responseDTO.setViewCount(savedVideo.getViewCount() != null ? savedVideo.getViewCount() : 0);
        responseDTO.setCategoryName(savedVideo.getCategory() != null ? savedVideo.getCategory().getName() : null);
        return responseDTO;
    }
    
    private String uploadFile(MultipartFile file, String folder) {
        try {
            ensureBucketExists();

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String key = folder + "/" + UUID.randomUUID() + "-" + originalName;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(rustFsProperties.getBucketName())
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            rustFsS3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String prefix = rustFsProperties.getPublicUrlPrefix();
            if (prefix.endsWith("/")) {
                prefix = prefix.substring(0, prefix.length() - 1);
            }

            return prefix + "/" + rustFsProperties.getBucketName() + "/" + key;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi đọc file để upload lên RustFS: " + e.getMessage(), e);
        } catch (S3Exception e) {
            String s3Code = e.awsErrorDetails() != null ? e.awsErrorDetails().errorCode() : "Unknown";
            String s3Message = e.awsErrorDetails() != null ? e.awsErrorDetails().errorMessage() : e.getMessage();
            throw new RuntimeException(
                    "Lỗi RustFS S3 khi upload ảnh. code=" + s3Code + ", message=" + s3Message,
                    e);
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("Lỗi không xác định khi upload ảnh lên RustFS: " + ex.getMessage(), ex);
        }
    }

    private void ensureBucketExists() {
        String bucketName = rustFsProperties.getBucketName();

        try {
            rustFsS3Client.headBucket(HeadBucketRequest.builder()
                    .bucket(bucketName)
                    .build());
        } catch (S3Exception e) {
            if (e.statusCode() == 404 || "NoSuchBucket".equals(e.awsErrorDetails() != null
                    ? e.awsErrorDetails().errorCode()
                    : null)) {
                rustFsS3Client.createBucket(CreateBucketRequest.builder()
                        .bucket(bucketName)
                        .build());
                return;
            }

            throw e;
        }
    }
}