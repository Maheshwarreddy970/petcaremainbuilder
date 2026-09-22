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

  if (!data) return notFound();

  // 🔥 Pass template data so we can extract Navbar links for the Google Sitelinks Preview
  const templateData = data.template === "websiteOne" ? data.websiteOneData : data.websiteTwoData;

  return (
    <ClientSettings 
      slug={name} 
      settingsData={data.settings || {}} 
      clientName={data.clientName || name} 
      websiteData={templateData || {}} 
    />
  );
}