import React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, ArrowLeft } from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";

export const metadata = {
  title: "Image Optimization Guides & Tutorials | ImageFit",
  description:
    "Learn practical techniques for reducing image file size, understanding aspect ratios, and preparing images for websites and admissions portals.",
};

export default function GuidesPage() {
  const guides = [
    {
      slug: "reduce-image-size",
      title: "How to Reduce Image File Size Without Noticeable Quality Loss",
      description:
        "Understand the difference between lossy and lossless compression, quality thresholds, and when dimension scaling is necessary.",
      category: "Compression",
      readTime: "5 min read",
    },
    {
      slug: "image-dimensions-and-aspect-ratio",
      title: "Image Dimensions vs File Size: Pixels, DPI, and Aspect Ratios Explained",
      description:
        "Why a 4000×3000px image takes megabytes, how aspect ratios prevent distortion, and choosing the right dimensions for the web.",
      category: "Dimensions",
      readTime: "4 min read",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate hover:text-cobalt transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cobalt/10 text-cobalt text-sm font-semibold">
          <BookOpen className="w-4 h-4" />
          <span>Educational Guides</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink tracking-tight">
          Image Optimization Guides
        </h1>
        <p className="text-lg sm:text-xl text-slate leading-relaxed max-w-3xl">
          Practical, honest guides to help you meet application requirements and optimize images for the web.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="group relative rounded-3xl bg-white border border-border p-7 sm:p-9 shadow-card hover:shadow-elevated transition-all space-y-4 block"
          >
            <CropCorners size={16} color="text-cobalt/30 group-hover:text-cobalt" />
            <div className="flex items-center justify-between text-sm text-slate">
              <span className="font-bold text-cobalt bg-cobalt/10 px-3 py-1 rounded-md text-xs uppercase tracking-wider">
                {guide.category}
              </span>
              <span>{guide.readTime}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink group-hover:text-cobalt transition-colors">
              {guide.title}
            </h2>
            <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">{guide.description}</p>
            <div className="pt-2 flex items-center gap-2 text-base font-bold text-cobalt">
              <span>Read Guide</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
