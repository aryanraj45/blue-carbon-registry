// src/components/ui/DynamicSkeletonLoader.tsx

import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";

// Helper to generate a random number within a range
const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Animation variants for a staggered fade-in effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const DynamicSkeletonLoader = () => {
  const [skeletonConfig, setSkeletonConfig] = useState<{ width: string }[]>([]);

  // This effect runs only once when the component is first rendered
  useEffect(() => {
    // Generate a random number of lines (e.g., between 2 and 4)
    const lineCount = random(2, 4);
    
    // Create an array of lines with random widths
    const newConfig = Array.from({ length: lineCount }).map(() => ({
      width: `${random(40, 90)}%`, // Each line has a random width between 40% and 90%
    }));
    
    setSkeletonConfig(newConfig);
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-md p-3 rounded-xl bg-slate-800 space-y-2"
    >
      {skeletonConfig.map((line, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="generative-bg h-4 rounded"
          style={{ width: line.width }}
        />
      ))}
    </motion.div>
  );
};