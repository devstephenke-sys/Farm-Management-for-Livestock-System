export const TRAINING_CATEGORIES = [
  { id: 'CATTLE', name: 'Dairy Cattle', emoji: '🐄' },
  { id: 'GOAT', name: 'Goats', emoji: '🐐' },
  { id: 'SHEEP', name: 'Sheep', emoji: '🐑' },
  { id: 'POULTRY', name: 'Poultry', emoji: '🐔' },
  { id: 'PIG', name: 'Pigs', emoji: '🐖' },
  { id: 'RABBIT', name: 'Rabbits', emoji: '🐇' },
] as const;

export const TRAINING_MODULES = [
  { id: 'FEEDING', name: 'Feeding', icon: '🌾' },
  { id: 'VACCINATION', name: 'Vaccination', icon: '💉' },
  { id: 'DISEASES', name: 'Diseases', icon: '🩺' },
  { id: 'BREEDING', name: 'Breeding', icon: '🧬' },
  { id: 'HOUSING', name: 'Housing', icon: '🏠' },
] as const;

export function getModulesForCategory(categoryId: string) {
  if (categoryId === 'POULTRY' || categoryId === 'RABBIT') {
    return TRAINING_MODULES.filter((m) => m.id !== 'BREEDING');
  }
  return TRAINING_MODULES;
}
