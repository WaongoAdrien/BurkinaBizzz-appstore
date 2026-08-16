// components/OpeningHoursStatus.tsx — live "Ouvert"/"Fermé" badge computed from Africa/Ouagadougou time

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OpeningHours } from '../types';
import { getBusinessOpenStatus, formatStatusLabel } from '../lib/openingHours';
import { useTranslation, registerTranslations } from '../lib/LanguageContext';

registerTranslations({
  'Ouvert': 'Open',
  'Fermé': 'Closed',
  'Horaires non renseignés': 'Hours not provided',
});

const REFRESH_MS = 60000; // recompute every minute so the badge flips live at opening/closing time

interface Props {
  openingHours?: OpeningHours;
  variant?: 'badge' | 'compact';
  hideWhenMissing?: boolean;
}

export function OpeningHoursStatus({ openingHours, variant = 'badge', hideWhenMissing = false }: Props) {
  const { t } = useTranslation();
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceTick(v => v + 1), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const status = getBusinessOpenStatus(openingHours);
  if (!status && hideWhenMissing) return null;

  const label = t(formatStatusLabel(status));
  const color = status ? (status.isOpen ? '#2E7D32' : '#C62828') : '#9E9E9E';

  if (variant === 'compact') {
    return (
      <View style={styles.compactRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.compactText, { color }]} numberOfLines={1}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: color + '1F', borderColor: color + '55' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 5, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 12, fontWeight: '400' },
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  compactText: { fontSize: 11, fontWeight: '400' },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
