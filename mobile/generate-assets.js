/**
 * Trackr — App Icon Generator
 * Run: node generate-assets.js
 * Requires: npm install --save-dev @napi-rs/canvas
 *
 * Generates:
 *   assets/icon.png          1024x1024  (iOS + general)
 *   assets/adaptive-icon.png 1024x1024  (Android adaptive foreground)
 *   assets/splash.png        1284x2778  (Splash screen)
 *   assets/favicon.png        196x196   (Web)
 */

const { createCanvas } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'assets');
fs.mkdirSync(OUT, { recursive: true });

// ── helpers ──────────────────────────────────────────────────────────────────

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draw the document icon (white page with fold + text lines) centred at (cx, cy).
 * `size` = the full canvas or logical area width — icon scales relative to it.
 */
function drawDocument(ctx, cx, cy, size) {
  const dW   = size * 0.50;          // document width
  const dH   = size * 0.62;          // document height
  const dX   = cx - dW / 2;
  const dY   = cy - dH / 2;
  const fold = dW * 0.27;            // top-right corner fold size
  const dR   = size * 0.038;         // document corner radius

  // ── document body ──────────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.beginPath();
  ctx.moveTo(dX + dR, dY);
  ctx.lineTo(dX + dW - fold, dY);           // top edge → fold start
  ctx.lineTo(dX + dW, dY + fold);           // fold diagonal
  ctx.lineTo(dX + dW, dY + dH - dR);        // right edge
  ctx.quadraticCurveTo(dX + dW, dY + dH, dX + dW - dR, dY + dH); // br
  ctx.lineTo(dX + dR, dY + dH);
  ctx.quadraticCurveTo(dX, dY + dH, dX, dY + dH - dR);           // bl
  ctx.lineTo(dX, dY + dR);
  ctx.quadraticCurveTo(dX, dY, dX + dR, dY);                      // tl
  ctx.closePath();
  ctx.fill();

  // ── fold shadow ────────────────────────────────────────────────────────────
  ctx.fillStyle = 'rgba(251,146,60,0.22)';
  ctx.beginPath();
  ctx.moveTo(dX + dW - fold, dY);
  ctx.lineTo(dX + dW - fold, dY + fold);
  ctx.lineTo(dX + dW, dY + fold);
  ctx.closePath();
  ctx.fill();

  // ── text lines ─────────────────────────────────────────────────────────────
  const lX     = dX + dW * 0.17;
  const lW     = dW * 0.57;
  const lH     = Math.max(3, size * 0.024);
  const lR     = lH / 2;
  const startY = dY + dH * 0.38;
  const gap    = size * 0.074;

  [0, 1, 2, 3].forEach((i) => {
    const lineW = i === 3 ? lW * 0.55 : lW;   // last line shorter
    const lineY = startY + i * gap;
    ctx.fillStyle = 'rgba(251,146,60,0.30)';
    roundRect(ctx, lX, lineY - lH / 2, lineW, lH, lR);
    ctx.fill();
  });
}

/**
 * Fill the canvas with the yellow→orange gradient.
 */
function fillGradient(ctx, w, h) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#fde68a');   // warm yellow (top-left)
  g.addColorStop(1, '#fb923c');   // orange      (bottom-right)
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// ── icon.png (1024×1024) ─────────────────────────────────────────────────────
// iOS applies its own rounded-corner mask, so fill the full square.
{
  const SIZE = 1024;
  const c   = createCanvas(SIZE, SIZE);
  const ctx = c.getContext('2d');

  fillGradient(ctx, SIZE, SIZE);
  drawDocument(ctx, SIZE / 2, SIZE / 2, SIZE);

  fs.writeFileSync(path.join(OUT, 'icon.png'), c.toBuffer('image/png'));
  console.log('✓  assets/icon.png');
}

// ── adaptive-icon.png (1024×1024) ────────────────────────────────────────────
// Android squircle mask — keep the document centred with a bit of breathing room.
{
  const SIZE = 1024;
  const c   = createCanvas(SIZE, SIZE);
  const ctx = c.getContext('2d');

  fillGradient(ctx, SIZE, SIZE);
  // Slightly smaller document so it sits comfortably inside the circular mask
  drawDocument(ctx, SIZE / 2, SIZE / 2, SIZE * 0.88);

  fs.writeFileSync(path.join(OUT, 'adaptive-icon.png'), c.toBuffer('image/png'));
  console.log('✓  assets/adaptive-icon.png');
}

// ── splash.png (1284×2778) ───────────────────────────────────────────────────
// Warm cream background matching Colors.bgWarm; centred logo card.
{
  const W = 1284, H = 2778;
  const c   = createCanvas(W, H);
  const ctx = c.getContext('2d');

  // Background: solid warm cream (matches app.json backgroundColor)
  ctx.fillStyle = '#fffbeb';
  ctx.fillRect(0, 0, W, H);

  // Centred logo card (gradient rounded square)
  const CARD = 260;
  const cardR = CARD * 0.22;
  const cardX = W / 2 - CARD / 2;
  const cardY = H / 2 - CARD / 2 - 40;

  const g = ctx.createLinearGradient(cardX, cardY, cardX + CARD, cardY + CARD);
  g.addColorStop(0, '#fde68a');
  g.addColorStop(1, '#fb923c');
  ctx.fillStyle = g;
  roundRect(ctx, cardX, cardY, CARD, CARD, cardR);
  ctx.fill();

  // Document inside the card
  drawDocument(ctx, W / 2, H / 2 - 40, CARD);

  // "Trackr" wordmark below card
  ctx.fillStyle = '#1c1c1e';
  ctx.font      = 'bold 96px -apple-system, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Trackr', W / 2, H / 2 + CARD / 2 + 60);

  // Tagline
  ctx.fillStyle = '#9ca3af';
  ctx.font      = '52px -apple-system, Arial, sans-serif';
  ctx.fillText('Your job journey companion', W / 2, H / 2 + CARD / 2 + 130);

  fs.writeFileSync(path.join(OUT, 'splash.png'), c.toBuffer('image/png'));
  console.log('✓  assets/splash.png');
}

// ── favicon.png (196×196) ────────────────────────────────────────────────────
{
  const SIZE = 196;
  const c   = createCanvas(SIZE, SIZE);
  const ctx = c.getContext('2d');

  fillGradient(ctx, SIZE, SIZE);
  drawDocument(ctx, SIZE / 2, SIZE / 2, SIZE);

  fs.writeFileSync(path.join(OUT, 'favicon.png'), c.toBuffer('image/png'));
  console.log('✓  assets/favicon.png');
}

console.log('\nAll assets generated in ./assets/');
