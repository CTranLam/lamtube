package LamTube.Server.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.UserEntity;
import LamTube.Server.model.VideoEntity;

@Repository
public interface VideoRepository extends JpaRepository<VideoEntity, Long> {

    List<VideoEntity> findByUserEmail(String email);
    VideoEntity findByIdAndIsDeletedFalse(Long id);
    Page<VideoEntity> findByIsDeletedFalseAndStatus(String status, Pageable pageable);
    Page<VideoEntity> findByIsDeletedFalseAndStatusAndCategory_Id(String status, Long categoryId, Pageable pageable);
    Page<VideoEntity> findByIsDeletedFalseAndStatusAndTitleContainingIgnoreCase(
            String status,
            String title,
            Pageable pageable);
    Page<VideoEntity> findByIsDeletedFalseAndStatusAndCategory_IdAndTitleContainingIgnoreCase(
            String status,
            Long categoryId,
            String title,
            Pageable pageable);

    Page<VideoEntity> findByUserInAndIsDeletedFalseAndStatus(List<UserEntity> users, String status, Pageable pageable);

}
