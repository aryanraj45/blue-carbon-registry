// src/components/ui/text-generate-effect.tsx
"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  useEffect(() => {
    animate(
      "span",
      { opacity: 1 },
      { duration: 2, delay: stagger(0.04) }
    );
  }, [scope.current]);

  const renderWords = () => (
    <motion.div ref={scope}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={word + idx}
          // --- THIS IS THE FIX ---
          // Changed from "dark:text-white text-black opacity-0"
          className="text-white opacity-0"
        >
          {word}{" "}
        </motion.span>
      ))}
    </motion.div>
  );

  return (
    <div className={cn("font-sans font-normal text-base", className)}>
      <div className="whitespace-pre-wrap leading-relaxed tracking-wide">
        {renderWords()}
      </div>
    </div>
  );
};