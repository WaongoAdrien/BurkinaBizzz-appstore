// app/applications.tsx — Useful applications in Burkina Faso

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Colors } from '../constants';
import { useColorTheme } from '../hooks/useColorTheme';
import { useTranslation, registerTranslations } from '../lib/LanguageContext';
import EmptyState from '../components/EmptyState';

registerTranslations({
  'Applications utiles': 'Useful applications',
  'Les meilleures applications pour vivre et voyager au Burkina Faso': 'The best apps for living in and visiting Burkina Faso',
  'Rechercher une application...': 'Search for an application...',
  'Tous': 'All',
  'Aucune application trouvée': 'No applications found',
  "Essayez une autre recherche ou un autre filtre.": 'Try a different search or filter.',
});

export const normalizeUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);
const normalizeText = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export interface UsefulApp {
  id: string;
  name: string;
  category: string;
  description: string;
  image?: string;
  androidUrl?: string;
  iosUrl?: string;
  website?: string;
  order?: number;
}

function AppCard({ item }: { item: UsefulApp }) {
  const router = useRouter();
  const { theme } = useColorTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => router.push(`/application/${item.id}`)}
      activeOpacity={0.88}
    >
      <View style={styles.cardIconWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardIcon} resizeMode="cover" />
        ) : (
          <View style={[styles.cardIcon, styles.cardIconPlaceholder, { backgroundColor: Colors.primary + '22' }]}>
            <Ionicons name="apps" size={28} color={Colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: Colors.primary + '18' }]}>
          <Text style={[styles.categoryBadgeText, { color: Colors.primary }]}>{item.category}</Text>
        </View>
        {item.description ? (
          <Text style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        ) : null}
        {(item.androidUrl || item.iosUrl) && (
          <View style={styles.storeRow}>
            {item.androidUrl && (
              <View style={[styles.storeBadge, { borderColor: theme.border }]}>
                <Ionicons name="logo-google-playstore" size={12} color="#01875f" />
                <Text style={[styles.storeBadgeText, { color: theme.textSecondary }]}>Android</Text>
              </View>
            )}
            {item.iosUrl && (
              <View style={[styles.storeBadge, { borderColor: theme.border }]}>
                <Ionicons name="logo-apple-appstore" size={12} color={theme.text} />
                <Text style={[styles.storeBadgeText, { color: theme.textSecondary }]}>iOS</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
    </TouchableOpacity>
  );
}

export default function ApplicationsScreen() {
  const [apps, setApps] = useState<UsefulApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const { t } = useTranslation();
  const { theme } = useColorTheme();

  useEffect(() => {
    const q = query(collection(db, 'usefulApps'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      setApps(snap.docs.map(d => ({ id: d.id, ...d.data() } as UsefulApp)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const categories = useMemo(() => (
    Array.from(new Set(apps.map(a => a.category).filter(Boolean))).sort((a, b) => a.localeCompare(b))
  ), [apps]);

  const filteredApps = apps.filter(a => {
    if (activeCategory !== 'Tous' && a.category !== activeCategory) return false;
    if (search.trim() && !normalizeText(a.name).includes(normalizeText(search))) return false;
    return true;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#e8ecf0' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <LinearGradient
          colors={Colors.headerGradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIconCircle}>
            <Ionicons name="apps" size={30} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{t('Applications utiles')}</Text>
          <Text style={styles.heroSub}>{t('Les meilleures applications pour vivre et voyager au Burkina Faso')}</Text>
        </LinearGradient>

        {/* BODY */}
        <View style={styles.body}>
          {!loading && (
            <>
              {/* SEARCH */}
              <View style={styles.searchBox}>
                <Ionicons name="search" size={16} color="#8A8A8A" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('Rechercher une application...')}
                  placeholderTextColor="#8A8A8A"
                  value={search}
                  onChangeText={setSearch}
                  autoCorrect={false}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={18} color="#8A8A8A" />
                  </TouchableOpacity>
                )}
              </View>

              {/* CATEGORY FILTER */}
              {categories.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                  {['Tous', ...categories].map(item => {
                    const active = activeCategory === item;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[styles.filterChip, active && { backgroundColor: Colors.primary }]}
                        onPress={() => setActiveCategory(item)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.filterChipText, { color: active ? '#fff' : '#5A5A5A' }]}>
                          {item === 'Tous' ? t('Tous') : item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </>
          )}

          {loading ? (
            <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 20 }} />
          ) : filteredApps.length === 0 ? (
            <EmptyState
              icon="📱"
              title={t('Aucune application trouvée')}
              subtitle={t('Essayez une autre recherche ou un autre filtre.')}
            />
          ) : (
            filteredApps.map(item => <AppCard key={item.id} item={item} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: 64, paddingBottom: 28, paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22, fontWeight: '400', color: '#fff', marginBottom: 6, textAlign: 'center',
  },
  heroSub: {
    fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 18, maxWidth: 320,
  },
  body: { paddingHorizontal: 10, paddingTop: 20, paddingBottom: 40, gap: 12 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 7, borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1A1A1A', paddingVertical: 2 },
  filterRow: { gap: 6, paddingVertical: 2 },
  filterChip: {
    height: 32, paddingHorizontal: 12, borderRadius: 7,
    backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center',
  },
  filterChipText: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 10, borderWidth: 1, padding: 12, marginHorizontal: 4,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 5,
  },
  cardIconWrap: { width: 56, height: 56 },
  cardIcon: { width: 56, height: 56, borderRadius: 14 },
  cardIconPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 4 },
  cardName: { fontSize: 15, fontWeight: '400' },
  categoryBadge: { alignSelf: 'flex-start', borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  categoryBadgeText: { fontSize: 11, fontWeight: '400' },
  cardDesc: { fontSize: 12.5, lineHeight: 17 },
  storeRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  storeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2,
  },
  storeBadgeText: { fontSize: 10.5, fontWeight: '400' },
});
