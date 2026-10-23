import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1c1612" stop-opacity="0.05"/>
      <stop offset="0.45" stop-color="#1c1612" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#1c1612" stop-opacity="0.88"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#shade)"/>
  <text x="72" y="430" fill="#e6d3ae" font-family="DejaVu Sans, sans-serif" font-size="22" letter-spacing="4">THE HOTEL EDIT</text>
  <text x="72" y="510" fill="#fbf8f4" font-family="DejaVu Serif, serif" font-size="84">Lina</text>
  <text x="72" y="566" fill="#f3eee6" font-family="DejaVu Sans, sans-serif" font-size="28">Hotels that look like luxury.</text>
</svg>`;

await mkdir('public', { recursive: true });
await sharp('src/assets/photos/paris.jpg')
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .composite([{ input: Buffer.from(svg) }])
  .jpeg({ quality: 72, mozjpeg: true })
  .toFile('public/og.jpg');
