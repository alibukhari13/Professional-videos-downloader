import { spawn } from 'child_process';
import { sanitizeFilename } from '../../../utils/utils';

export async function POST(req) {
  const body = await req.formData();
  const url = body.get('url');
  const itag = body.get('itag');
  const title = body.get('title') || 'video';

  if (!url || !itag) {
    return new Response(JSON.stringify({ error: 'URL or format (itag) missing!' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const finalFormat = itag.includes('+') ? itag : `${itag}+bestaudio/best`;

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${sanitizeFilename(title)}.mp4"`);
    headers.set('Content-Type', 'video/mp4');
    headers.set('Transfer-Encoding', 'chunked');
    headers.set('Cache-Control', 'no-cache');
    headers.set('Connection', 'keep-alive');

    let isStreamActive = true;

    const readableStream = new ReadableStream({
      start(controller) {
        const args = [
          url,
          '-f', finalFormat,
          '--remux-video', 'mp4',
          '-o', '-',
          '--no-part',
          '--no-mtime',
          '--no-progress',
          '--buffer-size', '64k',
          '--no-warnings',
          '--no-check-certificates',
          '--ignore-errors',
          '--no-playlist',
          '--force-overwrites',
          '--retry-sleep', '2',
        ];

        const ytDlp = spawn('yt-dlp', args);

        ytDlp.stdout.on('data', (chunk) => {
          if (isStreamActive) {
            controller.enqueue(chunk);
          }
        });

        ytDlp.stderr.on('data', (data) => {
          const output = data.toString();
          if (output.includes('ERROR') || output.includes('error')) {
            isStreamActive = false;
            controller.error(new Error(`yt-dlp error: ${output}`));
            ytDlp.kill('SIGTERM');
          }
        });

        ytDlp.on('close', (code) => {
          if (isStreamActive) {
            isStreamActive = false;
            if (code === 0) {
              controller.close();
            } else {
              controller.error(new Error(`yt-dlp exited with code ${code}`));
            }
          }
        });

        ytDlp.on('error', (err) => {
          isStreamActive = false;
          controller.error(err);
          ytDlp.kill('SIGTERM');
        });

        req.signal?.addEventListener('abort', () => {
          isStreamActive = false;
          ytDlp.kill('SIGTERM');
          controller.close();
        });
      },
      cancel() {
        isStreamActive = false;
        ytDlp?.kill('SIGTERM');
      },
    });

    return new Response(readableStream, { headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Download failed: ' + err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}