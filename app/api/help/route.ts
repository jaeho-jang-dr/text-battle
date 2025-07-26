import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse } from '@/lib/api-helpers';

// ❓ 도움말 콘텐츠 조회 API - 언제든 도움을 받을 수 있어요!
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page');
    const section = searchParams.get('section');
    const search = searchParams.get('search');

    let query = supabase
      .from('help_contents')
      .select('*');

    // 페이지별 필터링
    if (page) {
      query = query.eq('page', page);
    }

    // 섹션별 필터링
    if (section) {
      query = query.eq('section', section);
    }

    // 검색
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: helpContents, error } = await query
      .order('order_index', { ascending: true });

    if (error) {
      console.error('도움말 조회 오류:', error);
      // 데이터베이스 오류 시 기본 도움말 제공
      return apiResponse(
        {
          contents: getDefaultHelpContents(page),
          source: 'default'
        },
        '기본 도움말을 보여드릴게요! 📚'
      );
    }

    // 데이터베이스에 도움말이 없으면 기본 도움말 제공
    if (!helpContents || helpContents.length === 0) {
      return apiResponse(
        {
          contents: getDefaultHelpContents(page),
          source: 'default'
        },
        '도움말을 준비했어요! 📖'
      );
    }

    // 페이지별로 그룹화
    const grouped = helpContents.reduce((acc, item) => {
      if (!acc[item.page]) {
        acc[item.page] = {};
      }
      if (!acc[item.page][item.section]) {
        acc[item.page][item.section] = [];
      }
      acc[item.page][item.section].push(item);
      return acc;
    }, {} as any);

    return apiResponse(
      {
        contents: page ? helpContents : grouped,
        total: helpContents.length,
        tips: [
          '💡 모르는 게 있으면 언제든 물어보세요!',
          '🤗 어려운 건 부모님께 도움을 요청하세요!',
          '📚 튜토리얼도 꼭 해보세요!'
        ]
      },
      '도움말을 찾았어요! 도움이 되길 바라요 🌟'
    );

  } catch (error) {
    console.error('도움말 조회 에러:', error);
    return errorResponse('도움말을 불러오는 중 문제가 발생했어요!', 500);
  }
}

// 기본 도움말 콘텐츠
function getDefaultHelpContents(page?: string | null) {
  const allHelp = {
    home: [
      {
        page: 'home',
        section: '시작하기',
        title: '🎮 Kid Text Battle에 오신 걸 환영해요!',
        content: '동물 친구들과 함께 재미있는 텍스트 배틀을 즐겨보세요! 먼저 회원가입을 하고, 동물을 선택한 다음, 친구들과 배틀을 시작해보세요.',
        emoji: '🌟',
        order_index: 1
      },
      {
        page: 'home',
        section: '시작하기',
        title: '🦁 첫 번째 동물 친구',
        content: '회원가입을 하면 사자 친구를 선물로 받아요! 사자와 함께 모험을 시작해보세요.',
        emoji: '🎁',
        order_index: 2
      }
    ],
    signup: [
      {
        page: 'signup',
        section: '회원가입',
        title: '📝 회원가입 방법',
        content: '닉네임, 이메일, 비밀번호, 나이를 입력하고 좋아하는 동물 아바타를 선택하세요!',
        emoji: '✏️',
        order_index: 1
      },
      {
        page: 'signup',
        section: '회원가입',
        title: '🔐 안전한 비밀번호',
        content: '비밀번호는 6자 이상으로 만들어주세요. 다른 사람이 모르는 비밀번호를 사용하세요!',
        emoji: '🔑',
        order_index: 2
      },
      {
        page: 'signup',
        section: '부모님 동의',
        title: '👨‍👩‍👧 13세 미만 친구들',
        content: '13세 미만 친구들은 부모님의 이메일이 필요해요. 부모님께 허락을 받고 가입해주세요!',
        emoji: '💌',
        order_index: 3
      }
    ],
    login: [
      {
        page: 'login',
        section: '로그인',
        title: '🔑 로그인 방법',
        content: '닉네임 또는 이메일과 비밀번호를 입력하면 돼요!',
        emoji: '🚪',
        order_index: 1
      },
      {
        page: 'login',
        section: '로그인',
        title: '🤔 비밀번호를 잊었어요',
        content: '비밀번호를 잊었다면 부모님께 도움을 요청하세요!',
        emoji: '🆘',
        order_index: 2
      }
    ],
    battle: [
      {
        page: 'battle',
        section: '배틀 방법',
        title: '⚔️ 배틀 시작하기',
        content: '1. 동물을 선택해요\n2. 상대를 고르세요\n3. 200자 이내로 멋진 이야기를 써요\n4. 배틀 시작!',
        emoji: '🎯',
        order_index: 1
      },
      {
        page: 'battle',
        section: '배틀 팁',
        title: '💡 승리 비결',
        content: '길고 창의적인 텍스트를 쓸수록 유리해요! 동물의 특성을 살린 이야기를 만들어보세요.',
        emoji: '🏆',
        order_index: 2
      },
      {
        page: 'battle',
        section: '배틀 팁',
        title: '🧠 스탯의 의미',
        content: '힘: 공격력\n방어: 받는 데미지 감소\n속도: 선공 확률\n지능: 전략 보너스',
        emoji: '📊',
        order_index: 3
      }
    ],
    animals: [
      {
        page: 'animals',
        section: '동물 카테고리',
        title: '🦁 현존 동물',
        content: '실제로 살아있는 동물들이에요! 사자, 코끼리, 돌고래 등 40종류가 있어요.',
        emoji: '🌍',
        order_index: 1
      },
      {
        page: 'animals',
        section: '동물 카테고리',
        title: '🐉 신화/상상의 동물',
        content: '전설 속 멋진 동물들이에요! 용, 유니콘, 불사조 등 25종류가 있어요.',
        emoji: '✨',
        order_index: 2
      },
      {
        page: 'animals',
        section: '동물 카테고리',
        title: '🦖 선사시대 동물',
        content: '공룡과 고대 동물들이에요! 티라노사우루스, 매머드 등 25종류가 있어요.',
        emoji: '🦴',
        order_index: 3
      },
      {
        page: 'animals',
        section: '동물 카테고리',
        title: '🎨 커스텀 동물',
        content: '플레이어가 직접 만든 특별한 동물들이에요! 여러분도 만들 수 있어요.',
        emoji: '🖌️',
        order_index: 4
      }
    ],
    achievements: [
      {
        page: 'achievements',
        section: '업적',
        title: '🏆 업적이란?',
        content: '특별한 목표를 달성하면 받는 상이에요! 업적을 달성하면 보상도 받을 수 있어요.',
        emoji: '🎯',
        order_index: 1
      },
      {
        page: 'achievements',
        section: '업적',
        title: '🎁 업적 보상',
        content: '업적을 달성하면 새로운 동물, 아바타, 칭호 등을 받을 수 있어요!',
        emoji: '🎉',
        order_index: 2
      }
    ],
    admin: [
      {
        page: 'admin',
        section: '관리자',
        title: '👑 관리자란?',
        content: '게임을 관리하고 친구들을 도와주는 특별한 역할이에요.',
        emoji: '⚙️',
        order_index: 1
      },
      {
        page: 'admin',
        section: '관리자',
        title: '🛡️ 관리자 기능',
        content: '사용자 관리, 동물 추가, 배틀 기록 확인, 업적 설정 등을 할 수 있어요.',
        emoji: '🔧',
        order_index: 2
      }
    ]
  };

  if (page && allHelp[page as keyof typeof allHelp]) {
    return allHelp[page as keyof typeof allHelp];
  }

  // 모든 도움말 반환
  return Object.values(allHelp).flat();
}

// 🆘 도움 요청 API - 관리자에게 도움을 요청해요
export async function POST(req: NextRequest) {
  try {
    const { valid, data, error } = await validateRequest(req, {});
    if (!valid) {
      return errorResponse(error || 'badRequest', 400);
    }

    const { userId, question, page } = data;

    if (!question) {
      return errorResponse('질문을 입력해주세요! 💭', 400);
    }

    // 도움 요청 저장 (실제로는 별도 테이블 필요)
    const helpRequest = {
      id: crypto.randomUUID(),
      userId,
      question,
      page,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // TODO: 관리자에게 알림 전송

    return apiResponse(
      {
        request: helpRequest,
        message: '도움 요청이 전송되었어요!',
        tips: [
          '💌 관리자님이 곧 답변해주실 거예요!',
          '⏰ 보통 1일 이내에 답변이 와요',
          '🤗 그동안 튜토리얼을 다시 해보는 건 어때요?'
        ]
      },
      '도움 요청을 받았어요! 곧 답변해드릴게요 🤝',
      201
    );

  } catch (error) {
    console.error('도움 요청 에러:', error);
    return errorResponse('도움 요청 중 문제가 발생했어요!', 500);
  }
}