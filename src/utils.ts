import { AccessibilityNode, AccessibilityTree } from './types';

export function findElementBySelector(selector: string, nodes: AccessibilityNode[]): AccessibilityNode | null {
  // Handle different selector types (xpath, id, accessibilityId, etc.)
  if (selector.startsWith('id=')) {
    const resourceId = selector.substring(3);
    return findElementByResourceId(resourceId, nodes);
  }

  if (selector.startsWith('text=')) {
    const text = selector.substring(5);
    return findElementByText(text, nodes);
  }

  if (selector.startsWith('desc=')) {
    const description = selector.substring(5);
    return findElementByDescription(description, nodes);
  }

  // Default to XPath if no prefix is given
  // Note: Simplified implementation, a real one would need to parse and evaluate XPath
  return null;
}

function findElementByResourceId(resourceId: string, nodes: AccessibilityNode[]): AccessibilityNode | null {
  for (const node of nodes) {
    if (node.resourceId === resourceId) {
      return node;
    }

    const foundInChildren = findElementByResourceId(resourceId, node.children);
    if (foundInChildren) {
      return foundInChildren;
    }
  }

  return null;
}

function findElementByText(text: string, nodes: AccessibilityNode[]): AccessibilityNode | null {
  for (const node of nodes) {
    if (node.text === text) {
      return node;
    }

    const foundInChildren = findElementByText(text, node.children);
    if (foundInChildren) {
      return foundInChildren;
    }
  }

  return null;
}

function findElementByDescription(description: string, nodes: AccessibilityNode[]): AccessibilityNode | null {
  for (const node of nodes) {
    if (node.contentDescription === description) {
      return node;
    }

    const foundInChildren = findElementByDescription(description, node.children);
    if (foundInChildren) {
      return foundInChildren;
    }
  }

  return null;
}

// This function would typically use NLP or LLM-based techniques to translate
// a natural language description into a selector
export async function createSelector(description: string, accessibilityTree: AccessibilityTree): Promise<string> {
  // This is a simplified implementation
  // In a real implementation, you would:
  // 1. Parse the description to identify key attributes
  // 2. Search the accessibility tree for nodes matching those attributes
  // 3. Return a selector that can uniquely identify the element

  const words = description.toLowerCase().split(' ');

  // Try to find an element with matching text or description
  const findByTextOrDesc = (nodes: AccessibilityNode[]): string | null => {
    for (const node of nodes) {
      if (node.text && words.some(word => node.text.toLowerCase().includes(word))) {
        return node.resourceId ? `id=${node.resourceId}` : `text=${node.text}`;
      }

      if (node.contentDescription && words.some(word => node.contentDescription.toLowerCase().includes(word))) {
        return `desc=${node.contentDescription}`;
      }

      const foundInChildren = findByTextOrDesc(node.children);
      if (foundInChildren) {
        return foundInChildren;
      }
    }
    return null;
  };

  const selector = findByTextOrDesc(accessibilityTree.nodes);

  if (selector) {
    return selector;
  }

  throw new Error(`Could not create selector from description: ${description}`);
}
