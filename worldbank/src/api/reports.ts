// ─── Types ───────────────────────────────────────────────────────────

export interface IndicatorDef {
  code: string;
  label: string;
}

export interface Report {
  id: string;
  name: string;
  description: string;
  indicators: IndicatorDef[];
}

interface IndicatorFormat {
  format?: "number" | "currency" | "percent";
  decimals: number;
}

// ─── Curated Reports ─────────────────────────────────────────────────

export const REPORTS: Report[] = [
  {
    id: "economic-overview",
    name: "Economic Overview",
    description: "GDP, growth, inflation, and unemployment",
    indicators: [
      { code: "NY.GDP.MKTP.CD", label: "GDP (current US$)" },
      { code: "NY.GDP.PCAP.CD", label: "GDP per capita" },
      { code: "NY.GDP.MKTP.KD.ZG", label: "GDP growth (annual %)" },
      {
        code: "FP.CPI.TOTL.ZG",
        label: "Inflation, consumer prices (annual %)",
      },
      {
        code: "SL.UEM.TOTL.ZS",
        label: "Unemployment, total (% of labor force)",
      },
    ],
  },
  {
    id: "health-development",
    name: "Health & Development",
    description: "Health outcomes, life expectancy, and population",
    indicators: [
      { code: "SP.DYN.LE00.IN", label: "Life expectancy at birth" },
      {
        code: "SH.XPD.CHEX.GD.ZS",
        label: "Health expenditure (% of GDP)",
      },
      { code: "SP.DYN.IMRT.IN", label: "Infant mortality rate" },
      { code: "SH.MED.BEDS.ZS", label: "Hospital beds (per 1,000)" },
      { code: "SP.POP.TOTL", label: "Population, total" },
    ],
  },
  {
    id: "education-analysis",
    name: "Education Analysis",
    description: "School enrolment rates, government spending",
    indicators: [
      { code: "SE.PRM.ENRR", label: "Primary school enrollment (%)" },
      { code: "SE.SEC.ENRR", label: "Secondary school enrollment (%)" },
      { code: "SE.TER.ENRR", label: "Tertiary school enrollment (%)" },
      {
        code: "SE.XPD.TOTL.GD.ZS",
        label: "Education expenditure (% of GDP)",
      },
      { code: "SE.ADT.LITR.ZS", label: "Adult literacy rate (%)" },
    ],
  },
  {
    id: "climate-energy",
    name: "Climate & Energy",
    description: "Emissions, energy use, and forest coverage",
    indicators: [
      { code: "EN.ATM.CO2E.PC", label: "CO2 emissions (metric tons per capita)" },
      { code: "EG.USE.PCAP.KG.OE", label: "Energy use (kg of oil eq. per capita)" },
      {
        code: "EG.ELC.RNEW.ZS",
        label: "Renewable electricity (% of total)",
      },
      {
        code: "EN.ATM.GHGT.KT.CE",
        label: "Greenhouse gas emissions (kt of CO2 eq.)",
      },
      { code: "AG.LND.FRST.ZS", label: "Forest area (% of land)" },
    ],
  },
];

// ─── Browsable Indicator Catalog ─────────────────────────────────────

export interface IndicatorCategory {
  name: string;
  indicators: IndicatorDef[];
}

export const INDICATOR_CATALOG: IndicatorCategory[] = [
  {
    name: "Popular",
    indicators: [
      { code: "NY.GDP.MKTP.CD", label: "GDP (current US$)" },
      { code: "NY.GDP.PCAP.CD", label: "GDP per capita" },
      { code: "SP.POP.TOTL", label: "Population, total" },
      { code: "SP.DYN.LE00.IN", label: "Life expectancy at birth" },
      { code: "EN.ATM.CO2E.PC", label: "CO2 emissions (metric tons per capita)" },
      { code: "FP.CPI.TOTL.ZG", label: "Inflation, consumer prices (annual %)" },
      { code: "SL.UEM.TOTL.ZS", label: "Unemployment, total (% of labor force)" },
      { code: "NY.GDP.MKTP.KD.ZG", label: "GDP growth (annual %)" },
      { code: "SE.ADT.LITR.ZS", label: "Adult literacy rate (%)" },
      { code: "AG.LND.FRST.ZS", label: "Forest area (% of land)" },
    ],
  },
  {
    name: "Economy",
    indicators: [
      { code: "NY.GNP.MKTP.CD", label: "GNI (current US$)" },
      { code: "NY.GNP.PCAP.CD", label: "GNI per capita" },
      { code: "NE.TRD.GNFS.ZS", label: "Trade (% of GDP)" },
      { code: "BX.KLT.DINV.WD.GD.ZS", label: "Foreign direct investment (% of GDP)" },
      { code: "GC.DOD.TOTL.GD.ZS", label: "Central government debt (% of GDP)" },
      { code: "GC.REV.XGRT.GD.ZS", label: "Revenue, excl. grants (% of GDP)" },
      { code: "NE.EXP.GNFS.ZS", label: "Exports of goods and services (% of GDP)" },
      { code: "NE.IMP.GNFS.ZS", label: "Imports of goods and services (% of GDP)" },
      { code: "FI.RES.TOTL.CD", label: "Total reserves (current US$)" },
      { code: "PA.NUS.FCRF", label: "Official exchange rate (per US$)" },
    ],
  },
  {
    name: "Health",
    indicators: [
      { code: "SH.XPD.CHEX.GD.ZS", label: "Health expenditure (% of GDP)" },
      { code: "SP.DYN.IMRT.IN", label: "Infant mortality rate" },
      { code: "SH.MED.BEDS.ZS", label: "Hospital beds (per 1,000)" },
      { code: "SH.MED.PHYS.ZS", label: "Physicians (per 1,000 people)" },
      { code: "SH.STA.MMRT", label: "Maternal mortality ratio" },
      { code: "SH.HIV.INCD.ZS", label: "HIV incidence (per 1,000)" },
      { code: "SH.IMM.MEAS", label: "Measles immunization (% of children)" },
      { code: "SH.STA.STNT.ZS", label: "Stunting prevalence (% under 5)" },
    ],
  },
  {
    name: "Education",
    indicators: [
      { code: "SE.PRM.ENRR", label: "Primary school enrollment (%)" },
      { code: "SE.SEC.ENRR", label: "Secondary school enrollment (%)" },
      { code: "SE.TER.ENRR", label: "Tertiary school enrollment (%)" },
      { code: "SE.XPD.TOTL.GD.ZS", label: "Education expenditure (% of GDP)" },
      { code: "SE.COM.DURS", label: "Compulsory education duration (years)" },
      { code: "SE.PRM.TCHR", label: "Primary education teachers" },
      { code: "SE.SEC.PROG.ZS", label: "Progression to secondary school (%)" },
    ],
  },
  {
    name: "Environment",
    indicators: [
      { code: "EG.USE.PCAP.KG.OE", label: "Energy use (kg of oil eq. per capita)" },
      { code: "EG.ELC.RNEW.ZS", label: "Renewable electricity (% of total)" },
      { code: "EN.ATM.GHGT.KT.CE", label: "Greenhouse gas emissions (kt of CO2 eq.)" },
      { code: "EG.ELC.ACCS.ZS", label: "Access to electricity (% of population)" },
      { code: "EG.FEC.RNEW.ZS", label: "Renewable energy consumption (%)" },
      { code: "ER.PTD.TOTL.ZS", label: "Terrestrial protected areas (%)" },
      { code: "EN.ATM.PM25.MC.M3", label: "PM2.5 air pollution (micrograms/m3)" },
    ],
  },
  {
    name: "Demographics",
    indicators: [
      { code: "SP.POP.GROW", label: "Population growth (annual %)" },
      { code: "SP.URB.TOTL.IN.ZS", label: "Urban population (% of total)" },
      { code: "SP.DYN.TFRT.IN", label: "Fertility rate (births per woman)" },
      { code: "SP.DYN.CDRT.IN", label: "Death rate (per 1,000 people)" },
      { code: "SP.DYN.CBRT.IN", label: "Birth rate (per 1,000 people)" },
      { code: "SM.POP.NETM", label: "Net migration" },
      { code: "SP.POP.DPND", label: "Age dependency ratio (% of working-age)" },
      { code: "SP.POP.65UP.TO.ZS", label: "Population ages 65+ (% of total)" },
    ],
  },
];

// ─── Lookup Helpers ──────────────────────────────────────────────────

const ALL_INDICATORS = INDICATOR_CATALOG.flatMap((c) => c.indicators);

const INDICATOR_LABEL_MAP = new Map(
  ALL_INDICATORS.map((i) => [i.code, i.label]),
);

export function getReportById(id: string): Report | undefined {
  return REPORTS.find((r) => r.id === id);
}

export function getIndicatorLabel(code: string): string {
  return INDICATOR_LABEL_MAP.get(code) ?? code;
}

// ─── Number Formatting ──────────────────────────────────────────────

const FORMAT_MAP: Record<string, IndicatorFormat> = {
  "NY.GDP.MKTP.CD": { format: "currency", decimals: 0 },
  "NY.GDP.PCAP.CD": { format: "currency", decimals: 0 },
  "NY.GDP.MKTP.KD.ZG": { format: "percent", decimals: 2 },
  "FP.CPI.TOTL.ZG": { format: "percent", decimals: 2 },
  "SL.UEM.TOTL.ZS": { format: "percent", decimals: 1 },
  "SP.DYN.LE00.IN": { format: "number", decimals: 1 },
  "SH.XPD.CHEX.GD.ZS": { format: "percent", decimals: 1 },
  "SP.DYN.IMRT.IN": { format: "number", decimals: 1 },
  "SH.MED.BEDS.ZS": { format: "number", decimals: 1 },
  "SP.POP.TOTL": { format: "number", decimals: 0 },
  "SE.PRM.ENRR": { format: "percent", decimals: 1 },
  "SE.SEC.ENRR": { format: "percent", decimals: 1 },
  "SE.TER.ENRR": { format: "percent", decimals: 1 },
  "SE.XPD.TOTL.GD.ZS": { format: "percent", decimals: 1 },
  "SE.ADT.LITR.ZS": { format: "percent", decimals: 1 },
  "EN.ATM.CO2E.PC": { format: "number", decimals: 2 },
  "EG.USE.PCAP.KG.OE": { format: "number", decimals: 0 },
  "EG.ELC.RNEW.ZS": { format: "percent", decimals: 1 },
  "EN.ATM.GHGT.KT.CE": { format: "number", decimals: 0 },
  "AG.LND.FRST.ZS": { format: "percent", decimals: 1 },
  "NY.GNP.MKTP.CD": { format: "currency", decimals: 0 },
  "NY.GNP.PCAP.CD": { format: "currency", decimals: 0 },
  "NE.TRD.GNFS.ZS": { format: "percent", decimals: 1 },
  "BX.KLT.DINV.WD.GD.ZS": { format: "percent", decimals: 2 },
  "GC.DOD.TOTL.GD.ZS": { format: "percent", decimals: 1 },
  "GC.REV.XGRT.GD.ZS": { format: "percent", decimals: 1 },
  "NE.EXP.GNFS.ZS": { format: "percent", decimals: 1 },
  "NE.IMP.GNFS.ZS": { format: "percent", decimals: 1 },
  "FI.RES.TOTL.CD": { format: "currency", decimals: 0 },
  "PA.NUS.FCRF": { format: "number", decimals: 2 },
  "SH.MED.PHYS.ZS": { format: "number", decimals: 1 },
  "SH.STA.MMRT": { format: "number", decimals: 0 },
  "SH.HIV.INCD.ZS": { format: "number", decimals: 2 },
  "SH.IMM.MEAS": { format: "percent", decimals: 1 },
  "SH.STA.STNT.ZS": { format: "percent", decimals: 1 },
  "SE.COM.DURS": { format: "number", decimals: 0 },
  "SE.PRM.TCHR": { format: "number", decimals: 0 },
  "SE.SEC.PROG.ZS": { format: "percent", decimals: 1 },
  "EG.ELC.ACCS.ZS": { format: "percent", decimals: 1 },
  "EG.FEC.RNEW.ZS": { format: "percent", decimals: 1 },
  "ER.PTD.TOTL.ZS": { format: "percent", decimals: 1 },
  "EN.ATM.PM25.MC.M3": { format: "number", decimals: 1 },
  "SP.POP.GROW": { format: "percent", decimals: 2 },
  "SP.URB.TOTL.IN.ZS": { format: "percent", decimals: 1 },
  "SP.DYN.TFRT.IN": { format: "number", decimals: 1 },
  "SP.DYN.CDRT.IN": { format: "number", decimals: 1 },
  "SP.DYN.CBRT.IN": { format: "number", decimals: 1 },
  "SM.POP.NETM": { format: "number", decimals: 0 },
  "SP.POP.DPND": { format: "percent", decimals: 1 },
  "SP.POP.65UP.TO.ZS": { format: "percent", decimals: 1 },
};

export function getIndicatorFormat(code: string): IndicatorFormat {
  return FORMAT_MAP[code] ?? { format: "number", decimals: 2 };
}

export function formatValue(value: number | null, code: string): string {
  if (value === null || value === undefined) return "—";
  const fmt = getIndicatorFormat(code);
  switch (fmt.format) {
    case "currency":
      return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: fmt.decimals,
      });
    case "percent":
      return `${value.toFixed(fmt.decimals)}%`;
    default:
      return value.toLocaleString("en-US", {
        maximumFractionDigits: fmt.decimals,
      });
  }
}
