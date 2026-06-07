package com.spotify.My_music.repository;

import com.spotify.My_music.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongRepository extends JpaRepository<Song, Long> {
}