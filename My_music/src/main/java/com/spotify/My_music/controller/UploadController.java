package com.spotify.My_music.controller;

import java.io.File;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.spotify.My_music.entity.Song;
import com.spotify.My_music.repository.SongRepository;

import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "https://hareeshvar-tuneflow.netlify.app")
@RestController
@RequestMapping("/songs")
public class UploadController {

    private final SongRepository songRepository;

    public UploadController(SongRepository songRepository) {
        this.songRepository = songRepository;
    }

    @PostMapping(
    value = "/upload",
    consumes = "multipart/form-data"
)
    public Song uploadSong(
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
        file.transferTo(new File(filePath));

        Song song = new Song();
        song.setTitle(title);
        song.setArtist(artist);
        song.setFilePath(filePath);
        song.setDuration(duration);

        if (cover != null && !cover.isEmpty()) {
            String coverPath = coversDir + cover.getOriginalFilename();
            System.out.println("Saving cover to: " + coverPath);
            cover.transferTo(new File(coverPath));
            song.setCoverImage(coverPath);
        }

        return songRepository.save(song);
    }
}