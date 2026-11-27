"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import data from "@/data/markets.json";
import { rise, stagger } from "./motion";

const WORDS = ["Black Friday", "Cyber Monday", "Christmas"];
const WORD_MS = 2200;
const DAY_MS = 86_400_000;

type Market = (typeof data.markets)[number];
const market = (id: string): Market => data.markets.find((m) => m.id === id)!;
const cat = (m: Market, id: string) => m.categories.find((c) => c.id === id)!;

const ie = market("IE");
const uk = market("UK");
const it = market("IT");

const FLOATERS = [
  { flag: "🇮🇪", where: "Ireland", what: "Toys & gifts", value: `+${cat(ie, "toys").decemberLift}%`, note: "in December", src: "CSO", url: cat(ie, "toys").url },
  { flag: "🇬🇧", where: "UK", what: "Electrical", value: `+${cat(uk, "electrical").novemberLift}%`, note: "in Black Friday month", src: "ONS", url: cat(uk, "electrical").url },
  { flag: "🇮🇹", where: "Italy", what: "Online shops", value: `+${cat(it, "online").novemberLift}%`, note: "in Black Friday month", src: "Eurostat", url: cat(it, "online").url },
];

const SLOTS = [
  { x: 0, y: 0, rotate: -3, z: 1 },
  { x: 130, y: 140, rotate: 2, z: 2 },
  { x: 30, y: 280, rotate: -1.5, z: 3 },
];
const SHUFFLE_MS = 3200;

function useShuffle(paused: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setTick((t) => t + 1), SHUFFLE_MS);
    return () => clearInterval(id);
  }, [paused]);
  return tick;
}

const MARKETS = [
  { flag: "🇮🇪", name: "Ireland", src: "CSO" },
  { flag: "🇬🇧", name: "UK", src: "ONS" },
  { flag: "🇪🇺", name: "EU", src: "Eurostat" },
];

function useRotatingWord() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % WORDS.length), WORD_MS);
    return () => clearInterval(id);
  }, []);
  return WORDS[i];
}

function useDaysToChristmas() {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const now = new Date();
    const xmas = new Date(now.getFullYear(), 11, 25);
    setDays(Math.max(0, Math.ceil((xmas.getTime() - now.getTime()) / DAY_MS)));
  }, []);
  return days;
}

export function HookSlide({ onStart }: { onStart: () => void }) {
  const word = useRotatingWord();
  const days = useDaysToChristmas();
  const [hovering, setHovering] = useState(false);
  const tick = useShuffle(hovering);

  return (
    <div className="mx-auto grid w-[min(1120px,100%-32px)] items-center gap-10 py-8 lg:grid-cols-[1.15fr_1fr]">
      <motion.div variants={stagger} initial="hidden" animate="show">
        <motion.div variants={rise} className="mb-6 flex flex-wrap items-center gap-2">
          <span className="relative inline-flex items-center gap-2 rounded-full bg-berry px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-white/70" />
              <span className="relative h-2 w-2 rounded-full bg-white" />
            </span>
            Black Friday is live
          </span>
          {days !== null && (
            <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold tabular-nums">
              🎄 {days} days to Christmas
            </span>
          )}
        </motion.div>

        <motion.h1 variants={rise} className="text-5xl font-bold leading-[1.02] sm:text-7xl">
          Know what sells
          <br />
          this{" "}
          <span className="relative inline-grid align-bottom">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={word}
                className="col-start-1 row-start-1 whitespace-nowrap text-brand"
                initial={{ y: "60%", opacity: 0, filter: "blur(8px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: "-60%", opacity: 0, filter: "blur(8px)" }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}.
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.h1>

        <motion.p variants={rise} className="mt-6 max-w-md text-pretty text-lg text-muted">
          Stock what sells. Skip what sits. Every call backed by official retail data.
        </motion.p>

        <motion.ul variants={rise} className="mt-6 flex flex-wrap gap-2">
          {MARKETS.map((m) => (
            <li key={m.name} className="flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm">
              <span aria-hidden="true">{m.flag}</span>
              {m.name}
              <span className="text-xs text-muted">· {m.src}</span>
            </li>
          ))}
        </motion.ul>

        <motion.div variants={rise} className="mt-8">
          <button
            type="button"
            onClick={onStart}
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 font-semibold text-brand-ink transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.96]"
          >
            See what to stock
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
        </motion.div>
      </motion.div>

      <div
        className="relative hidden h-[440px] lg:block"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {FLOATERS.map((f, i) => {
          const slot = SLOTS[(i + tick) % SLOTS.length];
          return (
            <motion.a
              key={f.where}
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute left-0 top-0 w-[290px] rounded-3xl border border-line bg-surface p-5 shadow-[0_24px_48px_-28px_rgba(0,0,0,0.45)]"
              style={{ zIndex: slot.z }}
              initial={{ opacity: 0, x: slot.x, y: slot.y + 30, rotate: 0 }}
              animate={{ opacity: 1, x: slot.x, y: slot.y, rotate: slot.rotate }}
              whileHover={{ scale: 1.04, rotate: 0 }}
              transition={{
                opacity: { delay: 0.4 + i * 0.2, duration: 0.6 },
                default: { type: "spring", stiffness: 140, damping: 18, mass: 0.9 },
              }}
            >
              <p className="flex items-center gap-2 text-sm text-muted">
                <span aria-hidden="true">{f.flag}</span>
                {f.where} · {f.what}
              </p>
              <p className="mt-1 font-display text-5xl font-bold text-brand">{f.value}</p>
              <p className="mt-1 text-sm">{f.note} vs an average month</p>
              <p className="mt-3 inline-flex h-6 items-center rounded-full border border-line bg-bg px-2 text-[11px] font-semibold text-muted">
                ◉ {f.src} ↗
              </p>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
