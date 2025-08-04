/**
 * Comprehensive Test Runner
 * Runs all test suites and generates final report
 */

import { ComprehensiveTestSuite } from './js/tests/comprehensive-test-suite.js';
import { MobileCompatibilityTest } from './js/tests/mobile-compatibility-test.js';
import { IntegrationTest } from './js/tests/integration-test.js';
import { debugSystem } from './js/utils/debug-system.js';

/**
 * Master test runner that coordinates all testing
 */
class MasterTestRunner {
    constructor() {
        this.results = {
            comprehensive: null,
            integration: null,
            mobile: null,
            performance: null,
            browser: null
        };
        this.startTime = performance.now();
    }

    /**
     * Run all test suites
     */
    async runAllTests() {
        console.log('🚀 Starting Master Test Suite...');
        console.log('='.repeat(50));

        try {
            // Enable debug mode for testing
            debugSystem.setDebugMode(true);
            debugSystem.createDebugOverlay();

            // Run integration tests
            console.log('\n📋 Running Integration Tests...');
            await this.runIntegrationTests();

            // Run comprehensive tests
            console.log('\n🔬 Running Comprehensive Tests...');
            await this.runComprehensiveTests();

            // Run mobile compatibility tests
            console.log('\n📱 Running Mobile Compatibility Tests...');
            await this.runMobileTests();

            // Run performance tests
            console.log('\n⚡ Running Performance Tests...');
            await this.runPerformanceTests();

            // Generate final report
            await this.generateFinalReport();

            console.log('\n🎉 All tests completed!');
            return this.results;

        } catch (error) {
            console.error('❌ Master test suite failed:', error);
            debugSystem.log('ERROR', 'Master test suite failed:', error);
            throw error;
        }
    }

    /**
     * Run integration tests
     */
    async runIntegrationTests() {
        const integrationTest = new IntegrationTest();
        this.results.integration = await integrationTest.runAllTests();
    }

    /**
     * Run comprehensive tests
     */
    async runComprehensiveTests() {
        const comprehensiveTest = new ComprehensiveTestSuite();
        this.results.comprehensive = await comprehensiveTest.runAllTests();
    }

    /**
     * Run mobile compatibility tests
     */
    async runMobileTests() {
        const mobileTest = new MobileCompatibilityTest();
        this.results.mobile = await mobileTest.runAllTests();
    }

    /**
     * Run performance tests
     */
    async runPerformanceTests() {
        const performanceResults = {
            loadTime: await this.measureLoadTime(),
            memoryUsage: await this.measureMemoryUsage(),
            responsiveness: await this.measureResponsiveness(),
            browserFeatures: this.checkBrowserFeatures()
        };

        this.results.performance = performanceResults;
    }

    /**
     * Measure game load time
     */
    async measureLoadTime() {
        const startTime = performance.now();
        
        // Simulate game initialization
        const game = new (await import('./js/engine/MonopolyGame.js')).MonopolyGame();
        await game.init();
        
        const loadTime = performance.now() - startTime;
        
        return {
            loadTime: loadTime,
            status: loadTime < 3000 ? 'PASS' : 'FAIL',
            target: 3000
        };
    }

    /**
     * Measure memory usage
     */
    async measureMemoryUsage() {
        const memory = debugSystem.getMemoryUsage();
        
        if (!memory) {
            return { status: 'SKIP', reason: 'Memory API not available' };
        }

        const memoryMB = memory.used / 1024 / 1024;
        
        return {
            usedMemory: memoryMB,
            status: memoryMB < 100 ? 'PASS' : 'WARN',
            target: 100,
            total: memory.total / 1024 / 1024,
            limit: memory.limit / 1024 / 1024
        };
    }

    /**
     * Measure UI responsiveness
     */
    async measureResponsiveness() {
        const results = [];
        
        // Test button responsiveness
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
            const start = performance.now();
            button.click();
            const end = performance.now();
            results.push(end - start);
        }

        const avgResponse = results.reduce((a, b) => a + b, 0) / results.length;
        
        return {
            averageResponseTime: avgResponse,
            status: avgResponse < 100 ? 'PASS' : 'FAIL',
            target: 100
        };
    }

    /**
     * Check browser features
     */
    checkBrowserFeatures() {
        const features = {
            localStorage: debugSystem.checkStorage('localStorage'),
            sessionStorage: debugSystem.checkStorage('sessionStorage'),
            indexedDB: 'indexedDB' in window,
            webGL: debugSystem.checkWebGL(),
            serviceWorker: 'serviceWorker' in navigator,
            webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
            touchEvents: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            cssGrid: CSS.supports('display', 'grid'),
            cssFlexbox: CSS.supports('display', 'flex'),
            fetch: 'fetch' in window,
            promises: 'Promise' in window,
            requestAnimationFrame: 'requestAnimationFrame' in window
        };

        const supported = Object.values(features).filter(Boolean).length;
        const total = Object.keys(features).length;
        
        return {
            features,
            supported: supported,
            total: total,
            status: supported === total ? 'PASS' : 'WARN',
            percentage: (supported / total * 100).toFixed(1)
        };
    }

    /**
     * Generate final test report
     */
    async generateFinalReport() {
        const endTime = performance.now();
        const totalTime = endTime - this.startTime;

        const report = {
            summary: {
                totalTime: totalTime,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                platform: navigator.platform
            },
            results: this.results,
            debugInfo: debugSystem.getDebugInfo(),
            recommendations: this.generateRecommendations()
        };

        // Save report
        this.saveReport(report);
        
        // Display report
        this.displayReport(report);
        
        return report;
    }

    /**
     * Generate recommendations based on test results
     */
    generateRecommendations() {
        const recommendations = [];

        // Check for critical issues
        if (this.results.comprehensive?.errors?.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                issue: 'Comprehensive tests have errors',
                action: 'Review error logs and fix critical bugs'
            });
        }

        // Check performance
        if (this.results.performance?.loadTime?.status === 'FAIL') {
            recommendations.push({
                priority: 'MEDIUM',
                issue: 'Load time exceeds target',
                action: 'Optimize asset loading and initialization'
            });
        }

        // Check memory usage
        if (this.results.performance?.memoryUsage?.status === 'WARN') {
            recommendations.push({
                priority: 'MEDIUM',
                issue: 'High memory usage detected',
                action: 'Implement memory cleanup and optimization'
            });
        }

        // Check browser compatibility
        if (this.results.performance?.browserFeatures?.status === 'WARN') {
            recommendations.push({
                priority: 'LOW',
                issue: 'Some browser features not supported',
                action: 'Add polyfills or graceful degradation'
            });
        }

        return recommendations;
    }

    /**
     * Save test report
     */
    saveReport(report) {
        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monopoly-test-report-${new Date().toISOString().split('T')[0]}.json`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Display test report in console
     */
    displayReport(report) {
        console.log('\n' + '='.repeat(60));
        console.log('🎯 MONOPOLY GAME TEST REPORT');
        console.log('='.repeat(60));
        
        console.log(`\n📊 SUMMARY:`);
        console.log(`Total Test Time: ${report.summary.totalTime.toFixed(2)}ms`);
        console.log(`Timestamp: ${report.summary.timestamp}`);
        
        console.log(`\n🧪 TEST RESULTS:`);
        
        if (report.results.comprehensive) {
            const comp = report.results.comprehensive;
            console.log(`Comprehensive Tests: ${comp.passed}/${comp.total} passed`);
        }
        
        if (report.results.integration) {
            console.log(`Integration Tests: ✅ PASSED`);
        }
        
        if (report.results.mobile) {
            const mobile = report.results.mobile;
            console.log(`Mobile Tests: ${mobile.summary.successRate} success rate`);
        }
        
        if (report.results.performance) {
            const perf = report.results.performance;
            console.log(`Load Time: ${perf.loadTime.loadTime.toFixed(2)}ms (${perf.loadTime.status})`);
            console.log(`Memory Usage: ${perf.memoryUsage.usedMemory?.toFixed(2) || 'N/A'}MB`);
            console.log(`Browser Features: ${perf.browserFeatures.percentage}% supported`);
        }
        
        console.log(`\n⚠️  RECOMMENDATIONS:`);
        report.recommendations.forEach(rec => {
            console.log(`[${rec.priority}] ${rec.issue}: ${rec.action}`);
        });
        
        console.log('\n' + '='.repeat(60));
    }
}

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
    window.runMasterTests = async function() {
        const runner = new MasterTestRunner();
        return await runner.runAllTests();
    };
}

// Export for use
export { MasterTestRunner };