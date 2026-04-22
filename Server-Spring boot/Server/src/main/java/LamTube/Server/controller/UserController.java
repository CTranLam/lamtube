package LamTube.Server.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import LamTube.Server.dto.LikedVideoDTO;
import LamTube.Server.dto.ChannelSubscribeSummaryDTO;
import LamTube.Server.dto.UserInfoResponseDTO;
import LamTube.Server.dto.UserRequestUpdateDTO;
import LamTube.Server.dto.VideoRequestDTO;
import LamTube.Server.dto.channel.ChannelStatsDTO;
import LamTube.Server.dto.video.VideoResponseDTO;
import LamTube.Server.dto.WatchHistoryGroupDTO;
import LamTube.Server.dto.WatchHistoryItemDTO;
import LamTube.Server.dto.base.PagedResponseDTO;
import LamTube.Server.dto.base.ResponseDTO;
import LamTube.Server.service.IUploadService;
import LamTube.Server.service.IUserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;
    private final IUploadService uploadService;

    @GetMapping("/channel/profile")
    public ResponseEntity<ResponseDTO<UserInfoResponseDTO>> getUserProfile(Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            UserInfoResponseDTO userInfo = userService.getUserInfo(email);
            return ResponseEntity.ok(new ResponseDTO<>("Lấy thông tin người dùng thành công", userInfo));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<ResponseDTO<String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("File không được để trống", null));
            }

            String imageUrl = uploadService.uploadImage(file);
            return ResponseEntity.ok(new ResponseDTO<>("Upload ảnh thành công", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @PutMapping("/channel/profile")
    public ResponseEntity<ResponseDTO<?>> updateUserProfile(@RequestBody UserRequestUpdateDTO updateDTO,
            Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            userService.updateUserInfo(email, updateDTO);
            return ResponseEntity.ok(new ResponseDTO<>("Cập nhật thông tin người dùng thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @PostMapping("/upload/video")
    public ResponseEntity<ResponseDTO<VideoResponseDTO>> uploadVideo(
            @RequestParam("video") MultipartFile videoFile,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnailFile,
            @ModelAttribute VideoRequestDTO videoRequestDTO,
            Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            VideoResponseDTO videoResponseDTO = uploadService.uploadVideo(email, videoFile, thumbnailFile,
                    videoRequestDTO);
            return ResponseEntity.ok(new ResponseDTO<>("Tải video lên thành công", videoResponseDTO));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @GetMapping("/channel/videos")
    public ResponseEntity<ResponseDTO<List<VideoResponseDTO>>> getUserVideos(Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            return ResponseEntity.ok(new ResponseDTO<>("Lấy danh sách video của người dùng thành công",
                    userService.getUserVideos(email)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @GetMapping("/channels/stats")
    public ResponseEntity<ResponseDTO<ChannelStatsDTO>> getChannelStats(Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            ChannelStatsDTO stats = userService.getChannelStats(email);
            return ResponseEntity.ok(new ResponseDTO<>("Lấy thống kê kênh thành công", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @GetMapping("/subscriptions/videos")
    public ResponseEntity<ResponseDTO<PagedResponseDTO<VideoResponseDTO>>> getSubscriptionVideos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "16") int size,
            Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            PagedResponseDTO<VideoResponseDTO> videos = userService.getSubscriptionVideos(email, page, size);
            return ResponseEntity.ok(new ResponseDTO<>("Lấy danh sách video từ kênh đã theo dõi thành công", videos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @GetMapping("/subscriptions/channels")
    public ResponseEntity<ResponseDTO<List<UserInfoResponseDTO>>> getSubscriptionChannels(Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            List<UserInfoResponseDTO> channels = userService.getSubscriptionChannels(email);
            return ResponseEntity.ok(new ResponseDTO<>("Lấy danh sách kênh đã theo dõi thành công", channels));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @PostMapping("/subscriptions/channels/{channelId}")
    public ResponseEntity<ResponseDTO<ChannelSubscribeSummaryDTO>> subscribeChannel(
            @PathVariable Long channelId,
            Principal principal) {
        try {
            String email = principal != null ? principal.getName() : null;
            ChannelSubscribeSummaryDTO summary = userService.subscribeChannel(email, channelId);
            return ResponseEntity.ok(new ResponseDTO<>("Đăng ký kênh thành công", summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @DeleteMapping("/subscriptions/channels/{channelId}")
    public ResponseEntity<ResponseDTO<ChannelSubscribeSummaryDTO>> unsubscribeChannel(
            @PathVariable Long channelId,
            Principal principal) {
        try {
            String email = principal != null ? principal.getName() : null;
            ChannelSubscribeSummaryDTO summary = userService.unsubscribeChannel(email, channelId);
            return ResponseEntity.ok(new ResponseDTO<>("Hủy đăng ký kênh thành công", summary));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @PostMapping("/watch-history/{videoId}")
    public ResponseEntity<ResponseDTO<?>> getWatchHistory(
            @PathVariable Long videoId,
            Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            userService.createWatchHistory(email, videoId);
            return ResponseEntity.ok(new ResponseDTO<>("Tạo lịch sử xem video thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @GetMapping("/watch-history")
    public ResponseEntity<ResponseDTO<List<WatchHistoryGroupDTO>>> getWatchHistory(Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            List<WatchHistoryGroupDTO> groups = userService.getWatchHistory(email);
            return ResponseEntity.ok(new ResponseDTO<>("OK", groups));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @DeleteMapping("/watch-history/{videoId}")
    public ResponseEntity<ResponseDTO<?>> deleteWatchHistory(
            @PathVariable Long videoId,
            Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            userService.deleteWatchHistory(email, videoId);
            return ResponseEntity.ok(new ResponseDTO<>("Xóa lịch sử xem video thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @DeleteMapping("/watch-history")
    public ResponseEntity<ResponseDTO<?>> clearWatchHistory(Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) { 
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }
            List<WatchHistoryGroupDTO> groups = userService.getWatchHistory(email);
            for (WatchHistoryGroupDTO group : groups) {
                for (WatchHistoryItemDTO item : group.getItems()) {
                    userService.deleteWatchHistory(email, item.getVideoId());
                }
            }
            return ResponseEntity.ok(new ResponseDTO<>("Xóa toàn bộ lịch sử xem video thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @GetMapping("/liked-videos")
    public ResponseEntity<ResponseDTO<List<LikedVideoDTO>>> getLikedVideos(Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            List<LikedVideoDTO> likedVideos = userService.getLikedVideos(email);
            return ResponseEntity.ok(new ResponseDTO<>("OK", likedVideos));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @PutMapping("/channels/videos/{videoId}")
    public ResponseEntity<ResponseDTO<?>> updateVideoInfo(
            @PathVariable Long videoId,
            @RequestBody VideoRequestDTO videoRequestDTO,
            Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            userService.updateVideoInfo(email, videoId, videoRequestDTO);
            return ResponseEntity.ok(new ResponseDTO<>("Cập nhật thông tin video thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @DeleteMapping("/channels/videos/{videoId}")
    public ResponseEntity<ResponseDTO<?>> deleteUserVideo(
            @PathVariable Long videoId,
            Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }
            userService.deleteUserVideo(email, videoId);
            return ResponseEntity.ok(new ResponseDTO<>("Xóa video thành công", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }
}
