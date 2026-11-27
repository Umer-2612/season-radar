"use client";

import { motion } from "motion/react";
import { CSO, SOURCES } from "@/lib/cso";
import { rise } from "./motion";
import { Slide, SlideItem } from "./Slide";
import { SourceChip } from "./SourceChip";

const RECEIPTS = [
  {
    title: "History",
    body: "Monthly sales by sector since 2021.",
    source: SOURCES.volume,
  },
  {
    title: "Forecast",
    body: "Aug to Oct trend vs last year.",
    source: SOURCES.volume,
  },
  {
    title: "Confidence score",
    body: "Tested on the last 4 seasons.",
    source: SOURCES.volume,
  },
  {
    title: "Your county",
    body: `Income per person by county (${CSO.countyIncome.year}).`,
    source: SOURCES.county,
  },
];

const VERSUS = [
  { them: "AI forecasts with no source", us: "Official CSO data, one click to check" },
  { them: "A score you have to trust", us: "A score tested on past seasons" },
  { them: "Paid analytics for big chains", us: "Free for a corner shop" },
];

export function ReceiptsSlide() {
  return (
    <Slide eyebrow="Trust & transparency" title="Every number comes with a receipt.">
      <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {RECEIPTS.map((r) => (
          <motion.div key={r.title} variants={rise} className="flex flex-col rounded-3xl border border-dashed border-line bg-surface p-5">
            <h3 className="text-xl font-bold">{r.title}</h3>
            <p className="mt-1 flex-1 text-pretty text-sm text-muted">{r.body}</p>
            <div className="mt-4">
              <SourceChip code={r.source.code} url={r.source.url} />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <SlideItem className="mt-4 overflow-hidden rounded-3xl border border-line">
        <div className="grid grid-cols-2 bg-surface text-xs font-semibold uppercase tracking-wider">
          <span className="p-4 text-muted">Everyone else</span>
          <span className="bg-brand p-4 text-brand-ink">Season Radar</span>
        </div>
        {VERSUS.map((v, i) => (
          <div key={v.us} className="grid grid-cols-2 border-t border-line">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="p-4 text-sm text-muted line-through decoration-down/50"
            >
              {v.them}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              className="bg-chip p-4 text-sm font-semibold text-brand"
            >
              ✓ {v.us}
            </motion.span>
          </div>
        ))}
      </SlideItem>
    </Slide>
  );
}
