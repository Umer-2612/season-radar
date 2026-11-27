"use client";

import { motion } from "motion/react";
import { ALL, SELLABLE, signed, SOURCES } from "@/lib/cso";
import { CountUp } from "./CountUp";
import { Slide, SlideItem } from "./Slide";
import { SourceChip } from "./SourceChip";

const MAX_SWING = 9;
const ranked = [...SELLABLE].sort((a, b) => b.lastBlackFridayChange - a.lastBlackFridayChange);

function Peak({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-display text-6xl font-bold sm:text-7xl">
        <CountUp to={value} prefix="+" suffix="%" />
      </p>
      <p className="mt-1 text-sm opacity-90">{label}</p>
    </div>
  );
}

export function ProblemSlide() {
  return (
    <Slide eyebrow="The problem" title="Two peaks. Very different winners.">
      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <SlideItem className="flex flex-col gap-5 rounded-3xl bg-brand p-7 text-brand-ink">
          <Peak label="more sold in Black Friday month than an average month" value={ALL.novemberLift} />
          <Peak label="more sold in December than an average month" value={ALL.decemberLift} />
          <p className="mt-auto text-sm opacity-80">Order the wrong stock and it sits there until the January sales.</p>
          <div>
            <SourceChip code={SOURCES.volume.code} url={SOURCES.volume.url} tone="dark" />
          </div>
        </SlideItem>

        <SlideItem className="rounded-3xl border border-line bg-surface p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">Black Friday month 2025 vs 2024, sales volume</p>
            <SourceChip code={SOURCES.volume.code} url={SOURCES.volume.url} />
          </div>
          <ul className="grid gap-2.5">
            {ranked.map((c, i) => {
              const isUp = c.lastBlackFridayChange > 0;
              const width = `${Math.min(1, Math.abs(c.lastBlackFridayChange) / MAX_SWING) * 50}%`;
              return (
                <li key={c.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_3.5rem] items-center gap-3 text-sm">
                  <span className="truncate">{c.label}</span>
                  <span className="relative h-3 rounded-full bg-chip">
                    <span className="absolute inset-y-0 left-1/2 w-px bg-line" />
                    <motion.span
                      className={`absolute inset-y-0 rounded-full ${isUp ? "left-1/2 bg-up" : "right-1/2 bg-down"}`}
                      style={{ width, transformOrigin: isUp ? "left" : "right" }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.4 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </span>
                  <span className={`text-right font-semibold tabular-nums ${isUp ? "text-up" : "text-down"}`}>
                    {signed(c.lastBlackFridayChange)}
                  </span>
                </li>
              );
            })}
          </ul>
        </SlideItem>
      </div>
    </Slide>
  );
}
