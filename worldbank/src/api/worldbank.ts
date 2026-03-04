const WB_BASE = "https://api.worldbank.org/v2";

// ─── Types ───────────────────────────────────────────────────────────

export interface WBCountry {
  id: string;
  iso2Code: string;
  name: string;
  region: { id: string; iso2code: string; value: string };
  incomeLevel: { id: string; iso2code: string; value: string };
  capitalCity: string;
}

export interface FetchIndicatorParams {
  countryCode: string;
  indicatorCodes: string[];
  dateRange?: { start: number; end: number };
}

export interface IndicatorRow {
  year: string;
  [indicatorLabel: string]: string | number | null;
}

interface WBDataPoint {
  indicator: { id: string; value: string };
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: number | null;
  unit: string;
  obs_status: string;
  decimal: number;
}

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Fetches the list of countries from the World Bank API,
 * filtering out aggregate/regional entries.
 */
export async function getCountries(): Promise<WBCountry[]> {
  const url = `${WB_BASE}/country?format=json&per_page=300`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch countries: ${response.status}`);
  }
  const data = await response.json();
  const countries: WBCountry[] = data[1] ?? [];
  return countries.filter((c) => c.region.id !== "NA");
}

/**
 * Fetches indicator data for a country, querying each indicator in
 * parallel and merging results into rows keyed by year.
 *
 * Returns rows sorted most-recent-year-first.
 */
export async function fetchIndicatorData(
  params: FetchIndicatorParams,
): Promise<IndicatorRow[]> {
  const { countryCode, indicatorCodes, dateRange } = params;

  const fetches = indicatorCodes.map((code) =>
    fetchSingleIndicator(countryCode, code, dateRange),
  );
  const results = await Promise.all(fetches);

  // Merge all indicators into a single map keyed by year
  const yearMap = new Map<string, IndicatorRow>();

  for (const { indicatorName, points } of results) {
    for (const point of points) {
      let row = yearMap.get(point.date);
      if (!row) {
        row = { year: point.date };
        yearMap.set(point.date, row);
      }
      row[indicatorName] = point.value;
    }
  }

  return Array.from(yearMap.values()).sort(
    (a, b) => Number(b.year) - Number(a.year),
  );
}

// ─── Internal ────────────────────────────────────────────────────────

async function fetchSingleIndicator(
  countryCode: string,
  indicatorCode: string,
  dateRange?: { start: number; end: number },
): Promise<{ indicatorName: string; points: WBDataPoint[] }> {
  const params = new URLSearchParams({
    format: "json",
    per_page: "1000",
  });
  if (dateRange) {
    params.set("date", `${dateRange.start}:${dateRange.end}`);
  }

  const url = `${WB_BASE}/country/${countryCode}/indicator/${indicatorCode}?${params}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch indicator ${indicatorCode}: ${response.status}`,
    );
  }

  const data = await response.json();
  const points: WBDataPoint[] = data[1] ?? [];
  const indicatorName =
    points[0]?.indicator?.value ?? indicatorCode;

  return { indicatorName, points };
}
