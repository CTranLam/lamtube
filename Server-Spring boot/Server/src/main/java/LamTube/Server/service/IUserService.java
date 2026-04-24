package LamTube.Server.service;


import LamTube.Server.dto.base.PagedResponseDTO;

import java.util.List;

import LamTube.Server.dto.UserInfoResponseDTO;
import LamTube.Server.dto.UserLoginDTO;
import LamTube.Server.dto.UserRegisterDTO;
import LamTube.Server.dto.UserRegisterResponseDTO;
import LamTube.Server.dto.UserRequestUpdateDTO;
import LamTube.Server.dto.UserResponseDTO;
import LamTube.Server.dto.VideoRequestDTO;
import LamTube.Server.dto.ChannelSubscribeSummaryDTO;
import LamTube.Server.dto.LikedVideoDTO;
import LamTube.Server.dto.auth.AuthLoginResultDTO;
import LamTube.Server.dto.channel.ChannelStatsDTO;
import LamTube.Server.dto.video.VideoResponseDTO;
import LamTube.Server.dto.WatchHistoryGroupDTO;

public interface IUserService {

    UserRegisterResponseDTO createUser(UserRegisterDTO dto);

    AuthLoginResultDTO login(UserLoginDTO loginDTO);
    AuthLoginResultDTO refreshAccessToken(String refreshToken);
    void logout(String refreshToken);
    void sendPasswordResetOtp(String email);
    String verifyPasswordResetOtp(String email, String otp);
    void resetPasswordByToken(String resetToken, String newPassword, String retypedPassword);

    UserResponseDTO findByEmail(String email);

    UserInfoResponseDTO getUserInfo(String email);

    void updateUserInfo(String email, UserRequestUpdateDTO updateDTO);
    ChannelStatsDTO getChannelStats(String email);

    List<VideoResponseDTO> getUserVideos(String email);
    PagedResponseDTO<VideoResponseDTO> getSubscriptionVideos(String email, int page, int size);
    List<UserInfoResponseDTO> getSubscriptionChannels(String email);
    ChannelSubscribeSummaryDTO subscribeChannel(String followerEmail, Long channelOwnerId);
    ChannelSubscribeSummaryDTO unsubscribeChannel(String followerEmail, Long channelOwnerId);

    void createWatchHistory(String email, Long videoId);
    List<WatchHistoryGroupDTO> getWatchHistory(String email);
    void deleteWatchHistory(String email, Long videoId);
    List<LikedVideoDTO> getLikedVideos(String email);
    void updateVideoInfo(String email, Long videoId, VideoRequestDTO videoRequestDTO);
    void deleteUserVideo(String email, Long videoId);
}
