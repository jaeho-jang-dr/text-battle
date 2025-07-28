#!/bin/bash

# Activate MCP Servers for Claude Code
# This script sets up and activates Supabase and Toss Payments MCP servers

echo "🚀 Activating MCP Servers for Claude Code..."
echo ""

# Check if MCP servers are installed
echo "📦 Checking MCP server installations..."

if ! npm list -g @supabase/mcp-server-supabase > /dev/null 2>&1; then
    echo "❌ Supabase MCP server not found. Installing..."
    npm install -g @supabase/mcp-server-supabase
else
    echo "✅ Supabase MCP server installed"
fi

if ! npm list -g @tosspayments/integration-guide-mcp > /dev/null 2>&1; then
    echo "❌ Toss Payments MCP server not found. Installing..."
    npm install -g @tosspayments/integration-guide-mcp
else
    echo "✅ Toss Payments MCP server installed"
fi

echo ""
echo "📋 MCP Server Status:"
echo "-------------------"

# Test Supabase MCP server
echo -n "Supabase MCP: "
if [ -f "/usr/lib/node_modules/@supabase/mcp-server-supabase/dist/transports/stdio.js" ]; then
    echo "✅ Ready"
else
    echo "❌ Not found at expected path"
fi

# Test Toss Payments MCP server
echo -n "Toss Payments MCP: "
if [ -f "/usr/lib/node_modules/@tosspayments/integration-guide-mcp/dist/server.js" ]; then
    echo "✅ Ready"
else
    echo "❌ Not found at expected path"
fi

echo ""
echo "🔧 Configuration:"
echo "----------------"
echo "MCP config file: ./mcp-config.json"

# Check for environment variables
if [ -f ".env" ]; then
    echo "Environment file: .env (found)"
else
    echo "Environment file: .env (not found - please create from .env.mcp.example)"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Copy .env.mcp.example to .env and fill in your API keys"
echo "2. The MCP servers will be automatically activated when Claude Code starts"
echo "3. You can now use Supabase and Toss Payments features in your code"
echo ""
echo "✨ MCP servers are ready to use!"