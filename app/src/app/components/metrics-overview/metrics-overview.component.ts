import {Component, Input, OnChanges, OnInit} from '@angular/core'
import {CommonModule} from '@angular/common'
import {NgApexchartsModule} from 'ng-apexcharts'
import {formatMetricName, formatTime} from '../../utils/formatters'
import type {ChartConfig, RaceData, ComparisonPoint} from '../../models'

/**
 * Metric key definitions used for the overview comparison charts.
 * Includes aggregate times and individual station times.
 */
const KEY_METRICS: readonly {readonly key: string}[] = [
  {key: 'total_time'},
  {key: 'work_time'},
  {key: 'run_time'},
  {key: 'skiErg_time'},
  {key: 'sledPush_time'},
  {key: 'sledPull_time'},
  {key: 'burpeeBroadJump_time'},
  {key: 'rowErg_time'},
  {key: 'farmersCarry_time'},
  {key: 'sandbagLunges_time'},
  {key: 'wallBalls_time'}
] as const

/**
 * Displays two side-by-side charts comparing the focus athlete
 * against the field average:
 *
 * 1. **Time Trend** – line chart of raw times per metric.
 * 2. **Performance Index** – radar chart where 100 = field average.
 */
@Component({
  selector: 'app-metrics-overview',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './metrics-overview.component.html'
})
export class MetricsOverviewComponent implements OnInit, OnChanges {
  /**
   * Full field of race-result rows.
   */
  @Input() public raceData: RaceData[] = []

  /**
   * Resolved focus-athlete row.
   */
  @Input() public focusAthlete: RaceData | null = null

  /**
   * Derived comparison points used by both charts.
   */
  public comparisonData: ComparisonPoint[] = []

  /**
   * ApexCharts config for the time-trend line chart.
   */
  public trendChartOptions: ChartConfig | null = null

  /**
   * ApexCharts config for the performance-index radar chart.
   */
  public radarChartOptions: ChartConfig | null = null

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
   * Computes comparison points for every key metric by averaging
   * the field and comparing against the focus athlete's value.
   */
  private buildChartData(): void {
    if (!this.raceData.length || !this.focusAthlete) {
      return
    }

    const points: ComparisonPoint[] = []

    for (const metric of KEY_METRICS) {
      const values = this.raceData
        .map((r: RaceData) => Number(r[metric.key]) || 0)
        .filter((v: number) => v > 0)

      if (values.length === 0) {
        continue
      }

      const average =
        values.reduce((a: number, b: number) => a + b, 0) / values.length
      const athleteValue = Number(this.focusAthlete[metric.key]) || 0

      if (athleteValue > 0 || average > 0) {
        const roundedAverage = Math.round(average * 100) / 100
        const roundedAthlete = Math.round(athleteValue * 100) / 100
        const performanceIndex =
          roundedAthlete > 0
            ? Math.round((roundedAverage / roundedAthlete) * 100)
            : 100

        points.push({
          label: formatMetricName(metric.key),
          average: roundedAverage,
          athlete: roundedAthlete,
          performanceIndex
        })
      }
    }

    this.comparisonData = points
    this.updateCharts()
  }

  /**
   * Rebuilds both ApexCharts option objects from the current
   * {@link comparisonData} array.
   */
  private updateCharts(): void {
    if (this.comparisonData.length === 0) {
      return
    }

    const categories = this.comparisonData.map((d: ComparisonPoint) => d.label)

    this.trendChartOptions = {
      series: [
        {
          name: 'Average',
          data: this.comparisonData.map((d: ComparisonPoint) => d.average)
        },
        {
          name: 'You',
          data: this.comparisonData.map((d: ComparisonPoint) => d.athlete)
        }
      ],
      chart: {
        type: 'line',
        toolbar: {show: false},
        animations: {enabled: false},
        fontFamily: 'Inter, sans-serif',
        dropShadow: {enabled: false},
        height: 340
      },
      dataLabels: {enabled: false},
      stroke: {width: 3, curve: 'smooth'},
      markers: {size: 4},
      grid: {show: true, borderColor: '#334155', strokeDashArray: 4},
      xaxis: {
        categories,
        labels: {
          show: true,
          rotate: -25,
          style: {fontFamily: 'Inter, sans-serif', colors: '#94a3b8'}
        },
        axisBorder: {show: false},
        axisTicks: {show: false}
      },
      yaxis: {
        labels: {
          formatter: (value: number) => formatTime(value),
          style: {fontFamily: 'Inter, sans-serif', colors: '#94a3b8'}
        }
      },
      colors: ['#64748b', '#60a5fa'],
      tooltip: {
        enabled: true,
        followCursor: true,
        theme: 'dark',
        style: {fontFamily: 'Inter, sans-serif'},
        y: {formatter: (value: number) => formatTime(value)}
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '12px',
        fontWeight: 600,
        labels: {colors: '#e2e8f0', useSeriesColors: false},
        markers: {fillColors: ['#64748b', '#60a5fa']}
      }
    }

    const youSeries = this.comparisonData.map(
      (d: ComparisonPoint) => d.performanceIndex
    )
    const minY = Math.max(50, Math.floor(Math.min(...youSeries) / 10) * 10 - 10)
    const maxY = Math.min(180, Math.ceil(Math.max(...youSeries) / 10) * 10 + 10)

    this.radarChartOptions = {
      series: [
        {name: 'Average Baseline', data: this.comparisonData.map(() => 100)},
        {name: 'You', data: youSeries}
      ],
      chart: {
        type: 'radar',
        height: 340,
        toolbar: {show: false},
        fontFamily: 'Inter, sans-serif'
      },
      xaxis: {
        categories,
        labels: {
          style: {
            colors: '#94a3b8',
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px'
          }
        }
      },
      yaxis: {
        min: minY,
        max: maxY,
        tickAmount: 4,
        labels: {
          formatter: (value: number) => `${Math.round(value)}`,
          style: {colors: '#94a3b8', fontFamily: 'Inter, sans-serif'}
        }
      },
      colors: ['#475569', '#a78bfa'],
      stroke: {width: 2},
      fill: {opacity: 0.2},
      markers: {size: 3},
      dataLabels: {enabled: false},
      grid: {show: false},
      tooltip: {
        followCursor: true,
        theme: 'dark',
        y: {formatter: (value: number) => `${Math.round(value)} index`}
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '12px',
        fontWeight: 600,
        labels: {colors: '#e2e8f0', useSeriesColors: false},
        markers: {fillColors: ['#475569', '#a78bfa']}
      }
    }
  }
}
