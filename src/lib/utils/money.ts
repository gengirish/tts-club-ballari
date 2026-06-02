// Currency is always stored and computed in PAISE (integer). Format at view layer only.

export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);
export const paiseToRupees = (paise: number): number => paise / 100;

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

/** Format paise as ₹ for display. e.g. 49900 -> "₹499.00" */
export const formatPaise = (paise: number): string => inr.format(paise / 100);

/** Format paise without decimals when whole. e.g. 49900 -> "₹499" */
export const formatPaiseShort = (paise: number): string =>
  paise % 100 === 0 ? "₹" + (paise / 100).toLocaleString("en-IN") : formatPaise(paise);
