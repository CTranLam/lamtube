package LamTube.Server.service;

import org.springframework.web.multipart.MultipartFile;

public interface IImageUploadService {
    String uploadImage(MultipartFile file);
}
