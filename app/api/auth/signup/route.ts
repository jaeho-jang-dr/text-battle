import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/db/memory-store';

// 캐릭터 스탯 생성 함수
function generateCharacterStats(characterType: string) {
  const baseStats = {
    warrior: {
      health: 120,
      attack: 25,
      defense: 20,
      speed: 15,
      magic: 5,
      critical: 10,
      evasion: 5
    },
    mage: {
      health: 80,
      attack: 15,
      defense: 10,
      speed: 20,
      magic: 30,
      critical: 15,
      evasion: 10
    },
    rogue: {
      health: 100,
      attack: 20,
      defense: 15,
      speed: 25,
      magic: 10,
      critical: 20,
      evasion: 15
    }
  };

  return baseStats[characterType as keyof typeof baseStats] || baseStats.warrior;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, characterType = 'warrior' } = await request.json();

    // 입력 검증
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // 사용자 중복 확인
    const existingUser = await memoryStore.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // 사용자 생성
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: userId,
      email,
      password, // 개발 환경에서는 평문 저장 (프로덕션에서는 반드시 해싱)
      name,
      username: name,
      provider: 'email',
      characterId: undefined as string | undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await memoryStore.createUser(user);

    // 캐릭터 생성
    const stats = generateCharacterStats(characterType);
    const characterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const character = {
      id: characterId,
      userId: userId,
      name: name,
      type: characterType,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      stats: stats,
      wins: 0,
      losses: 0,
      totalBattles: 0,
      winRate: 0,
      rating: 1000,
      dailyBattlesCount: 0,
      lastBattleTime: null,
      isNPC: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await memoryStore.createCharacter(character);

    // 사용자에 캐릭터 ID 연결
    user.characterId = characterId;
    await memoryStore.updateUser(userId, { characterId });

    // 민감한 정보 제거 후 반환
    const { password: _, ...safeUser } = user;

    return NextResponse.json({
      message: 'User created successfully',
      user: safeUser,
      character: character
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}