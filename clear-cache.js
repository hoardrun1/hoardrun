const fs = require('fs');
const path = require('path');

// Function to recursively delete directory
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

console.log('🧹 Clearing Next.js caches...');

// Clear .next directory
if (fs.existsSync('.next')) {
  console.log('Removing .next directory...');
  deleteFolderRecursive('.next');
}

// Clear node_modules/.cache
if (fs.existsSync('node_modules/.cache')) {
  console.log('Removing node_modules/.cache directory...');
  deleteFolderRecursive('node_modules/.cache');
}

console.log('✅ Cache cleared successfully!');
console.log('💡 Now run: npm run dev');
