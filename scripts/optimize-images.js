/**
 * Image Optimization Script
 * 
 * This script helps identify images that need optimization
 * Run: node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const componentsDir = path.join(__dirname, '..', 'components');
const appDir = path.join(__dirname, '..', 'app');

// Image extensions to check
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.avif'];

// Find all image files in public directory
function findImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== 'node_modules' && file !== '.next') {
        findImages(filePath, fileList);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        fileList.push({
          path: filePath,
          size: stat.size,
          ext: ext,
          name: file,
        });
      }
    }
  });

  return fileList;
}

// Find image references in code
function findImageReferences(dir, references = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        findImageReferences(filePath, references);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Find next/image imports
      const hasNextImage = content.includes('from "next/image"') || content.includes("from 'next/image'");
      
      // Find image sources
      const imgSrcMatches = content.match(/src=["']([^"']+\.(jpg|jpeg|png|gif|svg|webp|avif))["']/gi);
      
      if (imgSrcMatches) {
        references.push({
          file: filePath.replace(dir, ''),
          usesNextImage: hasNextImage,
          images: imgSrcMatches,
        });
      }
    }
  });

  return references;
}

console.log('🔍 Analyzing images in the project...\n');

// Find all images in public directory
const images = findImages(publicDir);

console.log('📁 Images found in /public:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (images.length === 0) {
  console.log('✅ No images found in /public directory');
} else {
  let totalSize = 0;
  images.forEach((img) => {
    const sizeMB = (img.size / (1024 * 1024)).toFixed(2);
    totalSize += img.size;
    console.log(`${img.name} (${sizeMB} MB)`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total: ${images.length} images, ${(totalSize / (1024 * 1024)).toFixed(2)} MB\n`);

  // Recommendations
  console.log('💡 Recommendations:');
  images.forEach((img) => {
    if (img.ext === '.jpg' || img.ext === '.jpeg' || img.ext === '.png') {
      console.log(`  ⚠️  Convert ${img.name} to WebP or AVIF format`);
    }
    if (img.size > 500000) { // > 500KB
      console.log(`  ⚠️  ${img.name} is large (${(img.size / (1024 * 1024)).toFixed(2)} MB) - consider compression`);
    }
  });
  console.log('');
}

// Find image references in code
console.log('📝 Checking image usage in code...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const componentRefs = findImageReferences(componentsDir);
const appRefs = findImageReferences(appDir);
const allRefs = [...componentRefs, ...appRefs];

if (allRefs.length === 0) {
  console.log('✅ No image references found in code');
} else {
  allRefs.forEach((ref) => {
    console.log(`\n📄 ${ref.file}`);
    console.log(`   Uses next/image: ${ref.usesNextImage ? '✅ Yes' : '❌ No (Consider using next/image)'}`);
    console.log(`   Images found: ${ref.images.length}`);
  });
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Summary:');
console.log(`   Total images in /public: ${images.length}`);
console.log(`   Files with image references: ${allRefs.length}`);
console.log(`   Files using next/image: ${allRefs.filter(r => r.usesNextImage).length}`);
console.log(`   Files NOT using next/image: ${allRefs.filter(r => !r.usesNextImage).length}`);

console.log('\n✨ Next Steps:');
console.log('   1. Convert JPG/PNG to WebP using: https://squoosh.app');
console.log('   2. Replace <img> tags with <Image> from next/image');
console.log('   3. Add width and height attributes to all images');
console.log('   4. Add alt text for accessibility');
console.log('   5. Consider lazy loading for below-the-fold images\n');
