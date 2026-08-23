// scripts/seed-medias.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des médias / organismes d'information.
//
// Lancer   :  node scripts/seed-medias.js
// Aperçu   :  node scripts/seed-medias.js --dry-run
// Réécrire :  node scripts/seed-medias.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// Catégorie 'Autres' : il n'existe pas de catégorie Médias/Presse dans l'app.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses } = require('./lib/business-seed');

const CATEGORY = 'Autres';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Source : page Facebook officielle (facebook.com/StudioYafaBurkina).
    name: 'Studio Yafa - Fondation Hirondelle',
    address: null,                     // seulement « Ouaga » sur la page, pas de quartier précis
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 07 70 45 45',
    facebook: 'https://www.facebook.com/StudioYafaBurkina',
    instagram: null,
    website: 'https://studioyafa.org',
    openingHours: null,                // aucun horaire publié
    description: "Studio Yafa est un programme d'information et de dialogue pour les jeunes, les femmes et les personnes vulnérables du Burkina Faso.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
