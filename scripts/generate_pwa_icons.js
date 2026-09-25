const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
	let c = i;
	for (let k = 0; k < 8; k++) {
		c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
	}
	table[i] = c;
}

function crc32(buf) {
	let crc = 0 ^ (-1);
	for (let i = 0; i < buf.length; i++) {
		crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
	}
	return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
	const len = Buffer.alloc(4);
	len.writeUInt32BE(data.length, 0);
	const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(typeAndData), 0);
	return Buffer.concat([len, typeAndData, crc]);
}

function createPng(width, height, getPixel) {
	const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

	// IHDR chunk
	const ihdrData = Buffer.alloc(13);
	ihdrData.writeUInt32BE(width, 0);
	ihdrData.writeUInt32BE(height, 4);
	ihdrData[8] = 8; // 8 bits per channel
	ihdrData[9] = 6; // RGBA color type
	ihdrData[10] = 0; // compression
	ihdrData[11] = 0; // filter
	ihdrData[12] = 0; // interlace
	const ihdrChunk = makeChunk('IHDR', ihdrData);

	// Raw uncompressed scanlines with filter byte 0
	const rawScanlines = Buffer.alloc(height * (1 + width * 4));
	let offset = 0;

	for (let y = 0; y < height; y++) {
		rawScanlines[offset++] = 0; // No filter for row
		for (let x = 0; x < width; x++) {
			const [r, g, b, a] = getPixel(x, y, width, height);
			rawScanlines[offset++] = Math.max(0, Math.min(255, Math.round(r)));
			rawScanlines[offset++] = Math.max(0, Math.min(255, Math.round(g)));
			rawScanlines[offset++] = Math.max(0, Math.min(255, Math.round(b)));
			rawScanlines[offset++] = Math.max(0, Math.min(255, Math.round(a)));
		}
	}

	const compressed = zlib.deflateSync(rawScanlines, { level: 9 });
	const idatChunk = makeChunk('IDAT', compressed);
	const iendChunk = makeChunk('IEND', Buffer.alloc(0));

	return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Helper math for triangle / monogram rendering
function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
	const v0x = cx - ax, v0y = cy - ay;
	const v1x = bx - ax, v1y = by - ay;
	const v2x = px - ax, v2y = py - ay;

	const dot00 = v0x * v0x + v0y * v0y;
	const dot01 = v0x * v1x + v0y * v1y;
	const dot02 = v0x * v2x + v0y * v2y;
	const dot11 = v1x * v1x + v1y * v1y;
	const dot12 = v1x * v2x + v1y * v2y;

	const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
	const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
	const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

	return (u >= 0) && (v >= 0) && (u + v <= 1);
}

function renderAuraIcon(size, isMaskable = false) {
	return createPng(size, size, (x, y, w, h) => {
		// Normalize coordinates [0, 1]
		const nx = x / w;
		const ny = y / h;

		// Distance from center
		const cx = 0.5;
		const cy = 0.5;
		const distCenter = Math.hypot(nx - cx, ny - cy);

		// Background: Deep AMOLED Black with soft neon vignette
		let bgR = 0, bgG = 0, bgB = 0, bgA = 255;
		
		// If not maskable, we can have rounded squircle or solid
		if (isMaskable) {
			// Solid dark background to ensure safe icon cropping
			bgR = 4;
			bgG = 5;
			bgB = 10;
			bgA = 255;
		} else {
			// Rounded squircle container with dark glass
			bgR = 5;
			bgG = 6;
			bgB = 12;
			bgA = 255;
		}

		// Radial ambient glow in background
		const glow1 = Math.max(0, 1 - Math.hypot(nx - 0.35, ny - 0.35) / 0.55);
		const glow2 = Math.max(0, 1 - Math.hypot(nx - 0.65, ny - 0.65) / 0.55);
		bgR += glow1 * 40;
		bgG += glow1 * 5 + glow2 * 10;
		bgB += glow1 * 20 + glow2 * 60;

		// Scale for the Aura Lambda/Delta Monogram Glyph
		const scale = isMaskable ? 0.68 : 0.78;
		const mx = (nx - 0.5) / scale + 0.5;
		const my = (ny - 0.5) / scale + 0.5;

		// Monogram Coordinates in normalized [0, 1] space:
		// Outer triangle: Top (0.50, 0.12), Left (0.12, 0.85), Right (0.88, 0.85)
		// Outer sub-triangle cutouts / inner geometry:
		const topX = 0.50, topY = 0.14;
		const leftX = 0.14, leftY = 0.86;
		const rightX = 0.86, rightY = 0.86;

		// Inner triangle (hollow cutout): Top (0.50, 0.40), Left (0.32, 0.72), Right (0.68, 0.72)
		const inTopX = 0.50, inTopY = 0.38;
		const inLeftX = 0.33, inLeftY = 0.70;
		const inRightX = 0.67, inRightY = 0.70;

		// Center notch cut
		const notchTopX = 0.50, notchTopY = 0.68;
		const notchLeftX = 0.42, notchLeftY = 0.86;
		const notchRightX = 0.58, notchRightY = 0.86;

		const inOuter = pointInTriangle(mx, my, topX, topY, leftX, leftY, rightX, rightY);
		const inInner = pointInTriangle(mx, my, inTopX, inTopY, inLeftX, inLeftY, inRightX, inRightY);
		const inNotch = pointInTriangle(mx, my, notchTopX, notchTopY, notchLeftX, notchLeftY, notchRightX, notchRightY);

		const isMonogram = inOuter && !inInner && !inNotch;

		// Glowing Neon Gradient: Hot Pink (#ff2a7a) -> Fuchsia (#d946ef) -> Violet (#8b5cf6) -> Cyan (#06b6d4)
		const gradT = Math.max(0, Math.min(1, my));
		const fgR = 255 * (1 - gradT * 0.45) + 139 * (gradT * 0.45);
		const fgG = 42 * (1 - gradT) + 92 * gradT + 60 * Math.sin(gradT * Math.PI);
		const fgB = 122 * (1 - gradT) + 246 * gradT;

		if (isMonogram) {
			// Crisp logo fill with bright specular sheen at top
			const sheen = Math.max(0, 1 - Math.hypot(mx - 0.45, my - 0.25) / 0.4);
			return [
				Math.min(255, fgR + sheen * 70),
				Math.min(255, fgG + sheen * 70),
				Math.min(255, fgB + sheen * 70),
				255
			];
		}

		// Soft Bloom / Neon Glow around logo
		let bloom = 0;
		// Sample distance to outer edge
		if (mx >= 0.05 && mx <= 0.95 && my >= 0.05 && my <= 0.95) {
			const dTop = Math.abs(my - (topY + (mx < 0.5 ? (leftY - topY) / (leftX - topX) * (mx - topX) : (rightY - topY) / (rightX - topX) * (mx - topX))));
			if (dTop < 0.12) {
				bloom = (1 - dTop / 0.12) * 0.45;
			}
		}

		const r = Math.min(255, bgR + fgR * bloom * 0.7);
		const g = Math.min(255, bgG + fgG * bloom * 0.7);
		const b = Math.min(255, bgB + fgB * bloom * 0.7);

		return [r, g, b, 255];
	});
}

// Generate all standard and maskable PWA icon sizes
const staticDir = path.join(__dirname, '..', 'ui', 'static');

console.log('Generating high-resolution PWA icons in:', staticDir);

const icon192 = renderAuraIcon(192, false);
fs.writeFileSync(path.join(staticDir, 'pwa-192x192.png'), icon192);
console.log('✔ Generated pwa-192x192.png (192x192)');

const icon512 = renderAuraIcon(512, false);
fs.writeFileSync(path.join(staticDir, 'pwa-512x512.png'), icon512);
console.log('✔ Generated pwa-512x512.png (512x512)');

const iconMaskable512 = renderAuraIcon(512, true);
fs.writeFileSync(path.join(staticDir, 'pwa-maskable-512x512.png'), iconMaskable512);
console.log('✔ Generated pwa-maskable-512x512.png (512x512 maskable)');

const appleIcon = renderAuraIcon(180, false);
fs.writeFileSync(path.join(staticDir, 'apple-touch-icon.png'), appleIcon);
console.log('✔ Generated apple-touch-icon.png (180x180)');

// Also overwrite favicon.png with crisp 512x512
fs.writeFileSync(path.join(staticDir, 'favicon.png'), icon512);
console.log('✔ Updated favicon.png (512x512)');

console.log('🎉 All PWA icon assets generated successfully!');
