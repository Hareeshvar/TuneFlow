import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Music,
  Maximize2,
  Heart
} from 'lucide-react';
import { API_BASE_URL } from '../config';

export default function Player({
  activeTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  shuffleMode,
  repeatMode,
  onTogglePlay,
  onSkipNext,
  onSkipPrevious,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onToggleFavorite
}) {
  const progressBarRef = useRef(null);
  const volumeBarRef = useRef(null);
  const [showMobileVolume, setShowMobileVolume] = useState(false);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleProgressClick = (e) => {
    if (!duration || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * duration);
  };

  const handleProgressTouch = (e) => {
    if (!duration || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const clickX = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(percentage * duration);
  };

  const handleVolumeClick = (e) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onVolumeChange(percentage);
  };

  const handleVolumeTouch = (e) => {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const clickX = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onVolumeChange(percentage);
  };

  const handleVolumeBtnClick = () => {
    if (window.innerWidth <= 640) {
      setShowMobileVolume(!showMobileVolume);
    } else {
      onToggleMute();
    }
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <footer className="bottom-player">
      {/* Left Area: Track Details */}
      <div className="player-left">
        {activeTrack ? (
          <>
            <div className="current-track-art" style={{ padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeTrack.coverImage ? (
                <img
                  src={`${API_BASE_URL}/songs/cover/${activeTrack.id}`}
                  alt={activeTrack.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-music"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
                  }}
                />
              ) : (
                <Music size={24} />
              )}
            </div>
            <div className="current-track-info">
              <span className="current-track-title">{activeTrack.title}</span>
              <span className="current-track-artist">{activeTrack.artist}</span>
            </div>
            <button
              className="control-btn"
              style={{ color: activeTrack.favorite ? 'var(--tuneflow-green)' : 'inherit', marginLeft: '8px' }}
              onClick={() => onToggleFavorite(activeTrack.id)}
              title={activeTrack.favorite ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
            >
              <Heart size={16} fill={activeTrack.favorite ? 'var(--tuneflow-green)' : 'none'} />
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b3b3b3' }}>
            <div className="current-track-art" style={{ color: '#555' }}>
              <Music size={24} />
            </div>
            <span style={{ fontSize: '0.85rem' }}>No track selected</span>
          </div>
        )}
      </div>

      {/* Center Area: Playback Controls */}
      <div className="player-center">
        <div className="playback-controls">
          <button
            className={`control-btn ${shuffleMode ? 'active' : ''}`}
            onClick={onToggleShuffle}
            title="Shuffle"
          >
            <Shuffle size={16} />
          </button>
          <button className="control-btn" onClick={onSkipPrevious} title="Previous">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            className="control-btn-play"
            onClick={onTogglePlay}
            disabled={!activeTrack}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={18} fill="black" /> : <Play size={18} fill="black" style={{ marginLeft: '2px' }} />}
          </button>
          <button className="control-btn" onClick={onSkipNext} title="Next">
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button
            className={`control-btn ${repeatMode !== 'off' ? 'active' : ''}`}
            onClick={onToggleRepeat}
            title={repeatMode === 'one' ? 'Repeat one' : repeatMode === 'all' ? 'Repeat all' : 'Repeat off'}
          >
            <Repeat size={16} />
            {repeatMode === 'one' && (
              <span style={{ fontSize: '8px', fontWeight: 'bold', position: 'absolute', top: '-6px', right: '-6px', background: '#1ed760', color: 'black', width: '10px', height: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>1</span>
            )}
          </button>
        </div>

        {/* Progress Slider */}
        <div className="progress-container">
          <span>{formatTime(currentTime)}</span>
          <div
            className="progress-bar-wrapper"
            ref={progressBarRef}
            onClick={handleProgressClick}
            onTouchStart={handleProgressTouch}
            onTouchMove={handleProgressTouch}
          >
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            <div className="progress-handle" style={{ left: `${progressPercent}%` }}></div>
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Area: Volume Controls */}
      <div className="player-right">
        <div className="volume-container">
          <button className="control-btn" onClick={handleVolumeBtnClick} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <div
            className={`volume-slider-wrapper ${showMobileVolume ? 'mobile-visible' : ''}`}
            ref={volumeBarRef}
            onClick={handleVolumeClick}
            onTouchStart={handleVolumeTouch}
            onTouchMove={handleVolumeTouch}
          >
            <div className="volume-fill" style={{ width: `${volumePercent}%` }}></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
