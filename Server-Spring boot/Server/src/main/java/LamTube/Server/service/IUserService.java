package LamTube.Server.service;


import LamTube.Server.dto.base.PagedResponseDTO;

import java.util.List;

import LamTube.Server.dto.UserInfoAdminUpdateDTO;
import LamTube.Server.dto.UserInfoResponseDTO;
import LamTube.Server.dto.UserInforAdminDTO;
import LamTube.Server.dto.UserLoginDTO;
import LamTube.Server.dto.UserRegisterDTO;
import LamTube.Server.dto.UserRegisterResponseDTO;
import LamTube.Server.dto.UserRequestCreateDTO;
import LamTube.Server.dto.UserRequestUpdateDTO;
import LamTube.Server.dto.UserResponseDTO;
import LamTube.Server.dto.VideoResponseDTO;
import LamTube.Server.dto.SubscribedChannelResponse;

public interface IUserService {

    UserRegisterResponseDTO createUser(UserRegisterDTO dto);

    String login(UserLoginDTO loginDTO);

    UserResponseDTO findByEmail(String email);

    PagedResponseDTO<UserResponseDTO> getAllUsers(String email, String role, int page, int size);

    UserInfoResponseDTO getUserInfo(String email);

    void updateUserInfo(String email, UserRequestUpdateDTO updateDTO);

    UserResponseDTO createUser(UserRequestCreateDTO createDTO);

    UserInforAdminDTO getUserById(Long userId);

    void updateUserInfo(Long userId, UserInfoAdminUpdateDTO updateDTO);

    void deleteUser(Long userId);

    List<VideoResponseDTO> getUserVideos(String email);

    PagedResponseDTO<VideoResponseDTO> getSubscriptionVideos(String email, int page, int size);

    List<SubscribedChannelResponse> getSubscribedChannels(String email);
}
