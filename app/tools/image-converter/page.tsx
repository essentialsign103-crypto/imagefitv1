import React from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft, HelpCircle } from "lucide-react";
import { ImageConverter } from "@/components/converter/ImageConverter";

export const metadata = {
  title: "Image Converter — Convert JPEG, PNG, WebP with MIME Verification | ImageFit",
  description:
    "Convert images between JPEG, PNG, and WebP with actual output MIME verification, transparency flattening controls, and honest file size measurements. 100% in-browser.",
};

export default function ConverterPage() {
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
          <RefreshCw className="w-4 h-4" />
          <span>Verified Format Conversion</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink tracking-tight">
          Convert Image Format
        </h1>
        <p className="text-lg text-slate leading-relaxed max-w-3xl">
          Convert between tested web formats (JPEG, PNG, WebP) with verified output MIME types, explicit alpha transparency controls, and honest byte-size measurements.
        </p>
      </div>

      {/* Main Interactive Converter Engine */}
      <ImageConverter />

      {/* Helpful Instructions & FAQ */}
      {/* Helpful Instructions & FAQ */}
      <div className="pt-12 border-t border-border space-y-8">
        <div className="flex items-center gap-3">
          <HelpCircle className="w-7 h-7 text-cobalt flex-shrink-0" />
          <h2 className="text-2xl sm:text-[30px] font-heading font-extrabold text-ink leading-tight">
            Frequently Asked Questions about Format Conversion
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 sm:gap-8">
          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-start">
            <h3 className="text-lg sm:text-[20px] font-heading font-bold text-ink leading-snug">
              Why does converting JPEG to PNG make the file size larger?
            </h3>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
              JPEG is a lossy format that discards subtle color data to achieve tiny file sizes. PNG is a lossless format (Deflate compression) that stores every single pixel with exact precision. Converting from lossy to lossless cannot restore lost fidelity, but stores all existing pixels losslessly, which typically increases the byte size.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-start">
            <h3 className="text-lg sm:text-[20px] font-heading font-bold text-ink leading-snug">
              How does ImageFit verify the actual output format?
            </h3>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
              Some browser canvas encoders silently fall back to PNG when a requested format (such as WebP on older browsers) is unsupported. ImageFit explicitly inspects the resulting Blob MIME type and verifies that it strictly matches what you requested before declaring success.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-start">
            <h3 className="text-lg sm:text-[20px] font-heading font-bold text-ink leading-snug">
              What happens to transparent pixels when converting to JPEG?
            </h3>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
              The JPEG standard has no alpha transparency channel. ImageFit never silently replaces transparency with ugly black backgrounds. Instead, you can choose an explicit background color (default pure white) to cleanly flatten transparent areas before encoding.
            </p>
          </div>

          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-border shadow-card space-y-4 flex flex-col justify-start">
            <h3 className="text-lg sm:text-[20px] font-heading font-bold text-ink leading-snug">
              Are vector formats like SVG or animated GIFs supported?
            </h3>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
              No. SVG is an XML-based vector format and animated GIFs contain multiple time-sequenced frames. ImageFit focuses on high-performance static raster conversions (JPEG, PNG, WebP) with verified pixel-perfect local Canvas rendering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
