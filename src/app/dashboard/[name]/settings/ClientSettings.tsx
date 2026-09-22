"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ArrowRightLeft, Plus, Trash2, Loader2, Globe, Settings as SettingsIcon, Image as ImageIcon, Upload, Store } from "lucide-react";
import { saveWebsiteSettingsAction } from "@/actions/tenant";
import { uploadImageAction } from "@/actions/upload";

// --- DRAG AND DROP IMAGE UPLOADER ---
const ImageUploader = ({ label, src, isUploading, onUpload }: { label: string, src: string, isUploading: boolean, onUpload: (e: any) => void }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDrag = (e: any, state: boolean) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(state); };
  const handleDrop = (e: any) => {
    handleDrag(e, false);
    if (e.dataTransfer.files?.length > 0) onUpload({ target: { files: e.dataTransfer.files } });
  };

  return (
    <div className="space-y-1.5 w-full">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div onDragOver={e => handleDrag(e, true)} onDragLeave={e => handleDrag(e, false)} onDrop={handleDrop}
        className={`w-full p-3 rounded-xl border-2 transition-all duration-200 ${isDragOver ? "border-blue-500 bg-blue-50 border-dashed" : "border-gray-200 bg-gray-50 border-solid"}`}>
        {src && <img src={src} alt="Preview" className="w-full h-32 object-contain rounded-lg mb-3 border border-gray-200 bg-white shadow-sm pointer-events-none" />}
        <label className={`flex items-center justify-center gap-2 w-full p-2.5 bg-white border border-gray-200 rounded-lg cursor-pointer text-sm font-medium text-gray-700 transition-colors shadow-sm hover:bg-gray-50`}>
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {isUploading ? "Uploading..." : "Click or Drag Image"}
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
    <button onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-black' : 'bg-gray-200'}`}>
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);

// --- MAIN SETTINGS COMPONENT ---
export default function ClientSettings({ slug, settingsData, clientName, websiteData }: { slug: string, settingsData: any, clientName: string, websiteData: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({
    seoTitle: settingsData?.seoTitle || "",
    seoDescription: settingsData?.seoDescription || "",
    language: settingsData?.language || "en-US",
    keywords: settingsData?.keywords || "",

    // Local Business Profile
    businessName: settingsData?.businessName || clientName,
    businessPhone: settingsData?.businessPhone || "",
    businessEmail: settingsData?.businessEmail || "",
    businessAddress: settingsData?.businessAddress || "",
    businessHours: settingsData?.businessHours || "Mo-Fr 09:00-17:00",

    accessibilityReducedMotion: settingsData?.accessibilityReducedMotion || false,
    preserveUrlParams: settingsData?.preserveUrlParams ?? true,
    rtlLayout: settingsData?.rtlLayout || false,

    faviconLight: settingsData?.faviconLight || "",
    faviconDark: settingsData?.faviconDark || "",
    ogImage: settingsData?.ogImage || "",
    appleTouchIcon: settingsData?.appleTouchIcon || "",

    googleAnalyticsId: settingsData?.googleAnalyticsId || "",
    googleReviewsId: settingsData?.googleReviewsId || "",
    redirects: settingsData?.redirects || []
  });

  const handleChange = (field: string, value: any) => setSettings(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveWebsiteSettingsAction(slug, settings);
    setIsSaving(false);
    if (res.success) { alert("Settings Saved!"); router.refresh(); } 
    else alert("Failed to save: " + res.error);
  };

  const handleImageUpload = async (e: any, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(field);
    try {
      const formData = new FormData(); formData.append("file", file);
      const res = await uploadImageAction(formData);
      if (res.success) handleChange(field, res.url);
      else alert(`Upload failed: ${res.error}`);
    } catch (error: any) { alert(`Upload failed: ${error.message}`); } 
    finally { setUploadingImage(null); }
  };

  const navLinks = websiteData?.navbar?.links || [];

  return (
    <div className="min-h-screen bg-[#fafafa] pb-32 font-sans text-gray-900">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/${slug}`} className="p-2 -ml-2 text-gray-400 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"><ArrowLeft size={20} /></Link>
            <h1 className="text-lg font-bold">Site Settings</h1>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-70 shadow-md">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 mt-6 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {[
            { id: "general", icon: Globe, label: "SEO & Metadata" },
            { id: "local", icon: Store, label: "Local Business Profile" },
            { id: "images", icon: ImageIcon, label: "Brand Images" },
            { id: "advanced", icon: SettingsIcon, label: "Advanced & Routing" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-white shadow-sm border border-gray-200 text-black" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"}`}>
              <tab.icon size={18} className={activeTab === tab.id ? "text-blue-600" : "text-gray-400"} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-8">

          {/* === SEO & METADATA === */}
          {activeTab === "general" && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold mb-6">Search Engine Optimization</h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1.5"><label className="text-sm font-semibold">SEO Title</label><span className="text-xs text-gray-400">{settings.seoTitle.length}/60</span></div>
                    <input type="text" value={settings.seoTitle} onChange={e => handleChange("seoTitle", e.target.value)} placeholder={`${clientName} | Home`} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black transition-all text-sm" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5"><label className="text-sm font-semibold">SEO Description</label><span className="text-xs text-gray-400">{settings.seoDescription.length}/160</span></div>
                    <textarea rows={3} value={settings.seoDescription} onChange={e => handleChange("seoDescription", e.target.value)} placeholder="A compelling description for Google Search..." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black transition-all text-sm resize-none" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">Keywords (Comma separated)</label>
                    <input type="text" value={settings.keywords} onChange={e => handleChange("keywords", e.target.value)} placeholder="grooming, pet care, local" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black transition-all text-sm" />
                  </div>
                </div>
              </div>

              {/* ADVANCED GOOGLE PREVIEW (Sitelinks Simulation) */}
              <div className="p-6 bg-[#f8f9fa]">
                <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">Live Search Preview</h3>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm max-w-2xl font-sans">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 bg-gray-100 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center">
                      {settings.faviconLight ? <img src={settings.faviconLight} className="w-full h-full object-cover" /> : <Globe size={14} className="text-gray-400" />}
                    </div>
                    <div className="leading-tight">
                      <p className="text-[14px] text-[#202124]">{settings.businessName || clientName}</p>
                      <p className="text-[12px] text-[#4d5156]">https://{slug}.nexpetcare.online</p>
                    </div>
                  </div>
                  <h3 className="text-[20px] text-[#1a0dab] font-medium leading-snug hover:underline cursor-pointer truncate">
                    {settings.seoTitle || `${clientName} | Home`}
                  </h3>
                  <p className="text-[14px] text-[#4d5156] mt-1 line-clamp-2 leading-snug">
                    {settings.seoDescription || "No meta description provided. Google will attempt to find a relevant part of your page to display here."}
                  </p>
                  
                  {/* Simulated Google Sitelinks */}
                  {navLinks.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 pl-4 border-l-2 border-[#dadce0]">
                      {navLinks.slice(1, 5).map((link: any, i: number) => (
                        <div key={i}>
                          <h4 className="text-[14px] text-[#1a0dab] hover:underline cursor-pointer">{link.label}</h4>
                          <p className="text-[12px] text-[#4d5156] line-clamp-1 truncate">Explore our {link.label.toLowerCase()} section.</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* === LOCAL BUSINESS PROFILE === */}
          {activeTab === "local" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-2">Local SEO Data (Schema.org)</h2>
              <p className="text-sm text-gray-500 mb-6">This information is injected directly into your website's code to help Google understand your local business, improving Google Maps and Search rankings.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold">Official Business Name</label>
                  <input type="text" value={settings.businessName} onChange={e => handleChange("businessName", e.target.value)} placeholder="e.g., NexPet Grooming LLC" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Public Phone Number</label>
                  <input type="text" value={settings.businessPhone} onChange={e => handleChange("businessPhone", e.target.value)} placeholder="+1 (555) 123-4567" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Public Email Address</label>
                  <input type="email" value={settings.businessEmail} onChange={e => handleChange("businessEmail", e.target.value)} placeholder="hello@yourbusiness.com" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black text-sm" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold">Physical Address</label>
                  <input type="text" value={settings.businessAddress} onChange={e => handleChange("businessAddress", e.target.value)} placeholder="123 Main St, City, State, ZIP" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black text-sm" />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-semibold">Operating Hours</label>
                  <input type="text" value={settings.businessHours} onChange={e => handleChange("businessHours", e.target.value)} placeholder="e.g. Mo-Fr 09:00-17:00, Sa 10:00-14:00" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black text-sm font-mono" />
                  <p className="text-xs text-gray-500">Format: Days (Mo, Tu, We, Th, Fr, Sa, Su) followed by 24h times.</p>
                </div>
              </div>
            </div>
          )}

          {/* === IMAGES === */}
          {activeTab === "images" && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Brand Favicons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-100 p-5 rounded-xl border border-gray-200">
                    <ImageUploader label="Light Theme Favicon (32x32)" src={settings.faviconLight} isUploading={uploadingImage === "faviconLight"} onUpload={e => handleImageUpload(e, "faviconLight")} />
                  </div>
                  <div className="bg-gray-900 p-5 rounded-xl border border-gray-800 [&_label]:text-gray-300">
                    <ImageUploader label="Dark Theme Favicon (32x32)" src={settings.faviconDark} isUploading={uploadingImage === "faviconDark"} onUpload={e => handleImageUpload(e, "faviconDark")} />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Social Sharing Image (Open Graph)</h3>
                <ImageUploader label="1200x630 Image for iMessage, Twitter, Facebook" src={settings.ogImage} isUploading={uploadingImage === "ogImage"} onUpload={e => handleImageUpload(e, "ogImage")} />
              </div>
            </div>
          )}

          {/* === ADVANCED === */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Tracking & Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">Google Analytics ID</label>
                    <input type="text" value={settings.googleAnalyticsId} onChange={e => handleChange("googleAnalyticsId", e.target.value)} placeholder="G-XXXXXXXXXX" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">Elfsight Reviews ID</label>
                    <input type="text" value={settings.googleReviewsId} onChange={e => handleChange("googleReviewsId", e.target.value)} placeholder="App ID string" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-black text-sm" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">301 URL Redirects</h3>
                  <button onClick={() => setSettings(prev => ({ ...prev, redirects: [...prev.redirects, { oldPath: "", newPath: "" }] }))} className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800"><Plus size={16} /> Add Rule</button>
                </div>
                <div className="space-y-3">
                  {settings.redirects.map((redirect: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <input type="text" value={redirect.oldPath} onChange={e => { const r = [...settings.redirects]; r[index].oldPath = e.target.value; handleChange("redirects", r); }} placeholder="e.g. /old-page" className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black" />
                      <ArrowRightLeft size={16} className="text-gray-400 shrink-0" />
                      <input type="text" value={redirect.newPath} onChange={e => { const r = [...settings.redirects]; r[index].newPath = e.target.value; handleChange("redirects", r); }} placeholder="e.g. /new-page" className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-black" />
                      <button onClick={() => { const r = settings.redirects.filter((_: any, i: number) => i !== index); handleChange("redirects", r); }} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  {settings.redirects.length === 0 && <div className="p-6 text-center text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg">No redirects active.</div>}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <Toggle label="Accessibility Mode" description="Disable animations for users preferring reduced motion." checked={settings.accessibilityReducedMotion} onChange={v => handleChange("accessibilityReducedMotion", v)} />
                <Toggle label="Preserve Parameters" description="Keep URL tracking parameters across page navigation." checked={settings.preserveUrlParams} onChange={v => handleChange("preserveUrlParams", v)} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}