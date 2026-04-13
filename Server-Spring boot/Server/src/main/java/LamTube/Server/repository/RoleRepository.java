package LamTube.Server.repository;

import org.springframework.stereotype.Repository;
import LamTube.Server.model.RoleEntity;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {
    Optional<RoleEntity> findByNameAndIsDeletedFalse(String name);
    List<RoleEntity> findAllByIsDeletedFalse();
}
