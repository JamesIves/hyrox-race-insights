import {Component, Input, OnChanges, OnInit} from '@angular/core'
import {CommonModule} from '@angular/common'
import {NgApexchartsModule} from 'ng-apexcharts'
import {formatTime} from '../../utils/formatters'
import {ORDERED_EVENT_METRICS} from '../../utils/event-order'
import type {DeltaPoint, HeatmapChartConfig, RaceData} from '../../models'

/**
 * Heatmap showing per-event time delta versus the field average.
 *
 * Green cells indicate faster-than-average performance, red cells
 * indicate slower.  Summary chips above the chart show faster /
 * slower / net counts.
 */
@Component({
  selector: 'app-percentile-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './percentile-chart.component.html'
})
export class PercentileChartComponent implements OnInit, OnChanges {
  /**
   * Full field of race-result rows.
   */
  @Input() public raceData: RaceData[] = []

  /**
   * Resolved focus-athlete row.
   */
  @Input() public focusAthlete: RaceData | null = null

  /**
   * Computed delta points for each event.
   */
  public chartData: DeltaPoint[] = []

  /**
   * Chart configuration for the heatmap, or `null` until built.
   */
  public chartOptions: HeatmapChartConfig | null = null

  /**
   * Number of events where the athlete was faster than average.
   */
  public fasterCount = 0

  /**
   * Number of events where the athlete was slower than average.
   */
  public slowerCount = 0

  /**
   * Net time delta across all events (seconds).
   */
  public netDeltaSeconds = 0

  /**
   * @inheritdoc
   */
  public ngOnInit(): void {
    this.buildChartData()
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(): void {
    this.buildChartData()
  }

  /**
   * Computes per-event delta from the field average and updates
   * summary counts and the heatmap chart config.
   */
  private buildChartData(): void {
    if (!this.raceData.length || !this.focusAthlete) {
      return
    }

    const points: DeltaPoint[] = []

    for (const metric of ORDERED_EVENT_METRICS) {
      const values = this.raceData
        .map((r: RaceData) => Number(r[metric.key]) || 0)
        .filter((v: number) => v > 0)

      const athleteValue = Number(this.focusAthlete[metric.key]) || 0

      if (values.length === 0 || athleteValue <= 0) {
        continue
      }

      const average =
        values.reduce((sum: number, val: number) => sum + val, 0) /
        values.length
      const deltaSeconds = Math.round((athleteValue - average) * 60)
      const deltaPct =
        Math.round(((athleteValue - average) / average) * 100 * 10) / 10

      points.push({
        name: metric.label,
        group: metric.group,
        deltaSeconds,
        deltaPct
      })
    }

    this.chartData = points
    this.fasterCount = points.filter(
      (p: DeltaPoint) => p.deltaSeconds < 0
    ).length
    this.slowerCount = points.filter(
      (p: DeltaPoint) => p.deltaSeconds > 0
    ).length
    this.netDeltaSeconds = points.reduce(
      (sum: number, p: DeltaPoint) => sum + p.deltaSeconds,
      0
    )

    this.updateChart()
  }

  /**
   * Builds the ApexCharts heatmap configuration from {@link chartData}.
   */
  private updateChart(): void {
    if (this.chartData.length === 0) {
      return
    }

    this.chartOptions = {
      series: [
        {
          name: 'Delta vs Avg',
          data: this.chartData.map((d: DeltaPoint) => ({
            x: d.name,
            y: d.deltaSeconds
          }))
        }
      ],
      chart: {
        type: 'heatmap',
        toolbar: {show: false},
        animations: {enabled: false},
        fontFamily: 'Inter, sans-serif',
        height: 300
      },
      plotOptions: {
        heatmap: {
          radius: 6,
          enableShades: true,
          shadeIntensity: 0.4,
          colorScale: {
            ranges: [
              {from: -9999, to: -1, color: '#10b981', name: 'Faster'},
              {from: 0, to: 0, color: '#64748b', name: 'On average'},
              {from: 1, to: 9999, color: '#ef4444', name: 'Slower'}
            ]
          }
        }
      },
      grid: {show: true, borderColor: '#334155', strokeDashArray: 4},
      xaxis: {
        type: 'category',
        labels: {
          show: true,
          rotate: -28,
          style: {
            fontFamily: 'Inter, sans-serif',
            colors: '#94a3b8',
            fontSize: '11px'
          }
        },
        axisBorder: {show: false},
        axisTicks: {show: false}
      },
      yaxis: {
        labels: {
          show: true,
          formatter: () => 'Race',
          style: {
            colors: '#cbd5e1',
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px'
          }
        }
      },
      colors: ['#1A56DB'],
      tooltip: {
        enabled: true,
        followCursor: true,
        theme: 'dark',
        style: {fontFamily: 'Inter, sans-serif'},
        x: {show: true},
        y: {
          formatter: (value: number, opts: {dataPointIndex: number}) => {
            const point = this.chartData[opts.dataPointIndex]
            if (!point) {
              return `${value}s`
            }
            const direction = value < 0 ? '-' : '+'
            const minutesDelta = Math.abs(value) / 60
            return `${direction}${formatTime(minutesDelta)} (${direction}${Math.abs(point.deltaPct)}%)`
          }
        }
      },
      legend: {
        show: false,
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '12px',
        fontWeight: 600,
        labels: {colors: '#e2e8f0', useSeriesColors: false},
        markers: {fillColors: ['#10b981', '#ef4444']}
      },
      dataLabels: {enabled: false}
    }
  }
}
