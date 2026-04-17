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

    List<VideoEntity> findByUserEmail(String email);
    VideoEntity findByIdAndIsDeletedFalse(Long id);
    Page<VideoEntity> findByIsDeletedFalseAndStatus(String status, Pageable pageable);
    Page<VideoEntity> findByIsDeletedFalseAndStatusAndCategory_Id(String status, Long categoryId, Pageable pageable);
    @Query("""
        SELECT v
        FROM VideoEntity v
        WHERE v.isDeleted = false
        AND v.status = 'public'
        AND (:categoryId IS NULL OR v.category.id = :categoryId)
        AND (:keyword IS NULL OR LOWER(v.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<VideoEntity> searchHomeVideos(
        @Param("categoryId") Long categoryId,
        @Param("keyword") String keyword,
        Pageable pageable
    );

}
