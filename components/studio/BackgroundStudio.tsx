"use client";
/* eslint-disable @next/next/no-img-element -- In-memory Blob object URLs are client-generated and cannot be passed to Next.js server-side optimization */

import React, { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  RotateCcw,
  Sliders,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Layers,
  Palette,
  Info,
  Check,
  Cpu,
  RefreshCw,
  Move,
  ZoomIn,
  Eye,
  ImageIcon,
  Maximize2,
  Settings2,
} from "lucide-react";
import { CropCorners } from "@/components/brand/CropCorners";
import {
  PROCESSING_LIMITS,
  STUDIO_MODELS,
  STUDIO_SOLID_PRESETS,
  STUDIO_GRADIENT_PRESETS,
  STUDIO_SCENE_PRESETS,
} from "@/lib/constants";
import { formatBytes } from "@/lib/utils";
import {
  ImageMeta,
  OutputFormat,
  canvasToBlob,
  detectAlphaChannel,
} from "@/lib/image-processing/compressor";
import {
  StudioBackgroundConfig,
  StudioSubjectTransform,
  StudioRemovalProgress,
  CutoutResult,
  StudioExportResult,
  DEFAULT_STUDIO_BACKGROUND,
  DEFAULT_STUDIO_TRANSFORM,
  removeBackgroundClient,
  drawStudioBackground,
  drawStudioSubject,
  composeStudio,
  exportStudioCanvas,
  generateStudioFilename,
} from "@/lib/image-processing/studio";

export function BackgroundStudio() {
  // Input Image State
  const [selectedImage, setSelectedImage] = useState<ImageMeta | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Model & Processing State
  const [selectedModelId, setSelectedModelId] = useState<string>(STUDIO_MODELS[0].id);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [removalProgress, setRemovalProgress] = useState<StudioRemovalProgress>({
    stage: "idle",
    message: "Ready to isolate foreground subject.",
  });
  const [cutoutResult, setCutoutResult] = useState<CutoutResult | null>(null);

  // Studio Composition State
  const [bgConfig, setBgConfig] = useState<StudioBackgroundConfig>(DEFAULT_STUDIO_BACKGROUND);
  const [transform, setTransform] = useState<StudioSubjectTransform>(DEFAULT_STUDIO_TRANSFORM);
  const [customBgImageElement, setCustomBgImageElement] = useState<HTMLImageElement | null>(null);
  const [customBgFileName, setCustomBgFileName] = useState<string | null>(null);

  // Export State
  const [exportFormat, setExportFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState<number>(0.92);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportResult, setExportResult] = useState<StudioExportResult | null>(null);

  // Preview & View Modes
  const [activeTab, setActiveTab] = useState<"studio" | "cutout" | "original">("studio");
  const [activeCategory, setActiveCategory] = useState<"transparent" | "solid" | "gradient" | "preset" | "custom">("transparent");

  // DOM Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const cutoutImageRef = useRef<HTMLImageElement | null>(null);
  const activeRequestIdRef = useRef<number>(0);

  // Clean up Object URLs when unmounting or changing files
  const cleanupUrls = useCallback(() => {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    if (cutoutResult?.cutoutUrl) {
      URL.revokeObjectURL(cutoutResult.cutoutUrl);
    }
    if (exportResult?.url) {
      URL.revokeObjectURL(exportResult.url);
    }
    if (bgConfig.customImageUrl) {
      URL.revokeObjectURL(bgConfig.customImageUrl);
    }
  }, [selectedImage, cutoutResult, exportResult, bgConfig.customImageUrl]);

  useEffect(() => {
    return () => {
      cleanupUrls();
    };
  }, [cleanupUrls]);

  // Live Canvas Preview Draw
  const drawLivePreview = useCallback(() => {
    const canvas = previewCanvasRef.current;
    const cutoutImg = cutoutImageRef.current;
    if (!canvas || !cutoutImg) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = cutoutImg.naturalWidth || cutoutImg.width || 800;
    const height = cutoutImg.naturalHeight || cutoutImg.height || 600;

    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    drawStudioBackground(ctx, width, height, bgConfig, customBgImageElement);

    // 2. Draw Transformed Subject
    drawStudioSubject(ctx, cutoutImg, width, height, transform);
  }, [bgConfig, transform, customBgImageElement]);

  // Load Cutout image into memory ref for canvas compositing
  useEffect(() => {
    if (cutoutResult?.cutoutUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        cutoutImageRef.current = img;
        drawLivePreview();
      };
      img.src = cutoutResult.cutoutUrl;
    } else {
      cutoutImageRef.current = null;
    }
  }, [cutoutResult, drawLivePreview]);

  useEffect(() => {
    drawLivePreview();
  }, [drawLivePreview]);

  // Full reset handler
  const handleReset = useCallback(() => {
    activeRequestIdRef.current++;
    cleanupUrls();
    setSelectedImage(null);
    setCutoutResult(null);
    setExportResult(null);
    setErrorMessage(null);
    setIsProcessing(false);
    setRemovalProgress({ stage: "idle", message: "Ready to isolate foreground subject." });
    setBgConfig(DEFAULT_STUDIO_BACKGROUND);
    setTransform(DEFAULT_STUDIO_TRANSFORM);
    setCustomBgImageElement(null);
    setCustomBgFileName(null);
    setActiveTab("studio");
    setActiveCategory("transparent");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (bgFileInputRef.current) bgFileInputRef.current.value = "";
  }, [cleanupUrls]);

  // Handle Input File Selection
  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);

    // Size limit check (50 MB)
    if (file.size > PROCESSING_LIMITS.maxFileSizeBytes) {
      setErrorMessage(`Selected file (${formatBytes(file.size)}) exceeds the maximum allowed limit of ${PROCESSING_LIMITS.maxFileSizeLabel}.`);
      return;
    }

    // Supported format check
    const validMimes = PROCESSING_LIMITS.supportedMimeTypes;
    if (!validMimes.includes(file.type)) {
      setErrorMessage(`Format "${file.type || "unknown"}" is not supported. Please select a JPEG, PNG, or WebP image.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      if (img.width > PROCESSING_LIMITS.maxDimensionPx || img.height > PROCESSING_LIMITS.maxDimensionPx) {
        URL.revokeObjectURL(previewUrl);
        setErrorMessage(`Image dimensions (${img.width}×${img.height}) exceed maximum canvas limit of ${PROCESSING_LIMITS.maxDimensionPx}px.`);
        return;
      }
      const testCanvas = document.createElement("canvas");
      testCanvas.width = Math.min(img.width, 400);
      testCanvas.height = Math.min(img.height, 400);
      const testCtx = testCanvas.getContext("2d");
      let hasAlpha = false;
      if (testCtx) {
        testCtx.drawImage(img, 0, 0, testCanvas.width, testCanvas.height);
        hasAlpha = detectAlphaChannel(testCtx, testCanvas.width, testCanvas.height);
      }

      const meta: ImageMeta = {
        file,
        name: file.name,
        sizeBytes: file.size,
        width: img.width,
        height: img.height,
        type: file.type,
        hasAlpha,
        previewUrl,
      };

      setSelectedImage(meta);
      setCutoutResult(null);
      setExportResult(null);
    };

    img.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      setErrorMessage("Could not decode image file. The file may be corrupt or truncated.");
    };

    img.src = previewUrl;
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Run Real Background Removal
  const handleRunRemoval = async () => {
    if (!selectedImage) return;

    const currentRequestId = ++activeRequestIdRef.current;
    setIsProcessing(true);
    setErrorMessage(null);
    setRemovalProgress({
      stage: "initializing",
      progressPercent: 5,
      message: "Starting in-browser background isolation...",
    });

    try {
      const result = await removeBackgroundClient(
        selectedImage.previewUrl,
        selectedModelId,
        (p) => {
          if (activeRequestIdRef.current === currentRequestId) {
            setRemovalProgress(p);
          }
        }
      );

      if (activeRequestIdRef.current !== currentRequestId) return;

      setCutoutResult(result);
      setIsProcessing(false);
      setActiveTab("studio");
    } catch (err: any) {
      if (activeRequestIdRef.current !== currentRequestId) return;
      setIsProcessing(false);
      setErrorMessage(
        err?.message || "Failed to remove background. Please verify WebAssembly / WebGPU is enabled in your browser."
      );
      setRemovalProgress({
        stage: "error",
        message: "Removal interrupted.",
      });
    }
  };

  // Custom Background Image Upload
  const handleCustomBgSelect = (file: File) => {
    if (file.size > PROCESSING_LIMITS.maxFileSizeBytes) {
      setErrorMessage(`Background file exceeds ${PROCESSING_LIMITS.maxFileSizeLabel}.`);
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setCustomBgImageElement(img);
      setCustomBgFileName(file.name);
      setBgConfig((prev) => ({
        ...prev,
        type: "custom-image",
        customImageUrl: url,
      }));
    };
    img.src = url;
  };

  // Final Export Generation
  const handleExport = async () => {
    if (!cutoutImageRef.current || !selectedImage) return;

    setIsExporting(true);
    try {
      const canvas = composeStudio(
        cutoutImageRef.current,
        bgConfig,
        transform,
        customBgImageElement
      );

      const result = await exportStudioCanvas(
        canvas,
        {
          format: exportFormat,
          quality,
          flattenBgColor: bgConfig.type === "solid" ? bgConfig.solidColor : "#FFFFFF",
        },
        selectedImage.name
      );

      setExportResult(result);
      setIsExporting(false);
    } catch (err: any) {
      setIsExporting(false);
      setErrorMessage(err?.message || "Failed to generate composition export.");
    }
  };

  const selectedModel = STUDIO_MODELS.find((m) => m.id === selectedModelId) || STUDIO_MODELS[0];

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
      {/* 1. Tool Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cobalt/10 text-cobalt text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>AI Background Studio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-ink tracking-tight">
            Background Studio
          </h1>
          <p className="text-base sm:text-lg text-slate max-w-3xl leading-relaxed">
            Isolate foreground subjects with genuine transparency and compose custom backdrops—all running{" "}
            <strong className="text-ink font-semibold">100% locally in your browser</strong>. Zero image uploads to remote servers.
          </p>
        </div>

        {/* Global Security / Privacy Badge */}
        <div className="flex flex-wrap items-center gap-2.5 text-sm">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-success-light text-success font-semibold border border-success/20">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>Local Browser Processing</span>
          </span>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cloud text-slate font-medium border border-border">
            <Cpu className="w-4 h-4 text-cobalt" />
            <span>WebAssembly & WebGPU</span>
          </span>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-5 rounded-2xl bg-danger-light/30 border border-danger/20 flex items-start gap-3.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-base text-ink flex-1">
            <strong className="font-semibold block text-danger">Processing Error:</strong>
            <p className="text-slate leading-relaxed">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-sm text-slate hover:text-ink font-semibold px-2.5 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Upload Area (Visible when no image is selected) */}
      {!selectedImage && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-3xl border-2 border-dashed p-10 sm:p-16 text-center cursor-pointer transition-all duration-300 ease-out flex flex-col items-center justify-center space-y-6 group ${
            isDragOver
              ? "border-cobalt bg-cobalt/5 scale-[0.99]"
              : "border-border hover:border-cobalt/40 bg-white hover:bg-cloud/30 shadow-card hover:shadow-elevated"
          }`}
        >
          <CropCorners size={18} color="text-cobalt/30 group-hover:text-cobalt transition-colors duration-300" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />

          <div className="w-16 h-16 rounded-2xl bg-cobalt/10 text-cobalt flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm">
            <UploadCloud className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2.5 max-w-lg">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-ink">
              Drop an image here or <span className="text-cobalt underline">browse file</span>
            </h2>
            <p className="text-base text-slate leading-relaxed">
              Supports JPEG, PNG, or WebP up to 50 MB. The image will be processed entirely inside your browser memory.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-sm text-slate">
            <span className="px-3 py-1.5 rounded-lg bg-cloud border border-border">People & Portraits</span>
            <span className="px-3 py-1.5 rounded-lg bg-cloud border border-border">E-Commerce Products</span>
            <span className="px-3 py-1.5 rounded-lg bg-cloud border border-border">Animals & Objects</span>
            <span className="px-3 py-1.5 rounded-lg bg-cloud border border-border">Transparent PNG Output</span>
          </div>
        </div>
      )}

      {/* 3. Main Studio Workspace (When an image is loaded) */}
      {selectedImage && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-card">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-cobalt/10 text-cobalt flex items-center justify-center font-bold text-sm uppercase">
                {selectedImage.type.replace("image/", "")}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-ink truncate max-w-xs sm:max-w-md" title={selectedImage.name}>
                  {selectedImage.name}
                </h3>
                <p className="text-sm text-slate mt-0.5">
                  {selectedImage.width} × {selectedImage.height} px • {formatBytes(selectedImage.sizeBytes)}
                  {selectedImage.hasAlpha ? " • Alpha Channel Detected" : " • Opaque"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-sm font-semibold text-slate hover:text-ink hover:bg-cloud transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replace Image</span>
              </button>
            </div>
          </div>

          {/* Model Selection & Trigger Card (Before background is removed) */}
          {!cutoutResult && (
            <div className="p-7 sm:p-9 rounded-3xl bg-white border border-border shadow-card space-y-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-ink">
                    Step 1: Isolate Foreground Subject
                  </h2>
                  <p className="text-[17px] sm:text-[18px] text-slate leading-[1.72]">
                    Select a local AI model for your image type. Weights download only once and run in your browser.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm sm:text-[15px] font-semibold px-4 py-2 rounded-full bg-cloud text-slate border border-border">
                  <Info className="w-4 h-4 text-cobalt" />
                  <span>No image data uploaded to servers</span>
                </div>
              </div>

              {/* Model Choice Radios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {STUDIO_MODELS.map((model) => {
                  const isSelected = selectedModelId === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => !isProcessing && setSelectedModelId(model.id)}
                      className={`p-6 sm:p-7 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? "border-cobalt bg-cobalt/5 shadow-sm"
                          : "border-border hover:border-border-strong bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? "border-cobalt" : "border-slate"
                            }`}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-cobalt" />}
                          </span>
                          <strong className="text-lg sm:text-xl font-heading font-bold text-ink">
                            {model.name}
                          </strong>
                        </div>
                        <span className="text-xs sm:text-[13px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-cloud text-slate">
                          ~{model.approxSizeMb} MB
                        </span>
                      </div>
                      <p className="text-[15px] sm:text-[16px] text-slate leading-[1.65] mb-4">
                        {model.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-slate border-t border-border/50 pt-3">
                        <span>Best for: <strong className="text-ink font-semibold">{model.recommendedFor}</strong></span>
                        <span className="font-mono text-xs sm:text-sm font-semibold">{model.license}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Removal Action Trigger & Progress Bar */}
              <div className="pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="w-full sm:max-w-md space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate">
                    <span>{removalProgress.message}</span>
                    {removalProgress.progressPercent !== undefined && (
                      <span className="font-mono">{removalProgress.progressPercent}%</span>
                    )}
                  </div>
                  {isProcessing && (
                    <div className="w-full h-2.5 rounded-full bg-cloud overflow-hidden border border-border">
                      <div
                        className="h-full bg-cobalt transition-all duration-300"
                        style={{
                          width: `${removalProgress.progressPercent ?? 15}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRunRemoval}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-heading font-bold text-base shadow-sm transition-all duration-200 active:scale-95 ${
                    isProcessing
                      ? "bg-slate/20 text-slate cursor-not-allowed"
                      : "bg-cobalt text-white hover:bg-cobalt-light hover:shadow-elevated"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing Locally...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Remove Background</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 4. Studio Composition & Canvas Workspace (When Cutout is Ready) */}
          {cutoutResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Interactive Canvas & Preview (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-3xl bg-white border border-border shadow-card overflow-hidden">
                  {/* Canvas View Mode Tabs */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-cloud/50">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                      <button
                        onClick={() => setActiveTab("studio")}
                        className={`px-3.5 py-2 text-sm font-bold rounded-xl transition-colors ${
                          activeTab === "studio"
                            ? "bg-white text-cobalt shadow-sm"
                            : "text-slate hover:text-ink"
                        }`}
                      >
                        Studio Composition
                      </button>
                      <button
                        onClick={() => setActiveTab("cutout")}
                        className={`px-3.5 py-2 text-sm font-bold rounded-xl transition-colors ${
                          activeTab === "cutout"
                            ? "bg-white text-cobalt shadow-sm"
                            : "text-slate hover:text-ink"
                        }`}
                      >
                        Cutout on Checkerboard
                      </button>
                      <button
                        onClick={() => setActiveTab("original")}
                        className={`px-3.5 py-2 text-sm font-bold rounded-xl transition-colors ${
                          activeTab === "original"
                            ? "bg-white text-cobalt shadow-sm"
                            : "text-slate hover:text-ink"
                        }`}
                      >
                        Original
                      </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-sm text-slate">
                      <CheckCircle2 className="w-4 h-4 text-success" />
                      <span>{cutoutResult.transparentPercent}% Transparent</span>
                    </div>
                  </div>

                  {/* Canvas Display Viewport */}
                  <div className="p-6 flex items-center justify-center min-h-[360px] sm:min-h-[460px] bg-slate-50 dark:bg-slate-950/20 relative overflow-hidden">
                    {/* Checkerboard Pattern for Transparency */}
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage: `linear-gradient(45deg, #CBD5E1 25%, transparent 25%), linear-gradient(-45deg, #CBD5E1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #CBD5E1 75%), linear-gradient(-45deg, transparent 75%, #CBD5E1 75%)`,
                        backgroundSize: "20px 20px",
                        backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                      }}
                    />

                    {/* View 1: Studio Live Canvas */}
                    <canvas
                      ref={previewCanvasRef}
                      className={`max-w-full max-h-[480px] object-contain rounded-xl shadow-lg relative z-10 transition-all ${
                        activeTab === "studio" ? "block" : "hidden"
                      }`}
                    />

                    {/* View 2: Cutout on Checkerboard */}
                    {activeTab === "cutout" && (
                      <img
                        src={cutoutResult.cutoutUrl}
                        alt="Isolated foreground cutout"
                        className="max-w-full max-h-[480px] object-contain rounded-xl relative z-10"
                      />
                    )}

                    {/* View 3: Original Input Image */}
                    {activeTab === "original" && (
                      <img
                        src={selectedImage.previewUrl}
                        alt="Original input"
                        className="max-w-full max-h-[480px] object-contain rounded-xl relative z-10 opacity-90"
                      />
                    )}
                  </div>

                  {/* Cutout Metadata Pill Bar */}
                  <div className="px-5 py-3.5 border-t border-border bg-cloud/30 flex flex-wrap items-center justify-between text-sm text-slate gap-2">
                    <span className="font-mono">
                      {cutoutResult.originalWidth} × {cutoutResult.originalHeight} px
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-success font-semibold">
                      <Check className="w-4 h-4" />
                      <span>Processed in {(cutoutResult.processingTimeMs / 1000).toFixed(1)}s</span>
                    </span>
                  </div>
                </div>

                {/* Quick Cutout Direct Download */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white border border-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <strong className="text-lg sm:text-xl font-heading font-bold text-ink block">
                      Need Just the Transparent Cutout?
                    </strong>
                    <p className="text-[15px] sm:text-base text-slate mt-0.5">
                      Export transparent PNG with original dimensions immediately.
                    </p>
                  </div>
                  <a
                    href={cutoutResult.cutoutUrl}
                    download={generateStudioFilename(selectedImage.name, "cutout", "image/png")}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cloud hover:bg-slate-light/20 text-ink font-bold text-base border border-border transition-colors flex-shrink-0"
                  >
                    <Download className="w-4 h-4 text-cobalt" />
                    <span>Download PNG Cutout</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Background Maker & Studio Controls (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-3xl bg-white border border-border shadow-card p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-heading font-bold text-ink">
                      Step 2: Choose Replacement Background
                    </h2>
                    <p className="text-[15px] sm:text-base text-slate mt-1.5">
                      Select a solid studio tone, gradient, scene, or custom photograph.
                    </p>
                  </div>

                  {/* Background Category Selector */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 p-1.5 rounded-xl bg-cloud text-sm font-semibold text-slate">
                    <button
                      onClick={() => {
                        setActiveCategory("transparent");
                        setBgConfig((p) => ({ ...p, type: "transparent" }));
                      }}
                      className={`py-2 px-2.5 rounded-lg transition-colors text-center ${
                        bgConfig.type === "transparent" ? "bg-white text-cobalt shadow-sm font-bold" : "hover:text-ink"
                      }`}
                    >
                      Transparent
                    </button>
                    <button
                      onClick={() => {
                        setActiveCategory("solid");
                        setBgConfig((p) => ({ ...p, type: "solid" }));
                      }}
                      className={`py-2 px-2.5 rounded-lg transition-colors text-center ${
                        bgConfig.type === "solid" ? "bg-white text-cobalt shadow-sm font-bold" : "hover:text-ink"
                      }`}
                    >
                      Solid
                    </button>
                    <button
                      onClick={() => {
                        setActiveCategory("gradient");
                        setBgConfig((p) => ({ ...p, type: "gradient" }));
                      }}
                      className={`py-2 px-2.5 rounded-lg transition-colors text-center ${
                        bgConfig.type === "gradient" ? "bg-white text-cobalt shadow-sm font-bold" : "hover:text-ink"
                      }`}
                    >
                      Gradient
                    </button>
                    <button
                      onClick={() => {
                        setActiveCategory("preset");
                        setBgConfig((p) => ({ ...p, type: "preset" }));
                      }}
                      className={`py-2 px-2.5 rounded-lg transition-colors text-center ${
                        bgConfig.type === "preset" ? "bg-white text-cobalt shadow-sm font-bold" : "hover:text-ink"
                      }`}
                    >
                      Studio
                    </button>
                    <button
                      onClick={() => {
                        setActiveCategory("custom");
                        setBgConfig((p) => ({ ...p, type: "custom-image" }));
                      }}
                      className={`py-2 px-2.5 rounded-lg transition-colors text-center col-span-2 sm:col-span-1 ${
                        bgConfig.type === "custom-image" ? "bg-white text-cobalt shadow-sm font-bold" : "hover:text-ink"
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {/* Background Options Renderers */}
                  <div className="space-y-4 pt-1">
                    {/* Category 1: Transparent Info */}
                    {bgConfig.type === "transparent" && (
                      <div className="p-4 sm:p-5 rounded-2xl bg-cloud/50 border border-border text-sm text-slate space-y-1.5 leading-relaxed">
                        <span className="font-bold text-ink block text-base">Transparent Alpha Active</span>
                        <p>
                          Export as PNG or WebP to keep the background transparent. The checkerboard in the preview is for inspection only and is never baked into your download.
                        </p>
                      </div>
                    )}

                    {/* Category 2: Solid Colors Swatches */}
                    {bgConfig.type === "solid" && (
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-ink uppercase tracking-wider block">Studio Solid Colors</label>
                        <div className="grid grid-cols-4 gap-2.5">
                          {STUDIO_SOLID_PRESETS.map((preset) => {
                            const isSelected = bgConfig.solidColor === preset.hex;
                            return (
                              <button
                                key={preset.hex}
                                type="button"
                                onClick={() => setBgConfig((p) => ({ ...p, solidColor: preset.hex }))}
                                className={`h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                                  isSelected ? "border-cobalt ring-2 ring-cobalt/20 scale-105" : "border-border hover:border-border-strong"
                                }`}
                                style={{ backgroundColor: preset.hex }}
                                title={`${preset.label} (${preset.hex})`}
                              >
                                {isSelected && (
                                  <Check
                                    className={`w-4 h-4 ${
                                      preset.hex === "#FFFFFF" || preset.hex === "#F5F5F0" || preset.hex === "#ECFDF5" || preset.hex === "#FFF1F2"
                                        ? "text-ink"
                                        : "text-white"
                                    }`}
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Hex Color Picker */}
                        <div className="flex items-center gap-3 pt-2">
                          <input
                            type="color"
                            value={bgConfig.solidColor}
                            onChange={(e) => setBgConfig((p) => ({ ...p, solidColor: e.target.value }))}
                            className="w-10 h-10 rounded-xl border border-border cursor-pointer p-0.5 bg-white"
                          />
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-sm text-slate font-medium">Custom Color:</span>
                            <input
                              type="text"
                              value={bgConfig.solidColor}
                              onChange={(e) => setBgConfig((p) => ({ ...p, solidColor: e.target.value }))}
                              className="font-mono text-sm px-3 py-2 rounded-xl border border-border w-28 text-ink bg-white uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category 3: Gradients Swatches */}
                    {bgConfig.type === "gradient" && (
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-ink uppercase tracking-wider block">Studio Gradients</label>
                        <div className="grid grid-cols-2 gap-3">
                          {STUDIO_GRADIENT_PRESETS.map((grad) => {
                            const isSelected = bgConfig.gradientId === grad.id;
                            return (
                              <button
                                key={grad.id}
                                type="button"
                                onClick={() => setBgConfig((p) => ({ ...p, gradientId: grad.id }))}
                                className={`p-3.5 rounded-xl border-2 flex flex-col justify-end text-left h-24 transition-all ${
                                  isSelected ? "border-cobalt ring-2 ring-cobalt/20 scale-[1.02]" : "border-border hover:border-border-strong"
                                }`}
                                style={{ background: grad.css }}
                              >
                                <span
                                  className={`text-xs sm:text-sm font-bold px-2 py-1 rounded shadow-sm w-fit ${
                                    grad.id === "modern-indigo" || grad.id === "cyber-slate"
                                      ? "bg-white/20 text-white"
                                      : "bg-ink/80 text-white"
                                  }`}
                                >
                                  {grad.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category 4: Studio Presets */}
                    {bgConfig.type === "preset" && (
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-ink uppercase tracking-wider block">Architectural & Studio Scenes</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {STUDIO_SCENE_PRESETS.map((preset) => {
                            const isSelected = bgConfig.presetId === preset.id;
                            return (
                              <div
                                key={preset.id}
                                onClick={() => setBgConfig((p) => ({ ...p, presetId: preset.id }))}
                                className={`p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                  isSelected ? "border-cobalt bg-cobalt/5" : "border-border hover:border-border-strong bg-white"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <strong className="text-sm sm:text-base font-bold text-ink">{preset.label}</strong>
                                  <span className="text-xs uppercase font-bold text-slate bg-cloud px-2 py-0.5 rounded">
                                    {preset.category}
                                  </span>
                                </div>
                                <p className="text-xs sm:text-sm text-slate leading-relaxed">{preset.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category 5: Custom Image Upload */}
                    {bgConfig.type === "custom-image" && (
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-ink uppercase tracking-wider block">Upload Custom Background</label>
                        <input
                          ref={bgFileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleCustomBgSelect(e.target.files[0])}
                        />

                        <button
                          type="button"
                          onClick={() => bgFileInputRef.current?.click()}
                          className="w-full py-3.5 px-5 rounded-xl border border-dashed border-border hover:border-cobalt text-sm font-semibold text-slate hover:text-ink bg-cloud/30 flex items-center justify-center gap-2.5 transition-colors"
                        >
                          <ImageIcon className="w-4 h-4 text-cobalt" />
                          <span>{customBgFileName ? `Change: ${customBgFileName}` : "Select Image from Device"}</span>
                        </button>

                        {customBgImageElement && (
                          <div className="flex items-center gap-2.5 pt-1 text-sm">
                            <span className="text-slate font-medium">Fit Mode:</span>
                            <div className="flex items-center gap-1.5">
                              {(["cover", "contain", "stretch"] as const).map((fit) => (
                                <button
                                  key={fit}
                                  onClick={() => setBgConfig((p) => ({ ...p, customImageFit: fit }))}
                                  className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
                                    bgConfig.customImageFit === fit
                                      ? "bg-cobalt text-white font-bold"
                                      : "bg-cloud text-slate hover:text-ink"
                                  }`}
                                >
                                  {fit}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Foreground Subject Controls Accordion/Sliders */}
                  <div className="border-t border-border pt-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-cobalt" />
                        <span className="text-sm font-bold text-ink uppercase tracking-wider">
                          Subject Positioning & Scale
                        </span>
                      </div>
                      <button
                        onClick={() => setTransform(DEFAULT_STUDIO_TRANSFORM)}
                        className="text-xs sm:text-sm text-slate hover:text-cobalt font-semibold"
                      >
                        Reset Position
                      </button>
                    </div>

                    {/* Scale Slider */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm text-slate">
                        <span>Subject Scale:</span>
                        <span className="font-mono font-semibold text-ink">
                          {Math.round(transform.scale * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="1.5"
                        step="0.05"
                        value={transform.scale}
                        onChange={(e) => setTransform((p) => ({ ...p, scale: parseFloat(e.target.value) }))}
                        className="w-full accent-cobalt cursor-pointer"
                      />
                    </div>

                    {/* Horizontal & Vertical Positioning */}
                    <div className="grid grid-cols-2 gap-3.5 pt-1">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm text-slate">
                          <span>Horizontal (X):</span>
                          <span className="font-mono">{Math.round(transform.offsetX * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="-0.4"
                          max="0.4"
                          step="0.02"
                          value={transform.offsetX}
                          onChange={(e) => setTransform((p) => ({ ...p, offsetX: parseFloat(e.target.value) }))}
                          className="w-full accent-cobalt cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs sm:text-sm text-slate">
                          <span>Vertical (Y):</span>
                          <span className="font-mono">{Math.round(transform.offsetY * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="-0.4"
                          max="0.4"
                          step="0.02"
                          value={transform.offsetY}
                          onChange={(e) => setTransform((p) => ({ ...p, offsetY: parseFloat(e.target.value) }))}
                          className="w-full accent-cobalt cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Flips & Soft Shadow Toggles */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1 text-sm">
                      <button
                        type="button"
                        onClick={() => setTransform((p) => ({ ...p, flipH: !p.flipH }))}
                        className={`px-3.5 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                          transform.flipH ? "bg-cobalt text-white border-cobalt" : "bg-white text-slate border-border"
                        }`}
                      >
                        Flip Horizontal
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransform((p) => ({ ...p, flipV: !p.flipV }))}
                        className={`px-3.5 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                          transform.flipV ? "bg-cobalt text-white border-cobalt" : "bg-white text-slate border-border"
                        }`}
                      >
                        Flip Vertical
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTransform((p) => ({
                            ...p,
                            shadowBlur: p.shadowBlur > 0 ? 0 : 20,
                          }))
                        }
                        className={`px-3.5 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                          transform.shadowBlur > 0
                            ? "bg-cobalt text-white border-cobalt"
                            : "bg-white text-slate border-border"
                        }`}
                      >
                        Realistic Drop Shadow
                      </button>
                    </div>
                  </div>

                  {/* Export Format & Trigger */}
                  <div className="border-t border-border pt-5 space-y-4">
                    <label className="text-sm sm:text-base font-bold text-ink uppercase tracking-wider block">
                      Step 3: Export Format & Quality
                    </label>

                    <div className="grid grid-cols-3 gap-2.5">
                      {(["image/png", "image/jpeg", "image/webp"] as const).map((fmt) => {
                        const isSelected = exportFormat === fmt;
                        const label = fmt === "image/png" ? "PNG" : fmt === "image/jpeg" ? "JPEG" : "WebP";
                        return (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setExportFormat(fmt)}
                            className={`py-3 rounded-xl border text-base font-bold transition-all ${
                              isSelected
                                ? "border-cobalt bg-cobalt text-white shadow-sm"
                                : "border-border text-slate hover:text-ink bg-white"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Quality slider for lossy formats */}
                    {exportFormat !== "image/png" && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-sm sm:text-base text-slate">
                          <span>Quality:</span>
                          <span className="font-mono font-semibold text-ink">
                            {Math.round(quality * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.02"
                          value={quality}
                          onChange={(e) => setQuality(parseFloat(e.target.value))}
                          className="w-full accent-cobalt cursor-pointer"
                        />
                      </div>
                    )}

                    {/* JPEG Transparency Warning */}
                    {exportFormat === "image/jpeg" && bgConfig.type === "transparent" && (
                      <p className="text-sm sm:text-[15px] leading-relaxed text-amber-700 dark:text-amber-400 bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20">
                        JPEG does not support alpha transparency. The output will be flattened onto pure white.
                      </p>
                    )}

                    {/* Primary Export Button */}
                    <button
                      type="button"
                      disabled={isExporting}
                      onClick={handleExport}
                      className="w-full py-4 px-6 rounded-xl bg-cobalt hover:bg-cobalt-light text-white font-heading font-bold text-base sm:text-lg shadow-sm hover:shadow-elevated transition-all duration-200 flex items-center justify-center gap-2.5 active:scale-95"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Compositing & Encoding...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Generate & Download Composition</span>
                        </>
                      )}
                    </button>

                    {/* Export Result Card */}
                    {exportResult && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-success-light/30 border border-success/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
                        <div className="space-y-1">
                          <span className="text-base sm:text-lg font-bold text-success block">
                            Composition Ready!
                          </span>
                          <p className="text-sm sm:text-[15px] text-slate">
                            {formatBytes(exportResult.bytes)} • {exportResult.width}×{exportResult.height} px
                          </p>
                        </div>
                        <a
                          href={exportResult.url}
                          download={exportResult.filename}
                          className="px-5 py-2.5 rounded-xl bg-success text-white font-bold text-sm shadow-sm hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Save {exportResult.filename.split(".").pop()?.toUpperCase()}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
