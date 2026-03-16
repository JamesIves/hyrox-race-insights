import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core'
import {CommonModule} from '@angular/common'
import {NgApexchartsModule} from 'ng-apexcharts'
import {finalize} from 'rxjs'
import {initFlowbite} from 'flowbite'
import {MetricsOverviewComponent} from './components/metrics-overview/metrics-overview.component'
import {PercentileChartComponent} from './components/percentile-chart/percentile-chart.component'
import {EventBreakdownComponent} from './components/event-breakdown/event-breakdown.component'
import {RaceInsightsComponent} from './components/race-insights/race-insights.component'
import {HeartRateInsightsComponent} from './components/heart-rate-insights/heart-rate-insights.component'
import {RaceDataService, RaceConfigService} from './services'
import type {RaceConfig, RaceData} from './models'

/**
 * Root dashboard component that orchestrates all chart panels.
 *
 * Delegates data fetching to {@link RaceDataService}, resolves the
 * focus athlete, and distributes data to child visualisation components.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    MetricsOverviewComponent,
    PercentileChartComponent,
    RaceInsightsComponent,
    HeartRateInsightsComponent,
    EventBreakdownComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  /**
   * Full race-result dataset for every athlete.
   */
  public raceData: RaceData[] = []

  /**
   * Resolved row for the focus athlete, or `null` before data loads.
   */
  public focusAthlete: RaceData | null = null

  /**
   * Whether the initial data fetch is still in progress.
   */
  public loading = true

  /**
   * User-facing error message, or `null` when no error.
   */
  public error: string | null = null

  /**
   * Display name of the athlete the dashboard centres on.
   */
  public focalAthlete = ''

  /**
   * Race configuration loaded from config.json.
   */
  public config: RaceConfig | null = null

  /**
   * Guards against re-initialising Flowbite tooltips.
   */
  private tooltipsInitialized = false

  private readonly raceDataService = inject(RaceDataService)
  private readonly raceConfigService = inject(RaceConfigService)

  /**
   * Injected change-detector for manual change detection after async data load.
   */
  private readonly cdr = inject(ChangeDetectorRef)

  /**
   * @inheritdoc
   */
  public ngOnInit(): void {
    this.raceConfigService
      .getConfig()
      .subscribe((config: RaceConfig | null) => {
        if (config) {
          this.config = config
          this.focalAthlete = config.athlete
        }
        this.loadRaceData()
      })
  }

  /**
   * Fetches race-result data via {@link RaceDataService} and populates
   * component state.
   *
   * On success the focus athlete is resolved by name and Flowbite
   * tooltips are initialised once.  On failure an error message is
   * stored for template display.
   */
  private loadRaceData(): void {
    this.raceDataService
      .getRaceData()
      .pipe(
        finalize(() => {
          this.loading = false
          this.cdr.detectChanges()
        })
      )
      .subscribe((data: RaceData[]) => {
        if (data.length === 0) {
          this.error = 'Failed to load race data'
          return
        }

        this.raceData = data
        this.focusAthlete =
          this.raceData.find(
            (r: RaceData) =>
              String(r.name || '').toLowerCase() ===
              this.focalAthlete.toLowerCase()
          ) ?? null

        if (!this.tooltipsInitialized) {
          queueMicrotask(() => {
            initFlowbite()
            this.tooltipsInitialized = true
          })
        }
      })
  }
}
