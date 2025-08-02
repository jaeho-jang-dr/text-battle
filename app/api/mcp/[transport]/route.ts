import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  (server) => {
  // Game Statistics Tool
  server.tool(
    "get_game_stats",
    "Get Kid Text Battle game statistics",
    {
      type: z.enum(["battles", "characters", "users", "animals"]).optional(),
    },
    async ({ type }) => {
      try {
        const { db } = await import("@/lib/db");
        
        let stats: any = {};
        
        if (!type || type === "battles") {
          const battleCount = await db.prepare("SELECT COUNT(*) as count FROM battles").get() as { count: number };
          stats.battles = battleCount.count;
        }
        
        if (!type || type === "characters") {
          const characterCount = await db.prepare("SELECT COUNT(*) as count FROM characters").get() as { count: number };
          const botCount = await db.prepare("SELECT COUNT(*) as count FROM characters WHERE is_bot = 1").get() as { count: number };
          stats.characters = {
            total: characterCount.count,
            bots: botCount.count,
            players: characterCount.count - botCount.count
          };
        }
        
        if (!type || type === "users") {
          const userCount = await db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
          const guestCount = await db.prepare("SELECT COUNT(*) as count FROM users WHERE is_guest = 1").get() as { count: number };
          stats.users = {
            total: userCount.count,
            guests: guestCount.count,
            registered: userCount.count - guestCount.count
          };
        }
        
        if (!type || type === "animals") {
          const animalCount = await db.prepare("SELECT COUNT(*) as count FROM animals").get() as { count: number };
          stats.animals = animalCount.count;
        }
        
        return {
          content: [{
            type: "text",
            text: `🎮 Kid Text Battle Statistics:\n${JSON.stringify(stats, null, 2)}`
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Error fetching game statistics: ${error}`
          }],
        };
      }
    }
  );

  // Character Creation Tool
  server.tool(
    "create_bot_character",
    "Create a new bot character for Kid Text Battle",
    {
      name: z.string().min(1).max(20),
      animalId: z.number().int().min(1),
      personality: z.string().optional(),
    },
    async ({ name, animalId, personality }) => {
      try {
        const { db } = await import("@/lib/db");
        const { v4: uuidv4 } = await import("uuid");
        
        // Check if animal exists
        const animal = await db.prepare("SELECT * FROM animals WHERE id = ?").get(animalId);
        if (!animal) {
          return {
            content: [{
              type: "text",
              text: `❌ Animal with ID ${animalId} not found`
            }],
          };
        }
        
        // Create bot character
        const characterId = uuidv4();
        const stmt = await db.prepare(`
          INSERT INTO characters (id, user_id, name, animal_id, is_bot, elo_rating, daily_battles_left)
          VALUES (?, 'system', ?, ?, 1, 1200, 999)
        `);
        
        await stmt.run(characterId, name, animalId);
        
        return {
          content: [{
            type: "text",
            text: `✅ Bot character "${name}" created successfully!\n🦁 Animal: ${(animal as any).name}\n🤖 Character ID: ${characterId}`
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Error creating bot character: ${error}`
          }],
        };
      }
    }
  );

  // Battle Analysis Tool
  server.tool(
    "analyze_battle",
    "Analyze battle patterns and statistics",
    {
      limit: z.number().int().min(1).max(100).optional().default(10),
      winnerOnly: z.boolean().optional().default(false),
    },
    async ({ limit, winnerOnly }) => {
      try {
        const { db } = await import("@/lib/db");
        
        const query = winnerOnly 
          ? `SELECT b.*, c1.name as challenger_name, c2.name as defender_name, a1.name as challenger_animal, a2.name as defender_animal
             FROM battles b
             JOIN characters c1 ON b.challenger_id = c1.id
             JOIN characters c2 ON b.defender_id = c2.id
             JOIN animals a1 ON c1.animal_id = a1.id
             JOIN animals a2 ON c2.animal_id = a2.id
             WHERE b.winner_id IS NOT NULL
             ORDER BY b.created_at DESC
             LIMIT ?`
          : `SELECT b.*, c1.name as challenger_name, c2.name as defender_name, a1.name as challenger_animal, a2.name as defender_animal
             FROM battles b
             JOIN characters c1 ON b.challenger_id = c1.id
             JOIN characters c2 ON b.defender_id = c2.id
             JOIN animals a1 ON c1.animal_id = a1.id
             JOIN animals a2 ON c2.animal_id = a2.id
             ORDER BY b.created_at DESC
             LIMIT ?`;
        
        const battles = await db.prepare(query).all(limit);
        
        const analysis = {
          totalBattles: battles.length,
          winRates: {} as any,
          animalStats: {} as any,
          recentBattles: battles.slice(0, 5).map((battle: any) => ({
            challenger: `${battle.challenger_name} (${battle.challenger_animal})`,
            defender: `${battle.defender_name} (${battle.defender_animal})`,
            winner: battle.winner_id === battle.challenger_id ? 'Challenger' : 'Defender',
            createdAt: battle.created_at
          }))
        };
        
        return {
          content: [{
            type: "text",
            text: `📊 Battle Analysis:\n${JSON.stringify(analysis, null, 2)}`
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Error analyzing battles: ${error}`
          }],
        };
      }
    }
  );

  // Animal Information Tool
  server.tool(
    "get_animal_info",
    "Get detailed information about animals in the game",
    {
      category: z.enum(["current", "mythical", "prehistoric", "all"]).optional().default("all"),
    },
    async ({ category }) => {
      try {
        const { db } = await import("@/lib/db");
        
        let query = "SELECT * FROM animals";
        if (category !== "all") {
          query += ` WHERE category = '${category}'`;
        }
        query += " ORDER BY name";
        
        const animals = await db.prepare(query).all();
        
        return {
          content: [{
            type: "text",
            text: `🦁 Animals in Kid Text Battle (${category}):\n${animals.map((animal: any) => 
              `${animal.emoji} ${animal.name} (${animal.category})`
            ).join('\n')}`
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Error fetching animal information: ${error}`
          }],
        };
      }
    }
  );

  // Live Battle Monitor Tool
  server.tool(
    "monitor_battles",
    "Monitor live battle activity and recent battles",
    {
      minutes: z.number().int().min(1).max(60).optional().default(10),
    },
    async ({ minutes }) => {
      try {
        const { db } = await import("@/lib/db");
        
        const timeAgo = new Date(Date.now() - minutes * 60 * 1000).toISOString();
        
        const recentBattles = await db.prepare(`
          SELECT b.*, c1.name as challenger_name, c2.name as defender_name, 
                 a1.name as challenger_animal, a2.name as defender_animal
          FROM battles b
          JOIN characters c1 ON b.challenger_id = c1.id
          JOIN characters c2 ON b.defender_id = c2.id
          JOIN animals a1 ON c1.animal_id = a1.id
          JOIN animals a2 ON c2.animal_id = a2.id
          WHERE b.created_at > ?
          ORDER BY b.created_at DESC
          LIMIT 20
        `).all(timeAgo);
        
        return {
          content: [{
            type: "text",
            text: `🔴 Live Battle Monitor (Last ${minutes} minutes):\n` +
                  `${recentBattles.length} battles found\n\n` +
                  recentBattles.map((battle: any, index: number) => 
                    `${index + 1}. ${battle.challenger_name} (${battle.challenger_animal}) vs ` +
                    `${battle.defender_name} (${battle.defender_animal}) - ` +
                    `Winner: ${battle.winner_id === battle.challenger_id ? 'Challenger' : 'Defender'}`
                  ).join('\n')
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Error monitoring battles: ${error}`
          }],
        };
      }
    }
  );

  // User Activity Tool
  server.tool(
    "get_user_activity",
    "Get user activity and engagement metrics",
    {
      period: z.enum(["today", "week", "month"]).optional().default("today"),
    },
    async ({ period }) => {
      try {
        const { db } = await import("@/lib/db");
        
        let timeFilter = "";
        const now = new Date();
        
        switch (period) {
          case "today":
            timeFilter = now.toISOString().split('T')[0];
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            timeFilter = weekAgo.toISOString();
            break;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            timeFilter = monthAgo.toISOString();
            break;
        }
        
        const activeUsers = await db.prepare(`
          SELECT COUNT(DISTINCT user_id) as count 
          FROM user_activity 
          WHERE last_active > ?
        `).get(timeFilter) as { count: number };
        
        const newUsers = await db.prepare(`
          SELECT COUNT(*) as count 
          FROM users 
          WHERE created_at > ?
        `).get(timeFilter) as { count: number };
        
        return {
          content: [{
            type: "text",
            text: `📈 User Activity (${period}):\n` +
                  `Active Users: ${activeUsers.count}\n` +
                  `New Users: ${newUsers.count}`
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: `❌ Error fetching user activity: ${error}`
          }],
        };
      }
    }
  );
  },
  {},
  {
    basePath: "/api",
    maxDuration: 60,
    verboseLogs: true,
  }
);

export { handler as GET, handler as POST };

// Increase timeout for long-running operations
export const maxDuration = 60;