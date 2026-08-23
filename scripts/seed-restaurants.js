// scripts/seed-restaurants.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des restaurants de Ouagadougou.
//
// Lancer   :  node scripts/seed-restaurants.js
// Aperçu   :  node scripts/seed-restaurants.js --dry-run
// Réécrire :  node scripts/seed-restaurants.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses } = require('./lib/business-seed');

const CATEGORY = 'Restauration';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Source : page Facebook officielle de l'établissement.
    name: 'La croisière',
    address: 'Wemtenga',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 50 35 48 48',
    facebook: 'https://www.facebook.com/profile.php?id=61572789894753',
    instagram: null,
    openingHours: null,                // aucun horaire publié (la page indique seulement « Ouvert »)
    description: 'Restaurant à Wemtenga, Ouagadougou. Spécialité sea food : poulet mayo, poisson braisé et bien d\'autres.',
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
