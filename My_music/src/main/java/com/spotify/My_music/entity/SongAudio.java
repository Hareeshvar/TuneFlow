package com.spotify.My_music.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "song_audio")
public class SongAudio {

    @Id
    private Long id;

    @Lob
    @Column(name = "audio_data", columnDefinition = "LONGBLOB")
    private byte[] audioData;

    public SongAudio() {
    }

    public SongAudio(Long id, byte[] audioData) {
        this.id = id;
        this.audioData = audioData;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public byte[] getAudioData() {
        return audioData;
    }

    public void setAudioData(byte[] audioData) {
        this.audioData = audioData;
    }
}
