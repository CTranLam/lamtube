package LamTube.Server.service;

import LamTube.Server.dto.UserInfoAdminUpdateDTO;
import LamTube.Server.dto.UserInforAdminDTO;
import LamTube.Server.dto.UserRequestCreateDTO;
import LamTube.Server.dto.UserResponseDTO;
import LamTube.Server.dto.base.PagedResponseDTO;
import LamTube.Server.dto.video.VideoResponseDTO;

public interface IAdminService {
    PagedResponseDTO<UserResponseDTO> getAllUsers(String email, String role, int page, int size);

    UserResponseDTO createUser(UserRequestCreateDTO createDTO);

    UserInforAdminDTO getUserById(Long userId);

    void updateUserInfo(Long userId, UserInfoAdminUpdateDTO updateDTO);

    void deleteUser(Long userId);

    PagedResponseDTO<VideoResponseDTO> getAllAdminVideos(
            String title,
            String status,
            Long categoryId,
            String uploader,
            int page,
            int size);

    VideoResponseDTO updateVideoStatus(Long videoId, String status);

    void deleteVideo(Long videoId);
}
