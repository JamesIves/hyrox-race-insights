import {Component, Input, OnChanges, OnInit} from '@angular/core'
import {CommonModule} from '@angular/common'
import {NgApexchartsModule} from 'ng-apexcharts'
import {formatTime} from '../../utils/formatters'
import {ORDERED_EVENT_METRICS, type EventGroup} from '../../utils/event-order'
import type {
  ContributionChartConfig,
  EventDeltaPoint,
  OpportunityRow,
  ProgressionChartConfig,
  RaceData
} from '../../models'

/**
 * Race-insights panel showing three visualisations:
 *
 * 1. **Cumulative Delta** – area chart tracking gain/loss through race order.
 * 2. **Contribution Donut** – breakdown of where gains/losses originate
 *    (runs vs. stations).
 * 3. **Biggest Opportunities** – top 3 events with the largest positive delta.
 */
@Component({
  selector: 'app-race-insights',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './race-insights.component.html'
})
export class RaceInsightsComponent implements OnInit, OnChanges {
  /**
   * Full field of race-result rows.
   */
  @Input() public raceData: RaceData[] = []

  /**
   * Resolved focus-athlete row.
   */
  @Input() public focusAthlete: RaceData | null = null

  /**
   * Per-event delta points with cumulative tracking.
   */
  public eventDeltas: EventDeltaPoint[] = []

  /**
   * ApexCharts config for the cumulative-delta area chart.
   */
  public progressionChartOptions: ProgressionChartConfig | null = null

  /**
   * ApexCharts config for the contribution donut chart.
   */
  public contributionChartOptions: ContributionChartConfig | null = null

  /**
   * Top 3 events where the athlete lost the most time.
   */
  public topOpportunityDeltas: OpportunityRow[] = []

  /**
   * @inheritdoc
   */
  public ngOnInit(): void {
    this.buildInsights()
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(): void {
    this.buildInsights()
  }

  /**
   * Computes event deltas, cumulative progression, contribution
   * breakdown, and opportunity rankings from race data.
   */
  private buildInsights(): void {
    if (!this.raceData.length || !this.focusAthlete) {
      return
    }

    const deltas: EventDeltaPoint[] = []
    let runningTotal = 0

    for (const event of ORDERED_EVENT_METRICS) {
      const values = this.raceData
        .map((row: RaceData) => Number(row[event.key]) || 0)
        .filter((value: number) => value > 0)

      const athleteValue = Number(this.focusAthlete[event.key]) || 0
      if (values.length === 0 || athleteValue <= 0) {
        continue
      }

      const average =
        values.reduce((sum: number, value: number) => sum + value, 0) /
        values.length
      const deltaSeconds = Math.round((athleteValue - average) * 60)
      runningTotal += deltaSeconds

      deltas.push({
        key: event.key,
        label: event.label,
        group: event.group,
        deltaSeconds,
        cumulativeSeconds: runningTotal
      })
    }

    this.eventDeltas = deltas
    this.updateProgressionChart()
    this.updateContributionChart()
    this.updateOpportunities()
  }

  /**
   * Builds the cumulative-delta area chart configuration.
   */
  private updateProgressionChart(): void {
    if (this.eventDeltas.length === 0) {
      return
    }

    const categories = this.eventDeltas.map((p: EventDeltaPoint) => p.label)
    const data = this.eventDeltas.map(
      (p: EventDeltaPoint) => p.cumulativeSeconds
    )

    this.progressionChartOptions = {
      series: [{name: 'Cumulative Delta', data}],
      chart: {
        type: 'area',
        toolbar: {show: false},
        animations: {enabled: false},
        fontFamily: 'Inter, sans-serif',
        height: 320
      },
      colors: ['#38bdf8'],
      stroke: {width: 3, curve: 'smooth'},
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.32,
          opacityTo: 0.04,
          stops: [0, 90, 100]
        }
      },
      markers: {size: 4},
      dataLabels: {enabled: false},
      grid: {show: true, borderColor: '#334155', strokeDashArray: 4},
      xaxis: {
        categories,
        labels: {
          rotate: -28,
          style: {
            colors: '#94a3b8',
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px'
          }
        },
        axisBorder: {show: false},
        axisTicks: {show: false}
      },
      yaxis: {
        labels: {
          formatter: (value: number) => this.formatDeltaSeconds(value),
          style: {colors: '#94a3b8', fontFamily: 'Inter, sans-serif'}
        }
      },
      tooltip: {
        enabled: true,
        followCursor: true,
        theme: 'dark',
        style: {fontFamily: 'Inter, sans-serif'},
        y: {formatter: (value: number) => this.formatDeltaSeconds(value)}
      }
    }
  }

  /**
   * Builds the contribution donut chart showing runs vs. stations gains/losses.
   */
  private updateContributionChart(): void {
    const runsGain = this.sumByCondition('Runs', (v: number) => v < 0)
    const stationGain = this.sumByCondition('Stations', (v: number) => v < 0)
    const runsLoss = this.sumByCondition('Runs', (v: number) => v > 0)
    const stationLoss = this.sumByCondition('Stations', (v: number) => v > 0)

    this.contributionChartOptions = {
      series: [runsGain, stationGain, runsLoss, stationLoss],
      chart: {
        type: 'donut',
        toolbar: {show: false},
        fontFamily: 'Inter, sans-serif',
        height: 310
      },
      labels: ['Run Gains', 'Station Gains', 'Run Losses', 'Station Losses'],
      colors: ['#10b981', '#34d399', '#f87171', '#ef4444'],
      stroke: {colors: ['#0f172a']},
      dataLabels: {enabled: false},
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '12px',
        fontWeight: 600,
        labels: {colors: '#e2e8f0', useSeriesColors: false},
        markers: {fillColors: ['#10b981', '#34d399', '#f87171', '#ef4444']}
      },
      tooltip: {
        enabled: true,
        followCursor: true,
        theme: 'dark',
        style: {fontFamily: 'Inter, sans-serif'},
        y: {formatter: (value: number) => this.formatDeltaSeconds(value)}
      }
    }
  }

  /**
   * Selects the top 3 events where the athlete was slowest relative
   * to average and computes bar widths.
   */
  private updateOpportunities(): void {
    const opportunities = this.eventDeltas
      .filter((p: EventDeltaPoint) => p.deltaSeconds > 0)
      .sort(
        (a: EventDeltaPoint, b: EventDeltaPoint) =>
          b.deltaSeconds - a.deltaSeconds
      )
      .slice(0, 3)

    const maxDelta =
      opportunities.length > 0
        ? Math.max(...opportunities.map((p: EventDeltaPoint) => p.deltaSeconds))
        : 1

    this.topOpportunityDeltas = opportunities.map((p: EventDeltaPoint) => ({
      label: p.label,
      deltaSeconds: p.deltaSeconds,
      opportunityWidth: Math.round((p.deltaSeconds / maxDelta) * 100)
    }))
  }

  /**
   * Sums the absolute delta-seconds for a given event group where
   * the predicate holds.
   *
   * @param group - Event group to filter on.
   * @param predicate - Condition on the delta value (e.g. `v => v < 0` for gains).
   * @returns Total absolute seconds matching the criteria.
   */
  private sumByCondition(
    group: EventGroup,
    predicate: (deltaSeconds: number) => boolean
  ): number {
    return this.eventDeltas
      .filter(
        (p: EventDeltaPoint) => p.group === group && predicate(p.deltaSeconds)
      )
      .reduce(
        (sum: number, p: EventDeltaPoint) => sum + Math.abs(p.deltaSeconds),
        0
      )
  }

  /**
   * Formats a delta-seconds value as a signed `M:SS` string.
   *
   * @param seconds - Signed delta in seconds.
   * @returns Formatted string (e.g. `"+1:30"`, `"-0:45"`).
   */
  private formatDeltaSeconds(seconds: number): string {
    const sign = seconds > 0 ? '+' : seconds < 0 ? '-' : ''
    const minutes = Math.abs(seconds) / 60
    return `${sign}${formatTime(minutes)}`
  }
}
