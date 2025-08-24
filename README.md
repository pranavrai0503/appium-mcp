# Appium MCP (Model Context Protocol)

A server that enables LLMs to interact with mobile apps through structured accessibility snapshots using Appium.

## Features

- Fast and lightweight - uses Appium's accessibility tree, not pixel-based input
- LLM-friendly - no vision models needed, operates purely on structured data
- Deterministic tool application - avoids ambiguity common with screenshot-based approaches
- Works with both Android and iOS applications

## Prerequisites

- Node.js 16+
- Appium server running
- Android SDK or Xcode (for iOS) installed and configured

## Setup

1. Clone this repository
```
git clone https://github.com/yourusername/appium-mcp.git
cd appium-mcp
```

2. Install dependencies
```
npm install
```

3. Build the project
```
npm run build
```

4. Start the Appium server (in a separate terminal)
```
appium
```

5. Start the MCP server
```
npm start
```

## API Endpoints

The server exposes the following REST API endpoints:

- `GET /health` - Check if the server is running
- `POST /session` - Create a new Appium session with provided capabilities
- `DELETE /session/:sessionId` - End an Appium session
- `GET /context` - Get the current app context (accessibility tree)
- `POST /command` - Execute a command on the app

### Commands

The following commands are supported:

- `click` - Click on an element by selector
- `tap` - Tap at specific coordinates
- `type` - Type text into an element
- `clear` - Clear text from an element
- `swipe` - Swipe from one point to another
- `back` - Navigate back
- `findElement` - Find an element based on a natural language description

## Example Usage

### Create a session

```bash
curl -X POST http://localhost:3000/session \
  -H "Content-Type: application/json" \
  -d '{
    "capabilities": {
      "platformName": "Android",
      "appium:deviceName": "Android Emulator",
      "appium:app": "/path/to/your/app.apk"
    }
  }'
```

### Get context

```bash
curl -X GET http://localhost:3000/context
```

### Execute a command

```bash
curl -X POST http://localhost:3000/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "click",
    "args": {
      "selector": "id=com.example.app:id/login_button"
    }
  }'
```

## License

MIT
