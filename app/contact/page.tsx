"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, AlertCircle, Info, ExternalLink } from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";

export default function ContactPage() {
  const [category, setCategory] = useState("feedback");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [preparedMailto, setPreparedMailto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError("Please enter your message or feedback.");
      return;
    }

    setError(null);
    const configuredEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
    const destinationEmail = configuredEmail || "development-placeholder@imagefit.local";
    const subject = `[ImageFit ${category.toUpperCase()}] ${email ? `from ${email}` : "Feedback"}`;
    const body = `Category: ${category}\nSender: ${email || "Anonymous"}\n\nMessage:\n${message}\n\n---\nSent from ImageFit Client-Side Feedback Form`;
    const mailtoUrl = `mailto:${destinationEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setPreparedMailto(mailtoUrl);
    // Trigger user mail client
    window.location.href = mailtoUrl;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-cobalt transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cobalt/10 text-cobalt text-sm font-semibold">
          <MessageSquare className="w-4 h-4" />
          <span>Feedback & Contact</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink tracking-tight">
          Contact & Feedback
        </h1>
        <p className="text-lg sm:text-xl text-slate leading-relaxed">
          Found a bug, want a new target-size preset, or have suggestions for ImageFit? We&apos;d love to hear from you.
        </p>
      </header>

      {/* Transparent architecture notice */}
      <div className="flex items-start gap-3.5 p-6 sm:p-7 rounded-3xl border border-info/30 bg-info-light text-ink text-[15px] sm:text-[16px] leading-[1.7]">
        <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div className="space-y-2">
          <strong className="text-info font-bold block text-base sm:text-lg">Client-Side Architecture & Email Delivery:</strong>
          <p className="text-slate">
            ImageFit operates entirely in your browser without an application database or backend message queue. Submitting this form prepares an email draft in your local email application (via standard <code>mailto:</code> link) to deliver your feedback directly.
          </p>
          {!process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
            <p className="text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs sm:text-sm leading-relaxed">
              <strong>Development Placeholder:</strong> No live contact address is currently configured in the <code>NEXT_PUBLIC_CONTACT_EMAIL</code> environment variable. The draft is addressed to <code>development-placeholder@imagefit.local</code>. Please verify or update the recipient address in your email client before sending.
            </p>
          )}
        </div>
      </div>

      <div className="relative rounded-3xl bg-white border border-border p-7 sm:p-9 shadow-card">
        <CropCorners size={18} color="text-cobalt" />

        {preparedMailto ? (
          <div className="text-center py-8 space-y-5 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-cobalt/10 text-cobalt flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-ink">Email Client Draft Prepared</h2>
            <p className="text-base text-slate max-w-md mx-auto leading-relaxed">
              Because ImageFit does not store personal messages in an online database, your default email application was opened with your message ready to send.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={preparedMailto}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-cobalt text-white text-sm font-bold hover:bg-cobalt-hover transition-colors"
              >
                <span>Re-open Email Draft</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setPreparedMailto(null);
                  setMessage("");
                  setEmail("");
                }}
                className="text-sm font-bold text-slate hover:text-ink px-4 py-2.5"
              >
                Compose another message
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-bold uppercase tracking-wider text-ink mb-2 font-heading">
                Feedback Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-cloud text-ink text-base focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt transition-colors"
              >
                <option value="feedback">General Feedback</option>
                <option value="preset-request">Preset or Format Request</option>
                <option value="bug">Report an Issue or Bug</option>
                <option value="other">Other Inquiry</option>
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold uppercase tracking-wider text-ink mb-2 font-heading">
                Your Email Address <span className="text-slate font-normal">(Optional)</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-cloud text-ink text-base focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt transition-colors placeholder:text-slate/60"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-bold uppercase tracking-wider text-ink mb-2 font-heading">
                Your Message
              </label>
              <textarea
                id="message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your suggestion, format request, or issue..."
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-cloud text-ink text-base focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt transition-colors placeholder:text-slate/60 resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-error-light text-error text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-cobalt text-white font-heading font-bold text-base hover:bg-cobalt-hover transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
            >
              <Mail className="w-5 h-5" />
              <span>Compose Email Draft</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
