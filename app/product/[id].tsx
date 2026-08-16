// app/product/[id].tsx — Product Detail Screen

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, Share,
  StyleSheet, Linking, Alert, ActivityIndicator, FlatList, Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/AuthContext';
import { Product } from '../../types';
import { Colors, PRODUCT_CATEGORIES } from '../../constants';
import { useColorTheme } from '../../hooks/useColorTheme';
import { CategoryIcon } from '../../components/CategoryIcon';
import { ContentContainer } from '../../components/ContentContainer';
import { likeProduct, unlikeProduct, subscribeLikes } from '../../lib/likes';
import { useTranslation, registerTranslations } from '../../lib/LanguageContext';

registerTranslations({
  'Produit introuvable': 'Product not found',
  'Erreur': 'Error',
  "Impossible d'ouvrir.": 'Unable to open.',
  'Connexion requise': 'Login required',
  'Connectez-vous pour sauvegarder des favoris.': 'Log in to save favorites.',
  'Se connecter': 'Log in',
  'Annuler': 'Cancel',
  'Négociable': 'Negotiable',
  'À propos': 'About',
  'Contacter le vendeur': 'Contact the seller',
  'Vendeur': 'Seller',
  'Appeler': 'Call',
  'WhatsApp': 'WhatsApp',
  'Partager': 'Share',
  'Téléphone': 'Phone',
  'Ville': 'City',
  'Catégorie': 'Category',
  'Trouvé sur BurkinaBizz': 'Found on BurkinaBizz',
});

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useColorTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'products', id)).then(snap => {
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() } as Product);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    return subscribeLikes(user.uid, (ids) => setLiked(ids.has(id!)));
  }, [user, id]);

  const openPhone = () => product?.phone && Linking.openURL(`tel:${product.phone}`);

  const whatsappNumber = product?.whatsapp || product?.phone;

  const openWhatsApp = () => {
    if (!product || !whatsappNumber) return;
    const num = whatsappNumber.replace(/\D/g, '');
    const priceText = `${product.price.toLocaleString('fr-FR')} FCFA`;
    const message = product.negotiable
      ? `Bonjour, je suis intéressé(e) par "${product.name}" à ${priceText} sur BurkinaBizz 🇧🇫. Le prix est-il négociable?`
      : `Bonjour, je suis intéressé(e) par "${product.name}" à ${priceText} sur BurkinaBizz 🇧🇫.`;
    Linking.openURL(`https://wa.me/${num}?text=${encodeURIComponent(message)}`);
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `${product.name}\n${product.price.toLocaleString('fr-FR')} FCFA • ${product.city}\n\n${t('Trouvé sur BurkinaBizz')}`,
        title: product.name,
      });
    } catch {}
  };

  const handleLike = async () => {
    if (!user) {
      Alert.alert(t('Connexion requise'), t('Connectez-vous pour sauvegarder des favoris.'),
        [{ text: t('Se connecter'), onPress: () => router.push('/auth') }, { text: t('Annuler'), style: 'cancel' }]);
      return;
    }
    if (!product) return;
    setLikeLoading(true);
    try {
      if (liked) {
        await unlikeProduct(user.uid, product.id);
      } else {
        await likeProduct(user.uid, {
          id: product.id,
          name: product.name,
          imageUrl: photos[0] || '',
          price: product.price,
          city: product.city,
          category: product.category,
        });
      }
    } finally { setLikeLoading(false); }
  };

  if (loading) return (
    <LinearGradient
      colors={(theme.backgroundGradient || [theme.background, theme.background]) as [string, string, ...string[]]}
      style={styles.center}
    >
      <ActivityIndicator color={Colors.primary} size="large" />
    </LinearGradient>
  );

  if (!product) return (
    <LinearGradient
      colors={(theme.backgroundGradient || [theme.background, theme.background]) as [string, string, ...string[]]}
      style={styles.center}
    >
      <Text style={{ fontSize: 48 }}>😕</Text>
      <Text style={[styles.errorText, { color: theme.text }]}>{t('Produit introuvable')}</Text>
    </LinearGradient>
  );

  const cat = PRODUCT_CATEGORIES.find(c => c.label === product.category);
  const photos = product.photos?.length ? product.photos : product.imageUrl ? [product.imageUrl] : [];

  return (
    <>
      <Stack.Screen options={{ title: product.name, headerShown: true, headerBackVisible: true, headerBackTitle: '' }} />
      <LinearGradient
        colors={(theme.backgroundGradient || [theme.background, theme.background]) as [string, string, ...string[]]}
        style={{ flex: 1 }}
      >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* PHOTO GALLERY */}
        <View style={{ width: '100%', alignItems: 'center' }}>
          <View style={{ width: '100%', maxWidth: width, position: 'relative' }}>
            {photos.length > 0 ? (
              <View style={{ width: '100%', height: 280, position: 'relative' }}>
                <FlatList
                  data={photos}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(_, i) => String(i)}
                  onMomentumScrollEnd={e => setActivePhoto(Math.round(e.nativeEvent.contentOffset.x / width))}
                  renderItem={({ item }) => (
                    <Image source={{ uri: item }} style={[styles.photo, { width }]} resizeMode="cover" />
                  )}
                />
                {photos.length > 1 && (
                  <View style={styles.dotRow}>
                    {photos.map((_, i) => (
                      <View key={i} style={[styles.dot, { backgroundColor: i === activePhoto ? '#fff' : 'rgba(255,255,255,0.4)' }]} />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: (cat?.color || Colors.primary) + '22' }]}>
                {cat ? (
                  <CategoryIcon iconName={cat.icon} iconFamily={cat.iconFamily} size={72} color={cat.color} />
                ) : (
                  <Text style={{ fontSize: 64 }}>🛍️</Text>
                )}
              </View>
            )}
            <TouchableOpacity style={styles.shareImgBtn} onPress={handleShare} activeOpacity={0.8}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <ContentContainer maxWidth={width} style={styles.body}>
          {/* NAME + LIKE */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.text }]}>{product.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{product.price.toLocaleString('fr-FR')} FCFA</Text>
                {product.negotiable && (
                  <View style={styles.negoTag}>
                    <Text style={styles.negoTagText}>{t('Négociable')}</Text>
                  </View>
                )}
              </View>
              <View style={styles.metaRow}>
                {cat && (
                  <View style={[styles.catBadge, { backgroundColor: cat.color + '22' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <CategoryIcon iconName={cat.icon} iconFamily={cat.iconFamily} size={14} color={cat.color} />
                      <Text style={[styles.catBadgeText, { color: cat.color }]}>{product.category}</Text>
                    </View>
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="location" size={14} color={theme.textSecondary} />
                  <Text style={[styles.city, { color: theme.textSecondary }]}>{product.city}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.likeBtn, { backgroundColor: liked ? '#FFEBEE' : theme.surface, borderColor: theme.border }, styles.cardShadow]}
              onPress={handleLike} disabled={likeLoading}
              activeOpacity={0.8}
            >
              {likeLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name={liked ? "heart" : "heart-outline"} size={28} color={liked ? "#D32F2F" : theme.textSecondary} />
              )}
            </TouchableOpacity>
          </View>

          {/* DESCRIPTION */}
          {product.description ? (
            <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionIconBadge, { backgroundColor: Colors.primary + '22' }]}>
                  <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('À propos')}</Text>
              </View>
              <Text style={[styles.description, { color: theme.textSecondary }]}>{product.description}</Text>
            </View>
          ) : null}

          {/* CONTACT / BARGAIN */}
          <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconBadge, { backgroundColor: '#1096c3' + '22' }]}>
                <Ionicons name="call" size={16} color="#1096c3" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('Contacter le vendeur')}</Text>
            </View>
            {product.ownerName ? (
              <View style={styles.vendorRow}>
                <View style={[styles.vendorAvatar, { backgroundColor: Colors.primary + '22' }]}>
                  <Text style={[styles.vendorAvatarText, { color: Colors.primary }]}>{product.ownerName[0].toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={[styles.vendorLabel, { color: theme.textSecondary }]}>{t('Vendeur')}</Text>
                  <Text style={[styles.vendorName, { color: theme.text }]}>{product.ownerName}</Text>
                </View>
              </View>
            ) : null}
            <View style={styles.contactRow}>
              {product.phone && (
                <TouchableOpacity style={[styles.contactBtn, { backgroundColor: Colors.headerGradient[0] }]} onPress={openPhone}>
                  <Ionicons name="call" size={20} color="#fff" />
                  <Text style={styles.contactBtnText}>{t('Appeler')}</Text>
                </TouchableOpacity>
              )}
              {whatsappNumber && (
                <TouchableOpacity style={[styles.contactBtn, { backgroundColor: '#1B5E20' }]} onPress={openWhatsApp}>
                  <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                  <Text style={styles.contactBtnText}>{t('WhatsApp')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* INFO CARD */}
          <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {product.phone && <InfoRow iconName="call" label={t('Téléphone')} value={product.phone} theme={theme} />}
            {product.whatsapp && <InfoRow iconName="logo-whatsapp" label="WhatsApp" value={product.whatsapp} theme={theme} />}
            <InfoRow iconName="pricetag" label={t('Catégorie')} value={product.category} theme={theme} />
            <InfoRow iconName="location" label={t('Ville')} value={product.city} theme={theme} />
          </View>
        </ContentContainer>

        <View style={{ height: 40 }} />
      </ScrollView>
      </LinearGradient>
    </>
  );
}

function InfoRow({ iconName, label, value, theme }: { iconName: string; label: string; value: string; theme: any }) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={iconName as any} size={18} color={theme.textSecondary} />
      <Text style={[infoStyles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: theme.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  label: { fontSize: 13, width: 90 },
  value: { flex: 1, fontSize: 13, fontWeight: '400', textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 16, fontWeight: '400' },
  cardShadow: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  sectionCard: { borderRadius: 10, padding: 16, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionIconBadge: { width: 28, height: 28, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '400' },
  photo: { height: 280 },
  photoPlaceholder: { height: 220, alignItems: 'center', justifyContent: 'center' },
  dotRow: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  body: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  name: { fontSize: 22, fontWeight: '600', lineHeight: 28 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  price: { fontSize: 19, fontWeight: '600', color: Colors.primary },
  negoTag: { backgroundColor: '#E8F5E9', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  negoTagText: { fontSize: 11, fontWeight: '400', color: '#1B5E20' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  catBadge: { borderRadius: 5, paddingHorizontal: 10, paddingVertical: 4 },
  catBadgeText: { fontSize: 12, fontWeight: '400' },
  city: { fontSize: 13 },
  likeBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  description: { fontSize: 14, lineHeight: 22 },
  vendorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  vendorAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  vendorAvatarText: { fontSize: 15, fontWeight: '600' },
  vendorLabel: { fontSize: 11 },
  vendorName: { fontSize: 14, fontWeight: '400', marginTop: 1 },
  contactRow: { flexDirection: 'row', gap: 10 },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 7, gap: 6, minWidth: 0 },
  contactBtnText: { color: '#fff', fontSize: 14, fontWeight: '400', flexShrink: 1, textAlign: 'center' },
  shareImgBtn: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: 'rgba(0,0,0,0.45)', width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  infoCard: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, marginTop: 16 },
});
