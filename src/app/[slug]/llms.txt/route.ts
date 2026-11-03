import { NextResponse } from 'next/server';
import { getWebsiteData } from "@/lib/get-website";

export const revalidate = 31536000; // Cache for 1 year

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getWebsiteData(slug);
  
  if (!data) return new NextResponse('Not Found', { status: 404 });
  
  const domain = data.customDomain ? `https://${data.customDomain}` : `https://${slug}.nexpetcare.com`;
  const businessName = data.settings?.businessName || data.clientName || slug;

  // 🔥 AI Agents require a Markdown H1 (#) and at least one Markdown link
  const content = `# ${businessName} - AI Agent Guide

This is the official website for ${businessName}. We offer professional pet grooming services.

## Important Links
- [Home](${domain}/)
- [Contact](${domain}/#contact)
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=31536000, stale-while-revalidate'
    }
  });
}