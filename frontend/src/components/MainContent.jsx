import React, { useState } from 'react';
import { Play, Pause, Search, Clock, Disc, Music, Trash2, Heart, BarChart2, AudioWaveform } from 'lucide-react';

export default function MainContent({ songs, activeTrack, isPlaying, onSelectTrack, onTogglePlay, onDeleteTrack, onToggleFavorite, activeView }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter songs based on search query (case-insensitive)
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (song) => {
    onSelectTrack(song);
  };

  const handlePlayAllClick = () => {
    if (filteredSongs.length > 0) {
      // If the current track is already in the list, just toggle play
      if (activeTrack && filteredSongs.some((s) => s.id === activeTrack.id)) {
        onTogglePlay();
      } else {
        // Otherwise play the first song in the filtered list
        onSelectTrack(filteredSongs[0]);
      }
    }
  };

  const isLikedView = activeView === 'liked';
  const isMostPlayedView = activeView === 'most_played';

  return (
    <main className="main-content" style={{ 
      background: isLikedView 
        ? 'linear-gradient(to bottom, #450e71, var(--tuneflow-dark-gray) 300px)' 
        : isMostPlayedView
          ? 'linear-gradient(to bottom, #b71c1c, var(--tuneflow-dark-gray) 300px)'
          : 'linear-gradient(to bottom, #112d19, var(--tuneflow-dark-gray) 300px)' 
    }}>
      {/* TuneFlow Playlist Banner Header */}
      <div className="main-header">
        {isLikedView ? (
          <div className="playlist-cover" style={{ background: 'linear-gradient(135deg, #450e71 0%, #190a2a 100%)', color: '#ffffff' }}>
            <Heart size={80} fill="white" />
          </div>
        ) : isMostPlayedView ? (
          <div className="playlist-cover" style={{ background: 'linear-gradient(135deg, #b71c1c 0%, #420606 100%)', color: '#ffffff' }}>
            <BarChart2 size={80} />
          </div>
        ) : (
          <div className="playlist-cover" style={{ background: 'linear-gradient(135deg, var(--tuneflow-green, #1ed760) 0%, #062610 100%)' }}>
            <AudioWaveform size={80} className="animate-pulse" />
          </div>
        )}
        <div className="playlist-details">
          <span className="playlist-type">Playlist</span>
          <h1 className="playlist-title">
            {isLikedView ? 'Liked Songs' : isMostPlayedView ? 'Most Played' : 'TuneFlow'}
          </h1>
          <div className="playlist-meta">
            <span className="playlist-owner">{isLikedView || isMostPlayedView ? 'TuneFlow' : 'Personal Music Streaming Platform'}</span>
            <span>•</span>
            <span>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</span>
          </div>
        </div>
      </div>

      {/* Playlist Controls & Songs list */}
      <div className="songs-section">
        <div className="toolbar">
          <div className="toolbar-left">
            <button
              className="control-btn-play"
              style={{ width: '56px', height: '56px' }}
              onClick={handlePlayAllClick}
              disabled={filteredSongs.length === 0}
              title="Play playlist"
            >
              {activeTrack && isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" style={{ marginLeft: '4px' }} />}
            </button>
          </div>

          {/* Search bar */}
          <div className="search-box">
            <Search size={18} className="text-tuneflow-gray" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by title or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Songs List Table */}
        {filteredSongs.length === 0 ? (
          <div className="empty-state">
            <Music size={48} />
            <h3 className="empty-state-title">No songs found</h3>
            <p className="empty-state-text">
              {songs.length === 0
                ? 'Your music library is currently empty. Use the Upload button in the sidebar to add your favorite tracks!'
                : 'No tracks match your search criteria. Try a different query!'}
            </p>
          </div>
        ) : (
          <div>
            <div className="table-header">
              <div>#</div>
              <div>Title</div>
              <div>Artist</div>
              <div style={{ textAlign: 'right' }}><Clock size={16} style={{ display: 'inline-block' }} /></div>
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '12px' }}>
              {filteredSongs.map((song, index) => {
                const isActive = activeTrack && activeTrack.id === song.id;
                return (
                  <div
                    key={song.id}
                    className={`song-row ${isActive ? 'active' : ''}`}
                    onClick={() => handleRowClick(song)}
                  >
                    {/* Index or Play button state */}
                    <div className="song-index">
                      <span className="song-index-num" style={{ display: isActive && isPlaying ? 'none' : 'block' }}>
                        {index + 1}
                      </span>
                      {/* Equalizer animation when playing */}
                      {isActive && isPlaying && (
                        <div className="eq-bars" style={{ display: 'flex' }}>
                          <div className="eq-bar"></div>
                          <div className="eq-bar"></div>
                          <div className="eq-bar"></div>
                          <div className="eq-bar"></div>
                        </div>
                      )}
                      <div className="song-play-hover">
                        {isActive && isPlaying ? (
                          <Pause size={16} fill="white" />
                        ) : (
                          <Play size={16} fill="white" />
                        )}
                      </div>
                    </div>

                    {/* Title cell */}
                    <div className="song-title-section">
                      <div className="song-thumbnail" style={{ padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {song.coverImage ? (
                          <img
                            src={`/songs/cover/${song.id}`}
                            alt={song.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              // If image fails to load, replace it with a music icon
                              e.target.style.display = 'none';
                              e.target.parentNode.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-music"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
                            }}
                          />
                        ) : (
                          <Music size={16} />
                        )}
                      </div>
                      <div>
                        <div className="song-title-text">{song.title}</div>
                        {/* Hidden on desktop, visible on mobile to show artist stacked */}
                        <div className="song-title-responsive-artist">
                          {song.artist} • {song.plays || 0} plays
                        </div>
                      </div>
                    </div>

                    {/* Artist cell (hidden on mobile) */}
                    <div className="song-artist-cell song-artist-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ color: 'var(--tuneflow-white)' }}>{song.artist}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--tuneflow-gray)' }}>{song.plays || 0} plays</span>
                    </div>

                    {/* Duration cell (hidden on mobile) */}
                    <div className="song-duration-cell song-duration-text" style={{ textAlign: 'right', color: '#b3b3b3', fontSize: '0.9rem' }}>
                      {song.duration || '0:00'}
                    </div>

                    {/* Action trigger */}
                    <div className="song-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <button
                        className="row-play-btn"
                        style={{ color: song.favorite ? 'var(--tuneflow-green)' : 'inherit' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(song.id);
                        }}
                        title={song.favorite ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
                      >
                        <Heart size={16} fill={song.favorite ? 'var(--tuneflow-green)' : 'none'} />
                      </button>
                      <button
                        className="row-play-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isActive) {
                            onTogglePlay();
                          } else {
                            onSelectTrack(song);
                          }
                        }}
                      >
                        {isActive && isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button
                        className="row-play-btn delete-btn-hover"
                        style={{ color: 'var(--tuneflow-light-gray)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTrack(song.id);
                        }}
                        title="Delete track"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
