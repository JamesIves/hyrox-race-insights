import {Component, Input, OnChanges, OnInit} from '@angular/core'
import {CommonModule} from '@angular/common'
import {NgApexchartsModule} from 'ng-apexcharts'
import {formatMetricName, formatTime} from '../../utils/formatters'
import {ORDERED_EVENT_METRICS} from '../../utils/event-order'
import {EventChartComponent} from './event-chart.component'
import type {EventChartData, OverallChartData, RaceData} from '../../models'

/**
 * Aggregate metric keys shown in the "Overall Performance" summary cards.
 */
const OVERALL_METRICS: readonly {readonly key: string}[] = [
  {key: 'total_time'},
  {key: 'work_time'},
  {key: 'run_time'},
  {key: 'roxzone_time'}
] as const

/**
 * Individual event metric keys derived from the canonical race order.
 */
const EVENT_METRICS_IN_ORDER: readonly {readonly key: string}[] =
  ORDERED_EVENT_METRICS.map(event => ({key: event.key}))

/**
 * Full event-breakdown panel.
 *
 * Shows aggregate "Overall Performance" cards followed by per-event
 * distribution curves with placement details and an inline
 * `EventChartComponent` for each event.
 */
@Component({
  selector: 'app-event-breakdown',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, EventChartComponent],
  templateUrl: './event-breakdown.component.html'
})
export class EventBreakdownComponent implements OnInit, OnChanges {
  /**
   * Full field of race-result rows.
   */
  @Input() public raceData: RaceData[] = []

  /**
   * Resolved focus-athlete row.
   */
  @Input() public focusAthlete: RaceData | null = null

  /**
   * Aggregate metric comparison cards.
   */
  public overallChart: OverallChartData[] = []

  /**
   * Per-event distribution chart data.
   */
  public eventCharts: EventChartData[] = []

  /**
   * Template-accessible reference to {@link formatTime}.
   */
  public readonly formatTimeFn: (minutes: number) => string = formatTime

  /**
   * @inheritdoc
   */
  public ngOnInit(): void {
    this.buildCharts()
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(): void {
    this.buildCharts()
  }

  /**
   * Builds both the overall summary cards and per-event
   * distribution chart data from race results.
   */
  private buildCharts(): void {
    if (!this.raceData.length || !this.focusAthlete) {
      return
    }

    this.overallChart = OVERALL_METRICS.map(metric => {
      const values = this.raceData
        .map((r: RaceData) => Number(r[metric.key]) || 0)
        .filter((v: number) => v > 0)

      if (values.length === 0) {
        return null
      }

      const average =
        values.reduce((a: number, b: number) => a + b, 0) / values.length
      const athleteValue = Number(this.focusAthlete![metric.key]) || 0

      return {
        label: formatMetricName(metric.key),
        average: Math.round(average * 100) / 100,
        athlete: Math.round(athleteValue * 100) / 100
      }
    }).filter((item): item is OverallChartData => item !== null)

    this.eventCharts = EVENT_METRICS_IN_ORDER.map(
      (metric): EventChartData | null => {
        const distribution = this.buildDistribution(metric)
        if (distribution.length === 0) {
          return null
        }

        const average =
          distribution.reduce((sum: number, time: number) => sum + time, 0) /
          distribution.length
        const athleteValue = Number(this.focusAthlete![metric.key]) || 0
        if (athleteValue <= 0) {
          return null
        }

        const athleteRank = distribution.filter(
          (time: number) => time <= athleteValue
        ).length
        const athletePercentile = (athleteRank / distribution.length) * 100

        const curve: EventChartData['curve'] = distribution.map(
          (time: number, index: number) => ({
            time,
            percentile: ((index + 1) / distribution.length) * 100
          })
        )

        return {
          metric: {key: metric.key},
          label: formatMetricName(metric.key),
          average: Math.round(average * 100) / 100,
          athlete: Math.round(athleteValue * 100) / 100,
          curve,
          athleteRank,
          athletePercentile: Math.round(athletePercentile * 10) / 10,
          fieldSize: distribution.length
        }
      }
    ).filter((item): item is EventChartData => item !== null)
  }

  /**
   * Returns a sorted array of positive timing values for the given
   * metric across the entire field.
   *
   * @param metric - Metric descriptor with a `key` property.
   * @returns Sorted ascending array of times in minutes.
   */
  private buildDistribution(metric: {readonly key: string}): number[] {
    return this.raceData
      .map((r: RaceData) => Number(r[metric.key]) || 0)
      .filter((time: number) => time > 0)
      .sort((a: number, b: number) => a - b)
  }
}
