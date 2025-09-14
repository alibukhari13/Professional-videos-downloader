export const dynamic = 'force-dynamic'; // Allow dynamic response

export async function GET() {
  return new Response(JSON.stringify({ status: 'healthy' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}