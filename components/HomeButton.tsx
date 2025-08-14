"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { HiHome } from "react-icons/hi";

export default function HomeButton() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleHomeClick = () => {
    // Always go to the landing page
    router.push("/");
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleHomeClick}
      className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700/80 text-white rounded-lg backdrop-blur-sm border border-gray-700 transition-colors shadow-lg"
    >
      <HiHome className="text-xl" />
      <span className="text-sm font-medium">Home</span>
    </motion.button>
  );
}