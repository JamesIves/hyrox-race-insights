import {Component, Input, OnChanges, OnInit} from '@angular/core'
import {CommonModule} from '@angular/common'
import {NgApexchartsModule} from 'ng-apexcharts'
import {formatTime} from '../../utils/formatters'
import type {EventChartData, EventCurveChartConfig} from '../../models'

/**
 * Renders a single event's field-distribution curve with the
 * focus athlete's position marked as a red scatter point.
 *
 * Designed to be used inside `EventBreakdownComponent`'s template
 * via `*ngFor`.
 */
@Component({
  selector: 'app-event-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './event-chart.component.html'
})
export class EventChartComponent implements OnInit, OnChanges {
  /**
   * Event data including field curve and athlete placement.
   */
  @Input() public event: EventChartData | null = null

  /**
   * ApexCharts configuration for the curve chart, or `null` until built.
   */
  public chartOptions: EventCurveChartConfig | null = null

  /**
   * @inheritdoc
   */
  public ngOnInit(): void {
    this.buildChart()
  }

  /**
   * @inheritdoc
   */
  public ngOnChanges(): void {
    this.buildChart()
  }

  /**
   * Builds the line + scatter chart configuration from the input event.
   */
  private buildChart(): void {
    if (!this.event) {
      return
    }

    const curveData = this.event.curve.map(
      (point: {percentile: number; time: number}) => ({
        x: point.percentile,
        y: point.time
      })
    )

    const athletePoint = [
      {
        x: this.event.athletePercentile,
        y: this.event.athlete
      }
    ]

    this.chartOptions = {
      chart: {
        type: 'line',
        toolbar: {show: false},
        animations: {enabled: false},
        fontFamily: 'Inter, sans-serif',
        dropShadow: {enabled: false},
        height: 300
      },
      series: [
        {name: 'Field Curve', type: 'line', data: curveData},
        {name: 'You', type: 'scatter', data: athletePoint}
      ],
      xaxis: {
        type: 'numeric',
        min: 0,
        max: 100,
        tickAmount: 4,
        title: {
          text: 'Percentile',
          style: {
            color: '#94a3b8',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px'
          }
        },
        labels: {
          formatter: (value: string) => `${Math.round(Number(value))}%`,
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
          text: 'Time',
          style: {
            color: '#94a3b8',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px'
          }
        },
        labels: {
          formatter: (value: number) => formatTime(value),
          style: {
            colors: '#94a3b8',
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px'
          }
        }
      },
      colors: ['#60a5fa', '#ef4444'],
      grid: {
        show: true,
        borderColor: '#334155',
        strokeDashArray: 4,
        padding: {left: 2, right: 2, top: 0}
      },
      stroke: {curve: 'smooth', width: [3, 0]},
      markers: {
        size: [0, 7],
        strokeWidth: 2,
        strokeColors: '#fff',
        hover: {size: 9},
        discrete: [
          {
            seriesIndex: 1,
            dataPointIndex: 0,
            fillColor: '#ef4444',
            strokeColor: '#fff',
            size: 8
          }
        ]
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '12px',
        fontWeight: 600,
        labels: {colors: '#e2e8f0', useSeriesColors: false},
        markers: {fillColors: ['#60a5fa', '#ef4444']}
      },
      tooltip: {
        enabled: true,
        followCursor: true,
        style: {fontFamily: 'Inter, sans-serif'},
        x: {formatter: (value: number) => `${Math.round(value)}th percentile`},
        y: {
          formatter: (value: number, opts: {seriesIndex: number}) => {
            if (opts.seriesIndex === 1) {
              return `You: ${formatTime(value)}`
            }
            return formatTime(value)
          }
        },
        theme: 'dark'
      }
    }
  }
}
