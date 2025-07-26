"use client";

import { motion } from 'framer-motion';

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = "로딩 중..." }: LoadingProps) {
  const animals = ['🦁', '🐧', '🦄', '🐬', '🦖'];
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex gap-4 mb-8">
        {animals.map((animal, index) => (
          <motion.div
            key={index}
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 360, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              delay: index * 0.2
            }}
            className="text-5xl"
          >
            {animal}
          </motion.div>
        ))}
      </div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-xl text-gray-700"
      >
        {message}
      </motion.p>
    </div>
  );
}