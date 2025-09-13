export function secondsToTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 3600 % 60);
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
}

export function formatDate(dateStr) {
  if (!dateStr || dateStr === 'Unknown') return 'Unknown';
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  const date = new Date(year, month - 1, day);
  return isNaN(date) ? 'Unknown' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function sanitizeFilename(title) {
  return title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) + '.mp4';
}

export function formatVideoData(info) {
  const formats = info.formats || [];
  let formatList = [];

  const thumbnail = info.thumbnails && info.thumbnails.length > 0
    ? info.thumbnails.reduce((best, thumb) => {
        const bestRes = parseInt(best.resolution || '0') || 0;
        const thumbRes = parseInt(thumb.resolution || '0') || 0;
        return thumbRes > bestRes ? thumb : best;
      }).url || 'https://via.placeholder.com/240x135'
    : 'https://via.placeholder.com/240x135';

  formats.forEach(f => {
    if (f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none') {
      const quality = f.height ? `${f.height}p` : (f.format_note || 'Unknown');
      const filesize = f.filesize || f.filesize_approx || null;
      const sizeMB = filesize ? (filesize / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown';
      formatList.push({
        quality: quality,
        container: f.ext || 'mp4',
        itag: f.format_id,
        size: sizeMB,
        hasAudio: true
      });
    }
  });

  const videoOnlyFormats = formats.filter(f => f.vcodec && f.vcodec !== 'none' && (!f.acodec || f.acodec === 'none'));
  const audioOnlyFormats = formats.filter(f => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none'));

  videoOnlyFormats.forEach(video => {
    audioOnlyFormats.forEach(audio => {
      const quality = video.height ? `${video.height}p` : (video.format_note || 'Unknown');
      const vSize = video.filesize || video.filesize_approx || 0;
      const aSize = audio.filesize || audio.filesize_approx || 0;
      const sizeMB = (vSize + aSize) ? ((vSize + aSize) / (1024 * 1024)).toFixed(2) + ' MB' : 'Unknown';
      formatList.push({
        quality: quality,
        container: 'mp4',
        itag: `${video.format_id}+${audio.format_id}`,
        size: sizeMB,
        hasAudio: true
      });
    });
  });

  formatList = [...new Map(formatList.map(f => [f.quality, f])).values()];
  formatList.sort((a, b) => {
    const aQuality = parseInt(a.quality.replace('p', '')) || 0;
    const bQuality = parseInt(b.quality.replace('p', '')) || 0;
    return bQuality - aQuality;
  });

  if (formatList.length === 0) {
    formatList = [
      { quality: '144p', container: 'mp4', itag: '17', size: 'Unknown', hasAudio: true },
      { quality: '360p', container: 'mp4', itag: '18', size: 'Unknown', hasAudio: true },
      { quality: '720p', container: 'mp4', itag: '22', size: 'Unknown', hasAudio: true },
      { quality: '1080p', container: 'mp4', itag: '137+140', size: 'Unknown', hasAudio: true }
    ];
  }

  return {
    title: info.title || 'Unknown Title',
    thumbnail: thumbnail,
    duration: info.duration || 0,
    views: info.view_count || 0,
    date: info.upload_date || 'Unknown',
    description: info.description || 'No description available',
    formats: formatList
  };
}