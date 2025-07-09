#!/usr/bin/env node

/**
 * Build Optimization Script
 * Runs additional optimizations after the main build process
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  distDir: path.resolve(__dirname, '../dist'),
  thresholds: {
    bundleSize: 500 * 1024, // 500KB
    chunkSize: 200 * 1024,  // 200KB
    assetSize: 100 * 1024,  // 100KB
  },
  performance: {
    budgets: {
      'js': 1500 * 1024,     // 1.5MB total JS
      'css': 300 * 1024,     // 300KB total CSS
      'images': 2000 * 1024, // 2MB total images
      'fonts': 500 * 1024,   // 500KB total fonts
    }
  }
};

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Get file size in bytes
function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    return 0;
  }
}

// Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Analyze bundle sizes
function analyzeBundles() {
  logInfo('Analyzing bundle sizes...');
  
  if (!fs.existsSync(config.distDir)) {
    logError('Build directory not found. Please run build first.');
    process.exit(1);
  }

  const results = {
    js: { files: [], totalSize: 0 },
    css: { files: [], totalSize: 0 },
    images: { files: [], totalSize: 0 },
    fonts: { files: [], totalSize: 0 },
    other: { files: [], totalSize: 0 }
  };

  function analyzeDirectory(dir, basePath = '') {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(basePath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        analyzeDirectory(fullPath, relativePath);
      } else {
        const size = stat.size;
        const ext = path.extname(item).toLowerCase();
        
        const fileInfo = {
          path: relativePath,
          size: size,
          formatted: formatBytes(size)
        };

        if (ext === '.js' || ext === '.mjs') {
          results.js.files.push(fileInfo);
          results.js.totalSize += size;
        } else if (ext === '.css') {
          results.css.files.push(fileInfo);
          results.css.totalSize += size;
        } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'].includes(ext)) {
          results.images.files.push(fileInfo);
          results.images.totalSize += size;
        } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
          results.fonts.files.push(fileInfo);
          results.fonts.totalSize += size;
        } else {
          results.other.files.push(fileInfo);
          results.other.totalSize += size;
        }
      }
    });
  }

  analyzeDirectory(config.distDir);
  return results;
}

// Check performance budgets
function checkPerformanceBudgets(results) {
  logInfo('Checking performance budgets...');
  
  let hasViolations = false;

  Object.entries(config.performance.budgets).forEach(([type, budget]) => {
    const actual = results[type]?.totalSize || 0;
    const percentage = (actual / budget) * 100;
    
    if (actual > budget) {
      logError(`${type.toUpperCase()} budget exceeded: ${formatBytes(actual)} / ${formatBytes(budget)} (${percentage.toFixed(1)}%)`);
      hasViolations = true;
    } else if (percentage > 80) {
      logWarning(`${type.toUpperCase()} approaching budget limit: ${formatBytes(actual)} / ${formatBytes(budget)} (${percentage.toFixed(1)}%)`);
    } else {
      logSuccess(`${type.toUpperCase()} within budget: ${formatBytes(actual)} / ${formatBytes(budget)} (${percentage.toFixed(1)}%)`);
    }
  });

  return !hasViolations;
}

// Generate bundle report
function generateBundleReport(results) {
  logInfo('Generating bundle report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalSize: Object.values(results).reduce((sum, category) => sum + category.totalSize, 0),
      categories: Object.entries(results).map(([type, data]) => ({
        type,
        fileCount: data.files.length,
        totalSize: data.totalSize,
        formattedSize: formatBytes(data.totalSize),
        largestFile: data.files.length > 0 ? 
          data.files.reduce((largest, file) => file.size > largest.size ? file : largest) : 
          null
      }))
    },
    details: results,
    budgets: config.performance.budgets,
    recommendations: generateRecommendations(results)
  };

  // Save report
  const reportPath = path.join(config.distDir, 'bundle-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  logSuccess(`Bundle report saved to: ${reportPath}`);
  return report;
}

// Generate optimization recommendations
function generateRecommendations(results) {
  const recommendations = [];

  // Check for large JavaScript files
  const largeJSFiles = results.js.files.filter(file => file.size > config.thresholds.chunkSize);
  if (largeJSFiles.length > 0) {
    recommendations.push({
      type: 'javascript',
      priority: 'high',
      message: `Consider code splitting for large JS files: ${largeJSFiles.map(f => f.path).join(', ')}`,
      files: largeJSFiles
    });
  }

  // Check for unoptimized images
  const largeImages = results.images.files.filter(file => file.size > config.thresholds.assetSize);
  if (largeImages.length > 0) {
    recommendations.push({
      type: 'images',
      priority: 'medium',
      message: `Consider optimizing large images: ${largeImages.map(f => f.path).join(', ')}`,
      files: largeImages
    });
  }

  // Check total JS size
  if (results.js.totalSize > config.performance.budgets.js * 0.8) {
    recommendations.push({
      type: 'javascript',
      priority: 'high',
      message: 'Total JavaScript size is approaching the budget limit. Consider lazy loading or removing unused dependencies.',
      totalSize: results.js.totalSize
    });
  }

  return recommendations;
}

// Display summary
function displaySummary(report) {
  log('\n' + '='.repeat(60), 'bold');
  log('BUILD OPTIMIZATION SUMMARY', 'bold');
  log('='.repeat(60), 'bold');
  
  log('\nBundle Sizes:', 'bold');
  report.summary.categories.forEach(category => {
    const icon = category.totalSize > (config.performance.budgets[category.type] || Infinity) ? '❌' : '✅';
    log(`${icon} ${category.type.toUpperCase()}: ${category.formattedSize} (${category.fileCount} files)`);
  });
  
  log(`\nTotal Build Size: ${formatBytes(report.summary.totalSize)}`, 'bold');
  
  if (report.recommendations.length > 0) {
    log('\nRecommendations:', 'yellow');
    report.recommendations.forEach((rec, index) => {
      const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
      log(`${priority} ${rec.message}`);
    });
  } else {
    logSuccess('\nNo optimization recommendations. Great job! 🎉');
  }
  
  log('\n' + '='.repeat(60), 'bold');
}

// Main optimization function
async function optimizeBuild() {
  try {
    log('🚀 Starting build optimization...', 'bold');
    
    // Analyze bundles
    const results = analyzeBundles();
    
    // Check performance budgets
    const budgetsPassed = checkPerformanceBudgets(results);
    
    // Generate report
    const report = generateBundleReport(results);
    
    // Display summary
    displaySummary(report);
    
    // Check if optimization should fail the build
    if (!budgetsPassed && process.env.CI === 'true') {
      logError('Build failed due to performance budget violations.');
      process.exit(1);
    }
    
    logSuccess('Build optimization completed!');
    
  } catch (error) {
    logError(`Optimization failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  optimizeBuild();
}

module.exports = { optimizeBuild, analyzeBundles, checkPerformanceBudgets };