// scripts/seed-shopping.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des boutiques et marques (mode, artisanat, cadeaux).
//
// Lancer   :  node scripts/seed-shopping.js
// Aperçu   :  node scripts/seed-shopping.js --dry-run
// Réécrire :  node scripts/seed-shopping.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses } = require('./lib/business-seed');

const CATEGORY = 'Shopping';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Sources : page Facebook officielle (femfaso) + fiche Google Maps
    // « Siège FemFaso » (boutique de cadeaux, 4,4/5 sur 14 avis), qui donne la
    // rue exacte — la page Facebook, elle, ne mentionne que la ville.
    name: 'FemFaso',
    categories: ['Shopping', 'Produits Locaux'],
    address: 'Rue 28.512, Zone I (9GCG+6C), Ouagadougou',
    latitude: 12.3705233, longitude: -1.4739655,
    phone: '+226 61 22 08 08',
    // Numéro déclaré explicitement dans le champ « WhatsApp number » de la
    // page, identique à la ligne de contact.
    whatsapp: '+226 61 22 08 08',
    facebook: 'https://www.facebook.com/femfaso',
    instagram: null,
    website: null,                     // aucun site web publié
    // Facebook affiche « Closed now » sans détailler la semaine, et Google ne
    // donne qu'une heure d'ouverture (9h le lundi) sans heure de fermeture :
    // pas de quoi reconstituer une grille honnête, donc null.
    openingHours: null,
    description: "Marque ethno chic de Ouagadougou consacrée à la redécouverte de l'artisanat textile africain. Sacs, maroquinerie et accessoires travaillés en Faso Danfani, ainsi que des coffrets cadeaux d'entreprise habillés du même tissu. Livraison possible.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
