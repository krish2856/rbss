const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal pure Node PNG builder
function createPng(width, height, isMaskable = false) {
  // BG: Deep Navy (#0f172a = 15, 23, 42), Emblem: Gold (#d97706 = 217, 119, 6)
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = isMaskable ? width * 0.45 : width * 0.42;
  const innerRadius = outerRadius * 0.88;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default Navy Blue background
      let r = 15, g = 23, b = 42, a = 255;

      // Outer Gold circular ring
      if (dist <= outerRadius && dist >= innerRadius) {
        r = 217; g = 119; b = 6; // Royal Gold
      } else if (dist < innerRadius) {
        // Inner circle with gradient or central emblem
        if (dist <= innerRadius * 0.75 && dist >= innerRadius * 0.65) {
          r = 245; g = 158; b = 11; // Amber Gold
        } else if (Math.abs(dx) < width * 0.12 && Math.abs(dy) < height * 0.12) {
          // Central emblem box
          r = 254; g = 243; b = 199; // Light Gold Ivory
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // Deflate IDAT
  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table & helper
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach((s) => {
  const buf = createPng(s, s, false);
  fs.writeFileSync(path.join(iconsDir, `icon-${s}x${s}.png`), buf);
  console.log(`Generated icon-${s}x${s}.png`);
});

// Maskable icons
[192, 512].forEach((s) => {
  const buf = createPng(s, s, true);
  fs.writeFileSync(path.join(iconsDir, `icon-${s}x${s}-maskable.png`), buf);
  console.log(`Generated icon-${s}x${s}-maskable.png`);
});

// Also create favicon.ico from 96x96
const favBuf = createPng(96, 96, false);
fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), favBuf);
console.log('Generated favicon.ico');
