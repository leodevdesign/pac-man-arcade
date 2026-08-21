// Script para gerar icon.png e icon.ico usando png-to-ico
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import pngToIco from 'png-to-ico';

function createPNG(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = createChunk('IHDR', ihdrData);

  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0;
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = y * (1 + width * 4) + 1 + x * 4;
      rawData[dstIdx] = pixels[srcIdx];
      rawData[dstIdx + 1] = pixels[srcIdx + 1];
      rawData[dstIdx + 2] = pixels[srcIdx + 2];
      rawData[dstIdx + 3] = pixels[srcIdx + 3];
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = createChunk('IDAT', compressed);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);

  let crc = 0xFFFFFFFF;
  for (let i = 0; i < crcData.length; i++) {
    crc ^= crcData[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  crc = (crc ^ 0xFFFFFFFF) >>> 0;
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

async function generate() {
  const SIZE = 256;
  const pixels = Buffer.alloc(SIZE * SIZE * 4);
  const CENTER = SIZE / 2;
  const RADIUS = SIZE / 2 - 8;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (y * SIZE + x) * 4;
      const dx = x - CENTER;
      const dy = y - CENTER;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= RADIUS) {
        const angle = Math.atan2(dy, dx);
        const mouthAngle = Math.PI / 5;

        if (Math.abs(angle) < mouthAngle) {
          pixels[idx] = 0;
          pixels[idx + 1] = 0;
          pixels[idx + 2] = 0;
          pixels[idx + 3] = 0;
        } else {
          pixels[idx] = 255;
          pixels[idx + 1] = 230;
          pixels[idx + 2] = 0;
          pixels[idx + 3] = 255;

          const eyeX = CENTER + RADIUS * 0.3;
          const eyeY = CENTER - RADIUS * 0.35;
          const eyeDist = Math.sqrt((x - eyeX) ** 2 + (y - eyeY) ** 2);
          if (eyeDist < RADIUS * 0.1) {
            pixels[idx] = 8;
            pixels[idx + 1] = 4;
            pixels[idx + 2] = 18;
            pixels[idx + 3] = 255;
          }
        }
      } else {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
      }
    }
  }

  const png = createPNG(SIZE, SIZE, pixels);
  const outDir = path.join(process.cwd(), 'build');
  fs.mkdirSync(outDir, { recursive: true });
  const pngPath = path.join(outDir, 'icon.png');
  fs.writeFileSync(pngPath, png);
  console.log('✅ PNG gerado em build/icon.png');

  // Converte para ICO nativo Windows com múltiplos tamanhos
  const icoBuffer = await pngToIco(pngPath);
  const icoPath = path.join(outDir, 'icon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log('✅ ICO gerado com sucesso em build/icon.ico');
}

generate().catch(err => {
  console.error('Erro gerando ícones:', err);
  process.exit(1);
});
