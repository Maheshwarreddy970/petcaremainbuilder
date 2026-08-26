"use client";

import React, { useState } from 'react';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitContactFormAction } from '@/actions/contact';

export default function ContactSection({ data, slug }: { data: any, slug?: string }) {
    if (!data) return null;

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        const formData = new FormData(e.currentTarget);
        const res = await submitContactFormAction(formData);

        if (res.success) {
            setStatus("success");
            (e.target as HTMLFormElement).reset();
            // Reset to idle after a few seconds so they can send another if needed
            setTimeout(() => setStatus("idle"), 5000);
        } else {
            setStatus("error");
            setErrorMessage(res.error || "Something went wrong.");
        }
    };

    return (
        <section id='contact' className={cn("py-24 w-full overflow-hidden", data.section?.className)} style={{ backgroundColor: data.section?.bg || data.bg || "#ffffff" }}>
            <div className="max-w-3xl mx-auto px-6 md:px-12 flex flex-col items-center">
                
                <div className="text-center mb-12 max-w-2xl">
                    <h2 className={cn("font-medium text-4xl md:text-[48px] leading-[1.2] tracking-[-1.5px] mb-4", data.heading?.className)} style={{ color: data.heading?.color || data.headingColor }}>
                        {data.heading?.text || data.heading || "Get in Touch"}
                    </h2>
                    <p className={cn("text-base md:text-[18px] leading-[1.6]", data.description?.className)} style={{ color: data.description?.color || data.descColor }}>
                        {data.description?.text || data.description || "Have questions? Send us a message and we'll reply directly to your email."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full bg-white/50 backdrop-blur-md border border-black/5 p-8 md:p-10 rounded-[24px] shadow-sm flex flex-col gap-6">
                    {/* Hidden input to pass the site identifier to the server securely */}
                    {slug && <input type="hidden" name="slug" value={slug} />}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-800 ml-1">Full Name *</label>
                            <input required name="name" type="text" placeholder="John Doe" className="px-4 py-3.5 rounded-xl border border-black/10 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white/80 transition-all text-gray-900" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-800 ml-1">Email Address *</label>
                            <input required name="email" type="email" placeholder="john@example.com" className="px-4 py-3.5 rounded-xl border border-black/10 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white/80 transition-all text-gray-900" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-800 ml-1">Phone Number *</label>
                        <input required name="phone" type="tel" placeholder="(555) 123-4567" className="px-4 py-3.5 rounded-xl border border-black/10 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white/80 transition-all text-gray-900" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-800 ml-1">Message *</label>
                        <textarea required name="message" rows={4} placeholder="How can we help you and your pet?" className="px-4 py-3.5 rounded-xl border border-black/10 focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white/80 transition-all resize-none text-gray-900" />
                    </div>

                    {status === "error" && <p className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">{errorMessage}</p>}
                    {status === "success" && <div className="flex items-center gap-2 text-green-700 font-medium bg-green-50/80 border border-green-200 p-4 rounded-xl"><CheckCircle2 size={20} /> Your message has been sent successfully!</div>}

                    <button disabled={status === "loading" || status === "success"} type="submit" className={cn("mt-2 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-[16px] transition-all disabled:opacity-70 shadow-sm hover:opacity-90 hover:shadow-md", data.button?.className)} style={{ backgroundColor: data.button?.bg || "#a35c38", color: data.button?.text || "#ffffff" }}>
                        {status === "loading" ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> {data.button?.label || "Send Message"}</>}
                    </button>
                </form>

            </div>
        </section>
    );
}