'use client';

import { useState, useEffect } from 'react';

export default function InputSection({ onGetInfo, onTestServer }) {
  const [url, setUrl] = useState('');
  const [serverUrl, setServerUrl] = useState('http://localhost:3000');
  const [isVercel, setIsVercel] = useState(false);
  const [serverStatusText, setServerStatusText] = useState('');
  const [serverStatusClass, setServerStatusClass] = useState('');

  useEffect(() => {
    const hostname = window.location.hostname;
    setIsVercel(hostname.includes('vercel.app'));
    if (hostname.includes('vercel.app')) {
      setServerUrl(window.location.origin);
    }
    const savedServerUrl = localStorage.getItem('serverUrl');
    if (savedServerUrl) {
      setServerUrl(savedServerUrl);
    }
  }, []);

  const handleTestServer = () => {
    onTestServer(serverUrl, setServerStatusText, setServerStatusClass);
  };

  const handleServerUrlChange = (e) => {
    const newServerUrl = e.target.value;
    setServerUrl(newServerUrl);
    localStorage.setItem('serverUrl', newServerUrl);
  };

  return (
    <div className="input-section">
      <div className="vercel-notice" style={{ display: isVercel ? 'block' : 'none' }}>
        <i className="fas fa-info-circle"></i> 
        <span>Using Vercel deployment. Server functions may be limited.</span>
      </div>
      
      <div className="url-input-container">
        <input 
          type="text" 
          className="url-input" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="Paste YouTube or Shorts URL here..." 
        />
        <button className="get-info-btn" onClick={() => onGetInfo(url, serverUrl)}>Get Info</button>
      </div>
     
      <div className="server-url-container">
        <input 
          type="text" 
          className="server-url-input" 
          value={serverUrl} 
          onChange={handleServerUrlChange} 
          placeholder="Enter your server URL (optional)" 
        />
        <button className="server-test-btn" onClick={handleTestServer}>Test Server</button>
        <span className={`server-status ${serverStatusClass}`}>{serverStatusText}</span>
      </div>
     
      <div className="shorts-notice">
        <i className="fas fa-info-circle"></i> YouTube Shorts are fully supported!
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <i className="fas fa-bolt"></i>
          <h3>Fast Downloads</h3>
          <p>Download videos quickly with our optimized system</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-film"></i>
          <h3>High Quality</h3>
          <p>Get the best available quality for your videos</p>
        </div>
        <div className="feature-card">
          <i className="fas fa-music"></i>
          <h3>Audio Included</h3>
          <p>All downloads include high-quality audio</p>
        </div>
      </div>
      
      <div className="instructions">
        <h2>How to Use</h2>
        <ol>
          <li>Paste a YouTube URL in the input field above</li>
          <li>Click Get Info to fetch video details</li>
          <li>Select your preferred format and quality</li>
          <li>Click Download to start your download</li>
        </ol>
      </div>
    </div>
  );
}