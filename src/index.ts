import { startServer } from './server';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

startServer(PORT)
  .then(() => console.log(`✅ Appium MCP Server running on port ${PORT}`))
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
