/** Quote line math helpers (cents + quantity millis) */

export function quantityToMillis(qty: number): number {
  return Math.round(qty * 1000);
}

export function millisToQuantity(millis: number): number {
  return millis / 1000;
}

export function lineAmountCents(
  quantityMillis: number,
  unitPriceCents: number
): number {
  // amount = qty * unitPrice, with millis precision
  return Math.round((quantityMillis * unitPriceCents) / 1000);
}

export function computeQuoteTotals(
  lines: { quantityMillis: number; unitPriceCents: number }[],
  taxBps: number
) {
  const subtotalCents = lines.reduce(
    (sum, l) => sum + lineAmountCents(l.quantityMillis, l.unitPriceCents),
    0
  );
  const taxCents = Math.round((subtotalCents * taxBps) / 10000);
  const totalCents = subtotalCents + taxCents;
  return { subtotalCents, taxCents, totalCents };
}

export function percentToBps(percent: number): number {
  return Math.round(percent * 100);
}

export function bpsToPercent(bps: number): number {
  return bps / 100;
}
