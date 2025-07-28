# MCP Servers Guide

This project has been configured with two Model Context Protocol (MCP) servers:

## 🚀 Installed MCP Servers

### 1. Supabase MCP Server (`@supabase/mcp-server-supabase`)
- **Version**: 0.4.5
- **Purpose**: Interact with Supabase databases, authentication, and storage
- **Features**:
  - Database queries and mutations
  - User authentication management
  - Storage operations
  - Real-time subscriptions

### 2. Toss Payments Integration Guide MCP (`@tosspayments/integration-guide-mcp`)
- **Version**: 0.0.11
- **Purpose**: Integrate Toss Payments into your application
- **Features**:
  - Payment processing
  - Transaction management
  - Integration guide access
  - Korean payment gateway support

## 📋 Setup Instructions

1. **Environment Variables**
   ```bash
   cp .env.mcp.example .env
   ```
   Then edit `.env` and add your API keys:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `TOSS_SECRET_KEY`: Your Toss Payments secret key
   - `TOSS_CLIENT_KEY`: Your Toss Payments client key

2. **Verify Installation**
   ```bash
   ./activate-mcp-servers.sh
   ```

## 🎯 Usage in Claude Code

Once configured, Claude Code will automatically activate these MCP servers when you start working. You can then:

### Supabase Examples:
- "Create a new table for user profiles"
- "Query all characters from the database"
- "Set up authentication for the app"
- "Upload images to Supabase storage"

### Toss Payments Examples:
- "Integrate Toss Payments checkout"
- "Add a payment form to the page"
- "Handle payment webhooks"
- "Show payment history"

## 🔧 Configuration Files

- **`mcp-config.json`**: MCP server configuration
- **`.env.mcp.example`**: Example environment variables
- **`activate-mcp-servers.sh`**: Activation and verification script

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Toss Payments Documentation](https://docs.tosspayments.com)
- [Model Context Protocol](https://modelcontextprotocol.io)

## 🐛 Troubleshooting

If MCP servers don't activate:
1. Run `./activate-mcp-servers.sh` to check status
2. Ensure environment variables are set correctly
3. Check that Node.js is installed (`node --version`)
4. Verify npm global installations (`npm list -g | grep mcp`)