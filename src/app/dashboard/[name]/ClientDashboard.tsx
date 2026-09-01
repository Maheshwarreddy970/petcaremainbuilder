"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  LayoutTemplate, Code, ExternalLink, Loader2, Globe, Calendar, Server, 
  ShieldCheck, CheckCircle2, Lock, Link as LinkIcon, RefreshCw, Copy, 
  Download, Settings 
} from "lucide-react";
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
  
  // 🔥 Automatically open the modal if the domain is still pending
  const [showDnsModal, setShowDnsModal] = useState(dbData?.domainStatus === "pending");

  const [customDomainInput, setCustomDomainInput] = useState(dbData?.customDomain || "");
  const [dnsRecords, setDnsRecords] = useState<any>(dbData?.dnsRecords || null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [domainStatus, setDomainStatus] = useState(dbData?.domainStatus || "none");
  const [isChecking, setIsChecking] = useState(false);

  // 🚀 Smart DNS Registrar Detection State
  const [detectedRegistrar, setDetectedRegistrar] = useState<"godaddy" | "namecheap" | "ionos" | "squarespace" | "unknown" | "detecting">("detecting");

  // 🚀 Smart DNS Registrar Detection Effect
  useEffect(() => {
    const targetDomain = customDomainInput || dbData?.customDomain;
    if (!showDnsModal || !targetDomain) return;

    const detectProvider = async () => {
      setDetectedRegistrar("detecting");
      try {
        const cleanDomain = targetDomain.replace(/^https?:\/\//, "").replace(/\/$/, "").replace(/^www\./, '');
        if (!cleanDomain || !cleanDomain.includes('.')) return;

        const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=NS`, {
          headers: { 'Accept': 'application/dns-json' }
        });
        
        const data = await res.json();
        const nsString = (data.Answer || []).map((a: any) => a.data.toLowerCase()).join(' ');

        if (nsString.includes('domaincontrol')) setDetectedRegistrar('godaddy');
        else if (nsString.includes('registrar-servers') || nsString.includes('namecheap')) setDetectedRegistrar('namecheap');
        else if (nsString.includes('ui-dns') || nsString.includes('1and1')) setDetectedRegistrar('ionos');
        else if (nsString.includes('squarespacedns') || nsString.includes('googledomains')) setDetectedRegistrar('squarespace');
        else setDetectedRegistrar('unknown');
      } catch (e) {
        setDetectedRegistrar('unknown');
      }
    };

    const timeoutId = setTimeout(detectProvider, 800);
    return () => clearTimeout(timeoutId);
  }, [showDnsModal, customDomainInput, dbData?.customDomain]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let animationFrameId: number;
    const scrollContainer = scrollRef.current;

    const autoScroll = () => {
      if (scrollContainer && !isHovering) {
        scrollContainer.scrollTop += 0.5;
        if (scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
          scrollContainer.scrollTop = 0;
        }
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    animationFrameId = requestAnimationFrame(autoScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovering]);

  const activeDisplayUrl = dbData?.customDomain ? dbData.customDomain : `${name}.nexpetcare.online`;
  const liveHref = dbData?.customDomain ? `https://${dbData.customDomain}` : `https://${name}.nexpetcare.online`;
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
    const domainToCheck = customDomainInput || dbData?.customDomain;
    if (!domainToCheck) return;
    
    setIsChecking(true);
    const res = await checkDomainStatusAction(name, domainToCheck);

    if (res.success) {
      setDomainStatus(res.status);
      if (res.status === "active") {
        alert("✅ Domain successfully verified and connected!");
      } else {
        alert("Domain is still pending. Make sure you added the TXT records to your DNS settings.");
      }
    } else {
      alert(`Error checking status: ${res.error}`);
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

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const settings = dbData?.settings || {};
      const contentNode = document.getElementById("export-container");
      const contentHtml = contentNode ? contentNode.innerHTML : "";

      const fullHtml = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${settings.seoTitle || dbData?.clientName || name}</title>\n  <meta name="description" content="${settings.seoDescription || ""}">\n  <meta name="keywords" content="${settings.keywords || ""}">\n  ${settings.favicon ? `<link rel="icon" href="${settings.favicon}">` : ""}\n  <meta property="og:title" content="${settings.seoTitle || name}">\n  <meta property="og:description" content="${settings.seoDescription || ""}">\n  ${settings.ogImage ? `<meta property="og:image" content="${settings.ogImage}">` : ""}\n  <script src="https://cdn.tailwindcss.com"></script>\n  ${settings.googleAnalyticsId ? `\n  <script async src="https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}"></script>\n  <script>\n    window.dataLayer = window.dataLayer || [];\n    function gtag(){dataLayer.push(arguments);}\n    gtag('js', new Date());\n    gtag('config', '${settings.googleAnalyticsId}');\n  </script>\n  ` : ""}\n  ${settings.googleReviewsId ? `<script src="https://apps.elfsight.com/p/platform.js" defer></script>` : ""}\n</head>\n<body>\n  ${contentHtml}\n  ${settings.googleReviewsId ? `<div class="elfsight-app-${settings.googleReviewsId}"></div>` : ""}\n</body>\n</html>`;

      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullHtml })
      });

      if (!res.ok) throw new Error("Failed to generate ZIP");

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
    <div className="min-h-screen bg-[#f8f9fa] text-black p-6 md:p-10 font-sans flex flex-col items-center" suppressHydrationWarning>

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
          <Link 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
            href={`/dashboard/${name}/${dbData?.template === 'websiteOne' ? 'websiteOne' : 'websiteOne'}/edit`}
          >
            <LayoutTemplate size={16} /> Visual Editor
          </Link>

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

      {/* Custom Domain Management Card */}
      {isDeployed && (
        <div className="w-full max-w-7xl mx-auto mt-6 bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2 text-blue-300 mb-2">
              <ShieldCheck size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Cloudflare Network</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {domainStatus === "active" ? "Custom Domain Connected" : "Connect Your Own Domain"}
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
                {dbData?.customDomain ? "View Domain Settings" : "Setup Custom Domain"}
              </button>

              <a
                href="https://cal.com/maheshwar-reddy-20/nexpetcare-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-800/50 border border-blue-400/50 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Calendar size={16} />
                Book Free 1-on-1 Setup Call
              </a>
            </div>
          </div>
        </div>
      )}

      {/* DNS Setup Modal / Panel */}
      {showDnsModal && (
        <div className="w-full max-w-7xl mx-auto mt-4 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-xl text-gray-900">Domain Configuration</h4>
          </div>

          {/* Domain Input Form */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-8">
            <div className="relative w-full md:flex-1 max-w-md">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Enter domain (e.g. yoursite.com)"
                value={customDomainInput}
                onChange={e => setCustomDomainInput(e.target.value.toLowerCase())}
                className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              onClick={handleConnectDomain}
              // 🔥 FIX: Now they can click the button if dnsRecords is missing!
              disabled={isConnecting || !customDomainInput}
              className="bg-black text-white px-6 py-3 w-full md:w-auto rounded-xl text-sm font-semibold disabled:opacity-70 flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-sm"
            >
              {isConnecting ? <Loader2 size={18} className="animate-spin" /> : null}
              {(!dnsRecords && dbData?.customDomain === customDomainInput) ? "Retrieve DNS Records" : (dbData?.customDomain ? "Update Domain" : "Initialize Domain")}
            </button>
          </div>

          {/* Shows Step-by-Step Instructions if records exist */}
          {(dnsRecords || dbData?.domainStatus === "pending") && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              
              {/* STEP 1: Open Provider */}
              <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">1</span>
                  <h5 className="font-bold text-lg text-gray-900">Open your DNS Settings</h5>
                </div>
                
                {detectedRegistrar === "detecting" ? (
                  <div className="flex items-center gap-2 ml-0 md:ml-9 text-sm text-gray-500 mt-4">
                    <Loader2 size={16} className="animate-spin" /> Detecting your domain provider...
                  </div>
                ) : detectedRegistrar !== "unknown" ? (
                  <div className="ml-0 md:ml-9 mt-4">
                    <p className="text-gray-700 mb-4 text-sm">
                      We detected your domain is registered with <span className="font-bold capitalize text-blue-700">{detectedRegistrar}</span>. Click below to jump directly to your settings.
                    </p>
                    <div className="max-w-sm">
                      {/* 🔥 SINGLE DETECTED BUTTON */}
                      {detectedRegistrar === 'godaddy' && (
                        <a href={`https://dcc.godaddy.com/manage/${(customDomainInput || dbData?.customDomain).replace('www.', '')}/dns`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group">
                          <div className="w-8 h-8 bg-[#1bdbdb] rounded-lg flex items-center justify-center font-bold text-black shrink-0">G</div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-gray-900 text-sm truncate">GoDaddy</p>
                            <p className="text-[11px] text-gray-500 font-medium truncate">Open DNS Page</p>
                          </div>
                          <ExternalLink size={14} className="ml-auto shrink-0 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </a>
                      )}
                      {detectedRegistrar === 'namecheap' && (
                        <a href={`https://ap.www.namecheap.com/Domains/DomainControlPanel/${(customDomainInput || dbData?.customDomain).replace('www.', '')}/advancedns`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group">
                          <div className="w-8 h-8 bg-[#de3723] rounded-lg flex items-center justify-center font-bold text-white shrink-0">N</div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-gray-900 text-sm truncate">Namecheap</p>
                            <p className="text-[11px] text-gray-500 font-medium truncate">Open DNS Page</p>
                          </div>
                          <ExternalLink size={14} className="ml-auto shrink-0 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </a>
                      )}
                      {detectedRegistrar === 'ionos' && (
                        <a href={`https://my.ionos.com/domain-details/${(customDomainInput || dbData?.customDomain).replace('www.', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group">
                          <div className="w-8 h-8 bg-[#003d8f] rounded-lg flex items-center justify-center font-bold text-white shrink-0">I</div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-gray-900 text-sm truncate">IONOS</p>
                            <p className="text-[11px] text-gray-500 font-medium truncate">Open DNS Page</p>
                          </div>
                          <ExternalLink size={14} className="ml-auto shrink-0 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </a>
                      )}
                      {detectedRegistrar === 'squarespace' && (
                        <a href={`https://account.squarespace.com/domains/managed/${(customDomainInput || dbData?.customDomain).replace('www.', '')}/dns`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all group">
                          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center font-bold text-white shrink-0">S</div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-gray-900 text-sm truncate">Squarespace</p>
                            <p className="text-[11px] text-gray-500 font-medium truncate">Open DNS Page</p>
                          </div>
                          <ExternalLink size={14} className="ml-auto shrink-0 text-gray-300 group-hover:text-black transition-colors" />
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="ml-0 md:ml-9 mt-4">
                    <p className="text-gray-600 mb-6 text-sm">We couldn't automatically detect your provider. Select it below to jump directly to your DNS management page.</p>
                    
                    {/* Fallback Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      <a href={`https://dcc.godaddy.com/manage/${(customDomainInput || dbData?.customDomain).replace('www.', '')}/dns`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group">
                        <div className="w-8 h-8 bg-[#1bdbdb] rounded-lg flex items-center justify-center font-bold text-black shrink-0">G</div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-900 text-sm truncate">GoDaddy</p>
                        </div>
                      </a>
                      <a href={`https://ap.www.namecheap.com/Domains/DomainControlPanel/${(customDomainInput || dbData?.customDomain).replace('www.', '')}/advancedns`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group">
                        <div className="w-8 h-8 bg-[#de3723] rounded-lg flex items-center justify-center font-bold text-white shrink-0">N</div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-900 text-sm truncate">Namecheap</p>
                        </div>
                      </a>
                      <a href={`https://my.ionos.com/domain-details/${(customDomainInput || dbData?.customDomain).replace('www.', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group">
                        <div className="w-8 h-8 bg-[#003d8f] rounded-lg flex items-center justify-center font-bold text-white shrink-0">I</div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-900 text-sm truncate">IONOS</p>
                        </div>
                      </a>
                      <a href={`https://account.squarespace.com/domains/managed/${(customDomainInput || dbData?.customDomain).replace('www.', '')}/dns`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all group">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center font-bold text-white shrink-0">S</div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-900 text-sm truncate">Squarespace</p>
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: Add Records */}
              {dnsRecords && (
                <div className="p-6 md:p-8 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs">2</span>
                    <h5 className="font-bold text-lg text-gray-900">Add these records</h5>
                  </div>
                  <p className="text-gray-600 mb-6 ml-9 text-sm">Copy and paste these exact values into your DNS settings to connect the domain.</p>

                  <div className="flex flex-col gap-3 ml-0 md:ml-9">
                    {dnsRecords.map((record: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm font-mono text-gray-800 items-center hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all">
                        <div className="md:col-span-2 md:border-r border-gray-200 pr-2">
                          <span className="text-[10px] text-gray-400 block mb-1 uppercase tracking-wider font-sans font-bold">Type</span>
                          <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded tracking-widest">{record.type}</span>
                        </div>
                        <div className="md:col-span-4 md:border-r border-gray-200 pr-2 overflow-hidden text-ellipsis">
                          <span className="text-[10px] text-gray-400 block mb-1 uppercase tracking-wider font-sans font-bold">Name / Host</span>
                          {record.name}
                        </div>
                        <div className="md:col-span-5 overflow-hidden text-ellipsis">
                          <span className="text-[10px] text-gray-400 block mb-1 uppercase tracking-wider font-sans font-bold">Target / Value</span>
                          {record.value}
                        </div>
                        <div className="md:col-span-1 flex justify-end mt-2 md:mt-0">
                          <button onClick={() => copyToClipboard(record.value)} className="w-full md:w-auto p-2.5 bg-white border border-gray-200 hover:bg-gray-100 hover:text-black rounded-lg text-gray-500 transition-colors shadow-sm flex justify-center items-center gap-2 group" title="Copy Value">
                            <Copy size={16} className="group-hover:text-blue-600" /> <span className="md:hidden font-sans text-xs font-semibold">Copy Value</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Verify */}
              <div className="p-6 md:p-8 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-green-700 font-medium bg-green-50 px-4 py-2.5 rounded-lg border border-green-200 w-full md:w-auto">
                  <CheckCircle2 size={18} className="text-green-600 shrink-0" /> SSL Certificate will be provisioned automatically.
                </div>
                
                <button
                  onClick={handleCheckStatus}
                  disabled={isChecking}
                  className="bg-black text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-md w-full md:w-auto"
                >
                  {isChecking ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
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

        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative w-full h-[750px] bg-gray-50 overflow-hidden"
        >
          <div
            ref={scrollRef}
            className="absolute inset-0 overflow-hidden"
            style={{ contain: 'paint' }}
          >
            <div id="export-container" className="w-full min-h-full bg-white flex flex-col relative pointer-events-none" suppressHydrationWarning>
              <WebsiteOne data={activeData} />
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}