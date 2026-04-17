package LamTube.Server.service.impl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import LamTube.Server.dto.ChannelSubscriptionSummaryDTO;
import LamTube.Server.exception.AccessDeniedException;
import LamTube.Server.exception.ResourceNotFoundException;
import LamTube.Server.model.SubscriptionEntity;
import LamTube.Server.model.UserEntity;
import LamTube.Server.repository.SubscriptionRepository;
import LamTube.Server.repository.UserRepository;
import LamTube.Server.service.ISubscriptionService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements ISubscriptionService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Override
    @Transactional
    public ChannelSubscriptionSummaryDTO subscribeChannel(Long channelId, String requesterEmail) {
        UserEntity requester = getRequester(requesterEmail);
        UserEntity channelOwner = getChannelOwner(channelId);

        if (requester.getId().equals(channelOwner.getId())) {
            throw new IllegalArgumentException("Bạn không thể tự đăng ký kênh của chính mình.");
        }

        boolean isSubscribed = subscriptionRepository.existsByFollower_IdAndChannelOwner_Id(
                requester.getId(),
                channelOwner.getId());

        if (!isSubscribed) {
            SubscriptionEntity subscription = new SubscriptionEntity();
            subscription.setFollower(requester);
            subscription.setChannelOwner(channelOwner);
            subscriptionRepository.save(subscription);
        }

        long subscriberCount = subscriptionRepository.countByChannelOwner_Id(channelOwner.getId());
        return new ChannelSubscriptionSummaryDTO(true, subscriberCount);
    }

    @Override
    @Transactional
    public ChannelSubscriptionSummaryDTO unsubscribeChannel(Long channelId, String requesterEmail) {
        UserEntity requester = getRequester(requesterEmail);
        UserEntity channelOwner = getChannelOwner(channelId);

        subscriptionRepository.findByFollower_IdAndChannelOwner_Id(requester.getId(), channelOwner.getId())
                .ifPresent(subscriptionRepository::delete);

        long subscriberCount = subscriptionRepository.countByChannelOwner_Id(channelOwner.getId());
        return new ChannelSubscriptionSummaryDTO(false, subscriberCount);
    }

    private UserEntity getRequester(String requesterEmail) {
        if (requesterEmail == null || requesterEmail.isBlank()) {
            throw new AccessDeniedException("Bạn cần đăng nhập để thực hiện thao tác này.");
        }

        return userRepository.findByEmailAndIsDeletedFalse(requesterEmail)
                .orElseThrow(() -> new AccessDeniedException("Bạn cần đăng nhập để thực hiện thao tác này."));
    }

    private UserEntity getChannelOwner(Long channelId) {
        return userRepository.findById(channelId)
                .filter(user -> Boolean.FALSE.equals(user.getIsDeleted()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kênh."));
    }
}