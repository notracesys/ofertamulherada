
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuizStepProps {
  children: React.ReactNode;
  stepId: number;
}

export const QuizStep: React.FC<QuizStepProps> = ({ children, stepId }) => {
  return (
    <motion.div
      key={stepId}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="w-full flex flex-col items-center justify-center min-h-[70vh] px-4 py-8"
    >
      <div className="w-full max-w-md">
        {children}
      </div>
    </motion.div>
  );
};
