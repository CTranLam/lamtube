package LamTube.Server.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.PlaylistVideoEntity;
import LamTube.Server.model.VideoEntity;

@Repository
public interface PlaylistVideoRepository extends JpaRepository<PlaylistVideoEntity, Long> {
    boolean existsByPlaylist_IdAndVideo_Id(Long playlistId, Long videoId);
    void deleteByPlaylist_IdAndVideo_Id(Long playlistId, Long videoId);

    @Query("""
        SELECT pv.video
        FROM PlaylistVideoEntity pv
        WHERE pv.playlist.user.email = :email
          AND pv.playlist.isDeleted = false
          AND LOWER(pv.playlist.name) IN :playlistNames
          AND pv.video IS NOT NULL
          AND pv.video.isDeleted = false
          AND LOWER(COALESCE(pv.video.status, 'public')) = 'public'
        ORDER BY pv.id DESC
    """)
    List<VideoEntity> findWatchLaterVideosByUserEmailAndPlaylistNames(
            @Param("email") String email,
            @Param("playlistNames") List<String> playlistNames);

    @Query("""
        SELECT pv.video
        FROM PlaylistVideoEntity pv
        WHERE pv.playlist.id = :playlistId
          AND pv.playlist.user.email = :email
          AND pv.playlist.isDeleted = false
          AND pv.video IS NOT NULL
          AND pv.video.isDeleted = false
        ORDER BY pv.id DESC
    """)
    List<VideoEntity> findVideosByPlaylistIdAndUserEmail(
            @Param("playlistId") Long playlistId,
            @Param("email") String email);
}
