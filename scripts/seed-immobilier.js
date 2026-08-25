// scripts/seed-immobilier.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des agences immobilières.
//
// Lancer   :  node scripts/seed-immobilier.js
// Aperçu   :  node scripts/seed-immobilier.js --dry-run
// Réécrire :  node scripts/seed-immobilier.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses } = require('./lib/business-seed');

const CATEGORY = 'Immobilier';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Source : page Facebook officielle (facebook.com/Sya.Immobilier).
    name: 'SYA Immobilier',
    city: 'Bobo-Dioulasso',
    // Le champ Adresse de la page ne contient que « 22 », inexploitable seul
    // (numéro ou secteur, impossible de trancher) — laissé vide.
    address: null,
    latitude: null, longitude: null,
    phone: '+226 67 67 60 70',
    // Numéro déclaré explicitement dans le champ « WhatsApp number » de la page,
    // identique à la ligne de contact.
    whatsapp: '+226 67 67 60 70',
    facebook: 'https://www.facebook.com/Sya.Immobilier',
    instagram: null,
    // La page annonce syaimmobilier.com, mais le domaine nu ne sert qu'une page
    // vide et la variante www ne résout pas (NXDOMAIN) — non enregistré.
    website: null,
    openingHours: null,                // aucun horaire publié
    description: 'Agence immobilière à Bobo-Dioulasso, Burkina Faso.',
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
