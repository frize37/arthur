export function shekel(n: number): string {
  return "₪" + Math.round(n).toLocaleString("he-IL");
}

export function monthlyPayment(principal: number, annualRatePct: number, months: number): number {
  const r = annualRatePct / 100 / 12;
  if (months <= 0) return 0;
  if (r === 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

export function computeSuggestedSavings(balance: number, rate: number, totalMonths: number): number {
  const betterRate = Math.max(3.2, rate - 0.7);
  const currentPayment = monthlyPayment(balance, rate, totalMonths);
  const betterPayment = monthlyPayment(balance, betterRate, totalMonths);
  return Math.max(0, (currentPayment - betterPayment) * totalMonths);
}

export type Band = "good" | "watch" | "risk";

export function bandFor(payment: number, comfort: number, max: number): Band {
  if (payment <= comfort) return "good";
  if (payment <= max) return "watch";
  return "risk";
}
