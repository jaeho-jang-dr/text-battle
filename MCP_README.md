# Kid Text Battle MCP Server

This project now includes a Model Context Protocol (MCP) server that provides AI assistants with tools to interact with the Kid Text Battle game database and functionality.

## MCP Server Features

### Available Tools

#### 1. Game Statistics (`get_game_stats`)
Get comprehensive statistics about the game:
- **Parameters**: `type` (optional) - battles, characters, users, or animals
- **Returns**: Statistical data about the specified game aspect

#### 2. Bot Character Creation (`create_bot_character`)
Create new bot characters for the game:
- **Parameters**: 
  - `name` (string) - Character name (1-20 chars)
  - `animalId` (number) - ID of the animal to use
  - `personality` (optional string) - Character personality description
- **Returns**: Confirmation with character details

#### 3. Battle Analysis (`analyze_battle`)
Analyze battle patterns and statistics:
- **Parameters**:
  - `limit` (optional number) - Number of battles to analyze (1-100, default: 10)
  - `winnerOnly` (optional boolean) - Only analyze completed battles (default: false)
- **Returns**: Battle analysis with win rates and patterns

#### 4. Animal Information (`get_animal_info`)
Get detailed information about game animals:
- **Parameters**: `category` (optional) - current, mythical, prehistoric, or all
- **Returns**: List of animals with their details

#### 5. Live Battle Monitor (`monitor_battles`) - SSE Only
Monitor recent battle activity:
- **Parameters**: `minutes` (optional) - Time window to monitor (1-60, default: 10)
- **Returns**: Real-time battle activity data

#### 6. User Activity (`get_user_activity`) - SSE Only
Get user engagement metrics:
- **Parameters**: `period` (optional) - today, week, or month
- **Returns**: User activity statistics

## Endpoints

### HTTP Transport
- **URL**: `http://localhost:3008/api/mcp`
- **Methods**: GET, POST
- **Timeout**: 60 seconds

### SSE Transport
- **URL**: `http://localhost:3008/api/mcp/sse`
- **Methods**: GET, POST
- **Timeout**: 300 seconds (5 minutes)
- **Features**: Real-time monitoring tools

## Client Configuration

### Claude Desktop
Add to `~/.claude_desktop_config.json` (macOS) or equivalent:

```json
{
  "mcpServers": {
    "kid-text-battle": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:3008/api/mcp"]
    }
  }
}
```

### Cursor
Add to `~/.cursor/mcp.json`:
```json
{
  "kid-text-battle": {
    "command": "npx",
    "args": ["-y", "mcp-remote", "http://localhost:3008/api/mcp"]
  }
}
```

### Windsurf
Add to `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "kid-text-battle": {
    "command": "npx",
    "args": ["-y", "mcp-remote", "http://localhost:3008/api/mcp"]
  }
}
```

## Development

### Prerequisites
- Node.js 18+
- Next.js 13+
- SQLite database (automatically initialized)

### Installation
Already installed in this project:
```bash
npm install @modelcontextprotocol/sdk mcp-handler zod@^3
```

### Local Testing
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test MCP endpoints:
   ```bash
   curl -X POST http://localhost:3008/api/mcp \
     -H "Content-Type: application/json" \
     -d '{"method": "tools/list"}'
   ```

### Production Deployment

The MCP server is configured for Vercel deployment with appropriate timeouts:
- Standard tools: 60 seconds
- SSE tools: 300 seconds (5 minutes)

## Security Notes

- MCP server only provides read access to game statistics
- Bot character creation is limited to system-level operations
- No user authentication bypass or sensitive data exposure
- All database queries use prepared statements

## Example Usage

Once connected to an AI client with MCP support, you can:

```
Get game statistics:
"Show me the current game statistics"

Create a bot character:
"Create a bot character named 'FireDragon' using animal ID 5"

Analyze recent battles:
"Analyze the last 20 battles and show win patterns"

Get animal information:
"Show me all mythical animals in the game"
```

## Troubleshooting

1. **Connection Issues**: Ensure the development server is running on port 3008
2. **Tool Not Found**: Verify the MCP client configuration file path
3. **Database Errors**: Check that the SQLite database is properly initialized
4. **Timeout Issues**: For long-running operations, use the SSE endpoint