import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression method: deflate
  ihdr[11] = 0; // Filter method: standard
  ihdr[12] = 0; // Interlace method: none

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const offset = y * scanlineLength;
    rawData[offset] = 0; // Filter byte 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = offset + 1 + x * 4;
      // Beautiful gradient and rounded-corner or star/play mark
      const dx = (x - width / 2) / (width / 2);
      const dy = (y - height / 2) / (height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gradient from violet (#8B5CF6) to deep purple (#4C1D95)
      const factor = (x + y) / (width + height);
      let pr = Math.round(139 * (1 - factor * 0.4));
      let pg = Math.round(92 * (1 - factor * 0.4));
      let pb = Math.round(246 * (1 - factor * 0.2));
      let pa = 255;

      // Outer rounded border
      if (dist > 0.95) {
        pa = 0; // transparent corners
      } else if (dist > 0.88) {
        pa = Math.round(255 * (1 - (dist - 0.88) / 0.07));
      }

      // Play icon / lightning center in white
      const inPlayCenter = (x > width * 0.35 && x < width * 0.72 && Math.abs(y - height / 2) < (x - width * 0.35) * 0.9);
      if (inPlayCenter && dist < 0.75) {
        pr = 255;
        pg = 255;
        pb = 255;
      }

      rawData[pxOffset] = pr;
      rawData[pxOffset + 1] = pg;
      rawData[pxOffset + 2] = pb;
      rawData[pxOffset + 3] = pa;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = calculateCRC(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function calculateCRC(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc = crcTable[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const iconsDir = path.resolve('public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

[16, 48, 128].forEach(size => {
  const buf = createPNG(size, size, 139, 92, 246);
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, buf);
  console.log(`Generated ${filePath} (${size}x${size}, ${buf.length} bytes)`);
});
