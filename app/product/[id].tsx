// app/product/[id].tsx — Product Detail Screen

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, Share,
  StyleSheet, Linking, Alert, ActivityIndicator, FlatList, Dimensions, Modal, StatusBar,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  doc, getDoc, collection, query, orderBy,
  onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { containsProfanity } from '../../lib/profanityFilter';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/AuthContext';
import { Product } from '../../types';
import { getStockBadge } from '../../lib/productStock';
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
  'En stock': 'In stock',
  'Rupture de stock': 'Out of stock',
  'Vendu': 'Sold',
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
  'Utilisateur': 'User',
  'Note requise': 'Rating required',
  'Veuillez sélectionner une note.': 'Please select a rating.',
  '⚠️ Langage inapproprié': '⚠️ Inappropriate language',
  'Votre avis contient des mots inappropriés. Merci de reformuler poliment et de le soumettre à nouveau.':
    'Your review contains inappropriate language. Please rephrase politely and resubmit.',
  '✅ Avis modifié!': '✅ Review updated!',
  'Votre avis a été mis à jour.': 'Your review has been updated.',
  '✅ Avis publié!': '✅ Review posted!',
  'Merci pour votre retour.': 'Thank you for your feedback.',
  "Impossible de publier l'avis.": 'Unable to post the review.',
  'Supprimer votre avis?': 'Delete your review?',
  'Supprimer': 'Delete',
  'Impossible de supprimer.': 'Unable to delete.',
  'Avis sur le vendeur': 'Seller reviews',
  'avis': 'reviews',
  'Modifier mon avis': 'Edit my review',
  'Laisser un avis': 'Write a review',
  'Aucun avis pour le moment. Soyez le premier!': 'No reviews yet. Be the first!',
  'Note *': 'Rating *',
  'Commentaire (optionnel)': 'Comment (optional)',
  'Partagez votre expérience...': 'Share your experience...',
  'Publier': 'Post',
});

const { width, height } = Dimensions.get('window');

// ── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({ rating, size = 20, onPress }: { rating: number; size?: number; onPress?: (r: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} onPress={() => onPress?.(star)} disabled={!onPress} activeOpacity={0.7}>
          <Text style={{ fontSize: size, color: star <= rating ? '#FFA726' : '#E0E0E0' }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── Review Card ────────────────────────────────────────────────────────────
function ReviewCard({ review, isOwn, onDelete, theme }: { review: any; isOwn: boolean; onDelete: () => void; theme: any }) {
  const { t, language } = useTranslation();
  const date = review.createdAt?.toDate?.() ?? new Date(review.createdAt ?? 0);
  const dateLocale = language === 'en' ? 'en-GB' : 'fr-FR';
  return (
    <View style={[rvStyles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={rvStyles.header}>
        <View style={[rvStyles.avatar, { backgroundColor: Colors.primary + '33' }]}>
          <Text style={[rvStyles.avatarText, { color: Colors.primary }]}>{(review.userName || 'U')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[rvStyles.name, { color: theme.text }]}>{review.userName || t('Utilisateur')}</Text>
          <Text style={[rvStyles.date, { color: theme.textSecondary }]}>{date.toLocaleDateString(dateLocale)}</Text>
        </View>
        <StarRating rating={review.rating} size={14} />
        {isOwn && (
          <TouchableOpacity onPress={onDelete} style={rvStyles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color="#D32F2F" />
          </TouchableOpacity>
        )}
      </View>
      {review.comment ? <Text style={[rvStyles.comment, { color: theme.textSecondary }]}>{review.comment}</Text> : null}
    </View>
  );
}

const rvStyles = StyleSheet.create({
  card: {
    borderRadius: 7, borderWidth: 1, padding: 12, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '400', fontSize: 15 },
  name: { fontSize: 13, fontWeight: '400' },
  date: { fontSize: 11, marginTop: 1 },
  comment: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  deleteBtn: { padding: 4 },
});

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useColorTheme();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { t } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Seller reviews
  const [sellerReviews, setSellerReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

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

  // Real-time seller reviews
  useEffect(() => {
    if (!product?.ownerId) return;
    const q = query(collection(db, 'sellerRatings', product.ownerId, 'items'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setSellerReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setReviewsLoading(false);
    });
  }, [product?.ownerId]);

  const avgSellerRating = sellerReviews.length
    ? Math.round((sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length) * 10) / 10
    : 0;

  const myExistingReview = sellerReviews.find(r => r.userId === user?.uid);

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

  const handleSubmitReview = async () => {
    if (!user) {
      Alert.alert(t('Connexion requise'), '', [{ text: t('Se connecter'), onPress: () => router.push('/auth') }, { text: t('Annuler'), style: 'cancel' }]);
      return;
    }
    if (!product?.ownerId) return;
    if (myRating === 0) { Alert.alert(t('Note requise'), t('Veuillez sélectionner une note.')); return; }
    if (containsProfanity(myComment)) {
      Alert.alert(
        t('⚠️ Langage inapproprié'),
        t('Votre avis contient des mots inappropriés. Merci de reformuler poliment et de le soumettre à nouveau.')
      );
      return;
    }
    setSubmittingReview(true);
    try {
      if (myExistingReview) {
        await updateDoc(doc(db, 'sellerRatings', product.ownerId, 'items', myExistingReview.id), {
          rating: myRating,
          comment: myComment.trim() || null,
        });
        Alert.alert(t('✅ Avis modifié!'), t('Votre avis a été mis à jour.'));
      } else {
        await addDoc(collection(db, 'sellerRatings', product.ownerId, 'items'), {
          userId: user.uid,
          userName: userProfile?.name || user.email || t('Utilisateur'),
          rating: myRating,
          comment: myComment.trim() || null,
          createdAt: serverTimestamp(),
        });
        Alert.alert(t('✅ Avis publié!'), t('Merci pour votre retour.'));
      }
      setShowReviewModal(false);
      setMyRating(0);
      setMyComment('');
    } catch (e: any) {
      Alert.alert(t('Erreur'), e?.message || t("Impossible de publier l'avis."));
    } finally { setSubmittingReview(false); }
  };

  const handleDeleteReview = async (review: any) => {
    if (!product?.ownerId) return;
    Alert.alert(t('Supprimer votre avis?'), '', [
      { text: t('Annuler'), style: 'cancel' },
      {
        text: t('Supprimer'), style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'sellerRatings', product.ownerId!, 'items', review.id));
          } catch {
            Alert.alert(t('Erreur'), t('Impossible de supprimer.'));
          }
        },
      },
    ]);
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
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => { setViewerIndex(index); setShowImageViewer(true); }}
                    >
                      <Image source={{ uri: item }} style={[styles.photo, { width }]} resizeMode="cover" />
                    </TouchableOpacity>
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
                {(() => {
                  const stock = getStockBadge(product);
                  return (
                    <View style={[styles.stockTag, { backgroundColor: stock.color + '18' }]}>
                      <Text style={[styles.stockTagText, { color: stock.color }]}>{t(stock.label)}</Text>
                    </View>
                  );
                })()}
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
              <Text style={[styles.description, { color: theme.textSecondary }]}>
                {product.description.split('\n').map((line, i, all) => (
                  <Text key={i} style={line.trim().startsWith('⚠️') ? styles.descriptionAlert : undefined}>
                    {line}{i < all.length - 1 ? '\n' : ''}
                  </Text>
                ))}
              </Text>
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

          {/* ── SELLER REVIEWS ──────────────────────────────────────────── */}
          <View style={styles.reviewsHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 2 }]}>
                {t('Avis sur le vendeur')} ({sellerReviews.length})
              </Text>
              {sellerReviews.length > 0 && <StarRating rating={Math.round(avgSellerRating)} size={16} />}
            </View>
            <TouchableOpacity
              style={styles.addReviewBtn}
              onPress={() => {
                if (!user) {
                  Alert.alert(t('Connexion requise'), '', [
                    { text: t('Se connecter'), onPress: () => router.push('/auth') },
                    { text: t('Annuler'), style: 'cancel' },
                  ]);
                  return;
                }
                if (myExistingReview) {
                  setMyRating(myExistingReview.rating);
                  setMyComment(myExistingReview.comment || '');
                }
                setShowReviewModal(true);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="create-outline" size={16} color="#fff" />
                <Text style={styles.addReviewBtnText}>
                  {myExistingReview ? t('Modifier mon avis') : t('Laisser un avis')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {reviewsLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
          ) : sellerReviews.length === 0 ? (
            <View style={[styles.emptyReviews, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="chatbubbles-outline" size={40} color={theme.textSecondary} />
              <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center' }}>
                {t('Aucun avis pour le moment. Soyez le premier!')}
              </Text>
            </View>
          ) : (
            <View style={{ marginTop: 12 }}>
              {sellerReviews.map(r => (
                <ReviewCard
                  key={r.id} review={r}
                  isOwn={r.userId === user?.uid}
                  onDelete={() => handleDeleteReview(r)}
                  theme={theme}
                />
              ))}
            </View>
          )}
        </ContentContainer>

        <View style={{ height: 40 }} />
      </ScrollView>
      </LinearGradient>

      {/* FULL-SCREEN IMAGE VIEWER */}
      {photos.length > 0 && (
        <Modal
          visible={showImageViewer}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowImageViewer(false)}
        >
          <View style={styles.imageViewerContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            <TouchableOpacity
              style={styles.imageViewerClose}
              onPress={() => setShowImageViewer(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            <FlatList
              data={photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0, height }}
              keyExtractor={(_, i) => String(i)}
              initialScrollIndex={viewerIndex}
              getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
              onMomentumScrollEnd={e => setViewerIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={[styles.imageViewerPhoto, { width, height }]} resizeMode="contain" />
              )}
            />

            {photos.length > 1 && (
              <View style={styles.imageViewerDotRow}>
                {photos.map((_, i) => (
                  <View key={i} style={[styles.dot, { backgroundColor: i === viewerIndex ? '#fff' : 'rgba(255,255,255,0.4)' }]} />
                ))}
              </View>
            )}
          </View>
        </Modal>
      )}

      {/* ── REVIEW MODAL ──────────────────────────────────────────────────── */}
      <Modal visible={showReviewModal} animationType="slide" transparent onRequestClose={() => setShowReviewModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Ionicons name="create-outline" size={24} color={theme.text} />
                <Text style={[styles.modalTitle, { color: theme.text, marginBottom: 0 }]}>{t('Laisser un avis')}</Text>
              </View>
              <Text style={[styles.modalSub, { color: theme.textSecondary }]}>{t('Note *')}</Text>
              <StarRating rating={myRating} size={36} onPress={setMyRating} />
              <Text style={[styles.modalSub, { color: theme.textSecondary, marginTop: 16 }]}>{t('Commentaire (optionnel)')}</Text>
              <TextInput
                style={[styles.reviewInput, { borderColor: theme.border, backgroundColor: theme.surface, color: theme.text }]}
                placeholder={t('Partagez votre expérience...')}
                placeholderTextColor={theme.textSecondary}
                value={myComment} onChangeText={setMyComment}
                multiline numberOfLines={4} maxLength={400}
                textAlignVertical="top"
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity style={[styles.modalCancelBtn, { borderColor: theme.border }]} onPress={() => { setShowReviewModal(false); setMyRating(0); setMyComment(''); }}>
                  <Text style={[styles.modalCancelText, { color: theme.textSecondary }]}>{t('Annuler')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalSubmitBtn, submittingReview && { opacity: 0.6 }]} onPress={handleSubmitReview} disabled={submittingReview}>
                  {submittingReview ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitText}>{t('Publier')}</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  stockTag: { borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  stockTagText: { fontSize: 11, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  catBadge: { borderRadius: 5, paddingHorizontal: 10, paddingVertical: 4 },
  catBadgeText: { fontSize: 12, fontWeight: '400' },
  city: { fontSize: 13 },
  likeBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  description: { fontSize: 14, lineHeight: 22 },
  // Any description line starting with ⚠️ (e.g. the eSIM-only notice) is
  // rendered bold so buyers can't miss it.
  descriptionAlert: { fontWeight: '700' },
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
  imageViewerContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  imageViewerClose: { position: 'absolute', top: 50, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  imageViewerPhoto: {},
  imageViewerDotRow: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  addReviewBtn: { backgroundColor: Colors.headerGradient[0], paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addReviewBtnText: { color: '#fff', fontSize: 13, fontWeight: '400' },
  emptyReviews: {
    alignItems: 'center', padding: 24, borderRadius: 8, borderWidth: 1, gap: 8, marginTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 14, borderTopRightRadius: 14, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '400' },
  modalSub: { fontSize: 13, fontWeight: '400', marginBottom: 10 },
  reviewInput: { borderWidth: 1.5, borderRadius: 7, padding: 12, fontSize: 14, minHeight: 100, marginTop: 4 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancelBtn: { flex: 1, borderWidth: 1.5, borderRadius: 7, paddingVertical: 8, alignItems: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '400' },
  modalSubmitBtn: { flex: 1, backgroundColor: Colors.headerGradient[0], borderRadius: 7, paddingVertical: 8, alignItems: 'center' },
  modalSubmitText: { fontSize: 15, fontWeight: '400', color: '#fff' },
});
