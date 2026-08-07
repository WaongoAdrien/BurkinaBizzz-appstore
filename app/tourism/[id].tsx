// app/tourism/[id].tsx — Tourist Site Detail Screen

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, Share,
  StyleSheet, Linking, ActivityIndicator, FlatList, Dimensions,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { useColorTheme } from '../../hooks/useColorTheme';
import { useTranslation, registerTranslations } from '../../lib/LanguageContext';
import { Attraction, normalizeUrl } from '../tourism-sites';

registerTranslations({
  'Horaires': 'Opening hours',
  'À propos': 'About',
  'Contacter': 'Contact',
  'Appeler': 'Call',
  'Voir sur la carte': 'View on map',
  'Site introuvable': 'Site not found',
  'Partager': 'Share',
  'Site web': 'Website',
});

const { width } = Dimensions.get('window');

export default function TourismSiteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useColorTheme();
  const { t } = useTranslation();

  const [site, setSite] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'touristSites', id)).then(snap => {
      if (snap.exists()) setSite({ id: snap.id, ...snap.data() } as Attraction);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!site) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: t('Site introuvable') }} />
        <Text style={{ color: theme.text }}>{t('Site introuvable')}</Text>
      </View>
    );
  }

  const photos = site.photos?.length ? site.photos : site.image ? [site.image] : [];

  const handleShare = () => {
    Share.share({
      message: `${site.name}\n${site.location}\n\n${site.description?.slice(0, 100)}...`,
      title: site.name,
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: site.name, headerShown: true }} />

      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        {/* PHOTO GALLERY */}
        {photos.length > 0 ? (
          <View style={{ width: '100%', height: 280, position: 'relative' }}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="share-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <FlatList
              data={photos}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              onScroll={(e) => {
                const offsetX = e.nativeEvent.contentOffset.x;
                const containerWidth = e.nativeEvent.layoutMeasurement.width;
                setActivePhoto(Math.round(offsetX / containerWidth));
              }}
              scrollEventThrottle={16}
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
          <View style={{ position: 'relative' }}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="share-outline" size={18} color="#fff" />
            </TouchableOpacity>
            <View style={[styles.photo, styles.photoPlaceholder, { width, backgroundColor: Colors.primary + '22' }]}>
              <MaterialCommunityIcons name="image-outline" size={72} color={Colors.primary} />
            </View>
          </View>
        )}

        <View style={styles.body}>
          {/* NAME + CATEGORY */}
          <View>
            <Text style={[styles.name, { color: theme.text }]}>{site.name}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.catBadge, { backgroundColor: Colors.primary + '22' }]}>
                <Text style={[styles.catBadgeText, { color: Colors.primary }]}>{site.category}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.locationText, { color: theme.textSecondary }]}>{site.location}</Text>
              </View>
            </View>
          </View>

          {/* SCHEDULE */}
          {site.schedule ? (
            <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '22' }]}>
                  <Ionicons name="time-outline" size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('Horaires')}</Text>
              </View>
              <Text style={[styles.scheduleText, { color: theme.text }]}>{site.schedule}</Text>
            </View>
          ) : null}

          {/* DESCRIPTION */}
          {site.description ? (
            <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '22' }]}>
                  <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('À propos')}</Text>
              </View>
              <Text style={[styles.descText, { color: theme.textSecondary }]}>{site.description}</Text>
            </View>
          ) : null}

          {/* CONTACT */}
          {(site.phone || site.mapLink || site.facebook || site.website) && (
            <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '22' }]}>
                  <Ionicons name="call-outline" size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('Contacter')}</Text>
              </View>
              <View style={styles.btnRow}>
                {site.phone && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.headerGradient[0] }]}
                    onPress={() => Linking.openURL(`tel:${site.phone!.replace(/\s+/g, '')}`)}
                  >
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>{t('Appeler')}</Text>
                  </TouchableOpacity>
                )}
                {site.mapLink && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.headerGradient[0] }]}
                    onPress={() => Linking.openURL(normalizeUrl(site.mapLink!))}
                  >
                    <Ionicons name="navigate" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>{t('Voir sur la carte')}</Text>
                  </TouchableOpacity>
                )}
                {site.facebook && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.headerGradient[0] }]}
                    onPress={() => Linking.openURL(normalizeUrl(site.facebook!))}
                  >
                    <Ionicons name="logo-facebook" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Facebook</Text>
                  </TouchableOpacity>
                )}
                {site.website && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.headerGradient[0] }]}
                    onPress={() => Linking.openURL(normalizeUrl(site.website!))}
                  >
                    <Ionicons name="globe-outline" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>{t('Site web')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1 },
  photo: { height: 280 },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  shareBtn: {
    position: 'absolute', top: 12, right: 12, zIndex: 10,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
  },
  dotRow: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  body: { padding: 16, gap: 16 },
  name: { fontSize: 22, fontWeight: '600', lineHeight: 28, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  catBadge: { borderRadius: 5, paddingHorizontal: 10, paddingVertical: 4 },
  catBadgeText: { fontSize: 12, fontWeight: '400' },
  locationText: { fontSize: 13 },
  sectionCard: { borderRadius: 10, padding: 16, gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionIcon: { width: 28, height: 28, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '400' },
  scheduleText: { fontSize: 14, lineHeight: 21 },
  descText: { fontSize: 14, lineHeight: 21 },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 13, paddingHorizontal: 16, borderRadius: 7, flexGrow: 1,
  },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '400' },
});
