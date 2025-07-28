'use client';

import { useState } from 'react';

interface HelpButtonProps {
  title: string;
  content: string | string[];
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function HelpButton({ 
  title, 
  content, 
  position = 'top' 
}: HelpButtonProps) {
  const [showHelp, setShowHelp] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 transform -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 transform -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-t-yellow-300',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-b-yellow-300',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-l-yellow-300',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-r-yellow-300'
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowHelp(!showHelp)}
        onMouseEnter={() => setShowHelp(true)}
        onMouseLeave={() => setShowHelp(false)}
        className="w-6 h-6 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-full text-sm font-bold transition-colors duration-200"
        aria-label="도움말"
      >
        ?
      </button>

      {showHelp && (
        <div className={`absolute z-50 ${positionClasses[position]} animate-fade-in`}>
          <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 shadow-lg max-w-xs">
            <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
            {Array.isArray(content) ? (
              <ul className="text-sm text-gray-700 space-y-1">
                {content.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-700">{content}</p>
            )}
          </div>
          <div 
            className={`absolute w-0 h-0 border-8 border-transparent ${arrowClasses[position]}`}
            style={{ borderStyle: 'solid' }}
          />
        </div>
      )}
    </div>
  );
}