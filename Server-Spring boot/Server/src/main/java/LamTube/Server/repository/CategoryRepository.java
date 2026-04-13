package LamTube.Server.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.CategoryEntity;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
    Page<CategoryEntity> findAllByIsDeletedFalse(Pageable pageable);

    Page<CategoryEntity> findByIsDeletedFalseAndNameContainingIgnoreCase(String name, Pageable pageable);

    boolean existsByNameAndIsDeletedFalse(String name);

    List<CategoryEntity> findAllByIsDeletedFalseOrderByNameAsc();
}
