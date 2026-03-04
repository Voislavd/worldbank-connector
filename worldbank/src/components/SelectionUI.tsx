import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Rows,
  Columns,
  Select,
  FormField,
  Button,
  Text,
  Alert,
  TextInput,
  InputPill,
  Box,
  SegmentedControl,
  HorizontalCard,
  ChartLineIcon,
} from "@canva/app-ui-kit";
import type { RenderSelectionUiRequest } from "@canva/intents/data";

import { getCountries } from "../api/worldbank";
import { REPORTS, type Report, type IndicatorDef } from "../api/reports";
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

          <Rows spacing="1u">
            <Columns spacing="1u" alignY="center">
              <Text variant="bold" size="small">
                Indicators
              </Text>
              {selectedIndicators.length > 0 && (
                <Button variant="tertiary" onClick={clearAllIndicators}>
                  Clear all
                </Button>
              )}
            </Columns>

            {selectedIndicators.length > 0 ? (
              <Box padding="1u">
                <Rows spacing="0.5u">
                  {selectedIndicators.map((indicator) => (
                    <InputPill
                      key={indicator.code}
                      text={indicator.label}
                      onRemoveClick={() => removeIndicator(indicator.code)}
                    />
                  ))}
                </Rows>
              </Box>
            ) : (
              <Text size="small" tone="tertiary">
                Select a report from the Data tab or add indicators manually.
              </Text>
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
