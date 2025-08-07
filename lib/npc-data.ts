export interface NPCData {
  name: string;
  battleChat: string;
  eloScore: number;
}

export const npcCharacters: NPCData[] = [
  // Beginner NPCs (800-1000 ELO)
  {
    name: "초보검사",
    battleChat: "검술을 배우고 있어요. 최선을 다하겠습니다!",
    eloScore: 800
  },
  {
    name: "견습마법사",
    battleChat: "마법의 기초를 익히는 중입니다. 열심히 하겠어요!",
    eloScore: 850
  },
  {
    name: "신참모험가",
    battleChat: "모험을 시작한 지 얼마 안 됐어요. 잘 부탁드려요!",
    eloScore: 900
  },
  {
    name: "수련생",
    battleChat: "매일 훈련하고 있습니다. 화이팅!",
    eloScore: 950
  },

  // Intermediate NPCs (1000-1200 ELO)
  {
    name: "용병단장",
    battleChat: "수많은 전투를 경험했다. 각오해라!",
    eloScore: 1000
  },
  {
    name: "숙련검객",
    battleChat: "검의 길을 걷는 자, 승부를 걸어라!",
    eloScore: 1050
  },
  {
    name: "원소술사",
    battleChat: "자연의 힘을 다루는 자다. 준비되었나?",
    eloScore: 1100
  },
  {
    name: "그림자암살자",
    battleChat: "어둠 속에서 기다리고 있었다...",
    eloScore: 1150
  },

  // Advanced NPCs (1200-1400 ELO)
  {
    name: "대마법사",
    battleChat: "마법의 정수를 보여주겠다. 각오는 되었나?",
    eloScore: 1200
  },
  {
    name: "검성",
    battleChat: "천 번의 싸움에서 단 한 번도 지지 않았다.",
    eloScore: 1250
  },
  {
    name: "드래곤나이트",
    battleChat: "용의 힘과 함께한다. 두려워하라!",
    eloScore: 1300
  },
  {
    name: "전설의용사",
    battleChat: "수많은 악을 물리친 전설이다. 도전하겠나?",
    eloScore: 1350
  },

  // Elite NPCs (1400-1600 ELO)
  {
    name: "시공술사",
    battleChat: "시간과 공간을 다스리는 자, 운명을 받아들여라.",
    eloScore: 1400
  },
  {
    name: "천상의기사",
    battleChat: "신의 축복을 받은 자다. 정의의 심판을 받아라!",
    eloScore: 1450
  },
  {
    name: "마왕",
    battleChat: "어둠의 지배자다. 절망하라!",
    eloScore: 1500
  },
  {
    name: "고대의현자",
    battleChat: "천년의 지혜로 너를 심판하겠다.",
    eloScore: 1550
  },

  // Legendary NPCs (1600+ ELO)
  {
    name: "신",
    battleChat: "신의 영역에 도전하는가? 흥미롭군.",
    eloScore: 1600
  },
  {
    name: "창조자",
    battleChat: "모든 것의 시작이자 끝이다. 각오는 되었나?",
    eloScore: 1700
  },
  {
    name: "운명의수호자",
    battleChat: "운명의 실을 조종한다. 너의 운명은 이미 정해졌다.",
    eloScore: 1800
  },
  {
    name: "무한의존재",
    battleChat: "시작도 끝도 없는 존재. 영원을 마주할 준비는 되었나?",
    eloScore: 2000
  }
];