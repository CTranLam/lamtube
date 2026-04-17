package LamTube.Server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.SubscriptionEntity;

@Repository
public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, Long> {
    long countByChannelOwner_Id(Long channelOwnerId);

    boolean existsByFollower_IdAndChannelOwner_Id(Long followerId, Long channelOwnerId);

    Optional<SubscriptionEntity> findByFollower_IdAndChannelOwner_Id(Long followerId, Long channelOwnerId);

    List<SubscriptionEntity> findByFollowerEmail(String email);

    List<SubscriptionEntity> findByFollowerEmailOrderByIdDesc(String email);
}
