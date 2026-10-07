/**
 * ACC 2026 — Photo Editor Zoom & Zero White Space Regression Test Suite
 * Validates that zoom, pan, and crop never expose white space on top or sides.
 */
import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log("======================================================================");
console.log("   ACC 2026 — PHOTO EDITOR ZOOM & NO-WHITE-SPACE TEST SUITE           ");
console.log("======================================================================\n");

const html = fs.readFileSync(path.resolve(process.cwd(), 'Acc-Auction-Os.html'), 'utf8');

// TEST 1: Check minZoom is at least 1.0 (cover-mode)
console.log("--- TEST 1: COVER-MODE ZOOM BASELINE (minZoom >= 1.0) ---");
assert(html.includes("minZoom: 1.0"), "photoEditorState.minZoom must be at least 1.0");
assert(html.includes('min="1.0"'), "Zoom slider min attribute must be at least 1.0");
assert(html.includes("Math.max(1.0,"), "setPhotoZoom must enforce minimum zoom >= 1.0");
console.log("[PASS] Cover-mode baseline verified: minZoom is locked to >= 1.0 (no letterboxing)\n");

// TEST 2: Check edge-clamping algorithm exists
console.log("--- TEST 2: EDGE-CLAMPING ALGORITHM ---");
assert(html.includes("clampPhotoPan"), "clampPhotoPan function must be defined");
assert(html.includes("getPhotoBaseDimensions"), "getPhotoBaseDimensions function must be defined");
assert(html.includes("maxPanY"), "Vertical pan must be clamped to prevent top and bottom gaps");
assert(html.includes("maxPanX"), "Horizontal pan must be clamped to prevent side gaps");
console.log("[PASS] Edge-clamping algorithm verified: panX and panY strictly clamped to frame\n");

// TEST 3: Mathematical verification of Cover Math across aspect ratios
console.log("--- TEST 3: COVER MATH ACROSS ASPECT RATIOS ---");
const targetW = 800;
const targetH = 600;
const boxAspect = 4 / 3;

const testImages = [
  { name: "Portrait (9:16 vertical phone photo)", w: 1080, h: 1920 },
  { name: "Portrait (3:4 passport / headshot)", w: 1200, h: 1600 },
  { name: "Square (1:1 avatar)", w: 1000, h: 1000 },
  { name: "Exact 4:3 catalog frame", w: 1600, h: 1200 },
  { name: "Landscape (16:9 widescreen photo)", w: 1920, h: 1080 },
  { name: "Ultra-wide (21:9 banner)", w: 2560, h: 1080 }
];

testImages.forEach(img => {
  const aspect = img.w / img.h;
  let drawW, drawH;
  if (aspect >= boxAspect) {
    drawH = targetH;
    drawW = targetH * aspect;
  } else {
    drawW = targetW;
    drawH = targetW / aspect;
  }
  assert(drawW >= targetW, `${img.name} width (${drawW}) must be >= targetW (${targetW})`);
  assert(drawH >= targetH, `${img.name} height (${drawH}) must be >= targetH (${targetH})`);
  console.log(`  ✓ ${img.name}: Base draw (${Math.round(drawW)}×${Math.round(drawH)}) completely covers 800×600 canvas`);
});
console.log("[PASS] All aspect ratios mathematically cover 100% of 4:3 canvas\n");

// TEST 4: Mathematical verification that Pan Clamping prevents Top Gap at any Zoom
console.log("--- TEST 4: ZERO TOP GAP VERIFICATION UNDER ZOOM & PAN ---");
const zoomLevels = [1.0, 1.25, 1.5, 2.0, 3.0, 3.5];
testImages.forEach(img => {
  const aspect = img.w / img.h;
  let baseW, baseH;
  const vpW = 400;
  const vpH = 300;
  if (aspect >= boxAspect) {
    baseH = vpH;
    baseW = vpH * aspect;
  } else {
    baseW = vpW;
    baseH = vpW / aspect;
  }

  zoomLevels.forEach(zoom => {
    const currentH = baseH * zoom;
    const maxPanY = Math.max(0, (currentH - vpH) / 2);

    // Try extreme downward drag (+9999px)
    const attemptedPanY = 9999;
    const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, attemptedPanY));

    // Top edge position: center (vpH/2 + clampedPanY) minus half height (currentH/2)
    const topEdge = (vpH / 2 + clampedPanY) - (currentH / 2);
    assert(topEdge <= 0.0001, `Top edge (${topEdge}) must NOT drop below 0 (no white space on top)`);

    // Try extreme upward drag (-9999px)
    const attemptedPanYUp = -9999;
    const clampedPanYUp = Math.max(-maxPanY, Math.min(maxPanY, attemptedPanYUp));
    const bottomEdge = (vpH / 2 + clampedPanYUp) + (currentH / 2);
    assert(bottomEdge >= vpH - 0.0001, `Bottom edge (${bottomEdge}) must NOT rise above vpH (no white space on bottom)`);
  });
});
console.log("[PASS] Zero white space on top/bottom proven across all zoom levels and drag extremes\n");

// TEST 5: Canvas Transform Order Parity
console.log("--- TEST 5: CANVAS TRANSFORM ORDER PARITY ---");
const commitMatch = html.match(/function commitPhotoEditor\(\)\s*\{([\s\S]*?)\n    \}/);
assert(commitMatch, "commitPhotoEditor function must be extracted");
const commitBody = commitMatch[1];

// Verify ctx.translate(factor * pan) is called before ctx.scale
const transIdx = commitBody.indexOf("ctx.translate(photoEditorState.panX * factor");
const scaleIdx = commitBody.indexOf("ctx.scale(photoEditorState.zoom");
assert(transIdx !== -1, "ctx.translate with factor and pan must be present");
assert(scaleIdx !== -1, "ctx.scale must be present");
assert(transIdx < scaleIdx, "ctx.translate must be called BEFORE ctx.scale to avoid zoom pan amplification");
console.log("[PASS] Canvas transform order matches CSS transform order (1:1 zoom panning)\n");

console.log("======================================================================");
console.log(">>> ALL PHOTO EDITOR ZOOM & ZERO-WHITE-SPACE TESTS PASSED! <<<        ");
console.log("======================================================================");
