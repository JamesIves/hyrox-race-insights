/**
 * Data-point interfaces for the race-insights component.
 */

import type {EventGroup} from '../utils/event-order'

/**
 * Per-event delta with cumulative tracking for the progression area chart.
 */
export interface EventDeltaPoint {
  /**
   * Metric key (e.g. `'run1_time'`).
   */
  readonly key: string

  /**
   * Human-readable event label.
   */
  readonly label: string

  /**
   * Event group discriminator.
   */
  readonly group: EventGroup

  /**
   * Time delta versus field average for this event (seconds).
   */
  readonly deltaSeconds: number

  /**
   * Running cumulative delta through the race (seconds).
   */
  readonly cumulativeSeconds: number
}

/**
 * Row in the "Biggest Opportunities" bar list.
 */
export interface OpportunityRow {
  /**
   * Event label.
   */
  readonly label: string

  /**
   * Positive delta in seconds (how much time was lost).
   */
  readonly deltaSeconds: number

  /**
   * Width percentage for the progress bar (0–100).
   */
  readonly opportunityWidth: number
}
