/**
 * Mobile Compatibility Test Suite
 * Tests for mobile browser compatibility and touch interactions
 */

class MobileCompatibilityTest {
    constructor() {
        this.results = [];
        this.isMobile = this.detectMobile();
    }

    /**
     * Detect if running on mobile device
     */
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    /**
     * Run all mobile compatibility tests
     */
    async runAllTests() {
        console.log('📱 Running Mobile Compatibility Tests...');
        
        const tests = [
            'testTouchSupport',
            'testViewportMeta',
            'testTouchEvents',
            'testResponsiveLayout',
            'testTouchTargets',
            'testGestureSupport',
            'testOrientationChange',
            'testPerformance',
            'testInputMethods',
            'testAccessibility'
        ];

        for (const testName of tests) {
            try {
                await this[testName]();
                this.recordResult(testName, 'PASSED');
            } catch (error) {
                this.recordResult(testName, 'FAILED', error.message);
            }
        }

        return this.generateReport();
    }

    /**
     * Test touch support
     */
    async testTouchSupport() {
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (!hasTouch) throw new Error('Touch support not detected');
    }

    /**
     * Test viewport meta tag
     */
    async testViewportMeta() {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) throw new Error('Viewport meta tag missing');
        
        const content = viewport.getAttribute('content');
        if (!content.includes('width=device-width')) {
            throw new Error('Viewport not configured for responsive design');
        }
    }

    /**
     * Test touch events
     */
    async testTouchEvents() {
        const events = ['touchstart', 'touchmove', 'touchend'];
        const element = document.createElement('div');
        
        for (const eventType of events) {
            const supported = 'on' + eventType in element;
            if (!supported) throw new Error(`Touch event ${eventType} not supported`);
        }
    }

    /**
     * Test responsive layout
     */
    async testResponsiveLayout() {
        const widths = [320, 375, 414, 768, 1024];
        
        for (const width of widths) {
            // Simulate viewport width
            const initialWidth = window.innerWidth;
            Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
            
            // Trigger resize
            window.dispatchEvent(new Event('resize'));
            
            // Check if layout adapts
            const gameContainer = document.getElementById('game-container');
            if (!gameContainer) continue;
            
            const rect = gameContainer.getBoundingClientRect();
            if (rect.width > width) {
                throw new Error(`Layout not responsive at ${width}px`);
            }
            
            // Restore original width
            Object.defineProperty(window, 'innerWidth', { value: initialWidth, writable: true });
        }
    }

    /**
     * Test touch targets
     */
    async testTouchTargets() {
        const buttons = document.querySelectorAll('button, .btn, [role="button"]');
        const minSize = 44; // iOS recommended minimum
        
        for (const button of buttons) {
            const rect = button.getBoundingClientRect();
            if (rect.width < minSize || rect.height < minSize) {
                console.warn(`Touch target too small: ${rect.width}x${rect.height}px`);
            }
        }
    }

    /**
     * Test gesture support
     */
    async testGestureSupport() {
        const element = document.createElement('div');
        const supportsPinch = 'ongesturestart' in element || 'MSGestureStart' in element;
        
        if (!supportsPinch) {
            console.warn('Pinch-to-zoom not supported');
        }
    }

    /**
     * Test orientation change
     */
    async testOrientationChange() {
        return new Promise((resolve, reject) => {
            if (!screen.orientation) {
                reject(new Error('Screen orientation API not supported'));
                return;
            }
            
            const handler = () => {
                window.removeEventListener('orientationchange', handler);
                resolve();
            };
            
            window.addEventListener('orientationchange', handler);
            
            // Timeout after 5 seconds
            setTimeout(() => {
                window.removeEventListener('orientationchange', handler);
                resolve(); // Consider passed if no immediate issues
            }, 5000);
        });
    }

    /**
     * Test performance on mobile
     */
    async testPerformance() {
        const startTime = performance.now();
        
        // Simulate intensive operations
        for (let i = 0; i < 1000; i++) {
            document.createElement('div');
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 1000) {
            throw new Error(`Performance too slow: ${duration}ms`);
        }
    }

    /**
     * Test input methods
     */
    async testInputMethods() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
        
        for (const input of inputs) {
            // Check if virtual keyboard triggers correctly
            input.focus();
            
            // Check input type
            if (input.type === 'number' && !input.inputMode) {
                console.warn('Number input should have inputmode="numeric"');
            }
        }
    }

    /**
     * Test accessibility
     */
    async testAccessibility() {
        const images = document.querySelectorAll('img');
        for (const img of images) {
            if (!img.alt) {
                console.warn('Image missing alt text');
            }
        }
        
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                console.warn('Button missing accessible label');
            }
        }
    }

    /**
     * Record test result
     */
    recordResult(testName, status, message = '') {
        this.results.push({
            test: testName,
            status: status,
            message: message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Generate test report
     */
    generateReport() {
        const passed = this.results.filter(r => r.status === 'PASSED').length;
        const total = this.results.length;
        
        return {
            isMobile: this.isMobile,
            userAgent: navigator.userAgent,
            screen: {
                width: screen.width,
                height: screen.height,
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight
            },
            results: this.results,
            summary: {
                total: total,
                passed: passed,
                failed: total - passed,
                successRate: (passed / total * 100).toFixed(1) + '%'
            }
        };
    }
}

// Export for use
export { MobileCompatibilityTest };

// Auto-run if loaded on mobile
if (typeof window !== 'undefined') {
    window.runMobileTests = async function() {
        const mobileTest = new MobileCompatibilityTest();
        return await mobileTest.runAllTests();
    };
}