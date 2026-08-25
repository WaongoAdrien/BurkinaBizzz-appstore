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
  {
    // Source : page Facebook officielle (profile.php?id=61560627452933).
    // Adresse laissée vide : la page se contredit sur le quartier — la bannière
    // annonce « Sis au Sect. 9 Accart-Ville », tandis que la publication du
    // 1er août et le visuel du menu indiquent « Sarfalao secteur 17, près du
    // château Telecel ». Le champ Adresse officiel ne dit que « Bobo Dioulasso ».
    name: 'Restaurant Chez NAFIS',
    city: 'Bobo-Dioulasso',
    address: null,
    latitude: null, longitude: null,
    phone: '+226 75 28 25 39',
    facebook: 'https://www.facebook.com/profile.php?id=61560627452933',
    instagram: null,
    openingHours: null,                // aucun horaire publié
    description: 'Restaurant à Bobo-Dioulasso : menus du jour et plats faits maison. Autre contact : +226 72 02 05 14.',
  },
  {
    // Source : page Facebook officielle (profile.php?id=61585593407037).
    // Téléphone et adresse proviennent de la bio de la page : le champ Adresse
    // officiel ne contient que « 56971808 », un numéro sans signification comme
    // adresse. Le numéro est confirmé trois fois (bio, bannière, visuel du menu)
    // et la bio le présente comme « Info/WhatsApp ».
    name: 'Mana-Tiéké',
    city: 'Bobo-Dioulasso',
    address: "Secteur 22, à côté du stade Lamizana, près de l'école Apha de Solidarité",
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 04 89 31 11',
    whatsapp: '+226 04 89 31 11',
    facebook: 'https://www.facebook.com/profile.php?id=61585593407037',
    instagram: null,
    openingHours: null,                // aucun horaire publié
    description: "Spécialiste de l'attiéké et du garba à Bobo-Dioulasso. Livraison à domicile, paiement Orange Money.",
  },
  {
    // Source : page Facebook officielle (profile.php?id=61579140880066).
    // À ne pas confondre avec la fiche « Chez Simon » déjà présente
    // (udLigJRf2XNEpthqO6bH) : page Facebook, adresse et téléphone différents.
    // Probablement un second établissement de la même enseigne, non confirmé —
    // les deux fiches ne sont donc pas liées entre elles.
    name: "Chez Simon L'Expérience",
    address: "À l'intersection du Boulevard France-Afrique et du nouveau goudron menant à Bonheur Ville, en face du Palace Hôtel",
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 50 00 00 08',
    facebook: 'https://www.facebook.com/profile.php?id=61579140880066',
    instagram: null,
    website: 'https://www.chezsimonexperience.com',
    openingHours: null,                // aucun horaire publié (la page indique seulement « Fermé »)
    description: "Restaurant à Ouagadougou : saveurs authentiques et ambiance raffinée. Situé à l'intersection du Boulevard France-Afrique, en face du Palace Hôtel.",
  },
  {
    // Source : page Facebook officielle (facebook.com/villakaya226).
    name: 'Villa Kaya',
    address: 'Saint Léon, en face du Lycée Français Saint-Exupéry',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 60 16 80 80',
    facebook: 'https://www.facebook.com/villakaya226',
    instagram: null,
    // La page annonce villakaya.net, mais ce domaine ne fait que rediriger vers
    // une ancienne page Facebook (VillaKayaBF) devenue indisponible — non enregistré.
    website: null,
    openingHours: null,                // aucun horaire publié (la page indique seulement « Fermé »)
    description: 'Restaurant et bar à Ouagadougou, quartier Saint Léon, en face du Lycée Français Saint-Exupéry.',
    // Même exploitant que L'Hédone Hôtel (téléphone et e-mail identiques).
    relatedBusinessId: 'l-hedone-hotel-ouagadougou',
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
