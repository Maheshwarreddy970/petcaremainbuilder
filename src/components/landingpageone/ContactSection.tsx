"use client";

import React, { useState } from 'react';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitContactFormAction } from '@/actions/contact';

export default function ContactSection({ data, globalEmail }: { data: any, globalEmail: string }) {
    if (!data) return null;

    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        const formData = new FormData(e.currentTarget);
        // Inject the target email pulled from the footer settings
        formData.append("targetEmail", globalEmail);

        const res = await submitContactFormAction(formData);

        if (res.success) {
            setStatus("success");
            (e.target as HTMLFormElement).reset();
        } else {
            setStatus("error");
            setErrorMessage(res.error || "Something went wrong.");
        }
    };

    return (
        <section id='contact' className={cn("py-24 w-full overflow-hidden", data.section?.className)} style={{ backgroundColor: data.section?.bg || data.bg || "#ffffff" }}>
            <div className="max-w-3xl mx-auto px-6 md:px-12 flex flex-col items-center">
                
                <div className="text-center mb-10">
                    <h2 className={cn("font-medium text-4xl md:text-[48px] leading-[1.2] tracking-[-1.5px] mb-4", data.heading?.className)} style={{ color: data.heading?.color || data.headingColor }}>
                        {data.heading?.text || data.heading || "Get in Touch"}
                    </h2>
                    <p className={cn("text-base md:text-[18px] leading-[1.6]", data.description?.className)} style={{ color: data.description?.color || data.descColor }}>
                        {data.description?.text || data.description || "Have questions? Send us a message and we'll reply directly to your email."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full bg-gray-50 border border-gray-200 p-8 rounded-3xl shadow-sm flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                            <input required name="name" type="text" placeholder="John Doe" className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                            <input required name="email" type="email" placeholder="john@example.com" className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white" />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Message</label>
                        <textarea required name="message" rows={4} placeholder="How can we help you?" className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black bg-white resize-none" />
                    </div>

                    {status === "error" && <p className="text-red-500 text-sm font-medium">{errorMessage}</p>}
                    {status === "success" && <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg"><CheckCircle2 size={18} /> Message sent successfully!</div>}

                    <button disabled={status === "loading" || status === "success"} type="submit" className="mt-2 w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white transition-all disabled:opacity-70 shadow-md hover:opacity-90" style={{ backgroundColor: data.button?.bg || "#a35c38" }}>
                        {status === "loading" ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> {data.button?.label || "Send Message"}</>}
                    </button>
                </form>

            </div>
        </section>
    );
}