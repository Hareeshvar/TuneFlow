package com.spotify.My_music.controller;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spotify.My_music.entity.Song;
import com.spotify.My_music.repository.SongRepository;

@RestController
@RequestMapping("/songs")
public class SongController {

    private final SongRepository songRepository;

    public SongController(SongRepository songRepository) {
        this.songRepository = songRepository;
    }

    @GetMapping
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    @PostMapping
    public Song addSong(@RequestBody Song song) {
        return songRepository.save(song);
    }

    @GetMapping("/play/{id}")
    public ResponseEntity<Resource> playSong(@PathVariable Long id) throws Exception {

        Song song = songRepository.findById(id).orElseThrow();

        Path path = Paths.get(song.getFilePath());
        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = "audio/mpeg"; // Default to MP3/MPEG
        String filename = song.getFilePath().toLowerCase();
        if (filename.endsWith(".wav")) {
            contentType = "audio/wav";
        } else if (filename.endsWith(".m4a") || filename.endsWith(".mp4")) {
            contentType = "audio/mp4";
        } else if (filename.endsWith(".ogg")) {
            contentType = "audio/ogg";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + resource.getFilename() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @GetMapping("/cover/{id}")
    public ResponseEntity<Resource> getCover(@PathVariable Long id) throws Exception {
        Song song = songRepository.findById(id).orElseThrow();
        if (song.getCoverImage() == null || song.getCoverImage().isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Path path = Paths.get(song.getCoverImage());
        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = "image/jpeg";
        if (song.getCoverImage().toLowerCase().endsWith(".png")) {
            contentType = "image/png";
        } else if (song.getCoverImage().toLowerCase().endsWith(".gif")) {
            contentType = "image/gif";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public void deleteSong(@PathVariable Long id) {
        Song song = songRepository.findById(id).orElse(null);
        if (song != null) {
            try {
                if (song.getFilePath() != null) {
                    java.io.File file = new java.io.File(song.getFilePath());
                    if (file.exists()) {
                        file.delete();
                    }
                }
                if (song.getCoverImage() != null) {
                    java.io.File cover = new java.io.File(song.getCoverImage());
                    if (cover.exists()) {
                        cover.delete();
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to delete files on disk: " + e.getMessage());
            }
            songRepository.delete(song);
        }
    }

    @PostMapping("/{id}/favorite")
    public Song toggleFavorite(@PathVariable Long id) {
        Song song = songRepository.findById(id).orElseThrow();
        song.setFavorite(!song.isFavorite());
        return songRepository.save(song);
    }

    @PostMapping("/{id}/play")
    public Song incrementPlays(@PathVariable Long id) {
        Song song = songRepository.findById(id).orElseThrow();
        song.setPlays(song.getPlays() + 1);
        return songRepository.save(song);
    }
}