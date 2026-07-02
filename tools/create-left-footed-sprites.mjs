import fs from "node:fs";
import zlib from "node:zlib";

const PLAYERS = {
  messi: {
    number: "10",
    shirt: "#f8fbff",
    stripe: "#66c5f0",
    digit: "#1f273f",
    stroke: "#f7fbff",
    sourcePrefix: "messi-back",
  },
  yamal: {
    number: "19",
    shirt: "#c92923",
    stripe: "#182c62",
    digit: "#ffd33b",
    stroke: "#b01819",
    sourcePrefix: "yamal-back",
  },
  salah: {
    number: "10",
    shirt: "#c9292e",
    stripe: "#151515",
    digit: "#f5f5f0",
    stroke: "#7c1719",
    sourcePrefix: "salah-back",
  },
};

const DIGITS = {
  0: ["111", "101", "101", "101", "101", "101", "111"],
  1: ["010", "110", "010", "010", "010", "010", "111"],
  2: ["111", "001", "001", "111", "100", "100", "111"],
  3: ["111", "001", "001", "111", "001", "001", "111"],
  4: ["101", "101", "101", "111", "001", "001", "001"],
  5: ["111", "100", "100", "111", "001", "001", "111"],
  6: ["111", "100", "100", "111", "101", "101", "111"],
  7: ["111", "001", "001", "010", "010", "100", "100"],
  8: ["111", "101", "101", "111", "101", "101", "111"],
  9: ["111", "101", "101", "111", "001", "001", "111"],
};

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
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }

  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!channels) throw new Error(`Unsupported PNG color type ${colorType}`);

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
  fs.writeFileSync(
    file,
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk("IHDR", ihdr),
      chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  );
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function flipHorizontal(image) {
  const out = Buffer.alloc(image.rgba.length);
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const src = (y * image.width + x) * 4;
      const dst = (y * image.width + image.width - 1 - x) * 4;
      image.rgba.copy(out, dst, src, src + 4);
    }
  }
  return { ...image, rgba: out };
}

function fillRect(image, x0, y0, w, h, color, alpha = 255) {
  const [r, g, b] = hexToRgb(color);
  const x1 = Math.min(image.width, Math.round(x0 + w));
  const y1 = Math.min(image.height, Math.round(y0 + h));
  for (let y = Math.max(0, Math.round(y0)); y < y1; y += 1) {
    for (let x = Math.max(0, Math.round(x0)); x < x1; x += 1) {
      const i = (y * image.width + x) * 4;
      if (image.rgba[i + 3] < 12) continue;
      image.rgba[i] = Math.round((image.rgba[i] * (255 - alpha) + r * alpha) / 255);
      image.rgba[i + 1] = Math.round((image.rgba[i + 1] * (255 - alpha) + g * alpha) / 255);
      image.rgba[i + 2] = Math.round((image.rgba[i + 2] * (255 - alpha) + b * alpha) / 255);
    }
  }
}

function drawBlock(image, x0, y0, size, color) {
  fillRect(image, x0, y0, size, size, color, 255);
}

function drawNumber(image, text, cx, cy, size, fill, stroke) {
  const glyphW = 3 * size;
  const glyphH = 7 * size;
  const gap = size;
  const totalW = text.length * glyphW + (text.length - 1) * gap;
  const startX = Math.round(cx - totalW / 2);
  const startY = Math.round(cy - glyphH / 2);
  const offsets = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [1, -1], [-1, 1], [1, 1],
  ];

  for (const [ox, oy] of offsets) drawNumberSolid(image, text, startX + ox * Math.max(2, size * 0.22), startY + oy * Math.max(2, size * 0.22), size, stroke);
  drawNumberSolid(image, text, startX, startY, size, fill);
}

function drawNumberSolid(image, text, x, y, size, color) {
  let cursor = x;
  for (const char of text) {
    const glyph = DIGITS[char];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < glyph[row].length; col += 1) {
        if (glyph[row][col] === "1") drawBlock(image, cursor + col * size, y + row * size, size * 0.86, color);
      }
    }
    cursor += 4 * size;
  }
}

function repairJersey(image, config) {
  const cx = image.width * 0.5;
  const y = image.height * 0.36;
  const patchW = image.width * 0.34;
  const patchH = image.height * 0.23;
  const x0 = cx - patchW / 2;
  const y0 = y - patchH / 2;

  fillRect(image, x0, y0, patchW, patchH, config.shirt, 245);
  if (config.stripe && config.number === "10") {
    fillRect(image, cx - patchW * 0.16, y0, patchW * 0.32, patchH, config.stripe, 235);
  } else if (config.stripe) {
    fillRect(image, x0 + patchW * 0.72, y0, patchW * 0.2, patchH, config.stripe, 105);
  }

  drawNumber(image, config.number, cx, y, Math.max(9, Math.round(image.height * 0.027)), config.digit, config.stroke);
}

for (const [id, config] of Object.entries(PLAYERS)) {
  const inDir = `assets/players/${id}/back-frames`;
  const outDir = `assets/players/${id}/left-back-frames`;
  fs.mkdirSync(outDir, { recursive: true });

  for (let index = 1; index <= 8; index += 1) {
    const suffix = String(index).padStart(2, "0");
    const input = `${inDir}/${config.sourcePrefix}-${suffix}.png`;
    const output = `${outDir}/${id}-left-back-${suffix}.png`;
    const flipped = flipHorizontal(parsePng(input));
    repairJersey(flipped, config);
    writePng(output, flipped.width, flipped.height, flipped.rgba);
  }
}

console.log("Generated left-footed back sprites for Messi, Yamal and Salah.");
