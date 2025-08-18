// Server-side only battle operations
// This file should only be imported in API routes

import { memoryStore, Character, Battle } from "./db/memory-store";
import { getCharacterById, updateCharacter } from "./character-server";

const characters = memoryStore.characters;
const battles = memoryStore.battles;

// Battle restriction tracking
const battleRestrictions = new Map<string, { lastBattleTime: Date; dailyBattleCount: number }>();

// ELO rating calculation constants
const DEFAULT_ELO = 1000;
const K_FACTOR_NEW_PLAYER = 32;  // For players with < 30 games
const K_FACTOR_EXPERIENCED = 16;  // For experienced players
const NEW_PLAYER_GAME_THRESHOLD = 30;

// Battle scoring constants
const BASE_SCORE = 100;
const ELO_MULTIPLIER = 0.1;

// Battle restrictions
const DAILY_BATTLE_LIMIT = 20;
const BATTLE_COOLDOWN_MS = 1 * 1000; // 1 second

// Calculate K-factor based on games played
function getKFactor(gamesPlayed: number): number {
  return gamesPlayed < NEW_PLAYER_GAME_THRESHOLD ? K_FACTOR_NEW_PLAYER : K_FACTOR_EXPERIENCED;
}

// Calculate expected outcome for ELO
function getExpectedOutcome(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

// Calculate ELO change
function calculateEloChange(
  playerElo: number,
  opponentElo: number,
  didWin: boolean,
  playerGamesPlayed: number
): number {
  const kFactor = getKFactor(playerGamesPlayed);
  const expectedOutcome = getExpectedOutcome(playerElo, opponentElo);
  const actualOutcome = didWin ? 1 : 0;
  return Math.round(kFactor * (actualOutcome - expectedOutcome));
}

// Calculate battle scores using sophisticated chat analysis
function calculateBattleScores(attacker: Character, defender: Character): {
  attackerScore: number;
  defenderScore: number;
  winnerId: string;
  attackerAnalysis: BattleChatAnalysis;
  defenderAnalysis: BattleChatAnalysis;
} {
  const attackerRating = attacker.rating || attacker.eloScore || DEFAULT_ELO;
  const defenderRating = defender.rating || defender.eloScore || DEFAULT_ELO;
  const eloDiff = attackerRating - defenderRating;
  
  // Analyze both characters' battle chats
  const attackerAnalysis = analyzeBattleChat(attacker);
  const defenderAnalysis = analyzeBattleChat(defender);
  
  // Base scores from chat analysis (70% weight)
  let attackerScore = attackerAnalysis.totalScore * 70;
  let defenderScore = defenderAnalysis.totalScore * 70;
  
  // Apply ELO difference modifier (20% weight)
  const eloModifier = eloDiff * 0.05; // Reduced from 0.1 to give chat more importance
  attackerScore += eloModifier * 20;
  defenderScore -= eloModifier * 20;
  
  // Add controlled randomness (10% weight)
  attackerScore += Math.random() * 10;
  defenderScore += Math.random() * 10;
  
  // Special bonuses for excellence in specific areas
  // If a character excels (8+ score) in any category, give bonus
  const attackerExcellence = Object.values(attackerAnalysis).filter(v => v >= 8).length;
  const defenderExcellence = Object.values(defenderAnalysis).filter(v => v >= 8).length;
  
  attackerScore += attackerExcellence * 5;
  defenderScore += defenderExcellence * 5;
  
  // Ensure minimum scores
  attackerScore = Math.max(attackerScore, 10);
  defenderScore = Math.max(defenderScore, 10);
  
  const winnerId = attackerScore > defenderScore ? attacker.id : defender.id;
  
  return {
    attackerScore: Math.round(attackerScore),
    defenderScore: Math.round(defenderScore),
    winnerId,
    attackerAnalysis,
    defenderAnalysis
  };
}

// Enhanced battle chat analysis with multiple sophisticated criteria
interface BattleChatAnalysis {
  creativity: number;      // 창의성 - unique word usage, original metaphors
  impact: number;         // 임팩트 - powerful opening/closing, memorable phrases
  focus: number;          // 집중력 - consistency, coherent narrative
  linguisticPower: number; // 언어적파워 - strong verbs, vivid descriptions
  strategy: number;       // 전략성 - mentions of attack/defense tactics
  emotionMomentum: number; // 감정과 기세 - emotional intensity, confidence
  lengthScore: number;    // 챗의 길이 - adequate length for expression
  totalScore: number;     // Overall score
}

// Analyze battle chat for sophisticated scoring
function analyzeBattleChat(character: Character): BattleChatAnalysis {
  const chat = character.battleChat || "";
  const name = character.name;
  const words = chat.split(/\s+/);
  const chatLength = chat.length;
  
  // 1. 창의성 (Creativity) - Unique word usage, original metaphors
  let creativity = 5;
  const uniqueCharacters = new Set(chat).size;
  const uniquenessRatio = uniqueCharacters / chat.length;
  
  // Special characters and emojis add creativity
  if (/[~♪★☆♡♥✨🔥⚡️💀👑🗡️⚔️🛡️🎭]/.test(chat)) creativity += 2;
  
  // Unique expressions and metaphors
  const creativePatterns = [
    /\S+의\s+\S+/,  // "X의 Y" pattern (e.g., "어둠의 지배자")
    /\S+[으로|로]\s+\S+/,  // Instrumental patterns
    /마치\s+\S+처럼/,  // Similes
    /\S+[이|가]\s+\S+[하다|되다]/  // Complex verb patterns
  ];
  creativePatterns.forEach(pattern => {
    if (pattern.test(chat)) creativity += 0.5;
  });
  
  // Rare/unique words
  const rareWords = ["운명", "영혼", "차원", "시공간", "영원", "무한", "초월", "각성", "봉인", "심판"];
  rareWords.forEach(word => {
    if (chat.includes(word)) creativity += 0.3;
  });
  
  // 2. 임팩트 (Impact) - Powerful opening/closing, memorable phrases
  let impact = 5;
  
  // Strong opening
  if (/^[가-힣]+[!?]+/.test(chat)) impact += 1;  // Starts with exclamation
  if (/^[어둠|빛|운명|시간|죽음|파멸]/.test(chat)) impact += 0.5;  // Dramatic opening
  
  // Strong closing
  if (/[!?]{2,}$/.test(chat)) impact += 1;  // Multiple punctuation at end
  if (/[각오|준비|운명|심판|끝][하다|되다|이다]*[!?]*$/.test(chat)) impact += 0.5;
  
  // Memorable phrases
  const impactfulPhrases = [
    "절대", "영원히", "결코", "반드시", "끝없는", "무한한", "최강의", "전설의",
    "운명", "심판", "파멸", "멸망", "각성", "초월"
  ];
  impactfulPhrases.forEach(phrase => {
    if (chat.includes(phrase)) impact += 0.3;
  });
  
  // 3. 집중력 (Focus) - Consistency, coherent narrative
  let focus = 5;
  
  // Coherent theme throughout
  const themeWords = {
    magic: ["마법", "주문", "마나", "원소", "정령"],
    warrior: ["검", "칼", "전투", "전사", "무기"],
    dark: ["어둠", "그림자", "암흑", "심연", "악"],
    light: ["빛", "성스러운", "신성한", "축복", "정의"],
    nature: ["자연", "바람", "불", "물", "대지"]
  };
  
  let dominantTheme = 0;
  Object.values(themeWords).forEach(wordSet => {
    const themeCount = wordSet.filter(word => chat.includes(word)).length;
    if (themeCount > dominantTheme) dominantTheme = themeCount;
  });
  focus += Math.min(dominantTheme, 2);
  
  // Clear intent and structure
  if (words.length >= 5 && words.length <= 20) focus += 1;  // Good word count
  if (/[.!?]\s+[가-힣]/.test(chat)) focus += 0.5;  // Multiple sentences
  
  // 4. 언어적파워 (Linguistic Power) - Strong verbs, vivid descriptions
  let linguisticPower = 5;
  
  // Strong action verbs
  const strongVerbs = [
    "파괴하다", "분쇄하다", "박살내다", "짓밟다", "제압하다", "지배하다",
    "굴복시키다", "봉인하다", "해방하다", "각성하다", "초월하다", "군림하다"
  ];
  strongVerbs.forEach(verb => {
    if (chat.includes(verb.replace("하다", ""))) linguisticPower += 0.4;
  });
  
  // Vivid adjectives
  const vividAdjectives = [
    "압도적인", "절대적인", "무한한", "영원한", "신성한", "저주받은",
    "불멸의", "전설적인", "초월적인", "궁극의"
  ];
  vividAdjectives.forEach(adj => {
    if (chat.includes(adj.replace("인", "").replace("의", ""))) linguisticPower += 0.3;
  });
  
  // 5. 전략성 (Strategy) - Mentions of attack/defense tactics
  let strategy = 5;
  
  // Attack mentions
  const attackWords = ["공격", "타격", "일격", "강타", "연타", "콤보", "필살기"];
  attackWords.forEach(word => {
    if (chat.includes(word)) strategy += 0.5;
  });
  
  // Defense mentions
  const defenseWords = ["방어", "수비", "보호", "방패", "막다", "버티다", "견디다"];
  defenseWords.forEach(word => {
    if (chat.includes(word)) strategy += 0.5;
  });
  
  // Tactical expressions
  if (/[준비|대비|각오]/.test(chat)) strategy += 0.5;
  if (/[약점|급소|빈틈]/.test(chat)) strategy += 0.5;
  
  // 6. 감정과 기세 (Emotion & Momentum) - Emotional intensity, confidence
  let emotionMomentum = 5;
  
  // Confidence indicators
  if (chat.includes("!")) emotionMomentum += 0.5;
  if (chat.includes("!!") || chat.includes("!!!")) emotionMomentum += 1;
  if (/[ㅋㅎㅠㅜ]/.test(chat)) emotionMomentum += 0.5;  // Korean emotion characters
  
  // Emotional words
  const emotionWords = [
    "분노", "격노", "환희", "절망", "공포", "두려움", "기쁨", "슬픔",
    "증오", "사랑", "열정", "투지", "의지", "결의"
  ];
  emotionWords.forEach(word => {
    if (chat.includes(word)) emotionMomentum += 0.4;
  });
  
  // Battle cries and exclamations
  const battleCries = ["흐하하", "크하하", "후후", "흐흐", "케케", "음하하", "우하하", "아하하"];
  battleCries.forEach(cry => {
    if (chat.includes(cry)) emotionMomentum += 0.5;
  });
  
  // 7. 챗의 길이 (Chat Length) - Adequate length for expression
  let lengthScore = 5;
  
  if (chatLength < 10) {
    lengthScore = 3;  // Too short
  } else if (chatLength >= 10 && chatLength < 30) {
    lengthScore = 6;  // A bit short but acceptable
  } else if (chatLength >= 30 && chatLength <= 100) {
    lengthScore = 10;  // Perfect length
  } else if (chatLength > 100 && chatLength <= 150) {
    lengthScore = 8;  // Good but a bit long
  } else {
    lengthScore = 6;  // Too long
  }
  
  // Normalize all scores to 0-10 range
  creativity = Math.min(Math.max(creativity, 0), 10);
  impact = Math.min(Math.max(impact, 0), 10);
  focus = Math.min(Math.max(focus, 0), 10);
  linguisticPower = Math.min(Math.max(linguisticPower, 0), 10);
  strategy = Math.min(Math.max(strategy, 0), 10);
  emotionMomentum = Math.min(Math.max(emotionMomentum, 0), 10);
  lengthScore = Math.min(Math.max(lengthScore, 0), 10);
  
  // Calculate total score with weights
  const totalScore = (
    creativity * 0.15 +
    impact * 0.15 +
    focus * 0.15 +
    linguisticPower * 0.15 +
    strategy * 0.15 +
    emotionMomentum * 0.15 +
    lengthScore * 0.10
  );
  
  return {
    creativity: Math.round(creativity * 10) / 10,
    impact: Math.round(impact * 10) / 10,
    focus: Math.round(focus * 10) / 10,
    linguisticPower: Math.round(linguisticPower * 10) / 10,
    strategy: Math.round(strategy * 10) / 10,
    emotionMomentum: Math.round(emotionMomentum * 10) / 10,
    lengthScore: Math.round(lengthScore * 10) / 10,
    totalScore: Math.round(totalScore * 10) / 10
  };
}

// Generate detailed battle analysis with scoring breakdown
function generateBattleAnalysis(
  attacker: Character,
  defender: Character,
  attackerScore: number,
  defenderScore: number,
  winnerId: string,
  attackerAnalysis: BattleChatAnalysis,
  defenderAnalysis: BattleChatAnalysis
): { summary: string; explanation?: string; tip?: string; scoreBreakdown?: string } {
  const winner = winnerId === attacker.id ? attacker : defender;
  const loser = winnerId === attacker.id ? defender : attacker;
  const winnerAnalysis = winnerId === attacker.id ? attackerAnalysis : defenderAnalysis;
  const loserAnalysis = winnerId === attacker.id ? defenderAnalysis : attackerAnalysis;
  
  // Find the strongest factors for the winner
  const winnerStrengths: string[] = [];
  const scoreComparisons = [
    { name: "창의성", winScore: winnerAnalysis.creativity, loseScore: loserAnalysis.creativity },
    { name: "임팩트", winScore: winnerAnalysis.impact, loseScore: loserAnalysis.impact },
    { name: "집중력", winScore: winnerAnalysis.focus, loseScore: loserAnalysis.focus },
    { name: "언어적 파워", winScore: winnerAnalysis.linguisticPower, loseScore: loserAnalysis.linguisticPower },
    { name: "전략성", winScore: winnerAnalysis.strategy, loseScore: loserAnalysis.strategy },
    { name: "감정과 기세", winScore: winnerAnalysis.emotionMomentum, loseScore: loserAnalysis.emotionMomentum },
    { name: "챗의 길이", winScore: winnerAnalysis.lengthScore, loseScore: loserAnalysis.lengthScore }
  ];
  
  // Sort by winner's advantage
  scoreComparisons.sort((a, b) => (b.winScore - b.loseScore) - (a.winScore - a.loseScore));
  
  // Take top 3 advantages
  const topAdvantages = scoreComparisons.slice(0, 3).filter(comp => comp.winScore > comp.loseScore);
  topAdvantages.forEach(adv => {
    winnerStrengths.push(`${adv.name} (${adv.winScore}/10)`);
  });
  
  // Generate the summary
  let summary = `${winner.name}의 승리! `;
  
  if (winnerStrengths.length > 0) {
    summary += `${winner.name}은(는) ${winnerStrengths.join(", ")}에서 우위를 점했습니다. `;
  }
  
  const scoreDiff = Math.abs(attackerScore - defenderScore);
  if (scoreDiff < 20) {
    summary += "아주 치열한 접전이었습니다!";
  } else if (scoreDiff < 50) {
    summary += "명확한 실력 차이를 보여주었습니다.";
  } else {
    summary += "압도적인 승리였습니다!";
  }
  
  // Generate detailed score breakdown
  let scoreBreakdown = `\n\n📊 전투 점수 분석:\n`;
  scoreBreakdown += `${attacker.name}:\n`;
  scoreBreakdown += `• 창의성: ${attackerAnalysis.creativity}/10\n`;
  scoreBreakdown += `• 임팩트: ${attackerAnalysis.impact}/10\n`;
  scoreBreakdown += `• 집중력: ${attackerAnalysis.focus}/10\n`;
  scoreBreakdown += `• 언어적 파워: ${attackerAnalysis.linguisticPower}/10\n`;
  scoreBreakdown += `• 전략성: ${attackerAnalysis.strategy}/10\n`;
  scoreBreakdown += `• 감정과 기세: ${attackerAnalysis.emotionMomentum}/10\n`;
  scoreBreakdown += `• 챗의 길이: ${attackerAnalysis.lengthScore}/10\n`;
  scoreBreakdown += `• 종합 점수: ${attackerAnalysis.totalScore}/10\n\n`;
  
  scoreBreakdown += `${defender.name}:\n`;
  scoreBreakdown += `• 창의성: ${defenderAnalysis.creativity}/10\n`;
  scoreBreakdown += `• 임팩트: ${defenderAnalysis.impact}/10\n`;
  scoreBreakdown += `• 집중력: ${defenderAnalysis.focus}/10\n`;
  scoreBreakdown += `• 언어적 파워: ${defenderAnalysis.linguisticPower}/10\n`;
  scoreBreakdown += `• 전략성: ${defenderAnalysis.strategy}/10\n`;
  scoreBreakdown += `• 감정과 기세: ${defenderAnalysis.emotionMomentum}/10\n`;
  scoreBreakdown += `• 챗의 길이: ${defenderAnalysis.lengthScore}/10\n`;
  scoreBreakdown += `• 종합 점수: ${defenderAnalysis.totalScore}/10`;
  
  // Generate explanation and tip
  let explanation: string | undefined;
  let tip: string | undefined;
  
  // Always provide explanation for better understanding
  if (scoreDiff > 30) {
    const excellentScores = Object.entries({
      creativity: { score: winnerAnalysis.creativity, name: "창의성", tip: "특수문자, 은유, 독특한 표현을 사용하면 창의성이 높아집니다." },
      impact: { score: winnerAnalysis.impact, name: "임팩트", tip: "강렬한 시작과 끝, 기억에 남는 문구를 사용하세요." },
      linguisticPower: { score: winnerAnalysis.linguisticPower, name: "언어적 파워", tip: "강력한 동사와 생생한 형용사를 활용하세요." },
      emotionMomentum: { score: winnerAnalysis.emotionMomentum, name: "감정과 기세", tip: "감정을 담은 표현과 자신감 있는 어조를 사용하세요." }
    });
    
    const bestCategory = Object.entries(excellentScores)
      .sort((a, b) => b[1].score - a[1].score)[0];
    
    if (bestCategory && bestCategory[1].score > 8) {
      explanation = `뛰어난 ${bestCategory[1].name}(${bestCategory[1].score}/10)이(가) 승리의 결정적 요인이었습니다!`;
      tip = bestCategory[1].tip;
    } else {
      explanation = "전반적으로 균형잡힌 우수한 전투 대사로 완승을 거두었습니다!";
      tip = "모든 평가 요소를 골고루 신경쓰면 안정적인 승률을 유지할 수 있습니다.";
    }
  } else if (scoreDiff > 15) {
    // Find the biggest difference
    const biggestDiff = scoreComparisons[0];
    explanation = `${biggestDiff.name}에서의 우위(${biggestDiff.winScore} vs ${biggestDiff.loseScore})가 승부를 결정지었습니다.`;
    
    const categoryTips = {
      "창의성": "독특한 단어와 표현을 사용해 창의성을 높이세요.",
      "임팩트": "강렬한 시작과 마무리로 임팩트를 높이세요.",
      "집중력": "일관된 주제와 명확한 의도로 집중력을 보여주세요.",
      "언어적 파워": "강력한 동사와 생생한 표현을 사용하세요.",
      "전략성": "공격과 방어 전술을 언급해 전략성을 드러내세요.",
      "감정과 기세": "감정을 담고 자신감 있게 표현하세요.",
      "챗의 길이": "30-100자 사이의 적절한 길이를 유지하세요."
    };
    tip = categoryTips[biggestDiff.name] || "모든 요소를 균형있게 발전시키세요.";
  } else {
    explanation = "아슬아슬한 승부! 작은 차이가 승패를 갈랐습니다.";
    tip = "근소한 차이로 승부가 결정되었습니다. 조금만 더 연습하면 역전할 수 있습니다!";
  }
  
  return { summary, explanation, tip, scoreBreakdown };
}

// Generate battle log (simplified)
function generateBattleLog(
  attacker: Character,
  defender: Character,
  attackerScore: number,
  defenderScore: number,
  winnerId: string
): string[] {
  // Return the analysis summary as a single string in an array
  const analysis = generateBattleAnalysis(attacker, defender, attackerScore, defenderScore, winnerId);
  return [analysis.summary];
}

// Check if a user can battle
export async function checkBattleRestrictions(
  userId: string,
  attackerId: string,
  defenderId: string,
  isAttacking: boolean = true
): Promise<{ canBattle: boolean; error?: string }> {
  try {
    const now = new Date();
    const restriction = battleRestrictions.get(userId);
    
    if (restriction) {
      // Check cooldown
      const timeSinceLastBattle = now.getTime() - restriction.lastBattleTime.getTime();
      if (timeSinceLastBattle < BATTLE_COOLDOWN_MS) {
        const remainingTime = Math.ceil((BATTLE_COOLDOWN_MS - timeSinceLastBattle) / 1000);
        return {
          canBattle: false,
          error: `Please wait ${remainingTime} seconds before battling again`
        };
      }
      
      // Check daily limit (reset at midnight)
      const lastBattleDate = restriction.lastBattleTime.toDateString();
      const currentDate = now.toDateString();
      
      if (lastBattleDate === currentDate && restriction.dailyBattleCount >= DAILY_BATTLE_LIMIT) {
        return {
          canBattle: false,
          error: `Daily battle limit (${DAILY_BATTLE_LIMIT}) reached. Try again tomorrow!`
        };
      }
    }
    
    return { canBattle: true };
  } catch (error: any) {
    console.error("Error checking battle restrictions:", error);
    return { canBattle: false, error: error.message };
  }
}

// Update battle restrictions after a battle
export async function updateBattleRestrictions(userId: string): Promise<void> {
  const now = new Date();
  const restriction = battleRestrictions.get(userId);
  
  if (restriction) {
    const lastBattleDate = restriction.lastBattleTime.toDateString();
    const currentDate = now.toDateString();
    
    if (lastBattleDate === currentDate) {
      // Same day, increment count
      restriction.dailyBattleCount++;
    } else {
      // New day, reset count
      restriction.dailyBattleCount = 1;
    }
    restriction.lastBattleTime = now;
  } else {
    // First battle
    battleRestrictions.set(userId, {
      lastBattleTime: now,
      dailyBattleCount: 1
    });
  }
}

// Create a new battle
export async function createBattle(
  attackerId: string,
  defenderId: string
): Promise<{ data: any; error: string | null }> {
  try {
    // Get both characters
    const attacker = characters.get(attackerId);
    const defender = characters.get(defenderId);
    
    if (!attacker || !defender) {
      return { data: null, error: "Character not found" };
    }
    
    // Calculate battle outcome with detailed analysis
    const { 
      attackerScore, 
      defenderScore, 
      winnerId,
      attackerAnalysis,
      defenderAnalysis
    } = calculateBattleScores(attacker, defender);
    
    // Calculate ELO changes
    const attackerWon = winnerId === attackerId;
    const attackerGamesPlayed = attacker.wins + attacker.losses;
    const defenderGamesPlayed = defender.wins + defender.losses;
    
    const attackerRating = attacker.rating || attacker.eloScore || DEFAULT_ELO;
    const defenderRating = defender.rating || defender.eloScore || DEFAULT_ELO;
    
    const attackerEloChange = calculateEloChange(
      attackerRating,
      defenderRating,
      attackerWon,
      attackerGamesPlayed
    );
    
    const defenderEloChange = calculateEloChange(
      defenderRating,
      attackerRating,
      !attackerWon,
      defenderGamesPlayed
    );
    
    // Generate battle analysis with explanation
    const analysis = generateBattleAnalysis(
      attacker,
      defender,
      attackerScore,
      defenderScore,
      winnerId,
      attackerAnalysis,
      defenderAnalysis
    );
    
    // Generate battle log with score breakdown
    const battleLog = [analysis.summary];
    if (analysis.scoreBreakdown) {
      battleLog.push(analysis.scoreBreakdown);
    }
    
    // Create battle record
    const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const battle: Battle = {
      id: battleId,
      player1Id: attackerId,
      player2Id: defenderId,
      winnerId,
      player1EloChange: attackerEloChange,
      player2EloChange: defenderEloChange,
      createdAt: new Date()
    };
    
    battles.set(battleId, battle);
    
    // Update characters
    if (attackerWon) {
      attacker.wins++;
      defender.losses++;
    } else {
      attacker.losses++;
      defender.wins++;
    }
    
    // Update total battles count
    attacker.totalBattles = (attacker.totalBattles || 0) + 1;
    defender.totalBattles = (defender.totalBattles || 0) + 1;
    
    // Update ratings
    if (attacker.rating !== undefined) {
      attacker.rating += attackerEloChange;
    } else {
      attacker.eloScore = (attacker.eloScore || DEFAULT_ELO) + attackerEloChange;
    }
    
    if (defender.rating !== undefined) {
      defender.rating += defenderEloChange;
    } else {
      defender.eloScore = (defender.eloScore || DEFAULT_ELO) + defenderEloChange;
    }
    
    attacker.updatedAt = new Date();
    defender.updatedAt = new Date();
    
    // Save updated characters back to memory store
    characters.set(attackerId, attacker);
    characters.set(defenderId, defender);
    
    // Update battle restrictions for non-NPC attacker
    if (!attacker.isNPC) {
      await updateBattleRestrictions(attacker.userId);
    }
    
    // Check if we should include detailed analysis (every 7 battles)
    const attackerBattleCount = attacker.totalBattles || 0;
    const shouldShowDetailedAnalysis = attackerBattleCount % 7 === 0;
    
    // Return battle result with detailed analysis conditionally
    const result = {
      id: battleId,
      attackerId,
      defenderId,
      winnerId,
      attackerScore,
      defenderScore,
      battleLog,
      explanation: analysis.explanation,  // Always show brief explanation
      tip: analysis.tip,  // Always show tip
      attackerEloChange,
      defenderEloChange,
      createdAt: battle.createdAt,
      // Include detailed scoring breakdown only every 10 battles
      ...(shouldShowDetailedAnalysis && {
        attackerAnalysis,
        defenderAnalysis
      })
    };
    
    return { data: result, error: null };
  } catch (error: any) {
    console.error("Error creating battle:", error);
    return { data: null, error: error.message };
  }
}

// Get recent battles for a character
export async function getRecentBattles(
  characterId: string,
  limit = 10
): Promise<{ data: any[]; error: string | null }> {
  try {
    const recentBattles = Array.from(battles.values())
      .filter(battle => 
        battle.player1Id === characterId || battle.player2Id === characterId
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map(battle => {
        const isPlayer1 = battle.player1Id === characterId;
        const opponentId = isPlayer1 ? battle.player2Id : battle.player1Id;
        const opponent = characters.get(opponentId);
        const didWin = battle.winnerId === characterId;
        const eloChange = isPlayer1 ? battle.player1EloChange : battle.player2EloChange;
        
        return {
          id: battle.id,
          opponentName: opponent?.name || "Unknown",
          didWin,
          eloChange,
          createdAt: battle.createdAt
        };
      });
    
    return { data: recentBattles, error: null };
  } catch (error: any) {
    console.error("Error fetching recent battles:", error);
    return { data: [], error: error.message };
  }
}

// Note: getCharacterById is imported from character-server.ts

// Get user battle statistics
export async function getUserBattleStats(userId: string) {
  try {
    const now = new Date();
    const restriction = battleRestrictions.get(userId);
    
    let dailyBattlesUsed = 0;
    let canBattleToday = true;
    
    if (restriction) {
      const lastBattleDate = restriction.lastBattleTime.toDateString();
      const currentDate = now.toDateString();
      
      if (lastBattleDate === currentDate) {
        dailyBattlesUsed = restriction.dailyBattleCount;
        canBattleToday = dailyBattlesUsed < DAILY_BATTLE_LIMIT;
      }
    }
    
    const stats = {
      dailyBattlesUsed,
      dailyBattlesRemaining: DAILY_BATTLE_LIMIT - dailyBattlesUsed,
      canBattleToday,
      dailyLimit: DAILY_BATTLE_LIMIT,
      cooldownMs: BATTLE_COOLDOWN_MS
    };
    
    return { data: stats, error: null };
  } catch (error: any) {
    console.error("Error getting user battle stats:", error);
    return { data: null, error: error.message };
  }
}