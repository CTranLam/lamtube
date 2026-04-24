package LamTube.Server.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.RefreshTokenEntity;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, Long> {
    Optional<RefreshTokenEntity> findByTokenHashAndRevokedFalse(String tokenHash);
    List<RefreshTokenEntity> findByUser_IdAndRevokedFalse(Long userId);
}
