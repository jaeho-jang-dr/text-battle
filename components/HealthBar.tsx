"use client";

import { motion } from "framer-motion";
import { healthBarVariants } from "@/lib/animations";

interface HealthBarProps {
  health: number; // 0-100
  color?: "blue" | "red" | "green";
  isAnimated?: boolean;
}

export default function HealthBar({ health, color = "green", isAnimated = false }: HealthBarProps) {
  const getHealthColor = () => {
    if (health > 60) return "green";
    if (health > 30) return "yellow";
    return "red";
  };
  
  const actualColor = color === "green" ? getHealthColor() : color;
  
  const colorClasses = {
    blue: "from-blue-400 to-blue-600",
    red: "from-red-400 to-red-600",
    green: "from-green-400 to-green-600",
    yellow: "from-yellow-400 to-yellow-600",
  };

  const borderColorClasses = {
    blue: "border-blue-600",
    red: "border-red-600",
    green: "border-green-600",
    yellow: "border-yellow-600",
  };
  
  const glowClasses = {
    blue: "glow-blue",
    red: "glow-red",
    green: "glow-green",
    yellow: "shadow-lg shadow-yellow-500/50",
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span className="font-semibold">HP</span>
        <motion.span 
          key={health}
          initial={{ scale: 1.5, color: "#fff" }}
          animate={{ scale: 1, color: "#9ca3af" }}
          className="font-bold"
        >
          {health}%
        </motion.span>
      </div>
      <motion.div
        className={`w-full h-6 bg-gray-800/50 backdrop-blur rounded-full border-2 ${borderColorClasses[actualColor]} overflow-hidden ${isAnimated ? glowClasses[actualColor] : ''}`}
        animate={health < 30 ? healthBarVariants.pulse : {}}
      >
        <motion.div
          className={`h-full bg-gradient-to-r ${colorClasses[actualColor]} relative overflow-hidden`}
          initial={{ width: "100%" }}
          animate={{ width: `${health}%` }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 1
            }}
          />
          
          {/* Energy particles */}
          {isAnimated && (
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{ x: 0, y: "50%" }}
                  animate={{
                    x: [0, 50, 100, 150],
                    y: ["50%", "30%", "70%", "50%"],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}