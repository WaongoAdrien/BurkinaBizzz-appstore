// app/vendor/add-product.tsx — Vendor product submission form (goes to admin approval queue)

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Image, StyleSheet,
  Alert, ActivityIndicator, Keyboard, Switch,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { containsProfanity } from '../../lib/profanityFilter';
import { useAuth } from '../../lib/AuthContext';
import { Colors, PRODUCT_CATEGORIES, CITIES } from '../../constants';
import { useColorTheme } from '../../hooks/useColorTheme';
import { ProductCategory, City } from '../../types';
import { useTranslation, registerTranslations } from '../../lib/LanguageContext';

registerTranslations({
  'optionnel': 'optional',
  'Annuler': 'Cancel',
  'Vendre un produit': 'Sell a product',
  '📋 Informations générales': '📋 General information',
  'Nom du produit *': 'Product name *',
  'Ex: iPhone 12 Pro Max 256Go': 'Ex: iPhone 12 Pro Max 256GB',
  'Catégorie *': 'Category *',
  'Ville *': 'City *',
  'Description *': 'Description *',
  "Décrivez l'état, les caractéristiques...": 'Describe the condition, features...',
  '💰 Prix': '💰 Price',
  'Prix (FCFA) *': 'Price (FCFA) *',
  'Ex: 150000': 'Ex: 150000',
  'Prix négociable': 'Negotiable price',
  "Les acheteurs pourront négocier le prix sur WhatsApp": 'Buyers will be able to negotiate the price on WhatsApp',
  '📞 Contact': '📞 Contact',
  'Téléphone *': 'Phone *',
  'WhatsApp': 'WhatsApp',
  '+22670000000 (si différent)': '+22670000000 (if different)',
  '📷 Photos': '📷 Photos',
  "Jusqu'à 5 photos. La première = couverture.": 'Up to 5 photos. The first one = cover.',
  'Ajouter des photos': 'Add photos',
  '📷 Prendre une photo': '📷 Take a photo',
  '🖼️ Choisir depuis la galerie': '🖼️ Choose from gallery',
  'Maximum atteint': 'Maximum reached',
  'Maximum 5 photos.': 'Maximum 5 photos.',
  'Couverture': 'Cover',
  'Ajouter': 'Add',
  'Nom requis': 'Name required',
  'Langage inapproprié / Inappropriate language': 'Inappropriate language',
  'Catégorie requise': 'Category required',
  'Description requise': 'Description required',
  'Prix valide requis': 'Valid price required',
  'Numéro valide requis': 'Valid phone number required',
  'Upload:': 'Upload:',
  'Envoi...': 'Submitting...',
  '📤 Soumettre pour approbation': '📤 Submit for approval',
  'Erreur': 'Error',
  "Impossible d'envoyer. Vérifiez votre connexion.": 'Unable to submit. Check your connection.',
  '✅ Produit soumis!': '✅ Product submitted!',
  'Votre annonce sera examinée sous 24–48h avant de paraître dans le marché.': 'Your listing will be reviewed within 24–48h before appearing in the marketplace.',
  'OK': 'OK',
  'Catégorie': 'Category',
  'Ville': 'City',
});

// ── Shared components (outside to avoid focus-loss bug) ───────────────────────
interface FieldProps {
  label: string; value: string; onChangeText: (t: string) => void;
  placeholder: string; keyboardType?: any; multiline?: boolean;
  maxLength?: number; error?: string; optional?: boolean;
  borderColor: string; surfaceColor: string; textColor: string; secondaryColor: string;
}
function Field({ label, value, onChangeText, placeholder, keyboardType = 'default',
  multiline = false, maxLength, error, optional, borderColor, surfaceColor, textColor, secondaryColor }: FieldProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.fieldWrapper}>
      <View style={styles.labelRow}>
        <Text style={[styles.fieldLabel, { color: textColor }]}>{label}</Text>
        {optional && <Text style={[styles.optionalTag, { color: secondaryColor }]}>{t('optionnel')}</Text>}
      </View>
      <TextInput
        style={[styles.input, multiline && styles.textArea,
          { borderColor: error ? '#D32F2F' : borderColor, backgroundColor: surfaceColor, color: textColor }]}
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor={secondaryColor} keyboardType={keyboardType}
        multiline={multiline} numberOfLines={multiline ? 4 : 1}
        maxLength={maxLength} autoCorrect={false} autoCapitalize="none"
      />
      {error ? <Text style={styles.errorText}>{t(error)}</Text> : null}
    </View>
  );
}

interface PickerModalProps {
  visible: boolean; title: string; items: string[]; selected: string;
  onSelect: (v: string) => void; onClose: () => void;
  cardColor: string; textColor: string; secondaryColor: string;
}
function PickerModal({ visible, title, items, selected, onSelect, onClose, cardColor, textColor, secondaryColor }: PickerModalProps) {
  const { t } = useTranslation();
  if (!visible) return null;
  return (
    <View style={styles.pickerOverlay}>
      <View style={[styles.pickerSheet, { backgroundColor: cardColor }]}>
        <Text style={[styles.pickerTitle, { color: textColor }]}>{title}</Text>
        {items.map(item => (
          <TouchableOpacity key={item}
            style={[styles.pickerItem, selected === item && { backgroundColor: Colors.primary + '22' }]}
            onPress={() => { onSelect(item); onClose(); }}>
            <Text style={[styles.pickerItemText, { color: selected === item ? Colors.primary : textColor },
              selected === item && { fontWeight: '400' }]}>{t(item)}</Text>
            {selected === item && <Text style={{ color: Colors.primary }}>✓</Text>}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.pickerClose} onPress={onClose}>
          <Text style={[styles.pickerCloseText, { color: secondaryColor }]}>{t('Annuler')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const MAX_PHOTOS = 5;

export default function AddProductScreen() {
  const router = useRouter();
  const { user, userProfile, isPending } = useAuth();
  const { theme } = useColorTheme();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [city, setCity] = useState<City>('Ouagadougou');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [photoUris, setPhotoUris] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fp = { borderColor: '#9CA3AF', surfaceColor: '#FFFFFF', textColor: theme.text, secondaryColor: theme.textSecondary };

  React.useEffect(() => {
    if (!user) { router.replace('/auth'); return; }
    if (isPending) { router.replace('/vendor/pending'); return; }
  }, [user, isPending]);

  const pickPhotos = async () => {
    if (photoUris.length >= MAX_PHOTOS) {
      Alert.alert(t('Maximum atteint'), t(`Maximum ${MAX_PHOTOS} photos.`));
      return;
    }
    Alert.alert(t('Ajouter des photos'), '', [
      { text: t('📷 Prendre une photo'), onPress: takePhoto },
      { text: t('🖼️ Choisir depuis la galerie'), onPress: pickFromGallery },
      { text: t('Annuler'), style: 'cancel' },
    ]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.75 });
    if (!result.canceled && result.assets[0])
      setPhotoUris(prev => [...prev, result.assets[0].uri].slice(0, MAX_PHOTOS));
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - photoUris.length,
      quality: 0.75,
    });
    if (!result.canceled)
      setPhotoUris(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, MAX_PHOTOS));
  };

  const removePhoto = (index: number) => setPhotoUris(prev => prev.filter((_, i) => i !== index));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nom requis';
    else if (containsProfanity(name)) e.name = 'Langage inapproprié / Inappropriate language';
    if (!category) e.category = 'Catégorie requise';
    if (!description.trim()) e.description = 'Description requise';
    else if (containsProfanity(description)) e.description = 'Langage inapproprié / Inappropriate language';
    const priceNum = parseInt(price.replace(/\D/g, ''), 10);
    if (!price.trim() || isNaN(priceNum) || priceNum <= 0) e.price = 'Prix valide requis';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) e.phone = 'Numéro valide requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const uploadPhoto = async (uri: string, index: number): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `products/${user!.uid}/${Date.now()}_${index}.jpg`);
    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, blob);
      task.on('state_changed',
        snap => {
          const base = (index / photoUris.length) * 100;
          const chunk = (snap.bytesTransferred / snap.totalBytes) * (100 / photoUris.length);
          setUploadProgress(Math.round(base + chunk));
        },
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref))
      );
    });
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setLoading(true);
    setUploadProgress(0);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < photoUris.length; i++) {
        try { uploadedUrls.push(await uploadPhoto(photoUris[i], i)); } catch {}
      }

      await addDoc(collection(db, 'products'), {
        name: name.trim(),
        category,
        city,
        description: description.trim(),
        price: parseInt(price.replace(/\D/g, ''), 10),
        negotiable,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || null,
        photos: uploadedUrls,
        imageUrl: uploadedUrls[0] || '',
        ownerId: user.uid,
        ownerName: userProfile?.name || user.email || '',
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      Alert.alert(t('✅ Produit soumis!'), t('Votre annonce sera examinée sous 24–48h avant de paraître dans le marché.'),
        [{ text: t('OK'), onPress: () => router.replace('/vendor/dashboard') }]);
    } catch (e: any) {
      Alert.alert(t('Erreur'), t("Impossible d'envoyer. Vérifiez votre connexion."));
    } finally { setLoading(false); }
  };

  if (!user) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient
        colors={(theme.backgroundGradient || [theme.background, theme.background]) as [string, string, ...string[]]}
        style={{ flex: 1 }}
      >
      <Stack.Screen options={{ title: t('Vendre un produit'), headerBackVisible: true }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.formSection, { color: Colors.primary }]}>{t('📋 Informations générales')}</Text>
          <Field label={t('Nom du produit *')} value={name} onChangeText={setName}
            placeholder={t('Ex: iPhone 12 Pro Max 256Go')} maxLength={80} error={errors.name} {...fp} />

          <View style={styles.fieldWrapper}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>{t('Catégorie *')}</Text>
            <TouchableOpacity style={[styles.selector, { borderColor: errors.category ? '#D32F2F' : '#9CA3AF', backgroundColor: '#FFFFFF' }]}
              onPress={() => { Keyboard.dismiss(); setShowCategoryPicker(true); }}>
              <Text style={{ color: category ? theme.text : theme.textSecondary, fontSize: 15 }}>{category ? t(category) : t('Catégorie *')}</Text>
              <Text style={{ color: theme.textSecondary }}>▾</Text>
            </TouchableOpacity>
            {errors.category && <Text style={styles.errorText}>{t(errors.category)}</Text>}
          </View>

          <View style={styles.fieldWrapper}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>{t('Ville *')}</Text>
            <TouchableOpacity style={[styles.selector, { borderColor: '#9CA3AF', backgroundColor: '#FFFFFF' }]}
              onPress={() => { Keyboard.dismiss(); setShowCityPicker(true); }}>
              <Text style={{ color: theme.text, fontSize: 15 }}>📍 {city}</Text>
              <Text style={{ color: theme.textSecondary }}>▾</Text>
            </TouchableOpacity>
          </View>

          <Field label={t('Description *')} value={description} onChangeText={setDescription}
            placeholder={t("Décrivez l'état, les caractéristiques...")} multiline maxLength={600} error={errors.description} {...fp} />
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.formSection, { color: Colors.primary }]}>{t('💰 Prix')}</Text>
          <Field label={t('Prix (FCFA) *')} value={price} onChangeText={setPrice}
            placeholder={t('Ex: 150000')} keyboardType="number-pad" error={errors.price} {...fp} />
          <View style={styles.negoRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>{t('Prix négociable')}</Text>
              <Text style={[styles.hint, { color: theme.textSecondary, marginBottom: 0 }]}>{t('Les acheteurs pourront négocier le prix sur WhatsApp')}</Text>
            </View>
            <Switch
              value={negotiable}
              onValueChange={setNegotiable}
              trackColor={{ false: '#CBD5E1', true: Colors.primary + '88' }}
              thumbColor={negotiable ? Colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.formSection, { color: Colors.primary }]}>{t('📞 Contact')}</Text>
          <Field label={t('Téléphone *')} value={phone} onChangeText={setPhone}
            placeholder="+22670000000" keyboardType="phone-pad" error={errors.phone} {...fp} />
          <Field label={t('WhatsApp')} value={whatsapp} onChangeText={setWhatsapp}
            placeholder={t('+22670000000 (si différent)')} keyboardType="phone-pad" optional {...fp} />
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.formSection, { color: Colors.primary }]}>{t('📷 Photos')} ({photoUris.length}/{MAX_PHOTOS})</Text>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>{t("Jusqu'à 5 photos. La première = couverture.")}</Text>
          <View style={styles.photoGrid}>
            {photoUris.map((uri, i) => (
              <View key={i} style={styles.photoThumbBox}>
                <Image source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                {i === 0 && (
                  <View style={styles.coverBadge}><Text style={styles.coverBadgeText}>{t('Couverture')}</Text></View>
                )}
                <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(i)}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '400' }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {photoUris.length < MAX_PHOTOS && (
              <TouchableOpacity style={[styles.addPhotoBtn, { borderColor: Colors.primary }]} onPress={pickPhotos}>
                <Text style={{ fontSize: 28 }}>📷</Text>
                <Text style={[styles.addPhotoText, { color: Colors.primary }]}>{t('Ajouter')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading && uploadProgress > 0 && uploadProgress < 100 && (
          <View style={styles.progressBox}>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>{t('Upload:')} {uploadProgress}%</Text>
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` as any }]} />
            </View>
          </View>
        )}

        <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <ActivityIndicator color="#1A1A1A" />
                <Text style={styles.saveBtnText}>{t('Envoi...')}</Text>
              </View>
            : <Text style={styles.saveBtnText}>{t('📤 Soumettre pour approbation')}</Text>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <PickerModal visible={showCategoryPicker} title={t('Catégorie')} items={PRODUCT_CATEGORIES.map(c => c.label)}
        selected={category} onSelect={v => { setCategory(v as ProductCategory); setErrors(e => ({ ...e, category: '' })); }} onClose={() => setShowCategoryPicker(false)}
        cardColor={theme.card} textColor={theme.text} secondaryColor={theme.textSecondary} />
      <PickerModal visible={showCityPicker} title={t('Ville')} items={CITIES}
        selected={city} onSelect={v => setCity(v as City)} onClose={() => setShowCityPicker(false)}
        cardColor={theme.card} textColor={theme.text} secondaryColor={theme.textSecondary} />
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const THUMB = 96;
const styles = StyleSheet.create({
  content: { padding: 16 },
  formCard: { borderRadius: 10, padding: 16, borderWidth: 1, marginBottom: 14, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  formSection: { fontSize: 15, fontWeight: '400', marginBottom: 14 },
  fieldWrapper: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '400' },
  optionalTag: { fontSize: 11, fontStyle: 'italic' },
  input: { borderWidth: 2, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  textArea: { textAlignVertical: 'top', minHeight: 90 },
  errorText: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
  selector: { borderWidth: 2, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hint: { fontSize: 12, marginBottom: 12, lineHeight: 18 },
  negoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoThumbBox: { width: THUMB, height: THUMB, borderRadius: 6, overflow: 'hidden', position: 'relative' },
  photoThumb: { width: '100%', height: '100%' },
  coverBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(46,125,50,0.85)', padding: 3, alignItems: 'center' },
  coverBadgeText: { color: '#fff', fontSize: 9, fontWeight: '400' },
  removeBtn: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addPhotoBtn: { width: THUMB, height: THUMB, borderRadius: 6, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addPhotoText: { fontSize: 11, fontWeight: '400' },
  progressBox: { marginBottom: 14 },
  progressText: { fontSize: 12, marginBottom: 6 },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  saveBtn: { backgroundColor: Colors.cta, paddingVertical: 16, borderRadius: 8, alignItems: 'center', elevation: 3, shadowColor: Colors.cta, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  saveBtnText: { fontSize: 17, fontWeight: '400', color: '#1A1A1A' },
  pickerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 999 },
  pickerSheet: { borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 20, paddingBottom: 32, maxHeight: '80%' },
  pickerTitle: { fontSize: 17, fontWeight: '400', marginBottom: 14 },
  pickerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 12, borderRadius: 6, marginBottom: 4 },
  pickerItemText: { fontSize: 15 },
  pickerClose: { marginTop: 8, padding: 14, alignItems: 'center' },
  pickerCloseText: { fontSize: 15, fontWeight: '400' },
});
