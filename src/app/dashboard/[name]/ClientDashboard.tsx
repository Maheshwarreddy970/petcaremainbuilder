"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LayoutTemplate, Code, ExternalLink, Loader2, Globe, Calendar, Server, ShieldCheck, CheckCircle2, Lock, Link as LinkIcon, RefreshCw, Copy, Download, Settings } from "lucide-react";
import merge from "lodash/merge";
import WebsiteOne from "@/components/templates/WebsiteOne";
import { deployWebsiteAction, connectCustomDomainAction, checkDomainStatusAction, publishWebsiteUpdatesAction } from "@/actions/tenant";

interface DashboardProps {
  name: string;
  dbData: any;
}

const DEPLOY_STEPS = [
  "Initializing edge cache...",
  "Optimizing database structure...",
  "Generating static assets...",
  "Mapping subdomain routing...",
  "Deploying to Global Network..."
];

export default function ClientDashboard({ name, dbData }: DashboardProps) {
  const paid = dbData?.paid;
  const [downloading, setDownloading] = useState(false);
  const [isDeployed, setIsDeployed] = useState(dbData?.isDeployed || false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showDnsModal, setShowDnsModal] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [dnsRecords, setDnsRecords] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [domainStatus, setDomainStatus] = useState(dbData?.domainStatus || "none");
  const [isChecking, setIsChecking] = useState(false);

  // Template Auto-Scroll logic
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    const scrollContainer = scrollRef.current;

    const autoScroll = () => {
      if (scrollContainer && !isHovering) {
        scrollContainer.scrollTop += 0.5; // Scroll speed

        if (scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
          scrollContainer.scrollTop = 0;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovering]);

  const activeDisplayUrl = dbData?.customDomain
    ? dbData.customDomain
    : `${name}.nexpetcare.online`;

  const liveHref = dbData?.customDomain
    ? `https://${dbData.customDomain}`
    : `https://${name}.nexpetcare.online`;

  const activeData = merge({}, dbData?.websiteOneData || {});
  const handlePublish = async () => {
    setIsPublishing(true);
    const res = await publishWebsiteUpdatesAction(name);

    if (res.success) {
      alert("✅ Success! Your live website has been updated worldwide.");
    } else {
      alert("❌ Failed to publish: " + res.error);
    }
    setIsPublishing(false);
  };
  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeployStep(0);

    for (let i = 0; i < DEPLOY_STEPS.length; i++) {
      setDeployStep(i);
      await new Promise(res => setTimeout(res, 800));
    }

    const res = await deployWebsiteAction(name);

    if (res.success) {
      setIsDeployed(true);
    } else {
      alert("Deployment failed.");
    }

    setIsDeploying(false);
  };

  const handleConnectDomain = async () => {
    if (!customDomainInput) return;
    setIsConnecting(true);

    const res = await connectCustomDomainAction(name, customDomainInput);

    if (res.success) {
      setDnsRecords(res.dnsRecords);
      setDomainStatus("pending");
    } else {
      alert(`Error connecting domain: ${res.error}`);
    }
    setIsConnecting(false);
  };

  const handleCheckStatus = async () => {
    if (!dbData?.customDomain && !customDomainInput) return;
    setIsChecking(true);

    const domainToCheck = dbData?.customDomain || customDomainInput;
    const res = await checkDomainStatusAction(name, domainToCheck);

    if (res.success) {
      setDomainStatus(res.status);
      if (res.status === "active") {
        setTimeout(() => window.location.reload(), 1500);
      }
    }
    setIsChecking(false);
  };

  function copyToClipboard(value: any): void {
    const text = typeof value === "string" ? value : String(value ?? "");

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        const tempInput = document.createElement("textarea");
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      });
      return;
    }

    const tempInput = document.createElement("textarea");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
  }

  // 🚀 SMART ZIP EXPORT: Injects SEO, Analytics, and Integrations into the final HTML!
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const settings = dbData?.settings || {};

      // Grab the raw HTML from our preview wrapper
      const contentNode = document.getElementById("export-container");
      const contentHtml = contentNode ? contentNode.innerHTML : "";

      // Build the standard HTML5 boilerplate and inject all dynamic settings
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO Metadata -->
  <title>${settings.seoTitle || dbData?.clientName || name}</title>
  <meta name="description" content="${settings.seoDescription || ""}">
  <meta name="keywords" content="${settings.keywords || ""}">
  ${settings.favicon ? `<link rel="icon" href="${settings.favicon}">` : ""}
  
  <!-- Social Media Branding -->
  <meta property="og:title" content="${settings.seoTitle || name}">
  <meta property="og:description" content="${settings.seoDescription || ""}">
  ${settings.ogImage ? `<meta property="og:image" content="${settings.ogImage}">` : ""}
  
  <!-- Tailwind CSS (Required for styling the static export) -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Google Analytics -->
  ${settings.googleAnalyticsId ? `
  <script async src="https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${settings.googleAnalyticsId}');
  </script>
  ` : ""}

  <!-- Google Reviews Script -->
  ${settings.googleReviewsId ? `<script src="https://apps.elfsight.com/p/platform.js" defer></script>` : ""}
</head>
<body>
  
  <!-- Website Content -->
  ${contentHtml}

  <!-- Google Reviews Widget Container -->
  ${settings.googleReviewsId ? `<div class="elfsight-app-${settings.googleReviewsId}"></div>` : ""}

</body>
</html>`;

      // Send to the backend route to process assets and generate ZIP
      // Replace "/api/export" with your actual route name if it differs!
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullHtml })
      });

      if (!res.ok) throw new Error("Failed to generate ZIP");

      // Trigger the browser to download the blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}-website.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();

    } catch (error) {
      console.error(error);
      alert("Failed to export ZIP.");
    }
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-black p-6 md:p-10 font-sans flex flex-col items-center">

      {/* Dashboard Header */}
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight capitalize text-gray-900">
            {dbData?.clientName || name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${isDeployed ? "bg-green-500 animate-pulse" : "bg-gray-300"}`}></span>
            <p className="text-sm text-gray-500 font-medium">
              {isDeployed ? "Live on Global Network" : "Draft Mode - Not Deployed"}
            </p>
          </div>
        </div>

<div className="flex flex-wrap items-center gap-3">
          {/* Visual Editor - Routes dynamically to the correct template folder */}
          <Link 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
            // If template is websiteOne, go to landingpageone folder. Add logic here for future templates.
            href={`/dashboard/${name}/${dbData?.template === 'websiteOne' ? 'websiteOne' : 'websiteOne'}/edit`}
          >
            <LayoutTemplate size={16} /> Visual Editor
          </Link>

          {/* ❌ THE JSON EDIT BUTTON HAS BEEN COMPLETELY REMOVED FROM HERE */}
          {/* You will access it manually by typing: /dashboard/[name]/landingpageone/edit/json in your URL bar */}

          {/* Settings Button */}
          <Link className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors shadow-sm" href={`/dashboard/${name}/settings`}>
            <Settings size={16} /> Settings
          </Link>
          
          {isDeployed && (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:opacity-70"
            >
              {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              {isPublishing ? "Publishing..." : "Publish Updates"}
            </button>
          )}
          
          {paid ? (
            <button onClick={handleDownload} disabled={downloading} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md disabled:opacity-70">
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {downloading ? "Packaging..." : "Export ZIP"}
            </button>
          ) : (
            <button disabled className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed border border-gray-300">
              <Lock size={16} /> Export ZIP (Pro)
            </button>
          )}

          {isDeployed && (
            <a href={liveHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors shadow-sm">
              <ExternalLink size={16} /> Visit Live Site
            </a>
          )}
        </div>
      </div>

      {/* Deploy Banner */}
      {!isDeployed && (
        <div className="w-full max-w-7xl mx-auto mt-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
              <Server className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Deploy app for free</h2>
              <p className="text-gray-500 text-sm mt-1">
                Make your template live on <span className="font-mono bg-gray-100 px-1 rounded text-gray-700">{name}.nexpetcare.online</span> and unlock custom domains.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <button
              onClick={handleDeploy}
              disabled={isDeploying}
              className="flex items-center gap-2 px-8 py-3 text-sm font-semibold bg-black text-white rounded-xl hover:bg-gray-800 transition-all shadow-md disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isDeploying ? <Loader2 className="animate-spin" size={16} /> : <Globe size={16} />}
              {isDeploying ? "Deploying..." : "Deploy App for Free"}
            </button>
            {isDeploying && (
              <p className="text-xs font-medium text-blue-600 animate-pulse mt-2">
                {DEPLOY_STEPS[deployStep]}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Custom Domain Management */}
      {isDeployed && (
        <div className="w-full max-w-7xl mx-auto mt-6 bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2 text-blue-300 mb-2">
              <ShieldCheck size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Cloudflare Network</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {domainStatus === "active" ? "Custom Domain Connected" : "Connect Your Own Domain (Free)"}
            </h3>

            {domainStatus === "active" ? (
              <p className="text-blue-100/80 mb-6 text-sm max-w-2xl">
                Your site is officially live at <span className="font-mono bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded border border-green-500/30">{activeDisplayUrl}</span>.
              </p>
            ) : (
              <p className="text-blue-100/80 mb-6 text-sm max-w-2xl">
                Your site is currently live at <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded text-white">{name}.nexpetcare.online</span>. Want to use a custom domain like <span className="font-mono bg-black/30 px-1.5 py-0.5 rounded text-white">www.yourpetsalon.com</span>? Connect it instantly.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowDnsModal(!showDnsModal)}
                className="bg-white text-black px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <LinkIcon size={16} />
                {dbData?.customDomain ? "View DNS Records" : "Setup Custom Domain"}
              </button>

              {/* Free Support Booking Link */}
              <a
                href="https://cal.com/maheshwar-reddy-20/nexpetcare-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-800/50 border border-blue-400/50 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Calendar size={16} /> {/* Ensure you import { Calendar } from 'lucide-react' */}
                Book Free 1-on-1 Setup Call
              </a>

              {/* Optional small text to emphasize that it's free/helpful */}
              <span className="text-xs text-blue-200/70 max-w-[200px] leading-tight">
                Stuck on DNS or have questions? Get completely free personal support.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* DNS Setup Block */}
      {showDnsModal && (
        <div className="w-full max-w-7xl mx-auto mt-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h4 className="font-bold text-lg mb-4">Domain Configuration</h4>

          {(!dbData?.customDomain || dnsRecords) && (
            <div className="flex items-center gap-3 mb-6">
              <input
                type="text"
                placeholder="Enter domain (e.g. nexpetcare.info or yoursite.com)"
                value={customDomainInput}
                onChange={e => setCustomDomainInput(e.target.value)}
                className="w-full max-w-md border border-gray-300 px-4 py-2 rounded-lg text-sm outline-none focus:border-blue-500"
              />
              <button
                onClick={handleConnectDomain}
                disabled={isConnecting || !customDomainInput}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-70 flex items-center gap-2"
              >
                {isConnecting ? <Loader2 size={16} className="animate-spin" /> : null}
                Generate DNS Records
              </button>
            </div>
          )}

          {(dnsRecords || dbData?.domainStatus === "pending") && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-gray-700 font-medium">Add these records to your domain registrar (GoDaddy, Namecheap, etc.)</p>
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                  <Loader2 size={12} className="animate-spin" /> Pending Verification
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {dnsRecords?.map((record: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 bg-white p-3 rounded border border-gray-200 text-sm font-mono text-gray-700 items-center">
                    <div className="col-span-1 border-r border-gray-100 pr-2">
                      <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wider font-sans">Type</span>
                      <span className="font-bold text-blue-600">{record.type}</span>
                    </div>
                    <div className="col-span-4 border-r border-gray-100 pr-2 overflow-hidden text-ellipsis">
                      <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wider font-sans">Name</span>
                      {record.name}
                    </div>
                    <div className="col-span-6 overflow-hidden text-ellipsis">
                      <span className="text-[10px] text-gray-400 block mb-0.5 uppercase tracking-wider font-sans">Target / Value</span>
                      {record.value}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => copyToClipboard(record.value)} className="p-2 hover:bg-gray-100 rounded text-gray-500 transition-colors" title="Copy Value" aria-label="Copy Value">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={16} className="text-green-500" /> SSL Certificate will be provisioned automatically.
                </div>
                <button
                  onClick={handleCheckStatus}
                  disabled={isChecking}
                  className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors flex items-center gap-2"
                >
                  {isChecking ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Verify Connection
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auto-scrolling Template Preview - ALWAYS VISIBLE */}
      <div className="w-full max-w-7xl mx-auto mt-10 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-300 overflow-hidden ring-1 ring-black/5">
        <div className="h-14 bg-gray-100/80 border-b border-gray-200 flex items-center px-4 justify-between select-none shrink-0 z-10 relative">
          <div className="flex gap-2 w-20">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>

          <div className="flex-1 flex justify-center">
            <div className="bg-white px-8 py-1.5 text-xs text-gray-500 font-medium rounded-md border border-gray-200 shadow-sm flex items-center gap-2 min-w-[250px] justify-center">
              <Lock size={12} className={domainStatus === "active" ? "text-green-500" : "text-gray-400"} />
              <span className="ml-2">{activeDisplayUrl}</span>
            </div>
          </div>
          <div className="w-20" />
        </div>

        {/* Outer wrapper to catch mouse hover */}
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative w-full h-[750px] bg-gray-50 overflow-hidden"
        >
          {/* Inner scrolling container (overflow-hidden prevents manual scroll, contain-paint traps the fixed navbar) */}
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-hidden"
            style={{ contain: 'paint' }}
          >
            {/* pointer-events-none completely blocks clicking and manual dragging */}
            <div id="export-container" className="w-full min-h-full bg-white flex flex-col relative pointer-events-none">
              <WebsiteOne data={activeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}