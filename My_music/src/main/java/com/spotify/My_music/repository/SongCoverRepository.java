package com.spotify.My_music.repository;

import com.spotify.My_music.entity.SongCover;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongCoverRepository extends JpaRepository<SongCover, Long> {
}
