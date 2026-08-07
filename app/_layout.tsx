import { Stack } from 'expo-router';
import { useColorScheme, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthProvider } from '../lib/AuthContext';
import { LanguageProvider, useTranslation, registerTranslations } from '../lib/LanguageContext';
import { Colors } from '../constants';
import { TabBar } from '../components/TabBar';

registerTranslations({
  'Annuaire 🔍': 'Directory 🔍',
  'Catégories': 'Categories',
  'Découvrir': 'Discover',
  'Sites touristiques': 'Tourist sites',
  'À propos du Burkina Faso': 'About Burkina Faso',
  'Entreprise': 'Business',
  'Connexion': 'Sign in',
  'Mot de passe oublié': 'Forgot password',
  'Favoris ❤️': 'Favorites ❤️',
  'Paramètres': 'Settings',
  'Mon espace': 'My space',
  'Ajouter une entreprise': 'Add a business',
  "Modifier l'entreprise": 'Edit business',
  'Admin Panel': 'Admin Panel',
  'Événements': 'Events',
  'Site touristique': 'Tourist site',
  'Événement': 'Event',
});

const HeaderBackground = () => (
  <LinearGradient
    colors={Colors.headerGradient}
    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
    style={{ flex: 1 }}
  />
);

function RootStack() {
  const isDark = useColorScheme() === 'dark';
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{
        headerBackground: HeaderBackground,
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '400', fontSize: 18 },
        headerBackTitle: '',
        contentStyle: { backgroundColor: isDark ? Colors.dark.background : Colors.light.background },
      }}>
        <Stack.Screen name="index" options={{ headerShown: false, headerBackTitle: '' }} />
        <Stack.Screen name="annuaire" options={{ title: t('Annuaire 🔍') }} />
        <Stack.Screen name="categories" options={{ title: t('Catégories') }} />
        <Stack.Screen name="more" options={{ title: t('Découvrir') }} />
        <Stack.Screen name="tourism-sites" options={{ title: t('Sites touristiques') }} />
        <Stack.Screen name="about-burkina" options={{ title: t('À propos du Burkina Faso'), headerShown: true }} />
        <Stack.Screen name="business/[id]" options={{ title: t('Entreprise'), headerShown: true }} />
        <Stack.Screen name="tourism/[id]" options={{ title: t('Site touristique'), headerShown: true }} />
        <Stack.Screen name="evenement/[id]" options={{ title: t('Événement'), headerShown: true }} />
        <Stack.Screen name="auth" options={{ title: t('Connexion'), presentation: 'modal' }} />
        <Stack.Screen name="forgot-password" options={{ title: t('Mot de passe oublié'), presentation: 'modal' }} />
        <Stack.Screen name="liked" options={{ title: t('Favoris ❤️') }} />
        <Stack.Screen name="settings" options={{ title: t('Paramètres') }} />
        <Stack.Screen name="vendor/dashboard" options={{ title: t('Mon espace') }} />
        <Stack.Screen name="vendor/add-business" options={{ title: t('Ajouter une entreprise') }} />
        <Stack.Screen name="vendor/edit-business" options={{ title: t("Modifier l'entreprise") }} />
        <Stack.Screen name="vendor/pending" options={{ headerShown: false, headerBackTitle: '' }} />
        <Stack.Screen name="admin/index" options={{ title: t('Admin Panel') }} />
        <Stack.Screen name="evenement" options={{ title: t('Événements') }} />
      </Stack>
      <TabBar />
    </View>
  );
}

export default function RootLayout() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </LanguageProvider>
  );
}
