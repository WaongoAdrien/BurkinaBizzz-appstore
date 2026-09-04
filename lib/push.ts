// lib/push.ts
// ─────────────────────────────────────────────────────────────────────────────
// Enregistrement du terminal pour les notifications push (Expo).
//
// Toute installation est concernée, connectée ou non : le jeton est écrit dans
// `pushTokens/{jeton}` (voir firestore.rules), pas sur la fiche utilisateur.
// L'envoi, lui, se fait depuis scripts/notify-new.js.
//
// Rien ne fonctionne dans Expo Go depuis le SDK 53 côté Android, ni sur
// simulateur : `registerForPushNotifications` renvoie null sans lever d'erreur.
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// Notification reçue app ouverte : on l'affiche quand même, comme un rappel.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Le jeton est stable, mais on le réécrit une fois par semaine pour tenir à
// jour `updatedAt` — c'est ce qui permet au script d'envoi de repérer les
// installations mortes sans attendre le rejet d'Expo.
const CACHE_KEY = 'pushToken';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Android exige un canal déclaré, sinon les notifications sont silencieuses.
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Nouveautés BurkinaBizz',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2E7D32',
  });
}

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    await ensureAndroidChannel();

    // Un simulateur n'a pas de jeton push : inutile d'aller plus loin.
    if (!Device.isDevice) return null;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let status = existing;
    // On ne redemande pas une permission déjà refusée : iOS ne réaffiche pas la
    // boîte de dialogue et l'utilisateur ne verrait rien se passer.
    if (status === 'undetermined') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as any).easConfig?.projectId;
    if (!projectId) return null;

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    if (!token) return null;

    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { token: cachedToken, at } = JSON.parse(cached);
      if (cachedToken === token && Date.now() - at < CACHE_TTL_MS) return token;
    }

    // L'ID du document est le jeton lui-même : réinstaller l'app ne crée pas
    // de doublon, et les règles peuvent vérifier que les deux correspondent.
    await setDoc(
      doc(db, 'pushTokens', token),
      { token, platform: Platform.OS, updatedAt: serverTimestamp() },
      { merge: true },
    );
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ token, at: Date.now() }));
    return token;
  } catch {
    // Une notification manquée ne doit jamais empêcher l'app de démarrer.
    return null;
  }
}

// Chemin à ouvrir quand l'utilisateur touche la notification. Le script d'envoi
// met `{ type, id }` dans `data` ; tout le reste renvoie à l'accueil.
export function routeForNotification(data: any): string | null {
  const id = typeof data?.id === 'string' ? data.id : null;
  if (!id) return null;
  switch (data?.type) {
    case 'business': return `/business/${id}`;
    case 'event':    return `/evenement/${id}`;
    case 'site':     return `/tourism/${id}`;
    default:         return null;
  }
}
