package LamTube.Server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.SubscriptionEntity;
import LamTube.Server.model.UserEntity;

@Repository
public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, Long> {

    @Query("""
        SELECT s.channelOwner.id
        FROM SubscriptionEntity s
        WHERE s.follower.email = :followerEmail
          AND s.follower.isDeleted = false
          AND s.channelOwner.isDeleted = false
    """)
    List<Long> findChannelOwnerIdsByFollowerEmail(@Param("followerEmail") String followerEmail);

    @Query("""
        SELECT s.channelOwner
        FROM SubscriptionEntity s
        WHERE s.follower.email = :followerEmail
          AND s.follower.isDeleted = false
          AND s.channelOwner.isDeleted = false
    """)
    List<UserEntity> findChannelOwnersByFollowerEmail(@Param("followerEmail") String followerEmail);

    long countByChannelOwner_IdAndChannelOwner_IsDeletedFalse(Long channelOwnerId);
    long countByChannelOwner_EmailAndChannelOwner_IsDeletedFalse(String channelOwnerEmail);

    boolean existsByFollower_EmailAndChannelOwner_IdAndFollower_IsDeletedFalseAndChannelOwner_IsDeletedFalse(
            String followerEmail,
            Long channelOwnerId);

    Optional<SubscriptionEntity> findByFollower_IdAndChannelOwner_Id(Long followerId, Long channelOwnerId);

    void deleteByFollower_IdAndChannelOwner_Id(Long followerId, Long channelOwnerId);
}
