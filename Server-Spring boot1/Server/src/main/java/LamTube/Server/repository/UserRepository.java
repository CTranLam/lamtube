package LamTube.Server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmailAndIsDeletedFalse(String email);
    List<UserEntity> findAllByIsDeletedFalse();

    Page<UserEntity> findAllByIsDeletedFalse(Pageable pageable);

    @Query("SELECT u FROM UserEntity u " +
       "WHERE u.isDeleted = false " +
       "AND (:email IS NULL OR LOWER(CAST(u.email AS string)) LIKE LOWER(CONCAT('%', CAST(:email AS string), '%'))) " +
       "AND (:role IS NULL OR CAST(u.role.name AS string) = CAST(:role AS string))")
    Page<UserEntity> searchUsers(
        @Param("email") String email, 
        @Param("role") String role, 
        Pageable pageable
);
}
