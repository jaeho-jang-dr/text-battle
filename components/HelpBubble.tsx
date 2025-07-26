"use client";

import { motion } from 'framer-motion';

interface HelpBubbleProps {
  show: boolean;
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export default function HelpBubble({ 
  show, 
  children, 
  position = 'top-right' 
}: HelpBubbleProps) {
  if (!show) return null;

  const positionClasses = {
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4',
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: position.includes('top') ? -20 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: position.includes('top') ? -20 : 20 }}
      className={`help-bubble ${positionClasses[position]} max-w-xs`}
    >
      {children}
    </motion.div>
  );
}