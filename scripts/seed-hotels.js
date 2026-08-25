// scripts/seed-hotels.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des hôtels / espaces de séjour.
//
// Lancer   :  node scripts/seed-hotels.js
// Aperçu   :  node scripts/seed-hotels.js --dry-run
// Réécrire :  node scripts/seed-hotels.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses, everyDay } = require('./lib/business-seed');

const CATEGORY = 'Hôtellerie';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Source : page Facebook officielle (profile.php?id=61585418196536).
    // Catégorie Facebook : « Hotel Services Company ».
    name: 'Riim Palace de Gampela',
    address: 'RN4, Gampela, à 300 m de Coca-Cola',
    latitude: null, longitude: null,   // coordonnées non publiées
    // Deux numéros distincts sur la page : le téléphone affiché et un numéro
    // WhatsApp dédié (confirmé par le lien wa.me/22672200101).
    phone: '+226 44 10 20 68',
    whatsapp: '+226 72 20 01 01',
    facebook: 'https://www.facebook.com/profile.php?id=61585418196536',
    instagram: 'riim_palace_gampela',
    // La page indique « Always open ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Espace détente à Gampela : chambres climatisées et suites, salle de conférence ultra-moderne, piscine, restaurant-bar et service traiteur sur mesure. Situé sur la RN4, à 300 m de Coca-Cola.",
  },
  {
    // Source : page Facebook officielle (facebook.com/residencewifi).
    // Catégorie Facebook : « Hotel & Lodging », mais l'offre (studios et
    // appartements meublés en location journalière) relève de « Résidence meublée ».
    name: 'Résidence WIFI',
    categories: ['Résidence meublée'],
    // La page donne son adresse sous forme de Plus Code Google ; les coordonnées
    // viennent de sa résolution. Aucun nom de quartier n'est publié pour recouper.
    address: '6FW7+9R Ouagadougou',
    latitude: 12.2459375, longitude: -1.5354375,
    phone: '+226 69 11 05 47',
    // La bio invite à réserver « via WhatsApp » mais la page ne publie aucun
    // numéro WhatsApp dédié — non déduit du téléphone.
    whatsapp: null,
    facebook: 'https://www.facebook.com/residencewifi',
    instagram: null,
    website: null,
    // La page indique « Always open ».
    openingHours: everyDay('00:00', '00:00'),
    description: "Studios et appartements meublés au cœur de la ville : wifi illimité, équipements complets et service de ménage. Location journalière, hebdomadaire ou mensuelle.",
  },
  {
    // Source : page Facebook officielle (facebook.com/MassabaLodge).
    // La page se décrit comme « Bar - Restaurant - Hébergement », d'où les deux
    // catégories ; catégorie Facebook : « Lodge ».
    name: 'Massaba Lodge',
    categories: ['Hôtellerie', 'Restauration'],
    address: 'Zogona',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 64 77 20 20',
    // Déclaré dans le champ « WhatsApp number » de la page.
    whatsapp: '+226 64 77 20 20',
    facebook: 'https://www.facebook.com/MassabaLodge',
    instagram: 'massabalodge',
    website: null,                     // aucun site, seul un lien Instagram
    // La page indique « Always open ».
    openingHours: everyDay('00:00', '00:00'),
    description: 'Bar, restaurant et hébergement à Zogona, Ouagadougou.',
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
