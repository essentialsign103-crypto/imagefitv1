import { sanitizeFilename } from "../utils";
import { PROCESSING_LIMITS, STUDIO_MODELS } from "../constants";
import { OutputFormat } from "./compressor";

export type BackgroundType = "transparent" | "solid" | "gradient" | "preset" | "custom-image";

export interface StudioBackgroundConfig {
  type: BackgroundType;
  solidColor: string;
  gradientId: string;
  presetId?: string;
  customImageUrl?: string;
  customImageElement?: HTMLImageElement | null;
  customImageFit: "cover" | "contain" | "stretch";
}

export interface StudioSubjectTransform {
  scale: number; // 0.2 to 2.0 (default 1.0)
  offsetX: number; // -0.5 to 0.5 (percent of canvas width)
  offsetY: number; // -0.5 to 0.5 (percent of canvas height)
  flipH: boolean;
  flipV: boolean;
  shadowBlur: number; // 0 to 40 px
  shadowOpacity: number; // 0 to 1
  shadowOffsetY: number; // px offset
}

export interface StudioExportOptions {
  format: OutputFormat;
  quality: number; // 0.1 to 1.0
  flattenBgColor?: string; // fallback background when exporting JPEG with transparent mode
}

export interface StudioRemovalProgress {
  stage: "idle" | "downloading" | "initializing" | "segmenting" | "compositing" | "done" | "error";
  progressPercent?: number; // 0 to 100
  message: string;
  file?: string;
}

export interface CutoutResult {
  originalWidth: number;
  originalHeight: number;
  cutoutBlob: Blob;
  cutoutUrl: string;
  hasTransparency: boolean;
  transparentPercent: number;
  modelUsed: string;
  processingTimeMs: number;
}

export interface StudioExportResult {
  blob: Blob;
  url: string;
  bytes: number;
  mimeType: string;
  filename: string;
  width: number;
  height: number;
}

export const DEFAULT_STUDIO_BACKGROUND: StudioBackgroundConfig = {
  type: "transparent",
  solidColor: "#FFFFFF",
  gradientId: "studio-spotlight",
  customImageFit: "cover",
};

export const DEFAULT_STUDIO_TRANSFORM: StudioSubjectTransform = {
  scale: 1.0,
  offsetX: 0,
  offsetY: 0,
  flipH: false,
  flipV: false,
  shadowBlur: 0,
  shadowOpacity: 0.3,
  shadowOffsetY: 12,
};

/**
 * Generates an honest, sanitized output filename for the background studio
 */
export function generateStudioFilename(
  originalName: string,
  variant: "cutout" | "studio",
  format: OutputFormat
): string {
  const safeBase = sanitizeFilename(originalName || "image");
  const lastDot = safeBase.lastIndexOf(".");
  const nameWithoutExt = lastDot > 0 ? safeBase.substring(0, lastDot) : safeBase;

  const extMap: Record<OutputFormat, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  };

  const extension = extMap[format] || "png";
  return `${nameWithoutExt}-${variant}.${extension}`;
}

/**
 * Checks actual pixel data for alpha transparency (< 250 alpha channel value)
 */
export function verifyCutoutTransparency(canvas: HTMLCanvasElement): {
  hasTransparency: boolean;
  transparentPixelCount: number;
  totalPixels: number;
  percentTransparent: number;
} {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { hasTransparency: false, transparentPixelCount: 0, totalPixels: 0, percentTransparent: 0 };
  }

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const totalPixels = width * height;

  let transparentPixelCount = 0;
  // Sample every pixel's alpha channel (index + 3)
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) {
      transparentPixelCount++;
    }
  }

  const percentTransparent = totalPixels > 0 ? (transparentPixelCount / totalPixels) * 100 : 0;
  return {
    hasTransparency: transparentPixelCount > 0,
    transparentPixelCount,
    totalPixels,
    percentTransparent: Math.round(percentTransparent * 10) / 10,
  };
}

/**
 * Renders the chosen background onto a canvas context
 */
export function drawStudioBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bgConfig: StudioBackgroundConfig,
  customBgImage?: HTMLImageElement | null
): void {
  ctx.save();

  if (bgConfig.type === "transparent") {
    // Pure transparent clear - no pixels drawn
    ctx.clearRect(0, 0, width, height);
  } else if (bgConfig.type === "solid") {
    ctx.fillStyle = bgConfig.solidColor || "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
  } else if (bgConfig.type === "gradient") {
    const id = bgConfig.gradientId || "studio-spotlight";
    if (id === "studio-spotlight") {
      const radius = Math.max(width, height) * 0.8;
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.4,
        10,
        width * 0.5,
        height * 0.5,
        radius
      );
      grad.addColorStop(0, "#FFFFFF");
      grad.addColorStop(0.65, "#E2E8F0");
      grad.addColorStop(1, "#CBD5E1");
      ctx.fillStyle = grad;
    } else if (id === "clean-horizon") {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#F8FAFC");
      grad.addColorStop(1, "#E2E8F0");
      ctx.fillStyle = grad;
    } else if (id === "sunset-warmth") {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#FFEDD5");
      grad.addColorStop(0.5, "#FED7AA");
      grad.addColorStop(1, "#F472B6");
      ctx.fillStyle = grad;
    } else if (id === "modern-indigo") {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#1E1B4B");
      grad.addColorStop(0.5, "#312E81");
      grad.addColorStop(1, "#4338CA");
      ctx.fillStyle = grad;
    } else if (id === "soft-lavender") {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#F5F3FF");
      grad.addColorStop(0.5, "#EDE9FE");
      grad.addColorStop(1, "#DDD6FE");
      ctx.fillStyle = grad;
    } else if (id === "cyber-slate") {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#0F172A");
      grad.addColorStop(1, "#1E293B");
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = "#E2E8F0";
    }
    ctx.fillRect(0, 0, width, height);
  } else if (bgConfig.type === "preset") {
    const presetId = bgConfig.presetId || "minimal-stage";
    if (presetId === "minimal-stage") {
      // Clean studio wall + podium floor with perspective line
      const wallGrad = ctx.createLinearGradient(0, 0, 0, height * 0.75);
      wallGrad.addColorStop(0, "#F8FAFC");
      wallGrad.addColorStop(1, "#E2E8F0");
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, width, height * 0.75);

      const floorGrad = ctx.createLinearGradient(0, height * 0.75, 0, height);
      floorGrad.addColorStop(0, "#CBD5E1");
      floorGrad.addColorStop(1, "#94A3B8");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, height * 0.75, width, height * 0.25);

      // Floor horizon line
      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.75);
      ctx.lineTo(width, height * 0.75);
      ctx.stroke();
    } else if (presetId === "soft-bokeh") {
      // Warm portrait background with subtle blurred circles
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, "#FEF3C7");
      bgGrad.addColorStop(0.5, "#FDE68A");
      bgGrad.addColorStop(1, "#F59E0B");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Procedural soft bokeh highlights
      const circles = [
        { x: 0.2 * width, y: 0.25 * height, r: 0.15 * width, a: 0.15 },
        { x: 0.75 * width, y: 0.2 * height, r: 0.2 * width, a: 0.18 },
        { x: 0.85 * width, y: 0.65 * height, r: 0.18 * width, a: 0.12 },
        { x: 0.15 * width, y: 0.75 * height, r: 0.22 * width, a: 0.14 },
      ];
      circles.forEach((c) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${c.a})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (presetId === "architectural-light") {
      // Sunlight through architectural grid
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#F1F5F9");
      bg.addColorStop(1, "#CBD5E1");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // Window shadow diagonal
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.beginPath();
      ctx.moveTo(width * 0.1, 0);
      ctx.lineTo(width * 0.5, 0);
      ctx.lineTo(width * 0.7, height);
      ctx.lineTo(width * 0.3, height);
      ctx.closePath();
      ctx.fill();
    } else if (presetId === "nature-sunbeam") {
      // Organic sunlight and gentle tones
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#ECFCCB");
      bg.addColorStop(0.5, "#D9F99D");
      bg.addColorStop(1, "#BEF264");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const beam = ctx.createLinearGradient(0, 0, width, height);
      beam.addColorStop(0, "rgba(255, 255, 255, 0.45)");
      beam.addColorStop(0.5, "rgba(255, 255, 255, 0.15)");
      beam.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = beam;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (bgConfig.type === "custom-image" && customBgImage) {
    const bgW = customBgImage.naturalWidth || customBgImage.width;
    const bgH = customBgImage.naturalHeight || customBgImage.height;

    if (bgConfig.customImageFit === "stretch") {
      ctx.drawImage(customBgImage, 0, 0, width, height);
    } else if (bgConfig.customImageFit === "contain") {
      const scale = Math.min(width / bgW, height / bgH);
      const drawW = bgW * scale;
      const drawH = bgH * scale;
      const drawX = (width - drawW) / 2;
      const drawY = (height - drawH) / 2;
      ctx.drawImage(customBgImage, drawX, drawY, drawW, drawH);
    } else {
      // Default: cover
      const scale = Math.max(width / bgW, height / bgH);
      const drawW = bgW * scale;
      const drawH = bgH * scale;
      const drawX = (width - drawW) / 2;
      const drawY = (height - drawH) / 2;
      ctx.drawImage(customBgImage, drawX, drawY, drawW, drawH);
    }
  }

  ctx.restore();
}

/**
 * Renders the foreground cutout subject with transform and optional shadow
 */
export function drawStudioSubject(
  ctx: CanvasRenderingContext2D,
  subject: HTMLImageElement | HTMLCanvasElement,
  canvasWidth: number,
  canvasHeight: number,
  transform: StudioSubjectTransform
): void {
  ctx.save();

  const srcWidth = (subject as HTMLImageElement).naturalWidth || subject.width;
  const srcHeight = (subject as HTMLImageElement).naturalHeight || subject.height;

  // Base dimensions fit canvas
  const scale = Math.max(0.1, transform.scale);
  const targetW = srcWidth * scale;
  const targetH = srcHeight * scale;

  // Center position + user offsets
  const centerX = canvasWidth / 2 + transform.offsetX * canvasWidth;
  const centerY = canvasHeight / 2 + transform.offsetY * canvasHeight;

  ctx.translate(centerX, centerY);

  // Horizontal / Vertical flips
  const flipX = transform.flipH ? -1 : 1;
  const flipY = transform.flipV ? -1 : 1;
  ctx.scale(flipX, flipY);

  // Optional realistic drop shadow
  if (transform.shadowBlur > 0 && transform.shadowOpacity > 0) {
    ctx.shadowColor = `rgba(0, 0, 0, ${transform.shadowOpacity})`;
    ctx.shadowBlur = transform.shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = transform.shadowOffsetY;
  }

  // Draw centered around the transformed origin
  ctx.drawImage(subject, -targetW / 2, -targetH / 2, targetW, targetH);

  ctx.restore();
}

/**
 * Full studio composition renderer onto a new canvas
 */
export function composeStudio(
  cutout: HTMLImageElement | HTMLCanvasElement,
  bgConfig: StudioBackgroundConfig,
  transform: StudioSubjectTransform,
  customBgImage?: HTMLImageElement | null
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const width = (cutout as HTMLImageElement).naturalWidth || cutout.width;
  const height = (cutout as HTMLImageElement).naturalHeight || cutout.height;

  canvas.width = Math.min(width, PROCESSING_LIMITS.maxDimensionPx);
  canvas.height = Math.min(height, PROCESSING_LIMITS.maxDimensionPx);

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    throw new Error("Unable to obtain 2D canvas context for studio composition.");
  }

  // 1. Draw Background
  drawStudioBackground(ctx, canvas.width, canvas.height, bgConfig, customBgImage);

  // 2. Draw Transformed Subject Cutout
  drawStudioSubject(ctx, cutout, canvas.width, canvas.height, transform);

  return canvas;
}

/**
 * Exports the composed canvas into a verified Blob with honest metadata
 */
export async function exportStudioCanvas(
  canvas: HTMLCanvasElement,
  options: StudioExportOptions,
  originalFilename: string
): Promise<StudioExportResult> {
  const { format, quality, flattenBgColor = "#FFFFFF" } = options;

  let exportCanvas = canvas;

  // If exporting to JPEG, ensure alpha is flattened onto background color
  if (format === "image/jpeg") {
    exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ctx = exportCanvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = flattenBgColor;
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      ctx.drawImage(canvas, 0, 0);
    }
  }

  return new Promise((resolve, reject) => {
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode image blob from studio canvas."));
          return;
        }

        const url = URL.createObjectURL(blob);
        const filename = generateStudioFilename(originalFilename, "studio", format);

        resolve({
          blob,
          url,
          bytes: blob.size,
          mimeType: blob.type || format,
          filename,
          width: canvas.width,
          height: canvas.height,
        });
      },
      format,
      format === "image/png" ? undefined : Math.min(Math.max(quality, 0.1), 1.0)
    );
  });
}

// Global cached pipeline promise so model weights are reused while page remains open
let cachedPipelinePromise: Promise<any> | null = null;
let cachedModelId: string | null = null;

/**
 * Initializes or reuses the client-side Transformers.js background removal pipeline
 */
export async function getRemovalPipeline(
  modelId: string = STUDIO_MODELS[0].id,
  onProgress?: (progress: StudioRemovalProgress) => void
): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("Background removal pipeline can only be executed in browser environments.");
  }

  if (cachedPipelinePromise && cachedModelId === modelId) {
    return cachedPipelinePromise;
  }

  cachedModelId = modelId;
  cachedPipelinePromise = (async () => {
    onProgress?.({
      stage: "downloading",
      progressPercent: 5,
      message: `Loading ${modelId}...`,
    });

    // Dynamic import to avoid bundling ONNX in server bundles
    const transformers = await import("@huggingface/transformers");
    const { pipeline, env } = transformers;

    // Configure client-side environment settings
    if (env) {
      env.allowLocalModels = false;
      env.useBrowserCache = true;
    }

    const pipe = await pipeline("image-segmentation", modelId, {
      progress_callback: (item: any) => {
        if (item.status === "progress") {
          const percent = typeof item.progress === "number" ? Math.round(item.progress) : undefined;
          onProgress?.({
            stage: "downloading",
            progressPercent: percent,
            file: item.file,
            message: `Downloading model weights ${item.file ? `(${item.file})` : ""}: ${percent ? `${percent}%` : "in progress"}...`,
          });
        } else if (item.status === "initiate") {
          onProgress?.({
            stage: "downloading",
            message: `Initiating ${item.file || "model"} download...`,
            file: item.file,
          });
        } else if (item.status === "done") {
          onProgress?.({
            stage: "initializing",
            message: `Finalizing model initialization...`,
            progressPercent: 95,
          });
        }
      },
    });

    onProgress?.({
      stage: "done",
      progressPercent: 100,
      message: "Model ready.",
    });

    return pipe;
  })();

  return cachedPipelinePromise;
}

/**
 * Executes foreground isolation using the local AI pipeline
 */
export async function removeBackgroundClient(
  imageSource: HTMLImageElement | string,
  modelId: string = STUDIO_MODELS[0].id,
  onProgress?: (progress: StudioRemovalProgress) => void
): Promise<CutoutResult> {
  const startTime = Date.now();

  onProgress?.({
    stage: "initializing",
    progressPercent: 10,
    message: "Initializing background removal engine...",
  });

  const segmenter = await getRemovalPipeline(modelId, onProgress);

  onProgress?.({
    stage: "segmenting",
    progressPercent: 60,
    message: "Analyzing foreground contours and generating alpha matte...",
  });

  // Source can be an HTMLImageElement or a data/object URL
  const src = typeof imageSource === "string" ? imageSource : imageSource.src;
  const originalWidth = typeof imageSource === "string" ? 800 : imageSource.naturalWidth || imageSource.width;
  const originalHeight = typeof imageSource === "string" ? 600 : imageSource.naturalHeight || imageSource.height;

  // Run segmentation pipeline
  const result = await segmenter(src);

  onProgress?.({
    stage: "compositing",
    progressPercent: 90,
    message: "Upscaling transparency mask and compositing original resolution...",
  });

  // Result from transformers.js pipeline is typically an array of segmented outputs or a RawImage
  const outputItem = Array.isArray(result) ? result[0] : result;
  if (!outputItem) {
    throw new Error("Segmentation pipeline produced an empty result.");
  }

  // Create canvas to composite original pixels with the returned mask
  const cutoutCanvas = document.createElement("canvas");
  cutoutCanvas.width = originalWidth;
  cutoutCanvas.height = originalHeight;
  const ctx = cutoutCanvas.getContext("2d", { willReadFrequently: true });

  if (!ctx) {
    throw new Error("Unable to obtain 2D canvas context for cutout compositing.");
  }

  // Convert RawImage output to a usable canvas/image
  let maskCanvas: HTMLCanvasElement;
  if (outputItem.toCanvas) {
    maskCanvas = await outputItem.toCanvas();
  } else if (outputItem.mask && outputItem.mask.toCanvas) {
    maskCanvas = await outputItem.mask.toCanvas();
  } else {
    // If output is already a transparent cutout image
    const tempImg = new Image();
    const blobUrl = outputItem.toBlob ? URL.createObjectURL(await outputItem.toBlob()) : src;
    await new Promise((res, rej) => {
      tempImg.onload = res;
      tempImg.onerror = rej;
      tempImg.src = blobUrl;
    });
    ctx.drawImage(tempImg, 0, 0, originalWidth, originalHeight);
    if (blobUrl !== src) URL.revokeObjectURL(blobUrl);
    maskCanvas = cutoutCanvas;
  }

  if (maskCanvas !== cutoutCanvas) {
    // Enable high quality bilinear filtering when scaling mask to original image resolution
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // 1. Draw scaled mask
    ctx.drawImage(maskCanvas, 0, 0, originalWidth, originalHeight);

    // 2. Use 'source-in' to multiply mask alpha into the high-res original image
    ctx.globalCompositeOperation = "source-in";
    if (typeof imageSource !== "string") {
      ctx.drawImage(imageSource, 0, 0, originalWidth, originalHeight);
    } else {
      const origImg = new Image();
      await new Promise((res, rej) => {
        origImg.onload = res;
        origImg.onerror = rej;
        origImg.src = imageSource;
      });
      ctx.drawImage(origImg, 0, 0, originalWidth, originalHeight);
    }
  }

  // Verify actual transparency
  const verification = verifyCutoutTransparency(cutoutCanvas);

  // Convert to Blob
  const cutoutBlob = await new Promise<Blob>((resolve, reject) => {
    cutoutCanvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error("Failed to encode cutout canvas to PNG blob."));
    }, "image/png");
  });

  const cutoutUrl = URL.createObjectURL(cutoutBlob);
  const processingTimeMs = Date.now() - startTime;

  onProgress?.({
    stage: "done",
    progressPercent: 100,
    message: `Completed in ${(processingTimeMs / 1000).toFixed(1)}s`,
  });

  return {
    originalWidth,
    originalHeight,
    cutoutBlob,
    cutoutUrl,
    hasTransparency: verification.hasTransparency,
    transparentPercent: verification.percentTransparent,
    modelUsed: modelId,
    processingTimeMs,
  };
}
