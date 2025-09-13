'use client';

export default function DownloadSection({ onBack }) {
  return (
    <div className="download-section">
      <div className="spinner"></div>
      <div className="download-status">Preparing your download...</div>
      <p>Your download has started in your browser. Check chrome://downloads/ for progress.</p>
      <button className="back-btn" onClick={onBack} style={{ margin: '20px auto 0' }}>
        <i className="fas fa-arrow-left"></i> Back to Download
      </button>
    </div>
  );
}