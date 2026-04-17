package LamTube.Server.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.VideoReactionEntity;

@Repository
public interface VideoReactionRepository extends JpaRepository<VideoReactionEntity, Long> {
    long countByVideo_IdAndTypeIgnoreCase(Long videoId, String type);

    Optional<VideoReactionEntity> findByUser_IdAndVideo_Id(Long userId, Long videoId);
}