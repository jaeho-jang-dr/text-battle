import { motion } from "framer-motion";

interface VictoryParticlesProps {
  count?: number;
}

export function VictoryParticles({ count = 20 }: VictoryParticlesProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{
            x: Math.random() * 100 - 50,
            y: 100,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: (Math.random() - 0.5) * 300,
            y: -Math.random() * 200 - 100,
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0.5],
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
          style={{
            left: `${50 + (Math.random() - 0.5) * 30}%`,
          }}
        >
          {["✨", "🌟", "⭐", "💫", "🎉"][Math.floor(Math.random() * 5)]}
        </motion.div>
      ))}
    </div>
  );
}

interface DefeatEffectProps {
  show: boolean;
}

export function DefeatEffect({ show }: DefeatEffectProps) {
  if (!show) return null;
  
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-gray-900/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl"
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: [0, 1.5, 1], rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        💀
      </motion.div>
    </motion.div>
  );
}