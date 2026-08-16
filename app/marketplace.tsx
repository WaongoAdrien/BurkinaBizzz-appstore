// app/marketplace.tsx — Marketplace screen: browse products for sale, filterable by category

import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, RefreshControl, TextInput,
  StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, orderBy, onSnapshot, where, Query, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, ProductCategory } from '../types/index';
import { Colors, PRODUCT_CATEGORIES } from '../constants';
import { useColorTheme } from '../hooks/useColorTheme';
import { CategoryIcon } from '../components/CategoryIcon';
import { ContentContainer } from '../components/ContentContainer';
import ProductCard from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { useTranslation, registerTranslations } from '../lib/LanguageContext';

registerTranslations({
  'Marché': 'Marketplace',
  'Impossible de charger les produits. Vérifiez votre connexion.': 'Unable to load products. Check your connection.',
  'Erreur de connexion': 'Connection error',
  'Réessayer': 'Retry',
  'Rechercher un produit...': 'Search for a product...',
  'produit trouvé': 'product found',
  'produits trouvés': 'products found',
  'dans': 'in',
  '🌍 Tous': '🌍 All',
  'Aucun produit trouvé': 'No products found',
  'Aucun produit dans': 'No products in',
  'pour le moment.': 'for now.',
  'Le marché est vide pour le moment. Revenez bientôt!': 'The marketplace is empty for now. Check back soon!',
});

export default function MarketplaceScreen() {
  const { category: paramCategory } = useLocalSearchParams<{ category?: string }>();
  const { theme } = useColorTheme();
  const { t } = useTranslation();

  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'Tous'>(
    (paramCategory as ProductCategory) || 'Tous'
  );
  const [search, setSearch] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  // Real-time Firestore listener
  useEffect(() => {
    setLoading(true);
    setError(null);

    let q: Query<DocumentData> = query(
      collection(db, 'products'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    if (activeCategory !== 'Tous') {
      q = query(
        collection(db, 'products'),
        where('status', '==', 'approved'),
        where('category', '==', activeCategory),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
        setLoading(false);
        setRefreshing(false);
      },
      () => {
        setError(t('Impossible de charger les produits. Vérifiez votre connexion.'));
        setLoading(false);
        setRefreshing(false);
      }
    );

    return unsubscribe;
  }, [activeCategory, retryKey]);

  // Client-side search filter
  useEffect(() => {
    if (!search.trim()) { setFiltered(products); return; }
    const s = search.toLowerCase();
    setFiltered(products.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.description?.toLowerCase().includes(s) ||
      p.city?.toLowerCase().includes(s)
    ));
  }, [products, search]);

  if (error) {
    return (
      <LinearGradient
        colors={(theme.backgroundGradient || [theme.background, theme.background]) as [string, string, ...string[]]}
        style={styles.container}
      >
        <EmptyState icon="📵" title={t('Erreur de connexion')} subtitle={error} />
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: Colors.primary }]}
          onPress={() => setRetryKey(k => k + 1)}
        >
          <Text style={{ color: '#fff', fontWeight: '400' }}>{t('Réessayer')}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={(theme.backgroundGradient || [theme.background, theme.background]) as [string, string, ...string[]]}
      style={styles.container}
    >
      <Stack.Screen options={{ title: t('Marché'), headerBackVisible: true, headerBackTitle: '' }} />

      <View style={{ width: '100%', alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 600 }}>
          {/* SEARCH */}
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={t('Rechercher un produit...')}
              placeholderTextColor={theme.textSecondary}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={{ color: theme.textSecondary, fontSize: 16, paddingHorizontal: 4 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* CATEGORY FILTER */}
          <FlatList
            horizontal
            data={['Tous', ...PRODUCT_CATEGORIES.map(c => c.label)] as (ProductCategory | 'Tous')[]}
            keyExtractor={item => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            renderItem={({ item }) => {
              const active = activeCategory === item;
              const cat = PRODUCT_CATEGORIES.find(c => c.label === item);
              const activeColor = cat ? cat.color : Colors.primary;
              return (
                <TouchableOpacity
                  style={[styles.filterChip, active && { backgroundColor: activeColor }]}
                  onPress={() => setActiveCategory(item)}
                  activeOpacity={0.85}
                >
                  {cat && <CategoryIcon iconName={cat.icon} iconFamily={cat.iconFamily} size={14} color={active ? '#fff' : activeColor} />}
                  <Text style={[styles.filterChipText, { color: active ? '#fff' : theme.text }]}>
                    {item === 'Tous' ? t('🌍 Tous') : item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* RESULTS COUNT */}
          {!loading && (
            <Text style={[styles.resultCount, { color: theme.textSecondary }]}>
              {filtered.length} {t(filtered.length !== 1 ? 'produits trouvés' : 'produit trouvé')}
              {activeCategory !== 'Tous' ? ` ${t('dans')} "${activeCategory}"` : ''}
            </Text>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
          <FlatList
            style={{ width: '100%', maxWidth: 600 }}
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard product={item} />}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={Colors.primary} />
            }
            ListEmptyComponent={
              <EmptyState
                icon="🛒"
                title={t('Aucun produit trouvé')}
                subtitle={
                  activeCategory !== 'Tous'
                    ? `${t('Aucun produit dans')} "${activeCategory}" ${t('pour le moment.')}`
                    : t('Le marché est vide pour le moment. Revenez bientôt!')
                }
              />
            }
            removeClippedSubviews={true}
            maxToRenderPerBatch={6}
            windowSize={10}
            initialNumToRender={4}
          />
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginTop: 12, marginBottom: 4, borderRadius: 7, borderWidth: 1.5, paddingHorizontal: 4, paddingVertical: 8 },
  searchIcon: { fontSize: 16, marginRight: 8, marginLeft: 8 },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 4 },
  filterRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 34, paddingHorizontal: 12, borderRadius: 7, backgroundColor: '#F5F5F5' },
  filterChipText: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  resultCount: { fontSize: 12, paddingHorizontal: 12, paddingBottom: 4 },
  listContent: { paddingHorizontal: 10, paddingBottom: 24 },
  row: { justifyContent: 'space-between' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  retryBtn: { marginHorizontal: 32, padding: 14, borderRadius: 7, alignItems: 'center', marginBottom: 32 },
});
