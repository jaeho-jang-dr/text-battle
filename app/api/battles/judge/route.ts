import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 부적절한 단어 필터링 목록
const INAPPROPRIATE_WORDS = [
  '바보', '멍청이', '욕설', '나쁜말', '싫어', '미워',
  // 실제 구현시 더 포괄적인 목록 필요
];

// 긍정적인 단어 목록 (가산점)
const POSITIVE_WORDS = [
  '친구', '사랑', '행복', '즐거운', '재미있는', '신나는',
  '용감한', '똑똑한', '멋진', '대단한', '최고', '힘찬',
  '아름다운', '귀여운', '착한', '상냥한', '따뜻한'
];

export async function POST(request: NextRequest) {
  try {
    // 토큰 확인
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다'
      }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({
        success: false,
        error: '유효하지 않은 토큰 형식입니다'
      }, { status: 401 });
    }

    // 시스템 토큰 확인
    const systemToken = process.env.SYSTEM_API_TOKEN || 'system-token';
    
    // 시스템 토큰이 아닌 경우 일반 사용자 토큰으로 처리
    if (token !== systemToken) {
      // SQLite에서 사용자 확인
      const user = db.prepare(`
        SELECT * FROM users 
        WHERE login_token = ? AND token_expires_at > datetime('now')
      `).get(token);

      if (!user) {
        return NextResponse.json({
          success: false,
          error: '유효하지 않은 토큰입니다'
        }, { status: 401 });
      }
    }

    const { attackerText, defenderText, attackerCharacter, defenderCharacter } = await request.json();

    // 텍스트 검증
    if (!attackerText || !defenderText) {
      return NextResponse.json({
        success: false,
        error: '배틀 텍스트가 필요합니다'
      }, { status: 400 });
    }

    // 부적절한 내용 검사
    const attackerModeration = moderateContent(attackerText);
    const defenderModeration = moderateContent(defenderText);

    if (!attackerModeration.isAppropriate || !defenderModeration.isAppropriate) {
      return NextResponse.json({
        success: false,
        error: '부적절한 내용이 포함되어 있습니다. 친구들과 즐겁게 놀 수 있는 내용으로 다시 써주세요!',
        details: {
          attacker: attackerModeration,
          defender: defenderModeration
        }
      }, { status: 400 });
    }

    // AI 판정 수행
    const attackerScore = evaluateBattleText(attackerText, attackerCharacter);
    const defenderScore = evaluateBattleText(defenderText, defenderCharacter);

    // 승자 결정
    const winnerId = attackerScore > defenderScore ? attackerCharacter.id : defenderCharacter.id;
    const isAttackerWinner = winnerId === attackerCharacter.id;

    // 점수 변화 계산
    const baseScoreChange = 50;
    const attackerScoreChange = isAttackerWinner ? baseScoreChange : -baseScoreChange;
    const defenderScoreChange = isAttackerWinner ? -baseScoreChange : baseScoreChange;

    // ELO 점수 변화 계산
    const K = 32; // ELO K-factor
    const attackerElo = attackerCharacter.elo_score || 1500;
    const defenderElo = defenderCharacter.elo_score || 1500;
    
    const expectedAttacker = 1 / (1 + Math.pow(10, (defenderElo - attackerElo) / 400));
    const actualAttacker = isAttackerWinner ? 1 : 0;
    
    const attackerEloChange = Math.round(K * (actualAttacker - expectedAttacker));
    const defenderEloChange = -attackerEloChange;

    // 판정 결과 생성
    const judgment = generateJudgment(
      isAttackerWinner,
      attackerCharacter,
      defenderCharacter,
      attackerText,
      defenderText,
      attackerScore,
      defenderScore
    );

    return NextResponse.json({
      success: true,
      data: {
        winnerId,
        judgment,
        reasoning: `공격자 점수: ${attackerScore}, 방어자 점수: ${defenderScore}`,
        scoreChanges: {
          attackerScoreChange,
          defenderScoreChange,
          attackerEloChange,
          defenderEloChange
        },
        details: {
          attackerScore,
          defenderScore,
          moderationResults: {
            attacker: attackerModeration,
            defender: defenderModeration
          }
        }
      }
    });

  } catch (error) {
    console.error('AI 판정 오류:', error);
    return NextResponse.json({
      success: false,
      error: 'AI 판정 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}

// 내용 검열 함수
function moderateContent(text: string) {
  const violations = [];
  
  // 부적절한 단어 검사
  for (const word of INAPPROPRIATE_WORDS) {
    if (text.includes(word)) {
      violations.push(`부적절한 단어: ${word}`);
    }
  }

  return {
    isAppropriate: violations.length === 0,
    violations,
    cleanText: text // 실제로는 필터링된 텍스트를 반환
  };
}

// 배틀 텍스트 평가 함수
function evaluateBattleText(text: string, character: any): number {
  let score = 50; // 기본 점수

  // 긍정적인 단어로 점수 증가
  for (const word of POSITIVE_WORDS) {
    if (text.includes(word)) {
      score += 10;
    }
  }

  // 텍스트 길이 보너스 (적절한 길이)
  if (text.length >= 50 && text.length <= 200) {
    score += 10;
  } else if (text.length < 20) {
    score -= 10; // 너무 짧은 경우 감점
  }

  // 동물 특성과 관련된 단어 보너스
  const animalKeywords = ['강력한', '빠른', '용감한', '똑똑한', '귀여운'];
  for (const keyword of animalKeywords) {
    if (text.includes(keyword)) {
      score += 5;
    }
  }

  // 창의성 점수 (느낌표, 의성어 등)
  if (text.includes('!')) score += 5;
  if (text.includes('?')) score += 3;
  if (/[ㅋㅎㅊㅇ]{2,}/.test(text)) score += 5; // 의성어/의태어

  return Math.max(0, Math.min(100, score)); // 0-100 사이로 제한
}

// 판정 결과 생성 함수
function generateJudgment(
  isAttackerWinner: boolean,
  attackerCharacter: any,
  defenderCharacter: any,
  attackerText: string,
  defenderText: string,
  attackerScore: number,
  defenderScore: number
): string {
  const winner = isAttackerWinner ? attackerCharacter : defenderCharacter;
  const loser = isAttackerWinner ? defenderCharacter : attackerCharacter;
  const winnerText = isAttackerWinner ? attackerText : defenderText;

  const judgmentTemplates = [
    `${winner.character_name}의 ${winnerText.length > 100 ? '정말 멋진' : '창의적인'} 표현이 승리를 가져다주었어요! 🏆`,
    `와! ${winner.character_name}의 용기와 상상력이 빛났네요! ${loser.character_name}도 정말 잘했어요! 👏`,
    `${winner.character_name}이 이번 배틀에서 승리했어요! 두 친구 모두 훌륭한 배틀이었습니다! ✨`,
    `${winner.character_name}의 특별한 능력이 돋보였어요! ${loser.character_name}도 다음엔 더 멋질 거예요! 🌟`
  ];

  return judgmentTemplates[Math.floor(Math.random() * judgmentTemplates.length)];
}