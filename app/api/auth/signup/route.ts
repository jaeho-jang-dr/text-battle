import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { apiResponse, errorResponse, validateRequest, rateLimiter, kidLog } from '@/lib/api-helpers';

// 🎉 회원가입 API - 새로운 친구가 되어주세요!
export async function POST(req: NextRequest) {
  try {
    // IP 기반 속도 제한
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    if (!rateLimiter(`signup:${ip}`, 3, 600000)) { // 10분에 3번
      return errorResponse('너무 많이 시도했어요! 10분 후에 다시 해주세요 ⏰', 429);
    }

    // 요청 데이터 검증
    const { valid, data, error } = await validateRequest(req, {});
    if (!valid) {
      return errorResponse(error || 'badRequest', 400);
    }

    const { 
      username, 
      email, 
      password, 
      age, 
      avatar = '🦁',
      parentEmail 
    } = data;

    // 필수 필드 확인
    if (!username || !password || !age) {
      return errorResponse('필수 정보를 입력해주세요! 📝', 400);
    }

    // 나이 검증
    const userAge = parseInt(age);
    if (isNaN(userAge) || userAge < 7 || userAge > 15) {
      return errorResponse('7살부터 15살까지의 친구들만 가입할 수 있어요! 🎂', 400);
    }

    // 13세 미만 부모 동의 확인
    if (userAge < 13 && !parentEmail) {
      return errorResponse('13세 미만은 부모님 이메일이 필요해요! 👨‍👩‍👧', 400);
    }

    // 13세 이상은 이메일 필수
    if (userAge >= 13 && !email) {
      return errorResponse('13세 이상은 이메일이 필요해요! 📧', 400);
    }

    // 비밀번호 강도 확인 (13세 이상만)
    if (userAge >= 13 && password.length < 6) {
      return errorResponse('비밀번호는 6자 이상으로 만들어주세요! 🔐', 400);
    }

    // 13세 미만은 간단한 비밀번호 허용
    if (userAge < 13 && password.length < 4) {
      return errorResponse('비밀번호는 4자 이상으로 만들어주세요! 🔐', 400);
    }

    // 이메일 형식 확인 (이메일이 있는 경우만)
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return errorResponse('올바른 이메일 주소를 입력해주세요! 📧', 400);
      }
    }

    // 중복 확인
    let duplicateQuery = supabase
      .from('users')
      .select('id, username, email');
    
    // 이메일이 있는 경우에만 이메일 중복 체크
    if (email) {
      duplicateQuery = duplicateQuery.or(`username.eq.${username},email.eq.${email}`);
    } else {
      duplicateQuery = duplicateQuery.eq('username', username);
    }

    const { data: existing } = await duplicateQuery;

    if (existing && existing.length > 0) {
      const isDuplicateUsername = existing.some(u => u.username === username);
      const isDuplicateEmail = email ? existing.some(u => u.email === email) : false;
      
      if (isDuplicateUsername && isDuplicateEmail) {
        return errorResponse('이미 가입된 계정이에요! 로그인해주세요 😊', 409);
      } else if (isDuplicateUsername) {
        return errorResponse('이 닉네임은 이미 사용중이에요! 다른 멋진 이름을 정해주세요 🦄', 409);
      } else if (isDuplicateEmail) {
        return errorResponse('이 이메일은 이미 사용중이에요! 🔑', 409);
      }
    }

    // 비밀번호 암호화
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 자동 로그인 토큰 생성
    const { randomUUID } = await import('crypto');
    const autoLoginToken = randomUUID();

    // 사용자 생성
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{
        username,
        email,
        password_hash: passwordHash,
        age: userAge,
        avatar,
        parent_email: userAge < 13 ? parentEmail : null,
        role: 'player',
        is_active: true,
        play_time_limit: 60, // 기본 60분
        auto_login_token: autoLoginToken,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('사용자 생성 오류:', createError);
      return errorResponse('회원가입 중 문제가 발생했어요. 다시 시도해주세요! 🔄', 500);
    }

    // 첫 번째 동물 친구 추가 (사자)
    const { error: animalError } = await supabase
      .from('user_animals')
      .insert([{
        user_id: newUser.id,
        animal_id: 1, // 사자
        nickname: `${username}의 첫 친구`,
        level: 1,
        experience: 0,
        battles_won: 0,
        battles_lost: 0
      }]);

    if (animalError) {
      console.error('동물 추가 오류:', animalError);
    }

    // 13세 미만인 경우 부모 승인 요청 생성 (테이블이 있는 경우만)
    if (userAge < 13 && parentEmail) {
      try {
        // Node.js 환경에서 안전하게 UUID 생성
        const { randomUUID } = await import('crypto');
        const approvalToken = randomUUID();
        await supabase
          .from('parent_approvals')
          .insert([{
            child_id: newUser.id,
            parent_email: parentEmail,
            approval_type: 'registration',
            approval_data: { username, age: userAge },
            token: approvalToken,
            is_approved: false
          }]);

        // TODO: 부모님께 이메일 전송
      } catch (parentApprovalError) {
        // parent_approvals 테이블이 없어도 회원가입은 계속 진행
        console.log('부모 승인 요청 생성 실패 (선택사항):', parentApprovalError);
      }
    }

    // 민감한 정보 제거
    const { password_hash, ...safeUser } = newUser;

    kidLog('회원가입 성공', newUser.id, { username, age: userAge });

    // 환영 메시지 생성
    const welcomeMessages = [
      `${username}님, 동물 친구들의 세계에 오신 걸 환영해요! 🎊`,
      `와! ${username}님이 우리의 새로운 친구가 되었어요! 🌟`,
      `${username}님, 멋진 모험이 기다리고 있어요! 🚀`,
    ];

    return apiResponse(
      {
        user: safeUser,
        autoLoginToken,
        firstAnimal: {
          name: '사자',
          emoji: '🦁',
          message: '안녕! 난 너의 첫 번째 동물 친구야! 함께 모험하자!'
        },
        tips: [
          '🎮 튜토리얼을 먼저 해보세요!',
          '🦁 더 많은 동물 친구를 모아보세요!',
          '⚔️ 다른 친구들과 배틀을 즐겨보세요!',
          '🏆 멋진 업적을 달성해보세요!'
        ]
      },
      welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
      201
    );

  } catch (error) {
    console.error('회원가입 에러:', error);
    return errorResponse('회원가입 중 문제가 발생했어요. 잠시 후 다시 시도해주세요!', 500);
  }
}