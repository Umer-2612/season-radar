"use client";

import { AnimatePresence, MotionConfig, motion, type PanInfo } from "motion/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CloseSlide } from "./Close";
import { DemoSlide } from "./Demo";
import { HookSlide } from "./Hook";
import { ProblemSlide } from "./Problem";
import { ReceiptsSlide } from "./Receipts";

type SlideDef = { id: string; label: string; render: (go: (i: number) => void) => ReactNode };

const SLIDES: SlideDef[] = [
  { id: "intro", label: "Intro", render: (go) => <HookSlide onStart={() => go(1)} /> },
  { id: "problem", label: "Problem", render: () => <ProblemSlide /> },
  { id: "dashboard", label: "Dashboard", render: () => <DemoSlide /> },
  { id: "trust", label: "Trust", render: () => <ReceiptsSlide /> },
  { id: "who", label: "Who it's for", render: (go) => <CloseSlide onRestart={() => go(0)} /> },
];

const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 400;

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? "10%" : "-10%", opacity: 0, scale: 0.985 }),
  center: { x: 0, opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 220, damping: 30 } },
  exit: (dir: number) => ({ x: dir > 0 ? "-6%" : "6%", opacity: 0, scale: 0.985, transition: { duration: 0.22 } }),
};

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && ["SELECT", "INPUT", "TEXTAREA"].includes(target.tagName);

export function Deck() {
  const [state, setState] = useState<[number, number] | null>(null);
  const [index, dir] = state ?? [0, 1];

  const go = useCallback((next: number) => {
    setState((prev) => {
      const current = prev ? prev[0] : 0;
      const clamped = Math.max(0, Math.min(SLIDES.length - 1, next));
      return clamped === current ? [current, 0] : [clamped, clamped > current ? 1 : -1];
    });
  }, []);

  // Open the slide named in the URL hash directly, with no hand-off animation.
  useEffect(() => {
    const fromHash = SLIDES.findIndex((s) => s.id === window.location.hash.slice(1));
    setState([Math.max(0, fromHash), 1]);
  }, []);

  useEffect(() => {
    if (state) window.history.replaceState(null, "", `#${SLIDES[state[0]].id}`);
  }, [state]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") go(index + 1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index]);

  const handlePanEnd = (_: PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    if (Math.abs(offset.x) < Math.abs(offset.y) * 1.5) return;
    if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) go(index + 1);
    else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) go(index - 1);
  };

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-[100dvh] flex-col overflow-hidden">
        <header className="z-20 border-b border-line bg-bg/85 backdrop-blur">
          <div className="mx-auto flex h-14 w-[min(1120px,100%-32px)] items-center gap-4">
            <button type="button" onClick={() => go(0)} className="font-display text-lg font-bold text-brand">
              Season Radar
            </button>
            <nav aria-label="Slides" className="ml-auto hidden gap-1 lg:flex">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === index ? "step" : undefined}
                  className="relative h-9 rounded-full px-3 text-sm transition-colors duration-150"
                >
                  {i === index && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-chip" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
                  )}
                  <span className={`relative ${i === index ? "font-semibold text-brand" : "text-muted hover:text-ink"}`}>{s.label}</span>
                </button>
              ))}
            </nav>
            <span className="ml-auto rounded-full bg-chip px-3 py-1 text-xs font-semibold text-brand lg:ml-2">Smarter Shop</span>
          </div>
        </header>

        <motion.main className="relative flex-1 touch-pan-y overflow-hidden" onPanEnd={handlePanEnd}>
          <AnimatePresence initial={false} custom={dir}>
            {state && (
            <motion.section
              key={slide.id}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${SLIDES.length}: ${slide.label}`}
              className="absolute inset-0 flex items-center overflow-y-auto"
            >
              <div className="m-auto w-full">{slide.render(go)}</div>
            </motion.section>
            )}
          </AnimatePresence>
        </motion.main>

        <footer className="z-20 border-t border-line bg-bg/85 backdrop-blur">
          <div className="h-0.5 bg-line">
            <motion.div
              className="h-full origin-left bg-brand"
              animate={{ scaleX: (index + 1) / SLIDES.length }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
          <div className="mx-auto flex h-16 w-[min(1120px,100%-32px)] items-center gap-4">
            <span className="w-16 text-sm tabular-nums text-muted">
              {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
            <div className="mx-auto flex items-center gap-1" role="tablist" aria-label="Go to slide">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={s.label}
                  onClick={() => go(i)}
                  className="grid h-10 w-6 place-items-center"
                >
                  <motion.span
                    className="block h-2 rounded-full"
                    animate={{ width: i === index ? 22 : 8, backgroundColor: i === index ? "var(--brand)" : "var(--line)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(index - 1)}
                disabled={index === 0}
                aria-label="Previous slide"
                className="grid h-11 w-11 place-items-center rounded-full border border-line transition-[transform,opacity] duration-150 active:scale-[0.94] disabled:opacity-30"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(isLast ? 0 : index + 1)}
                aria-label={isLast ? "Back to start" : "Next slide"}
                className="grid h-11 min-w-11 place-items-center rounded-full bg-brand px-4 font-semibold text-brand-ink transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.94]"
              >
                {isLast ? "↺" : "→"}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
