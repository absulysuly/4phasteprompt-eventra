const fs = require('fs');
const path = require('path');

// Simple base64 encoded PNG for a basic icon
const createBasicIcon = (size) => {
  // This is a simple Iraq flag colors icon - Green, White, Red, Black
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="33%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="66%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ef4444;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#gradient)" rx="${size * 0.15}"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white">🇮🇶</text>
  <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${size * 0.08}" fill="white" opacity="0.9"/>
  <text x="${size * 0.8}" y="${size * 0.2}" text-anchor="middle" dy=".35em" font-family="Arial, sans-serif" font-size="${size * 0.06}" font-weight="bold" fill="#333">📅</text>
</svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// Generate placeholder icons for all required sizes
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating PWA icons...');

iconSizes.forEach(size => {
  const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  
  // Only create if doesn't exist
  if (!fs.existsSync(iconPath)) {
    const svgData = createBasicIcon(size);
    
    // For now, just create a text file as placeholder
    // In a real implementation, you'd use a library like Sharp or Canvas to convert SVG to PNG
    const placeholderContent = `# PWA Icon Placeholder
# Size: ${size}x${size}
# This is a placeholder for icon-${size}x${size}.png
# Replace this with actual PNG icon
# SVG data: ${svgData}
`;
    
    fs.writeFileSync(iconPath + '.placeholder', placeholderContent);
    console.log(`✅ Created placeholder for icon-${size}x${size}.png`);
  } else {
    console.log(`✅ Icon icon-${size}x${size}.png already exists`);
  }
});

console.log('🎉 Icon generation complete!');
console.log('📌 Note: Replace .placeholder files with actual PNG icons for production');