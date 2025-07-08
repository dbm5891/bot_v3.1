/**
 * Automated Performance Testing Suite
 * Measures and tracks optimization improvements
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PerformanceTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      tests: {},
      summary: {},
      recommendations: []
    };
  }

  // Bundle size analysis
  async testBundleSize() {
    console.log('🔍 Analyzing bundle size...');
    
    try {
      // Build the project and analyze
      console.log('Building project...');
      execSync('npm run build', { stdio: 'pipe' });
      
      // Check if stats.html was generated
      const statsPath = path.join('frontend', 'dist', 'stats.html');
      if (fs.existsSync(statsPath)) {
        console.log('Bundle analyzer report generated');
      }

      // Get dist folder size
      const distPath = path.join('frontend', 'dist');
      const bundleStats = this.analyzeBundleSize(distPath);
      
      this.results.tests.bundleSize = {
        ...bundleStats,
        status: bundleStats.totalSize < 1.5 * 1024 * 1024 ? 'PASS' : 'FAIL', // 1.5MB limit
        target: '1.5MB',
        recommendations: this.getBundleSizeRecommendations(bundleStats)
      };

      console.log(`📦 Total bundle size: ${(bundleStats.totalSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`📄 JS files: ${(bundleStats.jsSize / 1024 / 1024).toFixed(2)}MB`);
      console.log(`🎨 CSS files: ${(bundleStats.cssSize / 1024).toFixed(2)}KB`);

    } catch (error) {
      console.error('Bundle size test failed:', error.message);
      this.results.tests.bundleSize = {
        status: 'ERROR',
        error: error.message
      };
    }
  }

  analyzeBundleSize(distPath) {
    const stats = {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      imageSize: 0,
      fontSize: 0,
      files: []
    };

    if (!fs.existsSync(distPath)) {
      return stats;
    }

    const files = this.getAllFiles(distPath);
    
    files.forEach(file => {
      const stat = fs.statSync(file);
      const ext = path.extname(file).toLowerCase();
      const size = stat.size;
      
      stats.totalSize += size;
      stats.files.push({
        path: path.relative(distPath, file),
        size,
        type: this.getFileType(ext)
      });

      switch (ext) {
        case '.js':
        case '.mjs':
          stats.jsSize += size;
          break;
        case '.css':
          stats.cssSize += size;
          break;
        case '.png':
        case '.jpg':
        case '.jpeg':
        case '.gif':
        case '.svg':
        case '.webp':
          stats.imageSize += size;
          break;
        case '.woff':
        case '.woff2':
        case '.ttf':
        case '.eot':
          stats.fontSize += size;
          break;
      }
    });

    // Sort files by size (largest first)
    stats.files.sort((a, b) => b.size - a.size);

    return stats;
  }

  getAllFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        this.getAllFiles(fullPath, files);
      } else {
        files.push(fullPath);
      }
    });

    return files;
  }

  getFileType(ext) {
    const types = {
      '.js': 'JavaScript',
      '.mjs': 'JavaScript Module',
      '.css': 'Stylesheet',
      '.png': 'Image',
      '.jpg': 'Image',
      '.jpeg': 'Image',
      '.gif': 'Image',
      '.svg': 'Image',
      '.webp': 'Image',
      '.woff': 'Font',
      '.woff2': 'Font',
      '.ttf': 'Font',
      '.eot': 'Font',
      '.html': 'HTML',
      '.json': 'JSON'
    };
    return types[ext] || 'Other';
  }

  getBundleSizeRecommendations(stats) {
    const recommendations = [];
    
    if (stats.jsSize > 1.2 * 1024 * 1024) { // 1.2MB
      recommendations.push('Consider code splitting to reduce JavaScript bundle size');
    }
    
    if (stats.cssSize > 300 * 1024) { // 300KB
      recommendations.push('Optimize CSS by removing unused styles and using CSS purging');
    }
    
    if (stats.imageSize > 2 * 1024 * 1024) { // 2MB
      recommendations.push('Optimize images using WebP format and compression');
    }

    // Check for large individual files
    const largeFiles = stats.files.filter(f => f.size > 500 * 1024); // 500KB
    if (largeFiles.length > 0) {
      recommendations.push(`Large files detected: ${largeFiles.map(f => f.path).join(', ')}`);
    }

    return recommendations;
  }

  // Lighthouse performance testing
  async testLighthousePerformance() {
    console.log('🚨 Running Lighthouse performance test...');
    
    try {
      // Start development server
      console.log('Starting development server...');
      const serverProcess = execSync('npm run dev -- --port 3001 &', { 
        stdio: 'pipe',
        timeout: 10000 
      });

      // Wait for server to start
      await this.waitForServer('http://localhost:3001', 30000);

      // Run Lighthouse
      const lighthouse = require('lighthouse');
      const chromeLauncher = require('chrome-launcher');
      
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance'],
        port: chrome.port
      };

      const runnerResult = await lighthouse('http://localhost:3001', options);
      await chrome.kill();

      const performanceScore = runnerResult.lhr.categories.performance.score * 100;
      const metrics = runnerResult.lhr.audits;

      this.results.tests.lighthouse = {
        score: performanceScore,
        status: performanceScore >= 90 ? 'PASS' : performanceScore >= 70 ? 'WARN' : 'FAIL',
        metrics: {
          firstContentfulPaint: metrics['first-contentful-paint'].displayValue,
          largestContentfulPaint: metrics['largest-contentful-paint'].displayValue,
          firstMeaningfulPaint: metrics['first-meaningful-paint'].displayValue,
          speedIndex: metrics['speed-index'].displayValue,
          timeToInteractive: metrics['interactive'].displayValue,
          totalBlockingTime: metrics['total-blocking-time'].displayValue,
          cumulativeLayoutShift: metrics['cumulative-layout-shift'].displayValue
        },
        recommendations: this.getLighthouseRecommendations(metrics)
      };

      console.log(`🚨 Lighthouse Performance Score: ${performanceScore}/100`);
      
      // Kill server
      execSync('pkill -f "vite.*3001"', { stdio: 'ignore' }).catch(() => {});

    } catch (error) {
      console.error('Lighthouse test failed:', error.message);
      this.results.tests.lighthouse = {
        status: 'ERROR',
        error: error.message
      };
    }
  }

  async waitForServer(url, timeout = 30000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const fetch = require('node-fetch');
        await fetch(url);
        return;
      } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    throw new Error(`Server did not start within ${timeout}ms`);
  }

  getLighthouseRecommendations(metrics) {
    const recommendations = [];
    
    const fcp = parseFloat(metrics['first-contentful-paint'].numericValue);
    if (fcp > 2000) {
      recommendations.push('Improve First Contentful Paint by optimizing critical rendering path');
    }
    
    const lcp = parseFloat(metrics['largest-contentful-paint'].numericValue);
    if (lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint by improving server response times and optimizing images');
    }
    
    const tti = parseFloat(metrics['interactive'].numericValue);
    if (tti > 5000) {
      recommendations.push('Reduce Time to Interactive by optimizing JavaScript execution');
    }
    
    const tbt = parseFloat(metrics['total-blocking-time'].numericValue);
    if (tbt > 300) {
      recommendations.push('Minimize Total Blocking Time by reducing JavaScript execution time');
    }

    return recommendations;
  }

  // Memory usage testing
  async testMemoryUsage() {
    console.log('💾 Testing memory usage...');
    
    try {
      // Analyze TypeScript compilation memory
      const tsCheck = execSync('npx tsc --noEmit --listFiles 2>&1', { 
        cwd: 'frontend',
        encoding: 'utf8' 
      });
      
      const fileCount = tsCheck.split('\n').filter(line => line.trim().endsWith('.ts') || line.trim().endsWith('.tsx')).length;
      
      // Estimate bundle memory impact
      const bundleMemoryEstimate = this.estimateBundleMemoryUsage();
      
      this.results.tests.memoryUsage = {
        status: bundleMemoryEstimate < 100 * 1024 * 1024 ? 'PASS' : 'WARN', // 100MB limit
        typeScriptFiles: fileCount,
        estimatedBundleMemory: bundleMemoryEstimate,
        recommendations: this.getMemoryRecommendations(bundleMemoryEstimate, fileCount)
      };

      console.log(`💾 TypeScript files: ${fileCount}`);
      console.log(`💾 Estimated memory usage: ${(bundleMemoryEstimate / 1024 / 1024).toFixed(2)}MB`);

    } catch (error) {
      console.error('Memory usage test failed:', error.message);
      this.results.tests.memoryUsage = {
        status: 'ERROR',
        error: error.message
      };
    }
  }

  estimateBundleMemoryUsage() {
    // Rough estimation based on file sizes and types
    const frontendPath = path.join('frontend', 'src');
    if (!fs.existsSync(frontendPath)) return 0;
    
    const files = this.getAllFiles(frontendPath);
    let totalEstimate = 0;
    
    files.forEach(file => {
      const stat = fs.statSync(file);
      const ext = path.extname(file);
      
      // Different multipliers for different file types
      let multiplier = 1;
      if (ext === '.tsx' || ext === '.ts') {
        multiplier = 3; // TypeScript/React files typically expand
      } else if (ext === '.js' || ext === '.jsx') {
        multiplier = 2;
      }
      
      totalEstimate += stat.size * multiplier;
    });
    
    return totalEstimate;
  }

  getMemoryRecommendations(memoryUsage, fileCount) {
    const recommendations = [];
    
    if (memoryUsage > 80 * 1024 * 1024) { // 80MB
      recommendations.push('Consider lazy loading and code splitting to reduce memory usage');
    }
    
    if (fileCount > 200) {
      recommendations.push('Large number of TypeScript files detected, consider modularization');
    }
    
    return recommendations;
  }

  // Network performance testing
  async testNetworkPerformance() {
    console.log('🌐 Testing network performance...');
    
    try {
      // Test API endpoint response times
      const apiTests = [
        { name: 'Health Check', url: 'http://localhost:8000/' },
        { name: 'Strategies', url: 'http://localhost:8000/api/strategies' },
        { name: 'Symbols', url: 'http://localhost:8000/api/symbols' }
      ];
      
      const networkResults = [];
      
      for (const test of apiTests) {
        try {
          const start = Date.now();
          const fetch = require('node-fetch');
          const response = await fetch(test.url);
          const duration = Date.now() - start;
          
          networkResults.push({
            name: test.name,
            status: response.ok ? 'PASS' : 'FAIL',
            responseTime: duration,
            statusCode: response.status
          });
          
          console.log(`🌐 ${test.name}: ${duration}ms`);
        } catch (error) {
          networkResults.push({
            name: test.name,
            status: 'ERROR',
            error: error.message
          });
        }
      }
      
      const avgResponseTime = networkResults
        .filter(r => r.responseTime)
        .reduce((sum, r) => sum + r.responseTime, 0) / networkResults.length;
      
      this.results.tests.networkPerformance = {
        status: avgResponseTime < 500 ? 'PASS' : 'WARN', // 500ms average limit
        averageResponseTime: avgResponseTime,
        tests: networkResults,
        recommendations: this.getNetworkRecommendations(avgResponseTime, networkResults)
      };

    } catch (error) {
      console.error('Network performance test failed:', error.message);
      this.results.tests.networkPerformance = {
        status: 'ERROR',
        error: error.message
      };
    }
  }

  getNetworkRecommendations(avgTime, results) {
    const recommendations = [];
    
    if (avgTime > 1000) {
      recommendations.push('API response times are slow, consider caching and optimization');
    }
    
    const failedTests = results.filter(r => r.status === 'ERROR' || r.status === 'FAIL');
    if (failedTests.length > 0) {
      recommendations.push(`Failed network tests: ${failedTests.map(t => t.name).join(', ')}`);
    }
    
    return recommendations;
  }

  // Generate comprehensive report
  generateReport() {
    const totalTests = Object.keys(this.results.tests).length;
    const passedTests = Object.values(this.results.tests).filter(t => t.status === 'PASS').length;
    const failedTests = Object.values(this.results.tests).filter(t => t.status === 'FAIL').length;
    const errorTests = Object.values(this.results.tests).filter(t => t.status === 'ERROR').length;
    
    this.results.summary = {
      totalTests,
      passedTests,
      failedTests,
      errorTests,
      successRate: (passedTests / totalTests) * 100
    };

    // Collect all recommendations
    this.results.recommendations = Object.values(this.results.tests)
      .flatMap(test => test.recommendations || [])
      .filter((rec, index, self) => self.indexOf(rec) === index); // Remove duplicates

    return this.results;
  }

  // Save report to file
  saveReport() {
    const reportPath = path.join('performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Also create a markdown report
    const markdownReport = this.generateMarkdownReport();
    fs.writeFileSync('PERFORMANCE_REPORT.md', markdownReport);
    
    console.log(`📊 Performance report saved to ${reportPath}`);
    console.log(`📝 Markdown report saved to PERFORMANCE_REPORT.md`);
  }

  generateMarkdownReport() {
    const { summary, tests, recommendations } = this.results;
    
    let markdown = `# Performance Test Report\n\n`;
    markdown += `**Generated:** ${this.results.timestamp}\n\n`;
    
    // Summary
    markdown += `## Summary\n\n`;
    markdown += `- **Total Tests:** ${summary.totalTests}\n`;
    markdown += `- **Passed:** ${summary.passedTests} ✅\n`;
    markdown += `- **Failed:** ${summary.failedTests} ❌\n`;
    markdown += `- **Errors:** ${summary.errorTests} 🚫\n`;
    markdown += `- **Success Rate:** ${summary.successRate.toFixed(1)}%\n\n`;

    // Individual test results
    markdown += `## Test Results\n\n`;
    
    Object.entries(tests).forEach(([testName, result]) => {
      const statusIcon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '🚫';
      markdown += `### ${testName} ${statusIcon}\n\n`;
      
      if (result.error) {
        markdown += `**Error:** ${result.error}\n\n`;
      } else {
        // Add specific metrics based on test type
        if (testName === 'bundleSize' && result.totalSize) {
          markdown += `- **Total Size:** ${(result.totalSize / 1024 / 1024).toFixed(2)}MB\n`;
          markdown += `- **JavaScript:** ${(result.jsSize / 1024 / 1024).toFixed(2)}MB\n`;
          markdown += `- **CSS:** ${(result.cssSize / 1024).toFixed(2)}KB\n`;
        } else if (testName === 'lighthouse' && result.metrics) {
          markdown += `- **Performance Score:** ${result.score}/100\n`;
          markdown += `- **First Contentful Paint:** ${result.metrics.firstContentfulPaint}\n`;
          markdown += `- **Largest Contentful Paint:** ${result.metrics.largestContentfulPaint}\n`;
        } else if (testName === 'networkPerformance' && result.averageResponseTime) {
          markdown += `- **Average Response Time:** ${result.averageResponseTime.toFixed(2)}ms\n`;
        } else if (testName === 'memoryUsage' && result.estimatedBundleMemory) {
          markdown += `- **Estimated Memory Usage:** ${(result.estimatedBundleMemory / 1024 / 1024).toFixed(2)}MB\n`;
          markdown += `- **TypeScript Files:** ${result.typeScriptFiles}\n`;
        }
      }
      
      if (result.recommendations && result.recommendations.length > 0) {
        markdown += `\n**Recommendations:**\n`;
        result.recommendations.forEach(rec => {
          markdown += `- ${rec}\n`;
        });
      }
      
      markdown += `\n`;
    });

    // Overall recommendations
    if (recommendations.length > 0) {
      markdown += `## Overall Recommendations\n\n`;
      recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
    }

    return markdown;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting comprehensive performance testing...\n');
    
    await this.testBundleSize();
    console.log('');
    
    await this.testMemoryUsage();
    console.log('');
    
    await this.testNetworkPerformance();
    console.log('');
    
    // Skip Lighthouse if dependencies not available
    try {
      require('lighthouse');
      await this.testLighthousePerformance();
    } catch (error) {
      console.log('⚠️  Lighthouse not available, skipping performance audit');
      this.results.tests.lighthouse = {
        status: 'SKIP',
        message: 'Lighthouse dependencies not installed'
      };
    }
    
    console.log('\n📊 Generating report...');
    const report = this.generateReport();
    this.saveReport();
    
    console.log(`\n✨ Testing complete! Success rate: ${report.summary.successRate.toFixed(1)}%`);
    
    return report;
  }
}

// CLI execution
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runAllTests().catch(console.error);
}

module.exports = PerformanceTester;