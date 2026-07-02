import fs from "node:fs";
import zlib from "node:zlib";

const source = process.argv[2] || "assets/generated/ball-spritesheet-source.png";
const sheetOut = process.argv[3] || "assets/ball/ball-spritesheet.png";
const frameDir = process.argv[4] || "assets/ball/frames";
const framePrefix = process.argv[5] || "ball";
const chromaKey = process.argv[6] || "green";
const sheetOnly = process.argv[7] === "sheet-only";
const celebrationOnly = process.argv[7] === "celebration-only";

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function parsePng(file) {
  const bytes = fs.readFileSync(file);
  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat = [];
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
      if (data[8] !== 8 || data[10] !== 0 || data[11] !== 0 || data[12] !== 0) {
        throw new Error("Unsupported PNG format");
      }
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }

  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!channels) throw new Error(`Unsupported color type ${colorType}`);
  const rowBytes = width * channels;
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const rgba = Buffer.alloc(width * height * 4);
  let inOffset = 0;
  let prev = Buffer.alloc(rowBytes);
  let outOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[inOffset];
    inOffset += 1;
    const row = Buffer.from(inflated.subarray(inOffset, inOffset + rowBytes));
    inOffset += rowBytes;
    for (let x = 0; x < rowBytes; x += 1) {
      const left = x >= channels ? row[x - channels] : 0;
      const up = prev[x];
      const upLeft = x >= channels ? prev[x - channels] : 0;
      if (filter === 1) row[x] = (row[x] + left) & 255;
      else if (filter === 2) row[x] = (row[x] + up) & 255;
      else if (filter === 3) row[x] = (row[x] + Math.floor((left + up) / 2)) & 255;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        row[x] = (row[x] + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft)) & 255;
      } else if (filter !== 0) {
        throw new Error(`Unsupported filter ${filter}`);
      }
    }
    for (let x = 0; x < width; x += 1) {
      const src = x * channels;
      rgba[outOffset++] = row[src];
      rgba[outOffset++] = row[src + 1];
      rgba[outOffset++] = row[src + 2];
      rgba[outOffset++] = channels === 4 ? row[src + 3] : 255;
    }
    prev = row;
  }
  return { width, height, rgba };
}

function writePng(file, width, height, rgba) {
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (1 + width * 4);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return fs.writeFileSync(
    file,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", ihdr),
      chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}

function removeChroma({ width, height, rgba }) {
  const out = Buffer.from(rgba);
  const key = chromaKey === "magenta" ? [255, 0, 255] : [0, 255, 0];
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const distance = Math.hypot(r - key[0], g - key[1], b - key[2]);
    const dominant = chromaKey === "magenta"
      ? r > 145 && b > 145 && r > g * 1.35 && b > g * 1.35
      : g > 145 && g > r * 1.35 && g > b * 1.35;
    if (distance < 95 || dominant) {
      out[i + 3] = 0;
    } else if (distance < 150) {
      out[i + 3] = Math.max(0, Math.min(255, Math.round((distance - 95) * 4.6)));
    }
  }
  return { width, height, rgba: out };
}

function cropFrame(sheet, col, row) {
  const cellW = Math.floor(sheet.width / 4);
  const cellH = Math.floor(sheet.height / 2);
  const x0 = col * cellW;
  const y0 = row * cellH;
  const x1 = col === 3 ? sheet.width : x0 + cellW;
  const y1 = row === 1 ? sheet.height : y0 + cellH;
  let minX = x1;
  let minY = y1;
  let maxX = x0;
  let maxY = y0;

  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const a = sheet.rgba[(y * sheet.width + x) * 4 + 3];
      if (a > 15) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const pad = 12;
  minX = Math.max(x0, minX - pad);
  minY = Math.max(y0, minY - pad);
  maxX = Math.min(x1 - 1, maxX + pad);
  maxY = Math.min(y1 - 1, maxY + pad);
  const w = Math.max(1, maxX - minX + 1);
  const h = Math.max(1, maxY - minY + 1);
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const src = ((minY + y) * sheet.width + minX + x) * 4;
      const dst = (y * w + x) * 4;
      sheet.rgba.copy(out, dst, src, src + 4);
    }
  }
  return { width: w, height: h, rgba: out };
}

function cropCelebration(sheet) {
  const cellW = Math.floor(sheet.width / 4);
  const cellH = Math.floor(sheet.height / 2);
  const x0 = Math.max(0, cellW * 2 - 120);
  const y0 = cellH;
  const x1 = Math.min(sheet.width, cellW * 3 + 120);
  const y1 = sheet.height;
  const regionW = x1 - x0;
  const regionH = y1 - y0;
  const visited = new Uint8Array(regionW * regionH);
  let best = null;

  for (let ry = 0; ry < regionH; ry += 1) {
    for (let rx = 0; rx < regionW; rx += 1) {
      const localIndex = ry * regionW + rx;
      const alpha = sheet.rgba[((y0 + ry) * sheet.width + x0 + rx) * 4 + 3];
      if (visited[localIndex] || alpha <= 15) continue;

      const queue = [localIndex];
      visited[localIndex] = 1;
      let cursor = 0;
      const pixels = [];
      let minX = rx;
      let maxX = rx;
      let minY = ry;
      let maxY = ry;

      while (cursor < queue.length) {
        const current = queue[cursor++];
        const cx = current % regionW;
        const cy = Math.floor(current / regionW);
        pixels.push(current);
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);

        const neighbors = [
          current - 1,
          current + 1,
          current - regionW,
          current + regionW,
        ];
        for (const next of neighbors) {
          if (next < 0 || next >= visited.length || visited[next]) continue;
          const nx = next % regionW;
          const ny = Math.floor(next / regionW);
          if (Math.abs(nx - cx) + Math.abs(ny - cy) !== 1) continue;
          const nextAlpha = sheet.rgba[((y0 + ny) * sheet.width + x0 + nx) * 4 + 3];
          if (nextAlpha <= 15) continue;
          visited[next] = 1;
          queue.push(next);
        }
      }

      if (!best || pixels.length > best.pixels.length) {
        best = { pixels, minX, maxX, minY, maxY };
      }
    }
  }

  if (!best) throw new Error("No celebration component found");
  const pad = 18;
  const minX = Math.max(0, best.minX - pad);
  const minY = Math.max(0, best.minY - pad);
  const maxX = Math.min(regionW - 1, best.maxX + pad);
  const maxY = Math.min(regionH - 1, best.maxY + pad);
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const out = Buffer.alloc(width * height * 4);
  const component = new Uint8Array(regionW * regionH);
  for (const pixel of best.pixels) component[pixel] = 1;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      if (!component[y * regionW + x]) continue;
      const src = ((y0 + y) * sheet.width + x0 + x) * 4;
      const dst = ((y - minY) * width + x - minX) * 4;
      sheet.rgba.copy(out, dst, src, src + 4);
    }
  }

  return { width, height, rgba: out };
}

const transparent = removeChroma(parsePng(source));
if (celebrationOnly) {
  const celebration = cropCelebration(transparent);
  writePng(sheetOut, celebration.width, celebration.height, celebration.rgba);
} else {
  writePng(sheetOut, transparent.width, transparent.height, transparent.rgba);
}
if (!sheetOnly && !celebrationOnly) {
  fs.mkdirSync(frameDir, { recursive: true });
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const index = row * 4 + col + 1;
      const frame = cropFrame(transparent, col, row);
      writePng(`${frameDir}/${framePrefix}-${String(index).padStart(2, "0")}.png`, frame.width, frame.height, frame.rgba);
    }
  }
}

let transparentPixels = 0;
for (let i = 3; i < transparent.rgba.length; i += 4) {
  if (transparent.rgba[i] < 16) transparentPixels += 1;
}
const transparentPercent = ((transparentPixels / (transparent.width * transparent.height)) * 100).toFixed(1);
console.log(
  `${celebrationOnly || sheetOnly ? `Wrote ${sheetOut}` : `Wrote ${sheetOut} and 8 frames in ${frameDir}`} (${transparentPercent}% transparent)`,
);
