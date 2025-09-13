export default function ErrorSection({ message, onRetry }) {
  return (
    <div className="error-section">
      <h2>Error Occurred</h2>
      <p className="error-message">{message}</p>
      <button className="download-btn" onClick={onRetry}>
        <i className="fas fa-redo"></i> Try Again
      </button>
    </div>
  );
}