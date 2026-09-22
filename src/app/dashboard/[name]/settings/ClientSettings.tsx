"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ArrowRightLeft, Plus, Trash2, Loader2, Globe, Settings as SettingsIcon, Image as ImageIcon, Upload } from "lucide-react";
import { saveWebsiteSettingsAction } from "@/actions/tenant";
import { uploadImageAction } from "@/actions/upload";

// --- DRAG AND DROP IMAGE UPLOADER ---
const ImageUploader = ({ label, src, isUploading, onUpload }: { label: string, src: string, isUploading: boolean, onUpload: (e: React.ChangeEvent<HTMLInputElement> | any) => void }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const mockEvent = { target: { files: e.dataTransfer.files } };
      onUpload(mockEvent);
    }
  };

  return (
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-semibold text-gray-700">{label}</label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full p-3 rounded-xl border-2 transition-all duration-200 ${isDragOver
          ? "border-blue-500 bg-blue-50/50 border-dashed scale-[1.02]"
          : "border-gray-200 bg-gray-50/50 border-solid"
          }`}
      >
        {src && (
          <img
            src={src}
            alt="Preview"
            className="w-full h-24 object-contain rounded-lg mb-3 border border-gray-200 bg-white shadow-sm pointer-events-none"
          />
        )}
        <label className={`flex items-center justify-center gap-2 w-full p-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer text-xs font-medium text-gray-700 transition-colors shadow-sm ${isDragOver ? "ring-2 ring-blue-500/20 text-blue-600 border-blue-300" : "hover:bg-gray-50"}`}>
          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {isUploading ? "Uploading..." : isDragOver ? "Drop image here!" : "Click or Drag Image"}
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={isUploading} />
        </label>
      </div>
    </div>
  );
};

// --- IOS STYLE TOGGLE ---
const Toggle = ({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (val: boolean) => void }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="pr-4">
      <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
      <p className="text-[13px] text-gray-500 mt-0.5">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

export default function ClientSettings({ slug, settingsData, clientName }: { slug: string, settingsData: any, clientName: string }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
  // 🔥 Correctly initializes from settingsData
  const [settings, setSettings] = useState({
    seoTitle: settingsData?.seoTitle || "",
    seoDescription: settingsData?.seoDescription || "",
    language: settingsData?.language || "en-US",
    keywords: settingsData?.keywords || "",

    accessibilityReducedMotion: settingsData?.accessibilityReducedMotion || false,
    preserveUrlParams: settingsData?.preserveUrlParams ?? true,
    rtlLayout: settingsData?.rtlLayout || false,
    autoLocale: settingsData?.autoLocale || false,

    faviconLight: settingsData?.faviconLight || "",
    faviconDark: settingsData?.faviconDark || "",
    ogImage: settingsData?.ogImage || "",
    appleTouchIcon: settingsData?.appleTouchIcon || "",

    googleAnalyticsId: settingsData?.googleAnalyticsId || "",
    googleReviewsId: settingsData?.googleReviewsId || "",
    redirects: settingsData?.redirects || []
  });

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveWebsiteSettingsAction(slug, settings);
    setIsSaving(false);
    if (res.success) {
      alert("Settings Saved Successfully!");
      router.refresh();
    } else {
      alert("Failed to save settings: " + res.error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement> | any, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(field);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadImageAction(formData);
      if (res.success) handleChange(field, res.url);
      else alert(`Upload failed: ${res.error}`);
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploadingImage(null);
    }
  };

  const defaultTitle = `${clientName} | NexPet Care`;

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32 font-sans text-gray-900">

      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/${slug}`} className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold">Site Settings</h1>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-70">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 mt-6 flex flex-col lg:flex-row gap-8">

        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          <button onClick={() => setActiveTab("general")} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === "general" ? "bg-white shadow-sm border border-gray-200 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}><Globe size={18} /> General & SEO</button>
          <button onClick={() => setActiveTab("images")} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === "images" ? "bg-white shadow-sm border border-gray-200 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}><ImageIcon size={18} /> Site Images</button>
          <button onClick={() => setActiveTab("advanced")} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === "advanced" ? "bg-white shadow-sm border border-gray-200 text-blue-600" : "text-gray-600 hover:bg-gray-100"}`}><SettingsIcon size={18} /> Advanced & Routing</button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-8">

          {/* ================= TAB 1: GENERAL & SEO ================= */}
          {activeTab === "general" && (
            <>
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold mb-6">Site SEO</h2>
                  <div className="grid grid-cols-1 gap-6">
                    
                    {/* SEO Title with Character Count */}
                    <div>
                      <div className="flex justify-between items-end mb-1.5">
                        <label className="text-sm font-semibold text-gray-700">SEO Title</label>
                        <span className={`text-[11px] font-medium ${settings.seoTitle.length > 60 ? "text-red-500" : "text-gray-400"}`}>{settings.seoTitle.length} / 60</span>
                      </div>
                      <input type="text" value={settings.seoTitle} onChange={e => handleChange("seoTitle", e.target.value)} placeholder={defaultTitle} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm" />
                      <div className="h-1 w-full bg-gray-100 mt-2 rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${settings.seoTitle.length === 0 ? "w-0" : settings.seoTitle.length <= 60 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${Math.min((settings.seoTitle.length / 60) * 100, 100)}%` }} />
                      </div>
                    </div>

                    {/* SEO Description with Character Count */}
                    <div>
                      <div className="flex justify-between items-end mb-1.5">
                        <label className="text-sm font-semibold text-gray-700">SEO Description</label>
                        <span className={`text-[11px] font-medium ${settings.seoDescription.length > 160 ? "text-red-500" : "text-gray-400"}`}>{settings.seoDescription.length} / 160</span>
                      </div>
                      <textarea rows={3} value={settings.seoDescription} onChange={e => handleChange("seoDescription", e.target.value)} placeholder="Provide a compelling description for search engines..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all text-sm resize-none" />
                      <div className="h-1 w-full bg-gray-100 mt-2 rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${settings.seoDescription.length === 0 ? "w-0" : settings.seoDescription.length <= 160 ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${Math.min((settings.seoDescription.length / 160) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Google Search Preview */}
                <div className="p-6 bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Google Search Preview</h3>
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm max-w-xl">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-100">
                        {settings.faviconLight ? <img src={settings.faviconLight} className="w-full h-full object-cover" /> : <Globe size={14} className="text-gray-400" />}
                      </div>
                      <div>
                        <p className="text-[13px] text-gray-900 leading-tight">nexpetcare.online</p>
                        <p className="text-[12px] text-gray-500 leading-tight">https://{slug}.nexpetcare.online</p>
                      </div>
                    </div>
                    <h3 className="text-[20px] text-[#1a0dab] font-medium leading-snug hover:underline cursor-pointer truncate mt-1">
                      {settings.seoTitle || defaultTitle}
                    </h3>
                    <p className="text-[14px] text-[#4d5156] mt-1 line-clamp-2 leading-snug">
                      {settings.seoDescription || "Provide a compelling description so customers click your link."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <Toggle label="Accessibility" description="Disable movement animations and custom cursors if the user prefers reduced motion." checked={settings.accessibilityReducedMotion} onChange={(val) => handleChange("accessibilityReducedMotion", val)} />
                <Toggle label="Navigation" description="Preserve URL parameters when navigating between pages." checked={settings.preserveUrlParams} onChange={(val) => handleChange("preserveUrlParams", val)} />
                <Toggle label="Automatic Locale" description="Auto-redirect site visitors to their preferred locale based on browser settings." checked={settings.autoLocale} onChange={(val) => handleChange("autoLocale", val)} />
              </div>
            </>
          )}

          {/* ================= TAB 2: SITE IMAGES ================= */}
          {activeTab === "images" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-10">

              <div>
                <h3 className="text-lg font-bold mb-1">Favicon</h3>
                <p className="text-sm text-gray-500 mb-6">Icon seen in browser tabs. 64 x 64 pixels recommended.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="bg-[#e5e7eb] p-6 rounded-xl border border-gray-200 flex flex-col items-center">
                    <div className="bg-white px-4 py-2 rounded-t-lg flex items-center gap-2 shadow-sm border border-b-0 border-gray-200 w-full max-w-[200px]">
                      {settings.faviconLight ? <img src={settings.faviconLight} className="w-4 h-4 object-contain" /> : <div className="w-4 h-4 bg-gray-300 rounded" />}
                      <span className="text-[11px] font-medium text-gray-600 truncate">{settings.seoTitle || "Home"}</span>
                    </div>
                    <div className="w-full mt-4">
                      <ImageUploader label="Light Theme Icon" src={settings.faviconLight} isUploading={uploadingImage === "faviconLight"} onUpload={(e: any) => handleImageUpload(e, "faviconLight")} />
                    </div>
                  </div>

                  <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800 flex flex-col items-center">
                    <div className="bg-[#374151] px-4 py-2 rounded-t-lg flex items-center gap-2 shadow-sm border border-b-0 border-gray-600 w-full max-w-[200px]">
                      {settings.faviconDark ? <img src={settings.faviconDark} className="w-4 h-4 object-contain" /> : <div className="w-4 h-4 bg-gray-500 rounded" />}
                      <span className="text-[11px] font-medium text-gray-200 truncate">{settings.seoTitle || "Home"}</span>
                    </div>
                    <div className="w-full mt-4 [&_label]:text-gray-300">
                      <ImageUploader label="Dark Theme Icon" src={settings.faviconDark} isUploading={uploadingImage === "faviconDark"} onUpload={(e: any) => handleImageUpload(e, "faviconDark")} />
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                  <h3 className="text-lg font-bold mb-1">Social Preview</h3>
                  <p className="text-sm text-gray-500 mb-6">1200 × 630 pixels. Appears when shared on Facebook, iMessage, etc.</p>
                  <ImageUploader label="Upload Open Graph Image" src={settings.ogImage} isUploading={uploadingImage === "ogImage"} onUpload={(e: any) => handleImageUpload(e, "ogImage")} />
                </div>
                <div className="w-full aspect-[1200/630] bg-gray-100 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center relative">
                  {settings.ogImage ? <img src={settings.ogImage} className="w-full h-full object-cover" /> : <ImageIcon size={40} className="text-gray-300" />}
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 3: ADVANCED & ROUTING ================= */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Integrations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Google Analytics ID</label>
                    <input type="text" value={settings.googleAnalyticsId} onChange={e => handleChange("googleAnalyticsId", e.target.value)} placeholder="G-XXXXXXXXXX" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Google Reviews Widget ID</label>
                    <input type="text" value={settings.googleReviewsId} onChange={e => handleChange("googleReviewsId", e.target.value)} placeholder="e.g. Elfsight App ID" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-all text-sm" />
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold">301 Redirects</h3>
                  <button onClick={() => setSettings(prev => ({ ...prev, redirects: [...prev.redirects, { oldPath: "", newPath: "" }] }))} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-semibold"><Plus size={16} /> Add Redirect</button>
                </div>
                <div className="space-y-3 mt-4">
                  {settings.redirects.map((redirect: any, index: number) => (
                    <div key={index} className="flex flex-col md:flex-row items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <input type="text" value={redirect.oldPath} onChange={e => { const r = [...settings.redirects]; r[index].oldPath = e.target.value; handleChange("redirects", r); }} placeholder="e.g. /old-services" className="w-full bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 text-sm" />
                      <ArrowRightLeft size={16} className="text-gray-400 shrink-0 hidden md:block" />
                      <input type="text" value={redirect.newPath} onChange={e => { const r = [...settings.redirects]; r[index].newPath = e.target.value; handleChange("redirects", r); }} placeholder="e.g. /#services" className="w-full bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:border-blue-500 text-sm" />
                      <button onClick={() => { const r = settings.redirects.filter((_: any, i: number) => i !== index); handleChange("redirects", r); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}