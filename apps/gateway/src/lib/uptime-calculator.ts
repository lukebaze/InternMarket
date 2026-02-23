/**
 * Compute uptime percentage from health check counters.
 * Uptime = health check pass rate (NOT request success rate).
 *
 * @param totalChecks - Total health check probes
 * @param passedChecks - Probes that returned healthy
 * @returns 0-100 percentage. New agents with 0 checks get 100 (benefit of doubt).
 */
export function computeUptime(totalChecks: number, passedChecks: number): number {
  if (totalChecks === 0) return 100;
  return (passedChecks / totalChecks) * 100;
}
