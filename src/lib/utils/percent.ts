// Percentages and ratings stored in BASIS POINTS (integer, 10000 = 100%).

export const BPS_FULL = 10000;

export const fractionToBps = (fraction: number): number => Math.round(fraction * BPS_FULL);
export const bpsToFraction = (bps: number): number => bps / BPS_FULL;

/** 7100 -> "71%" */
export const formatBps = (bps: number): string => `${Math.round(bps / 100)}%`;

/** Rating stored as bps where 50000 = 5.0 stars. 49000 -> "4.9" */
export const formatStars = (bps: number): string => (bps / 10000).toFixed(1);
