/**
 * Typed ApexCharts configuration interfaces.
 *
 * Each interface groups the option bags that an `<apx-chart>` directive
 * accepts, giving components full type-safety when building chart configs.
 */

import type {
  ApexAnnotations,
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts'

/**
 * General-purpose chart configuration for line and radar charts.
 *
 * Used by the metrics-overview component.
 */
export interface ChartConfig {
  /**
   * Data series to plot.
   */
  series: ApexAxisChartSeries

  /**
   * Core chart settings (type, height, toolbar, etc.).
   */
  chart: ApexChart

  /**
   * X-axis configuration.
   */
  xaxis: ApexXAxis

  /**
   * Y-axis configuration.
   */
  yaxis: ApexYAxis

  /**
   * Series colour palette.
   */
  colors: string[]

  /**
   * Stroke / line styling.
   */
  stroke: ApexStroke

  /**
   * Data-point marker styling.
   */
  markers: ApexMarkers

  /**
   * Tooltip configuration.
   */
  tooltip: ApexTooltip

  /**
   * Legend display settings.
   */
  legend: ApexLegend

  /**
   * Background grid lines.
   */
  grid: ApexGrid

  /**
   * Data-label display options.
   */
  dataLabels: ApexDataLabels

  /**
   * Area / radar fill options (used by radar chart).
   */
  fill?: ApexFill
}

/**
 * Typed chart configuration for the gain/loss heatmap.
 *
 * Used by the percentile-chart component.
 */
export interface HeatmapChartConfig {
  /**
   * Data series for the heatmap.
   */
  series: ApexAxisChartSeries

  /**
   * Core chart settings.
   */
  chart: ApexChart

  /**
   * X-axis configuration.
   */
  xaxis: ApexXAxis

  /**
   * Y-axis configuration.
   */
  yaxis: ApexYAxis

  /**
   * Colour palette.
   */
  colors: string[]

  /**
   * Tooltip configuration.
   */
  tooltip: ApexTooltip

  /**
   * Heatmap-specific plot options.
   */
  plotOptions: ApexPlotOptions

  /**
   * Grid lines configuration.
   */
  grid: ApexGrid

  /**
   * Legend settings.
   */
  legend: ApexLegend

  /**
   * Data-label display options.
   */
  dataLabels: ApexDataLabels
}

/**
 * Typed chart configuration for the cumulative-delta area chart.
 *
 * Used by the race-insights component.
 */
export interface ProgressionChartConfig {
  /**
   * Data series.
   */
  series: ApexAxisChartSeries

  /**
   * Core chart settings.
   */
  chart: ApexChart

  /**
   * Colour palette.
   */
  colors: string[]

  /**
   * Stroke / line styling.
   */
  stroke: ApexStroke

  /**
   * Area fill gradient.
   */
  fill: ApexFill

  /**
   * Data-point markers.
   */
  markers: ApexMarkers

  /**
   * Data-label display.
   */
  dataLabels: ApexDataLabels

  /**
   * Grid lines.
   */
  grid: ApexGrid

  /**
   * X-axis configuration.
   */
  xaxis: ApexXAxis

  /**
   * Y-axis configuration.
   */
  yaxis: ApexYAxis

  /**
   * Tooltip configuration.
   */
  tooltip: ApexTooltip
}

/**
 * Typed chart configuration for the contribution donut chart.
 *
 * Used by the race-insights component.
 */
export interface ContributionChartConfig {
  /**
   * Numeric values for each donut slice.
   */
  series: ApexNonAxisChartSeries

  /**
   * Core chart settings.
   */
  chart: ApexChart

  /**
   * Slice labels.
   */
  labels: string[]

  /**
   * Colour palette.
   */
  colors: string[]

  /**
   * Stroke between slices.
   */
  stroke: ApexStroke

  /**
   * Data-label display.
   */
  dataLabels: ApexDataLabels

  /**
   * Legend settings.
   */
  legend: ApexLegend

  /**
   * Tooltip configuration.
   */
  tooltip: ApexTooltip
}

/**
 * Typed chart configuration for the HR timeline area chart.
 *
 * Used by the heart-rate-insights component.
 */
export interface TimelineChartConfig {
  /**
   * Data series (avg / min / max HR bands).
   */
  series: ApexAxisChartSeries

  /**
   * Core chart settings.
   */
  chart: ApexChart

  /**
   * Colour palette.
   */
  colors: string[]

  /**
   * Stroke / line styling.
   */
  stroke: ApexStroke

  /**
   * Area fill gradient.
   */
  fill: ApexFill

  /**
   * Data-point markers.
   */
  markers: ApexMarkers

  /**
   * Data-label display.
   */
  dataLabels: ApexDataLabels

  /**
   * Grid lines.
   */
  grid: ApexGrid

  /**
   * X-axis configuration.
   */
  xaxis: ApexXAxis

  /**
   * Y-axis configuration.
   */
  yaxis: ApexYAxis

  /**
   * Tooltip configuration.
   */
  tooltip: ApexTooltip

  /**
   * Annotation overlays for race segments.
   */
  annotations: ApexAnnotations
}

/**
 * Typed chart configuration for the per-station HR bar chart.
 *
 * Used by the heart-rate-insights component.
 */
export interface StationChartConfig {
  /**
   * Data series (avgHr / maxHr per event).
   */
  series: ApexAxisChartSeries

  /**
   * Core chart settings.
   */
  chart: ApexChart

  /**
   * Colour palette.
   */
  colors: string[]

  /**
   * Data-label display.
   */
  dataLabels: ApexDataLabels

  /**
   * Grid lines.
   */
  grid: ApexGrid

  /**
   * X-axis configuration.
   */
  xaxis: ApexXAxis

  /**
   * Y-axis configuration.
   */
  yaxis: ApexYAxis

  /**
   * Tooltip configuration.
   */
  tooltip: ApexTooltip

  /**
   * Legend settings.
   */
  legend: ApexLegend
}

/**
 * Typed chart configuration for a single event's distribution curve.
 *
 * Used by the event-chart component.
 */
export interface EventCurveChartConfig {
  /**
   * Data series (field curve + athlete scatter point).
   */
  series: ApexAxisChartSeries

  /**
   * Core chart settings.
   */
  chart: ApexChart

  /**
   * X-axis (percentile) configuration.
   */
  xaxis: ApexXAxis

  /**
   * Y-axis (time) configuration.
   */
  yaxis: ApexYAxis

  /**
   * Series colour palette.
   */
  colors: string[]

  /**
   * Grid configuration.
   */
  grid: ApexGrid

  /**
   * Stroke / line styling.
   */
  stroke: ApexStroke

  /**
   * Data-point markers.
   */
  markers: ApexMarkers

  /**
   * Legend display settings.
   */
  legend: ApexLegend

  /**
   * Tooltip configuration.
   */
  tooltip: ApexTooltip
}
