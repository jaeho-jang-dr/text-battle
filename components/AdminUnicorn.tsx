"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminUnicorn() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/admin");
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 0.5, scale: 1 }}
      whileHover={{ opacity: 0.8, scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 hover:from-purple-400/30 hover:to-pink-400/30 backdrop-blur-sm border border-purple-300/20 transition-all shadow-lg"
      aria-label="Admin Panel"
    >
      <span className="text-3xl" role="img" aria-label="unicorn">
        🦄
      </span>
    </motion.button>
  );
}