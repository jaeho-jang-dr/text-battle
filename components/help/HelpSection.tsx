'use client';

import { useState } from 'react';

interface HelpItem {
  question: string;
  answer: string;
}

interface HelpSectionProps {
  title: string;
  items: HelpItem[];
  defaultOpen?: boolean;
}

export default function HelpSection({ title, items, defaultOpen = false }: HelpSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
      {/* 섹션 헤더 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-gradient-to-r from-yellow-100 to-orange-100 hover:from-yellow-200 hover:to-orange-200 transition-colors duration-200 flex items-center justify-between"
      >
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">❓</span>
          {title}
        </h3>
        <span className={`text-2xl transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ⬇️
        </span>
      </button>

      {/* 섹션 내용 */}
      {isOpen && (
        <div className="p-4 space-y-3">
          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between text-left"
              >
                <span className="font-medium text-gray-700">{item.question}</span>
                <span className="text-xl">
                  {openItems.includes(index) ? '⬆️' : '⬇️'}
                </span>
              </button>
              
              {openItems.includes(index) && (
                <div className="p-3 bg-blue-50 text-gray-700 animate-slide-down">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}