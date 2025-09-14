"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [section, setSection] = useState("input");
  const [downloadUrl, setDownloadUrl] = useState("");
  const isDemoMode = false; // Real downloads only

  const getVideoInfo = async () => {
    if (!url) return alert("Please enter a YouTube URL");
    try {
      const res = await fetch("/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Failed to fetch info");
      const data = await res.json();
      setVideoData(data);
      setSection("videoInfo");
    } catch (error) {
      alert("Error fetching video info: " + error.message);
    }
  };

  const startDownload = async (formatId) => {
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, formatId }),
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      setDownloadUrl(downloadUrl);
      setSection("download");
    } catch (error) {
      alert("Error starting download: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Professional YouTube Downloader</h1>
      <p>Download YouTube videos and Shorts in high quality with audio</p>
      <p>YouTube Shorts are fully supported!</p>

      {section === "input" && (
        <div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL here"
            style={{ width: "100%", padding: "10px", margin: "10px 0" }}
          />
          <button
            onClick={getVideoInfo}
            style={{ padding: "10px 20px", background: "#0070f3", color: "white", border: "none" }}
          >
            Get Info
          </button>
        </div>
      )}

      {section === "videoInfo" && videoData && (
        <div>
          <h2>{videoData.title}</h2>
          <img src={videoData.thumbnail} alt={videoData.title} style={{ maxWidth: "100%" }} />
          <h3>Available Formats:</h3>
          <ul>
            {videoData.formats.map((format) => (
              <li key={format.format_id}>
                {format.format_id} - {format.format_note} ({format.ext})
                <button
                  onClick={() => startDownload(format.format_id)}
                  style={{ marginLeft: "10px", padding: "5px 10px" }}
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {section === "download" && downloadUrl && (
        <div>
          <p>Download started! Click below to save:</p>
          <a href={downloadUrl} download="video.mp4" style={{ color: "#0070f3" }}>
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}