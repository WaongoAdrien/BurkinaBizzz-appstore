// app/evenement/[id].tsx — Event Detail Screen

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, Share,
  StyleSheet, Linking, ActivityIndicator, Dimensions,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { useColorTheme } from '../../hooks/useColorTheme';
import { useTranslation, registerTranslations } from '../../lib/LanguageContext';
import { EventItem, normalizeUrl } from '../evenement';

registerTranslations({
  'Date': 'Date',
  'À propos': 'About',
  'Contacter': 'Contact',
  'Appeler': 'Call',
  'Voir sur la carte': 'View on map',
  'Événement introuvable': 'Event not found',
  'Site web': 'Website',
});

const { width } = Dimensions.get('window');

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useColorTheme();
  const { t } = useTranslation();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'events', id)).then(snap => {
      if (snap.exists()) setEvent({ id: snap.id, ...snap.data() } as EventItem);
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

  if (!event) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: t('Événement introuvable') }} />
        <Text style={{ color: theme.text }}>{t('Événement introuvable')}</Text>
      </View>
    );
  }

  const handleShare = () => {
    Share.share({
      message: `${event.name}\n${event.location}\n\n${event.description?.slice(0, 100)}...`,
      title: event.name,
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: event.name, headerShown: true }} />

      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        {/* PHOTO */}
        <View style={{ width: '100%', height: 280, position: 'relative' }}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="share-outline" size={18} color="#fff" />
          </TouchableOpacity>
          {event.image ? (
            <Image source={{ uri: event.image }} style={[styles.photo, { width }]} resizeMode="cover" />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder, { width, backgroundColor: Colors.primary + '22' }]}>
              <Ionicons name="calendar-outline" size={72} color={Colors.primary} />
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* NAME + CATEGORY */}
          <View>
            <Text style={[styles.name, { color: theme.text }]}>{event.name}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.catBadge, { backgroundColor: Colors.primary + '22' }]}>
                <Text style={[styles.catBadgeText, { color: Colors.primary }]}>{event.category}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.locationText, { color: theme.textSecondary }]}>{event.location}</Text>
              </View>
            </View>
          </View>

          {/* DATE */}
          {event.date ? (
            <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '22' }]}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('Date')}</Text>
              </View>
              <Text style={[styles.scheduleText, { color: theme.text }]}>{event.date}</Text>
            </View>
          ) : null}

          {/* DESCRIPTION */}
          {event.description ? (
            <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '22' }]}>
                  <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('À propos')}</Text>
              </View>
              <Text style={[styles.descText, { color: theme.textSecondary }]}>{event.description}</Text>
            </View>
          ) : null}

          {/* CONTACT */}
          {(event.phone || event.mapLink || event.facebook || event.website) && (
            <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '22' }]}>
                  <Ionicons name="call-outline" size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('Contacter')}</Text>
              </View>
              <View style={styles.btnRow}>
                {event.phone && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.headerGradient[0] }]}
                    onPress={() => Linking.openURL(`tel:${event.phone!.replace(/\s+/g, '')}`)}
                  >
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>{t('Appeler')}</Text>
                  </TouchableOpacity>
                )}
                {event.mapLink && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.headerGradient[0] }]}
                    onPress={() => Linking.openURL(normalizeUrl(event.mapLink!))}
                  >
                    <Ionicons name="navigate" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>{t('Voir sur la carte')}</Text>
                  </TouchableOpacity>
                )}
                {event.facebook && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.headerGradient[0] }]}
                    onPress={() => Linking.openURL(normalizeUrl(event.facebook!))}
                  >
                    <Ionicons name="logo-facebook" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Facebook</Text>
                  </TouchableOpacity>
                )}
                {event.website && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.headerGradient[0] }]}
                    onPress={() => Linking.openURL(normalizeUrl(event.website!))}
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
