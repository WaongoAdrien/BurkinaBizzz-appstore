// app/complete-profile.tsx — complément de profil après une connexion Google
// ─────────────────────────────────────────────────────────────────────────────
// Google ne transmet ni numéro de téléphone ni WhatsApp, alors que l'annuaire en
// dépend (boutons Appeler / WhatsApp des fiches). Cet écran récupère ce qui
// manque avant de laisser accéder à l'espace vendeur.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';
import { useColorTheme } from '../hooks/useColorTheme';
import { Colors } from '../constants';
import { useTranslation, registerTranslations } from '../lib/LanguageContext';

registerTranslations({
  'Encore une étape': 'One more step',
  'Pour publier sur BurkinaBizz, nous avons besoin de votre numéro WhatsApp. Il servira aux clients à vous contacter.':
    'To publish on BurkinaBizz we need your WhatsApp number. Customers will use it to reach you.',
  'Votre nom': 'Your name',
  'Nom complet': 'Full name',
  'Numéro WhatsApp': 'WhatsApp number',
  'Ex: +226 70 00 00 00': 'Ex: +226 70 00 00 00',
  'Nom requis': 'Name required',
  'Numéro WhatsApp valide requis': 'Valid WhatsApp number required',
  'Continuer': 'Continue',
  'Erreur': 'Error',
  'Impossible d\'enregistrer. Réessayez.': 'Unable to save. Please try again.',
});

export default function CompleteProfileScreen() {
  const router = useRouter();
  const { userProfile, completeProfile } = useAuth();
  const { theme } = useColorTheme();
  const { t } = useTranslation();

  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const handleSubmit = async () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = t('Nom requis');
    if (!phone.trim() || phone.replace(/\D/g, '').length < 8) {
      e.phone = t('Numéro WhatsApp valide requis');
    }
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      await completeProfile(phone.trim(), name.trim());
      router.replace('/vendor/pending');
    } catch {
      Alert.alert(t('Erreur'), t("Impossible d'enregistrer. Réessayez."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={(theme.backgroundGradient || [theme.background, theme.background]) as [string, string, ...string[]]}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '22' }]}>
            <Ionicons name="person-circle-outline" size={44} color={Colors.primary} />
          </View>

          <Text style={[styles.title, { color: theme.text }]}>{t('Encore une étape')}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('Pour publier sur BurkinaBizz, nous avons besoin de votre numéro WhatsApp. Il servira aux clients à vous contacter.')}
          </Text>

          <Text style={[styles.label, { color: theme.text }]}>{t('Votre nom')}</Text>
          <TextInput
            style={[styles.input, { borderColor: errors.name ? '#D32F2F' : '#9CA3AF', color: theme.text }]}
            placeholder={t('Nom complet')}
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          <Text style={[styles.label, { color: theme.text, marginTop: 16 }]}>{t('Numéro WhatsApp')}</Text>
          <TextInput
            style={[styles.input, { borderColor: errors.phone ? '#D32F2F' : '#9CA3AF', color: theme.text }]}
            placeholder={t('Ex: +226 70 00 00 00')}
            placeholderTextColor="#9CA3AF"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitText}>{t('Continuer')}</Text>}
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 40, gap: 4 },
  iconCircle: {
    width: 76, height: 76, borderRadius: 38,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '400', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderRadius: 7, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, backgroundColor: '#FFFFFF',
  },
  errorText: { color: '#D32F2F', fontSize: 12, marginTop: 4 },
  submitBtn: {
    backgroundColor: Colors.headerGradient[0], borderRadius: 7,
    paddingVertical: 14, alignItems: 'center', marginTop: 28,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '400' },
});
