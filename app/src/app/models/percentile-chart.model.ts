/**
 * Data-point interface for the percentile-chart component.
 */

/**
 * A single event's delta versus the field average.
 */
export interface DeltaPoint {
  /**
   * Human-readable event name.
   */
  readonly name: string

  /**
   * Event group (`'Runs'` or `'Stations'`).
   */
  readonly group: string

  /**
   * Time difference in seconds (positive = slower than average).
   */
  readonly deltaSeconds: number

  /**
   * Percentage difference from the average.
   */
  readonly deltaPct: number
}
