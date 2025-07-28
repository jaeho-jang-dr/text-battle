import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

// 창의성 평가 키워드
const CREATIVE_ELEMENTS = [
  '마법', '모험', '비밀', '보물', '꿈', '상상',
  '무지개', '별', '우주', '바다', '하늘', '구름'
];

interface JudgmentCriteria {
  creativity: number;        // 창의성 (0-30)
  appropriateness: number;   // 적절성 (0-30)
  positivity: number;       // 긍정성 (0-20)
  relevance: number;        // 관련성 (0-20)
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({
        success: false,
        error: '인증이 필요합니다'
      }, { status: 401 });
    }

    // 시스템 토큰 확인 (내부 API 호출용)
    const systemToken = process.env.SYSTEM_API_TOKEN || 'system-token';
    
    // 시스템 토큰이 아닌 경우 일반 사용자 토큰으로 처리
    if (token !== systemToken) {
      // 사용자 확인
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('login_token', token)
        .gt('token_expires_at', new Date().toISOString())
        .single();

      if (userError || !user) {
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
    const attackerTotal = calculateTotalScore(attackerScore);
    const defenderTotal = calculateTotalScore(defenderScore);
    
    const winner = attackerTotal > defenderTotal ? 'attacker' : 'defender';
    const scoreDifference = Math.abs(attackerTotal - defenderTotal);

    // 판정 이유 생성
    const reasoning = generateReasoning(
      attackerScore, 
      defenderScore, 
      attackerCharacter, 
      defenderCharacter,
      scoreDifference
    );

    // 친근한 판정 메시지
    const judgment = generateKidFriendlyJudgment(
      winner,
      attackerCharacter,
      defenderCharacter,
      scoreDifference
    );

    return NextResponse.json({
      success: true,
      data: {
        winner,
        scores: {
          attacker: {
            total: attackerTotal,
            breakdown: attackerScore
          },
          defender: {
            total: defenderTotal,
            breakdown: defenderScore
          }
        },
        judgment,
        reasoning,
        encouragement: generateEncouragement(winner, scoreDifference)
      }
    });

  } catch (error) {
    console.error('Battle judgment error:', error);
    return NextResponse.json({
      success: false,
      error: '판정 중 오류가 발생했습니다'
    }, { status: 500 });
  }
}

// 콘텐츠 검열 함수
function moderateContent(text: string): { isAppropriate: boolean; issues: string[] } {
  const issues: string[] = [];
  const lowerText = text.toLowerCase();

  // 부적절한 단어 검사
  for (const word of INAPPROPRIATE_WORDS) {
    if (lowerText.includes(word)) {
      issues.push(`부적절한 표현: ${word}`);
    }
  }

  // 텍스트 길이 검사
  if (text.length < 10) {
    issues.push('텍스트가 너무 짧아요. 10자 이상 써주세요!');
  }

  if (text.length > 200) {
    issues.push('텍스트가 너무 길어요. 200자 이내로 써주세요!');
  }

  // 특수문자 남용 검사
  const specialCharCount = (text.match(/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/g) || []).length;
  if (specialCharCount > text.length * 0.2) {
    issues.push('특수문자를 너무 많이 사용했어요');
  }

  return {
    isAppropriate: issues.length === 0,
    issues
  };
}

// 배틀 텍스트 평가 함수
function evaluateBattleText(text: string, character: any): JudgmentCriteria {
  const lowerText = text.toLowerCase();
  
  // 창의성 평가
  let creativity = 15; // 기본 점수
  for (const element of CREATIVE_ELEMENTS) {
    if (lowerText.includes(element)) {
      creativity += 3;
    }
  }
  
  // 문장 다양성 보너스
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
  if (sentences.length >= 3) creativity += 5;
  
  creativity = Math.min(30, creativity);

  // 적절성 평가
  let appropriateness = 30; // 만점에서 시작
  
  // 맞춤법과 띄어쓰기 기본 체크 (실제로는 더 정교한 검사 필요)
  if (text.includes('  ')) appropriateness -= 5; // 연속 공백
  if (!text.match(/[.!?]$/)) appropriateness -= 5; // 문장 부호 없음

  // 긍정성 평가
  let positivity = 10; // 기본 점수
  for (const word of POSITIVE_WORDS) {
    if (lowerText.includes(word)) {
      positivity += 2;
    }
  }
  positivity = Math.min(20, positivity);

  // 관련성 평가 (캐릭터와의 연관성)
  let relevance = 10; // 기본 점수
  
  // 동물 이름이나 특성 언급 시 가산점
  if (character && character.animal) {
    if (lowerText.includes(character.animal.koreanName.toLowerCase())) {
      relevance += 5;
    }
    // 동물 특성 관련 키워드 체크
    if (character.animal.traits) {
      for (const trait of character.animal.traits) {
        if (lowerText.includes(trait)) {
          relevance += 3;
        }
      }
    }
  }
  relevance = Math.min(20, relevance);

  return {
    creativity,
    appropriateness,
    positivity,
    relevance
  };
}

// 총점 계산
function calculateTotalScore(scores: JudgmentCriteria): number {
  return scores.creativity + scores.appropriateness + scores.positivity + scores.relevance;
}

// 판정 이유 생성
function generateReasoning(
  attackerScore: JudgmentCriteria,
  defenderScore: JudgmentCriteria,
  attackerCharacter: any,
  defenderCharacter: any,
  scoreDifference: number
): string {
  const reasons = [];

  // 창의성 비교
  if (attackerScore.creativity > defenderScore.creativity) {
    reasons.push(`${attackerCharacter.characterName}의 이야기가 더 창의적이었어요`);
  } else if (defenderScore.creativity > attackerScore.creativity) {
    reasons.push(`${defenderCharacter.characterName}의 이야기가 더 상상력이 풍부했어요`);
  }

  // 긍정성 비교
  if (attackerScore.positivity > defenderScore.positivity) {
    reasons.push(`${attackerCharacter.characterName}의 텍스트가 더 밝고 긍정적이었어요`);
  } else if (defenderScore.positivity > attackerScore.positivity) {
    reasons.push(`${defenderCharacter.characterName}의 텍스트가 더 따뜻했어요`);
  }

  // 점수 차이에 따른 설명
  if (scoreDifference < 5) {
    reasons.push('정말 박빙의 승부였어요!');
  } else if (scoreDifference < 15) {
    reasons.push('좋은 경쟁이었어요!');
  } else {
    reasons.push('확실한 차이가 있었네요!');
  }

  return reasons.join(' ');
}

// 아동 친화적 판정 메시지 생성
function generateKidFriendlyJudgment(
  winner: string,
  attackerCharacter: any,
  defenderCharacter: any,
  scoreDifference: number
): string {
  const winnerName = winner === 'attacker' 
    ? attackerCharacter.characterName 
    : defenderCharacter.characterName;
  
  const winnerAnimal = winner === 'attacker'
    ? attackerCharacter.animal?.emoji || '🐾'
    : defenderCharacter.animal?.emoji || '🐾';

  if (scoreDifference < 5) {
    return `🎉 와! 정말 치열한 승부 끝에 ${winnerAnimal} ${winnerName}가 아주 조금 앞서서 이겼어요!`;
  } else if (scoreDifference < 15) {
    return `🌟 ${winnerAnimal} ${winnerName}의 멋진 승리! 좋은 경기였어요!`;
  } else {
    return `🏆 ${winnerAnimal} ${winnerName}의 압도적인 승리! 정말 대단해요!`;
  }
}

// 격려 메시지 생성
function generateEncouragement(winner: string, scoreDifference: number): string {
  const loserMessages = [
    '다음엔 꼭 이길 수 있을 거예요! 💪',
    '정말 잘했어요! 조금만 더 연습하면 최고가 될 거예요! ⭐',
    '아쉽지만 정말 멋진 도전이었어요! 🌈',
    '포기하지 마세요! 다음엔 더 잘할 수 있어요! 🎯'
  ];

  const winnerMessages = [
    '축하해요! 정말 잘했어요! 🎊',
    '대단해요! 계속 이렇게 멋진 모습 보여주세요! ✨',
    '최고예요! 다른 친구들도 도와주면 어때요? 🤝',
    '환상적이에요! 당신은 진정한 챔피언이에요! 👑'
  ];

  if (scoreDifference < 5) {
    return '두 분 모두 정말 잘했어요! 다음 배틀도 기대돼요! 🎮';
  }

  return winner === 'attacker' 
    ? winnerMessages[Math.floor(Math.random() * winnerMessages.length)]
    : loserMessages[Math.floor(Math.random() * loserMessages.length)];
}