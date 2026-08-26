"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Search, Share2, BarChart, ArrowRightLeft, Plus, Trash2, Image as ImageIcon, Star, Loader2, CheckCircle2 } from "lucide-react";
import { saveWebsiteContentAction, saveWebsiteSettingsAction } from "@/actions/tenant";
import { useEditorStore } from "@/store/useEditorStore";

export default function ClientSettings({ slug, initialData }: { slug: string, initialData: any }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const config = useEditorStore((state) => state.config); // Grab current JSON from Zustand
  const [settings, setSettings] = useState({
    seoTitle: initialData?.settings?.seoTitle || "",
    seoDescription: initialData?.settings?.seoDescription || "",
    keywords: initialData?.settings?.keywords || "",
    favicon: initialData?.settings?.favicon || "",
    ogImage: initialData?.settings?.ogImage || "",
    googleAnalyticsId: initialData?.settings?.googleAnalyticsId || "",
    googleReviewsId: initialData?.settings?.googleReviewsId || "",
    redirects: initialData?.settings?.redirects || []
  });

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const addRedirect = () => {
    setSettings(prev => ({
      ...prev,
      redirects: [...prev.redirects, { oldPath: "", newPath: "" }]
    }));
  };
  const handleEditorSave = async () => {
    setIsSaving(true);

    // 1. Send the updated JSON to our Server Action
    const res = await saveWebsiteContentAction(slug, config);

    if (res.success) {
      // 2. Cache is instantly cleared!
      alert("Saved & Live Instantly!");
    } else {
      alert("Failed to save: " + res.error);
    }

    setIsSaving(false);
  };
  const updateRedirect = (index: number, field: string, value: string) => {
    const newRedirects = [...settings.redirects];
    newRedirects[index][field] = value;
    handleChange("redirects", newRedirects);
  };

  const removeRedirect = (index: number) => {
    const newRedirects = settings.redirects.filter((_: any, i: number) => i !== index);
    handleChange("redirects", newRedirects);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveWebsiteSettingsAction(slug, settings);
    setIsSaving(false);

    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    } else {
      alert("Failed to save settings: " + res.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-32 font-sans">

      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/${slug}`} className="p-2 -ml-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Global Settings</h1>
              <p className="text-xs text-gray-500 hidden md:block">Settings apply to all templates on {slug}.nexpetcare.online</p>
            </div>
          </div>

          <button
            onClick={handleEditorSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 mt-6 space-y-8">

        {/* 1. Google Search & SEO */}
        <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-blue-600 mb-2 border-b border-gray-100 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg"><Search size={20} /></div>
            <h3 className="text-lg font-bold text-gray-900">Search Engine Optimization (SEO)</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Title (Heading on Google)</label>
              <input
                type="text"
                value={settings.seoTitle}
                onChange={e => handleChange("seoTitle", e.target.value)}
                placeholder="e.g., Fluffy's Salon | Best Dog Grooming in Toronto"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Meta Description (Subheading on Google)</label>
              <textarea
                value={settings.seoDescription}
                onChange={e => handleChange("seoDescription", e.target.value)}
                rows={3}
                placeholder="e.g., Book your dog's teeth cleaning today. Stress-free, anesthesia-free, and affordable..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Keywords</label>
              <input
                type="text"
                value={settings.keywords}
                onChange={e => handleChange("keywords", e.target.value)}
                placeholder="e.g., dog grooming, pet care, teeth cleaning near me"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        </section>

        {/* 2. Social Media Branding */}
        <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-indigo-600 mb-2 border-b border-gray-100 pb-4">
            <div className="p-2 bg-indigo-50 rounded-lg"><Share2 size={20} /></div>
            <h3 className="text-lg font-bold text-gray-900">Branding & Social Sharing</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Favicon URL (Browser Tab Icon)</label>
              <div className="flex gap-3 items-center">
                {settings.favicon ? (
                  <img src={settings.favicon} alt="Favicon" className="w-10 h-10 rounded-lg border border-gray-200 object-cover shadow-sm shrink-0" />
                ) : (
                  <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 shrink-0"><ImageIcon size={16} /></div>
                )}
                <input
                  type="text"
                  value={settings.favicon}
                  onChange={e => handleChange("favicon", e.target.value)}
                  placeholder="https://... (PNG or ICO)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Social Thumbnail (Facebook/iMessage)</label>
              <div className="flex gap-3 items-center">
                {settings.ogImage ? (
                  <img src={settings.ogImage} alt="Social" className="w-16 h-10 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0" />
                ) : (
                  <div className="w-16 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 shrink-0"><ImageIcon size={16} /></div>
                )}
                <input
                  type="text"
                  value={settings.ogImage}
                  onChange={e => handleChange("ogImage", e.target.value)}
                  placeholder="Image URL for social previews"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Integrations */}
        <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 text-green-600 mb-2 border-b border-gray-100 pb-4">
            <div className="p-2 bg-green-50 rounded-lg"><BarChart size={20} /></div>
            <h3 className="text-lg font-bold text-gray-900">Live Integrations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Google Analytics ID</label>
              <input
                type="text"
                value={settings.googleAnalyticsId}
                onChange={e => handleChange("googleAnalyticsId", e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                Google Reviews Widget ID <Star size={14} className="text-yellow-500" />
              </label>
              <input
                type="text"
                value={settings.googleReviewsId}
                onChange={e => handleChange("googleReviewsId", e.target.value)}
                placeholder="e.g. Elfsight App ID"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>
          </div>
        </section>

        {/* 4. 301 Redirect Mapping */}
        <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6 border-l-4 border-l-red-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 bg-red-50 rounded-lg"><ArrowRightLeft size={20} /></div>
              <h3 className="text-lg font-bold text-gray-900">301 Redirect Mapping (Protect SEO)</h3>
            </div>
            <button
              onClick={addRedirect}
              className="flex items-center gap-2 text-sm bg-red-50 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-semibold"
            >
              <Plus size={16} /> Add Redirect
            </button>
          </div>

          <p className="text-sm text-gray-600">
            Moving from Wix or WordPress? Map your old URLs here so Google knows where your pages moved. This protects your keyword rankings and prevents 404 errors.
          </p>

          {settings.redirects.length === 0 ? (
            <div className="text-center p-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm bg-gray-50/50">
              No redirects set. Your SEO is starting fresh.
            </div>
          ) : (
            <div className="space-y-4">
              {settings.redirects.map((redirect: any, index: number) => (
                <div key={index} className="flex flex-col md:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex-1 w-full">
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Old Path (Wix/WP)</label>
                    <input
                      type="text"
                      value={redirect.oldPath}
                      onChange={e => updateRedirect(index, "oldPath", e.target.value)}
                      placeholder="/old-services-page"
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
                    />
                  </div>
                  <ArrowRightLeft size={16} className="text-gray-400 mt-5 hidden md:block shrink-0" />
                  <div className="flex-1 w-full">
                    <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">New Path (NexPet)</label>
                    <input
                      type="text"
                      value={redirect.newPath}
                      onChange={e => updateRedirect(index, "newPath", e.target.value)}
                      placeholder="/services"
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeRedirect(index)}
                    className="md:mt-5 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Redirect"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}