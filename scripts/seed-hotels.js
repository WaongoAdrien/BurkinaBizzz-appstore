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
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
