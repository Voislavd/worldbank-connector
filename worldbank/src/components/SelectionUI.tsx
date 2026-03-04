import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Rows,
  Select,
  FormField,
  Button,
  Text,
  Alert,
  TextInput,
  Box,
  SegmentedControl,
  HorizontalCard,
  ChartLineIcon,
  PillsInput,
  Menu,
  MenuItem,
  MenuDivider,
  CheckIcon,
} from "@canva/app-ui-kit";
import type { PillsInputItem } from "@canva/app-ui-kit";
import type { RenderSelectionUiRequest } from "@canva/intents/data";

import { getCountries } from "../api/worldbank";
import {
  REPORTS,
  INDICATOR_CATALOG,
  type Report,
  type IndicatorDef,
} from "../api/reports";
import type { WorldBankSourceConfig } from "../intents/data_connector";

// ─── Types ───────────────────────────────────────────────────────────

type Tab = "data" | "filter";

interface CountryOption {
  value: string;
  label: string;
}

// ─── Main Component ──────────────────────────────────────────────────

export function SelectionUI({
  updateDataRef,
  limit,
  invocationContext,
}: RenderSelectionUiRequest) {
  const [activeTab, setActiveTab] = useState<Tab>("data");

  // Filter state
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCountryName, setSelectedCountryName] = useState<string>("");
  const [selectedIndicators, setSelectedIndicators] = useState<IndicatorDef[]>(
    [],
  );
  const [dateRange, setDateRange] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [indicatorSearch, setIndicatorSearch] = useState("");
  const [showIndicatorDropdown, setShowIndicatorDropdown] = useState(false);
  const blurTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ─── Load countries on mount ────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const data = await getCountries();
        const options = data
          .map((c) => ({ value: c.id, label: c.name }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCountries(options);
      } catch {
        setError("Failed to load countries.");
      } finally {
        setCountriesLoading(false);
      }
    })();
  }, []);

  // ─── Handle invocation context (edit / error recovery) ──────────────

  useEffect(() => {
    if (
      invocationContext.reason === "data_selection" &&
      invocationContext.dataSourceRef
    ) {
      try {
        const config: WorldBankSourceConfig = JSON.parse(
          invocationContext.dataSourceRef.source,
        );
        setSelectedCountry(config.countryCode);
        setSelectedCountryName(config.countryName);
        setSelectedIndicators(
          config.indicatorCodes.map((code, i) => ({
            code,
            label: config.indicatorLabels[i] || code,
          })),
        );
        if (config.dateRange) {
          setDateRange("custom");
        }
        setActiveTab("filter");
      } catch {
        // Couldn't parse existing ref, start fresh
      }
    }

    if (invocationContext.reason === "outdated_source_ref") {
      setError(
        "Your previous data source is no longer available. Please select new data.",
      );
    }

    if (invocationContext.reason === "app_error") {
      setError(
        (invocationContext as any).message ||
          "An error occurred. Please try again.",
      );
    }
  }, [invocationContext]);

  // ─── Date range mapping ─────────────────────────────────────────────

  const dateRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "10y", label: "Last 10 Years" },
    { value: "5y", label: "Last 5 Years" },
    { value: "20y", label: "Last 20 Years" },
  ];

  const getDateRange = useCallback(():
    | { start: number; end: number }
    | undefined => {
    const currentYear = new Date().getFullYear();
    switch (dateRange) {
      case "5y":
        return { start: currentYear - 5, end: currentYear };
      case "10y":
        return { start: currentYear - 10, end: currentYear };
      case "20y":
        return { start: currentYear - 20, end: currentYear };
      default:
        return undefined;
    }
  }, [dateRange]);

  // ─── Report card click → pre-fill filters ───────────────────────────

  const handleReportClick = useCallback((report: Report) => {
    setSelectedIndicators([...report.indicators]);
    setActiveTab("filter");
    setError(null);
  }, []);

  // ─── Indicator management ───────────────────────────────────────────

  const removeIndicator = useCallback((code: string) => {
    setSelectedIndicators((prev) => prev.filter((i) => i.code !== code));
  }, []);

  const clearAllIndicators = useCallback(() => {
    setSelectedIndicators([]);
  }, []);

  const addIndicator = useCallback((indicator: IndicatorDef) => {
    setSelectedIndicators((prev) => {
      if (prev.some((i) => i.code === indicator.code)) return prev;
      return [...prev, indicator];
    });
    setIndicatorSearch("");
  }, []);

  const handlePillAdd = useCallback(
    (value: string) => {
      const q = value.toLowerCase().trim();
      if (!q) return;
      const allIndicators = INDICATOR_CATALOG.flatMap((c) => c.indicators);
      const match = allIndicators.find(
        (i) =>
          i.label.toLowerCase() === q || i.code.toLowerCase() === q,
      );
      if (match) addIndicator(match);
    },
    [addIndicator],
  );

  const selectedCodes = useMemo(
    () => new Set(selectedIndicators.map((i) => i.code)),
    [selectedIndicators],
  );

  const pillsValue: PillsInputItem[] = useMemo(
    () =>
      selectedIndicators.map((ind) => ({
        value: ind.label,
        onRemoveClick: () => removeIndicator(ind.code),
      })),
    [selectedIndicators, removeIndicator],
  );

  const filteredCatalog = useMemo(() => {
    const q = indicatorSearch.toLowerCase().trim();
    if (!q) return INDICATOR_CATALOG;
    return INDICATOR_CATALOG.map((cat) => ({
      ...cat,
      indicators: cat.indicators.filter(
        (i) =>
          i.label.toLowerCase().includes(q) ||
          i.code.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.indicators.length > 0);
  }, [indicatorSearch]);

  // ─── Country selection ──────────────────────────────────────────────

  const handleCountryChange = useCallback(
    (value: string) => {
      setSelectedCountry(value);
      const country = countries.find((c) => c.value === value);
      setSelectedCountryName(country?.label || value);
    },
    [countries],
  );

  // ─── Load data ─────────────────────────────────────────────────────

  const canLoadData =
    selectedCountry && selectedIndicators.length > 0 && !isLoading;

  const handleLoadData = useCallback(async () => {
    if (!canLoadData) return;

    setIsLoading(true);
    setError(null);

    const config: WorldBankSourceConfig = {
      countryCode: selectedCountry,
      countryName: selectedCountryName,
      indicatorCodes: selectedIndicators.map((i) => i.code),
      indicatorLabels: selectedIndicators.map((i) => i.label),
      dateRange: getDateRange(),
      reportId: undefined,
    };

    try {
      const result = await updateDataRef({
        source: JSON.stringify(config),
        title: `World Bank \u00b7 ${selectedCountryName}`,
      });

      if (result.status !== "completed") {
        const msg =
          "message" in result && result.message
            ? result.message
            : `Error: ${result.status}`;
        setError(msg);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    canLoadData,
    selectedCountry,
    selectedCountryName,
    selectedIndicators,
    getDateRange,
    updateDataRef,
  ]);

  // ─── Filtered reports for search ────────────────────────────────────

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return REPORTS;
    const q = searchQuery.toLowerCase();
    return REPORTS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.indicators.some((i) => i.label.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <Box paddingTop="2u" paddingEnd="2u" paddingBottom="2u">
    <Rows spacing="1u">
      <SegmentedControl
        options={[
          { value: "data", label: "Data" },
          { value: "filter", label: "Filter data" },
        ]}
        value={activeTab}
        onChange={(value) => setActiveTab(value as Tab)}
      />

      {error && (
        <Alert tone="critical" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* ─── DATA TAB: Curated Reports ─── */}
      {activeTab === "data" && (
        <Rows spacing="1.5u">
          <TextInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search from World Bank"
          />

          <Text variant="bold" size="small">
            Reports
          </Text>

          {filteredReports.map((report) => (
            <HorizontalCard
              key={report.id}
              title={report.name}
              description={report.description}
              thumbnail={{ icon: () => <ChartLineIcon /> }}
              onClick={() => handleReportClick(report)}
              ariaLabel={`Select ${report.name} report`}
            />
          ))}

          {filteredReports.length === 0 && (
            <Text size="small" tone="tertiary" alignment="center">
              No reports match your search.
            </Text>
          )}
        </Rows>
      )}

      {/* ─── FILTER TAB: Manual Query Builder ─── */}
      {activeTab === "filter" && (
        <Rows spacing="2u">
          <FormField
            label="Date range"
            value={dateRange}
            control={(props) => (
              <Select
                {...props}
                options={dateRangeOptions}
                onChange={setDateRange}
                stretch
              />
            )}
          />

          <FormField
            label="Country or region"
            value={selectedCountry}
            control={(props) => (
              <Select
                {...props}
                options={countries}
                onChange={handleCountryChange}
                placeholder="Select country"
                disabled={countriesLoading}
                stretch
              />
            )}
          />

          <Rows spacing="0.5u">
            <FormField
              label="Indicators"
              control={() => (
                <PillsInput
                  value={pillsValue}
                  inputValue={indicatorSearch}
                  onInputChange={setIndicatorSearch}
                  placeholder="Select indicators"
                  additionalPlaceholder="Add more..."
                  ariaLabel="Select indicators"
                  maxRows={4}
                  onPillAdd={handlePillAdd}
                  onLastPillRemove={() =>
                    setSelectedIndicators((prev) => prev.slice(0, -1))
                  }
                  onClearClick={
                    selectedIndicators.length > 0
                      ? clearAllIndicators
                      : undefined
                  }
                  onFocus={() => {
                    clearTimeout(blurTimeout.current);
                    setShowIndicatorDropdown(true);
                  }}
                  onBlur={() => {
                    blurTimeout.current = setTimeout(
                      () => setShowIndicatorDropdown(false),
                      200,
                    );
                  }}
                />
              )}
            />

            {showIndicatorDropdown && (
              <div
                onMouseDown={(e) => e.preventDefault()}
                style={{
                  maxHeight: "240px",
                  overflowY: "auto",
                  borderRadius: "8px",
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.15)",
                  border: "1px solid var(--ui-kit-color-border, rgba(0,0,0,0.1))",
                  background: "var(--ui-kit-color-surface, #fff)",
                }}
              >
                <Menu>
                  {filteredCatalog.map((cat, catIdx) => (
                    <span key={cat.name}>
                      {catIdx > 0 && <MenuDivider />}
                      <MenuItem disabled label={cat.name} />
                      {cat.indicators.map((ind) => {
                        const isSelected = selectedCodes.has(ind.code);
                        return (
                          <MenuItem
                            key={ind.code}
                            label={ind.label}
                            onClick={() => {
                              if (!isSelected) addIndicator(ind);
                            }}
                            end={isSelected ? () => <CheckIcon /> : undefined}
                          />
                        );
                      })}
                    </span>
                  ))}
                  {filteredCatalog.length === 0 && (
                    <MenuItem disabled label="No indicators found" />
                  )}
                </Menu>
              </div>
            )}
          </Rows>

          <Button
            variant="primary"
            onClick={handleLoadData}
            disabled={!canLoadData}
            loading={isLoading}
            stretch
          >
            Load data
          </Button>
        </Rows>
      )}
    </Rows>
    </Box>
  );
}
