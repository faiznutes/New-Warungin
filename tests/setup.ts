/**
 * Test setup file for Vitest
 * This file is loaded before all tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Setup before all tests
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  
  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    log: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  };
});

// Cleanup after all tests
afterAll(() => {
  // Cleanup code if needed
});

// Setup before each test
beforeEach(() => {
  // Reset state if needed
});

// Cleanup after each test
afterEach(() => {
  // Cleanup after each test if needed
});
