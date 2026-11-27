"use client";

import { animate } from "motion/react";
import { useEffect, useRef } from "react";

type Props = { to: number; decimals?: number; prefix?: string; suffix?: string; delay?: number };

export function CountUp({ to, decimals = 0, prefix = "", suffix = "", delay = 0 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const controls = animate(0, to, {
      duration: 1.3,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [to, decimals, prefix, suffix, delay]);

  return (
    <span ref={ref} className="tabular-nums">
      {format(to)}
    </span>
  );
}
