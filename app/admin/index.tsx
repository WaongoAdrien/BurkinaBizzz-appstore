// app/admin/index.tsx — Admin Panel

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Image,
  StyleSheet, Alert, ActivityIndicator, Modal,
  SafeAreaView, RefreshControl, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import {
  collection, query, where, orderBy, onSnapshot,
  doc, addDoc, updateDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { Colors } from '../../constants';
import { useColorTheme } from '../../hooks/useColorTheme';
import { useTranslation, registerTranslations } from '../../lib/LanguageContext';
import { RichText, RICH_COLORS } from '../../components/RichText';
import LocationPicker from '../../components/Locationpicker';
import { DatePickerModal } from '../../components/DatePickerModal';
import { formatEventDate, TBD_DATE } from '../../lib/eventDate';

registerTranslations({
  'Position GPS (pour la carte)': 'GPS position (for the map)',
  'Optionnel — choisir sur la carte': 'Optional — pick on the map',
  'Hôtels recommandés à proximité': 'Recommended hotels nearby',
  "Aidez les visiteurs à trouver où dormir près de ce site.": 'Help visitors find where to stay near this site.',
  "Aucun hôtel ajouté pour l'instant.": 'No hotels added yet.',
  "Nom de l'hôtel": 'Hotel name',
  'Ajouter un hôtel': 'Add a hotel',
  'Chaque hôtel doit avoir un nom et un lien.': 'Each hotel needs both a name and a link.',
  'Applications utiles': 'Useful applications',
  'Ajouter une application': 'Add an application',
  'Aucune application': 'No applications',
  'une application': 'an application',
  'Le nom et la catégorie sont requis.': 'Name and category are required.',
  'Supprimer cette application?': 'Delete this application?',
  'Ex : Orange Money, Wave, Yango...': 'E.g.: Orange Money, Wave, Yango...',
  'Ex : Paiement mobile, Transport, Services publics...': 'E.g.: Mobile payment, Transport, Public services...',
  "Icône / logo (URL)": 'Icon / logo (URL)',
  'Lien Google Play': 'Google Play link',
  'Optionnel — https://play.google.com/...': 'Optional — https://play.google.com/...',
  'Lien App Store': 'App Store link',
  'Optionnel — https://apps.apple.com/...': 'Optional — https://apps.apple.com/...',
  'Erreur': 'Error',
  'Le nom, la catégorie et le lieu sont requis.': 'Name, category and location are required.',
  "Impossible d'enregistrer.": 'Unable to save.',
  'Supprimer?': 'Delete?',
  ' sera supprimé définitivement.': ' will be permanently deleted.',
  'Annuler': 'Cancel',
  'Supprimer': 'Delete',
  'Impossible de supprimer.': 'Unable to delete.',
  'Doublon avec :': 'Duplicate with:',
  'Enregistrer quand même': 'Save anyway',
  ' (identique)': ' (identical)',
  ' (très similaire)': ' (very similar)',
  ' (faute probable)': ' (likely typo)',
  'Doublon détecté': 'Duplicate detected',
  'Approuver cette entreprise?': 'Approve this business?',
  " apparaîtra dans l'annuaire.": ' will appear in the directory.',
  'Approuver': 'Approve',
  "Impossible d'approuver.": 'Unable to approve.',
  'Rejeter cette entreprise?': 'Reject this business?',
  ' sera supprimée définitivement.': ' will be permanently deleted.',
  'Rejeter': 'Reject',
  'Impossible de rejeter.': 'Unable to reject.',
  "Retirer de l'annuaire?": 'Remove from directory?',
  ' ne sera plus visible.': ' will no longer be visible.',
  'Retirer': 'Remove',
  'Impossible.': 'Unable to complete this action.',
  'Approuver ce vendeur?': 'Approve this vendor?',
  ' pourra soumettre des entreprises.': ' will be able to submit businesses.',
  'Rejeter ce vendeur?': 'Reject this vendor?',
  'Le compte de': 'The account of',
  ' sera supprimé.': ' will be deleted.',
  'Révoquer ce vendeur?': 'Revoke this vendor?',
  ' repassera en "En attente".': ' will switch back to "Pending".',
  'Révoquer': 'Revoke',
  'Nom quasi-identique': 'Nearly identical name',
  'Doublon possible': 'Possible duplicate',
  'En attente': 'Pending',
  'Publié': 'Published',
  'Succès': 'Success',
  'Badge vérifié retiré': 'Verified badge removed',
  'Entreprise vérifiée': 'Business verified',
  'Impossible de modifier': 'Unable to update',
  'Épinglage retiré': 'Pin removed',
  'Entreprise épinglée': 'Business pinned',
  'Modifier': 'Edit',
  'Vendeur': 'Vendor',
  'Révoquer le vendeur': 'Revoke vendor',
  'Entreprises en attente': 'Businesses pending',
  'Vendeurs en attente': 'Vendors pending',
  'Entreprises': 'Businesses',
  'Vendeurs': 'Vendors',
  'Signalements': 'Reports',
  'Événements': 'Events',
  'Sites touristiques': 'Tourist sites',
  'Chargement...': 'Loading...',
  'Rechercher une entreprise...': 'Search for a business...',
  'Rechercher un vendeur...': 'Search for a vendor...',
  'Publiées': 'Published',
  'Approuvés': 'Approved',
  'Aucun résultat': 'No results',
  'Aucune entreprise en attente': 'No pending businesses',
  'Aucune entreprise publiée': 'No published businesses',
  'Aucun vendeur en attente': 'No pending vendors',
  'Aucun vendeur approuvé': 'No approved vendors',
  'Motif:': 'Reason:',
  'Par:': 'By:',
  'Ignorer?': 'Dismiss?',
  'Ignorer': 'Dismiss',
  "Retirer l'annonce?": 'Remove the listing?',
  ' sera remise en attente.': ' will be put back to pending.',
  'Aucun signalement en attente': 'No pending reports',
  'Ajouter un événement': 'Add an event',
  'Aucun événement': 'No events',
  'Ajouter un site touristique': 'Add a tourist site',
  'Aucun site touristique': 'No tourist sites',
  'Priorité': 'Priority',
  'Entrez un nombre entre 0 et 100': 'Enter a number between 0 and 100',
  '(Plus élevé = apparaît en premier)': '(Higher = appears first)',
  'Priorité mise à': 'Priority set to',
  'Ajouter': 'Add',
  'un événement': 'an event',
  'un site touristique': 'a tourist site',
  'Nom *': 'Name *',
  'Catégorie *': 'Category *',
  'Lieu *': 'Location *',
  'Date': 'Date',
  'Date de fin (optionnel)': 'End date (optional)',
  'Aucune': 'None',
  'Retirer la date de fin': 'Remove end date',
  'TBD': 'TBD',
  'À déterminer': 'TBD',
  'Téléphone': 'Phone',
  'Lien carte (Google Maps)': 'Map link (Google Maps)',
  'Page Facebook': 'Facebook page',
  'Site web': 'Website',
  'Image (URL)': 'Image (URL)',
  'Lier à une autre entreprise': 'Link to another business',
  'Affiche un lien "Voir aussi" vers cette autre fiche sur la page de': 'Shows a "See also" link to this other listing on the page for',
  'Actuellement lié à :': 'Currently linked to:',
  'Photos supplémentaires (URLs séparées par une virgule)': 'Additional photos (comma-separated URLs)',
  'Horaires': 'Opening hours',
  'Ex : Lun-Ven 8h-18h, Sam 9h-13h': 'E.g.: Mon-Fri 8am-6pm, Sat 9am-1pm',
  'Description': 'Description',
  'Nom': 'Name',
  'Ex : Culture, Musique, Nature...': 'E.g.: Culture, Music, Nature...',
  'Ex : Ouagadougou': 'E.g.: Ouagadougou',
  'Ex : 12 septembre 2026': 'E.g.: September 12, 2026',
  'Optionnel': 'Optional',
  'Optionnel — https://maps.app.goo.gl/...': 'Optional — https://maps.app.goo.gl/...',
  'Optionnel — https://facebook.com/...': 'Optional — https://facebook.com/...',
  'Optionnel — https://...': 'Optional — https://...',
  'Enregistrer': 'Save',
  'Informations': 'Information',
  'Numéros utiles': 'Useful numbers',
  'Sites officiels': 'Official sites',
  'Ajouter un numéro': 'Add a number',
  'Ajouter un site officiel': 'Add an official site',
  'Aucun numéro utile': 'No useful numbers',
  'Aucun site officiel': 'No official sites',
  'un numéro utile': 'a useful number',
  'un site officiel': 'an official site',
  'Libellé *': 'Label *',
  'Numéro de téléphone *': 'Phone number *',
  'Groupe *': 'Group *',
  "Ex : Urgences, Hôpitaux et cliniques...": 'E.g.: Emergencies, Hospitals and clinics...',
  'Icône (Ionicons)': 'Icon (Ionicons)',
  'Ex : shield-checkmark-outline': 'E.g.: shield-checkmark-outline',
  'Site web *': 'Website *',
  'Ordre (optionnel)': 'Order (optional)',
  'Plus petit = apparaît en premier': 'Lower = appears first',
  'Le libellé et le numéro sont requis.': 'Label and number are required.',
  'Le nom est requis.': 'Name is required.',
  'Supprimer ce numéro?': 'Delete this number?',
  'Supprimer ce site?': 'Delete this site?',
  'Ex : Police Secours': 'E.g.: Police Emergency',
  'Ex : Présidence du Faso': 'E.g.: Présidence du Faso',

  // Products
  'Produits': 'Products',
  'Produits en attente': 'Products pending',
  'Rechercher un produit ou un vendeur...': 'Search for a product or a vendor...',
  'Résultats pour tous les statuts (en attente + publiés)': 'Results across all statuses (pending + published)',
  'Aucun produit en attente': 'No product pending',
  'Aucun produit publié': 'No product published',
  'Approuver ce produit?': 'Approve this product?',
  ' apparaîtra dans le marché.': ' will appear in the marketplace.',
  'Rejeter ce produit?': 'Reject this product?',
  'Retirer du marché?': 'Remove from marketplace?',
  'Négociable': 'Negotiable',
});

type Tab = 'businesses' | 'products' | 'users' | 'reports' | 'events' | 'attractions' | 'info';
type ContentKind = 'events' | 'attractions';
type InfoSubTab = 'numbers' | 'sites' | 'apps';

const CONTENT_COLLECTION: Record<ContentKind, string> = {
  events: 'events',
  attractions: 'touristSites',
};

interface HotelLink {
  name: string;
  url: string;
}

interface ContentFormState {
  visible: boolean;
  kind: ContentKind;
  editId: string | null;
  name: string;
  category: string;
  location: string;
  phone: string;
  image: string;
  photos: string;
  schedule: string;
  date: string;
  endDate: string;
  description: string;
  mapLink: string;
  facebook: string;
  website: string;
  latitude: number | null;
  longitude: number | null;
  hotels: HotelLink[];
}

const emptyContentForm = (kind: ContentKind): ContentFormState => ({
  visible: true, kind, editId: null,
  name: '', category: '', location: '', phone: '', image: '', photos: '', schedule: '', date: '', endDate: '', description: '',
  mapLink: '', facebook: '', website: '',
  latitude: null, longitude: null,
  hotels: [],
});

// ── Useful numbers & official sites (About Burkina) ─────────────────────────
interface NumberFormState {
  visible: boolean;
  editId: string | null;
  label: string;
  number: string;
  group: string;
  icon: string;
  order: string;
}
const emptyNumberForm = (): NumberFormState => ({
  visible: true, editId: null, label: '', number: '', group: '', icon: 'call-outline', order: '',
});

interface SiteFormState {
  visible: boolean;
  editId: string | null;
  name: string;
  website: string;
  facebook: string;
  description: string;
  icon: string;
  order: string;
}
const emptySiteForm = (): SiteFormState => ({
  visible: true, editId: null, name: '', website: '', facebook: '', description: '', icon: 'business-outline', order: '',
});

// ── Useful applications ──────────────────────────────────────────────────
interface AppFormState {
  visible: boolean;
  editId: string | null;
  name: string;
  category: string;
  description: string;
  image: string;
  androidUrl: string;
  iosUrl: string;
  website: string;
  order: string;
}
const emptyAppForm = (): AppFormState => ({
  visible: true, editId: null, name: '', category: '', description: '', image: '',
  androidUrl: '', iosUrl: '', website: '', order: '',
});

// ── Duplicate detection ─────────────────────────────────────────────────────
const normStr = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

const diceSimilarity = (a: string, b: string): number => {
  const na = normStr(a), nb = normStr(b);
  if (na.length < 3 || nb.length < 3) return na === nb ? 1 : 0;
  const tris = (s: string) => new Set(Array.from({ length: s.length - 2 }, (_, i) => s.slice(i, i + 3)));
  const ta = tris(na), tb = tris(nb);
  let overlap = 0;
  ta.forEach(t => { if (tb.has(t)) overlap++; });
  return (2 * overlap) / (ta.size + tb.size);
};

const levenshtein = (a: string, b: string): number => {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
};

const wordOverlapScore = (a: string, b: string): number => {
  const wa = normStr(a).split(' ').filter(w => w.length > 2);
  const wb = normStr(b).split(' ').filter(w => w.length > 2);
  if (!wa.length || !wb.length) return 0;
  const scores = wa.map(w => Math.max(...wb.map(ww => 1 - levenshtein(w, ww) / Math.max(w.length, ww.length))));
  return scores.reduce((s, v) => s + v, 0) / scores.length;
};

const DUPE_THRESHOLD = 0.8;
const WORD_OVERLAP_THRESHOLD = 0.75;
const isSameIgnoringSpacesAndPunct = (a: string, b: string) =>
  a.toLowerCase().replace(/[\s.,\-']/g, '') === b.toLowerCase().replace(/[\s.,\-']/g, '');

// ───────────────────────────────────────────────────────────────────────────

export default function AdminScreen() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { theme } = useColorTheme();
  const { t } = useTranslation();

  const [tab, setTab] = useState<Tab>('businesses');

  // Businesses
  const [pendingBiz, setPendingBiz] = useState<any[]>([]);
  const [approvedBiz, setApprovedBiz] = useState<any[]>([]);

  // Products
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [approvedProducts, setApprovedProducts] = useState<any[]>([]);
  const [productTab, setProductTab] = useState<'pending' | 'approved'>('pending');
  const [productSearch, setProductSearch] = useState('');

  // Users
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);

  // Reports
  const [reports, setReports] = useState<any[]>([]);

  // Events & Tourist attractions
  const [events, setEvents] = useState<any[]>([]);
  const [attractions, setAttractions] = useState<any[]>([]);
  const [contentForm, setContentForm] = useState<ContentFormState>({ ...emptyContentForm('events'), visible: false });
  // Position du curseur dans le champ Description, pour que les boutons de mise
  // en forme entourent la sélection plutôt que d'écrire en fin de texte.
  const [descSelection, setDescSelection] = useState({ start: 0, end: 0 });

  // Entoure la sélection des balises lues par components/RichText.tsx.
  // Sans sélection, insère un gabarit que l'admin n'a plus qu'à écraser.
  const wrapDescription = (open: string, close: string) => {
    setContentForm(prev => {
      const text = prev.description;
      const { start, end } = descSelection;
      const selected = text.slice(start, end) || 'texte';
      return { ...prev, description: text.slice(0, start) + open + selected + close + text.slice(end) };
    });
  };
  const [savingContent, setSavingContent] = useState(false);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [eventDatePickerVisible, setEventDatePickerVisible] = useState(false);
  const [eventEndDatePickerVisible, setEventEndDatePickerVisible] = useState(false);

  // Useful numbers & official sites (About Burkina)
  const [infoSubTab, setInfoSubTab] = useState<InfoSubTab>('numbers');
  const [usefulNumbers, setUsefulNumbers] = useState<any[]>([]);
  const [officialSites, setOfficialSites] = useState<any[]>([]);
  const [usefulApps, setUsefulApps] = useState<any[]>([]);
  const [numberForm, setNumberForm] = useState<NumberFormState>({ ...emptyNumberForm(), visible: false });
  const [siteForm, setSiteForm] = useState<SiteFormState>({ ...emptySiteForm(), visible: false });
  const [appForm, setAppForm] = useState<AppFormState>({ ...emptyAppForm(), visible: false });
  const [savingInfo, setSavingInfo] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [bizTab, setBizTab] = useState<'pending' | 'approved'>('pending');
  const [userTab, setUserTab] = useState<'pending' | 'approved'>('pending');

  // Search
  const [bizSearch, setBizSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Priority modal
  const [priorityModal, setPriorityModal] = useState<{ visible: boolean; item: any | null; value: string; collection: string }>({ visible: false, item: null, value: '', collection: 'businesses' });

  // Alert.alert has no UI on react-native-web, so two-button confirms silently
  // no-op there. This in-app modal works identically on web and native.
  const [confirmModal, setConfirmModal] = useState<{ visible: boolean; title: string; message: string; confirmText: string; cancelText: string; onConfirm: () => void }>({
    visible: false, title: '', message: '', confirmText: '', cancelText: '', onConfirm: () => {},
  });
  const confirmDialog = (title: string, message: string, confirmText: string, cancelText: string, onConfirm: () => void) => {
    setConfirmModal({ visible: true, title, message, confirmText, cancelText, onConfirm });
  };

  // Links a business to another listing (e.g. a second branch), shown as a
  // "Voir aussi" card on the business detail page.
  const [linkModal, setLinkModal] = useState<{ visible: boolean; item: any | null; search: string }>({ visible: false, item: null, search: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/auth'); return; }
    if (!isAdmin) { router.replace('/'); }
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    if (!isAdmin) return;

    const sort = (a: any, b: any) => {
      const at = a.createdAt?.toDate?.() ?? new Date(a.createdAt ?? 0);
      const bt = b.createdAt?.toDate?.() ?? new Date(b.createdAt ?? 0);
      return bt.getTime() - at.getTime();
    };

    // ── Businesses ──────────────────────────────────────────────────────
    const u1 = onSnapshot(
      query(collection(db, 'businesses'), where('status', '==', 'pending')),
      snap => { setPendingBiz(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort(sort)); setLoading(false); setRefreshing(false); }
    );
    const u2 = onSnapshot(
      query(collection(db, 'businesses'), where('status', '==', 'approved')),
      snap => { setApprovedBiz(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort(sort)); }
    );

    // ── Products ─────────────────────────────────────────────────────────
    const uP1 = onSnapshot(
      query(collection(db, 'products'), where('status', '==', 'pending')),
      snap => { setPendingProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort(sort)); }
    );
    const uP2 = onSnapshot(
      query(collection(db, 'products'), where('status', '==', 'approved')),
      snap => { setApprovedProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort(sort)); }
    );

    // ── Users ────────────────────────────────────────────────────────────
    const u3 = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'pending')),
      snap => { setPendingUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort(sort)); }
    );
    const u4 = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'vendor')),
      snap => { setApprovedUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort(sort)); }
    );

    // ── Reports ──────────────────────────────────────────────────────────
    const u5 = onSnapshot(
      query(collection(db, 'reports'), where('status', '==', 'pending')),
      snap => { setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort(sort)); }
    );

    // ── Events & Tourist attractions ────────────────────────────────────
    const u6 = onSnapshot(
      query(collection(db, 'events'), orderBy('createdAt', 'desc')),
      snap => setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const u7 = onSnapshot(
      query(collection(db, 'touristSites'), orderBy('createdAt', 'desc')),
      snap => setAttractions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    // ── Useful numbers & official sites ─────────────────────────────────
    const u8 = onSnapshot(
      query(collection(db, 'usefulNumbers'), orderBy('order', 'asc')),
      snap => setUsefulNumbers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const u9 = onSnapshot(
      query(collection(db, 'officialSites'), orderBy('order', 'asc')),
      snap => setOfficialSites(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const u10 = onSnapshot(
      query(collection(db, 'usefulApps'), orderBy('order', 'asc')),
      snap => setUsefulApps(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => { u1(); u2(); uP1(); uP2(); u3(); u4(); u5(); u6(); u7(); u8(); u9(); u10(); };
  }, [isAdmin]);

  // ── Events & attractions actions ────────────────────────────────────────
  const openAddContent = (kind: ContentKind) => setContentForm(emptyContentForm(kind));

  const openEditContent = (kind: ContentKind, item: any) => setContentForm({
    visible: true, kind, editId: item.id,
    name: item.name || '', category: item.category || '', location: item.location || '',
    phone: item.phone || '', image: item.image || '',
    photos: Array.isArray(item.photos) ? item.photos.join(', ') : '',
    schedule: item.schedule || '',
    date: item.date || '', endDate: item.endDate || '', description: item.description || '',
    mapLink: item.mapLink || '', facebook: item.facebook || '', website: item.website || '',
    latitude: typeof item.latitude === 'number' ? item.latitude : null,
    longitude: typeof item.longitude === 'number' ? item.longitude : null,
    hotels: Array.isArray(item.hotels) ? item.hotels.map((h: any) => ({ name: h?.name || '', url: h?.url || '' })) : [],
  });

  const closeContentForm = () => setContentForm(prev => ({ ...prev, visible: false }));

  const quickAddContent = (kind: ContentKind) => {
    setTab(kind);
    openAddContent(kind);
  };

  const addHotelRow = () => setContentForm(prev => ({ ...prev, hotels: [...prev.hotels, { name: '', url: '' }] }));
  const removeHotelRow = (idx: number) => setContentForm(prev => ({ ...prev, hotels: prev.hotels.filter((_, i) => i !== idx) }));
  const updateHotelRow = (idx: number, field: keyof HotelLink, value: string) =>
    setContentForm(prev => ({ ...prev, hotels: prev.hotels.map((h, i) => (i === idx ? { ...h, [field]: value } : h)) }));

  const persistContent = async (collectionName: string, editId: string | null, payload: any) => {
    setSavingContent(true);
    try {
      if (editId) {
        await updateDoc(doc(db, collectionName, editId), payload);
      } else {
        await addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp() });
      }
      closeContentForm();
    } catch (e: any) {
      Alert.alert(t('Erreur'), e?.message || t("Impossible d'enregistrer."));
    } finally {
      setSavingContent(false);
    }
  };

  const saveContent = async () => {
    const { kind, editId, name, category, location, phone, image, photos, schedule, date, endDate, description, mapLink, facebook, website, latitude, longitude, hotels } = contentForm;
    if (!name.trim() || !category.trim() || !location.trim()) {
      Alert.alert(t('Erreur'), t('Le nom, la catégorie et le lieu sont requis.'));
      return;
    }
    const cleanHotels = hotels
      .map(h => ({ name: h.name.trim(), url: h.url.trim() }))
      .filter(h => h.name && h.url);
    if (hotels.some(h => (h.name.trim() && !h.url.trim()) || (!h.name.trim() && h.url.trim()))) {
      Alert.alert(t('Erreur'), t('Chaque hôtel doit avoir un nom et un lien.'));
      return;
    }
    const collectionName = CONTENT_COLLECTION[kind];
    const payload: any = { name: name.trim(), category: category.trim(), location: location.trim(), description: description.trim() };
    if (phone.trim()) payload.phone = phone.trim();
    if (image.trim()) payload.image = image.trim();
    if (kind === 'attractions' && photos.trim()) {
      payload.photos = photos.split(',').map(u => u.trim()).filter(Boolean);
    }
    if (kind === 'attractions' && schedule.trim()) payload.schedule = schedule.trim();
    if (kind === 'events' && date.trim()) payload.date = date.trim();
    if (kind === 'events') payload.endDate = endDate.trim() || null;
    if (mapLink.trim()) payload.mapLink = mapLink.trim();
    if (facebook.trim()) payload.facebook = facebook.trim();
    if (website.trim()) payload.website = website.trim();
    if (latitude !== null && longitude !== null) {
      payload.latitude = latitude;
      payload.longitude = longitude;
    }
    if (kind === 'attractions') payload.hotels = cleanHotels;

    if (!editId) {
      const existing = kind === 'events' ? events : attractions;
      const dupes = existing
        .map(b => ({ ...b, _exact: isSameIgnoringSpacesAndPunct(b.name, payload.name), _score: diceSimilarity(b.name, payload.name), _wordScore: wordOverlapScore(b.name, payload.name) }))
        .filter(b => b._exact || b._score >= DUPE_THRESHOLD || b._wordScore >= WORD_OVERLAP_THRESHOLD);
      if (dupes.length > 0) {
        const dupeNote = dupes.map(b => `"${b.name}"${b._exact ? t(' (identique)') : b._score >= DUPE_THRESHOLD ? t(' (très similaire)') : t(' (faute probable)')}`).join(', ');
        confirmDialog(
          t('Doublon détecté'),
          `${t('Doublon avec :')} ${dupeNote}`,
          t('Enregistrer quand même'),
          t('Annuler'),
          () => persistContent(collectionName, editId, payload)
        );
        return;
      }
    }

    await persistContent(collectionName, editId, payload);
  };

  const deleteContent = (kind: ContentKind, item: any) => {
    const collectionName = CONTENT_COLLECTION[kind];
    Alert.alert(t('Supprimer?'), `"${item.name}"${t(' sera supprimé définitivement.')}`, [
      { text: t('Annuler'), style: 'cancel' },
      {
        text: t('Supprimer'), style: 'destructive', onPress: async () => {
          setActionId(item.id);
          try {
            await deleteDoc(doc(db, collectionName, item.id));
          } catch {
            Alert.alert(t('Erreur'), t('Impossible de supprimer.'));
          } finally { setActionId(null); }
        },
      },
    ]);
  };

  // ── Useful numbers actions ──────────────────────────────────────────────
  const openAddNumber = () => setNumberForm(emptyNumberForm());
  const openEditNumber = (item: any) => setNumberForm({
    visible: true, editId: item.id,
    label: item.label || '', number: item.number || '', group: item.group || '',
    icon: item.icon || 'call-outline', order: typeof item.order === 'number' ? String(item.order) : '',
  });
  const closeNumberForm = () => setNumberForm(prev => ({ ...prev, visible: false }));

  const saveNumber = async () => {
    const { editId, label, number, group, icon, order } = numberForm;
    if (!label.trim() || !number.trim() || !group.trim()) {
      Alert.alert(t('Erreur'), t('Le libellé et le numéro sont requis.'));
      return;
    }
    const payload: any = {
      label: label.trim(), number: number.trim(), group: group.trim(),
      icon: icon.trim() || 'call-outline', order: parseInt(order) || 0,
    };
    setSavingInfo(true);
    try {
      if (editId) {
        await updateDoc(doc(db, 'usefulNumbers', editId), payload);
      } else {
        await addDoc(collection(db, 'usefulNumbers'), { ...payload, createdAt: serverTimestamp() });
      }
      closeNumberForm();
    } catch (e: any) {
      Alert.alert(t('Erreur'), e?.message || t("Impossible d'enregistrer."));
    } finally {
      setSavingInfo(false);
    }
  };

  const deleteNumber = (item: any) => {
    Alert.alert(t('Supprimer ce numéro?'), `"${item.label}"${t(' sera supprimé définitivement.')}`, [
      { text: t('Annuler'), style: 'cancel' },
      {
        text: t('Supprimer'), style: 'destructive', onPress: async () => {
          setActionId(item.id);
          try {
            await deleteDoc(doc(db, 'usefulNumbers', item.id));
          } catch {
            Alert.alert(t('Erreur'), t('Impossible de supprimer.'));
          } finally { setActionId(null); }
        },
      },
    ]);
  };

  // ── Official sites actions ──────────────────────────────────────────────
  const openAddSite = () => setSiteForm(emptySiteForm());
  const openEditSite = (item: any) => setSiteForm({
    visible: true, editId: item.id,
    name: item.name || '', website: item.website || '', facebook: item.facebook || '',
    description: item.description || '', icon: item.icon || 'business-outline',
    order: typeof item.order === 'number' ? String(item.order) : '',
  });
  const closeSiteForm = () => setSiteForm(prev => ({ ...prev, visible: false }));

  const saveSite = async () => {
    const { editId, name, website, facebook, description, icon, order } = siteForm;
    if (!name.trim()) {
      Alert.alert(t('Erreur'), t('Le nom est requis.'));
      return;
    }
    const payload: any = {
      name: name.trim(), description: description.trim(),
      icon: icon.trim() || 'business-outline', order: parseInt(order) || 0,
    };
    if (website.trim()) payload.website = website.trim();
    if (facebook.trim()) payload.facebook = facebook.trim();
    setSavingInfo(true);
    try {
      if (editId) {
        await updateDoc(doc(db, 'officialSites', editId), payload);
      } else {
        await addDoc(collection(db, 'officialSites'), { ...payload, createdAt: serverTimestamp() });
      }
      closeSiteForm();
    } catch (e: any) {
      Alert.alert(t('Erreur'), e?.message || t("Impossible d'enregistrer."));
    } finally {
      setSavingInfo(false);
    }
  };

  const deleteSite = (item: any) => {
    Alert.alert(t('Supprimer ce site?'), `"${item.name}"${t(' sera supprimé définitivement.')}`, [
      { text: t('Annuler'), style: 'cancel' },
      {
        text: t('Supprimer'), style: 'destructive', onPress: async () => {
          setActionId(item.id);
          try {
            await deleteDoc(doc(db, 'officialSites', item.id));
          } catch {
            Alert.alert(t('Erreur'), t('Impossible de supprimer.'));
          } finally { setActionId(null); }
        },
      },
    ]);
  };

  // ── Useful applications actions ─────────────────────────────────────────
  const openAddApp = () => setAppForm(emptyAppForm());
  const openEditApp = (item: any) => setAppForm({
    visible: true, editId: item.id,
    name: item.name || '', category: item.category || '', description: item.description || '',
    image: item.image || '', androidUrl: item.androidUrl || '', iosUrl: item.iosUrl || '', website: item.website || '',
    order: typeof item.order === 'number' ? String(item.order) : '',
  });
  const closeAppForm = () => setAppForm(prev => ({ ...prev, visible: false }));

  const saveApp = async () => {
    const { editId, name, category, description, image, androidUrl, iosUrl, website, order } = appForm;
    if (!name.trim() || !category.trim()) {
      Alert.alert(t('Erreur'), t('Le nom et la catégorie sont requis.'));
      return;
    }
    const payload: any = {
      name: name.trim(), category: category.trim(), description: description.trim(),
      order: parseInt(order) || 0,
    };
    if (image.trim()) payload.image = image.trim();
    if (androidUrl.trim()) payload.androidUrl = androidUrl.trim();
    if (iosUrl.trim()) payload.iosUrl = iosUrl.trim();
    if (website.trim()) payload.website = website.trim();
    setSavingInfo(true);
    try {
      if (editId) {
        await updateDoc(doc(db, 'usefulApps', editId), payload);
      } else {
        await addDoc(collection(db, 'usefulApps'), { ...payload, createdAt: serverTimestamp() });
      }
      closeAppForm();
    } catch (e: any) {
      Alert.alert(t('Erreur'), e?.message || t("Impossible d'enregistrer."));
    } finally {
      setSavingInfo(false);
    }
  };

  const deleteApp = (item: any) => {
    Alert.alert(t('Supprimer cette application?'), `"${item.name}"${t(' sera supprimée définitivement.')}`, [
      { text: t('Annuler'), style: 'cancel' },
      {
        text: t('Supprimer'), style: 'destructive', onPress: async () => {
          setActionId(item.id);
          try {
            await deleteDoc(doc(db, 'usefulApps', item.id));
          } catch {
            Alert.alert(t('Erreur'), t('Impossible de supprimer.'));
          } finally { setActionId(null); }
        },
      },
    ]);
  };

  // ── Business actions ────────────────────────────────────────────────────
  const approveBusiness = (item: any) => {
    const dupes = approvedBiz
      .filter(b => b.id !== item.id && b.city === item.city)
      .map(b => ({ ...b, _exact: isSameIgnoringSpacesAndPunct(b.name, item.name), _score: diceSimilarity(b.name, item.name), _wordScore: wordOverlapScore(b.name, item.name) }))
      .filter(b => b._exact || b._score >= DUPE_THRESHOLD || b._wordScore >= WORD_OVERLAP_THRESHOLD);
    const dupeNote = dupes.length > 0
      ? `\n\n${t('Doublon avec :')} ${dupes.map(b => `"${b.name}"${b._exact ? t(' (identique)') : b._score >= DUPE_THRESHOLD ? t(' (très similaire)') : t(' (faute probable)')}`).join(', ')}`
      : '';
    confirmDialog(
      dupes.length > 0 ? t('Doublon détecté') : t('Approuver cette entreprise?'),
      `"${item.name}"${t(" apparaîtra dans l'annuaire.")}${dupeNote}`,
      t('Approuver'),
      t('Annuler'),
      async () => {
        setActionId(item.id);
        try {
          await updateDoc(doc(db, 'businesses', item.id), { status: 'approved' });
        } catch (e: any) {
          Alert.alert(t('Erreur'), e?.message || t("Impossible d'approuver."));
        } finally { setActionId(null); }
      }
    );
  };

  const rejectBusiness = (item: any) => {
    confirmDialog(
      t('Rejeter cette entreprise?'),
      `"${item.name}"${t(' sera supprimée définitivement.')}`,
      t('Rejeter'),
      t('Annuler'),
      async () => {
        setActionId(item.id);
        try {
          await deleteDoc(doc(db, 'businesses', item.id));
        } catch (e: any) {
          Alert.alert(t('Erreur'), e?.message || t('Impossible de rejeter.'));
        } finally { setActionId(null); }
      }
    );
  };

  const revokeBusiness = (item: any) => {
    confirmDialog(
      t('Retirer de l\'annuaire?'),
      `"${item.name}"${t(' ne sera plus visible.')}`,
      t('Retirer'),
      t('Annuler'),
      async () => {
        setActionId(item.id);
        try {
          await updateDoc(doc(db, 'businesses', item.id), { status: 'pending' });
        } catch (e: any) {
          Alert.alert(t('Erreur'), e?.message || t('Impossible.'));
        } finally { setActionId(null); }
      }
    );
  };

  // ── Product actions ─────────────────────────────────────────────────────
  const approveProduct = (item: any) => {
    confirmDialog(
      t('Approuver ce produit?'),
      `"${item.name}"${t(' apparaîtra dans le marché.')}`,
      t('Approuver'),
      t('Annuler'),
      async () => {
        setActionId(item.id);
        try {
          await updateDoc(doc(db, 'products', item.id), { status: 'approved' });
        } catch (e: any) {
          Alert.alert(t('Erreur'), e?.message || t("Impossible d'approuver."));
        } finally { setActionId(null); }
      }
    );
  };

  const rejectProduct = (item: any) => {
    confirmDialog(
      t('Rejeter ce produit?'),
      `"${item.name}"${t(' sera supprimé définitivement.')}`,
      t('Rejeter'),
      t('Annuler'),
      async () => {
        setActionId(item.id);
        try {
          await deleteDoc(doc(db, 'products', item.id));
        } catch (e: any) {
          Alert.alert(t('Erreur'), e?.message || t('Impossible de rejeter.'));
        } finally { setActionId(null); }
      }
    );
  };

  const revokeProduct = (item: any) => {
    confirmDialog(
      t('Retirer du marché?'),
      `"${item.name}"${t(' ne sera plus visible.')}`,
      t('Retirer'),
      t('Annuler'),
      async () => {
        setActionId(item.id);
        try {
          await updateDoc(doc(db, 'products', item.id), { status: 'pending' });
        } catch (e: any) {
          Alert.alert(t('Erreur'), e?.message || t('Impossible.'));
        } finally { setActionId(null); }
      }
    );
  };

  // ── User actions ────────────────────────────────────────────────────────
  const approveUser = (item: any) => {
    Alert.alert(t('Approuver ce vendeur?'), `${item.name}${t(' pourra soumettre des entreprises.')}`, [
      { text: t('Annuler'), style: 'cancel' },
      {
        text: t('Approuver'), onPress: async () => {
          setActionId(item.id);
          try {
            await updateDoc(doc(db, 'users', item.id), { role: 'vendor' });
          } catch (e: any) {
            Alert.alert(t('Erreur'), e?.message || t("Impossible d'approuver."));
          } finally { setActionId(null); }
        },
      },
    ]);
  };

  const rejectUser = (item: any) => {
    Alert.alert(t('Rejeter ce vendeur?'), `${t('Le compte de')} ${item.name}${t(' sera supprimé.')}`, [
      { text: t('Annuler'), style: 'cancel' },
      {
        text: t('Rejeter'), style: 'destructive', onPress: async () => {
          setActionId(item.id);
          try {
            await deleteDoc(doc(db, 'users', item.id));
          } catch (e: any) {
            Alert.alert(t('Erreur'), e?.message || t('Impossible de rejeter.'));
          } finally { setActionId(null); }
        },
      },
    ]);
  };

  const revokeUser = (item: any) => {
    Alert.alert(t('Révoquer ce vendeur?'), `${item.name}${t(' repassera en "En attente".')}`, [
      { text: t('Annuler'), style: 'cancel' },
      {
        text: t('Révoquer'), style: 'destructive', onPress: async () => {
          setActionId(item.id);
          try {
            await updateDoc(doc(db, 'users', item.id), { role: 'pending' });
          } catch (e: any) {
            Alert.alert(t('Erreur'), e?.message || t('Impossible.'));
          } finally { setActionId(null); }
        },
      },
    ]);
  };

  // ── RENDER CARDS ────────────────────────────────────────────────────────
  const renderPendingBusiness = ({ item }: { item: any }) => {
    const dupes = approvedBiz
      .filter(b => b.city === item.city)
      .map(b => ({ ...b, _exact: isSameIgnoringSpacesAndPunct(b.name, item.name), _score: diceSimilarity(b.name, item.name), _wordScore: wordOverlapScore(b.name, item.name) }))
      .filter(b => b._exact || b._score >= DUPE_THRESHOLD || b._wordScore >= WORD_OVERLAP_THRESHOLD);
    return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: dupes.length > 0 ? '#FFB300' : theme.border, borderWidth: dupes.length > 0 ? 2 : 1 }]}>
      {dupes.length > 0 && (
        <View style={styles.dupeBanner}>
          <MaterialIcons name="warning" size={14} color="#E65100" />
          <Text style={styles.dupeBannerText}>
            {dupes.some(b => b._exact) ? t('Nom quasi-identique') : t('Doublon possible')}{' — '}
            {dupes.map(b => `"${b.name}"${b._exact ? t(' (identique)') : b._score >= DUPE_THRESHOLD ? t(' (très similaire)') : t(' (faute probable)')}`).join(', ')}
          </Text>
        </View>
      )}
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: Colors.cta + '33' }]}>
          <Text style={styles.avatarText}>{(item.name || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.category}</Text>
            <MaterialIcons name="place" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.city}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="person" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.ownerName}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="phone" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.phone}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: Colors.cta + '22' }]}>
          <Text style={[styles.badgeText, { color: Colors.cta }]}>{t('En attente')}</Text>
        </View>
      </View>
      {item.description ? (
        <Text style={[styles.desc, { color: theme.textSecondary }]} numberOfLines={2}>{item.description}</Text>
      ) : null}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.rejectBtn]}
          onPress={() => rejectBusiness(item)}
          disabled={actionId === item.id}
        >
          {actionId === item.id
            ? <ActivityIndicator size="small" color="#D32F2F" />
            : <><MaterialIcons name="close" size={14} color="#D32F2F" /><Text style={styles.rejectText}>{t('Rejeter')}</Text></>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => approveBusiness(item)}
          disabled={actionId === item.id}
        >
          {actionId === item.id
            ? <ActivityIndicator size="small" color="#fff" />
            : <><MaterialIcons name="check" size={14} color="#fff" /><Text style={styles.approveText}>{t('Approuver')}</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  const renderApprovedBusiness = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary + '33' }]}>
          <Text style={styles.avatarText}>{(item.name || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.name, { color: theme.text, flex: 1 }]} numberOfLines={1}>{item.name}</Text>
            {item.verified && <MaterialIcons name="verified" size={16} color={Colors.primary} />}
            {item.pinned && <MaterialIcons name="push-pin" size={16} color={Colors.primary} />}
            {item.priority > 0 && (
              <View style={[styles.priorityBadge, { backgroundColor: Colors.cta + '22' }]}>
                <MaterialIcons name="star" size={11} color={Colors.cta} />
                <Text style={[styles.priorityText, { color: Colors.cta }]}>{item.priority}</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.category}</Text>
            <MaterialIcons name="place" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.city}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="person" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.ownerName}</Text>
          </View>
        </View>
        <View style={[styles.badge, { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '22' }]}>
          <MaterialIcons name="check-circle" size={12} color={Colors.primary} />
          <Text style={[styles.badgeText, { color: Colors.primary }]}>{t('Publié')}</Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: item.verified ? '#4CAF50' : 'transparent', borderColor: '#4CAF50' }]}
          onPress={async () => {
            try {
              await updateDoc(doc(db, 'businesses', item.id), { verified: !item.verified });
              Alert.alert(t('Succès'), item.verified ? t('Badge vérifié retiré') : t('Entreprise vérifiée'));
            } catch {
              Alert.alert(t('Erreur'), t('Impossible de modifier'));
            }
          }}
        >
          <MaterialIcons name="check" size={18} color={item.verified ? '#fff' : '#4CAF50'} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: item.pinned ? Colors.primary : 'transparent', borderColor: Colors.primary }]}
          onPress={async () => {
            try {
              await updateDoc(doc(db, 'businesses', item.id), { pinned: !item.pinned });
              Alert.alert(t('Succès'), item.pinned ? t('Épinglage retiré') : t('Entreprise épinglée'));
            } catch {
              Alert.alert(t('Erreur'), t('Impossible de modifier'));
            }
          }}
        >
          <MaterialIcons name="push-pin" size={16} color={item.pinned ? '#fff' : Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionBtn, { borderColor: Colors.cta }]}
          onPress={() => setPriorityModal({ visible: true, item, value: String(item.priority || 0), collection: 'businesses' })}
        >
          <MaterialIcons name="star" size={16} color={Colors.cta} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickActionBtn, { backgroundColor: item.relatedBusinessId ? Colors.primary : 'transparent', borderColor: Colors.primary }]}
          onPress={() => setLinkModal({ visible: true, item, search: '' })}
        >
          <MaterialIcons name="link" size={16} color={item.relatedBusinessId ? '#fff' : Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editAdminBtn, { borderColor: Colors.cta, backgroundColor: Colors.cta + '22' }]}
          onPress={() => router.push(`/vendor/edit-business?id=${item.id}`)}
        >
          <MaterialIcons name="edit" size={14} color={Colors.cta} />
          <Text style={[styles.editAdminText, { color: Colors.cta }]}>{t('Modifier')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.revokeBtn, { borderColor: theme.border }]}
          onPress={() => revokeBusiness(item)}
          disabled={actionId === item.id}
        >
          {actionId === item.id
            ? <ActivityIndicator size="small" color={theme.textSecondary} />
            : <><MaterialIcons name="block" size={13} color={theme.textSecondary} /><Text style={[styles.revokeText, { color: theme.textSecondary }]}>{t('Retirer')}</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPendingProduct = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: Colors.cta + '33' }]}>
          <Text style={styles.avatarText}>{(item.name || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.category}</Text>
            <MaterialIcons name="place" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.city}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="sell" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{Number(item.price || 0).toLocaleString('fr-FR')} FCFA</Text>
            {item.negotiable && (
              <View style={[styles.priorityBadge, { backgroundColor: '#E8F5E9' }]}>
                <Text style={[styles.priorityText, { color: '#1B5E20' }]}>{t('Négociable')}</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="person" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.ownerName}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="phone" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.phone}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: Colors.cta + '22' }]}>
          <Text style={[styles.badgeText, { color: Colors.cta }]}>{t('En attente')}</Text>
        </View>
      </View>
      {item.description ? (
        <Text style={[styles.desc, { color: theme.textSecondary }]} numberOfLines={2}>{item.description}</Text>
      ) : null}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => rejectProduct(item)}
          disabled={actionId === item.id}
        >
          {actionId === item.id
            ? <ActivityIndicator size="small" color="#D32F2F" />
            : <><MaterialIcons name="close" size={14} color="#D32F2F" /><Text style={styles.rejectText}>{t('Rejeter')}</Text></>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => approveProduct(item)}
          disabled={actionId === item.id}
        >
          {actionId === item.id
            ? <ActivityIndicator size="small" color="#fff" />
            : <><MaterialIcons name="check" size={14} color="#fff" /><Text style={styles.approveText}>{t('Approuver')}</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderApprovedProduct = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary + '33' }]}>
          <Text style={styles.avatarText}>{(item.name || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text, flex: 1 }]} numberOfLines={1}>{item.name}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.category}</Text>
            <MaterialIcons name="place" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.city}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="sell" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{Number(item.price || 0).toLocaleString('fr-FR')} FCFA</Text>
            {item.negotiable && (
              <View style={[styles.priorityBadge, { backgroundColor: '#E8F5E9' }]}>
                <Text style={[styles.priorityText, { color: '#1B5E20' }]}>{t('Négociable')}</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="person" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.ownerName}</Text>
          </View>
        </View>
        <View style={[styles.badge, { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '22' }]}>
          <MaterialIcons name="check-circle" size={12} color={Colors.primary} />
          <Text style={[styles.badgeText, { color: Colors.primary }]}>{t('Publié')}</Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.editAdminBtn, { borderColor: Colors.cta, backgroundColor: Colors.cta + '22' }]}
          onPress={() => router.push(`/vendor/edit-product?id=${item.id}`)}
        >
          <MaterialIcons name="edit" size={14} color={Colors.cta} />
          <Text style={[styles.editAdminText, { color: Colors.cta }]}>{t('Modifier')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.revokeBtn, { borderColor: theme.border }]}
          onPress={() => revokeProduct(item)}
          disabled={actionId === item.id}
        >
          {actionId === item.id
            ? <ActivityIndicator size="small" color={theme.textSecondary} />
            : <><MaterialIcons name="block" size={13} color={theme.textSecondary} /><Text style={[styles.revokeText, { color: theme.textSecondary }]}>{t('Retirer')}</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPendingUser = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: Colors.cta + '33' }]}>
          <Text style={styles.avatarText}>{(item.name || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <View style={styles.metaRow}>
            <MaterialIcons name="email" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.email}</Text>
          </View>
          {item.phone && (
            <View style={styles.metaRow}>
              <MaterialIcons name="phone" size={12} color={theme.textSecondary} />
              <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.phone}</Text>
            </View>
          )}
          {item.createdAt && (
            <View style={styles.metaRow}>
              <MaterialIcons name="event" size={12} color={theme.textSecondary} />
              <Text style={[styles.meta, { color: theme.textSecondary }]}>
                {(item.createdAt?.toDate?.() ?? new Date(item.createdAt)).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}
        </View>
        <View style={[styles.badge, { backgroundColor: Colors.cta + '22' }]}>
          <Text style={[styles.badgeText, { color: Colors.cta }]}>{t('En attente')}</Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => rejectUser(item)}
          disabled={actionId === item.id}
        >
          {actionId === item.id
            ? <ActivityIndicator size="small" color="#D32F2F" />
            : <><MaterialIcons name="close" size={14} color="#D32F2F" /><Text style={styles.rejectText}>{t('Rejeter')}</Text></>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => approveUser(item)}
          disabled={actionId === item.id}
        >
          {actionId === item.id
            ? <ActivityIndicator size="small" color="#fff" />
            : <><MaterialIcons name="check" size={14} color="#fff" /><Text style={styles.approveText}>{t('Approuver')}</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderApprovedUser = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary + '33' }]}>
          <Text style={styles.avatarText}>{(item.name || '?')[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <View style={styles.metaRow}>
            <MaterialIcons name="email" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.email}</Text>
          </View>
          {item.phone && (
            <View style={styles.metaRow}>
              <MaterialIcons name="phone" size={12} color={theme.textSecondary} />
              <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.phone}</Text>
            </View>
          )}
        </View>
        <View style={[styles.badge, { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary + '22' }]}>
          <MaterialIcons name="check-circle" size={12} color={Colors.primary} />
          <Text style={[styles.badgeText, { color: Colors.primary }]}>{t('Vendeur')}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.revokeBtn, { borderColor: theme.border }]}
        onPress={() => revokeUser(item)}
        disabled={actionId === item.id}
      >
        {actionId === item.id
          ? <ActivityIndicator size="small" color={theme.textSecondary} />
          : <><MaterialIcons name="block" size={13} color={theme.textSecondary} /><Text style={[styles.revokeText, { color: theme.textSecondary }]}>{t('Révoquer le vendeur')}</Text></>
        }
      </TouchableOpacity>
    </View>
  );

  const renderContentItem = (kind: ContentKind) => ({ item }: { item: any }) => {
    const contentDupes = (kind === 'events' ? events : attractions)
      .filter(b => b.id !== item.id)
      .map(b => ({ ...b, _exact: isSameIgnoringSpacesAndPunct(b.name, item.name), _score: diceSimilarity(b.name, item.name), _wordScore: wordOverlapScore(b.name, item.name) }))
      .filter(b => b._exact || b._score >= DUPE_THRESHOLD || b._wordScore >= WORD_OVERLAP_THRESHOLD);
    return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: contentDupes.length > 0 ? '#FFB300' : theme.border, borderWidth: contentDupes.length > 0 ? 2 : 1 }]}>
      {contentDupes.length > 0 && (
        <View style={styles.dupeBanner}>
          <MaterialIcons name="warning" size={14} color="#E65100" />
          <Text style={styles.dupeBannerText}>
            {contentDupes.some(b => b._exact) ? t('Nom quasi-identique') : t('Doublon possible')}{' — '}
            {contentDupes.map(b => `"${b.name}"${b._exact ? t(' (identique)') : b._score >= DUPE_THRESHOLD ? t(' (très similaire)') : t(' (faute probable)')}`).join(', ')}
          </Text>
        </View>
      )}
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary + '33' }]}>
          <MaterialIcons name={kind === 'events' ? 'event' : 'photo-camera'} size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.name, { color: theme.text, flex: 1 }]} numberOfLines={1}>{item.name}</Text>
            {item.priority > 0 && (
              <View style={[styles.priorityBadge, { backgroundColor: Colors.cta + '22' }]}>
                <MaterialIcons name="star" size={11} color={Colors.cta} />
                <Text style={[styles.priorityText, { color: Colors.cta }]}>{item.priority}</Text>
              </View>
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.category}</Text>
            <MaterialIcons name="place" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.location}</Text>
          </View>
          {kind === 'events' && item.date ? (
            <View style={styles.metaRow}>
              <MaterialIcons name="event" size={12} color={theme.textSecondary} />
              <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.date}</Text>
            </View>
          ) : null}
        </View>
      </View>
      {item.description ? (
        <Text style={[styles.desc, { color: theme.textSecondary }]} numberOfLines={2}>{item.description}</Text>
      ) : null}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.quickActionBtn, { borderColor: Colors.cta }]}
          onPress={() => setPriorityModal({ visible: true, item, value: String(item.priority || 0), collection: CONTENT_COLLECTION[kind] })}
        >
          <MaterialIcons name="star" size={16} color={Colors.cta} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.editAdminBtn, { borderColor: Colors.cta, backgroundColor: Colors.cta + '22' }]}
          onPress={() => openEditContent(kind, item)}
        >
          <MaterialIcons name="edit" size={14} color={Colors.cta} />
          <Text style={[styles.editAdminText, { color: Colors.cta }]}>{t('Modifier')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => deleteContent(kind, item)}
          disabled={actionId === item.id}
        >
          {actionId === item.id
            ? <ActivityIndicator size="small" color="#D32F2F" />
            : <><MaterialIcons name="delete-outline" size={14} color="#D32F2F" /><Text style={styles.rejectText}>{t('Supprimer')}</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
    );
  };

  const renderNumberItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary + '33' }]}>
          <Ionicons name={(item.icon || 'call-outline') as any} size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.label}</Text>
          <View style={styles.metaRow}>
            <MaterialIcons name="phone" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.number}</Text>
          </View>
          <View style={styles.metaRow}>
            <MaterialIcons name="folder" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.group}</Text>
          </View>
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.editAdminBtn, { borderColor: Colors.cta, backgroundColor: Colors.cta + '22' }]}
          onPress={() => openEditNumber(item)}
        >
          <MaterialIcons name="edit" size={14} color={Colors.cta} />
          <Text style={[styles.editAdminText, { color: Colors.cta }]}>{t('Modifier')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => deleteNumber(item)}
          disabled={actionId === item.id}
        >
          {actionId === item.id
            ? <ActivityIndicator size="small" color="#D32F2F" />
            : <><MaterialIcons name="delete-outline" size={14} color="#D32F2F" /><Text style={styles.rejectText}>{t('Supprimer')}</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSiteItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary + '33' }]}>
          <Ionicons name={(item.icon || 'business-outline') as any} size={20} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
          {item.website ? (
            <View style={styles.metaRow}>
              <MaterialIcons name="language" size={12} color={theme.textSecondary} />
              <Text style={[styles.meta, { color: theme.textSecondary }]} numberOfLines={1}>{item.website}</Text>
            </View>
          ) : null}
          {item.facebook ? (
            <View style={styles.metaRow}>
              <MaterialIcons name="facebook" size={12} color={theme.textSecondary} />
              <Text style={[styles.meta, { color: theme.textSecondary }]} numberOfLines={1}>{item.facebook}</Text>
            </View>
          ) : null}
        </View>
      </View>
      {item.description ? (
        <Text style={[styles.desc, { color: theme.textSecondary }]} numberOfLines={2}>{item.description}</Text>
      ) : null}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.editAdminBtn, { borderColor: Colors.cta, backgroundColor: Colors.cta + '22' }]}
          onPress={() => openEditSite(item)}
        >
          <MaterialIcons name="edit" size={14} color={Colors.cta} />
          <Text style={[styles.editAdminText, { color: Colors.cta }]}>{t('Modifier')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => deleteSite(item)}
          disabled={actionId === item.id}
        >
          {actionId === item.id
            ? <ActivityIndicator size="small" color="#D32F2F" />
            : <><MaterialIcons name="delete-outline" size={14} color="#D32F2F" /><Text style={styles.rejectText}>{t('Supprimer')}</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAppItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: Colors.primary + '33', overflow: 'hidden' }]}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <Ionicons name="apps" size={20} color={Colors.primary} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
          <View style={styles.metaRow}>
            <MaterialIcons name="category" size={12} color={theme.textSecondary} />
            <Text style={[styles.meta, { color: theme.textSecondary }]}>{item.category}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
            {item.androidUrl ? <Ionicons name="logo-google-playstore" size={13} color={theme.textSecondary} /> : null}
            {item.iosUrl ? <Ionicons name="logo-apple-appstore" size={13} color={theme.textSecondary} /> : null}
          </View>
        </View>
      </View>
      {item.description ? (
        <Text style={[styles.desc, { color: theme.textSecondary }]} numberOfLines={2}>{item.description}</Text>
      ) : null}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.editAdminBtn, { borderColor: Colors.cta, backgroundColor: Colors.cta + '22' }]}
          onPress={() => openEditApp(item)}
        >
          <MaterialIcons name="edit" size={14} color={Colors.cta} />
          <Text style={[styles.editAdminText, { color: Colors.cta }]}>{t('Modifier')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => deleteApp(item)}
          disabled={actionId === item.id}
        >
          {actionId === item.id
            ? <ActivityIndicator size="small" color="#D32F2F" />
            : <><MaterialIcons name="delete-outline" size={14} color="#D32F2F" /><Text style={styles.rejectText}>{t('Supprimer')}</Text></>
          }
        </TouchableOpacity>
      </View>
    </View>
  );

  if (authLoading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;
  if (!isAdmin) return null;

  const totalPending = pendingBiz.length + pendingUsers.length;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={(theme.backgroundGradient || [theme.background, theme.background]) as [string, string, ...string[]]}
        style={{ flex: 1 }}
      >

      {/* HEADER */}
      <LinearGradient
        colors={Colors.headerGradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <MaterialIcons name="admin-panel-settings" size={22} color="#fff" />
            <View>
              <Text style={styles.headerTitle}>Admin Panel</Text>
              <Text style={styles.headerSub}>BurkinaBizz</Text>
            </View>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{pendingBiz.length}</Text>
            <Text style={styles.statLbl}>{t('Entreprises en attente')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{pendingProducts.length}</Text>
            <Text style={styles.statLbl}>{t('Produits en attente')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{pendingUsers.length}</Text>
            <Text style={styles.statLbl}>{t('Vendeurs en attente')}</Text>
          </View>
        </View>
      </LinearGradient>


      {/* MAIN TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.mainTabRow, { borderColor: theme.border }]}
        contentContainerStyle={styles.mainTabRowContent}
      >
        <TouchableOpacity
          style={[styles.mainTabBtn, tab === 'businesses' && { borderBottomColor: Colors.primary, borderBottomWidth: 2.5 }]}
          onPress={() => setTab('businesses')}
        >
          <View style={styles.tabInner}>
            <MaterialIcons name="storefront" size={16} color={tab === 'businesses' ? Colors.primary : theme.textSecondary} />
            <Text style={[styles.mainTabText, { color: tab === 'businesses' ? Colors.primary : theme.textSecondary }]}>
              {t('Entreprises')} {pendingBiz.length > 0 ? `(${pendingBiz.length})` : ''}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTabBtn, tab === 'products' && { borderBottomColor: Colors.cta, borderBottomWidth: 2.5 }]}
          onPress={() => setTab('products')}
        >
          <View style={styles.tabInner}>
            <MaterialIcons name="sell" size={16} color={tab === 'products' ? Colors.cta : theme.textSecondary} />
            <Text style={[styles.mainTabText, { color: tab === 'products' ? Colors.cta : theme.textSecondary }]}>
              {t('Produits')} {pendingProducts.length > 0 ? `(${pendingProducts.length})` : ''}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTabBtn, tab === 'users' && { borderBottomColor: Colors.cta, borderBottomWidth: 2.5 }]}
          onPress={() => setTab('users')}
        >
          <View style={styles.tabInner}>
            <MaterialIcons name="people" size={16} color={tab === 'users' ? Colors.cta : theme.textSecondary} />
            <Text style={[styles.mainTabText, { color: tab === 'users' ? Colors.cta : theme.textSecondary }]}>
              {t('Vendeurs')} {pendingUsers.length > 0 ? `(${pendingUsers.length})` : ''}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTabBtn, tab === 'reports' && { borderBottomColor: '#D32F2F', borderBottomWidth: 2.5 }]}
          onPress={() => setTab('reports')}
        >
          <View style={styles.tabInner}>
            <MaterialIcons name="flag" size={16} color={tab === 'reports' ? '#D32F2F' : theme.textSecondary} />
            <Text style={[styles.mainTabText, { color: tab === 'reports' ? '#D32F2F' : theme.textSecondary }]}>
              {t('Signalements')} {reports.length > 0 ? `(${reports.length})` : ''}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTabBtn, tab === 'events' && { borderBottomColor: '#8A6D1F', borderBottomWidth: 2.5 }]}
          onPress={() => setTab('events')}
        >
          <View style={styles.tabInner}>
            <MaterialIcons name="event" size={16} color={tab === 'events' ? '#8A6D1F' : theme.textSecondary} />
            <Text style={[styles.mainTabText, { color: tab === 'events' ? '#8A6D1F' : theme.textSecondary }]}>
              {t('Événements')} {events.length > 0 ? `(${events.length})` : ''}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTabBtn, tab === 'attractions' && { borderBottomColor: '#B3492F', borderBottomWidth: 2.5 }]}
          onPress={() => setTab('attractions')}
        >
          <View style={styles.tabInner}>
            <MaterialIcons name="photo-camera" size={16} color={tab === 'attractions' ? '#B3492F' : theme.textSecondary} />
            <Text style={[styles.mainTabText, { color: tab === 'attractions' ? '#B3492F' : theme.textSecondary }]}>
              {t('Sites touristiques')} {attractions.length > 0 ? `(${attractions.length})` : ''}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTabBtn, tab === 'info' && { borderBottomColor: '#2E7D8F', borderBottomWidth: 2.5 }]}
          onPress={() => setTab('info')}
        >
          <View style={styles.tabInner}>
            <MaterialIcons name="info" size={16} color={tab === 'info' ? '#2E7D8F' : theme.textSecondary} />
            <Text style={[styles.mainTabText, { color: tab === 'info' ? '#2E7D8F' : theme.textSecondary }]}>
              {t('Informations')}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={[{ color: theme.textSecondary, marginTop: 8 }]}>{t('Chargement...')}</Text>
        </View>
      ) : null}

      {!loading && tab === 'businesses' && (
        <>
          {/* SEARCH BAR */}
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MaterialIcons name="search" size={16} color={theme.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={t('Rechercher une entreprise...')}
              placeholderTextColor={theme.textSecondary}
              value={bizSearch}
              onChangeText={setBizSearch}
              autoCorrect={false}
            />
            {bizSearch.length > 0 && (
              <TouchableOpacity onPress={() => setBizSearch('')}>
                <MaterialIcons name="close" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.subTabRow, { backgroundColor: theme.surface }]}>
            {(['pending', 'approved'] as const).map(st => (
              <TouchableOpacity key={st}
                style={[styles.subTabBtn, bizTab === st && { backgroundColor: Colors.primary }]}
                onPress={() => setBizTab(st)}>
                <Text style={[styles.subTabText, { color: bizTab === st ? '#fff' : theme.textSecondary }]}>
                  {st === 'pending' ? `${t('En attente')} (${pendingBiz.length})` : `${t('Publiées')} (${approvedBiz.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FlatList
            data={(bizTab === 'pending' ? pendingBiz : approvedBiz).filter(b => {
              if (!bizSearch.trim()) return true;
              const s = bizSearch.toLowerCase();
              return b.name.toLowerCase().includes(s) || 
                     b.ownerName?.toLowerCase().includes(s) ||
                     b.city?.toLowerCase().includes(s);
            })}
            keyExtractor={item => item.id}
            renderItem={bizTab === 'pending' ? renderPendingBusiness : renderApprovedBusiness}
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={Colors.primary} colors={[Colors.primary]} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name={bizSearch ? 'search-off' : bizTab === 'pending' ? 'celebration' : 'storefront'} size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  {bizSearch ? t('Aucun résultat') : bizTab === 'pending' ? t('Aucune entreprise en attente') : t('Aucune entreprise publiée')}
                </Text>
              </View>
            }
          />
        </>
      )}

      {!loading && tab === 'products' && (
        <>
          {/* SEARCH BAR */}
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MaterialIcons name="search" size={16} color={theme.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={t('Rechercher un produit ou un vendeur...')}
              placeholderTextColor={theme.textSecondary}
              value={productSearch}
              onChangeText={setProductSearch}
              autoCorrect={false}
            />
            {productSearch.length > 0 && (
              <TouchableOpacity onPress={() => setProductSearch('')}>
                <MaterialIcons name="close" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {productSearch.trim() ? (
            <Text style={[styles.searchHint, { color: theme.textSecondary }]}>
              {t('Résultats pour tous les statuts (en attente + publiés)')}
            </Text>
          ) : (
            <View style={[styles.subTabRow, { backgroundColor: theme.surface }]}>
              {(['pending', 'approved'] as const).map(st => (
                <TouchableOpacity key={st}
                  style={[styles.subTabBtn, productTab === st && { backgroundColor: Colors.primary }]}
                  onPress={() => setProductTab(st)}>
                  <Text style={[styles.subTabText, { color: productTab === st ? '#fff' : theme.textSecondary }]}>
                    {st === 'pending' ? `${t('En attente')} (${pendingProducts.length})` : `${t('Publiées')} (${approvedProducts.length})`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <FlatList
            data={(() => {
              const s = productSearch.trim().toLowerCase();
              // Searching looks across both pending and approved, so an admin can find
              // every product a given vendor has submitted regardless of approval status.
              const source = s ? [...pendingProducts, ...approvedProducts] : (productTab === 'pending' ? pendingProducts : approvedProducts);
              if (!s) return source;
              return source.filter(p =>
                p.name?.toLowerCase().includes(s) ||
                p.ownerName?.toLowerCase().includes(s) ||
                p.city?.toLowerCase().includes(s)
              );
            })()}
            keyExtractor={item => item.id}
            renderItem={productSearch.trim()
              ? (({ item }) => item.status === 'approved' ? renderApprovedProduct({ item }) : renderPendingProduct({ item }))
              : (productTab === 'pending' ? renderPendingProduct : renderApprovedProduct)}
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={Colors.primary} colors={[Colors.primary]} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name={productSearch ? 'search-off' : productTab === 'pending' ? 'celebration' : 'sell'} size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  {productSearch ? t('Aucun résultat') : productTab === 'pending' ? t('Aucun produit en attente') : t('Aucun produit publié')}
                </Text>
              </View>
            }
          />
        </>
      )}

      {!loading && tab === 'users' && (
        <>
          {/* SEARCH BAR */}
          <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MaterialIcons name="search" size={16} color={theme.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder={t('Rechercher un vendeur...')}
              placeholderTextColor={theme.textSecondary}
              value={userSearch}
              onChangeText={setUserSearch}
              autoCorrect={false}
            />
            {userSearch.length > 0 && (
              <TouchableOpacity onPress={() => setUserSearch('')}>
                <MaterialIcons name="close" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.subTabRow, { backgroundColor: theme.surface }]}>
            {(['pending', 'approved'] as const).map(st => (
              <TouchableOpacity key={st}
                style={[styles.subTabBtn, userTab === st && { backgroundColor: Colors.primary }]}
                onPress={() => setUserTab(st)}>
                <Text style={[styles.subTabText, { color: userTab === st ? '#fff' : theme.textSecondary }]}>
                  {st === 'pending' ? `${t('En attente')} (${pendingUsers.length})` : `${t('Approuvés')} (${approvedUsers.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <FlatList
            data={(userTab === 'pending' ? pendingUsers : approvedUsers).filter(u => {
              if (!userSearch.trim()) return true;
              const s = userSearch.toLowerCase();
              return u.name?.toLowerCase().includes(s) || 
                     u.email?.toLowerCase().includes(s) ||
                     u.phone?.toLowerCase().includes(s);
            })}
            keyExtractor={item => item.id}
            renderItem={userTab === 'pending' ? renderPendingUser : renderApprovedUser}
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={Colors.primary} colors={[Colors.primary]} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name={userSearch ? 'search-off' : userTab === 'pending' ? 'celebration' : 'people'} size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  {userSearch ? t('Aucun résultat') : userTab === 'pending' ? t('Aucun vendeur en attente') : t('Aucun vendeur approuvé')}
                </Text>
              </View>
            }
          />
        </>
      )}

      {!loading && tab === 'reports' && (
        <FlatList
          data={reports}
          keyExtractor={item => item.id}
          style={{ flex: 1 }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={Colors.primary} colors={[Colors.primary]} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: '#D32F2F33' }]}>
              <View style={styles.cardTop}>
                <MaterialIcons name="flag" size={26} color="#D32F2F" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: theme.text }]}>{item.businessName}</Text>
                  <Text style={[styles.meta, { color: theme.textSecondary }]}>{t('Motif:')} {item.reason}</Text>
                  <Text style={[styles.meta, { color: theme.textSecondary }]}>{t('Par:')} {item.reporterName}</Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.rejectBtn}
                  onPress={() => Alert.alert(t('Ignorer?'), '', [
                    { text: t('Annuler'), style: 'cancel' },
                    { text: t('Ignorer'), onPress: async () => { try { await deleteDoc(doc(db, 'reports', item.id)); } catch {} } },
                  ])}>
                  <MaterialIcons name="close" size={14} color="#D32F2F" />
                  <Text style={styles.rejectText}>{t('Ignorer')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.approveBtn, { backgroundColor: '#D32F2F' }]}
                  onPress={() => Alert.alert(t("Retirer l'annonce?"), `"${item.businessName}"${t(' sera remise en attente.')}`, [
                    { text: t('Annuler'), style: 'cancel' },
                    { text: t('Retirer'), style: 'destructive', onPress: async () => {
                      try {
                        await updateDoc(doc(db, 'businesses', item.businessId), { status: 'pending' });
                        await deleteDoc(doc(db, 'reports', item.id));
                      } catch {}
                    }},
                  ])}>
                  <MaterialIcons name="block" size={14} color="#fff" />
                  <Text style={styles.approveText}>{t('Retirer')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="check-circle" size={48} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.text }]}>{t('Aucun signalement en attente')}</Text>
            </View>
          }
        />
      )}

      {!loading && tab === 'events' && (
        <>
          <TouchableOpacity style={styles.addContentBtn} onPress={() => openAddContent('events')} activeOpacity={0.85}>
            <MaterialIcons name="add" size={18} color="#1A1A1A" />
            <Text style={styles.addContentBtnText}>{t('Ajouter un événement')}</Text>
          </TouchableOpacity>
          <FlatList
            data={events}
            keyExtractor={item => item.id}
            renderItem={renderContentItem('events')}
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={Colors.primary} colors={[Colors.primary]} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name="event-busy" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.text }]}>{t('Aucun événement')}</Text>
              </View>
            }
          />
        </>
      )}

      {!loading && tab === 'attractions' && (
        <>
          <TouchableOpacity style={styles.addContentBtn} onPress={() => openAddContent('attractions')} activeOpacity={0.85}>
            <MaterialIcons name="add" size={18} color="#1A1A1A" />
            <Text style={styles.addContentBtnText}>{t('Ajouter un site touristique')}</Text>
          </TouchableOpacity>
          <FlatList
            data={attractions}
            keyExtractor={item => item.id}
            renderItem={renderContentItem('attractions')}
            style={{ flex: 1 }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={Colors.primary} colors={[Colors.primary]} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <MaterialIcons name="photo-camera" size={48} color={theme.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.text }]}>{t('Aucun site touristique')}</Text>
              </View>
            }
          />
        </>
      )}

      {!loading && tab === 'info' && (
        <>
          <View style={[styles.subTabRow, { backgroundColor: theme.surface }]}>
            {(['numbers', 'sites', 'apps'] as const).map(st => (
              <TouchableOpacity key={st}
                style={[styles.subTabBtn, infoSubTab === st && { backgroundColor: Colors.primary }]}
                onPress={() => setInfoSubTab(st)}>
                <Text style={[styles.subTabText, { color: infoSubTab === st ? '#fff' : theme.textSecondary }]}>
                  {st === 'numbers' ? `${t('Numéros utiles')} (${usefulNumbers.length})` : st === 'sites' ? `${t('Sites officiels')} (${officialSites.length})` : `${t('Applications utiles')} (${usefulApps.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {infoSubTab === 'numbers' ? (
            <>
              <TouchableOpacity style={styles.addContentBtn} onPress={openAddNumber} activeOpacity={0.85}>
                <MaterialIcons name="add" size={18} color="#1A1A1A" />
                <Text style={styles.addContentBtnText}>{t('Ajouter un numéro')}</Text>
              </TouchableOpacity>
              <FlatList
                data={usefulNumbers}
                keyExtractor={item => item.id}
                renderItem={renderNumberItem}
                style={{ flex: 1 }}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={Colors.primary} colors={[Colors.primary]} />}
                ListEmptyComponent={
                  <View style={styles.empty}>
                    <MaterialIcons name="call" size={48} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.text }]}>{t('Aucun numéro utile')}</Text>
                  </View>
                }
              />
            </>
          ) : infoSubTab === 'sites' ? (
            <>
              <TouchableOpacity style={styles.addContentBtn} onPress={openAddSite} activeOpacity={0.85}>
                <MaterialIcons name="add" size={18} color="#1A1A1A" />
                <Text style={styles.addContentBtnText}>{t('Ajouter un site officiel')}</Text>
              </TouchableOpacity>
              <FlatList
                data={officialSites}
                keyExtractor={item => item.id}
                renderItem={renderSiteItem}
                style={{ flex: 1 }}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={Colors.primary} colors={[Colors.primary]} />}
                ListEmptyComponent={
                  <View style={styles.empty}>
                    <MaterialIcons name="account-balance" size={48} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.text }]}>{t('Aucun site officiel')}</Text>
                  </View>
                }
              />
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.addContentBtn} onPress={openAddApp} activeOpacity={0.85}>
                <MaterialIcons name="add" size={18} color="#1A1A1A" />
                <Text style={styles.addContentBtnText}>{t('Ajouter une application')}</Text>
              </TouchableOpacity>
              <FlatList
                data={usefulApps}
                keyExtractor={item => item.id}
                renderItem={renderAppItem}
                style={{ flex: 1 }}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={Colors.primary} colors={[Colors.primary]} />}
                ListEmptyComponent={
                  <View style={styles.empty}>
                    <MaterialIcons name="apps" size={48} color={theme.textSecondary} />
                    <Text style={[styles.emptyText, { color: theme.text }]}>{t('Aucune application')}</Text>
                  </View>
                }
              />
            </>
          )}
        </>
      )}

      {/* PRIORITY MODAL */}
      <Modal
        visible={priorityModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setPriorityModal({ visible: false, item: null, value: '', collection: priorityModal.collection })}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <View style={styles.modalTitleRow}>
              <MaterialIcons name="star" size={18} color={Colors.cta} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('Priorité')}</Text>
            </View>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              {t('Entrez un nombre entre 0 et 100')}{'\n'}{t('(Plus élevé = apparaît en premier)')}
            </Text>
            <TextInput
              style={[styles.modalInput, { borderColor: '#9CA3AF', color: theme.text, backgroundColor: '#fff' }]}
              value={priorityModal.value}
              onChangeText={v => setPriorityModal(prev => ({ ...prev, value: v }))}
              keyboardType="number-pad"
              maxLength={3}
              autoFocus
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: theme.border }]}
                onPress={() => setPriorityModal({ visible: false, item: null, value: '', collection: priorityModal.collection })}
              >
                <Text style={[styles.modalBtnText, { color: theme.textSecondary }]}>{t('Annuler')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.cta, borderColor: Colors.cta }]}
                onPress={async () => {
                  const num = parseInt(priorityModal.value || '0');
                  if (isNaN(num) || num < 0 || num > 100) {
                    Alert.alert(t('Erreur'), t('Entrez un nombre entre 0 et 100'));
                    return;
                  }
                  try {
                    await updateDoc(doc(db, priorityModal.collection, priorityModal.item.id), { priority: num });
                    setPriorityModal({ visible: false, item: null, value: '', collection: priorityModal.collection });
                    Alert.alert(t('Succès'), `${t('Priorité mise à')} ${num}`);
                  } catch {
                    Alert.alert(t('Erreur'), t('Impossible de modifier'));
                  }
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#1A1A1A', fontWeight: '400' }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD/EDIT EVENT OR ATTRACTION MODAL */}
      <Modal
        visible={contentForm.visible}
        transparent
        animationType="fade"
        onRequestClose={closeContentForm}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={[styles.modalOverlay, { padding: 16 }]}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, maxHeight: '85%', maxWidth: 640 }]}>
            <View style={styles.modalTitleRow}>
              <MaterialIcons name={contentForm.kind === 'events' ? 'event' : 'photo-camera'} size={18} color={Colors.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {contentForm.editId ? t('Modifier') : t('Ajouter')} {contentForm.kind === 'events' ? t('un événement') : t('un site touristique')}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Nom *')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={contentForm.name}
                onChangeText={v => setContentForm(prev => ({ ...prev, name: v }))}
                placeholder={t('Nom')}
                placeholderTextColor={theme.textSecondary}
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Catégorie *')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={contentForm.category}
                onChangeText={v => setContentForm(prev => ({ ...prev, category: v }))}
                placeholder={t('Ex : Culture, Musique, Nature...')}
                placeholderTextColor={theme.textSecondary}
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Lieu *')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={contentForm.location}
                onChangeText={v => setContentForm(prev => ({ ...prev, location: v }))}
                placeholder={t('Ex : Ouagadougou')}
                placeholderTextColor={theme.textSecondary}
              />
              {contentForm.kind === 'events' && (
                <>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Date')}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <TouchableOpacity
                      style={[styles.fieldInput, { flex: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                      onPress={() => setEventDatePickerVisible(true)}
                    >
                      <Text style={{ color: contentForm.date ? theme.text : theme.textSecondary, fontSize: 14 }}>
                        {contentForm.date ? t(formatEventDate(contentForm.date)) : t('Ex : 12 septembre 2026')}
                      </Text>
                      <MaterialIcons name="event" size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.clearDateBtn,
                        { paddingHorizontal: 10, width: undefined },
                        contentForm.date === TBD_DATE
                          ? { backgroundColor: Colors.cta, borderColor: Colors.cta }
                          : { borderColor: theme.border },
                      ]}
                      onPress={() => setContentForm(prev => ({ ...prev, date: prev.date === TBD_DATE ? '' : TBD_DATE }))}
                    >
                      <Text style={{ color: contentForm.date === TBD_DATE ? '#fff' : theme.textSecondary, fontSize: 12, fontWeight: '400' }}>
                        {t('TBD')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Date de fin (optionnel)')}</Text>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <TouchableOpacity
                      style={[styles.fieldInput, { flex: 1, borderColor: theme.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
                      onPress={() => setEventEndDatePickerVisible(true)}
                    >
                      <Text style={{ color: contentForm.endDate ? theme.text : theme.textSecondary, fontSize: 14 }}>
                        {contentForm.endDate ? formatEventDate(contentForm.endDate) : t('Aucune')}
                      </Text>
                      <MaterialIcons name="event" size={18} color={theme.textSecondary} />
                    </TouchableOpacity>
                    {contentForm.endDate ? (
                      <TouchableOpacity
                        style={[styles.clearDateBtn, { borderColor: theme.border }]}
                        onPress={() => setContentForm(prev => ({ ...prev, endDate: '' }))}
                        accessibilityLabel={t('Retirer la date de fin')}
                      >
                        <MaterialIcons name="close" size={18} color={theme.textSecondary} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </>
              )}
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Téléphone')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={contentForm.phone}
                onChangeText={v => setContentForm(prev => ({ ...prev, phone: v }))}
                placeholder={t('Optionnel')}
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Lien carte (Google Maps)')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={contentForm.mapLink}
                onChangeText={v => setContentForm(prev => ({ ...prev, mapLink: v }))}
                placeholder={t('Optionnel — https://maps.app.goo.gl/...')}
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Position GPS (pour la carte)')}</Text>
              <TouchableOpacity
                style={[styles.gpsPickBtn, { borderColor: theme.border }]}
                onPress={() => setLocationPickerVisible(true)}
              >
                <MaterialIcons name="place" size={16} color={contentForm.latitude !== null ? Colors.primary : theme.textSecondary} />
                <Text style={[styles.gpsPickBtnText, { color: contentForm.latitude !== null ? theme.text : theme.textSecondary }]}>
                  {contentForm.latitude !== null
                    ? `${contentForm.latitude.toFixed(5)}, ${contentForm.longitude!.toFixed(5)}`
                    : t('Optionnel — choisir sur la carte')}
                </Text>
                {contentForm.latitude !== null && (
                  <TouchableOpacity
                    onPress={() => setContentForm(prev => ({ ...prev, latitude: null, longitude: null }))}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons name="close" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Page Facebook')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={contentForm.facebook}
                onChangeText={v => setContentForm(prev => ({ ...prev, facebook: v }))}
                placeholder={t('Optionnel — https://facebook.com/...')}
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Site web')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={contentForm.website}
                onChangeText={v => setContentForm(prev => ({ ...prev, website: v }))}
                placeholder={t('Optionnel — https://...')}
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Image (URL)')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={contentForm.image}
                onChangeText={v => setContentForm(prev => ({ ...prev, image: v }))}
                placeholder="https://..."
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
              />
              {contentForm.kind === 'attractions' && (
                <>
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Photos supplémentaires (URLs séparées par une virgule)')}</Text>
                  <TextInput
                    style={[styles.fieldInput, styles.fieldInputMultiline, { borderColor: theme.border, color: theme.text }]}
                    value={contentForm.photos}
                    onChangeText={v => setContentForm(prev => ({ ...prev, photos: v }))}
                    placeholder="https://..., https://..."
                    placeholderTextColor={theme.textSecondary}
                    autoCapitalize="none"
                    multiline
                    numberOfLines={3}
                  />
                  <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Horaires')}</Text>
                  <TextInput
                    style={[styles.fieldInput, styles.fieldInputMultiline, { borderColor: theme.border, color: theme.text }]}
                    value={contentForm.schedule}
                    onChangeText={v => setContentForm(prev => ({ ...prev, schedule: v }))}
                    placeholder={t('Ex : Lun-Ven 8h-18h, Sam 9h-13h')}
                    placeholderTextColor={theme.textSecondary}
                    multiline
                    numberOfLines={3}
                  />

                  <View style={styles.hotelSectionHeader}>
                    <Ionicons name="bed-outline" size={16} color={Colors.primary} />
                    <Text style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: 0 }]}>{t('Hôtels recommandés à proximité')}</Text>
                  </View>
                  <Text style={[styles.hotelSectionSub, { color: theme.textSecondary }]}>
                    {t("Aidez les visiteurs à trouver où dormir près de ce site.")}
                  </Text>

                  {contentForm.hotels.length === 0 && (
                    <Text style={[styles.hotelEmptyText, { color: theme.textSecondary, borderColor: theme.border }]}>
                      {t("Aucun hôtel ajouté pour l'instant.")}
                    </Text>
                  )}

                  {contentForm.hotels.map((hotel, idx) => (
                    <View key={idx} style={[styles.hotelRow, { borderColor: theme.border }]}>
                      <View style={styles.hotelBedIcon}>
                        <Ionicons name="bed" size={14} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1, gap: 6 }}>
                        <TextInput
                          style={[styles.fieldInput, styles.hotelInput, { borderColor: theme.border, color: theme.text }]}
                          value={hotel.name}
                          onChangeText={v => updateHotelRow(idx, 'name', v)}
                          placeholder={t("Nom de l'hôtel")}
                          placeholderTextColor={theme.textSecondary}
                        />
                        <TextInput
                          style={[styles.fieldInput, styles.hotelInput, { borderColor: theme.border, color: theme.text }]}
                          value={hotel.url}
                          onChangeText={v => updateHotelRow(idx, 'url', v)}
                          placeholder="https://..."
                          placeholderTextColor={theme.textSecondary}
                          autoCapitalize="none"
                          keyboardType="url"
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => removeHotelRow(idx)}
                        style={styles.hotelRemoveBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialIcons name="close" size={18} color={theme.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity style={[styles.addHotelBtn, { borderColor: Colors.primary }]} onPress={addHotelRow} activeOpacity={0.8}>
                    <MaterialIcons name="add" size={16} color={Colors.primary} />
                    <Text style={[styles.addHotelBtnText, { color: Colors.primary }]}>{t('Ajouter un hôtel')}</Text>
                  </TouchableOpacity>
                </>
              )}
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Description')}</Text>

              {/* Mise en forme : les boutons entourent la sélection de balises,
                  relues à l'affichage par RichText. */}
              <View style={styles.richBar}>
                <TouchableOpacity style={[styles.richBtn, { borderColor: theme.border }]} onPress={() => wrapDescription('**', '**')}>
                  <Text style={[styles.richBtnText, { color: theme.text, fontWeight: '700' }]}>G</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.richBtn, { borderColor: theme.border }]} onPress={() => wrapDescription('*', '*')}>
                  <Text style={[styles.richBtnText, { color: theme.text, fontStyle: 'italic' }]}>I</Text>
                </TouchableOpacity>
                {(Object.keys(RICH_COLORS) as (keyof typeof RICH_COLORS)[]).map(name => (
                  <TouchableOpacity
                    key={name}
                    style={[styles.richBtn, { borderColor: theme.border }]}
                    onPress={() => wrapDescription(`[${name}]`, `[/${name}]`)}
                  >
                    <View style={[styles.richDot, { backgroundColor: RICH_COLORS[name] }]} />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.fieldInput, styles.fieldInputMultiline, { borderColor: theme.border, color: theme.text }]}
                value={contentForm.description}
                onChangeText={v => setContentForm(prev => ({ ...prev, description: v }))}
                onSelectionChange={e => setDescSelection(e.nativeEvent.selection)}
                placeholder={t('Description')}
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />

              {/* Aperçu : ce que verra le visiteur, balises interprétées. */}
              {contentForm.description ? (
                <View style={[styles.richPreview, { borderColor: theme.border }]}>
                  <Text style={[styles.richPreviewLabel, { color: theme.textSecondary }]}>{t('Aperçu')}</Text>
                  <RichText style={[styles.richPreviewText, { color: theme.text }]}>{contentForm.description}</RichText>
                </View>
              ) : null}
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: theme.border }]}
                onPress={closeContentForm}
                disabled={savingContent}
              >
                <Text style={[styles.modalBtnText, { color: theme.textSecondary }]}>{t('Annuler')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
                onPress={saveContent}
                disabled={savingContent}
              >
                {savingContent
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={[styles.modalBtnText, { color: '#fff', fontWeight: '400' }]}>{t('Enregistrer')}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ADD/EDIT USEFUL NUMBER MODAL */}
      <Modal
        visible={numberForm.visible}
        transparent
        animationType="fade"
        onRequestClose={closeNumberForm}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, maxHeight: '85%' }]}>
            <View style={styles.modalTitleRow}>
              <Ionicons name={(numberForm.icon || 'call-outline') as any} size={18} color={Colors.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {numberForm.editId ? t('Modifier') : t('Ajouter')} {t('un numéro utile')}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Libellé *')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={numberForm.label}
                onChangeText={v => setNumberForm(prev => ({ ...prev, label: v }))}
                placeholder={t('Ex : Police Secours')}
                placeholderTextColor={theme.textSecondary}
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Numéro de téléphone *')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={numberForm.number}
                onChangeText={v => setNumberForm(prev => ({ ...prev, number: v }))}
                placeholder="17"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Groupe *')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={numberForm.group}
                onChangeText={v => setNumberForm(prev => ({ ...prev, group: v }))}
                placeholder={t("Ex : Urgences, Hôpitaux et cliniques...")}
                placeholderTextColor={theme.textSecondary}
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Icône (Ionicons)')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={numberForm.icon}
                onChangeText={v => setNumberForm(prev => ({ ...prev, icon: v }))}
                placeholder={t('Ex : shield-checkmark-outline')}
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Ordre (optionnel)')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={numberForm.order}
                onChangeText={v => setNumberForm(prev => ({ ...prev, order: v.replace(/[^0-9]/g, '') }))}
                placeholder={t('Plus petit = apparaît en premier')}
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
              />
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: theme.border }]}
                onPress={closeNumberForm}
                disabled={savingInfo}
              >
                <Text style={[styles.modalBtnText, { color: theme.textSecondary }]}>{t('Annuler')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
                onPress={saveNumber}
                disabled={savingInfo}
              >
                {savingInfo
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={[styles.modalBtnText, { color: '#fff', fontWeight: '400' }]}>{t('Enregistrer')}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ADD/EDIT OFFICIAL SITE MODAL */}
      <Modal
        visible={siteForm.visible}
        transparent
        animationType="fade"
        onRequestClose={closeSiteForm}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, maxHeight: '85%' }]}>
            <View style={styles.modalTitleRow}>
              <Ionicons name={(siteForm.icon || 'business-outline') as any} size={18} color={Colors.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {siteForm.editId ? t('Modifier') : t('Ajouter')} {t('un site officiel')}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Nom *')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={siteForm.name}
                onChangeText={v => setSiteForm(prev => ({ ...prev, name: v }))}
                placeholder={t('Ex : Présidence du Faso')}
                placeholderTextColor={theme.textSecondary}
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Site web')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={siteForm.website}
                onChangeText={v => setSiteForm(prev => ({ ...prev, website: v }))}
                placeholder={t('Optionnel — https://...')}
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Page Facebook')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={siteForm.facebook}
                onChangeText={v => setSiteForm(prev => ({ ...prev, facebook: v }))}
                placeholder={t('Optionnel — https://facebook.com/...')}
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Icône (Ionicons)')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={siteForm.icon}
                onChangeText={v => setSiteForm(prev => ({ ...prev, icon: v }))}
                placeholder={t('Ex : business-outline')}
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Ordre (optionnel)')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={siteForm.order}
                onChangeText={v => setSiteForm(prev => ({ ...prev, order: v.replace(/[^0-9]/g, '') }))}
                placeholder={t('Plus petit = apparaît en premier')}
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Description')}</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldInputMultiline, { borderColor: theme.border, color: theme.text }]}
                value={siteForm.description}
                onChangeText={v => setSiteForm(prev => ({ ...prev, description: v }))}
                placeholder={t('Description')}
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: theme.border }]}
                onPress={closeSiteForm}
                disabled={savingInfo}
              >
                <Text style={[styles.modalBtnText, { color: theme.textSecondary }]}>{t('Annuler')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
                onPress={saveSite}
                disabled={savingInfo}
              >
                {savingInfo
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={[styles.modalBtnText, { color: '#fff', fontWeight: '400' }]}>{t('Enregistrer')}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ADD/EDIT USEFUL APPLICATION MODAL */}
      <Modal
        visible={appForm.visible}
        transparent
        animationType="fade"
        onRequestClose={closeAppForm}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={[styles.modalOverlay, { padding: 16 }]}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, maxHeight: '85%', maxWidth: 640 }]}>
            <View style={styles.modalTitleRow}>
              <Ionicons name="apps" size={18} color={Colors.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {appForm.editId ? t('Modifier') : t('Ajouter')} {t('une application')}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Nom *')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={appForm.name}
                onChangeText={v => setAppForm(prev => ({ ...prev, name: v }))}
                placeholder={t('Ex : Orange Money, Wave, Yango...')}
                placeholderTextColor={theme.textSecondary}
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Catégorie *')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={appForm.category}
                onChangeText={v => setAppForm(prev => ({ ...prev, category: v }))}
                placeholder={t('Ex : Paiement mobile, Transport, Services publics...')}
                placeholderTextColor={theme.textSecondary}
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t("Icône / logo (URL)")}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={appForm.image}
                onChangeText={v => setAppForm(prev => ({ ...prev, image: v }))}
                placeholder="https://..."
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Lien Google Play')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={appForm.androidUrl}
                onChangeText={v => setAppForm(prev => ({ ...prev, androidUrl: v }))}
                placeholder={t('Optionnel — https://play.google.com/...')}
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Lien App Store')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={appForm.iosUrl}
                onChangeText={v => setAppForm(prev => ({ ...prev, iosUrl: v }))}
                placeholder={t('Optionnel — https://apps.apple.com/...')}
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Site web')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={appForm.website}
                onChangeText={v => setAppForm(prev => ({ ...prev, website: v }))}
                placeholder={t('Optionnel — https://...')}
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Ordre (optionnel)')}</Text>
              <TextInput
                style={[styles.fieldInput, { borderColor: theme.border, color: theme.text }]}
                value={appForm.order}
                onChangeText={v => setAppForm(prev => ({ ...prev, order: v.replace(/[^0-9]/g, '') }))}
                placeholder={t('Plus petit = apparaît en premier')}
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
              />
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{t('Description')}</Text>
              <TextInput
                style={[styles.fieldInput, styles.fieldInputMultiline, { borderColor: theme.border, color: theme.text }]}
                value={appForm.description}
                onChangeText={v => setAppForm(prev => ({ ...prev, description: v }))}
                placeholder={t('Description')}
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
            </ScrollView>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: theme.border }]}
                onPress={closeAppForm}
                disabled={savingInfo}
              >
                <Text style={[styles.modalBtnText, { color: theme.textSecondary }]}>{t('Annuler')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary, borderColor: Colors.primary }]}
                onPress={saveApp}
                disabled={savingInfo}
              >
                {savingInfo
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={[styles.modalBtnText, { color: '#fff', fontWeight: '400' }]}>{t('Enregistrer')}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* LINK BUSINESS MODAL — set/clear relatedBusinessId, shown as "Voir aussi" on the detail page */}
      <Modal
        visible={linkModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setLinkModal({ visible: false, item: null, search: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card, maxHeight: '75%' }]}>
            <View style={styles.modalTitleRow}>
              <MaterialIcons name="link" size={18} color={Colors.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>{t('Lier à une autre entreprise')}</Text>
            </View>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              {t('Affiche un lien "Voir aussi" vers cette autre fiche sur la page de')} {linkModal.item?.name}
            </Text>

            {linkModal.item?.relatedBusinessId && (
              <View style={styles.linkedRow}>
                <MaterialIcons name="check-circle" size={16} color={Colors.primary} />
                <Text style={[styles.linkedText, { color: theme.text, flex: 1 }]} numberOfLines={1}>
                  {t('Actuellement lié à :')} {approvedBiz.find(b => b.id === linkModal.item.relatedBusinessId)?.name || linkModal.item.relatedBusinessId}
                </Text>
                <TouchableOpacity
                  onPress={async () => {
                    await updateDoc(doc(db, 'businesses', linkModal.item.id), { relatedBusinessId: null });
                    setLinkModal({ visible: false, item: null, search: '' });
                  }}
                >
                  <MaterialIcons name="close" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            )}

            <TextInput
              style={[styles.modalInput, { borderColor: '#9CA3AF', color: theme.text, backgroundColor: '#fff' }]}
              value={linkModal.search}
              onChangeText={v => setLinkModal(prev => ({ ...prev, search: v }))}
              placeholder={t('Rechercher une entreprise...')}
              placeholderTextColor={theme.textSecondary}
            />

            <ScrollView style={{ marginTop: 10 }}>
              {approvedBiz
                .filter(b => b.id !== linkModal.item?.id)
                .filter(b => !linkModal.search.trim() || b.name.toLowerCase().includes(linkModal.search.trim().toLowerCase()))
                .slice(0, 12)
                .map(b => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.linkResultRow, { borderColor: theme.border }]}
                    onPress={async () => {
                      await updateDoc(doc(db, 'businesses', linkModal.item.id), { relatedBusinessId: b.id });
                      setLinkModal({ visible: false, item: null, search: '' });
                    }}
                  >
                    <Text style={[styles.linkResultName, { color: theme.text }]} numberOfLines={1}>{b.name}</Text>
                    <Text style={[styles.linkResultMeta, { color: theme.textSecondary }]}>{b.city}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalBtn, { borderColor: theme.border, marginTop: 12 }]}
              onPress={() => setLinkModal({ visible: false, item: null, search: '' })}
            >
              <Text style={[styles.modalBtnText, { color: theme.textSecondary }]}>{t('Annuler')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* GENERIC CONFIRM MODAL — cross-platform stand-in for Alert.alert's two-button confirm.
          Rendered after the add/edit modal so it stacks visually on top of it. */}
      <Modal
        visible={confirmModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.card }]}>
            <View style={styles.modalTitleRow}>
              <MaterialIcons name="warning" size={18} color="#E65100" />
              <Text style={[styles.modalTitle, { color: theme.text }]}>{confirmModal.title}</Text>
            </View>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>{confirmModal.message}</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: theme.border }]}
                onPress={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
              >
                <Text style={[styles.modalBtnText, { color: theme.textSecondary }]}>{confirmModal.cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.cta, borderColor: Colors.cta }]}
                onPress={() => {
                  setConfirmModal(prev => ({ ...prev, visible: false }));
                  confirmModal.onConfirm();
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#1A1A1A', fontWeight: '400' }]}>{confirmModal.confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* GPS PICKER FOR EVENT/ATTRACTION LOCATION */}
      <LocationPicker
        visible={locationPickerVisible}
        current={contentForm.latitude !== null ? { latitude: contentForm.latitude, longitude: contentForm.longitude! } : undefined}
        onConfirm={(loc) => {
          setContentForm(prev => ({
            ...prev,
            latitude: loc.latitude ?? null,
            longitude: loc.longitude ?? null,
          }));
          setLocationPickerVisible(false);
        }}
        onClose={() => setLocationPickerVisible(false)}
        theme={theme}
      />

      {/* DATE PICKER FOR EVENT DATE */}
      <DatePickerModal
        visible={eventDatePickerVisible}
        initialValue={contentForm.date}
        onConfirm={(iso) => setContentForm(prev => ({ ...prev, date: iso }))}
        onClose={() => setEventDatePickerVisible(false)}
        theme={theme}
      />

      {/* DATE PICKER FOR EVENT END DATE */}
      <DatePickerModal
        visible={eventEndDatePickerVisible}
        initialValue={contentForm.endDate || contentForm.date}
        onConfirm={(iso) => setContentForm(prev => ({ ...prev, endDate: iso }))}
        onClose={() => setEventEndDatePickerVisible(false)}
        theme={theme}
      />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  modalBox: { width: '100%', borderRadius: 10, padding: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  modalTitle: { fontSize: 18, fontWeight: '400' },
  modalSub: { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  modalInput: { borderWidth: 2, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, fontSize: 22, fontWeight: '400', textAlign: 'center', marginBottom: 20 },
  linkedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0F7F4', borderRadius: 6, padding: 10, marginBottom: 12 },
  linkedText: { fontSize: 13, fontWeight: '400' },
  linkResultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, paddingVertical: 10, gap: 8 },
  linkResultName: { fontSize: 14, fontWeight: '400', flex: 1 },
  linkResultMeta: { fontSize: 12 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtn: { flex: 1, paddingVertical: 13, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '400' },
  fieldLabel: { fontSize: 12, fontWeight: '400', marginBottom: 5, marginTop: 10 },
  richBar: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  richBtn: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  richBtnText: { fontSize: 14 },
  richDot: { width: 14, height: 14, borderRadius: 7 },
  richPreview: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 8 },
  richPreviewLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  richPreviewText: { fontSize: 13, lineHeight: 19 },
  fieldInput: { borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  clearDateBtn: { width: 42, height: 42, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  fieldInputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  gpsPickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10,
  },
  gpsPickBtnText: { flex: 1, fontSize: 13 },
  hotelSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  hotelSectionSub: { fontSize: 12, lineHeight: 16, marginBottom: 10 },
  hotelEmptyText: { fontSize: 12, fontStyle: 'italic', borderWidth: 1, borderStyle: 'dashed', borderRadius: 6, padding: 10, marginBottom: 8, textAlign: 'center' },
  hotelRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 8 },
  hotelBedIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary + '1A', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  hotelInput: { paddingVertical: 8 },
  hotelRemoveBtn: { padding: 4, marginTop: 2 },
  addHotelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 7, paddingVertical: 11, marginTop: 2 },
  addHotelBtnText: { fontSize: 13, fontWeight: '400' },
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  headerTitle: { fontSize: 20, fontWeight: '400', color: '#fff' },
  headerSub: { fontSize: 12, color: '#A5D6A7', marginTop: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  statItem: { flex: 1, minWidth: 0, alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: '400', color: '#fff' },
  statLbl: { fontSize: 11, color: '#A5D6A7', marginTop: 1, textAlign: 'center' },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.3)', flexShrink: 0 },
  quickLinksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  quickLinkBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  quickLinkText: { fontSize: 12, fontWeight: '400', textDecorationLine: 'underline' },
  mainTabRow: { borderBottomWidth: 1, flexGrow: 0, flexShrink: 0 },
  mainTabRowContent: { flexDirection: 'row', alignItems: 'flex-start' },
  mainTabBtn: { alignItems: 'center', paddingTop: 13, paddingBottom: 6, paddingHorizontal: 16 },
  mainTabText: { fontSize: 14, fontWeight: '400' },
  tabInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, flexWrap: 'wrap' },
  addContentBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: Colors.cta, marginHorizontal: 16, marginTop: 12, paddingVertical: 13, borderRadius: 7 },
  addContentBtnText: { fontSize: 15, fontWeight: '400', color: '#1A1A1A' },
  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginTop: 12, marginBottom: 8, borderRadius: 6, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 10 },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 2 },
  searchHint: { fontSize: 12, marginHorizontal: 12, marginBottom: 8, fontStyle: 'italic' },
  subTabRow: { flexDirection: 'row', margin: 12, borderRadius: 6, padding: 4, gap: 4 },
  subTabBtn: { flex: 1, paddingVertical: 8, borderRadius: 4, alignItems: 'center' },
  subTabText: { fontSize: 13, fontWeight: '400' },
  listContent: { padding: 16 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { borderRadius: 8, borderWidth: 1, padding: 14, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  dupeBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#FFF3E0', borderRadius: 5, padding: 8, marginBottom: 10 },
  dupeBannerText: { flex: 1, fontSize: 12, color: '#BF360C', fontWeight: '400', lineHeight: 17 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 18, fontWeight: '400' },
  name: { fontSize: 15, fontWeight: '400' },
  meta: { fontSize: 12, marginTop: 2 },
  desc: { fontSize: 12, lineHeight: 17, marginBottom: 10 },
  badge: { borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '400' },
  actionRow: { flexDirection: 'row', gap: 10 },
  editAdminBtn: { flex: 1, flexDirection: 'row', gap: 6, paddingVertical: 10, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  editAdminText: { fontWeight: '400', fontSize: 14 },
  rejectBtn: { flex: 1, flexDirection: 'row', gap: 6, paddingVertical: 10, borderRadius: 6, borderWidth: 1.5, borderColor: '#D32F2F', alignItems: 'center', justifyContent: 'center' },
  rejectText: { color: '#D32F2F', fontWeight: '400', fontSize: 14 },
  approveBtn: { flex: 1, flexDirection: 'row', gap: 6, paddingVertical: 10, borderRadius: 6, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  approveText: { color: '#fff', fontWeight: '400', fontSize: 14 },
  revokeBtn: { flexDirection: 'row', gap: 6, paddingVertical: 10, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  revokeText: { fontWeight: '400', fontSize: 13 },
  priorityBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priorityText: { fontSize: 10, fontWeight: '400' },
  quickActionBtn: { width: 40, height: 40, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 28, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '400' },
});