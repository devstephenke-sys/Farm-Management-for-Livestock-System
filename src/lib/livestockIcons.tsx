import React from 'react';
import {
  Beef,
  Bird,
  CircleDot,
  Rabbit,
  type LucideIcon,
} from 'lucide-react';

export type LivestockType = 'COW' | 'GOAT' | 'SHEEP' | 'PIG' | 'POULTRY' | 'RABBIT';

const LIVESTOCK_META: Record<
  LivestockType,
  { label: string; Icon: LucideIcon; className: string }
> = {
  COW: { label: 'Cow', Icon: Beef, className: 'text-emerald-600' },
  GOAT: { label: 'Goat', Icon: CircleDot, className: 'text-amber-600' },
  SHEEP: { label: 'Sheep', Icon: CircleDot, className: 'text-slate-500' },
  PIG: { label: 'Pig', Icon: CircleDot, className: 'text-rose-500' },
  POULTRY: { label: 'Poultry', Icon: Bird, className: 'text-orange-500' },
  RABBIT: { label: 'Rabbit', Icon: Rabbit, className: 'text-violet-500' },
};

export function LivestockTypeIcon({
  type,
  size = 18,
  className = '',
}: {
  type: string;
  size?: number;
  className?: string;
}) {
  const meta = LIVESTOCK_META[type as LivestockType] || {
    label: type,
    Icon: CircleDot,
    className: 'text-slate-500',
  };
  const { Icon } = meta;
  return <Icon size={size} className={`${meta.className} ${className}`.trim()} aria-hidden />;
}

export function livestockTypeLabel(type: string): string {
  return LIVESTOCK_META[type as LivestockType]?.label || type;
}
