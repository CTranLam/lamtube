package LamTube.Server.repository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.VideoReactionEntity;

@Repository
public interface VideoReactionRepository extends JpaRepository<VideoReactionEntity, Long> {

    long countByVideo_IdAndTypeIgnoreCase(Long videoId, String type);

    Optional<VideoReactionEntity> findByVideo_IdAndUser_Email(Long videoId, String email);
    void deleteByVideo_IdAndUser_Email(Long videoId, String email);

    List<VideoReactionEntity> findByUser_Email(String email);

    @Query("""
        SELECT COUNT(vr)
        FROM VideoReactionEntity vr
        WHERE vr.video.user.email = :ownerEmail
          AND vr.video.user.isDeleted = false
          AND vr.video.isDeleted = false
          AND LOWER(vr.type) = LOWER(:type)
    """)
    long countByOwnerEmailAndType(
        @Param("ownerEmail") String ownerEmail,
        @Param("type") String type
    );

    @Query("""
        SELECT COUNT(vr)
        FROM VideoReactionEntity vr
        WHERE vr.video.user.email = :ownerEmail
          AND vr.video.user.isDeleted = false
          AND vr.video.isDeleted = false
          AND LOWER(vr.type) = LOWER(:type)
          AND vr.createdAt >= :start
          AND vr.createdAt < :end
    """)
    long countByOwnerEmailAndTypeInRange(
        @Param("ownerEmail") String ownerEmail,
        @Param("type") String type,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}
