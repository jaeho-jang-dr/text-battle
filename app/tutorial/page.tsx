"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface TutorialStep {
  id: number;
  title: string;
  emoji: string;
  content: string;
  tips: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "게임 시작하기",
    emoji: "🎮",
    content: "동물 친구들 배틀에 오신 것을 환영해요! 먼저 회원가입을 하고 멋진 닉네임을 정해주세요.",
    tips: [
      "닉네임은 한글이나 영어로 만들 수 있어요",
      "나이는 7살부터 15살까지 입력할 수 있어요",
      "좋아하는 동물 아바타를 골라보세요"
    ]
  },
  {
    id: 2,
    title: "동물 친구 선택하기",
    emoji: "🦁",
    content: "처음에는 사자 친구를 선물로 받아요! 배틀에서 이기면 더 많은 동물 친구들을 만날 수 있어요.",
    tips: [
      "동물마다 공격력, 방어력, 속도가 달라요",
      "동물 도감에서 모든 동물들을 구경할 수 있어요",
      "레벨이 올라가면 더 강해져요"
    ]
  },
  {
    id: 3,
    title: "배틀 방법",
    emoji: "⚔️",
    content: "상대와 번갈아가며 공격해요. 텍스트로 멋진 공격을 써보세요!",
    tips: [
      "최대 200자까지 공격 텍스트를 쓸 수 있어요",
      "'강한', '파워' 같은 단어를 쓰면 데미지가 올라가요",
      "'필살'이라고 쓰면 크리티컬 확률이 높아져요",
      "방어를 하면 데미지를 줄이고 HP를 조금 회복해요"
    ]
  },
  {
    id: 4,
    title: "특수 공격",
    emoji: "💥",
    content: "각 동물마다 고유한 필살기가 있어요! 적절한 타이밍에 사용해보세요.",
    tips: [
      "필살기는 항상 크리티컬 데미지를 줘요",
      "동물마다 다른 배틀 크라이가 있어요",
      "상대가 방어 중일 때는 데미지가 줄어들어요"
    ]
  },
  {
    id: 5,
    title: "승리와 보상",
    emoji: "🏆",
    content: "배틀에서 이기면 경험치를 얻고 랭킹이 올라가요!",
    tips: [
      "승리하면 50 경험치를 받아요",
      "경험치가 쌓이면 레벨이 올라가요",
      "랭킹 TOP 25에 들어가면 리더보드에 이름이 올라가요",
      "승률이 높을수록 랭킹이 올라가요"
    ]
  },
  {
    id: 6,
    title: "팁과 전략",
    emoji: "💡",
    content: "배틀에서 이기는 비법을 알려드릴게요!",
    tips: [
      "상대의 HP가 낮을 때 필살기를 사용해요",
      "긴 문장을 쓸수록 데미지가 커져요",
      "가끔은 방어로 HP를 회복하는 것도 좋아요",
      "동물의 능력치를 잘 활용해보세요"
    ]
  }
];

export default function TutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = tutorialSteps[currentStep];

  return (
    <main className="min-h-screen p-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="flex items-center gap-2">
          <button className="bg-kid-blue text-white p-3 rounded-full shadow-lg hover:scale-110 transition">
            <span className="text-2xl">←</span>
          </button>
          <h1 className="text-title">게임 방법 🎓</h1>
        </Link>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="bg-kid-yellow p-3 rounded-full shadow-lg hover:scale-110 transition"
        >
          <span className="text-2xl">❓</span>
        </button>
      </div>

      {/* 도움말 풍선 */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="help-bubble top-24 right-4 max-w-xs"
        >
          <p className="text-gray-800">
            🦉 게임하는 방법을 차근차근 배워봐요!<br/>
            화살표를 눌러서 다음 단계로 넘어갈 수 있어요.
          </p>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* 진행 바 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-600">
              {currentStep + 1} / {tutorialSteps.length}
            </span>
            <span className="text-sm font-bold text-gray-600">
              {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}% 완료
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              className="bg-kid-blue h-3 rounded-full"
            />
          </div>
        </div>

        {/* 튜토리얼 내용 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="card-animal p-8 mb-8"
          >
            {/* 단계 헤더 */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-8xl block mb-4">{step.emoji}</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-800">
                {step.title}
              </h2>
            </div>

            {/* 설명 */}
            <div className="bg-kid-yellow rounded-lg p-6 mb-6">
              <p className="text-lg text-gray-800">
                {step.content}
              </p>
            </div>

            {/* 팁 목록 */}
            <div className="space-y-3">
              {step.tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 bg-white rounded-lg p-4"
                >
                  <span className="text-2xl">💡</span>
                  <p className="text-gray-700">{tip}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 네비게이션 버튼 */}
        <div className="flex justify-between items-center">
          <motion.button
            onClick={prevStep}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-3 rounded-full font-bold transition ${
              currentStep === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-kid-blue text-white hover:brightness-110'
            }`}
            disabled={currentStep === 0}
          >
            ← 이전
          </motion.button>

          {/* 단계 인디케이터 */}
          <div className="flex gap-2">
            {tutorialSteps.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setCurrentStep(index)}
                whileHover={{ scale: 1.2 }}
                className={`w-3 h-3 rounded-full transition ${
                  index === currentStep
                    ? 'bg-kid-blue'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {currentStep === tutorialSteps.length - 1 ? (
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-kid-green text-white px-6 py-3 rounded-full font-bold hover:brightness-110 transition"
              >
                시작하기! 🎮
              </motion.button>
            </Link>
          ) : (
            <motion.button
              onClick={nextStep}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-kid-blue text-white px-6 py-3 rounded-full font-bold hover:brightness-110 transition"
            >
              다음 →
            </motion.button>
          )}
        </div>

        {/* 예시 이미지 섹션 (선택적) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="card-animal inline-block p-6">
            <p className="text-gray-700">
              🎯 튜토리얼을 완료하면 게임을 더 재미있게 즐길 수 있어요!
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}