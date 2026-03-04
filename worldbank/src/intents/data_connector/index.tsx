import "@canva/app-ui-kit/styles.css";
import { createRoot } from "react-dom/client";
import { AppI18nProvider } from "@canva/app-i18n-kit";
import { AppUiProvider } from "@canva/app-ui-kit";
import {
  prepareDataConnector,
  type RenderSelectionUiRequest,
  type GetDataTableRequest,
  type DataTable,
  type DataTableRow,
} from "@canva/intents/data";

import { fetchIndicatorData } from "../../api/worldbank";
import { getIndicatorLabel, getIndicatorFormat } from "../../api/reports";
import { SelectionUI } from "../../components/SelectionUI";

// ─── Types ───────────────────────────────────────────────────────────

/**
 * Encoded in the DataSourceRef.source string as JSON.
 * Contains everything needed to re-fetch this exact query.
 */
export interface WorldBankSourceConfig {
  countryCode: string;
  countryName: string;
  indicatorCodes: string[];
  indicatorLabels: string[];
  dateRange?: { start: number; end: number };
  reportId?: string;
}

// ─── getDataTable ────────────────────────────────────────────────────

async function getDataTable(request: GetDataTableRequest) {
  const { dataSourceRef, limit } = request;

  let config: WorldBankSourceConfig;
  try {
    config = JSON.parse(dataSourceRef.source) as WorldBankSourceConfig;
  } catch {
    return {
      status: "app_error" as const,
      message: "Invalid data source reference. Please select your data again.",
    };
  }

  if (!config.countryCode || !config.indicatorCodes?.length) {
    return {
      status: "app_error" as const,
      message: "Missing country or indicators. Please reconfigure your query.",
    };
  }

  let rawData;
  try {
    rawData = await fetchIndicatorData({
      countryCode: config.countryCode,
      indicatorCodes: config.indicatorCodes,
      dateRange: config.dateRange,
    });
  } catch {
    return { status: "remote_request_failed" as const };
  }

  if (!rawData.length) {
    return {
      status: "app_error" as const,
      message: `No data found for ${config.countryName}. Try a different country or date range.`,
    };
  }

  const indicatorNames = config.indicatorLabels.length
    ? config.indicatorLabels
    : config.indicatorCodes.map(getIndicatorLabel);

  const maxIndicatorCols = Math.max(1, limit.column - 1);
  const visibleIndicators = indicatorNames.slice(0, maxIndicatorCols);
  const visibleCodes = config.indicatorCodes.slice(0, maxIndicatorCols);

  const columnConfigs = [
    { name: "Year", type: "string" as const },
    ...visibleIndicators.map((name) => ({
      name,
      type: "number" as const,
    })),
  ];

  const limitedData = rawData.slice(0, limit.row);

  const rows: DataTableRow[] = limitedData.map((row) => ({
    cells: [
      { type: "string" as const, value: row.year },
      ...visibleCodes.map((code) => {
        const value = row[code] as number | null;
        const fmt = getIndicatorFormat(code);

        const formatting =
          value != null && fmt.format
            ? getNumberFormat(fmt.format, fmt.decimals)
            : undefined;

        return {
          type: "number" as const,
          value: value ?? undefined,
          ...(formatting ? { metadata: { formatting } } : {}),
        };
      }),
    ],
  }));

  return {
    status: "completed" as const,
    dataTable: {
      columnConfigs,
      rows,
    } satisfies DataTable,
    metadata: {
      description:
        rawData.length > limitedData.length
          ? `Showing ${limitedData.length} of ${rawData.length} years of data for ${config.countryName}`
          : `${limitedData.length} years of data for ${config.countryName}`,
    },
  };
}

// ─── renderSelectionUi ───────────────────────────────────────────────

function renderSelectionUi(request: RenderSelectionUiRequest) {
  const root = createRoot(document.getElementById("root") as Element);
  root.render(
    <AppI18nProvider>
      <AppUiProvider>
        <SelectionUI {...request} />
      </AppUiProvider>
    </AppI18nProvider>,
  );
}

// ─── Register the intent ─────────────────────────────────────────────

const dataConnector = {
  getDataTable,
  renderSelectionUi,
};

prepareDataConnector(dataConnector);

// ─── Helpers ─────────────────────────────────────────────────────────

function getNumberFormat(
  format?: "number" | "currency" | "percent",
  decimals = 2,
): string {
  const decimalPlaces = "0".repeat(decimals);
  const decimalPart = decimals > 0 ? `.${decimalPlaces}` : "";

  switch (format) {
    case "currency":
      return `[$$]#,##0${decimalPart}`;
    case "percent":
      return `0${decimalPart}%`;
    default:
      return `#,##0${decimalPart}`;
  }
}
