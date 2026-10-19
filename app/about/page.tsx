import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CheckCircle2, Target, Users } from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";
import { BRAND } from "@/lib/constants";

export const metadata = {
  title: "About ImageFit — Precision Image Optimization",
  description:
    "Learn about ImageFit, our mission for honest file-size compression, in-browser privacy, and precision tooling.",
};

export default function AboutPage() {
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

      <header className="space-y-4">
        <span className="text-sm font-bold uppercase tracking-wider text-cobalt px-3 py-1.5 rounded-lg bg-cobalt/10 inline-block">
          Our Philosophy
        </span>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink tracking-tight">
          About ImageFit
        </h1>
        <p className="text-lg sm:text-xl text-slate leading-relaxed">
          {BRAND.slogan} We believe an image tool should be dependable, honest, and completely respectful of your privacy.
        </p>
      </header>

      <div className="space-y-6 text-slate leading-[1.72] text-[17px] sm:text-[18px]">
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink pt-2">Why We Built ImageFit</h2>
        <p>
          Too many image utility sites force users through cluttered ad banners, deceptive &ldquo;Start Download&rdquo; traps, and vague sliders that leave you guessing whether your photo meets an institution&apos;s strict 100 KB limit.
        </p>
        <p>
          ImageFit was created as a <strong>precision tool</strong>. We built an engine that directly measures the resulting Blob size in your browser memory and provides clear, truthful feedback: if the file meets your limit, it turns green; if not, we tell you exactly how many kilobytes remain and suggest realistic dimension adjustments.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
          <div className="rounded-3xl bg-white border border-border p-7 sm:p-8 shadow-card space-y-3">
            <Target className="w-8 h-8 text-cobalt" />
            <h3 className="font-heading font-bold text-ink text-xl sm:text-2xl">Verified Limits</h3>
            <p className="text-[16px] sm:text-[17px] text-slate leading-[1.7]">
              We never label a file &ldquo;Target Met&rdquo; unless the exact byte count is verified to be under your target limit.
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-border p-7 sm:p-8 shadow-card space-y-3">
            <ShieldCheck className="w-8 h-8 text-success" />
            <h3 className="font-heading font-bold text-ink text-xl sm:text-2xl">100% In-Browser Privacy</h3>
            <p className="text-[16px] sm:text-[17px] text-slate leading-[1.7]">
              Your files never leave your device. All compression and format conversion occurs inside your local browser memory.
            </p>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink pt-2">Who ImageFit Is For</h2>
        <p>
          Whether you are a student submitting passport photos for an exam board, a designer optimizing UI assets, or a website manager striving for faster loading times, ImageFit gives you exact control without subscriptions or sign-ups.
        </p>
      </div>
    </div>
  );
}
