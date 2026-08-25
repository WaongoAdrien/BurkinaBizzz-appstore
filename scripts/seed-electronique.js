// scripts/seed-electronique.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des enseignes électroniques / téléphonie.
//
// Lancer   :  node scripts/seed-electronique.js
// Aperçu   :  node scripts/seed-electronique.js --dry-run
// Réécrire :  node scripts/seed-electronique.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses } = require('./lib/business-seed');

const CATEGORY = 'Electroniques';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Source : page Facebook officielle (profile.php?id=61579657552287),
    // certifiée par Facebook (badge bleu). Catégorie Facebook : « Internet company ».
    // La page couvre tout le Burkina et ne donne pas de ville ; rattachée à
    // Ouagadougou, seule ville de l'annuaire avec Bobo-Dioulasso.
    name: 'Xiaomi Burkina Faso',
    address: null,                     // aucune adresse publiée (page de marque)
    latitude: null, longitude: null,
    phone: '+226 67 67 78 67',
    facebook: 'https://www.facebook.com/profile.php?id=61579657552287',
    instagram: null,
    website: null,                     // aucun lien sur la page
    openingHours: null,                // aucun horaire publié
    description: 'Page officielle de la marque Xiaomi au Burkina Faso : smartphones et produits Xiaomi.',
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
