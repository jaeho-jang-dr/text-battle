import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "hello_world",
      "A simple hello world tool",
      { name: z.string().optional().default("World") },
      async ({ name }) => {
        return {
          content: [{
            type: "text",
            text: `Hello, ${name}! This is Kid Text Battle MCP Server.`
          }],
        };
      }
    );

    server.tool(
      "get_game_info",
      "Get basic game information",
      {},
      async () => {
        return {
          content: [{
            type: "text",
            text: "🎮 Kid Text Battle - Animal text battle game for children ages 7-10"
          }],
        };
      }
    );
  }
);

export { handler as GET, handler as POST };