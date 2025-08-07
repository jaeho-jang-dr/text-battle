"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  animation?: "pulse" | "wave";
}

export function Skeleton({ 
  className, 
  variant = "rectangular",
  animation = "pulse" 
}: SkeletonProps) {
  const baseClasses = "bg-gray-700/50 overflow-hidden";
  
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg"
  };
  
  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      {animation === "wave" && (
        <motion.div
          className="h-full w-full bg-gradient-to-r from-transparent via-gray-600/30 to-transparent"
          animate={{
            x: ["-100%", "100%"]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      {animation === "pulse" && (
        <motion.div
          className="h-full w-full bg-gray-600/30"
          animate={{
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
}

export function CharacterCardSkeleton() {
  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" className="w-16 h-16" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4 h-6" />
          <Skeleton variant="text" className="w-1/2 h-4" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-5/6 h-4" />
      </div>
      <div className="flex justify-between pt-4">
        <Skeleton variant="rectangular" className="w-24 h-8" />
        <Skeleton variant="rectangular" className="w-24 h-8" />
      </div>
    </div>
  );
}

export function BattleHistorySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-800/50 backdrop-blur rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton variant="circular" className="w-10 h-10" />
              <div className="space-y-2">
                <Skeleton variant="text" className="w-32 h-4" />
                <Skeleton variant="text" className="w-24 h-3" />
              </div>
            </div>
            <Skeleton variant="rectangular" className="w-16 h-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="bg-gray-800/50 backdrop-blur rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton variant="circular" className="w-8 h-8" />
              <Skeleton variant="text" className="w-32 h-5" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton variant="text" className="w-16 h-4" />
              <Skeleton variant="text" className="w-20 h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}