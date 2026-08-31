// app/emploi.tsx — Jobs section: coming soon placeholder

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { ContentContainer } from '../components/ContentContainer';
import { useTranslation, registerTranslations } from '../lib/LanguageContext';

registerTranslations({
  'Emploi': 'Jobs',
  'Bientôt disponible': 'Coming soon',
  "Nous préparons un espace emploi pour le Burkina Faso": 'We are building a jobs section for Burkina Faso',
  "Offres d'emploi, stages et opportunités près de chez vous — bientôt sur BurkinaBizz.":
    'Job offers, internships and opportunities near you — coming soon on BurkinaBizz.',
  'Ce qui arrive': "What's coming",
  "Offres d'emploi": 'Job offers',
  'Publiées par les entreprises de l’annuaire': 'Posted by businesses in the directory',
  'Stages et formations': 'Internships and training',
  'Pour les étudiants et jeunes diplômés': 'For students and recent graduates',
  'Candidature directe': 'Apply directly',
  'Postulez par WhatsApp ou e-mail en un clic': 'Apply via WhatsApp or e-mail in one tap',
  'Prévenez-moi sur WhatsApp': 'Notify me on WhatsApp',
  'Retour': 'Back',
});

const CONTACT_WHATSAPP = '+1 646 478 6515';
const NOTIFY_MESSAGE = "Bonjour! Je souhaite être prévenu du lancement de la section Emploi sur BurkinaBizz 🇧🇫";

const FEATURES = [
  { iconName: 'briefcase', title: "Offres d'emploi", desc: 'Publiées par les entreprises de l’annuaire', color: Colors.cta },
  { iconName: 'school', title: 'Stages et formations', desc: 'Pour les étudiants et jeunes diplômés', color: Colors.headerGradient[1] },
  { iconName: 'send', title: 'Candidature directe', desc: 'Postulez par WhatsApp ou e-mail en un clic', color: '#EC4899' },
];

export default function EmploiScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, backgroundColor: '#ecf0f4' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <LinearGradient
          colors={Colors.headerGradient}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIconCircle}>
            <Ionicons name="briefcase" size={30} color="#fff" />
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{t('Bientôt disponible')}</Text>
          </View>
          <Text style={styles.heroTitle}>{t('Nous préparons un espace emploi pour le Burkina Faso')}</Text>
          <Text style={styles.heroSub}>
            {t("Offres d'emploi, stages et opportunités près de chez vous — bientôt sur BurkinaBizz.")}
          </Text>
        </LinearGradient>

        <ContentContainer maxWidth={600} style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 }}>
          <Text style={styles.sectionTitle}>{t('Ce qui arrive')}</Text>

          {FEATURES.map(f => (
            <View key={f.title} style={styles.card}>
              <View style={[styles.cardIcon, { backgroundColor: f.color + '22' }]}>
                <Ionicons name={f.iconName as any} size={22} color={f.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{t(f.title)}</Text>
                <Text style={styles.cardDesc}>{t(f.desc)}</Text>
              </View>
            </View>
          ))}

          {/* NOTIFY ME */}
          <TouchableOpacity
            style={styles.waBtn}
            onPress={() => {
              const num = CONTACT_WHATSAPP.replace(/\D/g, '');
              Linking.openURL(`https://wa.me/${num}?text=${encodeURIComponent(NOTIFY_MESSAGE)}`);
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-whatsapp" size={28} color="#fff" />
            <Text style={styles.waTitle}>{t('Prévenez-moi sur WhatsApp')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={16} color="#5A5A5A" />
            <Text style={styles.backText}>{t('Retour')}</Text>
          </TouchableOpacity>
        </ContentContainer>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingTop: 64, paddingBottom: 28, paddingHorizontal: 24, alignItems: 'center' },
  heroIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center',
  },
  heroBadge: {
    marginTop: 14, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  heroBadgeText: { color: '#fff', fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase' },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '400', textAlign: 'center', marginTop: 12, lineHeight: 27 },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 19 },

  sectionTitle: { fontSize: 18, fontWeight: '400', color: '#1A1A1A', marginBottom: 14 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff',
    borderRadius: 8, borderWidth: 1, borderColor: '#e2e6ea', padding: 16, marginBottom: 10,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '400', color: '#1A1A1A' },
  cardDesc: { fontSize: 12, color: '#6A6A6A', marginTop: 2 },

  waBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#2d7647', borderRadius: 8, padding: 16, marginTop: 14,
  },
  waTitle: { fontSize: 15, fontWeight: '400', color: '#fff' },

  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 18 },
  backText: { fontSize: 13, color: '#5A5A5A' },
});
