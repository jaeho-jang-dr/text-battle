# Magic Battle API Documentation

## Overview

The Magic Battle API endpoint implements a C7-level battle system with advanced features including magic types, persona archetypes, memory systems, and sequential battles. This endpoint is located at `/api/battles/magic`.

## Features

### Core Features (as per request flags)
- **--c7**: C7 level implementation with 7-depth memory system
- **--seq**: Sequential battle support with increasing intensity
- **--magic**: Full magic type system with advantages/disadvantages
- **--memory**: Battle memory and pattern recognition
- **--serena**: Built-in Serena NPC character
- **--persona**: Persona archetype system with bonuses

## Endpoints

### POST /api/battles/magic
Creates a new magic battle with C7 features.

#### Request Body
```typescript
{
  attackerId?: string;      // Character ID of attacker (optional if using Serena)
  defenderId?: string;      // Character ID of defender (optional if using Serena)
  attackerMagic?: MagicType; // Default: "FIRE"
  defenderMagic?: MagicType; // Default: "WATER"
  sequence?: number;        // Battle sequence number (default: 1)
  useMemory?: boolean;      // Enable memory system (default: true)
  includeSerena?: boolean;  // Include Serena NPC (default: false)
  persona?: PersonaArchetype; // Persona type for attacker
}
```

#### Response
```typescript
{
  success: boolean;
  data: {
    id: string;
    attacker_id: string;
    defender_id: string;
    winner_id: string;
    attacker_score: number;
    defender_score: number;
    battle_log: string;
    battle_type: "magic";
    sequence: number;
    attacker_magic: MagicType;
    defender_magic: MagicType;
    memory_used: boolean;
    created_at: timestamp;
    attacker: {
      name: string;
      oldElo: number;
      newElo: number;
      persona?: PersonaArchetype;
    };
    defender: {
      name: string;
      oldElo: number;
      newElo: number;
      persona?: PersonaArchetype;
    };
  };
  features: {
    c7Level: boolean;
    sequential: number;
    magicSystem: boolean;
    memoryEnabled: boolean;
    serenaIncluded: boolean;
    personaActive: boolean;
  };
}
```

### GET /api/battles/magic
Retrieves magic system information or battle memories.

#### Query Parameters
- `characterId`: Character ID for memory lookup
- `opponentId`: Opponent ID for memory lookup
- `memory=true`: Flag to retrieve battle memory

#### Response (System Info)
```typescript
{
  magicTypes: Record<MagicType, MagicTypeConfig>;
  personas: Record<PersonaArchetype, PersonaConfig>;
  serena: SerenaConfig;
  features: {
    c7MemoryDepth: number;
    sequentialBattles: boolean;
    personaSystem: boolean;
    patternRecognition: boolean;
  };
}
```

## Magic System

### Magic Types
- **FIRE**: Strong against NATURE, weak to WATER
- **WATER**: Strong against FIRE, weak to NATURE
- **NATURE**: Strong against WATER, weak to FIRE
- **LIGHT**: Mutually strong/weak with DARK
- **DARK**: Mutually strong/weak with LIGHT
- **ARCANE**: No weaknesses, strong against all

### Persona Archetypes
Each persona provides bonuses when using specific magic types:

- **MAGICIAN**: Primary: ARCANE, Secondary: FIRE (Memory Bonus: 1.2x)
- **PRIESTESS**: Primary: LIGHT, Secondary: WATER (Memory Bonus: 1.5x)
- **EMPRESS**: Primary: NATURE, Secondary: LIGHT (Memory Bonus: 1.3x)
- **EMPEROR**: Primary: FIRE, Secondary: DARK (Memory Bonus: 1.1x)
- **HIEROPHANT**: Primary: LIGHT, Secondary: NATURE (Memory Bonus: 1.4x)
- **LOVERS**: Primary: WATER, Secondary: LIGHT (Memory Bonus: 1.6x)
- **CHARIOT**: Primary: FIRE, Secondary: ARCANE (Memory Bonus: 1.0x)

## Memory System (C7)

The memory system tracks battle patterns and provides strategic advantages:

### Memory Features
- Stores last 7 battles (C7 depth)
- Tracks magic types used
- Records win/loss outcomes
- Detects patterns:
  - Repeated magic sequences
  - Dominant/weak strategies
  - Magic type preferences

### Memory Bonuses
- Pattern recognition: +5-25 power based on memory strength
- Persona memory bonus: Additional multiplier based on archetype
- Adaptive strategy: System learns from past battles

## Sequential Battles

Sequential battles increase in intensity:
- Each sequence adds a 10% multiplier to scores
- Memory carries over between sequences
- Patterns become more important in later sequences

## Serena NPC

Serena is a special NPC character with:
- Persona: PRIESTESS
- Magic Type: LIGHT
- ELO Score: 1500
- Memory Depth: 7 (C7 level)
- Special dialogue and enhanced AI behavior

## Usage Examples

### Basic Magic Battle
```javascript
const response = await fetch('/api/battles/magic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    attackerId: 'char-123',
    defenderId: 'char-456',
    attackerMagic: 'FIRE',
    defenderMagic: 'WATER'
  })
});
```

### Sequential Battle with Serena
```javascript
const response = await fetch('/api/battles/magic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    attackerId: 'char-123',
    includeSerena: true,
    sequence: 3,
    persona: 'MAGICIAN',
    useMemory: true
  })
});
```

### Check Battle Memory
```javascript
const response = await fetch('/api/battles/magic?characterId=char-123&opponentId=char-456&memory=true');
const { data, hasMemory } = await response.json();
```

## Implementation Notes

1. **Authentication**: Requires valid user session via cookies
2. **Ownership**: Users can only battle with their own characters (except NPCs)
3. **Transaction Safety**: All battle operations use Firebase transactions
4. **Memory Persistence**: Battle memories are stored in separate collection
5. **ELO Calculation**: Uses standard ELO rating system with K-factor of 32

## Error Handling

Common error responses:
- `400`: Missing required parameters
- `401`: Authentication required
- `403`: Ownership verification failed
- `404`: Character not found
- `500`: Internal server error

## Future Enhancements

Potential additions to the system:
- Team battles with multiple characters
- Elemental combinations and fusion magic
- Tournament mode with brackets
- Real-time multiplayer battles
- Advanced AI opponents with learning capabilities