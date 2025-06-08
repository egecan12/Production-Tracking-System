const fs = require('fs');
const path = require('path');

// Simple SVG icon generator for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

const generateSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3B82F6" rx="${size * 0.1}"/>
  <rect x="${size * 0.15}" y="${size * 0.15}" width="${size * 0.7}" height="${size * 0.7}" fill="white" rx="${size * 0.05}"/>
  <rect x="${size * 0.25}" y="${size * 0.25}" width="${size * 0.5}" height="${size * 0.1}" fill="#3B82F6" rx="${size * 0.02}"/>
  <rect x="${size * 0.25}" y="${size * 0.4}" width="${size * 0.3}" height="${size * 0.08}" fill="#3B82F6" rx="${size * 0.02}"/>
  <rect x="${size * 0.25}" y="${size * 0.53}" width="${size * 0.4}" height="${size * 0.08}" fill="#3B82F6" rx="${size * 0.02}"/>
  <rect x="${size * 0.25}" y="${size * 0.66}" width="${size * 0.25}" height="${size * 0.08}" fill="#3B82F6" rx="${size * 0.02}"/>
  <text x="${size/2}" y="${size * 0.9}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${size * 0.08}" font-weight="bold" fill="#3B82F6">PT</text>
</svg>`;
};

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons (we'll use these as placeholders)
iconSizes.forEach(size => {
  const svgContent = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

console.log('Icon generation complete!');
console.log('Note: For production, you should replace these SVG files with proper PNG icons.');
console.log('You can use tools like ImageMagick or online converters to convert SVG to PNG.');
console.log('Example: convert icon-192x192.svg icon-192x192.png'); 