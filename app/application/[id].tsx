// app/application/[id].tsx — Useful Application Detail Screen

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, Share,
  StyleSheet, Linking, ActivityIndicator, Dimensions,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../../lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { useColorTheme } from '../../hooks/useColorTheme';
import { useTranslation, registerTranslations } from '../../lib/LanguageContext';
import { UsefulApp, normalizeUrl } from '../applications';

registerTranslations({
  'À propos': 'About',
  'Application introuvable': 'Application not found',
  'Partager': 'Share',
  'Télécharger': 'Download',
  'Disponible sur': 'Available on',
  'Google Play': 'Google Play',
  'App Store': 'App Store',
  'Site web': 'Website',
});

const { width } = Dimensions.get('window');

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useColorTheme();
  const { t } = useTranslation();

  const [app, setApp] = useState<UsefulApp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, 'usefulApps', id)).then(snap => {
      if (snap.exists()) setApp({ id: snap.id, ...snap.data() } as UsefulApp);
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

  if (!app) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <Stack.Screen options={{ title: t('Application introuvable') }} />
        <Text style={{ color: theme.text }}>{t('Application introuvable')}</Text>
      </View>
    );
  }

  const handleShare = () => {
    Share.share({
      message: `${app.name}\n${app.category}\n\n${app.description?.slice(0, 100) || ''}`,
      title: app.name,
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: app.name, headerShown: true }} />

      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <View style={{ width: '100%', height: 220 }}>
          <LinearGradient colors={Colors.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="share-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.iconWrap}>
            {app.image ? (
              <Image source={{ uri: app.image }} style={styles.icon} resizeMode="cover" />
            ) : (
              <View style={[styles.icon, styles.iconPlaceholder]}>
                <Ionicons name="apps" size={44} color={Colors.primary} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.body}>
          {/* NAME + CATEGORY */}
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.name, { color: theme.text }]}>{app.name}</Text>
            <View style={[styles.catBadge, { backgroundColor: Colors.primary + '22' }]}>
              <Text style={[styles.catBadgeText, { color: Colors.primary }]}>{app.category}</Text>
            </View>
          </View>

          {/* DOWNLOAD */}
          {(app.androidUrl || app.iosUrl || app.website) && (
            <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '22' }]}>
                  <Ionicons name="download-outline" size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('Disponible sur')}</Text>
              </View>
              <View style={styles.btnRow}>
                {app.androidUrl && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#01875f' }]}
                    onPress={() => Linking.openURL(normalizeUrl(app.androidUrl!))}
                  >
                    <Ionicons name="logo-google-playstore" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>{t('Google Play')}</Text>
                  </TouchableOpacity>
                )}
                {app.iosUrl && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#1A1A1A' }]}
                    onPress={() => Linking.openURL(normalizeUrl(app.iosUrl!))}
                  >
                    <Ionicons name="logo-apple-appstore" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>{t('App Store')}</Text>
                  </TouchableOpacity>
                )}
                {app.website && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.headerGradient[0] }]}
                    onPress={() => Linking.openURL(normalizeUrl(app.website!))}
                  >
                    <Ionicons name="globe-outline" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>{t('Site web')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* DESCRIPTION */}
          {app.description ? (
            <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: Colors.primary + '22' }]}>
                  <Ionicons name="document-text-outline" size={16} color={Colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('À propos')}</Text>
              </View>
              <Text style={[styles.descText, { color: theme.textSecondary }]}>{app.description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { flex: 1 },
  shareBtn: {
    position: 'absolute', top: 12, right: 12, zIndex: 10,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  iconWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 96, height: 96, borderRadius: 22, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
  iconPlaceholder: { backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  body: { padding: 16, gap: 16 },
  name: { fontSize: 22, fontWeight: '600', lineHeight: 28, marginBottom: 8, textAlign: 'center' },
  catBadge: { borderRadius: 5, paddingHorizontal: 10, paddingVertical: 4 },
  catBadgeText: { fontSize: 12, fontWeight: '400' },
  sectionCard: { borderRadius: 10, padding: 16, gap: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionIcon: { width: 28, height: 28, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '400' },
  descText: { fontSize: 14, lineHeight: 21 },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 13, paddingHorizontal: 16, borderRadius: 7, flexGrow: 1,
  },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '400' },
});
