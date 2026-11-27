import data from "@/data/cso.json";

// All figures come from the CSO API via scripts/fetch-cso.mjs. Nothing here is made up.
export const CSO = data;
export type Category = (typeof data.categories)[number];
export type County = (typeof data.counties)[number];
export type Tone = "up" | "flat" | "down";
export type Channel = "shop" | "online" | "both";

const MOMENTUM_GAP = 1.5;
const RICH_COUNTY = 105;
const TIGHT_COUNTY = 90;

const find = (id: string): Category => {
  const hit = data.categories.find((c) => c.id === id);
  if (!hit) throw new Error(`Missing CSO category: ${id}`);
  return hit;
};

export const ALL = find("all");
export const SELLABLE = data.categories.filter((c) => c.id !== "all");
export const byId = find;
export const COUNTIES = data.counties.filter((c) => c.incomeIndex !== null);

export const SOURCES = {
  volume: { code: "RSM08", label: "CSO Retail Sales Index", url: data.datasets.RSM08.url },
  online: { code: "RSM07", label: "CSO Online Sales", url: data.datasets.RSM07.url },
  county: { code: "CIA02", label: "CSO County Incomes", url: data.countyIncome.url },
};

export const PRODUCTS: Record<string, string> = {
  toys: "Toys, games, sports gear, jewellery",
  electrical: "Phones, TVs, headphones, appliances",
  clothing: "Clothes, shoes, accessories",
  beauty: "Skincare, fragrance, gift sets",
  books: "Books, cards, stationery",
  home: "Furniture, lamps, home decor",
  hardware: "Tools, paint, DIY kits",
  food: "Chocolate, wine, hampers",
};

export const BUSINESS_TYPES: Record<string, string[]> = {
  "Gift shop": ["toys", "beauty", "books", "home"],
  "Toy & hobby shop": ["toys", "books", "electrical"],
  "Fashion boutique": ["clothing", "toys", "beauty"],
  "Electronics & gaming": ["electrical", "toys"],
  "Pharmacy & beauty": ["beauty", "toys"],
  "Home & interiors": ["home", "hardware", "electrical"],
  "Food & drink": ["food", "beauty"],
  "Amazon / Etsy / eBay seller": ["toys", "electrical", "clothing", "beauty", "books", "home"],
};

export const signed = (n: number): string => `${n > 0 ? "+" : ""}${Object.is(n, -0) ? 0 : n}%`;

export interface Verdict {
  word: string;
  tone: Tone;
}

export const verdictFor = (c: Category): Verdict => {
  const gap = c.momentum2026 - ALL.momentum2026;
  if (gap > MOMENTUM_GAP) return { word: "Stock up", tone: "up" };
  if (gap < -MOMENTUM_GAP) return { word: "Go lean", tone: "down" };
  return { word: "Hold steady", tone: "flat" };
};

export interface Confidence {
  score: number;
  label: string;
}

export const confidenceFor = (c: Category): Confidence => {
  const score = Math.round((c.backtestHits / c.backtestYears) * 100);
  const label = score >= 75 ? "High" : score >= 50 ? "Medium" : "Low";
  return { score, label };
};

export const rankForBusiness = (business: string): Category[] =>
  (BUSINESS_TYPES[business] ?? []).map(find).sort((a, b) => b.momentum2026 - a.momentum2026);

export const paceFor = (c: Category): string => {
  const gap = c.momentum2026 - ALL.momentum2026;
  if (gap > MOMENTUM_GAP) return "Growing faster than the market";
  if (gap < -MOMENTUM_GAP) return "Growing slower than the market";
  return "Moving with the market";
};

export const reasonsFor = (c: Category): string[] => {
  const gap = c.momentum2026 - ALL.momentum2026;
  const pace = gap > MOMENTUM_GAP ? "faster than" : gap < -MOMENTUM_GAP ? "slower than" : "in line with";
  return [
    `Black Friday month (Nov) sells ${signed(c.novemberLift)} vs an average month. Last year it moved ${signed(c.lastBlackFridayChange)}.`,
    `December sells ${signed(c.decemberLift)} vs an average month. Last Christmas moved ${signed(c.lastChristmasChange)}.`,
    `Aug to Oct 2026 is ${signed(c.momentum2026)} on last year, ${pace} all Irish retail (${signed(ALL.momentum2026)}).`,
    `This signal called the direction right in ${c.backtestHits} of the last ${c.backtestYears} seasons.`,
  ];
};

export const countyTip = (county: County): string => {
  const idx = county.incomeIndex ?? 100;
  if (idx >= RICH_COUNTY) return "Above-average spending power. Premium gift lines have room.";
  if (idx <= TIGHT_COUNTY) return "Tighter budgets. Lead with Black Friday deals and value bundles.";
  return "Close to the Irish average. Mix value deals with a few premium lines.";
};

export const channelLine = (c: Category, channel: Channel): string => {
  const { 2024: before, 2025: now } = c.onlineShareDec;
  if (now === null || before === null) return "No online split published by CSO for this sector.";
  if (channel === "shop") return `${(100 - now).toFixed(0)}% sold in shops last December.`;
  const trend = now > before ? "up" : now < before ? "down" : "flat";
  return `${now}% sold online last December (${trend} from ${before}%).`;
};
