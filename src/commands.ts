import { getAccessibilityTree } from './accessibility';
import { AppiumClient, CommandResult } from './types';
import { findElementBySelector, createSelector } from './utils';

export async function handleGetContext(client: AppiumClient): Promise<any> {
  const accessibilityTree = await getAccessibilityTree(client);

  return {
    accessibility: accessibilityTree,
    url: await client.driver.getUrl().catch(() => ''),
    title: await client.driver.getTitle().catch(() => ''),
  };
}

export async function handleExecuteCommand(
  client: AppiumClient,
  command: string,
  args: Record<string, any>
): Promise<CommandResult> {
  switch (command) {
    case 'click': {
      const { selector } = args;
      if (!selector) {
        throw new Error('Missing selector for click command');
      }
      await client.click(selector);
      return { success: true };
    }

    case 'tap': {
      const { x, y } = args;
      if (typeof x !== 'number' || typeof y !== 'number') {
        throw new Error('Missing coordinates for tap command');
      }
      await client.tap(x, y);
      return { success: true };
    }

    case 'type': {
      const { selector, text } = args;
      if (!selector || text === undefined) {
        throw new Error('Missing selector or text for type command');
      }
      await client.type(selector, text);
      return { success: true };
    }

    case 'clear': {
      const { selector } = args;
      if (!selector) {
        throw new Error('Missing selector for clear command');
      }
      await client.clear(selector);
      return { success: true };
    }

    case 'swipe': {
      const { fromX, fromY, toX, toY } = args;
      if (typeof fromX !== 'number' ||
          typeof fromY !== 'number' ||
          typeof toX !== 'number' ||
          typeof toY !== 'number') {
        throw new Error('Missing coordinates for swipe command');
      }
      await client.swipe(fromX, fromY, toX, toY);
      return { success: true };
    }

    case 'back': {
      await client.back();
      return { success: true };
    }

    case 'findElement': {
      const { description } = args;
      if (!description) {
        throw new Error('Missing description for findElement command');
      }

      const accessibilityTree = await getAccessibilityTree(client);
      const selector = await createSelector(description, accessibilityTree);

      return {
        success: true,
        selector,
      };
    }

    default:
      throw new Error(`Unknown command: ${command}`);
  }
}
