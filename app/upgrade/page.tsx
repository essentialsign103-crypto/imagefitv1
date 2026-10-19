import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Archive,
  Sliders,
  Palette,
  FileCheck,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  Clock,
  Cpu,
  Lock,
} from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";

export const metadata: Metadata = {
  title: "Upgrade Concept Preview — Proposed Capabilities | ImageFit",
  description:
    "Explore proposed future capabilities for ImageFit. A transparent, non-transacting preview of concepts under evaluation including client-side batch processing, ZIP export, and saved presets.",
};

export default function UpgradePage() {
  return (
    <div className="flex flex-col space-y-16 sm:space-y-24 py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      {/* 1. Header & Transparent Concept Disclaimer */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cobalt/10 text-cobalt text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Non-Transacting Exploration</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink tracking-tight leading-[1.15]">
          Upgrade Concept <span className="text-cobalt">Preview</span>
        </h1>

        <p className="text-base sm:text-lg text-slate leading-relaxed">
          ImageFit is <strong className="text-ink font-semibold">100% free and fully client-side</strong>. This page presents a design concept of potential power-user capabilities under technical evaluation. No payment processing, subscriptions, or accounts exist today.
        </p>

        {/* Notice Card */}
        <div className="p-4 rounded-xl border border-border bg-white shadow-card text-xs text-slate flex items-start sm:items-center gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong className="text-ink font-semibold">Guaranteed Privacy Architecture:</strong> Even if advanced workflows are introduced in the future, ImageFit will never compromise its core principle: zero server image uploads, zero telemetry, and permanent free access to existing core tools.
          </p>
        </div>
      </section>

      {/* 2. Side-by-Side Comparison Architecture */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
            Current Free Features vs. Proposed Concepts
          </h2>
          <p className="text-sm text-slate">
            Clear visibility into what is live today versus what is being evaluated for future releases.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Column 1: Current Free Capabilities */}
          <div className="relative rounded-2xl bg-white border-2 border-border p-6 sm:p-8 shadow-card flex flex-col justify-between">
            <CropCorners size={16} color="text-slate/30" />

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-success-light text-success">
                    Active & Available Now
                  </span>
                  <span className="text-xs font-semibold text-slate">Always 100% Free</span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-ink">
                  Core ImageFit Experience
                </h3>
                <p className="text-sm text-slate leading-relaxed">
                  Fast, accurate, single-file precision image tools running directly in your browser.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-3.5 text-sm" role="list">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink font-semibold block">Target-Size Compression:</strong>
                    <span className="text-slate text-xs leading-relaxed">
                      Iterative binary search to guarantee files meet strict caps (50 KB, 100 KB, 200 KB, or custom bytes).
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink font-semibold block">Dimension Resizing with Aspect Lock:</strong>
                    <span className="text-slate text-xs leading-relaxed">
                      Scale to precise pixel width and height with contain, cover, and distortion prevention.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink font-semibold block">Multi-Format Conversion:</strong>
                    <span className="text-slate text-xs leading-relaxed">
                      Convert between JPEG, PNG, and WebP with strict output MIME verification and alpha detection.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink font-semibold block">100% Client-Side Privacy:</strong>
                    <span className="text-slate text-xs leading-relaxed">
                      All encoding executes in local browser memory via HTML5 Canvas. Zero network bytes transmitted.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-ink font-semibold block">Zero Registration or Friction:</strong>
                    <span className="text-slate text-xs leading-relaxed">
                      No email signup, no passwords, no forced accounts, and no artificial daily limits.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="pt-8 mt-8 border-t border-border">
              <Link
                href="/tools/image-compressor"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cloud text-ink font-semibold text-sm hover:bg-slate-light/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
              >
                <span>Use Current Free Tools</span>
                <ArrowRight className="w-4 h-4 text-cobalt" />
              </Link>
            </div>
          </div>

          {/* Column 2: Proposed Upgrade Concept */}
          <div className="relative rounded-2xl bg-white border-2 border-cobalt/40 p-6 sm:p-8 shadow-elevated flex flex-col justify-between">
            <CropCorners size={16} color="text-cobalt" />

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-cobalt/10 text-cobalt">
                    Proposed Future Concept
                  </span>
                  <span className="text-xs font-semibold text-cobalt">In Evaluation</span>
                </div>
                <h3 className="text-2xl font-heading font-bold text-ink">
                  ImageFit Workflow Extension
                </h3>
                <p className="text-sm text-slate leading-relaxed">
                  Exploratory concept for high-volume designers, web developers, and administrative teams.
                </p>
              </div>

              {/* Proposed Features List */}
              <ul className="space-y-3.5 text-sm" role="list">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-cobalt/10 text-cobalt flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-ink font-semibold block">Client-Side Batch Queue:</strong>
                    <span className="text-slate text-xs leading-relaxed">
                      Process up to 20 images sequentially in browser memory without crashing browser tabs.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-cobalt/10 text-cobalt flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Archive className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-ink font-semibold block">Bundled ZIP Archive Export:</strong>
                    <span className="text-slate text-xs leading-relaxed">
                      Compress and package all processed batch outputs into a single structured .zip download.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-cobalt/10 text-cobalt flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sliders className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-ink font-semibold block">Persistent Custom Preset Profiles:</strong>
                    <span className="text-slate text-xs leading-relaxed">
                      Save organizational dimension targets (e.g., &ldquo;E-commerce Catalog&rdquo; or &ldquo;Job Portal&rdquo;) in local browser storage.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-cobalt/10 text-cobalt flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Palette className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-ink font-semibold block">Granular Alpha Matte Control:</strong>
                    <span className="text-slate text-xs leading-relaxed">
                      Select background fill color when converting transparent PNG assets into non-alpha formats.
                    </span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-cobalt/10 text-cobalt flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-ink font-semibold block">Offline PWA Installation:</strong>
                    <span className="text-slate text-xs leading-relaxed">
                      Install ImageFit as a standalone desktop or mobile web application with offline support.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="pt-8 mt-8 border-t border-border">
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cobalt text-white font-semibold text-sm hover:bg-cobalt-hover transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Share Feedback on Proposed Concepts</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Deep-Dive: Honest Architectural Approach */}
      <section className="rounded-3xl bg-ink text-white p-8 sm:p-12 relative overflow-hidden border border-transparent dark:border-border">
        <CropCorners size={20} color="text-white/20" />

        <div className="max-w-3xl space-y-4 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-lime px-2.5 py-1 rounded bg-lime/10 inline-block">
            Engineering Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">
            How Future Concepts Will Uphold Client-Side Integrity
          </h2>
          <p className="text-slate-light dark:text-slate text-sm sm:text-base leading-relaxed">
            Many web apps use &ldquo;batch processing&rdquo; as an excuse to upload user images to cloud servers. ImageFit rejects that model.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2.5 bg-white/5 rounded-2xl p-6 border border-white/10 dark:bg-cloud/40 dark:border-border">
            <Cpu className="w-6 h-6 text-lime" />
            <h3 className="font-heading font-bold text-base text-white">Browser Concurrency</h3>
            <p className="text-xs text-slate-light dark:text-slate leading-relaxed">
              Batch processing will execute sequentially or via isolated browser pipelines to preserve device memory without thermal throttling.
            </p>
          </div>

          <div className="space-y-2.5 bg-white/5 rounded-2xl p-6 border border-white/10 dark:bg-cloud/40 dark:border-border">
            <Archive className="w-6 h-6 text-lime" />
            <h3 className="font-heading font-bold text-base text-white">Local In-Memory ZIP</h3>
            <p className="text-xs text-slate-light dark:text-slate leading-relaxed">
              Archive generation will package output Blobs directly in client JavaScript memory without ever touching an external file server.
            </p>
          </div>

          <div className="space-y-2.5 bg-white/5 rounded-2xl p-6 border border-white/10 dark:bg-cloud/40 dark:border-border">
            <Lock className="w-6 h-6 text-lime" />
            <h3 className="font-heading font-bold text-base text-white">Zero Telemetry Promise</h3>
            <p className="text-xs text-slate-light dark:text-slate leading-relaxed">
              Image dimensions, filenames, and contents remain strictly inside your browser sandbox. No user tracking or analytics harvesting.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Honest Disclaimers & FAQ */}
      <section className="space-y-8 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
            Frequently Asked Questions & Disclaimers
          </h2>
          <p className="text-sm text-slate">
            Straightforward answers about ImageFit&apos;s current capabilities and future direction.
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="font-heading font-bold text-ink text-base">
              Will existing free features ever be placed behind a paywall?
            </h3>
            <p className="text-sm text-slate leading-relaxed">
              No. Our core tools—compression to target size (50 KB, 100 KB, 200 KB, custom), dimension resizing with aspect lock, and format conversion—are designed to remain free, accessible, and client-side permanently.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="font-heading font-bold text-ink text-base">
              Can I purchase a subscription or upgrade today?
            </h3>
            <p className="text-sm text-slate leading-relaxed">
              No. There is no payment gateway, credit card processing, checkout flow, or active subscription model. This page exists solely to gather user feedback and gauge interest in potential power-user extensions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-border shadow-card space-y-2">
            <h3 className="font-heading font-bold text-ink text-base">
              How can I support the project or request a specific feature?
            </h3>
            <p className="text-sm text-slate leading-relaxed">
              We welcome suggestions for new presets, additional format support, or edge-case handling. You can reach out directly via our{" "}
              <Link href="/contact" className="text-cobalt font-semibold hover:underline">
                Contact & Feedback page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
