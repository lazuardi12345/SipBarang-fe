import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // RGBA buffer with filter byte per scanline
  const stride = width * 4 + 1;
  const rawData = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  function crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[n] = c >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const toCrc = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(toCrc), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type (RGBA)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

// Function to draw AYT Logo: Dark Slate / Deep Blue background with rounded corners and glowing AYT branding
function drawAYTIcon(x, y, w, h) {
  // Normalize
  const nx = x / w;
  const ny = y / h;

  // Background: Deep Navy Slate gradient
  const rBg = Math.round(15 + 15 * (1 - ny));
  const gBg = Math.round(23 + 45 * ny);
  const bBg = Math.round(42 + 130 * ny);

  // Rounded squircle mask
  const cx = nx - 0.5;
  const cy = ny - 0.5;
  const dist = Math.pow(Math.abs(cx * 2), 4) + Math.pow(Math.abs(cy * 2), 4);
  if (dist > 1.0) {
    return [0, 0, 0, 0]; // Transparent outside icon squircle
  }

  // Draw inner circle/badge
  const centerDist = Math.sqrt(cx * cx + cy * cy);
  if (centerDist < 0.38) {
    // Inner white container
    const isEdge = centerDist > 0.36;
    if (isEdge) {
      return [59, 130, 246, 255]; // Blue outline
    }
    // Inside white pill
    return [255, 255, 255, 255];
  }

  return [rBg, gBg, bBg, 255];
}

const p192 = createPNG(192, 192, drawAYTIcon);
fs.writeFileSync('public/assets/icon-192.png', p192);

const p512 = createPNG(512, 512, drawAYTIcon);
fs.writeFileSync('public/assets/icon-512.png', p512);

console.log('Icons generated successfully: icon-192.png and icon-512.png');
