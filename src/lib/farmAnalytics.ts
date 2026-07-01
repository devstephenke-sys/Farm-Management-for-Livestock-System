export interface ChartPoint {
  label: string;
  value: number;
}

export interface ChartSeries {
  label: string;
  color: string;
  points: ChartPoint[];
}

export const CHART_COLORS = [
  '#2d6a4f',
  '#40916c',
  '#52b788',
  '#74c69d',
  '#95d5b2',
  '#1b4332',
  '#d4a373',
  '#e76f51',
  '#457b9d',
  '#f4a261',
];

export function animalAgeYears(dob: string | Date): number {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return 0;
  return (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}

export function getAgeGroup(animal: { dob: string; gender: string; type: string }): string {
  const age = animalAgeYears(animal.dob);
  if (age < 1) return 'Calves';
  if (animal.gender === 'MALE') {
    if (age < 3) return 'Young Bulls';
    return 'Adult Bulls';
  }
  if (age < 2) return 'Heifers';
  if (age >= 8) return 'Senior';
  return 'Adult Cows';
}

export function isSick(animal: { healthRecords?: { type: string }[] }): boolean {
  return (animal.healthRecords || []).some((hr) => hr.type === 'DISEASE');
}

export function isPregnant(animal: { breedingRecords?: { result: string }[] }): boolean {
  return (animal.breedingRecords || []).some((br) => br.result === 'PREGNANT');
}

export function computeHerdKpis(animals: any[]) {
  const active = animals.filter((a) => a.status === 'ACTIVE');
  const cattle = animals.filter((a) => ['COW', 'GOAT', 'SHEEP'].includes(a.type));
  const sick = animals.filter(isSick);
  const pregnant = animals.filter(isPregnant);
  const calves = active.filter((a) => animalAgeYears(a.dob) < 1);
  const bulls = active.filter(
    (a) => a.gender === 'MALE' && ['COW', 'GOAT', 'SHEEP'].includes(a.type)
  );
  const milkProducers = active.filter(
    (a) =>
      a.gender === 'FEMALE' &&
      ['COW', 'GOAT', 'SHEEP'].includes(a.type) &&
      (a.productionRecords || []).some((pr: { milkYield?: number | null }) => pr.milkYield != null)
  );
  const sold = animals.filter((a) => a.status === 'SOLD');
  const purchased = animals.filter((a) => a.purchaseDate);
  const dead = animals.filter((a) => a.status === 'DEAD');
  const mortalityRate =
    animals.length > 0 ? Math.round((dead.length / animals.length) * 1000) / 10 : 0;

  return {
    totalLivestock: active.length,
    totalCattle: cattle.filter((a) => a.status === 'ACTIVE').length,
    healthy: active.length - sick.filter((a) => a.status === 'ACTIVE').length,
    sick: sick.filter((a) => a.status === 'ACTIVE').length,
    pregnant: pregnant.filter((a) => a.status === 'ACTIVE').length,
    calves: calves.length,
    bulls: bulls.length,
    milkProducers: milkProducers.length,
    sold: sold.length,
    purchased: purchased.length,
    mortalityRate,
  };
}

export function countByField(animals: any[], field: 'breed' | 'type'): ChartPoint[] {
  const map = new Map<string, number>();
  for (const a of animals.filter((x) => x.status === 'ACTIVE')) {
    const key = String(a[field] || 'Unknown');
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function countByAgeGroup(animals: any[]): ChartPoint[] {
  const order = ['Calves', 'Heifers', 'Young Bulls', 'Adult Cows', 'Adult Bulls', 'Senior'];
  const map = new Map<string, number>();
  for (const a of animals.filter((x) => x.status === 'ACTIVE')) {
    const group = getAgeGroup(a);
    map.set(group, (map.get(group) || 0) + 1);
  }
  return order.filter((g) => map.has(g)).map((label) => ({ label, value: map.get(label) || 0 }));
}

export function healthStatusBreakdown(animals: any[]): ChartPoint[] {
  const active = animals.filter((a) => a.status === 'ACTIVE');
  const sick = active.filter(isSick).length;
  const underTreatment = active.filter((a) =>
    (a.healthRecords || []).some((hr: { type: string }) => hr.type === 'TREATMENT' || hr.type === 'MEDICATION')
  ).length;
  const recovered = animals.filter((a) =>
    (a.healthRecords || []).some((hr: { title?: string }) =>
      String(hr.title || '').toLowerCase().includes('recover')
    )
  ).length;
  const healthy = Math.max(0, active.length - sick);
  return [
    { label: 'Healthy', value: healthy },
    { label: 'Under Treatment', value: underTreatment },
    { label: 'Sick', value: sick },
    { label: 'Recovered', value: recovered },
  ].filter((p) => p.value > 0);
}

export function monthlyCountsFromAnimals(
  animals: any[],
  mode: 'births' | 'deaths' | 'sales' | 'purchases'
): ChartPoint[] {
  const months = getLastMonths(6);
  const counts = new Map(months.map((m) => [m, 0]));

  for (const a of animals) {
    let date: Date | null = null;
    if (mode === 'births') date = new Date(a.dob);
    else if (mode === 'deaths' && a.status === 'DEAD') date = new Date(a.updatedAt || a.createdAt);
    else if (mode === 'sales' && a.status === 'SOLD') date = new Date(a.updatedAt || a.createdAt);
    else if (mode === 'purchases' && a.purchaseDate) date = new Date(a.purchaseDate);

    if (!date || Number.isNaN(date.getTime())) continue;
    const key = monthKey(date);
    if (counts.has(key)) counts.set(key, (counts.get(key) || 0) + 1);
  }

  return months.map((label) => ({ label, value: counts.get(label) || 0 }));
}

export function computeMilkKpis(animals: any[]) {
  const records = animals.flatMap((a) =>
    (a.productionRecords || [])
      .filter((pr: { milkYield?: number | null }) => pr.milkYield != null)
      .map((pr: { milkYield: number; date: string; animalId?: number }) => ({
        ...pr,
        animalId: a.id,
        animalName: a.name,
        animalTag: a.tagNumber,
      }))
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const sumInRange = (from: Date) =>
    records
      .filter((r) => new Date(r.date) >= from)
      .reduce((s, r) => s + (r.milkYield || 0), 0);

  const todayTotal = sumInRange(today);
  const weekTotal = sumInRange(weekAgo);
  const monthTotal = sumInRange(monthStart);

  const byAnimal = new Map<number, number>();
  for (const r of records.filter((rec) => new Date(rec.date) >= monthStart)) {
    byAnimal.set(r.animalId, (byAnimal.get(r.animalId) || 0) + (r.milkYield || 0));
  }
  const top = [...byAnimal.entries()].sort((a, b) => b[1] - a[1])[0];
  const topAnimal = top
    ? records.find((r) => r.animalId === top[0])
    : null;
  const producerCount = byAnimal.size || 1;

  return {
    today: todayTotal,
    week: weekTotal,
    month: monthTotal,
    avgPerCow: monthTotal / producerCount,
    topCow: topAnimal ? `${topAnimal.animalName} (${topAnimal.animalTag})` : '—',
    topYield: top ? top[1] : 0,
    records,
  };
}

export function dailyMilkSeries(animals: any[], days = 14): ChartPoint[] {
  const records = animals.flatMap((a) => a.productionRecords || []);
  const labels = getLastDays(days);
  const map = new Map(labels.map((d) => [d, 0]));

  for (const pr of records) {
    if (pr.milkYield == null) continue;
    const key = dayKey(new Date(pr.date));
    if (map.has(key)) map.set(key, (map.get(key) || 0) + pr.milkYield);
  }

  return labels.map((label) => ({ label, value: Math.round((map.get(label) || 0) * 10) / 10 }));
}

export function topProducingCows(animals: any[], limit = 5): ChartPoint[] {
  const map = new Map<string, number>();
  for (const a of animals) {
    const total = (a.productionRecords || [])
      .filter((pr: { milkYield?: number | null }) => pr.milkYield != null)
      .reduce((s: number, pr: { milkYield: number }) => s + pr.milkYield, 0);
    if (total > 0) map.set(`${a.name} (${a.tagNumber})`, total);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value: Math.round(value * 10) / 10 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function milkByBreed(animals: any[]): ChartPoint[] {
  const map = new Map<string, number>();
  for (const a of animals) {
    const total = (a.productionRecords || [])
      .filter((pr: { milkYield?: number | null }) => pr.milkYield != null)
      .reduce((s: number, pr: { milkYield: number }) => s + pr.milkYield, 0);
    if (total > 0) map.set(a.breed || 'Unknown', (map.get(a.breed || 'Unknown') || 0) + total);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value: Math.round(value * 10) / 10 }))
    .sort((a, b) => b.value - a.value);
}

export function computeHealthKpis(animals: any[], scheduleEvents: any[]) {
  const vaccinated = scheduleEvents.filter(
    (e) => e.type === 'VACCINATION' && e.completed
  ).length;
  const dueVaccination = scheduleEvents.filter(
    (e) => e.type === 'VACCINATION' && !e.completed && new Date(e.dueDate) >= new Date()
  ).length;
  const treated = animals.filter((a) =>
    (a.healthRecords || []).some((hr: { type: string }) =>
      ['TREATMENT', 'MEDICATION', 'VET_VISIT'].includes(hr.type)
    )
  ).length;
  const sick = animals.filter(isSick).length;
  const recovered = animals.filter((a) =>
    (a.healthRecords || []).some((hr: { title?: string }) =>
      String(hr.title || '').toLowerCase().includes('recover')
    )
  ).length;
  const deaths = animals.filter((a) => a.status === 'DEAD').length;

  return { vaccinated, dueVaccination, treated, sick, recovered, deaths };
}

export function diseaseOccurrence(animals: any[]): ChartPoint[] {
  const map = new Map<string, number>();
  for (const a of animals) {
    for (const hr of a.healthRecords || []) {
      if (hr.type === 'DISEASE') {
        const title = hr.title || 'Unknown';
        map.set(title, (map.get(title) || 0) + 1);
      }
    }
  }
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function medicationCostTrend(animals: any[]): ChartPoint[] {
  const months = getLastMonths(6);
  const map = new Map(months.map((m) => [m, 0]));

  for (const a of animals) {
    for (const hr of a.healthRecords || []) {
      if (!hr.cost || hr.cost <= 0) continue;
      if (!['MEDICATION', 'TREATMENT', 'VACCINATION', 'VET_VISIT'].includes(hr.type)) continue;
      const key = monthKey(new Date(hr.date));
      if (map.has(key)) map.set(key, (map.get(key) || 0) + hr.cost);
    }
  }

  return months.map((label) => ({ label, value: Math.round(map.get(label) || 0) }));
}

export function computeBreedingKpis(animals: any[]) {
  const pregnant = animals.filter(isPregnant).length;
  const expectedCalving = animals.filter((a) =>
    (a.breedingRecords || []).some(
      (br: { result: string; nextActionDate?: string }) =>
        br.result === 'PREGNANT' && br.nextActionDate
    )
  ).length;
  const inseminations = animals.flatMap((a) => a.breedingRecords || []).filter(
    (br: { type: string }) => br.type === 'ARTIFICIAL_INSEMINATION' || br.type === 'MATING'
  );
  const successful = inseminations.filter(
    (br: { result: string }) => br.result === 'PREGNANT' || br.result === 'SUCCESS'
  ).length;
  const repeat = inseminations.filter((br: { result: string }) => br.result === 'FAILED').length;
  const successRate =
    inseminations.length > 0 ? Math.round((successful / inseminations.length) * 100) : 0;

  return { pregnant, expectedCalving, successful, repeat, successRate, inseminations: inseminations.length };
}

export function pregnancyRatePie(animals: any[]): ChartPoint[] {
  const pregnant = animals.filter(isPregnant).length;
  const notPregnant = animals.filter((a) => a.status === 'ACTIVE' && a.gender === 'FEMALE' && !isPregnant(a)).length;
  return [
    { label: 'Pregnant', value: pregnant },
    { label: 'Not Pregnant', value: notPregnant },
  ].filter((p) => p.value > 0);
}

export function monthlyCalvingTrend(animals: any[]): ChartPoint[] {
  const months = getLastMonths(6);
  const map = new Map(months.map((m) => [m, 0]));

  for (const a of animals) {
    for (const br of a.breedingRecords || []) {
      if (br.result !== 'PREGNANT' && br.result !== 'SUCCESS') continue;
      const date = br.nextActionDate ? new Date(br.nextActionDate) : new Date(br.date);
      const key = monthKey(date);
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
    }
  }

  return months.map((label) => ({ label, value: map.get(label) || 0 }));
}

export function computeFinancialKpis(transactions: any[]) {
  const income = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0);
  const net = income - expense;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthIncome = transactions
    .filter((t) => t.type === 'INCOME' && new Date(t.date) >= monthStart)
    .reduce((s, t) => s + t.amount, 0);
  const monthExpense = transactions
    .filter((t) => t.type === 'EXPENSE' && new Date(t.date) >= monthStart)
    .reduce((s, t) => s + t.amount, 0);
  const profitMargin = income > 0 ? Math.round((net / income) * 1000) / 10 : 0;

  return {
    income,
    expense,
    net,
    monthIncome,
    monthExpense,
    monthProfit: monthIncome - monthExpense,
    profitMargin,
    cashBalance: net,
  };
}

export function monthlyIncomeExpenseSeries(transactions: any[]): {
  income: ChartPoint[];
  expense: ChartPoint[];
  profit: ChartPoint[];
} {
  const months = getLastMonths(6);
  const incomeMap = new Map(months.map((m) => [m, 0]));
  const expenseMap = new Map(months.map((m) => [m, 0]));

  for (const tx of transactions) {
    const key = monthKey(new Date(tx.date));
    if (!incomeMap.has(key)) continue;
    if (tx.type === 'INCOME') incomeMap.set(key, (incomeMap.get(key) || 0) + tx.amount);
    else expenseMap.set(key, (expenseMap.get(key) || 0) + tx.amount);
  }

  const income = months.map((label) => ({ label, value: Math.round(incomeMap.get(label) || 0) }));
  const expense = months.map((label) => ({ label, value: Math.round(expenseMap.get(label) || 0) }));
  const profit = months.map((label, i) => ({
    label,
    value: income[i].value - expense[i].value,
  }));

  return { income, expense, profit };
}

export function categoryBreakdown(transactions: any[], type: 'INCOME' | 'EXPENSE'): ChartPoint[] {
  const map = new Map<string, number>();
  for (const tx of transactions.filter((t) => t.type === type)) {
    const cat = (tx.category || 'OTHER').replace(/_/g, ' ');
    map.set(cat, (map.get(cat) || 0) + tx.amount);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value: Math.round(value) }))
    .sort((a, b) => b.value - a.value);
}

export function monthlyCashFlow(transactions: any[]): ChartPoint[] {
  const months = getLastMonths(6);
  const map = new Map(months.map((m) => [m, 0]));

  for (const tx of transactions) {
    const key = monthKey(new Date(tx.date));
    if (!map.has(key)) continue;
    const delta = tx.type === 'INCOME' ? tx.amount : -tx.amount;
    map.set(key, (map.get(key) || 0) + delta);
  }

  return months.map((label) => ({ label, value: Math.round(map.get(label) || 0) }));
}

export function filterAnimals(
  animals: any[],
  filters: {
    breed?: string;
    gender?: string;
    ageGroup?: string;
    healthStatus?: string;
    tagSearch?: string;
    type?: string;
  }
): any[] {
  return animals.filter((a) => {
    if (filters.breed && filters.breed !== 'ALL' && a.breed !== filters.breed) return false;
    if (filters.gender && filters.gender !== 'ALL' && a.gender !== filters.gender) return false;
    if (filters.type && filters.type !== 'ALL' && a.type !== filters.type) return false;
    if (filters.ageGroup && filters.ageGroup !== 'ALL' && getAgeGroup(a) !== filters.ageGroup) return false;
    if (filters.healthStatus === 'SICK' && !isSick(a)) return false;
    if (filters.healthStatus === 'HEALTHY' && isSick(a)) return false;
    if (filters.healthStatus === 'PREGNANT' && !isPregnant(a)) return false;
    if (filters.tagSearch) {
      const q = filters.tagSearch.toLowerCase();
      if (!a.tagNumber.toLowerCase().includes(q) && !a.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

function monthKey(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function dayKey(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getLastMonths(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(monthKey(m));
  }
  return out;
}

function getLastDays(count: number): string[] {
  const out: string[] = [];
  const d = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const day = new Date(d);
    day.setDate(day.getDate() - i);
    out.push(dayKey(day));
  }
  return out;
}

export function formatKesShort(n: number): string {
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `KES ${(n / 1_000).toFixed(1)}K`;
  return `KES ${Math.round(n).toLocaleString()}`;
}
