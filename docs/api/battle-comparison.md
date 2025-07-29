# Battle Comparison API Documentation

## Overview

The Battle Comparison API allows users to compare two characters' statistics, head-to-head records, achievements, and get AI-powered predictions and insights.

## Endpoints

### GET /api/battles/compare

Compare two characters by their IDs.

#### Headers
- `Authorization: Bearer <token>` (required)

#### Query Parameters
- `character1Id` (string, required): ID of the first character
- `character2Id` (string, required): ID of the second character
- `includeAchievements` (boolean, optional): Include achievement comparison
- `includeAnalysis` (boolean, optional): Include strength/weakness analysis
- `includePrediction` (boolean, optional): Include battle prediction
- `includeVisualization` (boolean, optional): Include visualization data

#### Response
```json
{
  "success": true,
  "data": {
    "character1": {
      "id": "string",
      "name": "string",
      "animal": {
        "name": "string",
        "koreanName": "string",
        "emoji": "string"
      },
      "baseScore": 1000,
      "eloScore": 1500,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "character2": { /* same structure */ },
    "headToHead": {
      "totalBattles": 10,
      "character1Wins": 6,
      "character2Wins": 4,
      "lastBattleDate": "2024-01-01T00:00:00Z",
      "lastWinnerId": "char1-id",
      "battleHistory": [/* recent battles */]
    },
    "stats": {
      "character1": {
        "totalBattles": 50,
        "wins": 30,
        "losses": 20,
        "winRate": 60,
        "averageScoreChange": 5,
        "currentStreak": 3,
        "bestStreak": 7,
        "rank": 15
      },
      "character2": { /* same structure */ }
    },
    "achievements": { /* optional */ },
    "analysis": { /* optional */ },
    "prediction": { /* optional */ },
    "visualization": { /* optional */ },
    "insights": [
      {
        "type": "rivalry",
        "message": "숙명의 라이벌! 10번의 대결을 펼쳤어요!",
        "targetCharacter": "both",
        "icon": "🔥"
      }
    ]
  }
}
```

### POST /api/battles/compare

Compare two characters by their names (convenience method).

#### Headers
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json` (required)

#### Request Body
```json
{
  "character1Name": "용맹한 사자",
  "character2Name": "지혜로운 부엉이"
}
```

#### Response
Redirects (307) to GET endpoint with character IDs.

## Features

### 1. Head-to-Head Statistics
- Total battles between the two characters
- Win/loss record
- Recent battle history (last 5 battles)

### 2. Individual Statistics Comparison
- Total battles, wins, losses
- Win rate percentage
- Current streak (wins/losses)
- Best streak achieved
- Average score change per battle
- Current ranking

### 3. Achievement Comparison (optional)
- Individual achievements for each character
- Shared achievements
- Achievement types: milestone, streak, special

### 4. Strength/Weakness Analysis (optional)
- Identifies strengths for each character
- Points out weaknesses
- Suggests opportunities for improvement

### 5. Battle Prediction (optional)
- AI-powered prediction of likely winner
- Probability calculation
- Factors affecting the prediction
- Confidence level (high/medium/low)

### 6. Visualization Data (optional)
- Radar chart data for stat comparison
- 7-day trend comparison
- Normalized values for easy visualization

### 7. Insights
- Rivalry status
- Performance advantages
- Fun facts about the matchup
- Strategic suggestions

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "로그인이 필요합니다."
}
```

### 400 Bad Request
```json
{
  "success": false,
  "error": "두 캐릭터의 ID가 필요합니다."
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "캐릭터를 찾을 수 없습니다."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "최소 한 캐릭터는 본인 소유여야 합니다."
}
```

## Usage Examples

### Basic Comparison
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3008/api/battles/compare?character1Id=char1&character2Id=char2"
```

### Full Analysis
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3008/api/battles/compare?character1Id=char1&character2Id=char2&includeAchievements=true&includeAnalysis=true&includePrediction=true&includeVisualization=true"
```

### Compare by Name
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"character1Name":"용맹한 사자","character2Name":"지혜로운 부엉이"}' \
  "http://localhost:3008/api/battles/compare"
```

## Notes

- At least one character must be owned by the requesting user
- Cannot compare the same character with itself
- Head-to-head statistics only include battles between these two specific characters
- Predictions are based on historical data and current performance metrics
- Visualization data is normalized to 0-100 scale for easy charting