import { remote } from 'webdriverio';
import { AppiumClient } from './types';

export async function createAppiumClient(capabilities: any): Promise<AppiumClient> {
  // Default Appium server URL
  const appiumServerUrl = process.env.APPIUM_SERVER_URL || 'http://localhost:4723';

  // Ensure we have some default capabilities if none were provided
  const defaultCapabilities = {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:newCommandTimeout': 0,
  };

  // Merge provided capabilities with defaults
  const mergedCapabilities = {
    ...defaultCapabilities,
    ...capabilities,
  };

  const options = {
    hostname: new URL(appiumServerUrl).hostname,
    port: parseInt(new URL(appiumServerUrl).port, 10) || 4723,
    path: '/wd/hub',
    capabilities: mergedCapabilities,
    logLevel: (process.env.LOG_LEVEL || 'error') as 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent',
  };

  // Create a new WebdriverIO session
  const driver = await remote(options);

  return {
    driver,
    sessionId: driver.sessionId,
    async getAccessibilityTree() {
      // Get the page source as XML and parse accessibility information
      const source = await driver.getPageSource();
      return source;
    },
    async click(selector: string) {
      const element = await driver.$(selector);
      await element.click();
    },
    async type(selector: string, text: string) {
      const element = await driver.$(selector);
      await element.setValue(text);
    },
    async clear(selector: string) {
      const element = await driver.$(selector);
      await element.clearValue();
    },
    async tap(x: number, y: number) {
      await driver.touchAction([
        { action: 'tap', x, y }
      ]);
    },
    async swipe(fromX: number, fromY: number, toX: number, toY: number) {
      await driver.touchAction([
        { action: 'press', x: fromX, y: fromY },
        { action: 'wait', ms: 500 },
        { action: 'moveTo', x: toX, y: toY },
        { action: 'release' }
      ]);
    },
    async back() {
      await driver.back();
    },
    async quit() {
      await driver.deleteSession();
    },
  };
}
