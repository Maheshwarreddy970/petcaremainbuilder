import { MetadataRoute } from 'next';
import { getWebsiteData } from "@/lib/get-website";

export default async function sitemap({ params }: { params: { slug: string } }): Promise<MetadataRoute.Sitemap> {
  const { slug } = params;
  
  // Fetch data to see if custom domain exists
  const data = await getWebsiteData(slug);
  
  if (!data) return [];

  const domain = data.customDomain 
    ? `https://${data.customDomain}` 
    : `https://${slug}.nexpetcare.online`;

  return [
    {
      url: domain,
      lastModified: data.lastUpdated ? new Date(data.lastUpdated) : new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    }
    // If you ever add multi-page routing (like /about, /services), you map them here automatically!
  ];
}