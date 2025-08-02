import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiResponse } from '@/types';
import { BattleComparisonResponse } from '@/types/battle-comparison';
import { BattleComparisonAnalyzer } from '@/lib/analytics/battle-comparison';

export async function GET(req: NextRequest) {
  try {
    // 인증 확인
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: '로그인이 필요합니다.'
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

    // 쿼리 파라미터 파싱
    const searchParams = req.nextUrl.searchParams;
    const character1Id = searchParams.get('character1Id');
    const character2Id = searchParams.get('character2Id');
    const includeAchievements = searchParams.get('includeAchievements') === 'true';
    const includeAnalysis = searchParams.get('includeAnalysis') === 'true';
    const includePrediction = searchParams.get('includePrediction') === 'true';
    const includeVisualization = searchParams.get('includeVisualization') === 'true';

    // 필수 파라미터 확인
    if (!character1Id || !character2Id) {
      return NextResponse.json({
        success: false,
        error: '두 캐릭터의 ID가 필요합니다.'
      }, { status: 400 });
    }

    if (character1Id === character2Id) {
      return NextResponse.json({
        success: false,
        error: '같은 캐릭터끼리는 비교할 수 없습니다.'
      }, { status: 400 });
    }

    // 캐릭터 정보 가져오기
    const char1Overview = BattleComparisonAnalyzer.getCharacterOverview(character1Id);
    const char2Overview = BattleComparisonAnalyzer.getCharacterOverview(character2Id);

    if (!char1Overview) {
      return NextResponse.json({
        success: false,
        error: '첫 번째 캐릭터를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    if (!char2Overview) {
      return NextResponse.json({
        success: false,
        error: '두 번째 캐릭터를 찾을 수 없습니다.'
      }, { status: 404 });
    }

    // 권한 확인 - 최소 한 캐릭터는 사용자 소유여야 함
    const char1Owner = await db.prepare('SELECT user_id FROM characters WHERE id = ?').get(character1Id) as any;
    const char2Owner = await db.prepare('SELECT user_id FROM characters WHERE id = ?').get(character2Id) as any;

    if (char1Owner.user_id !== user.id && char2Owner.user_id !== user.id) {
      return NextResponse.json({
        success: false,
        error: '최소 한 캐릭터는 본인 소유여야 합니다.'
      }, { status: 403 });
    }

    // 기본 비교 데이터 수집
    const headToHead = BattleComparisonAnalyzer.getHeadToHeadStats(character1Id, character2Id);
    const stats = BattleComparisonAnalyzer.getStatComparison(character1Id, character2Id);

    // 응답 객체 생성
    const response: BattleComparisonResponse = {
      character1: char1Overview,
      character2: char2Overview,
      headToHead,
      stats,
      insights: []
    };

    // 선택적 데이터 추가
    if (includeAchievements) {
      response.achievements = BattleComparisonAnalyzer.getAchievementComparison(
        character1Id,
        character2Id,
        stats
      );
    }

    if (includeAnalysis) {
      response.analysis = BattleComparisonAnalyzer.analyzeStrengthsWeaknesses(
        character1Id,
        character2Id,
        stats,
        headToHead
      );
    }

    if (includePrediction) {
      response.prediction = BattleComparisonAnalyzer.generatePredictiveAnalysis(
        char1Overview,
        char2Overview,
        stats,
        headToHead
      );
    }

    if (includeVisualization) {
      response.visualization = BattleComparisonAnalyzer.generateVisualizationData(
        character1Id,
        character2Id,
        stats
      );
    }

    // 인사이트 생성 (예측이 있는 경우)
    response.insights = BattleComparisonAnalyzer.generateComparisonInsights(
      char1Overview,
      char2Overview,
      stats,
      headToHead,
      response.prediction || {
        predictedWinner: {
          characterId: character1Id,
          characterName: char1Overview.name,
          probability: 0.5
        },
        factors: [],
        confidence: 'low',
        reasoning: '예측 데이터 없음'
      }
    );

    // 성공 응답
    return NextResponse.json({
      success: true,
      data: response
    } as ApiResponse<BattleComparisonResponse>);

  } catch (error) {
    console.error('Battle comparison error:', error);
    
    // 상세한 에러 로깅
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    
    return NextResponse.json({
      success: false,
      error: '캐릭터 비교 중 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    }, { status: 500 });
  }
}

// POST 메서드 - 빠른 비교 (캐릭터 이름으로)
export async function POST(req: NextRequest) {
  try {
    // 인증 확인
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: '로그인이 필요합니다.'
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

    // 요청 본문 파싱
    const body = await req.json();
    const { character1Name, character2Name } = body;

    if (!character1Name || !character2Name) {
      return NextResponse.json({
        success: false,
        error: '두 캐릭터의 이름이 필요합니다.'
      }, { status: 400 });
    }

    // 캐릭터 ID 찾기
    const char1 = await db.prepare('SELECT id FROM characters WHERE character_name = ?').get(character1Name) as any;
    const char2 = await db.prepare('SELECT id FROM characters WHERE character_name = ?').get(character2Name) as any;

    if (!char1) {
      return NextResponse.json({
        success: false,
        error: `"${character1Name}" 캐릭터를 찾을 수 없습니다.`
      }, { status: 404 });
    }

    if (!char2) {
      return NextResponse.json({
        success: false,
        error: `"${character2Name}" 캐릭터를 찾을 수 없습니다.`
      }, { status: 404 });
    }

    // GET 엔드포인트로 리다이렉트
    const url = new URL(req.url);
    url.searchParams.set('character1Id', char1.id);
    url.searchParams.set('character2Id', char2.id);
    url.searchParams.set('includeAnalysis', 'true');
    url.searchParams.set('includePrediction', 'true');

    return NextResponse.redirect(url, 307);

  } catch (error) {
    console.error('Battle comparison POST error:', error);
    
    return NextResponse.json({
      success: false,
      error: '캐릭터 비교 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}