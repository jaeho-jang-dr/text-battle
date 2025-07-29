import { Animal } from '@/types';

export const animals: Animal[] = [
  // 현존 동물들
  {
    id: 1,
    name: "Lion",
    koreanName: "사자",
    category: "current",
    emoji: "🦁",
    description: "백수의 왕! 용감하고 강한 동물이에요",
    detailedInfo: {
      habitat: "아프리카 초원에 살아요",
      food: "고기를 먹는 육식동물이에요",
      speciality: "큰 소리로 으르렁거릴 수 있어요",
      funFact: "수컷 사자만 갈기가 있어요!"
    },
    stats: {
      power: 90,
      defense: 70,
      speed: 80
    },
    battleCry: "크아앙! 나는 백수의 왕이다!"
  },
  {
    id: 2,
    name: "Elephant",
    koreanName: "코끼리",
    category: "current",
    emoji: "🐘",
    description: "지구에서 가장 큰 육지 동물이에요",
    detailedInfo: {
      habitat: "아프리카와 아시아의 초원과 숲",
      food: "풀과 나뭇잎을 먹는 초식동물",
      speciality: "긴 코로 물건을 잡을 수 있어요",
      funFact: "하루에 300kg의 음식을 먹어요!"
    },
    stats: {
      power: 85,
      defense: 95,
      speed: 40
    },
    battleCry: "뿌우우! 내 코의 힘을 보여주겠어!"
  },
  {
    id: 3,
    name: "Penguin",
    koreanName: "펭귄",
    category: "current",
    emoji: "🐧",
    description: "날지 못하지만 수영을 잘하는 새예요",
    detailedInfo: {
      habitat: "남극의 추운 곳에 살아요",
      food: "물고기와 크릴새우를 먹어요",
      speciality: "물속에서 빠르게 수영할 수 있어요",
      funFact: "펭귄은 짝을 평생 사랑해요!"
    },
    stats: {
      power: 50,
      defense: 60,
      speed: 70
    },
    battleCry: "끼야아! 미끄러운 얼음 위에서도 넘어지지 않아!"
  },
  {
    id: 4,
    name: "Dolphin",
    koreanName: "돌고래",
    category: "current",
    emoji: "🐬",
    description: "똑똑하고 친근한 바다 친구예요",
    detailedInfo: {
      habitat: "따뜻한 바다에 살아요",
      food: "작은 물고기와 오징어를 먹어요",
      speciality: "초음파로 대화할 수 있어요",
      funFact: "돌고래는 거울을 보고 자신을 알아봐요!"
    },
    stats: {
      power: 60,
      defense: 50,
      speed: 90
    },
    battleCry: "끼끼끼! 바다의 천재가 왔다!"
  },

  // 전설의 동물들
  {
    id: 5,
    name: "Unicorn",
    koreanName: "유니콘",
    category: "legend",
    emoji: "🦄",
    description: "이마에 뿔이 하나 달린 마법의 말이에요",
    detailedInfo: {
      habitat: "마법의 숲 깊은 곳에 살아요",
      food: "무지개와 달빛을 먹고 살아요",
      speciality: "뿔로 마법을 쓸 수 있어요",
      funFact: "유니콘의 뿔은 모든 병을 치료할 수 있대요!"
    },
    stats: {
      power: 75,
      defense: 80,
      speed: 85
    },
    battleCry: "히힝! 마법의 힘을 보여줄게!"
  },
  {
    id: 6,
    name: "Dragon",
    koreanName: "드래곤",
    category: "legend",
    emoji: "🐉",
    description: "불을 뿜는 거대한 날개 달린 도마뱀이에요",
    detailedInfo: {
      habitat: "높은 산꼭대기 동굴에 살아요",
      food: "보물을 좋아하고 가끔 양을 먹어요",
      speciality: "하늘을 날고 불을 뿜을 수 있어요",
      funFact: "드래곤은 100년을 살 수 있대요!"
    },
    stats: {
      power: 95,
      defense: 85,
      speed: 75
    },
    battleCry: "크르르르! 내 불꽃을 맛봐라!"
  },
  {
    id: 7,
    name: "Phoenix",
    koreanName: "불사조",
    category: "legend",
    emoji: "🔥🦅",
    description: "불에서 다시 태어나는 신비한 새예요",
    detailedInfo: {
      habitat: "화산 근처의 뜨거운 곳에 살아요",
      food: "계피와 몰약을 먹어요",
      speciality: "죽어도 다시 살아날 수 있어요",
      funFact: "500년마다 한 번씩 다시 태어나요!"
    },
    stats: {
      power: 80,
      defense: 70,
      speed: 95
    },
    battleCry: "치르르륵! 불꽃 속에서 다시 태어났다!"
  },

  // 고생대 동물들
  {
    id: 8,
    name: "Tyrannosaurus",
    koreanName: "티라노사우루스",
    category: "prehistoric",
    emoji: "🦖",
    description: "가장 무서운 육식 공룡이에요",
    detailedInfo: {
      habitat: "중생대 백악기 시대에 살았어요",
      food: "다른 공룡들을 잡아먹었어요",
      speciality: "엄청나게 강한 턱 힘을 가졌어요",
      funFact: "티라노의 이빨은 바나나만큼 길어요!"
    },
    stats: {
      power: 100,
      defense: 80,
      speed: 60
    },
    battleCry: "크아아아! 공룡의 왕이 왔다!"
  },
  {
    id: 9,
    name: "Triceratops",
    koreanName: "트리케라톱스",
    category: "prehistoric",
    emoji: "🦕",
    description: "뿔이 세 개 달린 초식 공룡이에요",
    detailedInfo: {
      habitat: "백악기 시대의 평원에 살았어요",
      food: "낮은 식물들을 먹었어요",
      speciality: "뿔로 자신을 지킬 수 있어요",
      funFact: "목 주변의 프릴로 체온을 조절했어요!"
    },
    stats: {
      power: 70,
      defense: 90,
      speed: 50
    },
    battleCry: "흐음! 내 세 개의 뿔을 조심해!"
  },
  {
    id: 10,
    name: "Pteranodon",
    koreanName: "프테라노돈",
    category: "prehistoric",
    emoji: "🦅",
    description: "하늘을 나는 거대한 익룡이에요",
    detailedInfo: {
      habitat: "백악기 시대의 바닷가에 살았어요",
      food: "물고기를 잡아먹었어요",
      speciality: "날개를 펴면 7미터나 돼요",
      funFact: "프테라노돈은 이빨이 없었어요!"
    },
    stats: {
      power: 65,
      defense: 45,
      speed: 100
    },
    battleCry: "끼에에엑! 하늘의 지배자다!"
  }
];

// 카테고리별 동물 가져오기
export const getAnimalsByCategory = (category: Animal['category']) => {
  return animals.filter(animal => animal.category === category);
};

// ID로 동물 가져오기
export const getAnimalById = (id: number) => {
  return animals.find(animal => animal.id === id);
};