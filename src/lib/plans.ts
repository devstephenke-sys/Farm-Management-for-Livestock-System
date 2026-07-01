export const PLAN_CARDS = {
  BASIC: {
    name: 'Basic',
    price: 500,
    testPrice: 1,
    highlights: ['Up to 20 animals', 'Health records', 'Vet booking', 'Reports'],
    unlocks: [] as string[],
  },
  STANDARD: {
    name: 'Standard',
    price: 1500,
    testPrice: 2,
    highlights: ['Up to 100 animals', 'Reports', 'Financial tools', 'Worker management', 'Vet booking'],
    unlocks: ['Vet booking', 'Up to 100 animals', 'Financial & inventory tools'],
  },
  PREMIUM: {
    name: 'Premium',
    price: 3500,
    testPrice: 3,
    highlights: ['Unlimited animals', 'Everything in Standard', 'Premium support', 'Custom exports'],
    unlocks: ['Unlimited animals', 'Premium support', 'Custom exports'],
  },
} as const;

export const PLAN_COMPARISON = [
  { feature: 'Animals', basic: '20', standard: '100', premium: 'Unlimited' },
  { feature: 'Vet Booking', basic: true, standard: true, premium: true },
  { feature: 'Reports', basic: 'Basic', standard: 'Advanced', premium: 'Advanced' },
  { feature: 'Inventory', basic: false, standard: true, premium: true },
  { feature: 'Workers', basic: false, standard: true, premium: true },
  { feature: 'Premium Support', basic: false, standard: false, premium: true },
];

export type BillingPlan = 'STANDARD' | 'PREMIUM';

export const PLAN_RANK = { BASIC: 0, STANDARD: 1, PREMIUM: 2 } as const;
