import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  OnInit
} from '@angular/core'
import {CommonModule} from '@angular/common'
import {NgApexchartsModule, ApexAnnotations} from 'ng-apexcharts'
import {ORDERED_EVENT_METRICS} from '../../utils/event-order'
import {HeartRateService} from '../../services'
import type {
  HeartRateJsonRow,
  HeartRatePoint,
  RaceData,
  SegmentRange,
  StationChartConfig,
  StationHeartRateSummary,
  TimelineChartConfig
} from '../../models'

/**
 * Heart-rate insights panel.
 *
 * Loads the athlete's heart-rate export from `/data/heart_rate.json`,
 * parses it into typed `HeartRatePoint` entries, and renders:
 *
 * 1. **HR Timeline** – area chart showing avg/min/max HR over elapsed
 *    race time with race-event segment annotations.
 * 2. **Per-Station HR** – grouped bar chart comparing average and peak HR
 *    across each Hyrox event.
 */
@Component({
  selector: 'app-heart-rate-insights',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './heart-rate-insights.component.html'
})
export class HeartRateInsightsComponent implements OnInit, OnChanges {
  /**
   * Resolved focus-athlete row for segment time computation.
   */
  @Input() public focusAthlete: RaceData | null = null

  /**
   * Parsed heart-rate data points.
   */
  public hrPoints: HeartRatePoint[] = []

  /**
   * ApexCharts config for the HR timeline area chart.
   */
  public timelineChartOptions: TimelineChartConfig | null = null

  /**
   * ApexCharts config for the per-station grouped-bar chart.
   */
  public stationChartOptions: StationChartConfig | null = null

  /**
   * Overall average HR across all data points.
   */
  public overallAvgHr = 0

  /**
   * Overall peak HR.
   */
  public overallMaxHr = 0

  /**
   * Overall minimum HR.
   */
  public overallMinHr = 0

  /**
   * Per-event heart-rate summary rows.
   */
  private stationSummaries: StationHeartRateSummary[] = []

  /**
   * Computed race-segment time ranges for annotation overlays.
   */
  private segmentRanges: SegmentRange[] = []

  private readonly heartRateService = inject(HeartRateService)

  /**
   * Injected change-detector for manual change detection after async data load.
   */
  private readonly cdr = inject(ChangeDetectorRef)

  /**
   * @inheritdoc
   */
  public ngOnInit(): void {
    this.loadHeartRateData()
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(): void {
    if (this.hrPoints.length > 0) {
      this.buildSegmentRanges()
      this.buildCharts()
    }
  }

  /**
   * Fetches heart-rate JSON and triggers chart rendering on success.
   */
  private loadHeartRateData(): void {
    this.heartRateService
      .getHeartRateData()
      .subscribe((rows: HeartRateJsonRow[]) => {
        if (rows.length === 0) {
          return
        }

        this.hrPoints = this.parseHeartRateRows(rows)
        this.computeOverallStats()
        this.buildSegmentRanges()
        this.buildCharts()
        this.cdr.detectChanges()
      })
  }

  /**
   * Converts raw JSON rows into typed `HeartRatePoint` entries
   * with elapsed-minutes computed from the first timestamp.
   *
   * @param rows - Raw JSON rows from the heart-rate export.
   * @returns Sorted array of typed heart-rate points.
   */
  private parseHeartRateRows(rows: HeartRateJsonRow[]): HeartRatePoint[] {
    const sorted = [...rows].sort(
      (a: HeartRateJsonRow, b: HeartRateJsonRow) =>
        new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    )

    const firstTimestamp = new Date(sorted[0].dateTime).getTime()

    return sorted.map((row: HeartRateJsonRow) => ({
      timestamp: new Date(row.dateTime),
      elapsedMinutes:
        (new Date(row.dateTime).getTime() - firstTimestamp) / 60_000,
      avg: row.avg,
      min: row.min,
      max: row.max
    }))
  }

  /**
   * Computes overall average, min, and max HR from all data points.
   */
  private computeOverallStats(): void {
    if (this.hrPoints.length === 0) {
      return
    }

    const avgSum = this.hrPoints.reduce(
      (sum: number, p: HeartRatePoint) => sum + p.avg,
      0
    )
    this.overallAvgHr = Math.round(avgSum / this.hrPoints.length)
    this.overallMaxHr = Math.max(
      ...this.hrPoints.map((p: HeartRatePoint) => p.max)
    )
    this.overallMinHr = Math.min(
      ...this.hrPoints.map((p: HeartRatePoint) => p.min)
    )
  }

  /**
   * Builds elapsed-minute segment ranges from the focus athlete's event times.
   */
  private buildSegmentRanges(): void {
    if (!this.focusAthlete) {
      return
    }

    const ranges: SegmentRange[] = []
    let cursor = 0

    for (const event of ORDERED_EVENT_METRICS) {
      const duration = Number(this.focusAthlete[event.key]) || 0
      if (duration <= 0) {
        continue
      }

      ranges.push({
        key: event.key,
        label: event.label,
        group: event.group,
        startMinute: cursor,
        endMinute: cursor + duration
      })

      cursor += duration
    }

    this.segmentRanges = ranges
    this.buildStationSummaries()
  }

  /**
   * Aggregates HR data within each segment range to produce
   * per-event average and peak summaries.
   */
  private buildStationSummaries(): void {
    this.stationSummaries = this.segmentRanges.map(
      (seg: SegmentRange): StationHeartRateSummary => {
        const pointsInRange = this.hrPoints.filter(
          (p: HeartRatePoint) =>
            p.elapsedMinutes >= seg.startMinute &&
            p.elapsedMinutes < seg.endMinute
        )

        const avgHr =
          pointsInRange.length > 0
            ? Math.round(
                pointsInRange.reduce(
                  (sum: number, p: HeartRatePoint) => sum + p.avg,
                  0
                ) / pointsInRange.length
              )
            : 0

        const maxHr =
          pointsInRange.length > 0
            ? Math.max(...pointsInRange.map((p: HeartRatePoint) => p.max))
            : 0

        return {
          key: seg.key,
          label: seg.label,
          group: seg.group,
          avgHr,
          maxHr
        }
      }
    )
  }

  /**
   * Orchestrates building both the timeline and station charts.
   */
  private buildCharts(): void {
    this.buildTimelineChart()
    this.buildStationChart()
  }

  /**
   * Builds the HR timeline area chart configuration with segment annotations.
   */
  private buildTimelineChart(): void {
    if (this.hrPoints.length === 0) {
      return
    }

    const annotations: ApexAnnotations = {
      xaxis: this.segmentRanges.map((seg: SegmentRange, index: number) => ({
        x: seg.startMinute,
        x2: seg.endMinute,
        fillColor: seg.group === 'Runs' ? '#38bdf8' : '#a78bfa',
        opacity: index % 2 === 0 ? 0.08 : 0.05,
        label: {
          text: seg.label,
          orientation: 'horizontal' as const,
          style: {
            color: '#e2e8f0',
            background: 'transparent',
            fontSize: '10px',
            fontFamily: 'Inter, sans-serif'
          }
        }
      }))
    }

    const toXY = (valueFn: (p: HeartRatePoint) => number) =>
      this.hrPoints.map((p: HeartRatePoint) => ({
        x: Math.round(p.elapsedMinutes * 10) / 10,
        y: valueFn(p)
      }))

    this.timelineChartOptions = {
      series: [
        {name: 'Avg HR', data: toXY((p: HeartRatePoint) => Math.round(p.avg))},
        {name: 'Max HR', data: toXY((p: HeartRatePoint) => p.max)},
        {name: 'Min HR', data: toXY((p: HeartRatePoint) => p.min)}
      ],
      chart: {
        type: 'area',
        height: 360,
        toolbar: {show: false},
        animations: {enabled: false},
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#f97316', '#ef4444', '#22c55e'],
      stroke: {width: 2, curve: 'smooth'},
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.28,
          opacityTo: 0.02,
          stops: [0, 90, 100]
        }
      },
      markers: {size: 0},
      dataLabels: {enabled: false},
      grid: {show: true, borderColor: '#334155', strokeDashArray: 4},
      xaxis: {
        type: 'numeric',
        tickAmount: 8,
        title: {
          text: 'Elapsed Minutes',
          style: {color: '#94a3b8', fontFamily: 'Inter, sans-serif'}
        },
        labels: {
          formatter: (value: string) => `${Math.round(Number(value))}`,
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
        title: {
          text: 'BPM',
          style: {color: '#94a3b8', fontFamily: 'Inter, sans-serif'}
        },
        labels: {
          formatter: (value: number) => `${Math.round(value)}`,
          style: {colors: '#94a3b8', fontFamily: 'Inter, sans-serif'}
        }
      },
      tooltip: {
        enabled: true,
        followCursor: true,
        theme: 'dark',
        style: {fontFamily: 'Inter, sans-serif'},
        y: {formatter: (value: number) => `${Math.round(value)} bpm`}
      },
      annotations
    }
  }

  /**
   * Builds the per-station grouped-bar chart showing avg and max HR
   * for each race event.
   */
  private buildStationChart(): void {
    if (this.stationSummaries.length === 0) {
      return
    }

    const labels = this.stationSummaries.map(
      (s: StationHeartRateSummary) => s.label
    )
    const avgData = this.stationSummaries.map(
      (s: StationHeartRateSummary) => s.avgHr
    )
    const maxData = this.stationSummaries.map(
      (s: StationHeartRateSummary) => s.maxHr
    )

    this.stationChartOptions = {
      series: [
        {name: 'Avg HR', data: avgData},
        {name: 'Max HR', data: maxData}
      ],
      chart: {
        type: 'bar',
        height: 340,
        toolbar: {show: false},
        animations: {enabled: false},
        fontFamily: 'Inter, sans-serif'
      },
      colors: ['#f97316', '#ef4444'],
      dataLabels: {enabled: false},
      grid: {show: true, borderColor: '#334155', strokeDashArray: 4},
      xaxis: {
        categories: labels,
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
        title: {
          text: 'BPM',
          style: {color: '#94a3b8', fontFamily: 'Inter, sans-serif'}
        },
        labels: {
          formatter: (value: number) => `${Math.round(value)}`,
          style: {colors: '#94a3b8', fontFamily: 'Inter, sans-serif'}
        }
      },
      tooltip: {
        enabled: true,
        followCursor: true,
        theme: 'dark',
        style: {fontFamily: 'Inter, sans-serif'},
        y: {formatter: (value: number) => `${Math.round(value)} bpm`}
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '12px',
        fontWeight: 600,
        labels: {colors: '#e2e8f0', useSeriesColors: false},
        markers: {fillColors: ['#f97316', '#ef4444']}
      }
    }
  }
}
