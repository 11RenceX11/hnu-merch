/** Formats whole pesos for display, for example 1100 becomes "₱1,100". */
export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH")}`;
}
