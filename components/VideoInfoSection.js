'use client';

import { useState, useEffect } from 'react';
import { secondsToTime, formatNumber, formatDate } from '../utils/utils';

export default function VideoInfoSection({ videoData, onDownload, onBack }) {
  const [descriptionClamped, setDescriptionClamped] = useState(true);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [isThumbnailLoaded, setIsThumbnailLoaded] = useState(false);

  useEffect(() => {
    console.log('Video Data:', videoData); // Debugging
    const descriptionElem = document.getElementById('videoDescription');
    if (descriptionElem && descriptionElem.scrollHeight > descriptionElem.clientHeight) {
      setShowSeeMore(true);
    }
  }, [videoData]);

  const toggleDescription = () => {
    setDescriptionClamped(!descriptionClamped);
  };

  return (
    <div className="video-info-section">
      <button className="back-btn" onClick={onBack}>
        <i className="fas fa-arrow-left"></i> Back
      </button>

      <div className="video-details">
        <div className="thumbnail-container">
          {!isThumbnailLoaded && (
            <div className="thumbnail-placeholder">Loading thumbnail...</div>
          )}
          <img
            className={`thumbnail ${isThumbnailLoaded ? 'loaded' : ''}`}
            src={videoData.thumbnail || 'https://via.placeholder.com/240x135'}
            alt="Video thumbnail"
            onLoad={() => setIsThumbnailLoaded(true)}
            onError={() => setIsThumbnailLoaded(false)}
          />
        </div>
        <div className="video-info">
          <h3>{videoData.title}</h3>
          <div className="video-meta">
            <div className="meta-item">
              <i className="fas fa-clock"></i> Duration: {secondsToTime(videoData.duration)}
            </div>
            <div className="meta-item">
              <i className="fas fa-eye"></i> Views: {formatNumber(videoData.views)}
            </div>
            <div className="meta-item">
              <i className="fas fa-calendar"></i> Uploaded: {formatDate(videoData.date)}
            </div>
          </div>
          <p
            id="videoDescription"
            className={`video-description ${descriptionClamped ? 'clamped' : ''}`}
          >
            {videoData.description}
          </p>
          <button
            className="see-more-btn"
            onClick={toggleDescription}
            style={{ display: showSeeMore && descriptionClamped ? 'block' : 'none' }}
          >
            See more
          </button>
          <button
            className="see-less-btn"
            onClick={toggleDescription}
            style={{ display: !descriptionClamped ? 'block' : 'none' }}
          >
            See less
          </button>
        </div>
      </div>

      <h2 style={{ marginBottom: '20px', textAlign: 'center', color: 'var(--secondary)' }}>
        Available Formats
      </h2>

      <div className={`format-options ${videoData.formats?.length ? 'loaded' : ''}`}>
        {videoData.formats && videoData.formats.length > 0 ? (
          videoData.formats.map((format, index) => (
            <div key={index} className="format-option" style={{ '--delay': index }}>
              <h4>{format.quality}</h4>
              <div className="format-details">
                <p>Format: {format.container} {format.hasAudio ? 'with Video & Audio' : 'Video Only'}</p>
                <p>Size: {format.size}</p>
              </div>
              <button className="download-btn" onClick={() => onDownload(format.itag)}>
                <i className="fas fa-download"></i> Download
              </button>
            </div>
          ))
        ) : (
          <p>No formats available. Please try another video.</p>
        )}
      </div>
    </div>
  );
}