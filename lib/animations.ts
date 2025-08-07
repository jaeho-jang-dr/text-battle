export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

export const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  hover: { 
    scale: 1.02,
    y: -5,
    transition: { duration: 0.2 }
  },
  tap: { scale: 0.98 }
};

export const buttonVariants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  },
  disabled: {
    opacity: 0.5,
    scale: 1
  }
};

export const battleCharacterVariants = {
  initial: { opacity: 0, x: 0 },
  enter: (isAttacker: boolean) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      delay: isAttacker ? 0 : 0.2,
      ease: "easeOut"
    }
  }),
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  },
  victory: {
    y: [-20, 0],
    transition: {
      duration: 0.6,
      ease: "easeOut",
      repeat: 2,
      repeatType: "reverse" as const
    }
  },
  defeat: {
    y: 50,
    opacity: 0.5,
    rotate: 15,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 50
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export const healthBarVariants = {
  normal: { backgroundColor: "#22c55e" },
  warning: { backgroundColor: "#f59e0b" },
  danger: { backgroundColor: "#ef4444" },
  pulse: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

export const floatingAnimation = {
  y: [-10, 10],
  transition: {
    y: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

export const glowAnimation = {
  animate: {
    boxShadow: [
      "0 0 20px rgba(59, 130, 246, 0.5)",
      "0 0 30px rgba(59, 130, 246, 0.8)",
      "0 0 20px rgba(59, 130, 246, 0.5)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};