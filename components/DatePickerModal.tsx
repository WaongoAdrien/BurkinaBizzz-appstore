// components/DatePickerModal.tsx — lightweight day/month/year picker, no native dependency.
// Produces/consumes ISO "YYYY-MM-DD" strings.

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants';
import { useTranslation, registerTranslations } from '../lib/LanguageContext';

registerTranslations({
  'Choisir une date': 'Choose a date',
  'Valider': 'Confirm',
  'Annuler': 'Cancel',
});

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const daysInMonth = (year: number, monthIndex: number) => new Date(year, monthIndex + 1, 0).getDate();

function toIso(year: number, monthIndex: number, day: number): string {
  const mm = String(monthIndex + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function parseIso(value?: string): { year: number; monthIndex: number; day: number } {
  const now = new Date();
  const fallback = { year: now.getFullYear(), monthIndex: now.getMonth(), day: now.getDate() };
  if (!value) return fallback;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return fallback;
  const year = parseInt(m[1], 10), monthIndex = parseInt(m[2], 10) - 1, day = parseInt(m[3], 10);
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > daysInMonth(year, monthIndex)) return fallback;
  return { year, monthIndex, day };
}

interface Props {
  visible: boolean;
  initialValue?: string;
  onConfirm: (iso: string) => void;
  onClose: () => void;
  theme: any;
  yearRange?: { past: number; future: number };
}

export function DatePickerModal({ visible, initialValue, onConfirm, onClose, theme, yearRange = { past: 1, future: 3 } }: Props) {
  const { t } = useTranslation();
  const [year, setYear] = useState(0);
  const [monthIndex, setMonthIndex] = useState(0);
  const [day, setDay] = useState(1);

  useEffect(() => {
    if (!visible) return;
    const parsed = parseIso(initialValue);
    setYear(parsed.year);
    setMonthIndex(parsed.monthIndex);
    setDay(parsed.day);
  }, [visible, initialValue]);

  const maxDay = daysInMonth(year || new Date().getFullYear(), monthIndex);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);
  const nowYear = new Date().getFullYear();
  const years = Array.from({ length: yearRange.past + yearRange.future + 1 }, (_, i) => nowYear - yearRange.past + i);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>{t('Choisir une date')}</Text>
          <Text style={[styles.preview, { color: Colors.primary }]}>
            {day} {MONTHS_FR[monthIndex]} {year}
          </Text>
          <View style={styles.columns}>
            <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
              {days.map(v => (
                <TouchableOpacity key={v} style={[styles.item, v === day && { backgroundColor: Colors.primary + '22' }]} onPress={() => setDay(v)}>
                  <Text style={[styles.itemText, { color: v === day ? Colors.primary : theme.text }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView style={styles.columnWide} showsVerticalScrollIndicator={false}>
              {MONTHS_FR.map((label, i) => (
                <TouchableOpacity key={label} style={[styles.item, i === monthIndex && { backgroundColor: Colors.primary + '22' }]} onPress={() => {
                  setMonthIndex(i);
                  const max = daysInMonth(year, i);
                  if (day > max) setDay(max);
                }}>
                  <Text style={[styles.itemText, { color: i === monthIndex ? Colors.primary : theme.text }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ScrollView style={styles.column} showsVerticalScrollIndicator={false}>
              {years.map(v => (
                <TouchableOpacity key={v} style={[styles.item, v === year && { backgroundColor: Colors.primary + '22' }]} onPress={() => setYear(v)}>
                  <Text style={[styles.itemText, { color: v === year ? Colors.primary : theme.text }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.cancelBtn, { borderColor: theme.border }]} onPress={onClose}>
              <Text style={{ color: theme.textSecondary, fontWeight: '400', fontSize: 15 }}>{t('Annuler')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => { onConfirm(toIso(year, monthIndex, day)); onClose(); }}>
              <Text style={{ color: '#fff', fontWeight: '400', fontSize: 15 }}>{t('Valider')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  sheet: { width: 320, borderRadius: 12, padding: 20, alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '400', marginBottom: 6 },
  preview: { fontSize: 18, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  columns: { flexDirection: 'row', alignItems: 'flex-start', height: 180, marginBottom: 16, width: '100%' },
  column: { flex: 1, height: 180 },
  columnWide: { flex: 1.6, height: 180 },
  item: { paddingVertical: 8, alignItems: 'center', borderRadius: 6, marginVertical: 1 },
  itemText: { fontSize: 15 },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 7, paddingVertical: 10, alignItems: 'center' },
  confirmBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 7, paddingVertical: 10, alignItems: 'center' },
});
