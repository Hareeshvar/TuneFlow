import React, { useState, useEffect, useRef, useContext } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Player from './components/Player';
import UploadModal from './components/UploadModal';
import LoginPage from './components/LoginPage';
import { Volume2, CheckCircle, AlertCircle, Menu, Headphones, Plus, LogIn } from 'lucide-react';
import { API_BASE_URL } from './config';
import { AuthContext } from './context/AuthContext';

export default function App() {
  const [songs, setSongs] = useState([]);
  const [activeTrack, setActiveTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Audio state variables
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  
  // Modal & Notification states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(window.location.hash === '#/login' ? 'login' : 'app');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/login') {
        setCurrentRoute('login');
      } else {
        setCurrentRoute('app');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const { token, isAdmin } = useContext(AuthContext);

  const audioRef = useRef(new Audio());

  // Keep refs in sync with state for use inside event handlers to avoid re-binding listeners
  const songsRef = useRef(songs);
  const activeTrackRef = useRef(activeTrack);
  const shuffleModeRef = useRef(shuffleMode);
  const repeatModeRef = useRef(repeatMode);

  useEffect(() => { songsRef.current = songs; }, [songs]);
  useEffect(() => { activeTrackRef.current = activeTrack; }, [activeTrack]);
  useEffect(() => { shuffleModeRef.current = shuffleMode; }, [shuffleMode]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);

  // Fetch playlist from Spring Boot backend
  const fetchSongs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/songs`);
      if (response.ok) {
        const data = await response.json();
        setSongs(data);
        
        // If there is an active track, make sure it still exists in the list
        if (activeTrackRef.current) {
          const exists = data.some(s => s.id === activeTrackRef.current.id);
          if (!exists) {
            setActiveTrack(null);
            setIsPlaying(false);
          }
        }
      } else {
        showNotification('Failed to fetch songs from the backend.', 'error');
      }
    } catch (err) {
      console.error('API Error:', err);
      showNotification('Unable to connect to the backend server.', 'error');
    }
  };

  const lastPlayedSongIdRef = useRef(null);

  // Run once on mount to fetch data and bind static audio listeners
  useEffect(() => {
    fetchSongs();
    
    // Set initial audio properties
    audioRef.current.volume = volume;

    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    
    const handlePlay = () => {
      const currentTrack = activeTrackRef.current;
      if (currentTrack && currentTrack.id !== lastPlayedSongIdRef.current) {
        lastPlayedSongIdRef.current = currentTrack.id;
        fetch(`${API_BASE_URL}/songs/${currentTrack.id}/play`, {
          method: 'POST',
        })
        .then(res => {
          if (res.ok) {
            return res.json();
          }
        })
        .then(updatedSong => {
          if (updatedSong) {
            // Update the state locally to sync plays count
            setSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
          }
        })
        .catch(err => console.error("Failed to increment play count:", err));
      }
    };

    const handleEnded = () => {
      // Reset last played song ID so replaying counts as a new play event
      lastPlayedSongIdRef.current = null;
      const currentRepeat = repeatModeRef.current;
      if (currentRepeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(err => console.log('Playback error:', err));
      } else {
        // inline trigger play next track with isAutoEnd = true
        const currentSongs = songsRef.current;
        const currentTrack = activeTrackRef.current;
        const currentShuffle = shuffleModeRef.current;

        if (currentSongs.length === 0) return;

        let nextIndex = 0;
        if (currentShuffle) {
          nextIndex = Math.floor(Math.random() * currentSongs.length);
          if (currentSongs.length > 1 && currentTrack) {
            const currentIndex = currentSongs.findIndex(s => s.id === currentTrack.id);
            while (nextIndex === currentIndex) {
              nextIndex = Math.floor(Math.random() * currentSongs.length);
            }
          }
        } else if (currentTrack) {
          const currentIndex = currentSongs.findIndex(s => s.id === currentTrack.id);
          nextIndex = currentIndex + 1;

          if (nextIndex >= currentSongs.length) {
            if (currentRepeat === 'all') {
              nextIndex = 0;
            } else {
              // End of playlist, stop playing
              setIsPlaying(false);
              setCurrentTime(0);
              audio.currentTime = 0;
              return;
            }
          }
        }
        
        // play track
        const nextTrack = currentSongs[nextIndex];
        setActiveTrack(nextTrack);
        setIsPlaying(true);
        setCurrentTime(0);
        audio.src = `${API_BASE_URL}/songs/play/${nextTrack.id}`;
        audio.load();
        audio.play().catch(err => {
          console.error("Audio playback error:", err);
          setIsPlaying(false);
        });
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []); // Run exactly once!

  // Sync volume state to audio element
  useEffect(() => {
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Toast notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Select a song to play
  const selectTrack = (track) => {
    if (activeTrackRef.current && activeTrackRef.current.id === track.id) {
      togglePlay();
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
      setCurrentTime(0);
      
      audioRef.current.src = `${API_BASE_URL}/songs/play/${track.id}`;
      audioRef.current.load();
      audioRef.current.play()
        .catch(err => {
          console.error("Audio playback error:", err);
          showNotification("Could not play song file.", "error");
          setIsPlaying(false);
        });
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    const currentTrack = activeTrackRef.current;
    if (!currentTrack) {
      const currentSongs = songsRef.current;
      if (currentSongs.length > 0) {
        selectTrack(currentSongs[0]);
      }
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error("Playback play failed:", err);
          showNotification("Could not resume audio.", "error");
        });
    }
  };

  // Seek track position
  const seekTo = (seconds) => {
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  // Volume adjuster
  const changeVolume = (val) => {
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Shuffle and Repeat toggles
  const toggleShuffle = () => setShuffleMode(!shuffleMode);
  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  // Next Track logic (Manual Trigger)
  const playNextTrack = (isAutoEnd = false) => {
    const currentSongs = songsRef.current;
    const currentTrack = activeTrackRef.current;
    const currentShuffle = shuffleModeRef.current;
    const currentRepeat = repeatModeRef.current;

    if (currentSongs.length === 0) return;

    let nextIndex = 0;

    if (currentShuffle) {
      nextIndex = Math.floor(Math.random() * currentSongs.length);
      if (currentSongs.length > 1 && currentTrack) {
        const currentIndex = currentSongs.findIndex(s => s.id === currentTrack.id);
        while (nextIndex === currentIndex) {
          nextIndex = Math.floor(Math.random() * currentSongs.length);
        }
      }
    } else if (currentTrack) {
      const currentIndex = currentSongs.findIndex(s => s.id === currentTrack.id);
      nextIndex = currentIndex + 1;

      if (nextIndex >= currentSongs.length) {
        if (currentRepeat === 'all') {
          nextIndex = 0;
        } else if (isAutoEnd) {
          setIsPlaying(false);
          setCurrentTime(0);
          audioRef.current.currentTime = 0;
          return;
        } else {
          nextIndex = 0; 
        }
      }
    }

    selectTrack(currentSongs[nextIndex]);
  };

  // Previous Track logic
  const playPreviousTrack = () => {
    const currentSongs = songsRef.current;
    const currentTrack = activeTrackRef.current;
    const currentShuffle = shuffleModeRef.current;

    if (currentSongs.length === 0 || !currentTrack) return;

    if (audioRef.current.currentTime > 3) {
      seekTo(0);
      return;
    }

    let prevIndex = 0;
    const currentIndex = currentSongs.findIndex(s => s.id === currentTrack.id);

    if (currentShuffle) {
      prevIndex = Math.floor(Math.random() * currentSongs.length);
      if (currentSongs.length > 1) {
        while (prevIndex === currentIndex) {
          prevIndex = Math.floor(Math.random() * currentSongs.length);
        }
      }
    } else {
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = currentSongs.length - 1;
      }
    }

    selectTrack(currentSongs[prevIndex]);
  };

  // Callback on successful file upload
  const handleUploadSuccess = () => {
    fetchSongs(); // Instant refresh of songs from backend API
    showNotification('Track uploaded and added to playlist!');
  };

  const deleteSong = async (songId) => {
    if (window.confirm("Are you sure you want to delete this track?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/songs/${songId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          showNotification('Track deleted successfully!');
          fetchSongs();
          
          if (activeTrackRef.current && activeTrackRef.current.id === songId) {
            audioRef.current.pause();
            setActiveTrack(null);
            setIsPlaying(false);
          }
        } else {
          showNotification('Failed to delete track.', 'error');
        }
      } catch (err) {
        console.error("Delete error:", err);
        showNotification('Network error, failed to delete track.', 'error');
      }
    }
  };

  const [activeView, setActiveView] = useState('all'); // 'all' | 'liked'

  const toggleFavorite = async (songId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/songs/${songId}/favorite`, {
        method: 'POST',
      });
      if (response.ok) {
        const updatedSong = await response.json();
        setSongs(prev => prev.map(s => s.id === songId ? updatedSong : s));
        if (activeTrackRef.current && activeTrackRef.current.id === songId) {
          setActiveTrack(updatedSong);
        }
        showNotification(updatedSong.favorite ? 'Added to Liked Songs' : 'Removed from Liked Songs');
      } else {
        showNotification('Failed to update favorite status.', 'error');
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
      showNotification('Network error.', 'error');
    }
  };

  // Filter songs based on view
  const displayedSongs = activeView === 'liked'
    ? songs.filter(s => s.favorite)
    : activeView === 'most_played'
      ? [...songs].sort((a, b) => (b.plays || 0) - (a.plays || 0))
      : songs;

  return (
    <>
      {/* Mobile top navigation bar */}
      <header className="mobile-top-bar">
        <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>
        <div className="mobile-logo">
          <Headphones size={24} style={{ color: 'var(--tuneflow-green, #1ed760)' }} />
          <span>TuneFlow</span>
        </div>
        {isAdmin() ? (
          <button className="mobile-upload-btn" onClick={() => setIsUploadOpen(true)} aria-label="Upload song">
            <Plus size={20} />
          </button>
        ) : (
          <button className="menu-toggle-btn" onClick={() => { window.location.hash = '#/login'; }} aria-label="Admin Login">
            <LogIn size={20} />
          </button>
        )}
      </header>

      {currentRoute === 'login' ? (
        <LoginPage />
      ) : (
        <div className="app-container">
          {/* Left Sidebar */}
          <Sidebar
            songs={songs}
            activeTrack={activeTrack}
            isPlaying={isPlaying}
            onSelectTrack={selectTrack}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenLogin={() => { window.location.hash = '#/login'; }}
            activeView={activeView}
            onViewChange={setActiveView}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Central Playlist Panel */}
          <MainContent
            songs={displayedSongs}
            activeTrack={activeTrack}
            isPlaying={isPlaying}
            onSelectTrack={selectTrack}
            onTogglePlay={togglePlay}
            onDeleteTrack={deleteSong}
            onToggleFavorite={toggleFavorite}
            activeView={activeView}
          />
        </div>
      )}

      {/* Sticky tuneflow-like bottom player */}
      {currentRoute !== 'login' && (
        <Player
          activeTrack={activeTrack}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isMuted={isMuted}
          shuffleMode={shuffleMode}
          repeatMode={repeatMode}
          onTogglePlay={togglePlay}
          onSkipNext={() => playNextTrack(false)}
          onSkipPrevious={playPreviousTrack}
          onSeek={seekTo}
          onVolumeChange={changeVolume}
          onToggleMute={toggleMute}
          onToggleShuffle={toggleShuffle}
          onToggleRepeat={toggleRepeat}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {/* Floating Upload Modal */}
      {currentRoute !== 'login' && isUploadOpen && (
        <UploadModal
          onClose={() => setIsUploadOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* Toast Notification Container */}
      {notification && (
        <div className={`notification ${notification.type === 'error' ? 'error' : ''}`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}
    </>
  );
}
