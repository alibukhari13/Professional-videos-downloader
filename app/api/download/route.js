import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function POST(req) {
  const { url, formatId } = await req.json();
  if (!url || !formatId) return new Response(JSON.stringify({ error: "URL and format required" }), { status: 400 });

  try {
    const { stdout } = await execPromise(`/opt/venv/bin/yt-dlp -f ${formatId} -o - "${url}"`);
    const buffer = Buffer.from(stdout, "binary");
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="video.mp4"`,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new Response(JSON.stringify({ error: "Download failed" }), { status: 500 });
  }
}