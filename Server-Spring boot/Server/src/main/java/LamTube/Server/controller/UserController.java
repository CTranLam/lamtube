package LamTube.Server.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import LamTube.Server.dto.SubscribedChannelResponse;
import LamTube.Server.dto.UserInfoResponseDTO;
import LamTube.Server.dto.UserRequestUpdateDTO;
import LamTube.Server.dto.VideoRequestDTO;
import LamTube.Server.dto.VideoResponseDTO;
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

            PagedResponseDTO<VideoResponseDTO> response = userService.getSubscriptionVideos(email, page, size);
            return ResponseEntity.ok(new ResponseDTO<>("Lấy danh sách video kênh đã đăng ký thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }

    @GetMapping("/subscriptions/channels")
    public ResponseEntity<ResponseDTO<List<SubscribedChannelResponse>>> getSubscribedChannels(Principal principal) {
        try {
            String email = principal.getName();
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(new ResponseDTO<>("Email người dùng không hợp lệ", null));
            }

            List<SubscribedChannelResponse> response = userService.getSubscribedChannels(email);
            return ResponseEntity.ok(new ResponseDTO<>("Lấy danh sách kênh đã đăng ký thành công", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ResponseDTO<>(e.getMessage(), null));
        }
    }


}
