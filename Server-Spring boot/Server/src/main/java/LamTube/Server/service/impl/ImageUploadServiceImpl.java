package LamTube.Server.service.impl;

import java.io.IOException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import LamTube.Server.configuration.RustFsProperties;
import LamTube.Server.service.IImageUploadService;
import lombok.RequiredArgsConstructor;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

@Service
@RequiredArgsConstructor
public class ImageUploadServiceImpl implements IImageUploadService {

    private final RustFsProperties rustFsProperties;
    private final S3Client rustFsS3Client;

    @Override
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        try {
            ensureBucketExists();

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String key = UUID.randomUUID() + "-" + originalName;

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
                e
            );
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
