declare const BACKEND_HOST: string;

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
  const response = await fetch(`${BACKEND_HOST}/api/countries`);
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
 * Row values are keyed by indicator CODE (not the API's display name)
 * so the caller can look them up reliably.
 *
 * Returns rows sorted most-recent-year-first.
 */
export async function fetchIndicatorData(
  params: FetchIndicatorParams,
): Promise<IndicatorRow[]> {
  const { countryCode, indicatorCodes, dateRange } = params;

  const results = await Promise.allSettled(
    indicatorCodes.map((code) =>
      fetchSingleIndicator(countryCode, code, dateRange),
    ),
  );

  // If every single request failed, throw with the first error so the
  // caller can surface a meaningful message instead of "no data".
  const fulfilled = results.filter(
    (r): r is PromiseFulfilledResult<{ indicatorCode: string; points: WBDataPoint[] }> =>
      r.status === "fulfilled",
  );
  if (fulfilled.length === 0) {
    const firstRejection = results.find(
      (r): r is PromiseRejectedResult => r.status === "rejected",
    );
    throw new Error(
      firstRejection
        ? `All indicator requests failed. First error: ${firstRejection.reason}`
        : "All indicator requests failed with unknown errors.",
    );
  }

  const yearMap = new Map<string, IndicatorRow>();

  for (const result of fulfilled) {
    const { indicatorCode, points } = result.value;
    for (const point of points) {
      let row = yearMap.get(point.date);
      if (!row) {
        row = { year: point.date };
        yearMap.set(point.date, row);
      }
      row[indicatorCode] = point.value;
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
): Promise<{ indicatorCode: string; points: WBDataPoint[] }> {
  const dateParam = dateRange
    ? `?date=${dateRange.start}:${dateRange.end}`
    : "";
  const url = `${BACKEND_HOST}/api/indicator/${countryCode}/${indicatorCode}${dateParam}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch indicator ${indicatorCode}: ${response.status}`,
    );
  }

  const data = await response.json();
  const points: WBDataPoint[] = data[1] ?? [];

  return { indicatorCode, points };
}
