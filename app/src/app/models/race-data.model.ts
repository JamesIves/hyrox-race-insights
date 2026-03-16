/**
 * Data model interfaces for Hyrox race athlete timing data.
 *
 * All `_time` fields are expressed in **minutes** (fractional).
 * The data originates from race-result JSON exports served at `/data/race.json`.
 */

/**
 * A single athlete's race-result row.
 *
 * Known timing fields are declared explicitly for autocompletion and
 * type-safety on direct access.  The index signature covers any additional
 * or future metrics that may appear in the source JSON.
 */
export interface RaceData {
  /**
   * Athlete display name in "Last, First" format.
   */
  readonly name: string

  /* ── Aggregate times ─────────────────────────────────────── */

  /**
   * Total race time (minutes).
   */
  readonly total_time: number

  /**
   * Combined workout-station time (minutes).
   */
  readonly work_time: number

  /**
   * Combined running time (minutes).
   */
  readonly run_time: number

  /**
   * Roxzone transition time (minutes).
   */
  readonly roxzone_time: number

  /* ── Individual run segments ─────────────────────────────── */

  /**
   * Run 1 time (minutes).
   */
  readonly run1_time: number

  /**
   * Run 2 time (minutes).
   */
  readonly run2_time: number

  /**
   * Run 3 time (minutes).
   */
  readonly run3_time: number

  /**
   * Run 4 time (minutes).
   */
  readonly run4_time: number

  /**
   * Run 5 time (minutes).
   */
  readonly run5_time: number

  /**
   * Run 6 time (minutes).
   */
  readonly run6_time: number

  /**
   * Run 7 time (minutes).
   */
  readonly run7_time: number

  /**
   * Run 8 time (minutes).
   */
  readonly run8_time: number

  /* ── Workout stations ────────────────────────────────────── */

  /**
   * SkiErg station time (minutes).
   */
  readonly skiErg_time: number

  /**
   * Sled Push station time (minutes).
   */
  readonly sledPush_time: number

  /**
   * Sled Pull station time (minutes).
   */
  readonly sledPull_time: number

  /**
   * Burpee Broad Jump station time (minutes).
   */
  readonly burpeeBroadJump_time: number

  /**
   * RowErg station time (minutes).
   */
  readonly rowErg_time: number

  /**
   * Farmer's Carry station time (minutes).
   */
  readonly farmersCarry_time: number

  /**
   * Sandbag Lunges station time (minutes).
   */
  readonly sandbagLunges_time: number

  /**
   * Wall Balls station time (minutes).
   */
  readonly wallBalls_time: number

  /* ── Dynamic key access ──────────────────────────────────── */

  /**
   * Index signature for computed-key access (e.g. via {@link ORDERED_EVENT_METRICS}).
   *
   * With `noPropertyAccessFromIndexSignature` enabled, bracket notation is
   * required for any key not explicitly declared above.
   */
  readonly [key: string]: string | number
}

/**
 * A comparison between an athlete's metric value and the field average.
 * Used by the metrics-overview and stats-grid components.
 */
export interface ComparisonPoint {
  /**
   * Human-readable metric label (e.g. "Run 1").
   */
  readonly label: string

  /**
   * Field-wide average time (minutes).
   */
  readonly average: number

  /**
   * Focus athlete's time (minutes).
   */
  readonly athlete: number
  /**
   * Performance index where 100 = field average.
   * Values above 100 indicate the athlete was faster than average.
   */
  readonly performanceIndex: number
}
