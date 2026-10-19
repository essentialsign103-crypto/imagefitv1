import React from "react";
import Link from "next/link";
import { Maximize2, ArrowLeft, HelpCircle } from "lucide-react";
import { ImageResizer } from "@/components/resizer/ImageResizer";

export const metadata = {
  title: "Image Resizer — Dimensions, Aspect Ratio & Fit/Crop | ImageFit",
  description:
    "Resize image pixel width and height with aspect ratio locking, contain/cover crop modes, and visual previews. 100% in-browser Canvas processing.",
};

export default function ResizerPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
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

      {/* Tool Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cobalt/10 text-cobalt text-sm font-semibold">
          <Maximize2 className="w-4 h-4" />
          <span>Professional Dimension Resizer</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink tracking-tight">
          Resize Image Dimensions
        </h1>
        <p className="text-lg text-slate leading-relaxed max-w-3xl">
          Scale pixel dimensions accurately with proportional aspect-ratio locking, contain fit, or cover crop modes. Real-time in-browser Canvas processing with high-quality smoothing.
        </p>
      </div>

      {/* Main Interactive Resizer Workspace */}
      <ImageResizer />

      {/* Helpful Instructions & FAQ */}
      {/* Helpful Instructions & FAQ */}
      <div className="pt-12 border-t border-border space-y-8">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-7 h-7 text-cobalt flex-shrink-0" />
          <h2 className="text-2xl sm:text-[30px] font-heading font-extrabold text-ink leading-tight">
            Frequently Asked Questions about Resizing & Aspect Ratios
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8">
          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-start">
            <h3 className="text-lg sm:text-[20px] font-heading font-bold text-ink leading-snug">
              What is the difference between Fit (Contain) and Crop (Cover)?
            </h3>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
              <strong className="text-ink font-semibold">Fit (Contain)</strong> preserves the entire original image without cropping, fitting it inside your requested bounding box while maintaining the original proportions. <strong className="text-ink font-semibold">Crop (Cover)</strong> fills the exact requested dimensions by scaling proportionally and trimming excess edges.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-start">
            <h3 className="text-lg sm:text-[20px] font-heading font-bold text-ink leading-snug">
              Why is aspect ratio lock enabled by default?
            </h3>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
              Aspect ratio locking prevents accidental visual distortion (squishing or stretching). When locked, editing either width or height automatically calculates the other dimension proportionally. You can unlock it anytime if you intentionally want custom unconstrained dimensions.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-start">
            <h3 className="text-lg sm:text-[20px] font-heading font-bold text-ink leading-snug">
              What happens if I upscale an image?
            </h3>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
              Upscaling increases pixel dimensions beyond the original resolution. ImageFit uses high-quality bicubic canvas interpolation, but upscaling cannot invent detail that was never in the original file. A notice will appear displaying the upscale factor.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-start">
            <h3 className="text-lg sm:text-[20px] font-heading font-bold text-ink leading-snug">
              How is transparency handled when resizing?
            </h3>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
              If your original PNG or WebP image contains transparency, choosing PNG or WebP preserves the alpha channel. If you choose JPEG, transparency cannot be saved and will be flattened against a clean white background.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
