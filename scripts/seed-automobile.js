// scripts/seed-automobile.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des entreprises automobiles.
//
// Lancer   :  node scripts/seed-automobile.js
// Aperçu   :  node scripts/seed-automobile.js --dry-run
// Réécrire :  node scripts/seed-automobile.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// `city` peut être surchargée par fiche : les annuaires China / New York /
// South Korea filtrent sur ce champ (voir app/annuaire-*.tsx).
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses } = require('./lib/business-seed');

const CATEGORY = 'Automobile';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Source : page Facebook officielle (facebook.com/orbisauto.official).
    // Exportateur basé en Corée du Sud (indicatif +82) : la fiche alimente
    // l'annuaire Corée du Sud, pas celui du Burkina.
    // `id` explicite comme la fiche jumelle ci-dessous : les deux portent le
    // même nom, le garde-fou anti-doublon par nom doit donc être neutralisé.
    id: 'orbis-auto',
    name: 'Orbis Auto',
    city: 'South Korea',
    address: null,                     // aucune adresse publiée
    latitude: null, longitude: null,
    phone: '+82 10 5050 4281',
    // Numéro WhatsApp annoncé dans la bio de la page (+821050504281),
    // identique au téléphone de contact.
    whatsapp: '+82 10 5050 4281',
    facebook: 'https://www.facebook.com/orbisauto.official',
    instagram: null,
    website: 'https://orbisauto.com',
    openingHours: null,                // aucun horaire publié
    description: "Exportateur de véhicules d'occasion et de pièces détachées basé en Corée du Sud. Recherche et export de voitures d'occasion vers l'international, avec catalogue en ligne.",
    relatedBusinessId: 'orbis-auto-ouagadougou',
  },
  {
    // Même enseigne que ci-dessus, dupliquée volontairement pour apparaître
    // aussi dans l'annuaire de Ouagadougou. `id` explicite car le nom est
    // identique : sans lui, le garde-fou anti-doublon bloquerait la fiche.
    // Les deux fiches se pointent mutuellement via relatedBusinessId.
    id: 'orbis-auto-ouagadougou',
    name: 'Orbis Auto',
    city: 'Ouagadougou',
    address: null,                     // aucune adresse au Burkina publiée
    latitude: null, longitude: null,
    phone: '+82 10 5050 4281',
    whatsapp: '+82 10 5050 4281',
    facebook: 'https://www.facebook.com/orbisauto.official',
    instagram: null,
    website: 'https://orbisauto.com',
    openingHours: null,
    description: "Exportateur de véhicules d'occasion et de pièces détachées basé en Corée du Sud, qui expédie à l'international. Commande depuis le Burkina Faso via leur catalogue en ligne ou WhatsApp. Contact en Corée du Sud (+82).",
    relatedBusinessId: 'orbis-auto',
  },
  {
    // Sources : page Facebook officielle, site merveillemotors.com et fiche
    // Google Maps « Merveille Motors » (MG dealer). Identification confirmée
    // trois fois : même téléphone, même site et même boîte postale
    // (01 BP 1920 Ouaga 01) sur les trois sources.
    // Le quartier vient du site ; la boîte postale seule ne localise rien.
    name: 'Merveille Motors',
    address: 'Boinsyaaré (9F9X+H9), Ouagadougou',
    latitude: 12.368914, longitude: -1.5015076,
    phone: '+226 70 20 98 77',
    whatsapp: '+226 70 20 98 77',      // bouton WhatsApp de la page : même numéro
    facebook: 'https://www.facebook.com/profile.php?id=61569325487976',
    // Pas de compte Instagram : l'enseigne est sur TikTok
    // (@merveille.motors.burkina) et LinkedIn, deux réseaux que le schéma
    // Business ne prévoit pas.
    instagram: null,
    website: 'https://merveillemotors.com',
    // Google ne donne qu'une heure d'ouverture (8h le lundi), sans heure de
    // fermeture ni détail de la semaine : laissé null.
    openingHours: null,
    description: "Distributeur agréé de la marque MG au Burkina Faso, installé à Boinsyaaré. La gamme présentée compte une quatorzaine de modèles — berlines et SUV en motorisation thermique, hybride et électrique, dont les MG GT, HS, HS Hybrid, MG ONE, RX9 et Whale. L'enseigne assure la vente, l'accompagnement commercial, le service après-vente et la fourniture de pièces détachées.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
