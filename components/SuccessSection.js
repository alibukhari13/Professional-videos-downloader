export default function SuccessSection({ onNewDownload }) {
  return (
    <div className="success-section">
      <i className="fas fa-check-circle"></i>
      <h2>Download Started!</h2>
      <p>Your download has started. Check your browsers download manager (chrome://downloads/) to monitor progress.</p>
      <button className="back-btn" onClick={onNewDownload}>
        <i className="fas fa-redo"></i> Download Another Video
      </button>
    </div>
  );
}