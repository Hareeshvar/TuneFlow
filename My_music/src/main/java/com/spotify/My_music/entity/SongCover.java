package com.spotify.My_music.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "song_cover")
public class SongCover {

    @Id
    private Long id;

    @Lob
    @Column(name = "cover_data", columnDefinition = "LONGBLOB")
    private byte[] coverData;

    public SongCover() {
    }

    public SongCover(Long id, byte[] coverData) {
        this.id = id;
        this.coverData = coverData;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public byte[] getCoverData() {
        return coverData;
    }

    public void setCoverData(byte[] coverData) {
        this.coverData = coverData;
    }
}
