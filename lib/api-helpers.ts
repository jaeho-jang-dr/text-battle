// 🌟 API 헬퍼 함수들 - 아이들에게 친근한 응답을 만들어요!

import { NextResponse } from 'next/server';

// 친절한 에러 메시지들
export const friendlyErrors = {
  notFound: '앗! 찾을 수 없어요 😢 다시 한번 확인해주세요!',
  unauthorized: '이런! 먼저 로그인이 필요해요 🔑',
  forbidden: '미안해요, 이곳은 들어갈 수 없어요 🚫',
  badRequest: '어라? 뭔가 잘못된 것 같아요. 다시 시도해주세요! 🤔',
  serverError: '우리 서버가 잠시 졸고 있나봐요... 조금만 기다려주세요! 😴',
  tooManyRequests: '너무 빨라요! 천천히 해주세요 🐢',
};

// 성공 메시지 생성기
export const successMessage = (action: string) => {
  const messages = [
    `${action} 완료! 정말 잘했어요! 🎉`,
    `${action} 성공! 대단해요! ⭐`,
    `와! ${action} 해냈어요! 🌟`,
    `${action} 완료! 멋져요! 👏`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

// API 응답 포맷터
export const apiResponse = (
  data: any,
  message?: string,
  status: number = 200
) => {
  return NextResponse.json(
    {
      success: status < 400,
      message: message || (status < 400 ? '성공했어요! 🎉' : friendlyErrors.serverError),
      data,
      timestamp: new Date().toISOString(),
      emoji: status < 400 ? '😊' : '😢',
    },
    { status }
  );
};

// 에러 응답 포맷터
export const errorResponse = (
  error: string | Error,
  status: number = 500
) => {
  const message = error instanceof Error ? error.message : error;
  const friendlyMessage = friendlyErrors[message as keyof typeof friendlyErrors] || message;
  
  return NextResponse.json(
    {
      success: false,
      message: friendlyMessage,
      error: process.env.NODE_ENV === 'development' ? message : undefined,
      timestamp: new Date().toISOString(),
      emoji: '😢',
      helpTip: '도움이 필요하면 부모님이나 선생님께 물어보세요! 🤗',
    },
    { status }
  );
};

// 권한 체크 헬퍼
export const checkAuth = (req: Request): { userId?: string; role?: string } | null => {
  // 실제 구현에서는 JWT 토큰 검증 등을 수행
  // 여기서는 간단한 예시로 헤더 체크
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  
  // Bearer token 파싱
  const token = authHeader.replace('Bearer ', '');
  // TODO: 실제 토큰 검증 로직 구현
  
  return { userId: 'dummy-user-id', role: 'player' };
};

// 요청 검증 헬퍼
export const validateRequest = async (
  req: Request,
  schema: any
): Promise<{ valid: boolean; data?: any; error?: string }> => {
  try {
    const body = await req.json();
    // TODO: 실제 스키마 검증 로직 구현 (예: zod, yup 등)
    return { valid: true, data: body };
  } catch (error) {
    return { valid: false, error: '올바른 형식이 아니에요!' };
  }
};

// 속도 제한 헬퍼 (간단한 메모리 기반)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean => {
  const now = Date.now();
  const userLimit = requestCounts.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
};

// 아이들을 위한 로깅 헬퍼
export const kidLog = (action: string, userId?: string, details?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
    emoji: '📝',
    message: `${action} 기록이 저장되었어요!`,
  };
  
  // 실제로는 로깅 서비스로 전송
  if (process.env.NODE_ENV === 'development') {
    console.log('🌈 Kid Log:', logEntry);
  }
  
  return logEntry;
};