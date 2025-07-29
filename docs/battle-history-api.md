# Battle History API Documentation

## Overview
The Battle History API provides comprehensive battle data, statistics, insights, and predictive analytics for characters in the Kid Text Battle game.

## Endpoint
```
GET /api/battles/history
```

## Authentication
Requires Bearer token authentication in the Authorization header.

## Request Parameters

### Required
- `characterId` (string): The ID of the character to retrieve battle history for

### Optional Query Parameters
- `limit` (number): Number of records to return (default: 20)
- `offset` (number): Number of records to skip for pagination (default: 0)
- `includeStats` (boolean): Include battle statistics (default: false)
- `includeTimeline` (boolean): Include daily timeline data (default: false)
- `includePatterns` (boolean): Include AI-powered pattern analysis (default: false)
- `includePredictions` (boolean): Include predictive insights (default: false)

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "history": [...],
    "stats": {...},
    "timeline": [...],
    "insights": [...],
    "patterns": [...],
    "predictions": [...],
    "pagination": {...}
  },
  "cached": boolean
}
```

### Response Fields

#### Battle History Entry
```typescript
{
  id: string;
  battleType: 'active' | 'passive';  // Whether character was attacker or defender
  opponentId: string;
  opponentName: string;
  opponentAnimal: {
    name: string;
    koreanName: string;
    emoji: string;
  };
  isWin: boolean;
  scoreChange: number;
  eloChange: number;
  finalScore: number;
  finalEloScore: number;
  aiJudgment?: string;
  aiReasoning?: string;
  createdAt: string;
}
```

#### Battle Statistics
```typescript
{
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;  // Percentage (0-100)
  currentStreak: number;  // Positive for wins, negative for losses
  bestStreak: number;
  averageScoreChange: number;
  favoriteOpponent?: {
    characterId: string;
    characterName: string;
    battleCount: number;
  };
  nemesis?: {
    characterId: string;
    characterName: string;
    lossCount: number;
  };
}
```

#### Timeline Point
```typescript
{
  date: string;  // YYYY-MM-DD format
  score: number;
  eloScore: number;
  battleCount: number;
  wins: number;
  losses: number;
}
```

#### Battle Insight
```typescript
{
  type: 'achievement' | 'suggestion' | 'trend';
  message: string;
  icon: string;
}
```

#### Battle Pattern (when includePatterns=true)
```typescript
{
  type: 'winning_time' | 'losing_streak' | 'opponent_dominance' | 'improvement' | 'plateau';
  description: string;
  confidence: number;  // 0-1
  recommendation?: string;
}
```

#### Predictive Insight (when includePredictions=true)
```typescript
{
  prediction: string;
  probability: number;  // 0-1
  basedOn: string[];
}
```

## Example Requests

### Basic Battle History
```bash
curl -X GET "http://localhost:3008/api/battles/history?characterId=abc123" \
  -H "Authorization: Bearer your-token-here"
```

### With Statistics and Timeline
```bash
curl -X GET "http://localhost:3008/api/battles/history?characterId=abc123&includeStats=true&includeTimeline=true" \
  -H "Authorization: Bearer your-token-here"
```

### Full Analytics (Patterns & Predictions)
```bash
curl -X GET "http://localhost:3008/api/battles/history?characterId=abc123&includeStats=true&includePatterns=true&includePredictions=true" \
  -H "Authorization: Bearer your-token-here"
```

### Paginated Request
```bash
curl -X GET "http://localhost:3008/api/battles/history?characterId=abc123&limit=10&offset=20" \
  -H "Authorization: Bearer your-token-here"
```

## Performance Features

### Caching
- Results are cached for 5 minutes to improve performance
- Cache is automatically invalidated when new battles occur
- Pattern and prediction analysis bypasses cache for real-time results
- Cached responses include `"cached": true` indicator

### Response Times
- Basic history: ~50-100ms (cached: <10ms)
- With statistics: ~100-200ms (cached: <10ms)
- With patterns/predictions: ~200-400ms (not cached)

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "캐릭터 ID가 필요합니다."
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "로그인이 필요합니다."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "권한이 없습니다."
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "캐릭터를 찾을 수 없습니다."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "배틀 히스토리 조회 중 오류가 발생했습니다.",
  "details": "..." // Only in development mode
}
```

## Advanced Features

### Pattern Analysis
When `includePatterns=true`, the API analyzes:
- Time-based performance patterns
- Opponent-specific win rates
- Skill improvement/plateau detection
- Winning/losing streak analysis

### Predictive Insights
When `includePredictions=true`, the API provides:
- Next match win probability
- Goal achievement predictions (e.g., reaching 70% win rate)
- Milestone predictions (e.g., reaching 100 wins)

### Insights Generation
The API automatically generates child-friendly insights:
- Achievement celebrations for streaks and milestones
- Encouraging suggestions during losing streaks
- Trend identification for recent performance
- Rival and nemesis identification

## Best Practices

1. **Use Pagination**: For characters with many battles, use limit/offset to paginate results
2. **Cache Consideration**: Basic queries are cached; use patterns/predictions sparingly
3. **Selective Loading**: Only request stats/timeline/patterns when needed to reduce payload
4. **Error Handling**: Always handle authentication and authorization errors gracefully

## Integration Example

```javascript
async function getBattleHistory(characterId, options = {}) {
  const params = new URLSearchParams({
    characterId,
    limit: options.limit || 20,
    offset: options.offset || 0,
    includeStats: options.includeStats || false,
    includeTimeline: options.includeTimeline || false,
    includePatterns: options.includePatterns || false,
    includePredictions: options.includePredictions || false
  });

  const response = await fetch(`/api/battles/history?${params}`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch battle history');
  }

  return response.json();
}

// Usage
try {
  const { data } = await getBattleHistory('character-123', {
    includeStats: true,
    includeInsights: true
  });
  
  console.log(`Win rate: ${data.stats.winRate}%`);
  console.log(`Current streak: ${data.stats.currentStreak}`);
  
  data.insights.forEach(insight => {
    console.log(`${insight.icon} ${insight.message}`);
  });
} catch (error) {
  console.error('Failed to load battle history:', error);
}
```