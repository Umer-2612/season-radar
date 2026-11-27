"use client";

import { motion } from "motion/react";

type Props = { values: number[]; isUp: boolean; delay?: number };

const W = 300;
const H = 40;
const PAD = 6;

export function Sparkline({ values, isUp, delay = 0 }: Props) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const points = values.map((v, i) => ({
    x: PAD + (i * (W - PAD * 2)) / (values.length - 1),
    y: H - PAD - ((v - min) / span) * (H - PAD * 2),
  }));
  const path = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const color = isUp ? "var(--up)" : "var(--down)";
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Trend: ${values.join(", ")}`}>
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay, ease: "easeInOut" }}
      />
      <motion.circle
        cx={last.x}
        cy={last.y}
        r={5}
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.85, type: "spring", stiffness: 300, damping: 15 }}
      />
    </svg>
  );
}
