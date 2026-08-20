// components/EditContentModal.tsx — Admin-only inline editor for tourist sites & events,
// used from the detail pages so admins don't have to go through the admin panel to fix a typo.

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, ScrollView,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { db } from '../lib/firebase';
import { Colors } from '../constants';
import { DatePickerModal } from './DatePickerModal';
import { formatEventDate, TBD_DATE } from '../lib/eventDate';
import { useTranslation, registerTranslations } from '../lib/LanguageContext';

registerTranslations({
  'Modifier': 'Edit',
  'Nom *': 'Name *',
  'Catégorie *': 'Category *',
  'Lieu *': 'Location *',
  'Date': 'Date',
  'Date de fin (optionnel)': 'End date (optional)',
  'Aucune': 'None',
  'Retirer la date de fin': 'Remove end date',
  'TBD': 'TBD',
  'À déterminer': 'TBD',
  'Téléphone': 'Phone',
  'Lien carte (Google Maps)': 'Map link (Google Maps)',
  'Page Facebook': 'Facebook page',
  'Site web': 'Website',
  'Image (URL)': 'Image (URL)',
  'Photos supplémentaires (URLs séparées par une virgule)': 'Additional photos (comma-separated URLs)',
  'Horaires': 'Opening hours',
  'Description': 'Description',
  'Annuler': 'Cancel',
  'Enregistrer': 'Save',
  'Le nom, la catégorie et le lieu sont requis.': 'Name, category, and location are required.',
  "Impossible d'enregistrer.": 'Could not save.',
});

export type EditableContentKind = 'events' | 'attractions';

export interface EditableContent {
  id: string;
  name: string;
  category: string;
  location: string;
  phone?: string;
  date?: string;
  endDate?: string;
  mapLink?: string;
  facebook?: string;
  website?: string;
  image?: string;
  photos?: string[];
  schedule?: string;
  description?: string;
}

const CONTENT_COLLECTION: Record<EditableContentKind, string> = {
  events: 'events',
  attractions: 'touristSites',
};

export function EditContentModal({ visible, kind, item, onClose, onSaved }: {
  visible: boolean;
  kind: EditableContentKind;
  item: EditableContent | null;
  onClose: () => void;
  onSaved: (updated: Partial<EditableContent>) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [phone, setPhone] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [facebook, setFacebook] = useState('');
  const [website, setWebsite] = useState('');
  const [image, setImage] = useState('');
  const [photos, setPhotos] = useState('');
  const [schedule, setSchedule] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const modalTheme = { card: '#fff', text: '#1A1A1A', textSecondary: '#8A8A8A', border: '#E5E7EB' };

  useEffect(() => {
    if (!item) return;
    setName(item.name || '');
    setCategory(item.category || '');
    setLocation(item.location || '');
    setDate(item.date || '');
    setEndDate(item.endDate || '');
    setPhone(item.phone || '');
    setMapLink(item.mapLink || '');
    setFacebook(item.facebook || '');
    setWebsite(item.website || '');
    setImage(item.image || '');
    setPhotos(item.photos?.join(', ') || '');
    setSchedule(item.schedule || '');
    setDescription(item.description || '');
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    if (!name.trim() || !category.trim() || !location.trim()) {
      Alert.alert('', t('Le nom, la catégorie et le lieu sont requis.'));
      return;
    }
    const payload: any = {
      name: name.trim(), category: category.trim(), location: location.trim(),
      description: description.trim(),
    };
    payload.phone = phone.trim() || null;
    payload.mapLink = mapLink.trim() || null;
    payload.facebook = facebook.trim() || null;
    payload.website = website.trim() || null;
    payload.image = image.trim() || null;
    if (kind === 'events') {
      payload.date = date.trim() || null;
      payload.endDate = endDate.trim() || null;
    }
    if (kind === 'attractions') {
      payload.photos = photos.trim() ? photos.split(',').map(u => u.trim()).filter(Boolean) : null;
      payload.schedule = schedule.trim() || null;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, CONTENT_COLLECTION[kind], item.id), payload);
      onSaved(payload);
      onClose();
    } catch (e: any) {
      Alert.alert('', e?.message || t("Impossible d'enregistrer."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.title}>{t('Modifier')}</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>{t('Nom *')}</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />

              <Text style={styles.label}>{t('Catégorie *')}</Text>
              <TextInput style={styles.input} value={category} onChangeText={setCategory} />

              <Text style={styles.label}>{t('Lieu *')}</Text>
              <TextInput style={styles.input} value={location} onChangeText={setLocation} />

              {kind === 'events' && (
                <>
                  <Text style={styles.label}>{t('Date')}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <TouchableOpacity style={[styles.input, styles.dateInput, { flex: 1 }]} onPress={() => setShowDatePicker(true)}>
                      <Text style={{ color: date ? '#1A1A1A' : '#8A8A8A', fontSize: 14 }}>
                        {date ? t(formatEventDate(date)) : t('Date')}
                      </Text>
                      <MaterialIcons name="event" size={18} color="#8A8A8A" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.clearDateBtn,
                        { paddingHorizontal: 10, width: undefined },
                        date === TBD_DATE ? { backgroundColor: Colors.headerGradient[0], borderColor: Colors.headerGradient[0] } : null,
                      ]}
                      onPress={() => setDate(prev => prev === TBD_DATE ? '' : TBD_DATE)}
                    >
                      <Text style={{ color: date === TBD_DATE ? '#fff' : '#8A8A8A', fontSize: 12, fontWeight: '400' }}>
                        {t('TBD')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.label}>{t('Date de fin (optionnel)')}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <TouchableOpacity style={[styles.input, styles.dateInput, { flex: 1 }]} onPress={() => setShowEndDatePicker(true)}>
                      <Text style={{ color: endDate ? '#1A1A1A' : '#8A8A8A', fontSize: 14 }}>
                        {endDate ? formatEventDate(endDate) : t('Aucune')}
                      </Text>
                      <MaterialIcons name="event" size={18} color="#8A8A8A" />
                    </TouchableOpacity>
                    {endDate ? (
                      <TouchableOpacity
                        style={styles.clearDateBtn}
                        onPress={() => setEndDate('')}
                        accessibilityLabel={t('Retirer la date de fin')}
                      >
                        <MaterialIcons name="close" size={18} color="#8A8A8A" />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </>
              )}

              <Text style={styles.label}>{t('Téléphone')}</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

              <Text style={styles.label}>{t('Lien carte (Google Maps)')}</Text>
              <TextInput style={styles.input} value={mapLink} onChangeText={setMapLink} autoCapitalize="none" keyboardType="url" />

              <Text style={styles.label}>{t('Page Facebook')}</Text>
              <TextInput style={styles.input} value={facebook} onChangeText={setFacebook} autoCapitalize="none" keyboardType="url" />

              <Text style={styles.label}>{t('Site web')}</Text>
              <TextInput style={styles.input} value={website} onChangeText={setWebsite} autoCapitalize="none" keyboardType="url" />

              <Text style={styles.label}>{t('Image (URL)')}</Text>
              <TextInput style={styles.input} value={image} onChangeText={setImage} autoCapitalize="none" />

              {kind === 'attractions' && (
                <>
                  <Text style={styles.label}>{t('Photos supplémentaires (URLs séparées par une virgule)')}</Text>
                  <TextInput style={[styles.input, styles.multiline]} value={photos} onChangeText={setPhotos} autoCapitalize="none" multiline />

                  <Text style={styles.label}>{t('Horaires')}</Text>
                  <TextInput style={[styles.input, styles.multiline]} value={schedule} onChangeText={setSchedule} multiline />
                </>
              )}

              <Text style={styles.label}>{t('Description')}</Text>
              <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} multiline />
            </ScrollView>

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={saving}>
                <Text style={styles.cancelText}>{t('Annuler')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveText}>{t('Enregistrer')}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    <DatePickerModal
      visible={showDatePicker}
      initialValue={date}
      onConfirm={setDate}
      onClose={() => setShowDatePicker(false)}
      theme={modalTheme}
    />
    <DatePickerModal
      visible={showEndDatePicker}
      initialValue={endDate || date}
      onConfirm={setEndDate}
      onClose={() => setShowEndDatePicker(false)}
      theme={modalTheme}
    />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '88%' },
  title: { fontSize: 18, fontWeight: '400', marginBottom: 12, color: '#1A1A1A' },
  label: { fontSize: 12, fontWeight: '400', marginBottom: 5, marginTop: 10, color: '#8A8A8A' },
  input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1A1A1A' },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clearDateBtn: { width: 40, height: 40, borderRadius: 7, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 7, paddingVertical: 13, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '400', color: '#5A5A5A' },
  saveBtn: { flex: 1, backgroundColor: Colors.headerGradient[0], borderRadius: 7, paddingVertical: 13, alignItems: 'center' },
  saveText: { fontSize: 15, fontWeight: '400', color: '#fff' },
});
