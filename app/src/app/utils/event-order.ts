/**
 * Canonical Hyrox race event ordering.
 *
 * Provides the single source of truth for the sequence of runs and
 * workout stations in a standard Hyrox race.  All chart components
 * consume this array to guarantee a consistent event axis.
 */

/**
 * Discriminator for run vs. workout-station events.
 */
export type EventGroup = 'Runs' | 'Stations'

/**
 * A single event entry in the canonical race order.
 */
export interface OrderedEventMetric {
  /**
   * Property key on {@link RaceData} (e.g. `'run1_time'`).
   */
  readonly key: string
  /**
   * Human-readable display label.
   */
  readonly label: string

  /**
   * Whether this event is a run or a workout station.
   */
  readonly group: EventGroup
}

/**
 * The 16 events of a Hyrox race in their official execution order.
 * Run segments alternate with workout stations, ending with Wall Balls.
 */
export const ORDERED_EVENT_METRICS: readonly OrderedEventMetric[] = [
  {key: 'run1_time', label: 'Run 1', group: 'Runs'},
  {key: 'skiErg_time', label: 'SkiErg', group: 'Stations'},
  {key: 'run2_time', label: 'Run 2', group: 'Runs'},
  {key: 'sledPush_time', label: 'Sled Push', group: 'Stations'},
  {key: 'run3_time', label: 'Run 3', group: 'Runs'},
  {key: 'sledPull_time', label: 'Sled Pull', group: 'Stations'},
  {key: 'run4_time', label: 'Run 4', group: 'Runs'},
  {key: 'burpeeBroadJump_time', label: 'Burpee Broad Jump', group: 'Stations'},
  {key: 'run5_time', label: 'Run 5', group: 'Runs'},
  {key: 'rowErg_time', label: 'RowErg', group: 'Stations'},
  {key: 'run6_time', label: 'Run 6', group: 'Runs'},
  {key: 'farmersCarry_time', label: "Farmer's Carry", group: 'Stations'},
  {key: 'run7_time', label: 'Run 7', group: 'Runs'},
  {key: 'sandbagLunges_time', label: 'Sandbag Lunges', group: 'Stations'},
  {key: 'run8_time', label: 'Run 8', group: 'Runs'},
  {key: 'wallBalls_time', label: 'Wall Balls', group: 'Stations'}
] as const
