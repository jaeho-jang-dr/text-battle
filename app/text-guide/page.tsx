'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const examples = [
  {
    animal: '🦁 사자',
    text: '나는 정글의 왕! 용감하고 강력한 사자다. 모든 동물들이 나를 존경한다. 내 포효 소리는 온 초원을 울린다! 누구도 나를 이길 수 없어!',
    good: true,
    points: [
      '캐릭터의 정체성이 명확함',
      '자신감 있는 표현',
      '동물의 특징을 잘 살림',
      '100자 이내로 간결함'
    ]
  },
  {
    animal: '🦄 유니콘',
    text: '마법의 숲에서 온 신비로운 유니콘! 내 뿔은 무지개빛으로 빛나고 치유의 힘을 가지고 있어. 순수한 마음만이 나를 볼 수 있지! 모두에게 행복을 전해줄게!',
    good: true,
    points: [
      '상상력이 풍부함',
      '긍정적인 메시지',
      '전설적 특성을 잘 표현',
      '친근한 어투'
    ]
  },
  {
    animal: '🦖 티라노사우루스',
    text: '크아아아! 공룡의 왕이 왔다! 내 강력한 턱과 날카로운 이빨로 모든 것을 부술버릴 수 있어. 백악기 최강의 포식자가 바로 나다!',
    good: true,
    points: [
      '고생대 동물의 특징 표현',
      '강력한 이미지 전달',
      '아이들에게 인기 있는 공룡',
      '조금 무서울 수 있지만 적절함'
    ]
  },
  {
    animal: '🦐 아노말로카리스',
    text: '챙챙! 고대 바다의 지배자다! 거대한 집게로 모든 것을 잡아버릴 수 있어. 캄브리아기 바다의 최강 포식자가 바로 나야!',
    good: true,
    points: [
      '희귀한 고생대 동물 소개',
      '독특한 특징을 잘 살림',
      '교육적인 가치가 있음',
      '창의적인 표현'
    ]
  },
  {
    animal: '🐧 펭귄',
    text: '안녕',
    good: false,
    points: [
      '너무 짧음 (최소 10자 필요)',
      '캐릭터 특징이 없음',
      '재미가 없음',
      '배틀에 적합하지 않음'
    ]
  }
];

export default function TextGuidePage() {
  const router = useRouter();
  const [currentExample, setCurrentExample] = useState(0);
  const [userText, setUserText] = useState('');

  const example = examples[currentExample];

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">✍️ 배틀 텍스트 작성 가이드</h1>
              <p className="text-purple-200">멋진 배틀 텍스트를 작성하는 방법을 배워보세요!</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-white/20 hover:bg-white/30 backdrop-blur px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105"
            >
              🏠 홈으로 돌아가기
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* 규칙 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">📏 배틀 텍스트 규칙</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                <span className="text-2xl">✅</span> 이렇게 작성하세요
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>10자 이상 100자 이내</strong>로 작성</li>
                <li>• 캐릭터의 <strong>특징과 개성</strong>을 표현</li>
                <li>• <strong>자신감 있고 재미있는</strong> 표현 사용</li>
                <li>• 동물의 <strong>고유한 능력</strong>을 언급</li>
                <li>• <strong>긍정적이고 창의적인</strong> 내용</li>
              </ul>
            </div>
            <div className="bg-red-50 rounded-2xl p-6">
              <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                <span className="text-2xl">❌</span> 이런 건 피하세요
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• 너무 짧거나 긴 텍스트</li>
                <li>• 욕설이나 부적절한 표현</li>
                <li>• 의미 없는 반복 문자</li>
                <li>• 다른 캐릭터 비하</li>
                <li>• 폭력적이거나 무서운 내용</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* 예제 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">🌟 예제로 배우기</h2>
          
          {/* 예제 카드 */}
          <div className={`rounded-2xl p-6 mb-6 ${example.good ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-5xl">{example.animal}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  example.good ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {example.good ? '좋은 예' : '나쁜 예'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {example.text.length}/100자
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 mb-4">
              <p className="text-gray-800 leading-relaxed">{example.text}</p>
            </div>
            
            <div className="space-y-2">
              {example.points.map((point, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className={example.good ? 'text-green-600' : 'text-red-600'}>
                    {example.good ? '✓' : '✗'}
                  </span>
                  <span className="text-gray-700">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 예제 네비게이션 */}
          <div className="flex justify-center gap-2">
            {examples.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentExample(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  currentExample === index 
                    ? 'bg-purple-500 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* 연습하기 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">💪 직접 연습해보기</h2>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">
              배틀 텍스트를 작성해보세요:
            </label>
            <textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value.slice(0, 100))}
              placeholder="예: 나는 번개처럼 빠른 치타! 누구도 나를 따라잡을 수 없어. 초원의 스피드 킹이 바로 나야!"
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none resize-none h-32"
            />
            <div className="flex justify-between mt-2">
              <span className={`text-sm ${
                userText.length < 10 ? 'text-red-600' : 
                userText.length > 100 ? 'text-red-600' : 'text-green-600'
              }`}>
                {userText.length}/100자 {userText.length < 10 && '(최소 10자 필요)'}
              </span>
              {userText.length >= 10 && userText.length <= 100 && (
                <span className="text-sm text-green-600">✨ 좋아요!</span>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => router.push('/create-character')}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              🎮 캐릭터 만들러 가기
            </button>
            <button
              onClick={() => setUserText('')}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-all duration-200"
            >
              초기화
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}