export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const BRAND = {
  name: "ImageFit",
  slogan: "Every image. The right fit.",
  description:
    "Compress images to a file-size limit, resize dimensions, and convert supported formats with clear results before you download. Client-side browser processing.",
  url: SITE_URL,
};

export const PROCESSING_LIMITS = {
  maxFileSizeBytes: 50 * 1024 * 1024, // 50 MB safety ceiling
  maxFileSizeLabel: "50 MB",
  maxDimensionPx: 16384, // Canvas DoS protection boundary
  supportedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  supportedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
};

export const COMPRESSOR_PRESETS = [
  { label: "50 KB", valueBytes: 50 * 1024, description: "Common application/admission portal limit" },
  { label: "100 KB", valueBytes: 100 * 1024, description: "Online forms and standard avatars" },
  { label: "200 KB", valueBytes: 200 * 1024, description: "Fast mobile web hero and blog thumbnails" },
  { label: "500 KB", valueBytes: 500 * 1024, description: "High-resolution web portfolios" },
  { label: "1 MB", valueBytes: 1024 * 1024, description: "Document attachments and print previews" },
];

export const RESIZER_DIMENSION_PRESETS = [
  { label: "Full HD (1920×1080)", width: 1920, height: 1080, category: "Desktop / Video" },
  { label: "Social Card (1200×630)", width: 1200, height: 630, category: "Social Media" },
  { label: "Instagram Square (1080×1080)", width: 1080, height: 1080, category: "Social Media" },
  { label: "Web Standard (800×600)", width: 800, height: 600, category: "Web Graphics" },
  { label: "Profile / Avatar (400×400)", width: 400, height: 400, category: "Avatars" },
  { label: "Thumbnail (200×200)", width: 200, height: 200, category: "Thumbnails" },
];

export const RESIZER_SCALE_PRESETS = [
  { label: "25%", factor: 0.25 },
  { label: "50%", factor: 0.50 },
  { label: "75%", factor: 0.75 },
  { label: "100%", factor: 1.00 },
  { label: "150%", factor: 1.50 },
  { label: "200%", factor: 2.00 },
];

export const CONVERTER_FORMATS = [
  {
    mime: "image/jpeg" as const,
    label: "JPEG",
    extension: "jpg",
    description: "Best for photographs and rich imagery without transparency. High lossy compression.",
    supportsAlpha: false,
    supportsQuality: true,
  },
  {
    mime: "image/webp" as const,
    label: "WebP",
    extension: "webp",
    description: "Modern web standard with lossy quality control and full alpha transparency.",
    supportsAlpha: true,
    supportsQuality: true,
  },
  {
    mime: "image/png" as const,
    label: "PNG",
    extension: "png",
    description: "Lossless compression with transparency. Ideal for logos, icons, and sharp line art.",
    supportsAlpha: true,
    supportsQuality: false,
  },
];

export const JPEG_BACKGROUND_PRESETS = [
  { label: "Pure White", hex: "#FFFFFF" },
  { label: "Pitch Black", hex: "#000000" },
  { label: "Cloud Surface", hex: "#F5F7FB" },
  { label: "Deep Ink", hex: "#15233B" },
];

export interface StudioModelConfig {
  id: string;
  name: string;
  category: "universal" | "portrait";
  license: string;
  approxSizeMb: number;
  description: string;
  recommendedFor: string;
}

export const STUDIO_MODELS: StudioModelConfig[] = [
  {
    id: "onnx-community/BiRefNet_lite-ONNX",
    name: "BiRefNet Lite (Universal)",
    category: "universal",
    license: "MIT",
    approxSizeMb: 224,
    description: "High-resolution dichotomous salient object segmentation. Accurately segments salient foregrounds (products, animals, apparel, vehicles, and people). Downloads ~224 MB full-precision ONNX weights from Hugging Face on first use.",
    recommendedFor: "Products, objects, e-commerce, and general images",
  },
  {
    id: "Xenova/modnet",
    name: "MODNet (Portrait Matting)",
    category: "portrait",
    license: "Apache-2.0",
    approxSizeMb: 25,
    description: "Lightweight portrait matting engine specifically trained on human figures. Accurately extracts fine hair strands and facial contours. Not intended for inanimate objects. Downloads ~25 MB ONNX weights on first use.",
    recommendedFor: "Human portraits, headshots, and people photos",
  },
];

export const STUDIO_SOLID_PRESETS = [
  { label: "Pure White", hex: "#FFFFFF", category: "E-Commerce" },
  { label: "Studio Grey", hex: "#E2E8F0", category: "Neutral" },
  { label: "Dark Onyx", hex: "#0F172A", category: "Dramatic" },
  { label: "Warm Sand", hex: "#F5F5F0", category: "Editorial" },
  { label: "Clean Cobalt", hex: "#1E40AF", category: "Brand" },
  { label: "Mint Fresh", hex: "#ECFDF5", category: "Pastel" },
  { label: "Soft Rose", hex: "#FFF1F2", category: "Pastel" },
  { label: "Deep Ink", hex: "#15233B", category: "ImageFit" },
];

export const STUDIO_GRADIENT_PRESETS = [
  {
    id: "studio-spotlight",
    label: "Studio Spotlight",
    css: "radial-gradient(circle at 50% 40%, #FFFFFF 0%, #E2E8F0 70%, #CBD5E1 100%)",
    type: "radial" as const,
    colors: ["#FFFFFF", "#E2E8F0", "#CBD5E1"],
  },
  {
    id: "clean-horizon",
    label: "Clean Horizon",
    css: "linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)",
    type: "linear" as const,
    colors: ["#F8FAFC", "#E2E8F0"],
  },
  {
    id: "sunset-warmth",
    label: "Sunset Glow",
    css: "linear-gradient(135deg, #FFEDD5 0%, #FED7AA 50%, #F472B6 100%)",
    type: "linear" as const,
    colors: ["#FFEDD5", "#FED7AA", "#F472B6"],
  },
  {
    id: "modern-indigo",
    label: "Modern Indigo",
    css: "linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)",
    type: "linear" as const,
    colors: ["#1E1B4B", "#312E81", "#4338CA"],
  },
  {
    id: "soft-lavender",
    label: "Soft Lavender",
    css: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #DDD6FE 100%)",
    type: "linear" as const,
    colors: ["#F5F3FF", "#EDE9FE", "#DDD6FE"],
  },
  {
    id: "cyber-slate",
    label: "Cyber Slate",
    css: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
    type: "linear" as const,
    colors: ["#0F172A", "#1E293B"],
  },
];

export const STUDIO_SCENE_PRESETS = [
  {
    id: "minimal-stage",
    label: "Minimal Stage",
    description: "Clean podium with soft gradient and subtle floor shadow",
    category: "Product",
  },
  {
    id: "soft-bokeh",
    label: "Soft Bokeh",
    description: "Warm optical blur circles for professional portraits",
    category: "Portrait",
  },
  {
    id: "architectural-light",
    label: "Window Shadows",
    description: "Sunlight through window panes cast across neutral wall",
    category: "Editorial",
  },
  {
    id: "nature-sunbeam",
    label: "Morning Sunbeam",
    description: "Gentle natural sunbeams and organic warm undertones",
    category: "Outdoor",
  },
];

