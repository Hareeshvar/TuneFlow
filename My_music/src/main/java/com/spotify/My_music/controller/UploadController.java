package com.spotify.My_music.controller;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.spotify.My_music.entity.Song;
import com.spotify.My_music.entity.SongAudio;
import com.spotify.My_music.entity.SongCover;
import com.spotify.My_music.repository.SongRepository;
import com.spotify.My_music.repository.SongAudioRepository;
import com.spotify.My_music.repository.SongCoverRepository;

@RestController
@RequestMapping("/songs")
public class UploadController {

    private final SongRepository songRepository;
    private final SongAudioRepository songAudioRepository;
    private final SongCoverRepository songCoverRepository;

    public UploadController(
            SongRepository songRepository,
            SongAudioRepository songAudioRepository,
            SongCoverRepository songCoverRepository) {
        this.songRepository = songRepository;
        this.songAudioRepository = songAudioRepository;
        this.songCoverRepository = songCoverRepository;
    }

    @PostMapping(
        value = "/upload",
        consumes = "multipart/form-data"
    )
    public ResponseEntity<Song> uploadSong(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "cover", required = false) MultipartFile cover,
            @RequestParam("title") String title,
            @RequestParam("artist") String artist,
            @RequestParam("duration") String duration
    ) throws Exception {

        String baseUploadDir = System.getProperty("user.dir")
        + File.separator
        + "uploads"
        + File.separator;

        String songsDir = baseUploadDir + "songs" + File.separator;
        String coversDir = baseUploadDir + "covers" + File.separator;

        File songsFolder = new File(songsDir);
        if (!songsFolder.exists()) {
            songsFolder.mkdirs();
        }

        File coversFolder = new File(coversDir);
        if (!coversFolder.exists()) {
            coversFolder.mkdirs();
        }

        String filePath = songsDir + file.getOriginalFilename();
        System.out.println("Saving song to: " + filePath);
        Files.copy(file.getInputStream(), Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);

        Song song = new Song();
        song.setTitle(title);
        song.setArtist(artist);
        song.setFilePath(filePath);
        song.setDuration(duration);

        if (cover != null && !cover.isEmpty()) {
            String coverPath = coversDir + cover.getOriginalFilename();
            System.out.println("Saving cover to: " + coverPath);
            Files.copy(cover.getInputStream(), Paths.get(coverPath), StandardCopyOption.REPLACE_EXISTING);
            song.setCoverImage(coverPath);
        }

        Song savedSong = songRepository.save(song);

        // Save audio bytes to the database
        SongAudio songAudio = new SongAudio(savedSong.getId(), file.getBytes());
        songAudioRepository.save(songAudio);

        // Save cover bytes to the database if a cover was uploaded
        if (cover != null && !cover.isEmpty()) {
            SongCover songCover = new SongCover(savedSong.getId(), cover.getBytes());
            songCoverRepository.save(songCover);
        }

        return ResponseEntity.ok(savedSong);
    }
}