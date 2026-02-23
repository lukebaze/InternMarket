/**
 * Wilson lower bound at 95% confidence (z = 1.96).
 * Dampens rating confidence for low review counts —
 * an agent with 1 review at 5.0 scores lower than one with 500 reviews at 4.8.
 *
 * @param avg - Average rating (0-5 scale)
 * @param count - Total number of ratings
 * @returns Confidence-adjusted rating on 0-5 scale
 */
export function wilsonLowerBound(avg: number, count: number): number {
  if (count === 0) return 0;
  const z = 1.96;
  const phat = avg / 5; // normalize to 0-1
  const denominator = 1 + (z * z) / count;
  const center = phat + (z * z) / (2 * count);
  const spread = z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * count)) / count);
  return ((center - spread) / denominator) * 5; // back to 0-5 scale
}
