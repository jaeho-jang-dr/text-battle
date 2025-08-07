// 동물 특성에 따른 스탯 생성
export interface AnimalStats {
  hp: number;      // 체력
  power: number;   // 공격력
  defense: number; // 방어력
  speed: number;   // 속도
  special: number; // 특수능력
}

export interface AnimalCharacteristics {
  baseStats: AnimalStats;
  ability: string;
  description: string;
}

// 동물별 기본 특성 정의
export const animalCharacteristics: Record<string, AnimalCharacteristics> = {
  // 현존하는 동물들 - 50종
  '사자': {
    baseStats: { hp: 85, power: 95, defense: 70, speed: 75, special: 85 },
    ability: '왕의 포효',
    description: '백수의 왕! 강력한 공격력과 리더십'
  },
  '호랑이': {
    baseStats: { hp: 90, power: 98, defense: 75, speed: 80, special: 82 },
    ability: '맹호출격',
    description: '최강의 포식자! 압도적인 파워'
  },
  '코끼리': {
    baseStats: { hp: 98, power: 85, defense: 95, speed: 40, special: 70 },
    ability: '거대한 돌진',
    description: '엄청난 체력과 방어력의 소유자'
  },
  '기린': {
    baseStats: { hp: 75, power: 60, defense: 65, speed: 85, special: 90 },
    ability: '높은 시야',
    description: '긴 목으로 모든 것을 내려다본다'
  },
  '하마': {
    baseStats: { hp: 95, power: 88, defense: 85, speed: 45, special: 65 },
    ability: '물속의 폭군',
    description: '물에서는 무적! 강력한 턱'
  },
  '코뿔소': {
    baseStats: { hp: 92, power: 90, defense: 92, speed: 50, special: 68 },
    ability: '철갑 돌진',
    description: '두꺼운 가죽과 날카로운 뿔'
  },
  '곰': {
    baseStats: { hp: 88, power: 92, defense: 80, speed: 55, special: 75 },
    ability: '동면의 힘',
    description: '강력한 앞발과 지구력'
  },
  '늑대': {
    baseStats: { hp: 70, power: 80, defense: 65, speed: 90, special: 88 },
    ability: '무리 사냥',
    description: '팀워크의 달인, 빠른 속도'
  },
  '여우': {
    baseStats: { hp: 65, power: 70, defense: 60, speed: 95, special: 95 },
    ability: '교활한 속임수',
    description: '영리하고 재빠른 트릭스터'
  },
  '판다': {
    baseStats: { hp: 85, power: 75, defense: 78, speed: 60, special: 80 },
    ability: '대나무 파워',
    description: '귀여운 외모에 숨은 힘'
  },
  '코알라': {
    baseStats: { hp: 70, power: 55, defense: 75, speed: 40, special: 85 },
    ability: '유칼립투스 치유',
    description: '느긋하지만 특별한 능력 보유'
  },
  '캥거루': {
    baseStats: { hp: 75, power: 85, defense: 65, speed: 92, special: 78 },
    ability: '강력한 발차기',
    description: '점프와 킥의 달인'
  },
  '펭귄': {
    baseStats: { hp: 72, power: 65, defense: 70, speed: 85, special: 82 },
    ability: '얼음 미끄럼',
    description: '물속에서는 번개처럼 빠르다'
  },
  '독수리': {
    baseStats: { hp: 68, power: 88, defense: 60, speed: 95, special: 90 },
    ability: '하늘의 지배자',
    description: '날카로운 눈과 발톱'
  },
  '올빼미': {
    baseStats: { hp: 65, power: 75, defense: 58, speed: 88, special: 92 },
    ability: '밤의 사냥꾼',
    description: '소리 없는 비행과 야간 시력'
  },
  '앵무새': {
    baseStats: { hp: 60, power: 65, defense: 55, speed: 85, special: 98 },
    ability: '따라하기',
    description: '똑똑하고 말을 따라한다'
  },
  '플라밍고': {
    baseStats: { hp: 68, power: 60, defense: 62, speed: 80, special: 88 },
    ability: '우아한 춤',
    description: '아름다운 핑크빛 춤꾼'
  },
  '상어': {
    baseStats: { hp: 85, power: 95, defense: 75, speed: 88, special: 80 },
    ability: '피의 추적자',
    description: '바다의 최강 포식자'
  },
  '돌고래': {
    baseStats: { hp: 75, power: 72, defense: 68, speed: 92, special: 95 },
    ability: '초음파 공격',
    description: '똑똑하고 친근한 바다 친구'
  },
  '고래': {
    baseStats: { hp: 99, power: 80, defense: 88, speed: 60, special: 85 },
    ability: '거대한 파도',
    description: '바다의 거인, 엄청난 크기'
  },
  '해마': {
    baseStats: { hp: 55, power: 60, defense: 65, speed: 75, special: 90 },
    ability: '보호의 춤',
    description: '작지만 특별한 바다 생물'
  },
  '문어': {
    baseStats: { hp: 70, power: 78, defense: 65, speed: 80, special: 96 },
    ability: '먹물 연막',
    description: '8개의 다리로 변신의 귀재'
  },
  '게': {
    baseStats: { hp: 65, power: 82, defense: 90, speed: 55, special: 72 },
    ability: '집게 가드',
    description: '단단한 껍질과 강력한 집게'
  },
  '거북이': {
    baseStats: { hp: 80, power: 65, defense: 95, speed: 35, special: 78 },
    ability: '철벽 방어',
    description: '느리지만 든든한 방어력'
  },
  '악어': {
    baseStats: { hp: 88, power: 93, defense: 82, speed: 65, special: 75 },
    ability: '죽음의 회전',
    description: '강력한 턱과 회전 공격'
  },
  '카멜레온': {
    baseStats: { hp: 62, power: 68, defense: 60, speed: 70, special: 99 },
    ability: '위장술',
    description: '색깔을 바꾸는 마법사'
  },
  '이구아나': {
    baseStats: { hp: 70, power: 72, defense: 75, speed: 65, special: 80 },
    ability: '꼬리 채찍',
    description: '강력한 꼬리 공격'
  },
  '개구리': {
    baseStats: { hp: 60, power: 65, defense: 55, speed: 88, special: 85 },
    ability: '독액 분사',
    description: '점프력과 특수 공격'
  },
  '나비': {
    baseStats: { hp: 45, power: 50, defense: 40, speed: 90, special: 95 },
    ability: '환상의 춤',
    description: '아름답고 신비로운 변신'
  },
  '벌': {
    baseStats: { hp: 50, power: 75, defense: 45, speed: 85, special: 88 },
    ability: '독침 공격',
    description: '작지만 무서운 공격력'
  },
  '개미': {
    baseStats: { hp: 40, power: 70, defense: 55, speed: 80, special: 92 },
    ability: '군단의 힘',
    description: '협력과 조직력의 달인'
  },
  '거미': {
    baseStats: { hp: 55, power: 78, defense: 50, speed: 82, special: 90 },
    ability: '거미줄 함정',
    description: '은밀한 사냥꾼'
  },
  '전갈': {
    baseStats: { hp: 65, power: 85, defense: 70, speed: 75, special: 85 },
    ability: '맹독 꼬리',
    description: '치명적인 독침 공격'
  },
  '말': {
    baseStats: { hp: 75, power: 78, defense: 68, speed: 95, special: 75 },
    ability: '질주본능',
    description: '빠른 속도와 지구력'
  },
  '양': {
    baseStats: { hp: 65, power: 55, defense: 72, speed: 60, special: 70 },
    ability: '양털 방어',
    description: '포근한 양털로 보호'
  },
  '염소': {
    baseStats: { hp: 68, power: 70, defense: 65, speed: 78, special: 75 },
    ability: '암벽 등반',
    description: '어디든 올라가는 등반가'
  },
  '돼지': {
    baseStats: { hp: 75, power: 72, defense: 70, speed: 55, special: 68 },
    ability: '진흙 방어',
    description: '똑똑하고 튼튼한 체력'
  },
  '소': {
    baseStats: { hp: 82, power: 80, defense: 78, speed: 48, special: 65 },
    ability: '황소 돌진',
    description: '강인한 힘과 끈기'
  },
  '닭': {
    baseStats: { hp: 55, power: 65, defense: 50, speed: 70, special: 75 },
    ability: '날개치기',
    description: '새벽을 알리는 투사'
  },
  '오리': {
    baseStats: { hp: 60, power: 58, defense: 55, speed: 75, special: 80 },
    ability: '물갈퀴 수영',
    description: '물과 하늘을 자유롭게'
  },
  '백조': {
    baseStats: { hp: 65, power: 62, defense: 60, speed: 82, special: 88 },
    ability: '우아한 날개',
    description: '아름답고 우아한 새'
  },
  '토끼': {
    baseStats: { hp: 58, power: 60, defense: 52, speed: 96, special: 82 },
    ability: '번개 점프',
    description: '귀엽고 빠른 점프 마스터'
  },
  '다람쥐': {
    baseStats: { hp: 52, power: 58, defense: 48, speed: 92, special: 85 },
    ability: '도토리 저장',
    description: '재빠르고 영리한 수집가'
  },
  '햄스터': {
    baseStats: { hp: 48, power: 52, defense: 45, speed: 85, special: 80 },
    ability: '볼주머니',
    description: '귀여운 볼주머니 저장고'
  },
  '고슴도치': {
    baseStats: { hp: 60, power: 65, defense: 85, speed: 65, special: 78 },
    ability: '가시 방어',
    description: '뾰족한 가시로 완벽 방어'
  },
  '너구리': {
    baseStats: { hp: 68, power: 70, defense: 65, speed: 75, special: 82 },
    ability: '도둑 손',
    description: '영리한 손재주꾼'
  },
  '수달': {
    baseStats: { hp: 65, power: 68, defense: 62, speed: 85, special: 88 },
    ability: '물놀이 달인',
    description: '물속에서 자유자재'
  },
  '비버': {
    baseStats: { hp: 70, power: 72, defense: 75, speed: 60, special: 85 },
    ability: '댐 건설',
    description: '자연의 건축가'
  },
  '오소리': {
    baseStats: { hp: 72, power: 75, defense: 78, speed: 65, special: 75 },
    ability: '땅굴 파기',
    description: '땅속의 강자'
  },
  '족제비': {
    baseStats: { hp: 55, power: 72, defense: 50, speed: 90, special: 85 },
    ability: '민첩한 사냥',
    description: '작고 빠른 사냥꾼'
  },

  // 신화/전설의 동물들 - 15종
  '용': {
    baseStats: { hp: 95, power: 98, defense: 90, speed: 85, special: 99 },
    ability: '드래곤 브레스',
    description: '전설의 최강 생물! 불을 뿜는다'
  },
  '불사조': {
    baseStats: { hp: 88, power: 90, defense: 85, speed: 92, special: 98 },
    ability: '부활의 불꽃',
    description: '죽음에서 다시 태어나는 불멸의 새'
  },
  '유니콘': {
    baseStats: { hp: 85, power: 82, defense: 80, speed: 95, special: 96 },
    ability: '정화의 뿔',
    description: '순수함의 상징, 마법의 뿔'
  },
  '그리핀': {
    baseStats: { hp: 88, power: 92, defense: 85, speed: 90, special: 88 },
    ability: '하늘의 왕',
    description: '독수리와 사자의 결합체'
  },
  '페가수스': {
    baseStats: { hp: 80, power: 78, defense: 75, speed: 98, special: 92 },
    ability: '천상의 날개',
    description: '날개 달린 천마'
  },
  '히드라': {
    baseStats: { hp: 92, power: 88, defense: 82, speed: 70, special: 95 },
    ability: '재생의 머리',
    description: '머리가 9개인 불사의 뱀'
  },
  '케르베로스': {
    baseStats: { hp: 90, power: 95, defense: 88, speed: 75, special: 85 },
    ability: '지옥의 파수꾼',
    description: '머리 셋 달린 지옥의 개'
  },
  '미노타우로스': {
    baseStats: { hp: 92, power: 96, defense: 85, speed: 65, special: 78 },
    ability: '미궁의 힘',
    description: '소머리를 가진 괴물'
  },
  '켄타우로스': {
    baseStats: { hp: 82, power: 85, defense: 75, speed: 92, special: 88 },
    ability: '궁술의 달인',
    description: '반인반마의 현자'
  },
  '하피': {
    baseStats: { hp: 70, power: 78, defense: 65, speed: 95, special: 90 },
    ability: '폭풍의 날개',
    description: '새의 날개를 가진 정령'
  },
  '사이렌': {
    baseStats: { hp: 72, power: 70, defense: 68, speed: 80, special: 98 },
    ability: '매혹의 노래',
    description: '아름다운 노래로 유혹하는 인어'
  },
  '바실리스크': {
    baseStats: { hp: 85, power: 88, defense: 80, speed: 75, special: 92 },
    ability: '석화의 눈',
    description: '눈을 마주치면 돌이 되는 뱀'
  },
  '만티코어': {
    baseStats: { hp: 86, power: 90, defense: 78, speed: 82, special: 88 },
    ability: '독침 꼬리',
    description: '사자 몸에 전갈 꼬리'
  },
  '피닉스': {
    baseStats: { hp: 85, power: 88, defense: 82, speed: 90, special: 96 },
    ability: '불사의 화염',
    description: '불타는 전설의 새'
  },
  '키메라': {
    baseStats: { hp: 88, power: 92, defense: 80, speed: 78, special: 90 },
    ability: '삼중 공격',
    description: '사자, 염소, 뱀의 합체'
  },

  // 고생대 동물들 - 15종
  '티라노사우루스': {
    baseStats: { hp: 95, power: 99, defense: 85, speed: 70, special: 80 },
    ability: '공포의 포효',
    description: '육식공룡의 왕! 최강의 턱'
  },
  '브라키오사우루스': {
    baseStats: { hp: 98, power: 82, defense: 88, speed: 45, special: 72 },
    ability: '거대한 체구',
    description: '긴 목의 거대 초식공룡'
  },
  '트리케라톱스': {
    baseStats: { hp: 90, power: 85, defense: 92, speed: 55, special: 75 },
    ability: '삼각 돌진',
    description: '세 개의 뿔로 방어와 공격'
  },
  '벨로시랩터': {
    baseStats: { hp: 72, power: 88, defense: 65, speed: 96, special: 90 },
    ability: '무리 사냥',
    description: '영리하고 빠른 사냥꾼'
  },
  '프테라노돈': {
    baseStats: { hp: 68, power: 75, defense: 60, speed: 92, special: 88 },
    ability: '하늘의 지배',
    description: '거대한 날개의 익룡'
  },
  '스테고사우루스': {
    baseStats: { hp: 85, power: 78, defense: 95, speed: 48, special: 78 },
    ability: '가시 꼬리',
    description: '등판의 골판과 꼬리 가시'
  },
  '안킬로사우루스': {
    baseStats: { hp: 88, power: 80, defense: 98, speed: 40, special: 72 },
    ability: '철갑 방어',
    description: '몸 전체가 갑옷인 탱크'
  },
  '파키케팔로사우루스': {
    baseStats: { hp: 78, power: 85, defense: 88, speed: 65, special: 75 },
    ability: '박치기',
    description: '단단한 머리로 박치기'
  },
  '디플로도쿠스': {
    baseStats: { hp: 92, power: 75, defense: 78, speed: 50, special: 80 },
    ability: '채찍 꼬리',
    description: '긴 꼬리를 채찍처럼 사용'
  },
  '알로사우루스': {
    baseStats: { hp: 85, power: 92, defense: 78, speed: 78, special: 82 },
    ability: '사냥의 본능',
    description: '쥐라기의 최강 포식자'
  },
  '스피노사우루스': {
    baseStats: { hp: 90, power: 94, defense: 82, speed: 72, special: 85 },
    ability: '수중 사냥',
    description: '등지느러미를 가진 거대 육식공룡'
  },
  '모사사우루스': {
    baseStats: { hp: 88, power: 90, defense: 75, speed: 85, special: 88 },
    ability: '바다의 폭군',
    description: '바다를 지배한 거대 파충류'
  },
  '아르켈론': {
    baseStats: { hp: 82, power: 70, defense: 92, speed: 65, special: 78 },
    ability: '거대한 등껍질',
    description: '고대의 거대 바다거북'
  },
  '메갈로돈': {
    baseStats: { hp: 92, power: 98, defense: 82, speed: 80, special: 85 },
    ability: '거대한 턱',
    description: '역사상 최대의 상어'
  },
  '틸라코스밀루스': {
    baseStats: { hp: 80, power: 90, defense: 72, speed: 85, special: 82 },
    ability: '검치 공격',
    description: '검치를 가진 고대 포유류'
  }
};

// 랜덤 스탯 변화 적용 (개체별 차이)
export function generateRandomStats(baseStats: AnimalStats): AnimalStats {
  const variance = 0.1; // 10% 변화
  
  return {
    hp: Math.round(baseStats.hp * (1 + (Math.random() - 0.5) * variance)),
    power: Math.round(baseStats.power * (1 + (Math.random() - 0.5) * variance)),
    defense: Math.round(baseStats.defense * (1 + (Math.random() - 0.5) * variance)),
    speed: Math.round(baseStats.speed * (1 + (Math.random() - 0.5) * variance)),
    special: Math.round(baseStats.special * (1 + (Math.random() - 0.5) * variance))
  };
}

// 총 전투력 계산
export function calculateTotalPower(stats: AnimalStats): number {
  return stats.hp + stats.power + stats.defense + stats.speed + stats.special;
}

// 스탯을 기반으로 등급 결정
export function getStatGrade(totalPower: number): { grade: string; color: string } {
  if (totalPower >= 450) return { grade: 'S', color: 'text-yellow-500' };
  if (totalPower >= 420) return { grade: 'A+', color: 'text-purple-500' };
  if (totalPower >= 390) return { grade: 'A', color: 'text-purple-400' };
  if (totalPower >= 360) return { grade: 'B+', color: 'text-blue-500' };
  if (totalPower >= 330) return { grade: 'B', color: 'text-blue-400' };
  if (totalPower >= 300) return { grade: 'C+', color: 'text-green-500' };
  if (totalPower >= 270) return { grade: 'C', color: 'text-green-400' };
  return { grade: 'D', color: 'text-gray-500' };
}