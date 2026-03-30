// Re-export the base fixture from Playwright
// Override or extend test/expect here if needed
import { test as base, expect } from '@playwright/test';

// Extend base test with custom fixtures if needed
export const test = base.extend({
  // Add custom fixtures here
});

export { expect };
