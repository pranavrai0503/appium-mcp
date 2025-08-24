import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createAppiumClient } from './appium-client';
import { handleGetContext, handleExecuteCommand } from './commands';
import { AppiumClient } from './types';

export async function startServer(port: number): Promise<void> {
  const app = express();
  let appiumClient: AppiumClient | null = null;

  app.use(cors());
  app.use(bodyParser.json());

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });

  app.get('/health', (_, res) => {
    res.status(200).send({ status: 'ok' });
  });

  app.post('/session', async (req, res) => {
    try {
      const { capabilities } = req.body;

      if (!capabilities) {
        return res.status(400).send({ error: 'Missing capabilities in request body' });
      }

      if (appiumClient) {
        await appiumClient.quit();
      }

      appiumClient = await createAppiumClient(capabilities);
      res.status(200).send({
        status: 'ok',
        sessionId: appiumClient.sessionId
      });
    } catch (error: any) {
      console.error('Failed to create session:', error);
      res.status(500).send({ error: `Failed to create session: ${error.message}` });
    }
  });

  app.delete('/session/:sessionId', async (req, res) => {
    try {
      if (appiumClient && appiumClient.sessionId === req.params.sessionId) {
        await appiumClient.quit();
        appiumClient = null;
        res.status(200).send({ status: 'ok' });
      } else {
        res.status(404).send({ error: 'Session not found' });
      }
    } catch (error: any) {
      console.error('Failed to end session:', error);
      res.status(500).send({ error: `Failed to end session: ${error.message}` });
    }
  });

  app.get('/context', async (_, res) => {
    try {
      if (!appiumClient) {
        return res.status(400).send({ error: 'No active Appium session' });
      }

      const context = await handleGetContext(appiumClient);
      res.status(200).send(context);
    } catch (error: any) {
      console.error('Failed to get context:', error);
      res.status(500).send({ error: `Failed to get context: ${error.message}` });
    }
  });

  app.post('/command', async (req, res) => {
    try {
      if (!appiumClient) {
        return res.status(400).send({ error: 'No active Appium session' });
      }

      const { command, args } = req.body;

      if (!command) {
        return res.status(400).send({ error: 'Missing command in request body' });
      }

      const result = await handleExecuteCommand(appiumClient, command, args || {});
      res.status(200).send(result);
    } catch (error: any) {
      console.error(`Failed to execute command:`, error);
      res.status(500).send({ error: `Failed to execute command: ${error.message}` });
    }
  });

  return new Promise((resolve) => {
    app.listen(port, () => {
      resolve();
    });
  });
}
