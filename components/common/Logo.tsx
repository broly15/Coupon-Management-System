"use client";

import React from "react";
import { motion } from "framer-motion";

export const Logo: React.FC = () => {
  return (
    <motion.div
      className="flex items-center gap-2.5 cursor-pointer select-none"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg shadow-pink-glow backdrop-blur-md">
        ❤️
      </div>
      <span className="text-lg font-bold tracking-tight text-white">
        Khushi<span className="text-primary font-light">OS</span>
      </span>
    </motion.div>
  );
};
