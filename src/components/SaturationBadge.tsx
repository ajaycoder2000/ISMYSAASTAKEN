'use client';
import { SaturationLevel } from '@/types';
import SignalBars from './SignalBars';

export default function SaturationBadge({
  level,
  size = 'sm',
}: {
  level: SaturationLevel;
  size?: 'sm' | 'md' | 'lg';
}) {
  return <SignalBars score={level} size={size} />;
}
