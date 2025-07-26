import { Animal, BattleTurn } from '@/types';

export interface BattleState {
  player1: {
    animal: Animal;
    hp: number;
    maxHp: number;
    isDefending: boolean;
  };
  player2: {
    animal: Animal;
    hp: number;
    maxHp: number;
    isDefending: boolean;
  };
  currentTurn: 'player1' | 'player2';
  turnCount: number;
  battleLog: BattleTurn[];
  isFinished: boolean;
  winner?: 'player1' | 'player2';
}

// HP 계산 (레벨과 방어력 기반)
export const calculateMaxHp = (animal: Animal, level: number = 1): number => {
  return 100 + (animal.stats.defense * 2) + (level * 10);
};

// 데미지 계산
export const calculateDamage = (
  attacker: Animal,
  defender: Animal,
  isDefending: boolean,
  isCritical: boolean = false
): number => {
  const baseDamage = attacker.stats.power;
  const defense = defender.stats.defense * (isDefending ? 1.5 : 1);
  const speedBonus = attacker.stats.speed > defender.stats.speed ? 1.1 : 1;
  
  let damage = Math.max(5, Math.floor((baseDamage * speedBonus) - (defense * 0.5)));
  
  if (isCritical) {
    damage = Math.floor(damage * 1.5);
  }
  
  // 랜덤 요소 추가 (±10%)
  const variance = 0.9 + Math.random() * 0.2;
  return Math.floor(damage * variance);
};

// 크리티컬 확률 계산
export const calculateCriticalChance = (animal: Animal): boolean => {
  const baseChance = 0.1; // 10% 기본 확률
  const speedBonus = animal.stats.speed / 1000; // 속도 보너스
  return Math.random() < (baseChance + speedBonus);
};

// 배틀 초기화
export const initializeBattle = (
  player1Animal: Animal,
  player2Animal: Animal,
  player1Level: number = 1,
  player2Level: number = 1
): BattleState => {
  const player1MaxHp = calculateMaxHp(player1Animal, player1Level);
  const player2MaxHp = calculateMaxHp(player2Animal, player2Level);
  
  // 속도가 빠른 쪽이 선공
  const firstTurn = player1Animal.stats.speed >= player2Animal.stats.speed ? 'player1' : 'player2';
  
  return {
    player1: {
      animal: player1Animal,
      hp: player1MaxHp,
      maxHp: player1MaxHp,
      isDefending: false
    },
    player2: {
      animal: player2Animal,
      hp: player2MaxHp,
      maxHp: player2MaxHp,
      isDefending: false
    },
    currentTurn: firstTurn,
    turnCount: 1,
    battleLog: [{
      player: firstTurn,
      action: 'special',
      message: `${firstTurn === 'player1' ? player1Animal.koreanName : player2Animal.koreanName}의 선공!`
    }],
    isFinished: false
  };
};

// 텍스트 기반 공격 처리
export const processTextAttack = (
  state: BattleState,
  attackText: string,
  isPlayer1: boolean
): BattleState => {
  const attacker = isPlayer1 ? state.player1 : state.player2;
  const defender = isPlayer1 ? state.player2 : state.player1;
  const attackerName = attacker.animal.koreanName;
  const defenderName = defender.animal.koreanName;
  
  // 텍스트 길이와 특수 키워드 기반 데미지 계산
  const textLength = attackText.length;
  const baseMultiplier = Math.min(textLength / 200, 1); // 최대 200자
  
  // 특수 키워드 체크
  const powerKeywords = ['강한', '파워', '공격', '때리다', '치다', '물다'];
  const defenseKeywords = ['방어', '막다', '보호', '지키다'];
  const speedKeywords = ['빠른', '재빠른', '신속', '번개'];
  
  let keywordBonus = 1;
  powerKeywords.forEach(keyword => {
    if (attackText.includes(keyword)) keywordBonus += 0.1;
  });
  
  // 크리티컬 판정
  const isCritical = calculateCriticalChance(attacker.animal) || attackText.includes('필살');
  
  // 데미지 계산
  const baseDamage = calculateDamage(
    attacker.animal,
    defender.animal,
    defender.isDefending,
    isCritical
  );
  
  const finalDamage = Math.floor(baseDamage * baseMultiplier * keywordBonus);
  
  // 새로운 상태 생성
  const newState = { ...state };
  
  // HP 감소
  if (isPlayer1) {
    newState.player2.hp = Math.max(0, newState.player2.hp - finalDamage);
  } else {
    newState.player1.hp = Math.max(0, newState.player1.hp - finalDamage);
  }
  
  // 배틀 로그 추가
  let message = `${attackerName}의 공격! "${attackText}"`;
  if (isCritical) message += ' 💥크리티컬 히트!';
  message += ` ${defenderName}에게 ${finalDamage}의 데미지!`;
  
  newState.battleLog.push({
    player: isPlayer1 ? 'player1' : 'player2',
    action: 'attack',
    message,
    damage: finalDamage
  });
  
  // 방어 상태 해제
  newState.player1.isDefending = false;
  newState.player2.isDefending = false;
  
  // 승부 판정
  if (newState.player1.hp <= 0) {
    newState.isFinished = true;
    newState.winner = 'player2';
    newState.battleLog.push({
      player: 'player2',
      action: 'special',
      message: `${state.player2.animal.koreanName}의 승리! 🏆`
    });
  } else if (newState.player2.hp <= 0) {
    newState.isFinished = true;
    newState.winner = 'player1';
    newState.battleLog.push({
      player: 'player1',
      action: 'special',
      message: `${state.player1.animal.koreanName}의 승리! 🏆`
    });
  } else {
    // 턴 교체
    newState.currentTurn = isPlayer1 ? 'player2' : 'player1';
    newState.turnCount++;
  }
  
  return newState;
};

// 방어 액션
export const processDefend = (
  state: BattleState,
  isPlayer1: boolean
): BattleState => {
  const newState = { ...state };
  const defender = isPlayer1 ? newState.player1 : newState.player2;
  const defenderName = defender.animal.koreanName;
  
  // 방어 상태 설정
  if (isPlayer1) {
    newState.player1.isDefending = true;
  } else {
    newState.player2.isDefending = true;
  }
  
  // HP 회복 (소량)
  const healAmount = Math.floor(defender.maxHp * 0.05);
  if (isPlayer1) {
    newState.player1.hp = Math.min(newState.player1.maxHp, newState.player1.hp + healAmount);
  } else {
    newState.player2.hp = Math.min(newState.player2.maxHp, newState.player2.hp + healAmount);
  }
  
  newState.battleLog.push({
    player: isPlayer1 ? 'player1' : 'player2',
    action: 'defend',
    message: `${defenderName}가 방어 자세를 취했다! HP가 ${healAmount} 회복되었다.`
  });
  
  // 턴 교체
  newState.currentTurn = isPlayer1 ? 'player2' : 'player1';
  newState.turnCount++;
  
  return newState;
};

// 특수 공격
export const processSpecialAttack = (
  state: BattleState,
  isPlayer1: boolean
): BattleState => {
  const attacker = isPlayer1 ? state.player1 : state.player2;
  const defender = isPlayer1 ? state.player2 : state.player1;
  
  // 특수 공격은 항상 크리티컬
  const damage = calculateDamage(
    attacker.animal,
    defender.animal,
    defender.isDefending,
    true
  );
  
  const newState = { ...state };
  
  // HP 감소
  if (isPlayer1) {
    newState.player2.hp = Math.max(0, newState.player2.hp - damage);
  } else {
    newState.player1.hp = Math.max(0, newState.player1.hp - damage);
  }
  
  // 배틀 로그 추가
  newState.battleLog.push({
    player: isPlayer1 ? 'player1' : 'player2',
    action: 'special',
    message: `${attacker.animal.battleCry} 💥 특수 공격으로 ${damage}의 데미지!`,
    damage
  });
  
  // 방어 상태 해제
  newState.player1.isDefending = false;
  newState.player2.isDefending = false;
  
  // 승부 판정
  if (newState.player1.hp <= 0) {
    newState.isFinished = true;
    newState.winner = 'player2';
    newState.battleLog.push({
      player: 'player2',
      action: 'special',
      message: `${state.player2.animal.koreanName}의 승리! 🏆`
    });
  } else if (newState.player2.hp <= 0) {
    newState.isFinished = true;
    newState.winner = 'player1';
    newState.battleLog.push({
      player: 'player1',
      action: 'special',
      message: `${state.player1.animal.koreanName}의 승리! 🏆`
    });
  } else {
    // 턴 교체
    newState.currentTurn = isPlayer1 ? 'player2' : 'player1';
    newState.turnCount++;
  }
  
  return newState;
};