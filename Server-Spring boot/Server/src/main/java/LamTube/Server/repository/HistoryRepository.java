package LamTube.Server.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.WatchHistoryEntity;

@Repository
public interface HistoryRepository extends JpaRepository<WatchHistoryEntity, Long> {

    boolean existsByUser_EmailAndVideo_IdAndWatchedAtAfter(
        String email, 
        Long videoId, 
        LocalDateTime startOfDay
    );

    WatchHistoryEntity findByUser_EmailAndVideo_Id(String email, Long videoId);    

    List<WatchHistoryEntity> findByUser_EmailOrderByWatchedAtDesc(String email);

    @Query("""
        SELECT COUNT(h)
        FROM WatchHistoryEntity h
        WHERE h.video.user.email = :ownerEmail
          AND h.video.user.isDeleted = false
          AND h.video.isDeleted = false
          AND h.watchedAt >= :start
          AND h.watchedAt < :end
    """)
    long countChannelViewsInRange(
        @Param("ownerEmail") String ownerEmail,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

}
