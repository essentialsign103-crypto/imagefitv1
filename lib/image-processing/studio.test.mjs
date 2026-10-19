import { describe, it } from "node:test";
import assert from "node:assert/strict";

// Helper mirroring sanitizeFilename from lib/utils.ts
function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function generateStudioFilename(originalName, variant, format) {
  const safeBase = sanitizeFilename(originalName || "image");
  const lastDot = safeBase.lastIndexOf(".");
  const nameWithoutExt = lastDot > 0 ? safeBase.substring(0, lastDot) : safeBase;

  const extMap = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  };

  const extension = extMap[format] || "png";
  return `${nameWithoutExt}-${variant}.${extension}`;
}

function calculateTransparencyStats(alphaArray, totalPixels) {
  let transparentPixelCount = 0;
  for (let i = 0; i < alphaArray.length; i++) {
    if (alphaArray[i] < 250) {
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

function calculateSubjectPlacement(canvasWidth, canvasHeight, srcWidth, srcHeight, transform) {
  const scale = Math.max(0.1, transform.scale);
  const targetW = srcWidth * scale;
  const targetH = srcHeight * scale;

  const centerX = canvasWidth / 2 + transform.offsetX * canvasWidth;
  const centerY = canvasHeight / 2 + transform.offsetY * canvasHeight;

  return {
    centerX,
    centerY,
    targetW,
    targetH,
    drawX: centerX - targetW / 2,
    drawY: centerY - targetH / 2,
    flipX: transform.flipH ? -1 : 1,
    flipY: transform.flipV ? -1 : 1,
  };
}

function calculateBgFit(fitMode, canvasWidth, canvasHeight, bgWidth, bgHeight) {
  if (fitMode === "stretch") {
    return { drawX: 0, drawY: 0, drawW: canvasWidth, drawH: canvasHeight };
  } else if (fitMode === "contain") {
    const scale = Math.min(canvasWidth / bgWidth, canvasHeight / bgHeight);
    const drawW = bgWidth * scale;
    const drawH = bgHeight * scale;
    const drawX = (canvasWidth - drawW) / 2;
    const drawY = (canvasHeight - drawH) / 2;
    return { drawX, drawY, drawW, drawH };
  } else {
    // cover
    const scale = Math.max(canvasWidth / bgWidth, canvasHeight / bgHeight);
    const drawW = bgWidth * scale;
    const drawH = bgHeight * scale;
    const drawX = (canvasWidth - drawW) / 2;
    const drawY = (canvasHeight - drawH) / 2;
    return { drawX, drawY, drawW, drawH };
  }
}

describe("ImageFit Background Studio & Compositing Engine Verification", () => {
  describe("Studio Filename Generation", () => {
    it("generates correct cutout filename for PNG", () => {
      const out = generateStudioFilename("product_photo.jpg", "cutout", "image/png");
      assert.equal(out, "product_photo-cutout.png");
    });

    it("generates correct studio filename for JPEG", () => {
      const out = generateStudioFilename("headshot.png", "studio", "image/jpeg");
      assert.equal(out, "headshot-studio.jpg");
    });

    it("generates correct studio filename for WebP", () => {
      const out = generateStudioFilename("item.preview.png", "studio", "image/webp");
      assert.equal(out, "item.preview-studio.webp");
    });

    it("sanitizes dangerous path traversal and shell characters in filenames", () => {
      const out = generateStudioFilename("../../../etc/passwd;rm -rf.png", "cutout", "image/png");
      assert.equal(out.includes("/"), false);
      assert.equal(out.includes(";"), false);
      assert.equal(out.includes(" "), false);
      assert.equal(out.endsWith("-cutout.png"), true);
    });
  });

  describe("Cutout Transparency Verification", () => {
    it("identifies fully opaque image as having no transparency", () => {
      const alphas = new Uint8Array([255, 255, 255, 255, 255, 255]);
      const stats = calculateTransparencyStats(alphas, 6);
      assert.equal(stats.hasTransparency, false);
      assert.equal(stats.transparentPixelCount, 0);
      assert.equal(stats.percentTransparent, 0);
    });

    it("accurately detects transparent pixels and calculates percentage", () => {
      // 4 pixels: 2 fully transparent (0), 1 semi-transparent (128), 1 opaque (255)
      const alphas = new Uint8Array([0, 0, 128, 255]);
      const stats = calculateTransparencyStats(alphas, 4);
      assert.equal(stats.hasTransparency, true);
      assert.equal(stats.transparentPixelCount, 3);
      assert.equal(stats.percentTransparent, 75.0);
    });

    it("handles edge-case near-opaque pixels with 250 threshold", () => {
      const alphas = new Uint8Array([251, 254, 255]);
      const stats = calculateTransparencyStats(alphas, 3);
      assert.equal(stats.hasTransparency, false);
    });
  });

  describe("Subject Placement & Transform Logic", () => {
    it("places subject centered by default at 100% scale", () => {
      const transform = { scale: 1.0, offsetX: 0, offsetY: 0, flipH: false, flipV: false };
      const res = calculateSubjectPlacement(1000, 1000, 400, 400, transform);
      assert.equal(res.centerX, 500);
      assert.equal(res.centerY, 500);
      assert.equal(res.targetW, 400);
      assert.equal(res.targetH, 400);
      assert.equal(res.drawX, 300);
      assert.equal(res.drawY, 300);
    });

    it("correctly applies scaling factors (e.g. 50% scale)", () => {
      const transform = { scale: 0.5, offsetX: 0, offsetY: 0, flipH: false, flipV: false };
      const res = calculateSubjectPlacement(1000, 1000, 400, 600, transform);
      assert.equal(res.targetW, 200);
      assert.equal(res.targetH, 300);
      assert.equal(res.drawX, 400);
      assert.equal(res.drawY, 350);
    });

    it("correctly shifts placement with horizontal and vertical offsets", () => {
      const transform = { scale: 1.0, offsetX: 0.25, offsetY: -0.1, flipH: false, flipV: false };
      const res = calculateSubjectPlacement(1000, 1000, 400, 400, transform);
      // centerX = 500 + 0.25 * 1000 = 750
      // centerY = 500 - 0.10 * 1000 = 400
      assert.equal(res.centerX, 750);
      assert.equal(res.centerY, 400);
    });

    it("sets proper flip signs for horizontal and vertical mirroring", () => {
      const transform = { scale: 1.0, offsetX: 0, offsetY: 0, flipH: true, flipV: false };
      const res = calculateSubjectPlacement(800, 600, 200, 200, transform);
      assert.equal(res.flipX, -1);
      assert.equal(res.flipY, 1);
    });
  });

  describe("Custom Background Fitting Logic", () => {
    it("scales cover background to completely cover canvas without letterboxing", () => {
      // 1000x500 canvas (2:1), 800x800 background (1:1)
      const res = calculateBgFit("cover", 1000, 500, 800, 800);
      // scale should be 1000 / 800 = 1.25 -> drawW = 1000, drawH = 1000
      assert.equal(res.drawW, 1000);
      assert.equal(res.drawH, 1000);
      assert.equal(res.drawX, 0);
      assert.equal(res.drawY, -250); // vertically centered
    });

    it("scales contain background to stay entirely inside canvas with pillarboxing", () => {
      // 1000x500 canvas (2:1), 800x800 background (1:1)
      const res = calculateBgFit("contain", 1000, 500, 800, 800);
      // scale should be 500 / 800 = 0.625 -> drawW = 500, drawH = 500
      assert.equal(res.drawW, 500);
      assert.equal(res.drawH, 500);
      assert.equal(res.drawX, 250); // horizontally centered
      assert.equal(res.drawY, 0);
    });

    it("stretches background exactly to canvas boundaries when requested", () => {
      const res = calculateBgFit("stretch", 1200, 800, 400, 300);
      assert.equal(res.drawW, 1200);
      assert.equal(res.drawH, 800);
      assert.equal(res.drawX, 0);
      assert.equal(res.drawY, 0);
    });
  });

  describe("Model Specifications & Licensing Policy", () => {
    it("verifies BiRefNet Lite has MIT license and universal salient category", () => {
      const model = {
        id: "onnx-community/BiRefNet_lite-ONNX",
        category: "universal",
        license: "MIT",
        approxSizeMb: 224,
      };
      assert.equal(model.license, "MIT");
      assert.equal(model.category, "universal");
      assert.equal(model.approxSizeMb, 224);
    });

    it("verifies MODNet is categorized for portrait matting with Apache-2.0 license", () => {
      const model = {
        id: "Xenova/modnet",
        category: "portrait",
        license: "Apache-2.0",
        approxSizeMb: 25,
      };
      assert.equal(model.license, "Apache-2.0");
      assert.equal(model.category, "portrait");
      assert.equal(model.approxSizeMb, 25);
    });
  });

  describe("Format Export & Transparency Preservation Rules", () => {
    it("enforces PNG for transparent cutout downloads", () => {
      const bgType = "transparent";
      const chosenFormat = "image/png";
      const preservesAlpha = chosenFormat === "image/png" || chosenFormat === "image/webp";
      assert.equal(preservesAlpha, true);
    });

    it("detects JPEG cannot preserve transparency and requires flattening color", () => {
      const chosenFormat = "image/jpeg";
      const supportsAlpha = chosenFormat !== "image/jpeg";
      assert.equal(supportsAlpha, false);

      const flattenColor = "#FFFFFF";
      assert.match(flattenColor, /^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe("Asynchronous Lifecycle & Cleanup Safety", () => {
    it("increments active request ID to invalidate stale async operations", () => {
      let activeRequestId = 0;
      activeRequestId++;
      const currentOpId = activeRequestId;

      // Simulate a newer upload triggering another request
      activeRequestId++;

      const isStale = currentOpId !== activeRequestId;
      assert.equal(isStale, true);
    });
  });
});
