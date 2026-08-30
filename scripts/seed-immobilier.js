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
  {
    // Sources : page Facebook officielle + fiche Google Maps au nom exact.
    // La page publie deux lignes : le 66 04 25 94 en tête du bloc « Contact
    // info », et le 04 89 82 82 mis en avant dans la bio, qui est aussi le
    // numéro WhatsApp. Les deux sont donc renseignés, chacun dans son champ.
    name: "Chic'Appart Sarl",
    categories: ['Résidence meublée', 'Immobilier'],
    address: 'Ouaga 2000, secteur 54, Ouagadougou',
    latitude: 12.3111415, longitude: -1.5024942,
    phone: '+226 66 04 25 94',
    whatsapp: '+226 04 89 82 82',
    facebook: 'https://www.facebook.com/ChicAppartSarl',
    instagram: null,
    website: 'https://chicappart.com',
    openingHours: null,                // aucun horaire publié
    description: "Société burkinabè d'appartements meublés et de services d'installation à Ouagadougou, qui s'adresse aux expatriés, ONG, ambassades, institutions et à la diaspora. Elle exploite sa propre flotte d'appartements décorés, meublés et entretenus, en location courte durée à partir de 5 jours ainsi qu'en moyen et long séjour. Autres prestations : installation clé en main d'un logement vide, décoration et design d'intérieur, optimisation d'espace, gestion immobilière, mobilier sur mesure réalisé par des artisans locaux, et maintenance après remise des clés.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
