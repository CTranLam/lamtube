package LamTube.Server.service.impl;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import LamTube.Server.converter.user.ConvertEntityToResponseDTO;
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
import LamTube.Server.dto.base.PagedResponseDTO;
import LamTube.Server.enums.role;
import LamTube.Server.model.RoleEntity;
import LamTube.Server.model.SubscriptionEntity;
import LamTube.Server.model.UserEntity;
import LamTube.Server.model.UserProfileEntity;
import LamTube.Server.model.VideoEntity;
import LamTube.Server.repository.RoleRepository;
import LamTube.Server.repository.SubscriptionRepository;
import LamTube.Server.repository.UserProfileRepository;
import LamTube.Server.repository.UserRepository;
import LamTube.Server.repository.VideoReactionRepository;
import LamTube.Server.repository.VideoRepository;
import LamTube.Server.service.IUserService;
import LamTube.Server.utils.JwtTokenUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtils jwtTokenUtils;
    private final RoleRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final VideoRepository videoRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final VideoReactionRepository videoReactionRepository;

    @Override
    public UserRegisterResponseDTO createUser(UserRegisterDTO dto) {
        if (userRepository.findByEmailAndIsDeletedFalse(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        UserEntity user = new UserEntity();
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        
        RoleEntity roleEntity = roleRepository.findByNameAndIsDeletedFalse(role.ROLE_USER.name())
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        user.setRole(roleEntity);

        UserEntity savedUser = userRepository.save(user);

        UserProfileEntity profile = new UserProfileEntity();
        profile.setUser(savedUser);
        profile.setFullName("");
        profile.setAvatarUrl(""); 
        profile.setBio("");
        userProfileRepository.save(profile); 

    return new UserRegisterResponseDTO(savedUser.getId(), savedUser.getEmail());
}
    @Override
    public String login(UserLoginDTO loginDTO) {

        UserEntity userEntity = userRepository.findByEmailAndIsDeletedFalse(loginDTO.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Sai tài khoản hoặc mật khẩu"));

        if (!passwordEncoder.matches(loginDTO.getPassword(), userEntity.getPassword())) {
            throw new BadCredentialsException("Sai tài khoản hoặc mật khẩu");
        }

        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
            userEntity.getEmail(),
                loginDTO.getPassword(),
                userEntity.getAuthorities()
        );

        authenticationManager.authenticate(authenticationToken);

        return jwtTokenUtils.generateToken(userEntity.getEmail());
    }

    @Override
    public UserResponseDTO findByEmail(String email) {
        return userRepository.findByEmailAndIsDeletedFalse(email)
                .map(user -> new UserResponseDTO(
                        user.getId(),
                        user.getEmail(),
                        user.getRole().getName()
                ))
                .orElse(null);  
    }

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
                pageable
            );
        }

        List<UserResponseDTO> items = usersPage.stream()
            .map(user -> new UserResponseDTO(
                user.getId(),
                user.getEmail(),
                user.getRole().getName()
            ))
            .collect(Collectors.toList());

        return new PagedResponseDTO<>(
            items,
            usersPage.getNumber(),
            usersPage.getSize(),
            usersPage.getTotalElements(),
            usersPage.getTotalPages()
        );
        }

        @Override
        public UserInfoResponseDTO getUserInfo(String email) {
            return userProfileRepository.findByUser_Email(email)
                    .map(profile -> {
                        UserInfoResponseDTO dto = new UserInfoResponseDTO();
                        dto.setEmail(profile.getUser().getEmail());
                        dto.setId(profile.getUser().getId());
                        dto.setFullname(profile.getFullName());
                        dto.setBio(profile.getBio());
                        dto.setAvatarUrl(profile.getAvatarUrl());
                        return dto;
                    })
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));
        }
        @Override
        public void updateUserInfo(String email, UserRequestUpdateDTO updateDTO) {
            UserProfileEntity profile = userProfileRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));

            profile.setFullName(updateDTO.getFullname());
            profile.setBio(updateDTO.getBio());
            profile.setAvatarUrl(updateDTO.getAvatarUrl());

            userProfileRepository.save(profile);
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
        public List<VideoResponseDTO> getUserVideos(String email) {
            UserEntity userEntity = userRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            
            List<VideoEntity> videos = videoRepository.findByUserEmail(email);
            return videos.stream()
                .map(video -> {
                VideoResponseDTO dto = new VideoResponseDTO();
                dto.setId(video.getId());
                dto.setTitle(video.getTitle());
                dto.setDescription(video.getDescription());
                dto.setThumbnailUrl(video.getThumbnailUrl());
                dto.setVideoUrl(video.getVideoUrl());
                dto.setStatus(video.getStatus());
                dto.setViewCount(video.getViewCount() != null ? video.getViewCount() : 0);
                dto.setCategoryName(video.getCategory() != null ? video.getCategory().getName() : null);
                return dto;
                })
                    .collect(Collectors.toList());

        }
        @Override
        public PagedResponseDTO<VideoResponseDTO> getSubscriptionVideos(String email, int page, int size) {
            if (page < 0) {
                throw new IllegalArgumentException("Page phải lớn hơn hoặc bằng 0");
            }
            if (size <= 0) {
                throw new IllegalArgumentException("Size phải lớn hơn 0");
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Order.desc("id")));
            List<SubscriptionEntity> subscriptions = subscriptionRepository.findByFollowerEmail(email);
            List<UserEntity> channelOwners = subscriptions.stream()
                    .map(SubscriptionEntity::getChannelOwner)
                    .filter(channelOwner -> channelOwner != null && Boolean.FALSE.equals(channelOwner.getIsDeleted()))
                    .collect(Collectors.toList());

            if (channelOwners.isEmpty()) {
                return new PagedResponseDTO<>(List.of(), page, size, 0, 0);
            }

            Page<VideoEntity> videosPage = videoRepository.findByUserInAndIsDeletedFalseAndStatus(
                    channelOwners,
                    "public",
                    pageable);

            List<VideoResponseDTO> items = videosPage.getContent().stream()
                    .map(video -> convertToVideoResponseDTO(video, email))
                    .collect(Collectors.toList());

            return new PagedResponseDTO<>(
                    items,
                    videosPage.getNumber(),
                    videosPage.getSize(),
                    videosPage.getTotalElements(),
                    videosPage.getTotalPages());
        }

        private VideoResponseDTO convertToVideoResponseDTO(VideoEntity video, String requesterEmail) {
            VideoResponseDTO dto = new VideoResponseDTO();
            dto.setId(video.getId());
            dto.setTitle(video.getTitle());
            dto.setDescription(video.getDescription());
            dto.setThumbnailUrl(video.getThumbnailUrl());
            dto.setVideoUrl(video.getVideoUrl());
            dto.setStatus(video.getStatus());
            dto.setViewCount(video.getViewCount() != null ? video.getViewCount() : 0);
            dto.setCategoryName(video.getCategory() != null ? video.getCategory().getName() : null);
            dto.setCategoryId(video.getCategory() != null ? video.getCategory().getId() : null);

            UserEntity uploader = video.getUser();
            if (uploader != null) {
                dto.setChannelId(uploader.getId());
                dto.setUploaderId(uploader.getId());

                String fallbackName = uploader.getEmail();
                UserProfileEntity uploaderProfile = userProfileRepository.findByUser_Id(uploader.getId()).orElse(null);
                if (uploaderProfile != null && uploaderProfile.getFullName() != null
                        && !uploaderProfile.getFullName().trim().isEmpty()) {
                    dto.setUploaderName(uploaderProfile.getFullName().trim());
                } else {
                    dto.setUploaderName(fallbackName);
                }

                if (uploaderProfile != null) {
                    dto.setUploaderAvatarUrl(uploaderProfile.getAvatarUrl());
                }

                dto.setSubscriberCount(subscriptionRepository.countByChannelOwner_Id(uploader.getId()));
                if (requesterEmail != null && !requesterEmail.isBlank()) {
                    userRepository.findByEmailAndIsDeletedFalse(requesterEmail)
                            .ifPresent(requester -> dto.setSubscribed(
                                    subscriptionRepository.existsByFollower_IdAndChannelOwner_Id(
                                            requester.getId(),
                                            uploader.getId())));
                }
            }

            dto.setLikeCount(videoReactionRepository.countByVideo_IdAndTypeIgnoreCase(video.getId(), "like"));
            dto.setDislikeCount(videoReactionRepository.countByVideo_IdAndTypeIgnoreCase(video.getId(), "dislike"));
            return dto;
        }

        @Override
        public List<SubscribedChannelResponse> getSubscribedChannels(String email) {
            List<SubscriptionEntity> subscriptions = subscriptionRepository.findByFollowerEmailOrderByIdDesc(email);
            if (subscriptions.isEmpty()) {
                return List.of();
            }
            Map<Long, SubscribedChannelResponse> channelMap = new LinkedHashMap<>();
            for (SubscriptionEntity subscription : subscriptions) {
                UserEntity channelOwner = subscription.getChannelOwner();
                if (channelOwner == null || Boolean.TRUE.equals(channelOwner.getIsDeleted())) {
                    continue;
                }

                Long channelId = channelOwner.getId();
                if (channelMap.containsKey(channelId)) {
                    continue;
                }

                UserProfileEntity profile = userProfileRepository.findByUser_Id(channelId).orElse(null);
                String fullName = profile != null ? profile.getFullName() : null;
                String channelName = (fullName != null && !fullName.trim().isEmpty())
                        ? fullName.trim()
                        : channelOwner.getEmail();

                String handleBase = channelOwner.getEmail();
                int atIndex = handleBase.indexOf("@");
                if (atIndex > 0) {
                    handleBase = handleBase.substring(0, atIndex);
                }

                SubscribedChannelResponse dto = new SubscribedChannelResponse();
                dto.setChannelId(channelId);
                dto.setChannelName(channelName);
                dto.setChannelHandle("@" + handleBase);
                dto.setAvatarUrl(profile != null ? profile.getAvatarUrl() : null);
                dto.setDescription(profile != null ? profile.getBio() : null);
                dto.setSubscriberCount(subscriptionRepository.countByChannelOwner_Id(channelId));
                dto.setIsSubscribed(true);
                channelMap.put(channelId, dto);
            }

            return List.copyOf(channelMap.values());
        }
}
