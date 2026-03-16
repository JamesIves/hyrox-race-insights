/**
 * Shared type definitions for the event-breakdown feature.
 */

/**
 * Aggregate metric comparison (total_time, work_time, etc.).
 */
export interface OverallChartData {
  /**
   * Human-readable metric label.
   */
  readonly label: string

  /**
   * Field average time (minutes).
   */
  readonly average: number

  /**
   * Focus athlete's time (minutes).
   */
  readonly athlete: number
}

/**
 * Per-event distribution data including the athlete's placement
 * within the field curve.
 */
export interface EventChartData {
  /**
   * Source metric descriptor.
   */
  readonly metric: {readonly key: string}

  /**
   * Human-readable event label.
   */
  readonly label: string

  /**
   * Field average time (minutes).
   */
  readonly average: number

  /**
   * Focus athlete's time (minutes).
   */
  readonly athlete: number

  /**
   * Sorted field distribution as (time, percentile) pairs.
   */
  readonly curve: readonly {
    readonly time: number
    readonly percentile: number
  }[]

  /**
   * Athlete's rank within the field (1 = fastest).
   */
  readonly athleteRank: number

  /**
   * Athlete's percentile within the field (lower = faster).
   */
  readonly athletePercentile: number

  /**
   * Total number of athletes in the field for this event.
   */
  readonly fieldSize: number
}
