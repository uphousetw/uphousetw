#!/usr/bin/env node

/**
 * Test Runner for Complete API QA Suite
 * Runs all tests in sequence and provides comprehensive reporting
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class TestRunner {
  constructor() {
    this.results = {
      comprehensive: null,
      frontend: null,
      backend: null,
      startTime: new Date(),
      endTime: null
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Complete API QA Test Suite...\n');

    try {
      // Run comprehensive API tests
      console.log('📋 Running Comprehensive API Tests...');
      this.results.comprehensive = await this.runComprehensiveTests();

      // Run frontend integration tests (if Jest is available)
      if (this.isJestAvailable()) {
        console.log('\n🎨 Running Frontend Integration Tests...');
        this.results.frontend = await this.runFrontendTests();

        console.log('\n⚙️  Running Backend Unit Tests...');
        this.results.backend = await this.runBackendTests();
      } else {
        console.log('\n⚠️  Jest not found - skipping Jest-based tests');
        console.log('   Install Jest to run frontend/backend tests: npm install --save-dev jest');
      }

      this.results.endTime = new Date();
      this.generateReport();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  async runComprehensiveTests() {
    return new Promise((resolve, reject) => {
      const testFile = path.join(__dirname, 'api-qa-suite.js');

      if (!fs.existsSync(testFile)) {
        console.log('⚠️  Comprehensive test file not found, skipping...');
        resolve({ status: 'skipped', reason: 'File not found' });
        return;
      }

      const child = spawn('node', [testFile], {
        stdio: 'pipe',
        env: {
          ...process.env,
          API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001/api',
          TEST_ADMIN_EMAIL: process.env.TEST_ADMIN_EMAIL || 'admin@example.com'
        }
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write(text);
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        process.stderr.write(text);
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({
            status: 'passed',
            output,
            exitCode: code
          });
        } else {
          resolve({
            status: 'failed',
            output,
            errorOutput,
            exitCode: code
          });
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async runFrontendTests() {
    return this.runJestTests('frontend-integration.test.js');
  }

  async runBackendTests() {
    return this.runJestTests('backend-unit.test.js');
  }

  async runJestTests(testFile) {
    return new Promise((resolve) => {
      const testPath = path.join(__dirname, testFile);

      if (!fs.existsSync(testPath)) {
        console.log(`⚠️  ${testFile} not found, skipping...`);
        resolve({ status: 'skipped', reason: 'File not found' });
        return;
      }

      const child = spawn('npx', ['jest', testPath, '--verbose'], {
        stdio: 'pipe',
        cwd: path.dirname(__dirname) // Run from project root
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write(text);
      });

      child.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        // Jest often outputs to stderr even for normal output
        process.stdout.write(text);
      });

      child.on('close', (code) => {
        resolve({
          status: code === 0 ? 'passed' : 'failed',
          output,
          errorOutput,
          exitCode: code
        });
      });

      child.on('error', (error) => {
        resolve({
          status: 'error',
          error: error.message,
          output,
          errorOutput
        });
      });
    });
  }

  isJestAvailable() {
    try {
      require.resolve('jest');
      return true;
    } catch (e) {
      return false;
    }
  }

  generateReport() {
    const duration = this.results.endTime - this.results.startTime;

    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPLETE TEST SUITE REPORT');
    console.log('='.repeat(60));

    console.log(`⏱️  Total Duration: ${Math.round(duration / 1000)}s`);
    console.log(`🕐 Started: ${this.results.startTime.toLocaleTimeString()}`);
    console.log(`🕑 Finished: ${this.results.endTime.toLocaleTimeString()}\n`);

    // Comprehensive API Tests
    this.reportTestResult('Comprehensive API Tests', this.results.comprehensive);

    // Frontend Integration Tests
    this.reportTestResult('Frontend Integration Tests', this.results.frontend);

    // Backend Unit Tests
    this.reportTestResult('Backend Unit Tests', this.results.backend);

    // Overall Summary
    const allResults = [
      this.results.comprehensive,
      this.results.frontend,
      this.results.backend
    ].filter(Boolean);

    const passed = allResults.filter(r => r.status === 'passed').length;
    const failed = allResults.filter(r => r.status === 'failed').length;
    const skipped = allResults.filter(r => r.status === 'skipped').length;
    const total = allResults.length;

    console.log('\n' + '='.repeat(30));
    console.log('🎯 OVERALL SUMMARY');
    console.log('='.repeat(30));
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${failed}/${total}`);
    console.log(`⏭️  Skipped: ${skipped}/${total}`);

    if (failed === 0) {
      console.log('\n🎉 All tests completed successfully!');
      console.log('✨ Your condensed API is working perfectly!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the output above.');
    }

    // Save detailed report
    this.saveDetailedReport();
  }

  reportTestResult(testName, result) {
    if (!result) {
      console.log(`⏭️  ${testName}: Not run`);
      return;
    }

    switch (result.status) {
      case 'passed':
        console.log(`✅ ${testName}: PASSED`);
        break;
      case 'failed':
        console.log(`❌ ${testName}: FAILED (exit code: ${result.exitCode})`);
        break;
      case 'skipped':
        console.log(`⏭️  ${testName}: SKIPPED (${result.reason})`);
        break;
      case 'error':
        console.log(`💥 ${testName}: ERROR (${result.error})`);
        break;
      default:
        console.log(`❓ ${testName}: UNKNOWN`);
    }
  }

  saveDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: this.results.endTime - this.results.startTime,
      results: this.results,
      summary: {
        total: 3,
        passed: Object.values(this.results).filter(r => r && r.status === 'passed').length,
        failed: Object.values(this.results).filter(r => r && r.status === 'failed').length,
        skipped: Object.values(this.results).filter(r => r && r.status === 'skipped').length
      }
    };

    const reportPath = path.join(__dirname, `test-report-${Date.now()}.json`);

    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📄 Detailed report saved: ${reportPath}`);
    } catch (error) {
      console.log(`\n⚠️  Could not save report: ${error.message}`);
    }
  }
}

// Environment setup helper
function setupTestEnvironment() {
  console.log('🔧 Setting up test environment...\n');

  // Check for required environment variables
  const requiredEnvVars = {
    'API_BASE_URL': process.env.API_BASE_URL || 'http://localhost:3001/api',
    'TEST_ADMIN_EMAIL': process.env.TEST_ADMIN_EMAIL || 'admin@example.com'
  };

  console.log('Environment Configuration:');
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
  console.log('');

  // Set environment variables if not already set
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

// Usage instructions
function printUsageInstructions() {
  console.log('📚 QA Test Suite Usage Instructions\n');
  console.log('1. Start your development server:');
  console.log('   npm run dev:api\n');
  console.log('2. Run the complete test suite:');
  console.log('   node tests/run-tests.js\n');
  console.log('3. Run individual test suites:');
  console.log('   node tests/api-qa-suite.js          # Comprehensive API tests');
  console.log('   npx jest frontend-integration.test.js  # Frontend tests');
  console.log('   npx jest backend-unit.test.js          # Backend tests\n');
  console.log('4. Environment variables (optional):');
  console.log('   export API_BASE_URL=http://localhost:3001/api');
  console.log('   export TEST_ADMIN_EMAIL=admin@example.com');
  console.log('   export TEST_AUTH_TOKEN=your-jwt-token\n');
}

// Command line argument handling
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  printUsageInstructions();
  process.exit(0);
}

if (process.argv.includes('--setup-only')) {
  setupTestEnvironment();
  console.log('✅ Environment setup complete');
  process.exit(0);
}

// Main execution
async function main() {
  setupTestEnvironment();

  const runner = new TestRunner();
  await runner.runAllTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;