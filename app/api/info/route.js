import { spawn } from 'child_process';
import { formatVideoData } from '../../../utils/utils';

export async function POST(req) {
  const body = await req.json();
  const { url } = body;
  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return new Response(JSON.stringify({ error: 'Invalid YouTube URL' }), { status: 400 });
  }

  let normalizedUrl = url;
  if (url.includes('/shorts/')) {
    normalizedUrl = url.replace('/shorts/', '/watch?v=');
  }

  try {
    const info = await new Promise((resolve, reject) => {
      const args = [
        normalizedUrl,
        '--dump-single-json',
        '--no-warnings',
        '--no-call-home',
        '--no-check-certificates',
        '--ignore-errors',
        '--no-playlist',
        '--get-thumbnail'
      ];
      const ytDlp = spawn('yt-dlp', args);
      let stdout = '';
      let stderr = '';
      ytDlp.stdout.on('data', (data) => stdout += data.toString());
      ytDlp.stderr.on('data', (data) => stderr += data.toString());
      ytDlp.on('close', (code) => {
        if (code === 0) {
          try {
            const cleanOutput = stdout.trim().split('\n').pop();
            const parsed = JSON.parse(cleanOutput);
            resolve(parsed);
          } catch (e) {
            console.error('Parse Error:', e.message, 'Stdout:', stdout);
            reject(new Error('Failed to parse yt-dlp output'));
          }
        } else {
          console.error('yt-dlp Error:', stderr);
          reject(new Error(`yt-dlp failed with code ${code}: ${stderr}`));
        }
      });
      ytDlp.on('error', (err) => {
        console.error('Spawn Error:', err.message);
        reject(err);
      });
    });
    const videoData = formatVideoData(info);
    return new Response(JSON.stringify(videoData), { status: 200 });
  } catch (err) {
    console.error('API Error:', err.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch video information: ' + err.message }), { status: 500 });
  }
}