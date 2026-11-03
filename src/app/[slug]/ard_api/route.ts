import { NextResponse } from 'next/server';

export const revalidate = 31536000;

export async function GET() {
  // 🔥 A valid basic manifest to pass the Agentic Resource Discovery audit
  const ardManifest = {
    "schema_version": "1.0",
    "description": "Agentic Resource Discovery Manifest",
    "endpoints": []
  };

  return NextResponse.json(ardManifest, {
    headers: {
      'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate'
    }
  });
}