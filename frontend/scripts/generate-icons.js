const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// Simple icon generator using canvas
function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#0d9488';
  roundRect(ctx, 0, 0, size, size, size * 0.15);
  ctx.fill();
  
  // Wallet body
  const w = size * 0.55;
  const h = size * 0.38;
  const x = (size - w) / 2;
  const y = size * 0.32;
  
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x, y, w, h, size * 0.05);
  ctx.fill();
  
  // Wallet flap
  ctx.fillStyle = '#f0fdfa';
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.2);
  ctx.lineTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h * 0.2);
  ctx.lineTo(x, y + h * 0.2);
  ctx.fill();
  
  // Card line
  ctx.fillStyle = 'rgba(13, 148, 136, 0.3)';
  const cardX = x + w * 0.15;
  const cardY = y + h * 0.55;
  roundRect(ctx, cardX, cardY, w * 0.6, h * 0.12, size * 0.02);
  ctx.fill();
  
  // W letter
  ctx.fillStyle = '#0d9488';
  ctx.font = `bold ${size * 0.22}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('W', size / 2, y + h + (size - y - h) / 2);
  
  return canvas.toBuffer('image/png');
}

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

function generateMaskableIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Full background for maskable
  ctx.fillStyle = '#0d9488';
  ctx.fillRect(0, 0, size, size);
  
  // Smaller icon in center (80% safe zone)
  const iconSize = size * 0.6;
  const offset = (size - iconSize) / 2;
  
  // Wallet body
  const w = iconSize * 0.55;
  const h = iconSize * 0.38;
  const x = offset + (iconSize - w) / 2;
  const y = offset + iconSize * 0.25;
  
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x, y, w, h, iconSize * 0.05);
  ctx.fill();
  
  // W letter
  ctx.fillStyle = '#0d9488';
  ctx.font = `bold ${iconSize * 0.22}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('W', size / 2, y + h + (offset + iconSize - y - h) / 2);
  
  return canvas.toBuffer('image/png');
}

const publicDir = path.join(__dirname, '..', 'public');

// Generate icons
[192, 512].forEach(size => {
  try {
    const buffer = generateIcon(size);
    fs.writeFileSync(path.join(publicDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  } catch (e) {
    console.log(`canvas not available, creating placeholder`);
  }
});

try {
  const maskableBuffer = generateMaskableIcon(512);
  fs.writeFileSync(path.join(publicDir, 'icon-512-maskable.png'));
  console.log('Generated icon-512-maskable.png');
} catch (e) {
  console.log('canvas not available');
}
