package LamTube.Server.service.impl;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import LamTube.Server.converter.user.ConvertEntityToResponseDTO;
import LamTube.Server.dto.UserInfoAdminUpdateDTO;
import LamTube.Server.dto.UserInforAdminDTO;
import LamTube.Server.dto.UserRequestCreateDTO;
import LamTube.Server.dto.UserResponseDTO;
import LamTube.Server.dto.base.PagedResponseDTO;
import LamTube.Server.dto.video.VideoResponseDTO;
import LamTube.Server.model.RoleEntity;
import LamTube.Server.model.UserEntity;
import LamTube.Server.model.UserProfileEntity;
import LamTube.Server.model.VideoEntity;
import LamTube.Server.repository.RoleRepository;
import LamTube.Server.repository.UserProfileRepository;
import LamTube.Server.repository.UserRepository;
import LamTube.Server.repository.VideoRepository;
import LamTube.Server.service.IAdminService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements IAdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final VideoRepository videoRepository;

    @Override
    public PagedResponseDTO<UserResponseDTO> getAllUsers(String email, String role, int page, int size) {
        boolean hasEmail = email != null && !email.isBlank();
        boolean hasRole = role != null && !role.isBlank();

        Pageable pageable = PageRequest.of(page, size);

        Page<UserEntity> usersPage;
        if (!hasEmail && !hasRole) {
            usersPage = userRepository.findAllByIsDeletedFalse(pageable);
        } else {
            usersPage = userRepository.searchUsers(
                    hasEmail ? email : null,
                    hasRole ? role : null,
                    pageable);
        }

        List<UserResponseDTO> items = usersPage.stream()
                .map(user -> new UserResponseDTO(
                        user.getId(),
                        user.getEmail(),
                        user.getRole().getName()))
                .collect(Collectors.toList());

        return new PagedResponseDTO<>(
                items,
                usersPage.getNumber(),
                usersPage.getSize(),
                usersPage.getTotalElements(),
                usersPage.getTotalPages());
    }

    @Override
    public UserResponseDTO createUser(UserRequestCreateDTO createDTO) {
        if (userRepository.findByEmailAndIsDeletedFalse(createDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        UserEntity user = new UserEntity();
        user.setEmail(createDTO.getEmail());
        user.setPassword(passwordEncoder.encode(createDTO.getPassword()));

        RoleEntity roleEntity = roleRepository.findByNameAndIsDeletedFalse(createDTO.getRole())
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        user.setRole(roleEntity);

        UserEntity savedUser = userRepository.save(user);

        UserProfileEntity profile = new UserProfileEntity();
        profile.setUser(savedUser);
        profile.setFullName(createDTO.getFullname());
        userProfileRepository.save(profile);
        return ConvertEntityToResponseDTO.toUserResponseDTO(savedUser);
    }

    @Override
    public UserInforAdminDTO getUserById(Long userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    UserProfileEntity profile = userProfileRepository.findByUser_Id(user.getId())
                            .orElse(new UserProfileEntity());
                    UserInforAdminDTO dto = new UserInforAdminDTO();
                    dto.setId(user.getId());
                    dto.setEmail(user.getEmail());
                    dto.setFullname(profile.getFullName());
                    dto.setBio(profile.getBio());
                    dto.setAvatarUrl(profile.getAvatarUrl());
                    dto.setRole(user.getRole().getName());
                    return dto;
                })
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
    }

    @Override
    public void updateUserInfo(Long userId, UserInfoAdminUpdateDTO updateDTO) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        if (updateDTO.getPassword() != null && !updateDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updateDTO.getPassword()));
        }
        UserProfileEntity profile = userProfileRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));
        if (updateDTO.getFullname() != null) {
            profile.setFullName(updateDTO.getFullname());
        }
        if (updateDTO.getBio() != null) {
            profile.setBio(updateDTO.getBio());
        }
        if (updateDTO.getAvatarUrl() != null) {
            profile.setAvatarUrl(updateDTO.getAvatarUrl());
        }
        userProfileRepository.save(profile);
        RoleEntity roleEntity = roleRepository.findByNameAndIsDeletedFalse(updateDTO.getRole())
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        user.setRole(roleEntity);
        userRepository.save(user);
    }

    @Override
    public void deleteUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        user.setIsDeleted(true);
        user.setEmail(user.getEmail() + "_del_" + System.currentTimeMillis());
        userRepository.save(user);
    }

    @Override
    public PagedResponseDTO<VideoResponseDTO> getAllAdminVideos(
            String title,
            String status,
            Long categoryId,
            String uploader,
            int page,
            int size) {
        if (page < 0) {
            throw new RuntimeException("Page phải lớn hơn hoặc bằng 0");
        }
        if (size <= 0) {
            throw new RuntimeException("Size phải lớn hơn 0");
        }

        String titlePattern = (title == null || title.isBlank())
                ? null
                : "%" + title.trim().toLowerCase(Locale.ROOT) + "%";
        String uploaderPattern = (uploader == null || uploader.isBlank())
                ? null
                : "%" + uploader.trim().toLowerCase(Locale.ROOT) + "%";
        String statusFilter = null;
        if (status != null && !status.isBlank()) {
            statusFilter = status.trim().toLowerCase(Locale.ROOT);
            if (!"public".equals(statusFilter) && !"private".equals(statusFilter)) {
                throw new RuntimeException("Trạng thái video không hợp lệ");
            }
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Order.desc("id")));

        Page<VideoEntity> videosPage = videoRepository.searchAdminVideos(
                titlePattern,
                statusFilter,
                categoryId,
                uploaderPattern,
                pageable);

        List<VideoResponseDTO> items = videosPage.getContent().stream()
                .map(this::toVideoResponseDTO)
                .collect(Collectors.toList());

        return new PagedResponseDTO<>(
                items,
                videosPage.getNumber(),
                videosPage.getSize(),
                videosPage.getTotalElements(),
                videosPage.getTotalPages());
    }

    @Override
    public VideoResponseDTO updateVideoStatus(Long videoId, String status) {
        if (status == null || status.isBlank()) {
            throw new RuntimeException("Trạng thái video không được để trống");
        }

        String normalizedStatus = status.trim().toLowerCase(Locale.ROOT);
        if (!"public".equals(normalizedStatus) && !"private".equals(normalizedStatus)) {
            throw new RuntimeException("Trạng thái video không hợp lệ");
        }

        VideoEntity video = videoRepository.findByIdAndIsDeletedFalse(videoId);
        if (video == null) {
            throw new RuntimeException("Không tìm thấy video");
        }

        video.setStatus(normalizedStatus);
        VideoEntity saved = videoRepository.save(video);
        return toVideoResponseDTO(saved);
    }

    @Override
    public void deleteVideo(Long videoId) {
        VideoEntity video = videoRepository.findByIdAndIsDeletedFalse(videoId);
        if (video == null) {
            throw new RuntimeException("Không tìm thấy video");
        }

        video.setIsDeleted(true);
        videoRepository.save(video);
    }

    private VideoResponseDTO toVideoResponseDTO(VideoEntity video) {
        VideoResponseDTO dto = new VideoResponseDTO();
        dto.setId(video.getId());
        dto.setChannelId(video.getUser() != null ? video.getUser().getId() : null);
        dto.setUploaderId(video.getUser() != null ? video.getUser().getId() : null);
        dto.setTitle(video.getTitle());
        dto.setDescription(video.getDescription());
        dto.setThumbnailUrl(video.getThumbnailUrl());
        dto.setVideoUrl(video.getVideoUrl());
        dto.setStatus(video.getStatus());
        dto.setViewCount(video.getViewCount() != null ? video.getViewCount() : 0);
        dto.setCategoryName(video.getCategory() != null ? video.getCategory().getName() : null);
        dto.setCategoryId(video.getCategory() != null ? video.getCategory().getId() : null);
        dto.setUploaderName(buildChannelName(video.getUser(), null));
        return dto;
    }

    private String buildChannelName(UserEntity user, String profileName) {
        if (profileName != null && !profileName.isBlank()) {
            return profileName.trim();
        }
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return "Kênh chưa đặt tên";
        }
        return user.getEmail().split("@")[0];
    }
}
