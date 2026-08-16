// components/OpeningHoursWeekly.tsx — full weekly schedule list, shown in its own card under Contact

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OpeningHours } from '../types';
import { DAY_ORDER, DAY_LABELS_FR, getTodayDayKey } from '../lib/openingHours';
import { useTranslation, registerTranslations } from '../lib/LanguageContext';
import { Colors } from '../constants';

registerTranslations({
  'Fermé': 'Closed',
});

interface Props {
  openingHours?: OpeningHours;
  theme: any;
}

export function OpeningHoursWeekly({ openingHours, theme }: Props) {
  const { t } = useTranslation();
  if (!openingHours) return null;
  const todayKey = getTodayDayKey();

  return (
    <View>
      {DAY_ORDER.map(dayKey => {
        const day = openingHours[dayKey];
        const isToday = dayKey === todayKey;
        const isClosed = !day || day.closed || !day.open || !day.close;
        const label = isClosed ? t('Fermé') : `${day!.open} - ${day!.close}`;
        return (
          <View key={dayKey} style={[styles.row, isToday && { backgroundColor: Colors.primary + '12' }]}>
            <Text style={[styles.day, { color: theme.text }, isToday && { color: Colors.primary, fontWeight: '600' }]}>
              {DAY_LABELS_FR[dayKey]}
            </Text>
            <Text style={[styles.value, { color: isClosed ? '#C62828' : theme.textSecondary }, isToday && { fontWeight: '600' }]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 8, borderRadius: 6,
  },
  day: { fontSize: 13, fontWeight: '400' },
  value: { fontSize: 13, fontWeight: '400' },
});
