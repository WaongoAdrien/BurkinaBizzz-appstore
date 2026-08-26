// lib/googleAuth.ts — connexion Google (Firebase Auth)
// ─────────────────────────────────────────────────────────────────────────────
// Firebase active le fournisseur Google côté serveur, mais signInWithPopup /
// signInWithRedirect du SDK Web ne fonctionnent pas en React Native. On passe
// donc par expo-auth-session pour récupérer un id_token Google, puis on
// l'échange contre une session Firebase via signInWithCredential.
//
// Les client IDs ne sont pas des secrets : ils sont embarqués dans l'app et
// visibles côté client. Ce qui protège le flux, c'est le bundle ID iOS déclaré
// sur le client OAuth et le domaine autorisé côté Firebase.
//
// androidClientId reste vide : il exige l'empreinte SHA-1 du keystore de
// signature (EAS → credentials). À renseigner avant de livrer Google sur Android,
// sinon le bouton échouera sur cette plateforme.
// ─────────────────────────────────────────────────────────────────────────────

export const GOOGLE_IOS_CLIENT_ID =
  '189748903908-d0t2q0gdl34nees567cnqk31n4sbj503.apps.googleusercontent.com';

export const GOOGLE_WEB_CLIENT_ID =
  '189748903908-lhbsbo9b030pjj6cdbfjosqgbd2r1882.apps.googleusercontent.com';

// Empreinte SHA-1 requise : récupérable via `eas credentials` (profil production).
export const GOOGLE_ANDROID_CLIENT_ID: string | undefined = undefined;

// Schéma d'URL iOS = client ID inversé. Doit correspondre à app.json →
// ios.infoPlist.CFBundleURLTypes, sinon le retour depuis Google échoue.
export const GOOGLE_IOS_URL_SCHEME =
  'com.googleusercontent.apps.189748903908-d0t2q0gdl34nees567cnqk31n4sbj503';
