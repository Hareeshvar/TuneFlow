import React, { useState, useRef } from 'react';
import { X, Upload, FileAudio, CheckCircle, AlertTriangle } from 'lucide-react';

export default function UploadModal({ onClose, onUploadSuccess }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [file, setFile] = useState(null);
  const [cover, setCover] = useState(null);
  const [calculatedDuration, setCalculatedDuration] = useState('');
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError('');
      setLoadingMetadata(true);
      
      // Extract audio duration
      const objectUrl = URL.createObjectURL(selectedFile);
      const tempAudio = new Audio(objectUrl);
      
      tempAudio.addEventListener('loadedmetadata', () => {
        const durationSecs = tempAudio.duration;
        if (!isNaN(durationSecs)) {
          const minutes = Math.floor(durationSecs / 60);
          const seconds = Math.floor(durationSecs % 60);
          const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
          setCalculatedDuration(formattedDuration);
        }
        setLoadingMetadata(false);
        URL.revokeObjectURL(objectUrl);
      });

      tempAudio.addEventListener('error', (err) => {
        console.error("Failed to load audio metadata", err);
        setCalculatedDuration('0:00');
        setLoadingMetadata(false);
        URL.revokeObjectURL(objectUrl);
      });
    }
  };

  const handleCoverChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCover(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const triggerCoverSelect = () => {
    coverInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setError('');
      setLoadingMetadata(true);

      const objectUrl = URL.createObjectURL(droppedFile);
      const tempAudio = new Audio(objectUrl);
      
      tempAudio.addEventListener('loadedmetadata', () => {
        const durationSecs = tempAudio.duration;
        if (!isNaN(durationSecs)) {
          const minutes = Math.floor(durationSecs / 60);
          const seconds = Math.floor(durationSecs % 60);
          const formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
          setCalculatedDuration(formattedDuration);
        }
        setLoadingMetadata(false);
        URL.revokeObjectURL(objectUrl);
      });

      tempAudio.addEventListener('error', (err) => {
        setCalculatedDuration('0:00');
        setLoadingMetadata(false);
        URL.revokeObjectURL(objectUrl);
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a song title');
      return;
    }
    if (!artist.trim()) {
      setError('Please enter an artist name');
      return;
    }
    if (!file) {
      setError('Please select an audio file');
      return;
    }
    if (loadingMetadata) {
      setError('Analyzing audio duration, please wait a moment...');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('artist', artist.trim());
    formData.append('duration', calculatedDuration || '0:00');
    if (cover) {
      formData.append('cover', cover);
    }

    // Use standard XMLHttpRequest to support upload progress tracking
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/songs/upload', true);

    // Track upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentCompleted = Math.round((event.loaded * 100) / event.total);
        setProgress(percentCompleted);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Success
        setTitle('');
        setArtist('');
        setFile(null);
        setProgress(100);
        setTimeout(() => {
          setUploading(false);
          onUploadSuccess(); // Triggers playlist refresh & notification
          onClose();
        }, 600);
      } else {
        // Error response
        console.error('Server upload failed:', xhr.responseText);
        setError(`Upload failed (Server returned status ${xhr.status})`);
        setUploading(false);
      }
    };

    xhr.onerror = () => {
      console.error('Network upload error');
      setError('Upload failed due to a network connection error.');
      setUploading(false);
    };

    xhr.send(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Upload Track</h2>
          <button className="close-btn" onClick={onClose} disabled={uploading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 83, 80, 0.1)',
                border: '1px solid #ef5350',
                color: '#ef5350',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Song Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Arasan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Artist</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Anirudh"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Audio File</label>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="audio/*"
              onChange={handleFileChange}
              disabled={uploading}
            />

            <div
              className={`file-dropzone ${file ? 'file-selected' : ''}`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={!uploading ? triggerFileSelect : undefined}
            >
              <Upload size={32} className="file-dropzone-icon" />
              {file ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="file-selected-name">{file.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#b3b3b3' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to change file
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Choose an audio file or drag it here</span>
                  <span className="file-dropzone-text">Supports MP3, M4A, WAV, etc.</span>
                </div>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label">Album Artwork (Optional)</label>
            <input
              type="file"
              ref={coverInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleCoverChange}
              disabled={uploading}
            />

            <div
              className={`file-dropzone ${cover ? 'file-selected' : ''}`}
              onClick={!uploading ? triggerCoverSelect : undefined}
              style={{ padding: '16px', minHeight: '80px' }}
            >
              <Upload size={20} className="file-dropzone-icon" />
              {cover ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="file-selected-name">{cover.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#b3b3b3' }}>
                    {(cover.size / 1024).toFixed(1)} KB • Click to change cover
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Select cover image (PNG, JPG, GIF)</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Section */}
          {uploading && (
            <div className="upload-progress-container">
              <div className="upload-progress-text">
                <span>{progress === 100 ? 'Saving to Database...' : 'Uploading Track...'}</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill-bar" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={uploading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? (
                <>
                  <span className="animate-spin" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid black', borderTopColor: 'transparent', borderRadius: '50%' }}></span>
                  <span>Uploading...</span>
                </>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
