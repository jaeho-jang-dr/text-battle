'use client';

import { useState } from 'react';

export default function HelpButton() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 left-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="도움말"
      >
        ❓
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">도움말</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-bold mb-2">게임 방법</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>동물 캐릭터를 만들어 배틀에 참여하세요</li>
                  <li>하루에 최대 10번의 배틀이 가능합니다</li>
                  <li>봇과의 배틀은 무제한입니다</li>
                  <li>창의적인 텍스트로 상대방을 설득해보세요</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold mb-2">규칙</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>착한 말만 사용해주세요</li>
                  <li>다른 친구들을 존중해주세요</li>
                  <li>재미있게 놀아요!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}