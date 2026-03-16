/**
 * Display-formatting utilities shared across all dashboard components.
 */

/**
 * Lookup table mapping raw metric keys (camelCase, snake_case, lowercase)
 * to their canonical display names.
 */
const METRIC_NAME_MAP: Readonly<Record<string, string>> = {
  sandbag_lunges: 'Sandbag Lunges',
  sandbagLunges: 'Sandbag Lunges',
  sandbaglunges: 'Sandbag Lunges',
  rox_zone: 'Roxzone',
  roxzone: 'Roxzone',
  burpee_broad_jump: 'Burpee Broad Jump',
  burpeeBroadJump: 'Burpee Broad Jump',
  burpeebroadjump: 'Burpee Broad Jump',
  farmers_carry: 'Farmers Carry',
  farmersCarry: 'Farmers Carry',
  farmerscarry: 'Farmers Carry',
  wall_balls: 'Wall Balls',
  wallBalls: 'Wall Balls',
  wallballs: 'Wall Balls',
  sled_push: 'Sled Push',
  sledPush: 'Sled Push',
  sledpush: 'Sled Push',
  sled_pull: 'Sled Pull',
  sledPull: 'Sled Pull',
  sledpull: 'Sled Pull',
  ski_erg: 'Ski Erg',
  skiErg: 'Ski Erg',
  skierg: 'Ski Erg',
  row_erg: 'Rowing',
  rowErg: 'Rowing',
  rowerg: 'Rowing',
  run_time: 'Run Time',
  work_time: 'Work Time',
  total_time: 'Total Time',
  roxzone_time: 'Roxzone',
  run1_time: 'Run 1',
  run2_time: 'Run 2',
  run3_time: 'Run 3',
  run4_time: 'Run 4',
  run5_time: 'Run 5',
  run6_time: 'Run 6',
  run7_time: 'Run 7',
  run8_time: 'Run 8'
}

/**
 * Converts a raw metric key to a human-readable display name.
 *
 * Checks the explicit mapping first, then strips a trailing `_time`
 * suffix and retries.  Falls back to splitting camelCase / snake_case
 * and title-casing each word.
 *
 * @param key - Raw metric key (e.g. `'burpeeBroadJump_time'`).
 * @returns  Human-readable label (e.g. `'Burpee Broad Jump'`).
 */
export function formatMetricName(key: string): string {
  const direct = METRIC_NAME_MAP[key]
  if (direct) {
    return direct
  }

  const baseKey = key.replace(/_time$/, '')
  const base = METRIC_NAME_MAP[baseKey]
  if (base) {
    return base
  }

  return baseKey
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase())
}

/**
 * Formats a duration in fractional minutes as `M:SS`.
 *
 * @param minutes - Duration in minutes (e.g. `5.5` → `"5:30"`).
 * @returns Formatted string, or `"—"` for invalid / negative input.
 */
export function formatTime(minutes: number): string {
  if (typeof minutes !== 'number' || minutes < 0) {
    return '—'
  }

  const mins = Math.floor(minutes)
  const secs = Math.round((minutes - mins) * 60)

  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Formats a duration in fractional minutes as a short label (e.g. `"5.5 min"`).
 *
 * @param minutes - Duration in minutes.
 * @returns Short formatted string, or `"—"` for invalid / negative input.
 */
export function formatTimeShort(minutes: number): string {
  if (typeof minutes !== 'number' || minutes < 0) {
    return '—'
  }
  return Math.round(minutes * 10) / 10 + ' min'
}
