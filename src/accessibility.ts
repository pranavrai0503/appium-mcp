import { parseStringPromise } from 'xml2js';
import { AppiumClient, AccessibilityNode, AccessibilityTree } from './types';

export async function getAccessibilityTree(client: AppiumClient): Promise<AccessibilityTree> {
  // Get the XML representation of the app's UI hierarchy
  const xmlSource = await client.getAccessibilityTree();

  // Parse the XML into a JavaScript object
  const parsed = await parseStringPromise(xmlSource, { explicitArray: false });

  // Extract the screen dimensions from the root node
  const rootNode = parsed.hierarchy;
  const bounds = parseBounds(rootNode['$']?.bounds);

  const screenInfo = {
    width: bounds ? bounds.right : 1080, // Default fallback width
    height: bounds ? bounds.bottom : 2400, // Default fallback height
  };

  // Process the node hierarchy recursively
  const nodes = processNode(rootNode, 0);

  return {
    timestamp: new Date().toISOString(),
    screen: screenInfo,
    nodes,
  };
}

function processNode(node: any, depth: number, parentId?: string): AccessibilityNode[] {
  if (!node) return [];

  const result: AccessibilityNode[] = [];

  // Convert this node to our AccessibilityNode format
  if (node['$']) {
    const attributes = node['$'];
    const bounds = parseBounds(attributes.bounds);

    const nodeId = parentId ? `${parentId}-${result.length}` : `node-${depth}-${result.length}`;

    const accessibilityNode: AccessibilityNode = {
      id: nodeId,
      type: attributes['class'] || '',
      text: attributes['text'] || '',
      contentDescription: attributes['content-desc'] || '',
      clickable: attributes['clickable'] === 'true',
      focusable: attributes['focusable'] === 'true',
      enabled: attributes['enabled'] === 'true',
      bounds: bounds ? {
        x: bounds.left,
        y: bounds.top,
        width: bounds.right - bounds.left,
        height: bounds.bottom - bounds.top,
      } : { x: 0, y: 0, width: 0, height: 0 },
      children: [],
    };

    // Add resource id if available
    if (attributes['resource-id']) {
      accessibilityNode.resourceId = attributes['resource-id'];
    }

    result.push(accessibilityNode);

    // Process child nodes
    const childElements = node.node || [];
    const childNodes = Array.isArray(childElements) ? childElements : [childElements];

    if (childNodes.length > 0 && childNodes[0]) {
      accessibilityNode.children = childNodes.flatMap((childNode: any) =>
        processNode(childNode, depth + 1, nodeId)
      );
    }
  }

  return result;
}

// Parse Android bounds string format "[left,top][right,bottom]"
function parseBounds(boundsString?: string): { left: number, top: number, right: number, bottom: number } | null {
  if (!boundsString) return null;

  const matches = boundsString.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  if (!matches) return null;

  return {
    left: parseInt(matches[1], 10),
    top: parseInt(matches[2], 10),
    right: parseInt(matches[3], 10),
    bottom: parseInt(matches[4], 10),
  };
}
