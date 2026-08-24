// scripts/seed-loisirs.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des lieux de loisirs / distraction.
//
// Lancer   :  node scripts/seed-loisirs.js
// Aperçu   :  node scripts/seed-loisirs.js --dry-run
// Réécrire :  node scripts/seed-loisirs.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// Catégorie 'Attractions' : catégorie existante la plus proche pour un lieu de
// loisirs (il n'existe pas de catégorie Jeux / Divertissement dans l'app).
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses } = require('./lib/business-seed');

const CATEGORY = 'Attractions';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Source : page Facebook officielle (profile.php?id=100093817431762).
    // Catégorie Facebook : « Video Game ». La bio écrit « Kaparla », mais le
    // champ Adresse de la page indique « Karpala noura » — c'est celui-ci qui est repris.
    name: 'Weïbiland',
    address: 'Karpala noura',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 07 60 65 34',
    facebook: 'https://www.facebook.com/profile.php?id=100093817431762',
    instagram: null,
    openingHours: null,                // aucun horaire publié (la page indique seulement « Fermé »)
    description: 'Espace de réalité virtuelle et d\'arcade, présenté comme le 1er du genre au Burkina Faso. Jeux VR et bornes d\'arcade. Karpala, Ouagadougou.',
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
