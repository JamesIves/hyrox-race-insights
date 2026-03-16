/**
 * Heart-rate data model interfaces.
 *
 * Heart-rate readings originate from an Apple Watch export
 * (JSON or CSV) served at `/data/heart_rate.json`.
 */

/**
 * A single parsed heart-rate data point with per-minute resolution.
 */
export interface HeartRatePoint {
  /**
   * Absolute timestamp of the reading.
   */
  readonly timestamp: Date

  /**
   * Minutes elapsed since the first reading in the dataset.
   */
  readonly elapsedMinutes: number

  /**
   * Average heart rate (bpm) for this interval.
   */
  readonly avg: number

  /**
   * Minimum heart rate (bpm) for this interval.
   */
  readonly min: number

  /**
   * Maximum heart rate (bpm) for this interval.
   */
  readonly max: number
}

/**
 * A race segment mapped to an elapsed-time window for HR overlay.
 */
export interface SegmentRange {
  /**
   * Metric key from the event-order utility (e.g. `'run1_time'`).
   */
  readonly key: string

  /**
   * Human-readable label (e.g. "Run 1").
   */
  readonly label: string

  /**
   * Event group: `'Runs'` or `'Stations'`.
   */
  readonly group: string

  /**
   * Segment start in elapsed minutes from race start.
   */
  readonly startMinute: number

  /**
   * Segment end in elapsed minutes from race start.
   */
  readonly endMinute: number
}

/**
 * Aggregated heart-rate statistics for a single race event.
 */
export interface StationHeartRateSummary {
  /**
   * Metric key.
   */
  readonly key: string

  /**
   * Human-readable event label.
   */
  readonly label: string

  /**
   * `'Runs'` or `'Stations'`.
   */
  readonly group: string

  /**
   * Average heart rate (bpm) across the event.
   */
  readonly avgHr: number

  /**
   * Peak heart rate (bpm) during the event.
   */
  readonly maxHr: number
}

/**
 * Shape of a single row in the heart-rate JSON export.
 * Used for type-safe parsing of the uploaded data file.
 */
export interface HeartRateJsonRow {
  /**
   * Timestamp string in `YYYY-MM-DD HH:mm:ss` format.
   */
  readonly dateTime: string

  /**
   * Minimum bpm for the interval.
   */
  readonly min: number

  /**
   * Maximum bpm for the interval.
   */
  readonly max: number

  /**
   * Average bpm for the interval.
   */
  readonly avg: number

  /**
   * Optional context tag from the Apple Watch export.
   */
  readonly context?: string

  /**
   * Optional source device identifier.
   */
  readonly source?: string
}
