import { exec } from "child_process";

export async function POST(req) {
  const { url } = await req.json();
  if (!url) return new Response(JSON.stringify({ error: "No URL provided" }), { status: 400 });

  try {
    const info = await new Promise((resolve, reject) => {
      exec(`/opt/venv/bin/yt-dlp --skip-download --dump-json "${url}"`, (error, stdout) => {
        if (error) reject(error);
        else resolve(JSON.parse(stdout));
      });
    });
    return new Response(JSON.stringify(info), {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error("yt-dlp error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch video info" }), { status: 500 });
  }
}