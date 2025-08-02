import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { filterBattleText } from '@/lib/filters/content-filter';
import { updateUserActivity, logUserAction } from '@/lib/activity-tracker';
import { battleHistoryCache } from '@/lib/cache/battle-history-cache';
import { v4 as uuidv4 } from 'uuid';

// ELO 점수 계산 함수
function calculateEloChange(winnerScore: number, loserScore: number): { winnerChange: number, loserChange: number } {
  const K = 32; // K-factor
  const expectedWinner = 1 / (1 + Math.pow(10, (loserScore - winnerScore) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerScore - loserScore) / 400));
  
  const winnerChange = Math.round(K * (1 - expectedWinner));
  const loserChange = Math.round(K * (0 - expectedLoser));
  
  return { winnerChange, loserChange };
}

// 배틀 결과 판정 함수 (전투력 20% + 배틀 텍스트 80%)
async function judgeBattle(
  attackerText: string, 
  defenderText: string,
  attackerCombatPower: number,
  defenderCombatPower: number
) {
  // 1. 배틀 텍스트 점수 계산 (80% 가중치)
  const textScoreMultiplier = 0.8;
  const attackerTextScore = attackerText.length * Math.random() * 100;
  const defenderTextScore = defenderText.length * Math.random() * 100;
  
  // 2. 전투력 점수 계산 (20% 가중치)
  const combatPowerMultiplier = 0.2;
  // 전투력을 0-100 범위로 정규화 (최대 전투력 400 기준)
  const normalizedAttackerPower = (attackerCombatPower / 400) * 100;
  const normalizedDefenderPower = (defenderCombatPower / 400) * 100;
  
  // 3. 최종 점수 계산
  const attackerFinalScore = (attackerTextScore * textScoreMultiplier) + (normalizedAttackerPower * combatPowerMultiplier);
  const defenderFinalScore = (defenderTextScore * textScoreMultiplier) + (normalizedDefenderPower * combatPowerMultiplier);
  
  const winner = attackerFinalScore > defenderFinalScore ? 'attacker' : 'defender';
  
  // 판정 메시지 생성
  const judgment = winner === 'attacker' 
    ? '공격자의 배틀 텍스트와 전투력이 더 강렬하고 인상적이었습니다!'
    : '방어자의 배틀 텍스트와 전투력이 더 설득력 있고 강력했습니다!';
  
  const reasoning = `공격자(전투력: ${attackerCombatPower})는 "${attackerText.substring(0, 30)}..."로 ${winner === 'attacker' ? '승리' : '패배'}했고, ` +
    `방어자(전투력: ${defenderCombatPower})는 "${defenderText.substring(0, 30)}..."로 ${winner === 'defender' ? '승리' : '패배'}했습니다.`;
  
  const encouragement = winner === 'attacker'
    ? '훌륭한 승리예요! 계속해서 멋진 배틀을 펼쳐보세요!'
    : '아쉽지만 다음엔 더 잘할 수 있을 거예요! 포기하지 마세요!';
  
  return { 
    winner, 
    judgment, 
    reasoning, 
    encouragement,
    scores: {
      attacker: {
        textScore: Math.round(attackerTextScore),
        combatPower: attackerCombatPower,
        finalScore: Math.round(attackerFinalScore)
      },
      defender: {
        textScore: Math.round(defenderTextScore),
        combatPower: defenderCombatPower,
        finalScore: Math.round(defenderFinalScore)
      }
    }
  };
}

// POST: 새로운 배틀 생성
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다'
      }, { status: 401 });
    }

    // 사용자 확인
    const user = await db.prepare(`
      SELECT * FROM users 
      WHERE login_token = ? 
      AND datetime(token_expires_at) > datetime('now')
    `).get(token) as any;

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 토큰입니다'
      }, { status: 401 });
    }

    // 정지된 계정 확인
    if (user.is_suspended) {
      return NextResponse.json({
        success: false,
        error: '계정이 정지되었습니다'
      }, { status: 403 });
    }

    const { attackerId, defenderId } = await request.json();
    
    // 사용자 활동 추적
    await updateUserActivity(user.id);

    // 공격자 캐릭터 확인 (전투 능력치 포함)
    const attacker = await db.prepare(`
      SELECT c.*, a.*, 
        c.id as char_id, a.id as animal_id,
        a.attack_power, a.strength, a.speed, a.energy
      FROM characters c
      JOIN animals a ON c.animal_id = a.id
      WHERE c.id = ? AND c.user_id = ?
    `).get(attackerId, user.id) as any;

    if (!attacker) {
      return NextResponse.json({
        success: false,
        error: '공격자 캐릭터를 찾을 수 없습니다'
      }, { status: 404 });
    }

    // 방어자 캐릭터 확인 (전투 능력치 포함)
    const defender = await db.prepare(`
      SELECT c.*, a.*, 
        c.id as char_id, a.id as animal_id,
        c.is_bot as is_bot,
        a.attack_power, a.strength, a.speed, a.energy
      FROM characters c
      JOIN animals a ON c.animal_id = a.id
      WHERE c.id = ? AND c.user_id != ?
    `).get(defenderId, user.id) as any;

    if (!defender) {
      return NextResponse.json({
        success: false,
        error: '방어자 캐릭터를 찾을 수 없습니다'
      }, { status: 404 });
    }

    // 오늘 배틀 횟수 확인
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastReset = new Date(attacker.last_battle_reset);
    lastReset.setHours(0, 0, 0, 0);

    // 날짜가 바뀌었으면 리셋
    if (lastReset < today) {
      db.prepare(`
        UPDATE characters 
        SET active_battles_today = 0, last_battle_reset = datetime('now')
        WHERE id = ?
      `).run(attackerId);
      attacker.active_battles_today = 0;
    }

    // 일일 배틀 제한 확인 (봇과의 배틀은 제한 없음)
    const isDefenderBot = defender.is_bot === 1;
    if (!isDefenderBot && attacker.active_battles_today >= 10) {
      return NextResponse.json({
        success: false,
        error: '오늘의 배틀 횟수를 모두 사용했습니다 (10회)\n🤖 대기 계정과는 무제한 배틀이 가능해요!'
      }, { status: 400 });
    }

    // 배틀 텍스트 필터링
    const textFilter = filterBattleText(attacker.battle_text);
    if (!textFilter.isClean) {
      return NextResponse.json({
        success: false,
        error: '배틀 텍스트에 부적절한 내용이 포함되어 있습니다'
      }, { status: 400 });
    }

    // 전투력 계산 (각 능력치의 합)
    const attackerCombatPower = (attacker.attack_power || 50) + (attacker.strength || 50) + 
                                (attacker.speed || 50) + (attacker.energy || 50);
    const defenderCombatPower = (defender.attack_power || 50) + (defender.strength || 50) + 
                                (defender.speed || 50) + (defender.energy || 50);
    
    // 배틀 판정 (전투력 포함)
    const battleResult = await judgeBattle(
      attacker.battle_text, 
      defender.battle_text,
      attackerCombatPower,
      defenderCombatPower
    );
    
    // ELO 점수 계산
    const isAttackerWinner = battleResult.winner === 'attacker';
    const eloChanges = calculateEloChange(
      isAttackerWinner ? attacker.elo_score : defender.elo_score,
      isAttackerWinner ? defender.elo_score : attacker.elo_score
    );
    
    const attackerEloChange = isAttackerWinner ? eloChanges.winnerChange : eloChanges.loserChange;
    const defenderEloChange = isAttackerWinner ? eloChanges.loserChange : eloChanges.winnerChange;
    
    // 기본 점수 변화 (승리 +10, 패배 -5)
    const attackerScoreChange = isAttackerWinner ? 10 : -5;
    const defenderScoreChange = isAttackerWinner ? -5 : 10;

    // 트랜잭션으로 업데이트
    const updateCharacterStats = await db.prepare(`
      UPDATE characters 
      SET 
        base_score = MAX(0, base_score + ?),
        elo_score = MAX(1000, elo_score + ?),
        wins = wins + ?,
        losses = losses + ?,
        total_active_battles = total_active_battles + ?,
        total_passive_battles = total_passive_battles + ?,
        active_battles_today = active_battles_today + ?
      WHERE id = ?
    `);

    // 공격자 업데이트 (봇과의 배틀은 일일 카운트 증가 안함)
    updateCharacterStats.run(
      attackerScoreChange,
      attackerEloChange,
      isAttackerWinner ? 1 : 0,
      isAttackerWinner ? 0 : 1,
      1, // active battle
      0,
      isDefenderBot ? 0 : 1, // 봇과의 배틀은 일일 카운트에 포함되지 않음
      attackerId
    );

    // 방어자 업데이트
    updateCharacterStats.run(
      defenderScoreChange,
      defenderEloChange,
      !isAttackerWinner ? 1 : 0,
      !isAttackerWinner ? 0 : 1,
      0,
      1, // passive battle
      0, // passive battles don't count toward daily limit
      defenderId
    );

    // 배틀 기록 저장
    const battleId = uuidv4();
    const winnerId = battleResult.winner === 'attacker' ? attackerId : defenderId;
    
    db.prepare(`
      INSERT INTO battles (
        id, attacker_id, defender_id, battle_type, winner_id,
        attacker_score_change, defender_score_change,
        attacker_elo_change, defender_elo_change,
        ai_judgment, ai_reasoning
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      battleId,
      attackerId,
      defenderId,
      'active',
      winnerId,
      attackerScoreChange,
      defenderScoreChange,
      attackerEloChange,
      defenderEloChange,
      battleResult.judgment,
      battleResult.reasoning
    );
    
    // 배틀 활동 로그
    await logUserAction(user.id, 'battle_created', {
      battleId,
      attackerId,
      defenderId,
      winner: battleResult.winner,
      isBot: isDefenderBot
    });

    // 배틀 완료 후 관련 캐릭터들의 히스토리 캐시 무효화
    console.log(`Battle completed - invalidating cache for characters: ${attackerId}, ${defenderId}`);
    battleHistoryCache.invalidateCharacter(attackerId);
    battleHistoryCache.invalidateCharacter(defenderId);

    return NextResponse.json({
      success: true,
      data: {
        battleId,
        result: {
          winner: battleResult.winner,
          judgment: battleResult.judgment,
          reasoning: battleResult.reasoning,
          encouragement: battleResult.encouragement,
          attackerScoreChange,
          defenderScoreChange,
          attackerEloChange,
          defenderEloChange
        },
        updatedStats: {
          attacker: {
            baseScore: attacker.base_score + attackerScoreChange,
            eloScore: attacker.elo_score + attackerEloChange,
            wins: attacker.wins + (isAttackerWinner ? 1 : 0),
            losses: attacker.losses + (isAttackerWinner ? 0 : 1),
            todayBattles: attacker.active_battles_today + 1
          },
          defender: {
            baseScore: defender.base_score + defenderScoreChange,
            eloScore: defender.elo_score + defenderEloChange,
            wins: defender.wins + (!isAttackerWinner ? 1 : 0),
            losses: defender.losses + (!isAttackerWinner ? 0 : 1)
          }
        },
        combatStats: {
          attacker: {
            attackPower: attacker.attack_power || 50,
            strength: attacker.strength || 50,
            speed: attacker.speed || 50,
            energy: attacker.energy || 50,
            totalPower: attackerCombatPower
          },
          defender: {
            attackPower: defender.attack_power || 50,
            strength: defender.strength || 50,
            speed: defender.speed || 50,
            energy: defender.energy || 50,
            totalPower: defenderCombatPower
          }
        },
        scores: battleResult.scores
      }
    });
  } catch (error) {
    console.error('Battle creation error:', error);
    return NextResponse.json({
      success: false,
      error: '배틀 생성 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}

// GET: 배틀 기록 조회
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다'
      }, { status: 401 });
    }

    // 사용자 확인
    const user = await db.prepare(`
      SELECT * FROM users 
      WHERE login_token = ? 
      AND datetime(token_expires_at) > datetime('now')
    `).get(token) as any;

    if (!user) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 토큰입니다'
      }, { status: 401 });
    }

    let battles;
    if (characterId) {
      // 특정 캐릭터의 배틀 기록
      battles = db.prepare(`
        SELECT 
          b.*,
          ac.character_name as attacker_name,
          dc.character_name as defender_name,
          aa.emoji as attacker_emoji,
          da.emoji as defender_emoji
        FROM battles b
        JOIN characters ac ON b.attacker_id = ac.id
        JOIN characters dc ON b.defender_id = dc.id
        JOIN animals aa ON ac.animal_id = aa.id
        JOIN animals da ON dc.animal_id = da.id
        WHERE (b.attacker_id = ? OR b.defender_id = ?)
        AND (ac.user_id = ? OR dc.user_id = ?)
        ORDER BY b.created_at DESC
        LIMIT ?
      `).all(characterId, characterId, user.id, user.id, limit);
    } else {
      // 사용자의 모든 배틀 기록
      battles = await db.prepare(`
        SELECT 
          b.*,
          ac.character_name as attacker_name,
          dc.character_name as defender_name,
          aa.emoji as attacker_emoji,
          da.emoji as defender_emoji
        FROM battles b
        JOIN characters ac ON b.attacker_id = ac.id
        JOIN characters dc ON b.defender_id = dc.id
        JOIN animals aa ON ac.animal_id = aa.id
        JOIN animals da ON dc.animal_id = da.id
        WHERE ac.user_id = ? OR dc.user_id = ?
        ORDER BY b.created_at DESC
        LIMIT ?
      `).all(user.id, user.id, limit);
    }

    return NextResponse.json({
      success: true,
      data: battles
    });
  } catch (error) {
    console.error('Battle history error:', error);
    return NextResponse.json({
      success: false,
      error: '배틀 기록을 불러오는 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}