"use client";
import React from "react";
import { motion } from "framer-motion";

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-background">
      {/* Orb 1: Pink */}
      <motion.div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/5 opacity-30 blur-[150px] filter"
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 50, 0],
        }}
        transition={{
          duration: 50,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Orb 2: Purple */}
      <motion.div
        className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-secondary/8 opacity-30 blur-[150px] filter"
        animate={{
          x: [0, -100, 60, 0],
          y: [0, 80, -40, 0],
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orb 3: Cyan Accent */}
      <motion.div
        className="absolute top-1/3 left-1/3 h-[500px] w-[500px] rounded-full bg-accent/3 opacity-20 blur-[130px] filter"
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};
