// components/OpeningHoursEditor.tsx — per-day opening-hours input for the business edit/registration screens

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { OpeningHours, DayHours } from '../types';
import { DAY_ORDER, DAY_LABELS_FR, defaultOpeningHours } from '../lib/openingHours';
import { useTranslation, registerTranslations } from '../lib/LanguageContext';

registerTranslations({
  "🕒 Horaires d'ouverture": '🕒 Opening hours',
  'Fermé': 'Closed',
  'Copier à tous les jours': 'Copy to all days',
  'Choisir une heure': 'Choose a time',
  'Valider': 'Confirm',
  'Annuler': 'Cancel',
  'Copier ces horaires ?': 'Copy these hours?',
  'Ces horaires seront appliqués à tous les jours de la semaine.': 'These hours will be applied to every day of the week.',
  'Copier': 'Copy',
  'Je ne connais pas les horaires': "I don't know the hours",
  "Aucun horaire ne sera affiché sur la fiche de l'entreprise.": 'No hours will be shown on the business listing.',
});

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

// ── Time Picker Modal ────────────────────────────────────────────────────────
function TimePickerModal({ visible, initialValue, onConfirm, onClose, theme }: {
  visible: boolean; initialValue?: string; onConfirm: (v: string) => void; onClose: () => void; theme: any;
}) {
  const { t } = useTranslation();
  const [h, setH] = useState('08');
  const [m, setM] = useState('00');

  useEffect(() => {
    if (!visible) return;
    const [ih, im] = (initialValue || '08:00').split(':');
    setH(ih ?? '08');
    setM(im ?? '00');
  }, [visible, initialValue]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={tpStyles.overlay}>
        <View style={[tpStyles.sheet, { backgroundColor: theme.card }]}>
          <Text style={[tpStyles.title, { color: theme.text }]}>{t('Choisir une heure')}</Text>
          <Text style={[tpStyles.preview, { color: Colors.primary }]}>{h}:{m}</Text>
          <View style={tpStyles.columns}>
            <ScrollView style={tpStyles.column} showsVerticalScrollIndicator={false}>
              {HOURS.map(v => (
                <TouchableOpacity key={v} style={[tpStyles.item, v === h && { backgroundColor: Colors.primary + '22' }]} onPress={() => setH(v)}>
                  <Text style={[tpStyles.itemText, { color: v === h ? Colors.primary : theme.text }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[tpStyles.colon, { color: theme.text }]}>:</Text>
            <ScrollView style={tpStyles.column} showsVerticalScrollIndicator={false}>
              {MINUTES.map(v => (
                <TouchableOpacity key={v} style={[tpStyles.item, v === m && { backgroundColor: Colors.primary + '22' }]} onPress={() => setM(v)}>
                  <Text style={[tpStyles.itemText, { color: v === m ? Colors.primary : theme.text }]}>{v}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={tpStyles.btnRow}>
            <TouchableOpacity style={[tpStyles.cancelBtn, { borderColor: theme.border }]} onPress={onClose}>
              <Text style={{ color: theme.textSecondary, fontWeight: '400', fontSize: 15 }}>{t('Annuler')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tpStyles.confirmBtn} onPress={() => { onConfirm(`${h}:${m}`); onClose(); }}>
              <Text style={{ color: '#fff', fontWeight: '400', fontSize: 15 }}>{t('Valider')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  value: OpeningHours | null;
  onChange: (v: OpeningHours | null) => void;
  theme: any;
}

export function OpeningHoursEditor({ value, onChange, theme }: Props) {
  const { t } = useTranslation();
  const [picking, setPicking] = useState<{ day: keyof OpeningHours; field: 'open' | 'close' } | null>(null);

  const hoursUnknown = value === null;
  const hours = value ?? defaultOpeningHours();

  const setDay = (dayKey: keyof OpeningHours, next: DayHours) => {
    onChange({ ...hours, [dayKey]: next });
  };

  const handleCopyToAll = (dayKey: keyof OpeningHours) => {
    const source = hours[dayKey];
    Alert.alert(
      t('Copier ces horaires ?'),
      t('Ces horaires seront appliqués à tous les jours de la semaine.'),
      [
        { text: t('Annuler'), style: 'cancel' },
        {
          text: t('Copier'),
          onPress: () => {
            const next = { ...hours };
            DAY_ORDER.forEach(k => { next[k] = { ...source }; });
            onChange(next);
          },
        },
      ]
    );
  };

  return (
    <View>
      <View style={[styles.unknownRow, { borderColor: theme.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.unknownLabel, { color: theme.text }]}>{t('Je ne connais pas les horaires')}</Text>
          <Text style={[styles.unknownSub, { color: theme.textSecondary }]}>
            {t("Aucun horaire ne sera affiché sur la fiche de l'entreprise.")}
          </Text>
        </View>
        <Switch
          value={hoursUnknown}
          onValueChange={(v) => onChange(v ? null : defaultOpeningHours())}
          trackColor={{ false: '#CBD5E1', true: '#EF9A9A' }}
          thumbColor={hoursUnknown ? '#C62828' : '#f4f3f4'}
        />
      </View>

      {!hoursUnknown && DAY_ORDER.map(dayKey => {
        const day = hours[dayKey];
        return (
          <View key={dayKey} style={[styles.dayRow, { borderColor: theme.border }]}>
            <View style={styles.dayHeader}>
              <Text style={[styles.dayLabel, { color: theme.text }]}>{DAY_LABELS_FR[dayKey]}</Text>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => handleCopyToAll(dayKey)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="copy-outline" size={14} color={Colors.primary} />
                <Text style={[styles.copyBtnText, { color: Colors.primary }]}>{t('Copier à tous les jours')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dayControlsRow}>
              <View style={styles.closedToggle}>
                <Text style={[styles.closedLabel, { color: theme.textSecondary }]}>{t('Fermé')}</Text>
                <Switch
                  value={day.closed}
                  onValueChange={(v) => setDay(dayKey, v
                    ? { ...day, closed: true }
                    : { open: day.open || '08:00', close: day.close || '18:00', closed: false })}
                  trackColor={{ false: '#CBD5E1', true: '#EF9A9A' }}
                  thumbColor={day.closed ? '#C62828' : '#f4f3f4'}
                />
              </View>

              {!day.closed && (
                <View style={styles.timeRow}>
                  <TouchableOpacity style={[styles.timeBtn, { borderColor: '#9CA3AF' }]} onPress={() => setPicking({ day: dayKey, field: 'open' })}>
                    <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                    <Text style={[styles.timeBtnText, { color: theme.text }]}>{day.open || '--:--'}</Text>
                  </TouchableOpacity>
                  <Text style={{ color: theme.textSecondary }}>→</Text>
                  <TouchableOpacity style={[styles.timeBtn, { borderColor: '#9CA3AF' }]} onPress={() => setPicking({ day: dayKey, field: 'close' })}>
                    <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
                    <Text style={[styles.timeBtnText, { color: theme.text }]}>{day.close || '--:--'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        );
      })}

      <TimePickerModal
        visible={!!picking}
        initialValue={picking ? hours[picking.day][picking.field] : undefined}
        onConfirm={(v) => {
          if (!picking) return;
          setDay(picking.day, { ...hours[picking.day], [picking.field]: v, closed: false });
        }}
        onClose={() => setPicking(null)}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  unknownRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 14, marginBottom: 4, borderBottomWidth: 1 },
  unknownLabel: { fontSize: 14, fontWeight: '400' },
  unknownSub: { fontSize: 11, marginTop: 2, lineHeight: 15 },
  dayRow: { borderBottomWidth: 1, paddingVertical: 10 },
  dayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 4 },
  dayLabel: { fontSize: 14, fontWeight: '400' },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copyBtnText: { fontSize: 11, fontWeight: '400' },
  dayControlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 },
  closedToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  closedLabel: { fontSize: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 7 },
  timeBtnText: { fontSize: 13, fontWeight: '400' },
});

const tpStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  sheet: { width: 280, borderRadius: 12, padding: 20, alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '400', marginBottom: 6 },
  preview: { fontSize: 28, fontWeight: '600', marginBottom: 12 },
  columns: { flexDirection: 'row', alignItems: 'center', height: 180, marginBottom: 16 },
  column: { width: 64 },
  colon: { fontSize: 18, fontWeight: '400', marginHorizontal: 6 },
  item: { paddingVertical: 8, alignItems: 'center', borderRadius: 6, marginVertical: 1 },
  itemText: { fontSize: 16 },
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 7, paddingVertical: 10, alignItems: 'center' },
  confirmBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 7, paddingVertical: 10, alignItems: 'center' },
});
