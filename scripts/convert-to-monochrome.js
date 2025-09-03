#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Color mappings for background colors
const bgColorMappings = {
  // Blue colors
  'bg-blue-50': 'bg-gray-50',
  'bg-blue-100': 'bg-gray-100',
  'bg-blue-200': 'bg-gray-200',
  'bg-blue-300': 'bg-gray-300',
  'bg-blue-400': 'bg-gray-400',
  'bg-blue-500': 'bg-gray-500',
  'bg-blue-600': 'bg-gray-600',
  'bg-blue-700': 'bg-gray-700',
  'bg-blue-800': 'bg-gray-800',
  'bg-blue-900': 'bg-gray-900',
  
  // Green colors
  'bg-green-50': 'bg-gray-50',
  'bg-green-100': 'bg-gray-100',
  'bg-green-200': 'bg-gray-200',
  'bg-green-300': 'bg-gray-300',
  'bg-green-400': 'bg-gray-400',
  'bg-green-500': 'bg-gray-500',
  'bg-green-600': 'bg-gray-600',
  'bg-green-700': 'bg-gray-700',
  'bg-green-800': 'bg-gray-800',
  'bg-green-900': 'bg-gray-900',
  
  // Red colors
  'bg-red-50': 'bg-gray-50',
  'bg-red-100': 'bg-gray-100',
  'bg-red-200': 'bg-gray-200',
  'bg-red-300': 'bg-gray-300',
  'bg-red-400': 'bg-gray-400',
  'bg-red-500': 'bg-gray-500',
  'bg-red-600': 'bg-gray-600',
  'bg-red-700': 'bg-gray-700',
  'bg-red-800': 'bg-gray-800',
  'bg-red-900': 'bg-gray-900',
  
  // Yellow colors
  'bg-yellow-50': 'bg-gray-50',
  'bg-yellow-100': 'bg-gray-100',
  'bg-yellow-200': 'bg-gray-200',
  'bg-yellow-300': 'bg-gray-300',
  'bg-yellow-400': 'bg-gray-400',
  'bg-yellow-500': 'bg-gray-500',
  'bg-yellow-600': 'bg-gray-600',
  'bg-yellow-700': 'bg-gray-700',
  'bg-yellow-800': 'bg-gray-800',
  'bg-yellow-900': 'bg-gray-900',
  
  // Purple colors
  'bg-purple-50': 'bg-gray-50',
  'bg-purple-100': 'bg-gray-100',
  'bg-purple-200': 'bg-gray-200',
  'bg-purple-300': 'bg-gray-300',
  'bg-purple-400': 'bg-gray-400',
  'bg-purple-500': 'bg-gray-500',
  'bg-purple-600': 'bg-gray-600',
  'bg-purple-700': 'bg-gray-700',
  'bg-purple-800': 'bg-gray-800',
  'bg-purple-900': 'bg-gray-900',
  
  // Orange colors
  'bg-orange-50': 'bg-gray-50',
  'bg-orange-100': 'bg-gray-100',
  'bg-orange-200': 'bg-gray-200',
  'bg-orange-300': 'bg-gray-300',
  'bg-orange-400': 'bg-gray-400',
  'bg-orange-500': 'bg-gray-500',
  'bg-orange-600': 'bg-gray-600',
  'bg-orange-700': 'bg-gray-700',
  'bg-orange-800': 'bg-gray-800',
  'bg-orange-900': 'bg-gray-900',
};

// Color mappings for text colors
const textColorMappings = {
  // Blue colors
  'text-blue-50': 'text-gray-50',
  'text-blue-100': 'text-gray-100',
  'text-blue-200': 'text-gray-200',
  'text-blue-300': 'text-gray-300',
  'text-blue-400': 'text-gray-400',
  'text-blue-500': 'text-gray-500',
  'text-blue-600': 'text-gray-600',
  'text-blue-700': 'text-gray-700',
  'text-blue-800': 'text-gray-800',
  'text-blue-900': 'text-gray-900',
  
  // Green colors
  'text-green-50': 'text-gray-50',
  'text-green-100': 'text-gray-100',
  'text-green-200': 'text-gray-200',
  'text-green-300': 'text-gray-300',
  'text-green-400': 'text-gray-400',
  'text-green-500': 'text-gray-500',
  'text-green-600': 'text-gray-600',
  'text-green-700': 'text-gray-700',
  'text-green-800': 'text-gray-800',
  'text-green-900': 'text-gray-900',
  
  // Red colors
  'text-red-50': 'text-gray-50',
  'text-red-100': 'text-gray-100',
  'text-red-200': 'text-gray-200',
  'text-red-300': 'text-gray-300',
  'text-red-400': 'text-gray-400',
  'text-red-500': 'text-gray-500',
  'text-red-600': 'text-gray-600',
  'text-red-700': 'text-gray-700',
  'text-red-800': 'text-gray-800',
  'text-red-900': 'text-gray-900',
  
  // Yellow colors
  'text-yellow-50': 'text-gray-50',
  'text-yellow-100': 'text-gray-100',
  'text-yellow-200': 'text-gray-200',
  'text-yellow-300': 'text-gray-300',
  'text-yellow-400': 'text-gray-400',
  'text-yellow-500': 'text-gray-500',
  'text-yellow-600': 'text-gray-600',
  'text-yellow-700': 'text-gray-700',
  'text-yellow-800': 'text-gray-800',
  'text-yellow-900': 'text-gray-900',
  
  // Purple colors
  'text-purple-50': 'text-gray-50',
  'text-purple-100': 'text-gray-100',
  'text-purple-200': 'text-gray-200',
  'text-purple-300': 'text-gray-300',
  'text-purple-400': 'text-gray-400',
  'text-purple-500': 'text-gray-500',
  'text-purple-600': 'text-gray-600',
  'text-purple-700': 'text-gray-700',
  'text-purple-800': 'text-gray-800',
  'text-purple-900': 'text-gray-900',
  
  // Orange colors
  'text-orange-50': 'text-gray-50',
  'text-orange-100': 'text-gray-100',
  'text-orange-200': 'text-gray-200',
  'text-orange-300': 'text-gray-300',
  'text-orange-400': 'text-gray-400',
  'text-orange-500': 'text-gray-500',
  'text-orange-600': 'text-gray-600',
  'text-orange-700': 'text-gray-700',
  'text-orange-800': 'text-gray-800',
  'text-orange-900': 'text-gray-900',
};

// Hover color mappings
const hoverColorMappings = {
  // Background hover colors
  'hover:bg-blue-50': 'hover:bg-gray-50',
  'hover:bg-blue-100': 'hover:bg-gray-100',
  'hover:bg-blue-200': 'hover:bg-gray-200',
  'hover:bg-blue-300': 'hover:bg-gray-300',
  'hover:bg-blue-400': 'hover:bg-gray-400',
  'hover:bg-blue-500': 'hover:bg-gray-500',
  'hover:bg-blue-600': 'hover:bg-gray-600',
  'hover:bg-blue-700': 'hover:bg-gray-700',
  'hover:bg-blue-800': 'hover:bg-gray-800',
  'hover:bg-blue-900': 'hover:bg-gray-900',
  
  'hover:bg-green-50': 'hover:bg-gray-50',
  'hover:bg-green-100': 'hover:bg-gray-100',
  'hover:bg-green-200': 'hover:bg-gray-200',
  'hover:bg-green-300': 'hover:bg-gray-300',
  'hover:bg-green-400': 'hover:bg-gray-400',
  'hover:bg-green-500': 'hover:bg-gray-500',
  'hover:bg-green-600': 'hover:bg-gray-600',
  'hover:bg-green-700': 'hover:bg-gray-700',
  'hover:bg-green-800': 'hover:bg-gray-800',
  'hover:bg-green-900': 'hover:bg-gray-900',
  
  'hover:bg-red-50': 'hover:bg-gray-50',
  'hover:bg-red-100': 'hover:bg-gray-100',
  'hover:bg-red-200': 'hover:bg-gray-200',
  'hover:bg-red-300': 'hover:bg-gray-300',
  'hover:bg-red-400': 'hover:bg-gray-400',
  'hover:bg-red-500': 'hover:bg-gray-500',
  'hover:bg-red-600': 'hover:bg-gray-600',
  'hover:bg-red-700': 'hover:bg-gray-700',
  'hover:bg-red-800': 'hover:bg-gray-800',
  'hover:bg-red-900': 'hover:bg-gray-900',
  
  // Text hover colors
  'hover:text-blue-50': 'hover:text-gray-50',
  'hover:text-blue-100': 'hover:text-gray-100',
  'hover:text-blue-200': 'hover:text-gray-200',
  'hover:text-blue-300': 'hover:text-gray-300',
  'hover:text-blue-400': 'hover:text-gray-400',
  'hover:text-blue-500': 'hover:text-gray-500',
  'hover:text-blue-600': 'hover:text-gray-600',
  'hover:text-blue-700': 'hover:text-gray-700',
  'hover:text-blue-800': 'hover:text-gray-800',
  'hover:text-blue-900': 'hover:text-gray-900',
  
  'hover:text-green-50': 'hover:text-gray-50',
  'hover:text-green-100': 'hover:text-gray-100',
  'hover:text-green-200': 'hover:text-gray-200',
  'hover:text-green-300': 'hover:text-gray-300',
  'hover:text-green-400': 'hover:text-gray-400',
  'hover:text-green-500': 'hover:text-gray-500',
  'hover:text-green-600': 'hover:text-gray-600',
  'hover:text-green-700': 'hover:text-gray-700',
  'hover:text-green-800': 'hover:text-gray-800',
  'hover:text-green-900': 'hover:text-gray-900',
  
  'hover:text-red-50': 'hover:text-gray-50',
  'hover:text-red-100': 'hover:text-gray-100',
  'hover:text-red-200': 'hover:text-gray-200',
  'hover:text-red-300': 'hover:text-gray-300',
  'hover:text-red-400': 'hover:text-gray-400',
  'hover:text-red-500': 'hover:text-gray-500',
  'hover:text-red-600': 'hover:text-gray-600',
  'hover:text-red-700': 'hover:text-gray-700',
  'hover:text-red-800': 'hover:text-gray-800',
  'hover:text-red-900': 'hover:text-gray-900',
};

// Combine all mappings
const allMappings = { ...bgColorMappings, ...textColorMappings, ...hoverColorMappings };

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply all color mappings
    for (const [oldColor, newColor] of Object.entries(allMappings)) {
      const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      if (content.includes(oldColor)) {
        content = content.replace(regex, newColor);
        modified = true;
      }
    }
    
    // Additional specific replacements for hex colors in charts
    content = content.replace(/#22c55e/g, '#6b7280'); // Green to gray
    content = content.replace(/#ef4444/g, '#374151'); // Red to dark gray
    content = content.replace(/#3b82f6/g, '#6b7280'); // Blue to gray
    content = content.replace(/#f59e0b/g, '#6b7280'); // Orange to gray
    content = content.replace(/#8b5cf6/g, '#6b7280'); // Purple to gray
    content = content.replace(/#eab308/g, '#6b7280'); // Yellow to gray
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let totalUpdated = 0;
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      totalUpdated += processDirectory(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js')) {
      if (processFile(fullPath)) {
        totalUpdated++;
      }
    }
  }
  
  return totalUpdated;
}

// Process components directory
const componentsDir = path.join(process.cwd(), 'components');
if (fs.existsSync(componentsDir)) {
  console.log('Converting all colors to black and white...');
  const updatedFiles = processDirectory(componentsDir);
  console.log(`\nCompleted! Updated ${updatedFiles} files.`);
} else {
  console.error('Components directory not found!');
}
