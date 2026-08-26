// hooks/useGoogleSignIn.ts — bouton « Continuer avec Google »
// ─────────────────────────────────────────────────────────────────────────────
// Encapsule expo-auth-session pour ne rien laisser fuir dans les écrans :
// ceux-ci appellent simplement promptAsync() et lisent { loading, error }.
//
// Le flux : Google renvoie un id_token, qu'on échange contre une session
// Firebase (voir AuthContext.signInWithGoogle).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../lib/AuthContext';
import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
} from '../lib/googleAuth';

// Referme l'onglet d'authentification au retour dans l'app.
WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  // Android n'a pas encore de client OAuth (empreinte SHA-1 requise) : on désactive
  // le bouton plutôt que de laisser l'utilisateur tomber sur une erreur Google.
  const available = Platform.OS === 'android' ? !!GOOGLE_ANDROID_CLIENT_ID : !!request;

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const idToken = response.params?.id_token;
      if (!idToken) {
        setError('Réponse Google incomplète. Réessayez.');
        setLoading(false);
        return;
      }
      setLoading(true);
      signInWithGoogle(idToken)
        .catch(() => setError('Connexion Google impossible. Réessayez.'))
        .finally(() => setLoading(false));
      return;
    }

    // 'dismiss' / 'cancel' : l'utilisateur a fermé la fenêtre, ce n'est pas une erreur.
    setLoading(false);
    if (response.type === 'error') setError('Connexion Google impossible. Réessayez.');
  }, [response]);

  const signIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await promptAsync();
    } catch {
      setError('Connexion Google impossible. Réessayez.');
      setLoading(false);
    }
  };

  return { signIn, loading, error, available };
}
