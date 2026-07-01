/** FarmFMS — unique brand identity for payments, receipts, and UI copy */
export const BRAND = {
  name: 'FarmFMS',
  tagline: 'Smart Agriculture',
  /** Shown on M-Pesa STK prompt (max 13 chars for Daraja TransactionDesc) */
  mpesaDesc: (plan: string) => {
    const short = plan === 'PREMIUM' ? 'Prem' : plan === 'STANDARD' ? 'Std' : 'Basic';
    return `FarmFMS ${short}`;
  },
  /** Account reference on M-Pesa receipt (max 12 chars) */
  mpesaAccountRef: (plan: string) => {
    const code = plan === 'PREMIUM' ? 'PREM' : plan === 'STANDARD' ? 'STD' : 'BAS';
    return `FarmFMS-${code}`;
  },
  /** Full label for dashboards and history tables */
  paymentLabel: (plan: string) => `${BRAND.name} ${plan.charAt(0) + plan.slice(1).toLowerCase()} Plan`,
} as const;

export function formatKes(amount: unknown): string {
  const n = typeof amount === 'number' ? amount : Number(amount);
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString('en-KE', { maximumFractionDigits: 0 });
}
