package LamTube.Server.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.VideoEntity;

@Repository
public interface VideoRepository extends JpaRepository<VideoEntity, Long> {

    List<VideoEntity> findByUser_EmailAndUser_IsDeletedFalseAndIsDeletedFalseOrderByIdDesc(String email);
    VideoEntity findByIdAndIsDeletedFalse(Long id);
    VideoEntity findByIdAndUser_EmailAndUser_IsDeletedFalseAndIsDeletedFalse(Long id, String email);
    Page<VideoEntity> findByIsDeletedFalseAndStatus(String status, Pageable pageable);
    Page<VideoEntity> findByIsDeletedFalseAndStatusAndCategory_Id(String status, Long categoryId, Pageable pageable);
    Page<VideoEntity> findByIsDeletedFalseAndStatusAndUser_IdIn(String status, List<Long> userIds, Pageable pageable);
    @Query("""
        SELECT v
        FROM VideoEntity v
        WHERE v.isDeleted = false
          AND (:titlePattern IS NULL OR LOWER(v.title) LIKE :titlePattern)
          AND (:statusFilter IS NULL OR LOWER(v.status) = :statusFilter)
          AND (:categoryId IS NULL OR v.category.id = :categoryId)
          AND (
            :uploaderPattern IS NULL
            OR LOWER(v.user.email) LIKE :uploaderPattern
            OR EXISTS (
                SELECT 1
                FROM UserProfileEntity up
                WHERE up.user.id = v.user.id
                  AND up.fullName IS NOT NULL
                  AND LOWER(up.fullName) LIKE :uploaderPattern
            )
          )
    """)
    Page<VideoEntity> searchAdminVideos(
        @Param("titlePattern") String titlePattern,
        @Param("statusFilter") String statusFilter,
        @Param("categoryId") Long categoryId,
        @Param("uploaderPattern") String uploaderPattern,
        Pageable pageable
    );

    @Query("""
        SELECT v
        FROM VideoEntity v
        WHERE v.isDeleted = false
        AND v.status = 'public'
        AND (:categoryId IS NULL OR v.category.id = :categoryId)
        AND (:keywordPattern IS NULL OR LOWER(v.title) LIKE :keywordPattern)
    """)
    Page<VideoEntity> searchHomeVideos(
        @Param("categoryId") Long categoryId,
        @Param("keywordPattern") String keywordPattern,
        Pageable pageable
    );

    @Query("""
        SELECT v
        FROM VideoReactionEntity vr
        JOIN vr.video v
        WHERE vr.user.email = :email
          AND LOWER(vr.type) = 'like'
          AND v.isDeleted = false
          AND v.status = 'public'
        ORDER BY v.id DESC
    """)
    List<VideoEntity> findLikedVideosByUserEmail(@Param("email") String email);

    long countByUser_EmailAndIsDeletedFalse(String email);

    @Query("""
        SELECT COALESCE(SUM(v.viewCount), 0)
        FROM VideoEntity v
        WHERE v.user.email = :email
          AND v.user.isDeleted = false
          AND v.isDeleted = false
    """)
    long sumViewCountByOwnerEmail(@Param("email") String email);
    
    @Query("""
        SELECT v
        FROM VideoEntity v
        WHERE v.isDeleted = false
          AND LOWER(v.status) = 'public'
          AND v.id <> :videoId
          AND :categoryId IS NOT NULL
          AND v.category.id = :categoryId
        ORDER BY v.viewCount DESC, v.id DESC
    """)
    List<VideoEntity> findRelatedVideosByCategory(
        @Param("videoId") Long videoId,
        @Param("categoryId") Long categoryId,
        Pageable pageable
    );

    @Query("""
        SELECT v
        FROM VideoEntity v
        WHERE v.isDeleted = false
          AND LOWER(v.status) = 'public'
          AND v.id <> :videoId
          AND :ownerId IS NOT NULL
          AND v.user.id = :ownerId
          AND v.id NOT IN :excludedIds
        ORDER BY v.viewCount DESC, v.id DESC
    """)
    List<VideoEntity> findRelatedVideosByOwner(
        @Param("videoId") Long videoId,
        @Param("ownerId") Long ownerId,
        @Param("excludedIds") List<Long> excludedIds,
        Pageable pageable
    );

}
