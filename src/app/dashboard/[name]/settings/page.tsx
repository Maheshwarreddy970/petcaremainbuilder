import { notFound } from "next/navigation";
import { getWebsiteData } from "@/lib/get-website";
import ClientSettings from "./ClientSettings";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const data = await getWebsiteData(name);

  if (!data) {
    return notFound();
  }

  // 🔥 FIX: Pass data.settings, not websiteOneData!
  return <ClientSettings slug={name} settingsData={data.settings || {}} clientName={data.clientName || name} />;
}