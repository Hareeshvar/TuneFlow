import React, { useContext } from 'react';
import { Home, Search, Library, Plus, Music, Volume2, Heart, BarChart2, Headphones, X, LogIn } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar({ songs, activeTrack, isPlaying, onSelectTrack, onOpenUpload, onOpenLogin, activeView, onViewChange, isOpen, onClose }) {
  const { isAdmin, logout, username } = useContext(AuthContext);
  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Mobile Header with Close Button */}
        <div className="sidebar-mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Headphones size={28} style={{ color: 'var(--tuneflow-green, #1ed760)' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff' }}>TuneFlow</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <X size={24} />
          </button>
        </div>

        {/* Branding Logo & Title */}
        <div className="sidebar-card sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px' }}>
          <Headphones size={28} style={{ color: 'var(--tuneflow-green, #1ed760)' }} />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff' }}>TuneFlow</span>
        </div>

      {/* Home / Liked Songs / Most Played Navigation */}
      <div className="sidebar-card sidebar-nav">
        <div className={`sidebar-link ${activeView === 'all' ? 'active' : ''}`} onClick={() => onViewChange('all')}>
          <Home size={20} />
          <span>Home</span>
        </div>
        <div className={`sidebar-link ${activeView === 'liked' ? 'active' : ''}`} onClick={() => onViewChange('liked')}>
          <Heart size={20} fill={activeView === 'liked' ? 'var(--tuneflow-green)' : 'none'} style={{ color: activeView === 'liked' ? 'var(--tuneflow-green)' : 'inherit' }} />
          <span>Liked Songs</span>
        </div>
        <div className={`sidebar-link ${activeView === 'most_played' ? 'active' : ''}`} onClick={() => onViewChange('most_played')}>
          <BarChart2 size={20} style={{ color: activeView === 'most_played' ? 'var(--tuneflow-green)' : 'inherit' }} />
          <span>Most Played</span>
        </div>
        {isAdmin() ? (
          <>
            <div className="sidebar-link admin-user-info" style={{ color: 'var(--tuneflow-green)', cursor: 'default' }}>
              <span>👑 {username}</span>
            </div>
            <div className="sidebar-link logout-btn" onClick={() => { logout(); if(onClose) onClose(); }} style={{ color: '#ef5350' }}>
              <X size={20} />
              <span>Logout</span>
            </div>
          </>
        ) : (
          <div className="sidebar-link login-btn" onClick={() => { onOpenLogin(); if(onClose) onClose(); }}>
            <LogIn size={20} />
            <span>Admin Login</span>
          </div>
        )}
      </div>

      {/* Music Library Panel */}
      <div className="sidebar-card sidebar-library">
        <div className="library-header">
          <div className="library-title">
            <Library size={20} />
            <span>Your Library</span>
          </div>
          {isAdmin() && (
            <button className="upload-btn" onClick={onOpenUpload} title="Upload a new song">
              <Plus size={16} />
              <span>Upload</span>
            </button>
          )}
        </div>

        <div className="library-list">
          {songs.length === 0 ? (
            <div style={{ padding: '12px', color: '#a7a7a7', fontSize: '0.85rem', textAlign: 'center' }}>
              No songs uploaded yet. Click Upload to add music!
            </div>
          ) : (
            songs.map((song) => {
              const isActive = activeTrack && activeTrack.id === song.id;
              return (
                <div
                  key={song.id}
                  className={`library-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectTrack(song)}
                >
                  <div className="library-item-icon">
                    {isActive && isPlaying ? (
                      <Volume2 size={18} className="text-tuneflow-green animate-pulse" />
                    ) : (
                      <Music size={18} />
                    )}
                  </div>
                  <div className="library-item-details">
                    <div className="library-item-title" style={{ color: isActive ? '#1ed760' : '#ffffff' }}>
                      {song.title}
                    </div>
                    <div className="library-item-artist">{song.artist}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </aside>
    </>
  );
}
