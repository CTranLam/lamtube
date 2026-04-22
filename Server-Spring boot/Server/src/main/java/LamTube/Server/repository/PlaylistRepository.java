package LamTube.Server.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import LamTube.Server.dto.PlaylistPickerItemDTO;
import LamTube.Server.dto.PlaylistListItemDTO;
import LamTube.Server.model.PlaylistEntity;

@Repository
public interface PlaylistRepository extends JpaRepository<PlaylistEntity, Long> {
    boolean existsByUser_EmailAndNameIgnoreCaseAndIsDeletedFalse(String email, String name);
    boolean existsByUser_EmailAndNameIgnoreCaseAndIsDeletedFalseAndIdNot(
            String email,
            String name,
            Long id);
    Optional<PlaylistEntity> findByIdAndUser_EmailAndIsDeletedFalse(Long id, String email);

    @Query("""
        SELECT new LamTube.Server.dto.PlaylistPickerItemDTO(
            p.id,
            p.name,
            COALESCE(p.isPrivate, true),
            CASE WHEN EXISTS (
                SELECT pv.id
                FROM PlaylistVideoEntity pv
                WHERE pv.playlist.id = p.id
                  AND pv.video.id = :videoId
            ) THEN true ELSE false END
        )
        FROM PlaylistEntity p
        WHERE p.user.email = :email
          AND p.isDeleted = false
        ORDER BY p.id DESC
    """)
    List<PlaylistPickerItemDTO> findPickerItemsByUserEmailAndVideoId(
            @Param("email") String email,
            @Param("videoId") Long videoId);

    @Query("""
        SELECT new LamTube.Server.dto.PlaylistListItemDTO(
            p.id,
            p.name,
            COALESCE(p.isPrivate, true),
            COUNT(pv.id)
        )
        FROM PlaylistEntity p
        LEFT JOIN p.playlistVideos pv
        WHERE p.user.email = :email
          AND p.isDeleted = false
        GROUP BY p.id, p.name, p.isPrivate
        ORDER BY p.id DESC
    """)
    List<PlaylistListItemDTO> findListItemsByUserEmail(@Param("email") String email);
}
