package LamTube.Server.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.CommentEntity;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {
    Page<CommentEntity> findByVideo_IdAndIsDeletedFalse(Long videoId, Pageable pageable);

    Optional<CommentEntity> findByIdAndIsDeletedFalse(Long id);

    long countByVideo_IdAndIsDeletedFalse(Long videoId);

    List<CommentEntity> findByParent_IdAndIsDeletedFalse(Long parentId);
}
