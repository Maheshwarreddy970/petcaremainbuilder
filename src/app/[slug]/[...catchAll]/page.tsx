import { permanentRedirect } from "next/navigation";

// 🔥 Cache the redirects permanently too!
export const revalidate = 31536000;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default function CatchAllRoutes() {
  permanentRedirect("/");
}