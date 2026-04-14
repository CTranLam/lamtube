package LamTube.Server.service;

import org.springframework.web.multipart.MultipartFile;

import LamTube.Server.dto.VideoRequestDTO;
import LamTube.Server.dto.VideoResponseDTO;

public interface IUploadService {
    String uploadImage(MultipartFile file);

    VideoResponseDTO uploadVideo(String email, MultipartFile videoFile, MultipartFile thumbnailFile,
            VideoRequestDTO videoRequest);
}