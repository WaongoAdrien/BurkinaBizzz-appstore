// components/ProductCard.tsx

import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Product } from '../types/index';
import { useColorTheme } from '../hooks/useColorTheme';
import { Colors, PRODUCT_CATEGORIES } from '../constants';
import { useAuth } from '../lib/AuthContext';
import { likeProduct, unlikeProduct, subscribeLikes } from '../lib/likes';
import { CategoryIcon } from './CategoryIcon';
import { useTranslation, registerTranslations } from '../lib/LanguageContext';

registerTranslations({
  'Connexion requise': 'Sign-in required',
  'Connectez-vous pour sauvegarder des favoris.': 'Sign in to save favorites.',
  'Annuler': 'Cancel',
  'Se connecter': 'Sign in',
  'Erreur': 'Error',
  'Impossible de modifier vos favoris.': 'Unable to update your favorites.',
  'Négociable': 'Negotiable',
});

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { theme } = useColorTheme();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeLikes(user.uid, (ids) => setLiked(ids.has(product.id)));
  }, [user, product.id]);

  const cat = PRODUCT_CATEGORIES.find(c => c.label === product.category);
  const cover = product.photos?.[0] || product.imageUrl;

  const handleLike = async () => {
    if (!user) {
      Alert.alert(t('Connexion requise'), t('Connectez-vous pour sauvegarder des favoris.'), [
        { text: t('Annuler'), style: 'cancel' },
        { text: t('Se connecter'), onPress: () => router.push('/auth') },
      ]);
      return;
    }
    setLikeLoading(true);
    try {
      if (liked) {
        await unlikeProduct(user.uid, product.id);
      } else {
        await likeProduct(user.uid, {
          id: product.id,
          name: product.name,
          imageUrl: cover || '',
          price: product.price,
          city: product.city,
          category: product.category,
        });
      }
    } catch {
      Alert.alert(t('Erreur'), t('Impossible de modifier vos favoris.'));
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
      activeOpacity={0.85}
    >
      {cover ? (
        <Image source={{ uri: cover }} style={styles.image} resizeMode="cover" fadeDuration={200} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: (cat?.color || Colors.primary) + '22' }]}>
          {cat ? (
            <CategoryIcon iconName={cat.icon} iconFamily={cat.iconFamily} size={36} color={cat.color} />
          ) : (
            <Text style={{ fontSize: 32 }}>🛍️</Text>
          )}
        </View>
      )}

      {/* Category badge */}
      {cat && (
        <View style={[styles.badge, { backgroundColor: cat.color + 'DD' }]}>
          <CategoryIcon iconName={cat.icon} iconFamily={cat.iconFamily} size={11} color="#fff" />
          <Text style={styles.badgeText} numberOfLines={1}>{product.category}</Text>
        </View>
      )}

      {/* Like button */}
      <TouchableOpacity
        style={[styles.likeBtn, liked && { backgroundColor: '#FFEBEE' }]}
        onPress={handleLike}
        disabled={likeLoading}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {likeLoading
          ? <ActivityIndicator size="small" color="#e53935" />
          : <Text style={styles.likeIcon}>{liked ? '❤️' : '🤍'}</Text>
        }
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={[styles.city, { color: theme.textSecondary }]}>📍 {product.city}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{product.price.toLocaleString('fr-FR')} FCFA</Text>
          {product.negotiable && (
            <View style={styles.negoTag}>
              <Text style={styles.negoTagText}>{t('Négociable')}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    // Fixed fraction rather than flex:1 — with numColumns={2}, a flexed card
    // in a half-empty last row stretches to the full width. 48% keeps every
    // card identical whether its row holds one item or two.
    width: '48%',
    borderRadius: 8, overflow: 'hidden',
    marginBottom: 12, borderWidth: 1,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6,
  },
  image: { width: '100%', height: 140, backgroundColor: '#E0E0E0' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3, maxWidth: '80%',
  },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '400', flexShrink: 1 },
  likeBtn: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 11, width: 32, height: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  likeIcon: { fontSize: 16 },
  info: { padding: 10, gap: 4 },
  // minHeight reserves both lines so a short title (1 line) yields the same
  // card height as a long one (2 lines) — keeps every future listing uniform.
  name: { fontSize: 14, fontWeight: '400', lineHeight: 20, minHeight: 40 },
  city: { fontSize: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  price: { fontSize: 15, fontWeight: '400', color: Colors.primary },
  negoTag: { backgroundColor: '#E8F5E9', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  negoTagText: { fontSize: 9, fontWeight: '400', color: '#1B5E20' },
});
