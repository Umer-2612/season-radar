"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { rise, stagger } from "./motion";

type Props = { eyebrow: string; title: string; children: ReactNode };

export function Slide({ eyebrow, title, children }: Props) {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="mx-auto w-[min(1120px,100%-32px)] py-8 sm:py-12">
      <motion.p variants={rise} className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-brand">
        {eyebrow}
      </motion.p>
      <motion.h2 variants={rise} className="mb-6 max-w-3xl text-3xl font-bold leading-[1.05] sm:text-5xl">
        {title}
      </motion.h2>
      {children}
    </motion.div>
  );
}

export function SlideItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={rise} className={className}>
      {children}
    </motion.div>
  );
}
