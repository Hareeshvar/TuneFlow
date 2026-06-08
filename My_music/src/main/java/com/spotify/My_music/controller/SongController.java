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
import com.spotify.My_music.entity.SongAudio;
import com.spotify.My_music.entity.SongCover;
import com.spotify.My_music.repository.SongRepository;
import com.spotify.My_music.repository.SongAudioRepository;
import com.spotify.My_music.repository.SongCoverRepository;

@RestController
@RequestMapping("/songs")
public class SongController {

    private final SongRepository songRepository;
    private final SongAudioRepository songAudioRepository;
    private final SongCoverRepository songCoverRepository;

    public SongController(
            SongRepository songRepository,
            SongAudioRepository songAudioRepository,
            SongCoverRepository songCoverRepository) {
        this.songRepository = songRepository;
        this.songAudioRepository = songAudioRepository;
        this.songCoverRepository = songCoverRepository;
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

        // 1. Try to load from database first
        java.util.Optional<SongAudio> databaseAudio = songAudioRepository.findById(id);
        Resource resource;
        String filename;

        if (databaseAudio.isPresent()) {
            byte[] audioBytes = databaseAudio.get().getAudioData();
            resource = new org.springframework.core.io.ByteArrayResource(audioBytes) {
                @Override
                public String getFilename() {
                    if (song.getFilePath() != null) {
                        try {
                            return Paths.get(song.getFilePath()).getFileName().toString();
                        } catch (Exception e) {
                            // ignore and fallback
                        }
                    }
                    return "track_" + id + ".m4a";
                }
            };
            filename = song.getFilePath() != null ? song.getFilePath() : "track.m4a";
        } else {
            // 2. Fall back to filesystem
            if (song.getFilePath() == null) {
                return ResponseEntity.notFound().build();
            }
            Path path = Paths.get(song.getFilePath());
            resource = new UrlResource(path.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            filename = song.getFilePath();
        }

        String contentType = "audio/mpeg"; // Default to MP3/MPEG
        String filenameLower = filename.toLowerCase();
        if (filenameLower.endsWith(".wav")) {
            contentType = "audio/wav";
        } else if (filenameLower.endsWith(".m4a") || filenameLower.endsWith(".mp4")) {
            contentType = "audio/mp4";
        } else if (filenameLower.endsWith(".ogg")) {
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

        // 1. Try to load from database first
        java.util.Optional<SongCover> databaseCover = songCoverRepository.findById(id);
        Resource resource;
        String filename;

        if (databaseCover.isPresent()) {
            byte[] coverBytes = databaseCover.get().getCoverData();
            resource = new org.springframework.core.io.ByteArrayResource(coverBytes) {
                @Override
                public String getFilename() {
                    if (song.getCoverImage() != null) {
                        try {
                            return Paths.get(song.getCoverImage()).getFileName().toString();
                        } catch (Exception e) {
                            // ignore and fallback
                        }
                    }
                    return "cover_" + id + ".jpg";
                }
            };
            filename = song.getCoverImage() != null ? song.getCoverImage() : "cover.jpg";
        } else {
            // 2. Fall back to filesystem
            if (song.getCoverImage() == null || song.getCoverImage().isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Path path = Paths.get(song.getCoverImage());
            Resource resourceFileSystem = new UrlResource(path.toUri());

            if (!resourceFileSystem.exists() || !resourceFileSystem.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            resource = resourceFileSystem;
            filename = song.getCoverImage();
        }

        String contentType = "image/jpeg";
        String filenameLower = filename.toLowerCase();
        if (filenameLower.endsWith(".png")) {
            contentType = "image/png";
        } else if (filenameLower.endsWith(".gif")) {
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
            try {
                songAudioRepository.deleteById(id);
            } catch (Exception e) {
                System.err.println("Failed to delete audio from DB: " + e.getMessage());
            }
            try {
                songCoverRepository.deleteById(id);
            } catch (Exception e) {
                System.err.println("Failed to delete cover from DB: " + e.getMessage());
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