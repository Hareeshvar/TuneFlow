package com.spotify.My_music.repository;

import com.spotify.My_music.entity.SongAudio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SongAudioRepository extends JpaRepository<SongAudio, Long> {
}
