// Pulls official UK (ONS) and EU (Eurostat) retail volumes and merges them with
// the Irish CSO figures into src/data/markets.json. Run after fetch-cso.mjs.
import { readFileSync, writeFileSync } from "node:fs";

const YEARS = [2021, 2022, 2023, 2024, 2025];
const BACKTEST = [2022, 2023, 2024, 2025];
const MONTHS = { JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06", JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12" };

const LABELS = {
  all: "Market",
  toys: "Toys, gifts & leisure",
  electrical: "Electronics & electrical",
  clothing: "Clothes & shoes",
  beauty: "Pharmacy & beauty",
  books: "Books & stationery",
  home: "Home & furniture",
  hardware: "Hardware & DIY",
  food: "Specialist food & drink",
  online: "Online shops",
};

const ONS = {
  all: "EAGX",
  toys: "EAHA",
  electrical: "J43X",
  clothing: "EAGY",
  beauty: "EAQS",
  books: "JKO7",
  home: "EAQK",
  hardware: "EAQM",
  food: "CY3Y",
  online: "EAQP",
};

const EUROSTAT = {
  all: "G47_X_G473",
  toys: "G476",
  electrical: "G474",
  clothing: "G47_NF_CLTH",
  beauty: "G47_NF_HLTH",
  home: "G475",
  food: "G472",
  online: "G4791",
};

const EU_GEOS = { EU27_2020: "EU (27 countries)", DE: "Germany", FR: "France", ES: "Spain", IT: "Italy", NL: "Netherlands" };

const pct = (a, b) => Math.round((a / b - 1) * 1000) / 10;
const key = (y, m) => `${y}-${String(m).padStart(2, "0")}`;

const metrics = (series) => {
  const at = (y, m) => series[key(y, m)];
  const sum = (y, ms) => ms.reduce((s, m) => s + at(y, m), 0);
  const months = Object.keys(series).sort();
  const latest = months.at(-1);
  const [ly, lm] = latest.split("-").map(Number);
  const recent = [0, 1, 2].map((i) => {
    const d = new Date(Date.UTC(ly, lm - 1 - i, 1));
    return [d.getUTCFullYear(), d.getUTCMonth() + 1];
  });
  const avg2025 = sum(2025, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) / 12;
  const xmas = (y) => sum(y, [11, 12]);
  const autumn = (y) => sum(y, [8, 9, 10]);
  return {
    christmas: YEARS.map((y) => Math.round(xmas(y) * 10) / 10),
    novemberLift: Math.round((at(2025, 11) / avg2025 - 1) * 100),
    decemberLift: Math.round((at(2025, 12) / avg2025 - 1) * 100),
    lastBlackFridayChange: pct(at(2025, 11), at(2024, 11)),
    lastChristmasChange: pct(xmas(2025), xmas(2024)),
    momentum2026: pct(
      recent.reduce((s, [y, m]) => s + at(y, m), 0),
      recent.reduce((s, [y, m]) => s + at(y - 1, m), 0),
    ),
    backtest: BACKTEST.map((y) => ({ year: y, signal: pct(autumn(y), autumn(y - 1)), outcome: pct(xmas(y), xmas(y - 1)) })),
    latest,
  };
};

const score = (cats) => {
  const market = cats.find((c) => c.id === "all");
  return cats.map((c) => ({
    ...c,
    backtestHits: c.backtest.filter((b, i) => Math.sign(b.signal - market.backtest[i].signal) === Math.sign(b.outcome - market.backtest[i].outcome)).length,
    backtestYears: c.backtest.length,
  }));
};

const fetchOns = async (cdid) => {
  const url = `https://www.ons.gov.uk/businessindustryandtrade/retailindustry/timeseries/${cdid.toLowerCase()}/drsi`;
  const res = await fetch(`${url}/data`);
  if (!res.ok) throw new Error(`ONS ${cdid} failed: ${res.status}`);
  const json = await res.json();
  const series = Object.fromEntries(
    json.months.map((m) => {
      const [y, mon] = m.date.split(" ");
      return [`${y}-${MONTHS[mon]}`, Number(m.value)];
    }),
  );
  return { series, url };
};

const fetchEurostat = async () => {
  const params = new URLSearchParams({ format: "JSON", lang: "EN", indic_bt: "VOL_SLS", s_adj: "NSA", unit: "I21", sinceTimePeriod: "2020-01" });
  Object.values(EUROSTAT).forEach((n) => params.append("nace_r2", n));
  Object.keys(EU_GEOS).forEach((g) => params.append("geo", g));
  const res = await fetch(`https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sts_trtu_m?${params}`);
  if (!res.ok) throw new Error(`Eurostat failed: ${res.status}`);
  const d = await res.json();
  const dims = d.id;
  const sizes = d.size;
  const idx = (dim, code) => d.dimension[dim].category.index[code];
  const times = Object.keys(d.dimension.time.category.index);
  const flat = (coords) => dims.reduce((acc, dim, i) => acc * sizes[i] + coords[dim], 0);
  return (nace, geo) =>
    Object.fromEntries(
      times
        .map((t) => {
          const coords = { freq: 0, indic_bt: 0, s_adj: 0, unit: 0, nace_r2: idx("nace_r2", nace), geo: idx("geo", geo), time: idx("time", t) };
          return [t, d.value[String(flat(coords))]];
        })
        .filter(([, v]) => v !== undefined && v !== null),
    );
};

const main = async () => {
  const cso = JSON.parse(readFileSync(new URL("../src/data/cso.json", import.meta.url)));
  const markets = [
    {
      id: "IE",
      name: "Ireland",
      source: { name: "CSO", dataset: "RSM08", url: cso.datasets.RSM08.url },
      latest: cso.latestMonth,
      categories: cso.categories.map((c) => ({ ...c, url: cso.datasets.RSM08.url, code: "RSM08" })),
    },
  ];

  const ukCats = await Promise.all(
    Object.entries(ONS).map(async ([id, cdid]) => {
      const { series, url } = await fetchOns(cdid);
      return { id, label: id === "all" ? "UK non-food retail" : LABELS[id], code: cdid, url, ...metrics(series) };
    }),
  );
  markets.push({ id: "UK", name: "United Kingdom", source: { name: "ONS", dataset: "Retail sales index", url: "https://www.ons.gov.uk/businessindustryandtrade/retailindustry/datasets/retailsales" }, latest: ukCats[0].latest, categories: score(ukCats) });

  const eu = await fetchEurostat();
  const euUrl = "https://ec.europa.eu/eurostat/databrowser/view/sts_trtu_m/default/table";
  for (const [geo, name] of Object.entries(EU_GEOS)) {
    const cats = Object.entries(EUROSTAT)
      .map(([id, nace]) => {
        const series = eu(nace, geo);
        try {
          return { id, label: id === "all" ? `${name} retail` : LABELS[id], code: nace, url: euUrl, ...metrics(series) };
        } catch {
          return null;
        }
      })
      .filter((c) => c && Object.values(c).every((v) => !(typeof v === "number" && Number.isNaN(v))));
    if (cats.some((c) => c.id === "all")) {
      markets.push({ id: geo, name, source: { name: "Eurostat", dataset: "sts_trtu_m", url: euUrl }, latest: cats[0].latest, categories: score(cats) });
    }
  }

  writeFileSync(new URL("../src/data/markets.json", import.meta.url), JSON.stringify({ fetchedAt: new Date().toISOString().slice(0, 10), markets }, null, 2));
  for (const m of markets) {
    console.log(m.id, m.latest, m.categories.map((c) => `${c.id}:${c.novemberLift}/${c.decemberLift}/${c.momentum2026}/${c.backtestHits}`).join(" "));
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
