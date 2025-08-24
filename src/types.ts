export interface AppiumClient {
  driver: any; // WebdriverIO driver
  sessionId: string;
  getAccessibilityTree(): Promise<string>;
  click(selector: string): Promise<void>;
  type(selector: string, text: string): Promise<void>;
  clear(selector: string): Promise<void>;
  tap(x: number, y: number): Promise<void>;
  swipe(fromX: number, fromY: number, toX: number, toY: number): Promise<void>;
  back(): Promise<void>;
  quit(): Promise<void>;
}

export interface AccessibilityBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AccessibilityNode {
  id: string;
  type: string;
  text: string;
  contentDescription: string;
  resourceId?: string;
  clickable: boolean;
  focusable: boolean;
  enabled: boolean;
  bounds: AccessibilityBounds;
  children: AccessibilityNode[];
}

export interface AccessibilityTree {
  timestamp: string;
  screen: {
    width: number;
    height: number;
  };
  nodes: AccessibilityNode[];
}

export interface CommandResult {
  success: boolean;
  selector?: string;
  error?: string;
  [key: string]: any;
}
