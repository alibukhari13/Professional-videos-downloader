export default function LoadingSection() {
  return (
    <div className="loading-section">
      <div className="spinner"></div>
      <div className="loading-text">Fetching video details...</div>
      <div className="network-status"></div>
    </div>
  );
}