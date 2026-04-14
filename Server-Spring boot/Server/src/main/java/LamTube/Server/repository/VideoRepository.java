package LamTube.Server.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import LamTube.Server.model.VideoEntity;

@Repository
public interface VideoRepository extends JpaRepository<VideoEntity, Long> {

    List<VideoEntity> findByUserEmail(String email);

}
