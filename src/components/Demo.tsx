"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  BUSINESS_TYPES,
  confidenceFor,
  COUNTIES,
  countyTip,
  CSO,
  PRODUCTS,
  rankForBusiness,
  paceFor,
  channelLine,
  signed,
  SOURCES,
  verdictFor,
  type Category,
  type Channel,
  type Tone,
} from "@/lib/cso";
import { Slide, SlideItem } from "./Slide";
import { SourceChip } from "./SourceChip";
import { Sparkline } from "./Sparkline";

const CHANNELS: { id: Channel; label: string }[] = [
  { id: "shop", label: "In a shop" },
  { id: "online", label: "Online" },
  { id: "both", label: "Both" },
];

const TONE: Record<Tone, string> = { up: "bg-up text-white", flat: "bg-chip text-brand", down: "bg-down text-white" };

function Picker({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="grid flex-1 gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 min-w-0 rounded-xl border border-line bg-bg px-3 text-base font-medium normal-case tracking-normal text-ink"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg px-3 py-2">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[11px] leading-tight text-muted">{label}</p>
    </div>
  );
}

function ConfidenceMeter({ hits, total }: { hits: number; total: number }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Right ${hits} of ${total} past seasons`}>
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.4 + i * 0.08 }}
          className={`h-2.5 w-2.5 rounded-full ${i < hits ? "bg-brand" : "bg-line"}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted">
        right {hits}/{total} seasons
      </span>
    </span>
  );
}

function PickCard({ c, rank, channel }: { c: Category; rank: number; channel: Channel }) {
  const verdict = verdictFor(c);
  const conf = confidenceFor(c);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.45, delay: rank * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="grid gap-3 rounded-3xl border border-line bg-surface p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted">#{rank + 1} · {c.label}</p>
          <h4 className="text-lg font-bold leading-tight">{PRODUCTS[c.id]}</h4>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${TONE[verdict.tone]}`}>{verdict.word}</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Metric label="Black Friday month" value={signed(c.novemberLift)} />
        <Metric label="December" value={signed(c.decemberLift)} />
        <Metric label="Forecast" value={signed(c.momentum2026)} />
      </div>

      <div>
        <Sparkline values={c.christmas} isUp={c.christmas.at(-1)! >= c.christmas[0]} delay={0.2 + rank * 0.07} />
        <div className="flex justify-between text-[10px] text-muted">
          {CSO.christmasYears.map((y) => (
            <span key={y}>{y}</span>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">{paceFor(c)}</p>
        <p className="text-xs text-muted">{channelLine(c, channel)}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <ConfidenceMeter hits={c.backtestHits} total={c.backtestYears} />
        <span className="sr-only">Confidence {conf.label}</span>
        <SourceChip code={SOURCES.volume.code} url={SOURCES.volume.url} />
      </div>
    </motion.article>
  );
}

export function DemoSlide() {
  const [countyName, setCountyName] = useState("Dublin");
  const [business, setBusiness] = useState("Gift shop");
  const [channel, setChannel] = useState<Channel>("both");
  const county = COUNTIES.find((c) => c.name === countyName) ?? COUNTIES[0];
  const picks = rankForBusiness(business);

  return (
    <Slide eyebrow="Dashboard" title="Your Black Friday and Christmas stock list.">
      <SlideItem className="mb-4 flex flex-col gap-3 rounded-3xl border border-line bg-surface p-3 md:flex-row md:items-end">
        <Picker label="County" value={countyName} options={COUNTIES.map((c) => c.name)} onChange={setCountyName} />
        <Picker label="Business type" value={business} options={Object.keys(BUSINESS_TYPES)} onChange={setBusiness} />
        <Picker label="Where you sell" value={CHANNELS.find((c) => c.id === channel)!.label} options={CHANNELS.map((c) => c.label)} onChange={(v) => setChannel(CHANNELS.find((c) => c.label === v)!.id)} />
      </SlideItem>

      <SlideItem className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-bg">
        <span className="font-semibold">{county.name} spending power: {county.incomeIndex}</span>
        <span className="opacity-70">(Ireland = 100)</span>
        <span className="flex-1">{countyTip(county)}</span>
        <a href={SOURCES.county.url} target="_blank" rel="noopener noreferrer" className="text-xs underline-offset-4 opacity-80 hover:underline">
          CSO · {SOURCES.county.code} · {CSO.countyIncome.year} ↗
        </a>
      </SlideItem>

      <div className="grid gap-4 lg:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {picks.map((c, i) => (
            <PickCard key={`${business}-${c.id}`} c={c} rank={i} channel={channel} />
          ))}
        </AnimatePresence>
      </div>

      <p className="mt-3 text-xs text-muted">
        % = sales vs an average month. Forecast = Aug to Oct trend vs last year. Chart = Nov + Dec sales.
      </p>
    </Slide>
  );
}
