// app/vendor/edit-product.tsx — Vendor/admin product edit form

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Image, StyleSheet,
  Alert, ActivityIndicator, Keyboard, Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { containsProfanity } from '../../lib/profanityFilter';
import { useAuth } from '../../lib/AuthContext';
import { Colors, PRODUCT_CATEGORIES, CITIES } from '../../constants';
import { useColorTheme } from '../../hooks/useColorTheme';
import { ProductCategory, City, StockStatus } from '../../types';
import { useTranslation, registerTranslations } from '../../lib/LanguageContext';

registerTranslations({
  'optionnel': 'optional',
  'Annuler': 'Cancel',
  'Erreur': 'Error',
  'Produit introuvable.': 'Product not found.',
  'Accès refusé': 'Access denied',
  'Vous ne pouvez modifier que vos propres produits.': 'You can only edit your own products.',
  "Modifier le produit": 'Edit product',
  '📋 Informations générales': '📋 General information',
  'Nom du produit *': 'Product name *',
  'Ex: iPhone 12 Pro Max 256Go': 'Ex: iPhone 12 Pro Max 256GB',
  'Catégorie *': 'Category *',
  'Ville *': 'City *',
  'Description *': 'Description *',
  "Décrivez l'état, les caractéristiques...": 'Describe the condition, features...',
  '💰 Prix': '💰 Price',
  '📦 Stock': '📦 Stock',
  'En stock': 'In stock',
  'Rupture de stock': 'Out of stock',
  'Vendu': 'Sold',
  'Quantité en stock': 'Quantity in stock',
  'Ex: 5 (optionnel)': 'Ex: 5 (optional)',
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
  'Appuyez sur une photo existante pour la supprimer.': 'Tap an existing photo to delete it.',
  'Ajouter des photos': 'Add photos',
  '📷 Prendre une photo': '📷 Take a photo',
  '🖼️ Choisir depuis la galerie': '🖼️ Choose from gallery',
  'Maximum atteint': 'Maximum reached',
  'Maximum 5 photos.': 'Maximum 5 photos.',
  'Supprimer cette photo?': 'Delete this photo?',
  'Supprimer': 'Delete',
  'Couverture': 'Cover',
  'Nouveau': 'New',
  'Ajouter': 'Add',
  'Nom requis': 'Name required',
  'Langage inapproprié / Inappropriate language': 'Inappropriate language',
  'Catégorie requise': 'Category required',
  'Description requise': 'Description required',
  'Prix valide requis': 'Valid price required',
  'Numéro valide requis': 'Valid phone number required',
  'Upload:': 'Upload:',
  'Sauvegarde...': 'Saving...',
  '💾  Sauvegarder les modifications': '💾  Save changes',
  '✅ Mise à jour réussie!': '✅ Update successful!',
  'Les informations ont été enregistrées.': 'The information has been saved.',
  'OK': 'OK',
  "Impossible de sauvegarder. Vérifiez votre connexion.": 'Unable to save. Check your connection.',
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
const STOCK_OPTIONS: { value: StockStatus; label: string; color: string }[] = [
  { value: 'in_stock', label: 'En stock', color: '#2E7D32' },
  { value: 'out_of_stock', label: 'Rupture de stock', color: '#D32F2F' },
  { value: 'sold', label: 'Vendu', color: '#6B7280' },
];

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const { theme } = useColorTheme();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory | ''>('');
  const [city, setCity] = useState<City>('Ouagadougou');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [negotiable, setNegotiable] = useState(false);
  const [stockStatus, setStockStatus] = useState<StockStatus>('in_stock');
  const [stockQuantity, setStockQuantity] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotoUris, setNewPhotoUris] = useState<string[]>([]);

  const [fetchLoading, setFetchLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fp = { borderColor: '#9CA3AF', surfaceColor: '#FFFFFF', textColor: theme.text, secondaryColor: theme.textSecondary };
  const totalPhotos = existingPhotos.length + newPhotoUris.length;

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'products', id)).then(snap => {
      if (!snap.exists()) { Alert.alert(t('Erreur'), t('Produit introuvable.')); router.back(); return; }
      const d = snap.data();
      if (d.ownerId !== user?.uid && !isAdmin) {
        Alert.alert(t('Accès refusé'), t('Vous ne pouvez modifier que vos propres produits.'));
        router.back();
        return;
      }
      setName(d.name || '');
      setCategory(d.category || '');
      setCity(d.city || 'Ouagadougou');
      setDescription(d.description || '');
      setPrice(d.price ? String(d.price) : '');
      setNegotiable(!!d.negotiable);
      setStockStatus(d.stockStatus || 'in_stock');
      setStockQuantity(typeof d.stockQuantity === 'number' ? String(d.stockQuantity) : '');
      setPhone(d.phone || '');
      setWhatsapp(d.whatsapp || '');
      setExistingPhotos(d.photos || (d.imageUrl ? [d.imageUrl] : []));
    }).finally(() => setFetchLoading(false));
  }, [id]);

  const pickPhotos = async () => {
    if (totalPhotos >= MAX_PHOTOS) {
      Alert.alert(t('Maximum atteint'), t(`Maximum ${MAX_PHOTOS} photos.`)); return;
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
      setNewPhotoUris(prev => [...prev, result.assets[0].uri].slice(0, MAX_PHOTOS - existingPhotos.length));
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsMultipleSelection: true,
      selectionLimit: MAX_PHOTOS - totalPhotos,
      quality: 0.75,
    });
    if (!result.canceled)
      setNewPhotoUris(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, MAX_PHOTOS - existingPhotos.length));
  };

  const removeExisting = (index: number) => {
    Alert.alert(t('Supprimer cette photo?'), '', [
      { text: t('Annuler'), style: 'cancel' },
      { text: t('Supprimer'), style: 'destructive', onPress: () => setExistingPhotos(prev => prev.filter((_, i) => i !== index)) },
    ]);
  };

  const removeNew = (index: number) => setNewPhotoUris(prev => prev.filter((_, i) => i !== index));

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
          const base = (index / newPhotoUris.length) * 100;
          const chunk = (snap.bytesTransferred / snap.totalBytes) * (100 / newPhotoUris.length);
          setUploadProgress(Math.round(base + chunk));
        },
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref))
      );
    });
  };

  const handleSave = async () => {
    if (!validate() || !id) return;
    setLoading(true);
    setUploadProgress(0);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < newPhotoUris.length; i++) {
        try { newUrls.push(await uploadPhoto(newPhotoUris[i], i)); } catch {}
      }
      const allPhotos = [...existingPhotos, ...newUrls];

      await updateDoc(doc(db, 'products', id), {
        name: name.trim(),
        category,
        city,
        description: description.trim(),
        price: parseInt(price.replace(/\D/g, ''), 10),
        negotiable,
        stockStatus,
        stockQuantity: stockStatus === 'in_stock' && stockQuantity.trim() ? parseInt(stockQuantity.replace(/\D/g, ''), 10) : null,
        phone: phone.trim(),
        whatsapp: whatsapp.trim() || null,
        photos: allPhotos,
        imageUrl: allPhotos[0] || '',
      });

      Alert.alert(t('✅ Mise à jour réussie!'), t('Les informations ont été enregistrées.'),
        [{ text: t('OK'), onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert(t('Erreur'), t("Impossible de sauvegarder. Vérifiez votre connexion."));
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return (
    <LinearGradient
      colors={(theme.backgroundGradient || [theme.background, theme.background]) as [string, string, ...string[]]}
      style={styles.loadingBox}
    >
      <ActivityIndicator color={Colors.primary} size="large" />
    </LinearGradient>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient
        colors={(theme.backgroundGradient || [theme.background, theme.background]) as [string, string, ...string[]]}
        style={{ flex: 1 }}
      >
      <Stack.Screen options={{ title: t('Modifier le produit'), headerBackVisible: true }} />
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
          <Text style={[styles.formSection, { color: Colors.primary }]}>{t('📦 Stock')}</Text>
          <View style={styles.stockRow}>
            {STOCK_OPTIONS.map(opt => {
              const active = stockStatus === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.stockChip, { borderColor: opt.color, backgroundColor: active ? opt.color : '#fff' }]}
                  onPress={() => setStockStatus(opt.value)}
                >
                  <Text style={{ color: active ? '#fff' : opt.color, fontSize: 13, fontWeight: '400' }}>{t(opt.label)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {stockStatus === 'in_stock' && (
            <Field label={t('Quantité en stock')} value={stockQuantity} onChangeText={setStockQuantity}
              placeholder={t('Ex: 5 (optionnel)')} keyboardType="number-pad" optional {...fp} />
          )}
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.formSection, { color: Colors.primary }]}>{t('📞 Contact')}</Text>
          <Field label={t('Téléphone *')} value={phone} onChangeText={setPhone}
            placeholder="+22670000000" keyboardType="phone-pad" error={errors.phone} {...fp} />
          <Field label={t('WhatsApp')} value={whatsapp} onChangeText={setWhatsapp}
            placeholder={t('+22670000000 (si différent)')} keyboardType="phone-pad" optional {...fp} />
        </View>

        <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.formSection, { color: Colors.primary }]}>{t('📷 Photos')} ({totalPhotos}/{MAX_PHOTOS})</Text>
          <Text style={[styles.hint, { color: theme.textSecondary }]}>{t('Appuyez sur une photo existante pour la supprimer.')}</Text>
          <View style={styles.photoGrid}>
            {existingPhotos.map((uri, i) => (
              <TouchableOpacity key={`e-${i}`} style={styles.photoThumbBox} onPress={() => removeExisting(i)}>
                <Image source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                {i === 0 && (
                  <View style={styles.coverBadge}><Text style={styles.coverBadgeText}>{t('Couverture')}</Text></View>
                )}
                <View style={styles.removeBtn}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '400' }}>✕</Text>
                </View>
              </TouchableOpacity>
            ))}
            {newPhotoUris.map((uri, i) => (
              <View key={`n-${i}`} style={styles.photoThumbBox}>
                <Image source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                <View style={styles.newBadge}><Text style={styles.newBadgeText}>{t('Nouveau')}</Text></View>
                <TouchableOpacity style={styles.removeBtn} onPress={() => removeNew(i)}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: '400' }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {totalPhotos < MAX_PHOTOS && (
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

        <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.6 }]} onPress={handleSave} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <ActivityIndicator color="#1A1A1A" />
                <Text style={styles.saveBtnText}>{t('Sauvegarde...')}</Text>
              </View>
            : <Text style={styles.saveBtnText}>{t('💾  Sauvegarder les modifications')}</Text>
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
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  stockRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  stockChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 7, borderWidth: 1.5 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoThumbBox: { width: THUMB, height: THUMB, borderRadius: 6, overflow: 'hidden', position: 'relative' },
  photoThumb: { width: '100%', height: '100%' },
  coverBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(46,125,50,0.85)', padding: 3, alignItems: 'center' },
  coverBadgeText: { color: '#fff', fontSize: 9, fontWeight: '400' },
  newBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(25,118,210,0.85)', padding: 3, alignItems: 'center' },
  newBadgeText: { color: '#fff', fontSize: 9, fontWeight: '400' },
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
