// lib/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  deleteUser as firebaseDeleteUser,
  User as FirebaseUser,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types/index2';

// ── Put your Firebase Auth UID here after you first sign in as admin ──────────
// In Firebase Console → Authentication → copy your UID → paste below
export const ADMIN_UID = 'mSnAilZG3Ra1oTrq2KhQsCBuLzB3';
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  isAdmin: boolean;
  isPending: boolean;
  isApprovedVendor: boolean;
  signIn: (email: string, password: string) => Promise<string>;
  deleteAccount: () => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Échange un id_token Google contre une session Firebase. */
  signInWithGoogle: (idToken: string) => Promise<void>;
  /** Renseigne le téléphone manquant après une première connexion Google. */
  completeProfile: (phone: string, name?: string) => Promise<void>;
  /** Vrai quand le compte existe mais n'a pas encore de téléphone. */
  needsProfileCompletion: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      // Unsubscribe previous profile listener
      if (profileUnsub) { profileUnsub(); profileUnsub = null; }

      if (firebaseUser) {
        // Real-time listener so role changes (pending→vendor) reflect immediately
        profileUnsub = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snap) => {
            if (snap.exists()) {
              setUserProfile(snap.data() as User);
            }
            setLoading(false);
          },
          () => setLoading(false)
        );
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<string> => {
    const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
    return snap.exists() ? (snap.data() as User).role : 'pending';
  };

  const deleteAccount = async () => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid));
    await firebaseDeleteUser(user);
    setUserProfile(null);
  };

  // New signups are PENDING until admin approves
  const signUp = async (email: string, password: string, name: string, phone: string) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(newUser, { displayName: name });

    // Check if this UID is the designated admin
    const role = newUser.uid === ADMIN_UID ? 'admin' : 'pending';

    const profile: User = {
      uid: newUser.uid,
      name,
      email,
      phone,
      role,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'users', newUser.uid), profile);
    setUserProfile(profile);
  };

  // Google ne fournit que le nom et l'e-mail — jamais de téléphone. Le profil est
  // donc créé sans, et l'app redirige vers /complete-profile tant qu'il manque.
  const signInWithGoogle = async (idToken: string) => {
    const credential = GoogleAuthProvider.credential(idToken);
    const { user: googleUser } = await signInWithCredential(auth, credential);

    const ref = doc(db, 'users', googleUser.uid);
    const snap = await getDoc(ref);

    // Compte déjà connu (inscription e-mail antérieure avec la même adresse, ou
    // reconnexion Google) : on ne réécrit rien, pour ne pas écraser son rôle.
    if (snap.exists()) {
      setUserProfile(snap.data() as User);
      return;
    }

    const profile: User = {
      uid: googleUser.uid,
      name: googleUser.displayName || '',
      email: googleUser.email || '',
      phone: '',
      role: googleUser.uid === ADMIN_UID ? 'admin' : 'pending',
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, profile);
    setUserProfile(profile);
  };

  const completeProfile = async (phone: string, name?: string) => {
    if (!user) throw new Error('Aucun utilisateur connecté');
    const updates: Partial<User> = { phone: phone.trim() };
    if (name?.trim()) updates.name = name.trim();

    await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
    if (name?.trim()) await updateProfile(user, { displayName: name.trim() });
    setUserProfile(prev => (prev ? { ...prev, ...updates } : prev));
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  // Un profil sans téléphone vient forcément d'une inscription Google : le
  // formulaire e-mail, lui, l'exige. On bloque donc l'accès vendeur tant qu'il manque.
  const needsProfileCompletion = !!user && !!userProfile && !userProfile.phone?.trim();

  const isAdmin = userProfile?.role === 'admin';
  const isPending = userProfile?.role === 'pending';
  const isApprovedVendor = userProfile?.role === 'vendor' || isAdmin;

  return (
    <AuthContext.Provider value={{
      user, userProfile, loading,
      isAdmin, isPending, isApprovedVendor,
      signIn, signUp, signOut, deleteAccount,
      signInWithGoogle, completeProfile, needsProfileCompletion,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
