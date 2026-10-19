import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles, ArrowLeft, ShieldCheck, CheckCircle2, HelpCircle, Cpu, Lock } from "lucide-react";
import { BackgroundStudio } from "@/components/studio/BackgroundStudio";

export const metadata: Metadata = {
  title: "Background Studio — In-Browser AI Background Remover & Maker | ImageFit",
  description:
    "Isolate subjects with genuine alpha transparency, design custom studio backdrops, and export high-resolution PNG, WebP, or JPEG files. 100% local client-side processing with zero server uploads.",
  openGraph: {
    title: "Background Studio — In-Browser AI Background Remover & Maker | ImageFit",
    description:
      "Isolate subjects with genuine alpha transparency, design custom studio backdrops, and export high-resolution PNG, WebP, or JPEG files. 100% local client-side processing with zero server uploads.",
    type: "website",
  },
};

export default function BackgroundStudioPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      {/* Breadcrumb / Back link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-cobalt transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Interactive Background Studio */}
      <BackgroundStudio />

      {/* Helpful Instructions & FAQ */}
      <section className="pt-12 border-t border-border space-y-8">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-7 h-7 text-cobalt flex-shrink-0" />
          <h2 className="text-2xl sm:text-[30px] font-heading font-extrabold text-ink leading-tight">
            Frequently Asked Questions about Background Studio
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8">
          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-start">
            <h3 className="text-lg sm:text-[20px] font-heading font-bold text-ink flex items-start gap-3 leading-snug">
              <Cpu className="w-6 h-6 text-cobalt flex-shrink-0 mt-0.5" />
              <span>How does in-browser background removal work?</span>
            </h3>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
              ImageFit executes machine learning vision models (BiRefNet Lite and MODNet) directly inside your web browser using WebAssembly and WebGPU via Transformers.js and ONNX Runtime Web. Your image pixels are processed in your computer’s local memory rather than transmitted across the internet to a third-party server.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-start">
            <h3 className="text-lg sm:text-[20px] font-heading font-bold text-ink flex items-start gap-3 leading-snug">
              <Sparkles className="w-6 h-6 text-cobalt flex-shrink-0 mt-0.5" />
              <span>Which model should I choose?</span>
            </h3>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
              <strong className="text-ink font-semibold">BiRefNet Lite (Universal):</strong> Recommended for e-commerce products, vehicles, animals, apparel, and general foreground objects under the permissive MIT license (~224 MB full-precision weights).<br className="my-2" />
              <strong className="text-ink font-semibold">MODNet (Portrait Matting):</strong> Specifically tailored for human portraits, headshots, and fine hair contours under the Apache-2.0 license (~25 MB weights). Not intended for inanimate objects.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-start">
            <h3 className="text-lg sm:text-[20px] font-heading font-bold text-ink flex items-start gap-3 leading-snug">
              <CheckCircle2 className="w-6 h-6 text-cobalt flex-shrink-0 mt-0.5" />
              <span>Why does the initial run take a few moments?</span>
            </h3>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
              Because execution takes place locally in your browser, the neural network model weights (~224 MB for BiRefNet Lite, ~25 MB for MODNet) download from the Hugging Face model repository on the very first run. The browser automatically caches these weights. Subsequent removals on any image initialize immediately without re-downloading.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-start">
            <h3 className="text-lg sm:text-[20px] font-heading font-bold text-ink flex items-start gap-3 leading-snug">
              <Lock className="w-6 h-6 text-cobalt flex-shrink-0 mt-0.5" />
              <span>Are my photos private and secure?</span>
            </h3>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
              Yes. Your image pixels, file metadata, and composition edits remain exclusively in local browser RAM and are never uploaded to any server. The only network request made is retrieving the public model weights from Hugging Face during initial load.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
