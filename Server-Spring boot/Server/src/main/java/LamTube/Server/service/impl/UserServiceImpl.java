package LamTube.Server.service.impl;

import java.util.List;
import java.util.Map;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import LamTube.Server.dto.ChannelSubscribeSummaryDTO;
import LamTube.Server.dto.LikedVideoDTO;
import LamTube.Server.dto.UserInfoResponseDTO;
import LamTube.Server.dto.UserLoginDTO;
import LamTube.Server.dto.UserRegisterDTO;
import LamTube.Server.dto.UserRegisterResponseDTO;
import LamTube.Server.dto.UserRequestUpdateDTO;
import LamTube.Server.dto.UserResponseDTO;
import LamTube.Server.dto.VideoRequestDTO;
import LamTube.Server.dto.auth.AuthLoginResultDTO;
import LamTube.Server.dto.channel.ChannelStatsDTO;
import LamTube.Server.dto.video.VideoResponseDTO;
import LamTube.Server.dto.WatchHistoryGroupDTO;
import LamTube.Server.dto.WatchHistoryItemDTO;
import LamTube.Server.dto.base.PagedResponseDTO;
import LamTube.Server.enums.role;
import LamTube.Server.model.RefreshTokenEntity;
import LamTube.Server.model.RoleEntity;
import LamTube.Server.model.SubscriptionEntity;
import LamTube.Server.model.UserEntity;
import LamTube.Server.model.UserProfileEntity;
import LamTube.Server.model.VideoEntity;
import LamTube.Server.model.VideoReactionEntity;
import LamTube.Server.model.WatchHistoryEntity;
import LamTube.Server.model.CategoryEntity;
import LamTube.Server.repository.CategoryRepository;
import LamTube.Server.repository.HistoryRepository;
import LamTube.Server.repository.RefreshTokenRepository;
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
    private final CategoryRepository categoryRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final HistoryRepository historyRepository;
    private final VideoReactionRepository videoReactionRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.auth.refresh-token-ttl-days}")
    private int refreshTokenTtlDays;

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
    public AuthLoginResultDTO login(UserLoginDTO loginDTO) {

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

        String email = userEntity.getEmail();
        String accessToken = jwtTokenUtils.generateAccessToken(email);
        String refreshToken = jwtTokenUtils.generateRefreshToken(email);

        RefreshTokenEntity refreshTokenEntity = new RefreshTokenEntity();
        refreshTokenEntity.setTokenHash(hashToken(refreshToken));
        refreshTokenEntity.setUser(userEntity);
        refreshTokenEntity.setExpiresAt(LocalDateTime.now().plusDays(refreshTokenTtlDays));
        refreshTokenEntity.setRevoked(false);
        refreshTokenRepository.save(refreshTokenEntity);

        return new AuthLoginResultDTO(accessToken, refreshToken);
    }

    @Override
    public AuthLoginResultDTO refreshAccessToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BadCredentialsException("Refresh token không hợp lệ.");
        }

        String tokenHash = hashToken(refreshToken);
        RefreshTokenEntity tokenEntity = refreshTokenRepository
                .findByTokenHashAndRevokedFalse(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Refresh token không hợp lệ."));

        if (tokenEntity.getExpiresAt() == null || tokenEntity.getExpiresAt().isBefore(LocalDateTime.now())) {
            tokenEntity.setRevoked(true);
            refreshTokenRepository.save(tokenEntity);
            throw new BadCredentialsException("Refresh token đã hết hạn.");
        }

        String email = jwtTokenUtils.extractUsername(refreshToken);
        if (email == null || email.isBlank()) {
            throw new BadCredentialsException("Refresh token không hợp lệ.");
        }

        UserEntity userEntity = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new BadCredentialsException("Tài khoản không tồn tại."));

        if (!jwtTokenUtils.validateToken(refreshToken, userEntity, "refresh")) {
            throw new BadCredentialsException("Refresh token không hợp lệ.");
        }

        tokenEntity.setRevoked(true);
        refreshTokenRepository.save(tokenEntity);

        String newRefreshToken = jwtTokenUtils.generateRefreshToken(email);
        RefreshTokenEntity newTokenEntity = new RefreshTokenEntity();
        newTokenEntity.setTokenHash(hashToken(newRefreshToken));
        newTokenEntity.setUser(userEntity);
        newTokenEntity.setExpiresAt(LocalDateTime.now().plusDays(refreshTokenTtlDays));
        newTokenEntity.setRevoked(false);
        refreshTokenRepository.save(newTokenEntity);

        return new AuthLoginResultDTO(jwtTokenUtils.generateAccessToken(email), newRefreshToken);
    }

    @Override
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        String tokenHash = hashToken(refreshToken);
        refreshTokenRepository.findByTokenHashAndRevokedFalse(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(hashBytes.length * 2);
            for (byte b : hashBytes) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Không hỗ trợ SHA-256.", e);
        }
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
        public ChannelStatsDTO getChannelStats(String email) {
            userRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            LocalDateTime startOfNextMonth = startOfMonth.plusMonths(1);

            long totalSubscribers = subscriptionRepository.countByChannelOwner_EmailAndChannelOwner_IsDeletedFalse(email);
            long totalViews = videoRepository.sumViewCountByOwnerEmail(email);
            long totalVideos = videoRepository.countByUser_EmailAndIsDeletedFalse(email);
            long totalLikes = videoReactionRepository.countByOwnerEmailAndType(email, "like");
            long totalDislikes = videoReactionRepository.countByOwnerEmailAndType(email, "dislike");

            long monthlyViews = historyRepository.countChannelViewsInRange(email, startOfMonth, startOfNextMonth);
            long monthlyLikes = videoReactionRepository.countByOwnerEmailAndTypeInRange(
                    email,
                    "like",
                    startOfMonth,
                    startOfNextMonth);
            long monthlyDislikes = videoReactionRepository.countByOwnerEmailAndTypeInRange(
                    email,
                    "dislike",
                    startOfMonth,
                    startOfNextMonth);

            return new ChannelStatsDTO(
                    totalSubscribers,
                    totalViews,
                    totalLikes,
                    totalDislikes,
                    totalVideos,
                    monthlyViews,
                    monthlyLikes,
                    monthlyDislikes);
        }
        @Override
        public List<VideoResponseDTO> getUserVideos(String email) {
            userRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            
            List<VideoEntity> videos = videoRepository
                    .findByUser_EmailAndUser_IsDeletedFalseAndIsDeletedFalseOrderByIdDesc(email);
            return videos.stream()
                .map(video -> {
                return toVideoResponseDTO(video);
                })
                    .collect(Collectors.toList());

        }

        @Override
        public PagedResponseDTO<VideoResponseDTO> getSubscriptionVideos(String email, int page, int size) {
            userRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            Pageable pageable = PageRequest.of(
                    page,
                    size,
                    Sort.by(Sort.Order.desc("viewCount"), Sort.Order.desc("id")));

            List<Long> channelOwnerIds = subscriptionRepository.findChannelOwnerIdsByFollowerEmail(email);
            if (channelOwnerIds.isEmpty()) {
                return new PagedResponseDTO<>(List.of(), page, size, 0, 0);
            }

            Page<VideoEntity> videosPage = videoRepository.findByIsDeletedFalseAndStatusAndUser_IdIn(
                    "public",
                    channelOwnerIds,
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
        public List<UserInfoResponseDTO> getSubscriptionChannels(String email) {
            userRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            Map<Long, UserEntity> uniqueChannels = new LinkedHashMap<>();
            for (UserEntity channelOwner : subscriptionRepository.findChannelOwnersByFollowerEmail(email)) {
                if (channelOwner != null && channelOwner.getId() != null) {
                    uniqueChannels.putIfAbsent(channelOwner.getId(), channelOwner);
                }
            }

            return uniqueChannels.values().stream()
                    .map(channelOwner -> {
                        UserInfoResponseDTO dto = new UserInfoResponseDTO();
                        dto.setId(channelOwner.getId());
                        dto.setEmail(channelOwner.getEmail());
                        dto.setChannelName(buildChannelName(channelOwner, null));
                        dto.setChannelHandle(buildChannelHandle(channelOwner.getEmail()));
                        dto.setSubscriberCount(
                                subscriptionRepository.countByChannelOwner_IdAndChannelOwner_IsDeletedFalse(
                                        channelOwner.getId()));
                        dto.setIsSubscribed(true);

                        userProfileRepository.findByUser_Id(channelOwner.getId()).ifPresent(profile -> {
                            dto.setFullname(profile.getFullName());
                            dto.setBio(profile.getBio());
                            dto.setAvatarUrl(profile.getAvatarUrl());
                            dto.setChannelName(buildChannelName(channelOwner, profile.getFullName()));
                        });

                        return dto;
                    })
                    .collect(Collectors.toList());
        }

        @Override
        public ChannelSubscribeSummaryDTO subscribeChannel(String followerEmail, Long channelOwnerId) {
            if (followerEmail == null || followerEmail.isBlank()) {
                throw new RuntimeException("Bạn cần đăng nhập để đăng ký kênh.");
            }
            if (channelOwnerId == null || channelOwnerId <= 0) {
                throw new RuntimeException("Kênh không hợp lệ.");
            }

            UserEntity follower = userRepository.findByEmailAndIsDeletedFalse(followerEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            UserEntity channelOwner = userRepository.findByIdAndIsDeletedFalse(channelOwnerId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy kênh."));

            if (follower.getId().equals(channelOwner.getId())) {
                throw new RuntimeException("Bạn không thể tự đăng ký kênh của chính mình.");
            }

            subscriptionRepository.findByFollower_IdAndChannelOwner_Id(follower.getId(), channelOwner.getId())
                    .orElseGet(() -> {
                        SubscriptionEntity subscription = new SubscriptionEntity();
                        subscription.setFollower(follower);
                        subscription.setChannelOwner(channelOwner);
                        return subscriptionRepository.save(subscription);
                    });

            long subscriberCount = subscriptionRepository.countByChannelOwner_IdAndChannelOwner_IsDeletedFalse(
                    channelOwner.getId());
            return new ChannelSubscribeSummaryDTO(true, subscriberCount);
        }

        @Override
        public ChannelSubscribeSummaryDTO unsubscribeChannel(String followerEmail, Long channelOwnerId) {
            if (followerEmail == null || followerEmail.isBlank()) {
                throw new RuntimeException("Bạn cần đăng nhập để hủy đăng ký kênh.");
            }
            if (channelOwnerId == null || channelOwnerId <= 0) {
                throw new RuntimeException("Kênh không hợp lệ.");
            }

            UserEntity follower = userRepository.findByEmailAndIsDeletedFalse(followerEmail)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            UserEntity channelOwner = userRepository.findByIdAndIsDeletedFalse(channelOwnerId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy kênh."));

            subscriptionRepository.deleteByFollower_IdAndChannelOwner_Id(follower.getId(), channelOwner.getId());
            long subscriberCount = subscriptionRepository.countByChannelOwner_IdAndChannelOwner_IsDeletedFalse(
                    channelOwner.getId());
            return new ChannelSubscribeSummaryDTO(false, subscriberCount);
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

        private String buildChannelHandle(String email) {
            if (email == null || email.isBlank()) {
                return "@channel_unknown";
            }
            String normalized = email.split("@")[0].trim().toLowerCase();
            if (normalized.isBlank()) {
                normalized = "channel_unknown";
            }
            return "@" + normalized;
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
        @Override
        public void createWatchHistory(String email, Long videoId) {
            UserEntity userEntity = userRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            VideoEntity videoEntity = videoRepository.findByIdAndIsDeletedFalse(videoId);
            if (videoEntity == null) {
                throw new RuntimeException("Không tìm thấy video");
            }
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay(); 
            boolean isWatchedToday = historyRepository.existsByUser_EmailAndVideo_IdAndWatchedAtAfter(
                email, videoId, startOfDay
            );

            if (!isWatchedToday) {
                WatchHistoryEntity history = new WatchHistoryEntity();
                history.setUser(userEntity);
                history.setVideo(videoEntity);
                history.setWatchedAt(LocalDateTime.now());
                historyRepository.save(history);
            }
            else{
                WatchHistoryEntity history = historyRepository.findByUser_EmailAndVideo_Id(email, videoId);
                if(history == null){
                    throw new RuntimeException("Lịch sử xem của video không tồn tại");
                }
                history.setWatchedAt(LocalDateTime.now());
                historyRepository.save(history);
            }
        }

        @Override
        public List<WatchHistoryGroupDTO> getWatchHistory(String email) {
            userRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            UserProfileEntity profile = userProfileRepository.findByUser_Email(email).orElse(null);

            List<WatchHistoryEntity> histories = historyRepository.findByUser_EmailOrderByWatchedAtDesc(email);
            Map<String, List<WatchHistoryItemDTO>> groupedItems = new LinkedHashMap<>();
            DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE;
            LocalDate today = LocalDate.now();

            for (WatchHistoryEntity history : histories) {
                if (history.getVideo() == null || history.getWatchedAt() == null) {
                    continue;
                }

                LocalDate watchedDate = history.getWatchedAt().toLocalDate();
                String dateKey = watchedDate.format(dateFormatter);

                WatchHistoryItemDTO item = new WatchHistoryItemDTO();
                item.setVideoId(history.getVideo().getId());
                item.setTitle(history.getVideo().getTitle());
                item.setThumbnailUrl(history.getVideo().getThumbnailUrl());
                item.setUploaderName(buildChannelName(history.getVideo().getUser(), profile != null ? profile.getFullName() : null));
                item.setViewCount(history.getVideo().getViewCount() == null ? 0L : history.getVideo().getViewCount().longValue());
                item.setWatchedAt(history.getWatchedAt());

                groupedItems.computeIfAbsent(dateKey, ignored -> new ArrayList<>()).add(item);
            }

            List<WatchHistoryGroupDTO> groups = new ArrayList<>();
            for (Map.Entry<String, List<WatchHistoryItemDTO>> entry : groupedItems.entrySet()) {
                LocalDate date = LocalDate.parse(entry.getKey(), dateFormatter);

                WatchHistoryGroupDTO group = new WatchHistoryGroupDTO();
                group.setDate(entry.getKey());
                group.setLabel(date.equals(today) ? "Hôm nay" : date.getDayOfMonth() + " thg " + date.getMonthValue());
                group.setItems(entry.getValue());

                groups.add(group);
            }

            return groups;
        }
        
        @Override
        public void deleteWatchHistory(String email, Long videoId) {
            userRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            WatchHistoryEntity history = historyRepository.findByUser_EmailAndVideo_Id(email, videoId);
            if (history == null) {
                throw new RuntimeException("Lịch sử xem của video không tồn tại");
            }
            historyRepository.delete(history);
        }
        @Override
        public List<LikedVideoDTO> getLikedVideos(String email) {
            userRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            UserProfileEntity profile = userProfileRepository.findByUser_Email(email).orElse(null);

            List<VideoEntity> likedVideos = videoReactionRepository.findByUser_Email(email).stream()
                    .filter(reaction -> "like".equalsIgnoreCase(reaction.getType()))
                    .map(VideoReactionEntity::getVideo)
                    .filter(video -> video != null && !video.getIsDeleted() && "public".equalsIgnoreCase(video.getStatus()))
                    .collect(Collectors.toList());
            return likedVideos.stream()
                    .map(video -> {
                        LikedVideoDTO dto = new LikedVideoDTO();
                        dto.setId(video.getId());
                        dto.setTitle(video.getTitle());
                        dto.setThumbnailUrl(video.getThumbnailUrl());
                        dto.setUploaderName(buildChannelName(video.getUser(), profile != null ? profile.getFullName() : null));
                        dto.setViewCount(video.getViewCount() != null ? video.getViewCount() : 0L);
                        return dto;
                    })
                    .collect(Collectors.toList());
        }

        @Override
        public void updateVideoInfo(String email, Long videoId, VideoRequestDTO videoRequestDTO) {
            if (email == null || email.isBlank()) {
                throw new RuntimeException("Email người dùng không hợp lệ");
            }
            if (videoId == null || videoId <= 0) {
                throw new RuntimeException("ID video không hợp lệ");
            }
            if (videoRequestDTO == null) {
                throw new RuntimeException("Dữ liệu video không hợp lệ");
            }

            userRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            VideoEntity videoEntity = videoRepository
                    .findByIdAndUser_EmailAndUser_IsDeletedFalseAndIsDeletedFalse(videoId, email);
            if (videoEntity == null) {
                throw new RuntimeException("Không tìm thấy video hoặc bạn không có quyền chỉnh sửa");
            }

            String title = videoRequestDTO.getTitle() == null ? "" : videoRequestDTO.getTitle().trim();
            if (title.isBlank()) {
                throw new RuntimeException("Tiêu đề video không được để trống");
            }

            String status = videoRequestDTO.getStatus() == null || videoRequestDTO.getStatus().isBlank()
                    ? "public"
                    : videoRequestDTO.getStatus().trim().toLowerCase();
            if (!"public".equals(status) && !"private".equals(status)) {
                throw new RuntimeException("Trạng thái video không hợp lệ");
            }

            CategoryEntity category = null;
            String categoryIdText = videoRequestDTO.getCategoryId();
            if (categoryIdText != null && !categoryIdText.isBlank()) {
                Long categoryId;
                try {
                    categoryId = Long.parseLong(categoryIdText.trim());
                } catch (NumberFormatException e) {
                    throw new RuntimeException("Danh mục không hợp lệ");
                }

                category = categoryRepository.findById(categoryId)
                        .filter(item -> !Boolean.TRUE.equals(item.getIsDeleted()))
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            }

            videoEntity.setTitle(title);
            videoEntity.setDescription(
                    videoRequestDTO.getDescription() == null ? "" : videoRequestDTO.getDescription().trim());
            videoEntity.setStatus(status);
            videoEntity.setCategory(category);

            videoRepository.save(videoEntity);
        }

        @Override
        public void deleteUserVideo(String email, Long videoId) {
            if (email == null || email.isBlank()) {
                throw new RuntimeException("Email người dùng không hợp lệ");
            }
            if (videoId == null || videoId <= 0) {
                throw new RuntimeException("ID video không hợp lệ");
            }

            userRepository.findByEmailAndIsDeletedFalse(email)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

            VideoEntity videoEntity = videoRepository
                    .findByIdAndUser_EmailAndUser_IsDeletedFalseAndIsDeletedFalse(videoId, email);
            if (videoEntity == null) {
                throw new RuntimeException("Không tìm thấy video hoặc bạn không có quyền xóa");
            }

            videoEntity.setIsDeleted(true);
            videoRepository.save(videoEntity);
        }
}
