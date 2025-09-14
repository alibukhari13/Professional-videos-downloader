'use client';

import { useState, useRef } from 'react';
import InputSection from '../components/InputSection';
import LoadingSection from '../components/LoadingSection';
import VideoInfoSection from '../components/VideoInfoSection';
import DownloadSection from '../components/DownloadSection';
import SuccessSection from '../components/SuccessSection';
import ErrorSection from '../components/ErrorSection';
import { sanitizeFilename } from '../utils/utils';

export default function Home() {
  const [section, setSection] = useState('input');
  const [videoData, setVideoData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [serverUrl, setServerUrl] = useState('http://localhost:3000');
  const iframeRef = useRef(null);
  const formRef = useRef(null);

  const getVideoInfo = async (url, srvUrl) => {
    setVideoUrl(url);
    setServerUrl(srvUrl);
    setSection('loading');
    try {
      const res = await fetch(`${srvUrl}/api/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch video info');
      }
      const data = await res.json();
      setVideoData(data);
      setSection('videoInfo');
    } catch (err) {
      setErrorMsg(err.message);
      setSection('error');
    }
  };

  const startDownload = async (itag) => {
    setSection('download');

    // Clean up any existing iframe or form
    if (iframeRef.current) {
      try {
        document.body.removeChild(iframeRef.current);
      } catch (e) {}
    }
    if (formRef.current) {
      try {
        document.body.removeChild(formRef.current);
      } catch (e) {}
    }

    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = 'download-frame';
    document.body.appendChild(iframe);
    iframeRef.current = iframe;

    // Create form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${serverUrl}/api/download`;
    form.target = 'download-frame';
    form.style.display = 'none';

    // Add inputs
    const urlInput = document.createElement('input');
    urlInput.type = 'hidden';
    urlInput.name = 'url';
    urlInput.value = videoUrl;
    form.appendChild(urlInput);

    const itagInput = document.createElement('input');
    itagInput.type = 'hidden';
    itagInput.name = 'itag';
    itagInput.value = itag;
    form.appendChild(itagInput);

    const titleInput = document.createElement('input');
    titleInput.type = 'hidden';
    titleInput.name = 'title';
    titleInput.value = sanitizeFilename(videoData.title);
    form.appendChild(titleInput);

    document.body.appendChild(form);
    formRef.current = form;

    // Submit form
    form.submit();

    // Monitor iframe for response
    iframe.onload = async () => {
      try {
        // Try to fetch response status from the iframe
        const responseText = iframe.contentWindow.document.body.textContent;
        if (responseText && responseText.includes('error')) {
          const errorData = JSON.parse(responseText);
          setErrorMsg(errorData.error || 'Download failed');
          setSection('error');
          cleanup();
          return;
        }
        // Check if download started by making a small HEAD request to /api/download
        const checkRes = await fetch(`${serverUrl}/api/download`, { method: 'HEAD' });
        if (checkRes.ok) {
          setTimeout(() => {
            setSection('success');
            cleanup();
          }, 2000);
        } else {
          setErrorMsg('Download failed: Server error');
          setSection('error');
          cleanup();
        }
      } catch (e) {
        // Cross-origin error is expected for successful downloads
        setTimeout(() => {
          setSection('success');
          cleanup();
        }, 2000);
      }
    };

    // Fallback timeout for stalled downloads
    setTimeout(() => {
      if (section === 'download') {
        setErrorMsg('Download timed out. Please try again.');
        setSection('error');
        cleanup();
      }
    }, 10000);

    function cleanup() {
      try {
        if (formRef.current) document.body.removeChild(formRef.current);
        if (iframeRef.current) document.body.removeChild(iframeRef.current);
        formRef.current = null;
        iframeRef.current = null;
      } catch (e) {}
    }
  };

  const resetToInput = () => {
    setSection('input');
    setVideoData(null);
    setErrorMsg('');
    setVideoUrl('');
    try {
      if (formRef.current) document.body.removeChild(formRef.current);
      if (iframeRef.current) document.body.removeChild(iframeRef.current);
      formRef.current = null;
      iframeRef.current = null;
    } catch (e) {}
  };

  const testServer = async (srvUrl, setStatusText, setStatusClass) => {
    setSection('loading');
    try {
      const res = await fetch(`${srvUrl}/api/health`);
      if (res.ok) {
        setStatusText('Online');
        setStatusClass('server-online');
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      setStatusText('Offline');
      setStatusClass('server-offline');
    }
    setSection('input');
  };

  return (
    <>
      <header>
        <div className="logo">
          <i className="fab fa-youtube"></i>
        </div>
        <h1>Professional YouTube Downloader</h1>
        <p>Download YouTube videos and Shorts in high quality with audio</p>
      </header>
      <div className="container">
        {section === 'input' && <InputSection onGetInfo={getVideoInfo} onTestServer={testServer} />}
        {section === 'loading' && <LoadingSection />}
        {section === 'videoInfo' && <VideoInfoSection videoData={videoData} onDownload={startDownload} onBack={resetToInput} />}
        {section === 'download' && <DownloadSection onBack={resetToInput} />}
        {section === 'success' && <SuccessSection onNewDownload={resetToInput} />}
        {section === 'error' && <ErrorSection message={errorMsg} onRetry={() => getVideoInfo(videoUrl, serverUrl)} />}
      </div>
      <footer>
        <p>Download YouTube videos and Shorts in high quality with audio</p>
      </footer>
    </>
  );
}