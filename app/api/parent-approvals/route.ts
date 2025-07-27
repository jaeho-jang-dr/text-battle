import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { apiResponse, errorResponse, checkAuth, validateRequest, kidLog } from '@/lib/api-helpers';
import crypto from 'crypto';

// 👨‍👩‍👧 부모 승인 요청 생성 API
export async function POST(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    const { valid, data, error } = await validateRequest(req, {});
    if (!valid) {
      return errorResponse(error || 'badRequest', 400);
    }

    const { approvalType, parentEmail, approvalData } = data;

    // 승인 타입 검증
    const validTypes = ['registration', 'play_time_extension', 'custom_animal'];
    if (!validTypes.includes(approvalType)) {
      return errorResponse('올바른 승인 타입을 선택해주세요!', 400);
    }

    // 이메일 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!parentEmail || !emailRegex.test(parentEmail)) {
      return errorResponse('올바른 부모님 이메일을 입력해주세요! 📧', 400);
    }

    // 사용자 정보 조회
    const { data: user } = await supabase
      .from('users')
      .select('username, age')
      .eq('id', auth.userId)
      .single();

    if (!user) {
      return errorResponse('사용자 정보를 찾을 수 없어요!', 404);
    }

    // 이미 대기 중인 동일한 요청이 있는지 확인
    const { data: existingRequest } = await supabase
      .from('parent_approvals')
      .select('*')
      .eq('child_id', auth.userId)
      .eq('approval_type', approvalType)
      .eq('is_approved', false)
      .is('approved_at', null)
      .single();

    if (existingRequest) {
      return apiResponse(
        {
          status: 'already_pending',
          requestId: existingRequest.id,
          message: '이미 승인을 기다리고 있어요! 부모님께 확인해달라고 말씀드려보세요! 📧',
          sentTo: parentEmail,
          createdAt: existingRequest.created_at
        },
        '이미 승인 요청이 진행 중이에요!',
        200
      );
    }

    // 승인 토큰 생성
    const token = crypto.randomBytes(32).toString('hex');

    // 승인 요청 데이터 준비
    const requestData = {
      childUsername: user.username,
      childAge: user.age,
      requestTime: new Date().toISOString(),
      ...approvalData
    };

    // 승인 요청 저장
    const { data: approval, error: insertError } = await supabase
      .from('parent_approvals')
      .insert([{
        child_id: auth.userId,
        parent_email: parentEmail,
        approval_type: approvalType,
        approval_data: requestData,
        token,
        is_approved: false
      }])
      .select()
      .single();

    if (insertError) {
      console.error('승인 요청 생성 오류:', insertError);
      return errorResponse('승인 요청을 만드는 중 문제가 발생했어요!', 500);
    }

    // 이메일 발송 (실제로는 이메일 서비스 연동 필요)
    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/parent-approval?token=${token}`;
    
    kidLog('부모 승인 요청', auth.userId, { 
      approvalType,
      parentEmail,
      requestId: approval.id 
    });

    // 승인 타입별 메시지
    const messages = {
      registration: '회원가입 승인 요청을 보냈어요!',
      play_time_extension: '플레이 시간 연장 요청을 보냈어요!',
      custom_animal: '커스텀 동물 생성 승인 요청을 보냈어요!'
    };

    return apiResponse(
      {
        status: 'request_sent',
        requestId: approval.id,
        approvalType,
        message: messages[approvalType as keyof typeof messages],
        parentEmail,
        tips: [
          '📧 부모님께 이메일을 확인해달라고 말씀드려보세요!',
          '⏰ 승인은 보통 24시간 이내에 처리돼요!',
          '💌 부모님과 함께 게임을 즐기면 더 재미있어요!'
        ]
      },
      `부모님께 승인 요청을 보냈어요! ${messages[approvalType as keyof typeof messages]} 📮`,
      201
    );

  } catch (error) {
    console.error('부모 승인 요청 에러:', error);
    return errorResponse('승인 요청을 보내는 중 문제가 발생했어요!', 500);
  }
}

// 📋 승인 요청 목록 조회 API
export async function GET(req: NextRequest) {
  try {
    const auth = checkAuth(req);
    if (!auth) {
      return errorResponse('unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // pending, approved, all

    // 사용자의 승인 요청 조회
    let query = supabase
      .from('parent_approvals')
      .select('*')
      .eq('child_id', auth.userId)
      .order('created_at', { ascending: false });

    if (status === 'pending') {
      query = query.eq('is_approved', false).is('approved_at', null);
    } else if (status === 'approved') {
      query = query.eq('is_approved', true);
    }

    const { data: approvals, error } = await query;

    if (error) {
      console.error('승인 요청 조회 오류:', error);
      return errorResponse('승인 요청을 불러오는 중 문제가 발생했어요!', 500);
    }

    // 승인 요청 포맷팅
    const formattedApprovals = approvals?.map(approval => {
      const typeLabels = {
        registration: '회원가입',
        play_time_extension: '플레이 시간 연장',
        custom_animal: '커스텀 동물 생성'
      };

      const statusInfo = approval.is_approved 
        ? { status: 'approved', emoji: '✅', message: '승인됨' }
        : approval.approved_at 
          ? { status: 'rejected', emoji: '❌', message: '거절됨' }
          : { status: 'pending', emoji: '⏳', message: '대기 중' };

      return {
        id: approval.id,
        type: approval.approval_type,
        typeLabel: typeLabels[approval.approval_type as keyof typeof typeLabels],
        parentEmail: approval.parent_email,
        requestedAt: approval.created_at,
        approvedAt: approval.approved_at,
        ...statusInfo,
        data: approval.approval_data
      };
    }) || [];

    // 통계
    const stats = {
      total: formattedApprovals.length,
      pending: formattedApprovals.filter(a => a.status === 'pending').length,
      approved: formattedApprovals.filter(a => a.status === 'approved').length,
      rejected: formattedApprovals.filter(a => a.status === 'rejected').length
    };

    return apiResponse(
      {
        approvals: formattedApprovals,
        stats,
        hasParentEmail: !!auth.parentEmail,
        tips: stats.pending > 0 ? [
          '📧 부모님께 이메일을 확인해달라고 말씀드려보세요!',
          '💡 승인이 늦어지면 다시 요청을 보낼 수 있어요!',
          '🎮 승인을 기다리는 동안 다른 게임도 즐겨보세요!'
        ] : [
          '👨‍👩‍👧 부모님과 함께 게임을 즐기세요!',
          '🔒 부모님 승인으로 더 안전하게 플레이해요!',
          '💝 가족과 함께하는 시간이 가장 소중해요!'
        ]
      },
      `${formattedApprovals.length}개의 승인 요청이 있어요! ${stats.pending > 0 ? '⏳' : '✅'}`,
      200
    );

  } catch (error) {
    console.error('승인 요청 목록 조회 에러:', error);
    return errorResponse('승인 요청을 불러오는 중 문제가 발생했어요!', 500);
  }
}

// 🔑 부모 승인 처리 API (토큰 기반)
export async function PUT(req: NextRequest) {
  try {
    const { valid, data, error } = await validateRequest(req, {});
    if (!valid) {
      return errorResponse(error || 'badRequest', 400);
    }

    const { token, approved, reason } = data;

    if (!token) {
      return errorResponse('승인 토큰이 필요해요!', 400);
    }

    // 토큰으로 승인 요청 찾기
    const { data: approval } = await supabase
      .from('parent_approvals')
      .select('*, children:users!child_id(username, age)')
      .eq('token', token)
      .single();

    if (!approval) {
      return errorResponse('유효하지 않은 승인 토큰이에요!', 404);
    }

    if (approval.is_approved || approval.approved_at) {
      return apiResponse(
        {
          status: 'already_processed',
          message: '이미 처리된 승인 요청이에요!',
          processedAt: approval.approved_at
        },
        '이미 처리된 요청이에요!',
        200
      );
    }

    // 승인/거절 처리
    const { error: updateError } = await supabase
      .from('parent_approvals')
      .update({
        is_approved: approved,
        approved_at: new Date().toISOString()
      })
      .eq('id', approval.id);

    if (updateError) {
      console.error('승인 처리 오류:', updateError);
      return errorResponse('승인 처리 중 문제가 발생했어요!', 500);
    }

    // 승인 타입별 후속 처리
    if (approved) {
      await handleApprovalActions(approval);
    }

    kidLog('부모 승인 처리', approval.child_id, { 
      approvalType: approval.approval_type,
      approved,
      reason 
    });

    const childName = approval.children?.username || '자녀';
    const message = approved 
      ? `${childName}의 ${getApprovalTypeLabel(approval.approval_type)} 요청을 승인했어요! ✅`
      : `${childName}의 ${getApprovalTypeLabel(approval.approval_type)} 요청을 거절했어요. ❌`;

    return apiResponse(
      {
        status: approved ? 'approved' : 'rejected',
        message,
        childInfo: {
          username: approval.children?.username,
          age: approval.children?.age
        },
        approvalType: approval.approval_type,
        processedAt: new Date().toISOString(),
        nextSteps: approved ? [
          '✅ 자녀가 이제 요청한 기능을 사용할 수 있어요!',
          '📧 확인 이메일이 발송되었어요!',
          '👨‍👩‍👧 자녀와 함께 안전하게 게임을 즐기세요!'
        ] : [
          '❌ 자녀에게 거절 사유를 설명해주세요.',
          '💬 대화를 통해 더 나은 방법을 찾아보세요.',
          '🔄 필요하다면 나중에 다시 요청할 수 있어요.'
        ]
      },
      message,
      200
    );

  } catch (error) {
    console.error('부모 승인 처리 에러:', error);
    return errorResponse('승인 처리 중 문제가 발생했어요!', 500);
  }
}

// 승인 타입별 후속 처리
async function handleApprovalActions(approval: any) {
  switch (approval.approval_type) {
    case 'registration':
      // 회원가입 승인 - 계정 활성화
      await supabase
        .from('users')
        .update({ 
          is_active: true,
          parent_email: approval.parent_email 
        })
        .eq('id', approval.child_id);
      break;

    case 'play_time_extension':
      // 플레이 시간 연장
      const extraTime = approval.approval_data?.requestedMinutes || 30;
      const { data: user } = await supabase
        .from('users')
        .select('play_time_limit')
        .eq('id', approval.child_id)
        .single();
      
      if (user) {
        await supabase
          .from('users')
          .update({ 
            play_time_limit: user.play_time_limit + extraTime 
          })
          .eq('id', approval.child_id);
      }
      break;

    case 'custom_animal':
      // 커스텀 동물 승인
      const animalId = approval.approval_data?.animalId;
      if (animalId) {
        await supabase
          .from('animals')
          .update({ is_approved: true })
          .eq('id', animalId)
          .eq('created_by', approval.child_id);
      }
      break;
  }
}

// 승인 타입 라벨
function getApprovalTypeLabel(type: string): string {
  const labels = {
    registration: '회원가입',
    play_time_extension: '플레이 시간 연장',
    custom_animal: '커스텀 동물 생성'
  };
  return labels[type as keyof typeof labels] || type;
}