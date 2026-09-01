// scripts/seed-alimentation.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des commerces d'alimentation (épiceries, produits fins).
//
// Lancer   :  node scripts/seed-alimentation.js
// Aperçu   :  node scripts/seed-alimentation.js --dry-run
// Réécrire :  node scripts/seed-alimentation.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses } = require('./lib/business-seed');

const CATEGORY = 'Alimentation';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Source : page Facebook officielle (profile.php?id=61576416636412),
    // consultée dans le navigateur — catégorie Facebook « Grocery Store »,
    // 7,3 K abonnés. Le téléphone et le WhatsApp déclarés sont identiques.
    name: 'NUÛMA',
    categories: ['Alimentation', 'Produits Locaux'],
    // Le champ « Address » de la page ne donne que « ZAD », c'est-à-dire la
    // Zone d'Activités Diverses, sans rue ni porte.
    address: "Zone d'Activités Diverses (ZAD), Ouagadougou",
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 06 10 70 70',
    whatsapp: '+226 06 10 70 70',      // déclaré dans le champ « WhatsApp number »
    facebook: 'https://www.facebook.com/profile.php?id=61576416636412',
    instagram: null,
    website: null,                     // aucun site web publié
    openingHours: null,                // aucun horaire publié
    description: "Épicerie fine de la ZAD, entre tradition africaine et raffinement moderne : épices rares, sauces signature et rhums arrangés. L'enseigne anime aussi des formations de cuisine, les « Ateliers Chef NUÛMA ». E-mail : nuumaepiceriefine@gmail.com.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
