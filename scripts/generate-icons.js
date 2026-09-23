import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, '../public');

async function generate() {
  const regularSvg = fs.readFileSync(path.join(publicDir, 'icon.svg'));
  const maskableSvg = fs.readFileSync(path.join(publicDir, 'maskable-icon.svg'));

  console.log('Generating PWA and Mobile App icons...');

  // 192x192
  await sharp(regularSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // 512x512
  await sharp(regularSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // 512x512 maskable
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Apple touch icon 180x180
  await sharp(regularSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Favicon 32x32 png
  await sharp(regularSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  console.log('Icons successfully generated!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
