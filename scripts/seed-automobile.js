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
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
