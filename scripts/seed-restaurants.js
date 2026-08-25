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

const { seedBusinesses, everyDay } = require('./lib/business-seed');

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
  {
    // Source : page Facebook officielle (facebook.com/sessikaPFC).
    name: 'Pâtisserie Sessika PFC',
    address: null,                     // le champ « Adresse » de la page contient « 25480051 »,
                                       // qui ressemble à un numéro de téléphone — non repris tel quel
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: null,                       // aucun numéro dans les infos de contact
    facebook: 'https://www.facebook.com/sessikaPFC',
    instagram: null,
    openingHours: null,                // aucun horaire publié (la page indique seulement « Fermé »)
    description: 'La Pâtisserie Sessika PFC (pâtisserie, fast-food, café) est un cadre idéal pour vos sorties. Ouagadougou.',
  },
  {
    // Source : page Facebook officielle (facebook.com/La.Delicieuse.FastFood).
    name: 'La Délicieuse Chicken',
    address: 'Karpala, nouveau goudron de la station Shell, non loin du maquis TOUT OUAGA',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 68 44 63 62',
    facebook: 'https://www.facebook.com/La.Delicieuse.FastFood',
    instagram: null,
    // Horaires annoncés par l'établissement dans sa bio : « ouverts tous les jours de 8h à 00h ».
    openingHours: everyDay('08:00', '00:00'),
    description: 'Restaurant spécialisé dans le poulet pané, le burger, le shawarma, le panini, etc. Menu varié. Karpala, Ouagadougou.',
  },
  {
    // Source : page Facebook officielle (profile.php?id=61591757049256).
    name: 'Restaurant Congolais Matonge',
    address: 'Ouaga 2000',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 05 43 64 64',
    facebook: 'https://www.facebook.com/profile.php?id=61591757049256',
    instagram: null,
    openingHours: null,                // aucun horaire publié sur la page
    description: 'Le goût authentique du Congo au cœur de Ouagadougou. Spécialités congolaises et africaines. Ouaga 2000.',
  },
  {
    // Source : page Facebook officielle (facebook.com/Restaurantchezwilly).
    // Le champ « Adresse » de la page ne contient qu'un lien Google Maps ; l'adresse
    // et les coordonnées viennent de la fiche Maps pointée par ce lien, dont le
    // numéro de téléphone correspond exactement à celui de la page Facebook.
    name: 'Restaurant chez willy',
    address: '17 rue 619, Pissy',
    latitude: 12.3299943, longitude: -1.5843661,
    phone: '+226 77 71 24 67',
    facebook: 'https://www.facebook.com/Restaurantchezwilly',
    instagram: null,
    openingHours: null,                // aucun horaire publié (la page indique seulement « Fermé »)
    description: 'Restaurant spécialisé dans les plats africains, avec service de livraison. 17 rue 619, Pissy, Ouagadougou.',
  },
  {
    // Source : page Facebook officielle (facebook.com/ChezNiniRestaurant).
    // La page annonce le site restaurantcheznini.com, mais il ne répond plus
    // (avec et sans « www ») — non enregistré pour éviter un lien mort.
    name: 'Chez NINI',
    address: "Ouaga 2000, contiguë à l'immeuble de ARCEP, non loin du palais de justice",
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 72 58 60 60',
    facebook: 'https://www.facebook.com/ChezNiniRestaurant',
    instagram: null,
    openingHours: null,                // aucun horaire publié (la page indique seulement « Fermé »)
    description: 'Restaurant gastronomique, spécialités africaines et européennes. Ouaga 2000, Ouagadougou.',
  },
  {
    // Source : page Facebook officielle (profile.php?id=100083758572705).
    // Adresse volontairement vide : la seule indication trouvée (« vers AMPO
    // Dagnoin en allant à la ZAD ») provient d'un commentaire d'internaute,
    // pas de l'établissement — non repris.
    name: 'Cochon Piqué',
    address: null,
    latitude: null, longitude: null,
    phone: '+226 65 10 87 16',
    // Numéro de contact officiel de la page, que l'établissement signale avec
    // une icône WhatsApp dans ses publications.
    whatsapp: '+226 65 10 87 16',
    facebook: 'https://www.facebook.com/profile.php?id=100083758572705',
    instagram: null,
    openingHours: null,                // aucun horaire structuré publié
    description: "De la viande de porc grillée à la broche sur du charbon de bois. Livraison possible, matins et soirs. Autres contacts : +226 71 54 10 41 et +226 77 68 95 20.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
