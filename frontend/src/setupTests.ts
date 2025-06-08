import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ResizeObserver for Chart.js in JSDOM environment
global.ResizeObserver = class ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
    }
    observe() {
        // Call the callback with a minimal ResizeObserverEntry-like object
        // Adjust this as needed if your tests rely on specific entry properties
        const entry: ResizeObserverEntry = {
            target: document.createElement('div'), // Mock target element
            contentRect: { width: 0, height: 0, top: 0, left: 0, bottom: 0, right: 0, x: 0, y: 0 } as DOMRectReadOnly,
            borderBoxSize: [{ inlineSize: 0, blockSize: 0 }],
            contentBoxSize: [{ inlineSize: 0, blockSize: 0 }],
            devicePixelContentBoxSize: [{ inlineSize: 0, blockSize: 0 }],
        };
        this.callback([entry], this);
    }
    unobserve() {}
    disconnect() {}
};

// Mock window.matchMedia for antd & other libraries that may use it in tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// If you are using Vitest and want to mock global `jest` object, you can uncomment the following:
// import { vi } from 'vitest';
// global.jest = vi; 