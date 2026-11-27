"use client";

import { motion } from "motion/react";
import { rise } from "./motion";
import { Slide, SlideItem } from "./Slide";

const WHO = [
  { who: "Local shops", what: "Gift shops, pharmacies, boutiques, toy shops" },
  { who: "Online sellers", what: "Amazon, Etsy and eBay sellers based in Ireland" },
  { who: "Small chains", what: "Two to twenty stores ordering for Black Friday and Christmas" },
];

const NEXT = ["UK and EU data from ONS and Eurostat", "Plug in your Shopify or Amazon sales", "County-level demand from bank card-spend data"];

export function CloseSlide({ onRestart }: { onRestart: () => void }) {
  return (
    <Slide eyebrow="Who it's for" title="Big-chain data, sized for small sellers.">
      <motion.div variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }} className="grid gap-4 md:grid-cols-3">
        {WHO.map((w) => (
          <motion.div key={w.who} variants={rise} whileHover={{ y: -4 }} className="rounded-3xl border border-line bg-surface p-6">
            <h3 className="text-2xl font-bold">{w.who}</h3>
            <p className="mt-1 text-pretty text-muted">{w.what}</p>
          </motion.div>
        ))}
      </motion.div>

      <SlideItem className="mt-5 flex flex-col gap-4 rounded-3xl bg-ink p-6 text-bg sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Next</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {NEXT.map((n) => (
              <li key={n} className="rounded-full border border-bg/20 px-3 py-1 text-sm">
                {n}
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="h-11 rounded-xl bg-bg px-5 font-semibold text-ink transition-transform duration-150 active:scale-[0.96]"
        >
          Watch again ↺
        </button>
      </SlideItem>
    </Slide>
  );
}
