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
  {
    // Source : page Facebook officielle (facebook.com/Felicitaprime), consultée
    // dans le navigateur — catégorie Facebook « Restaurant ».
    // Le champ « Address » de la page pointe sur l'aéroport international, ce
    // qui contredit la bio : on retient le repère donné par l'établissement
    // lui-même (1200 Logements, près de l'église Saint-Camille), confirmé par
    // le lien Google Maps qu'il publie (Plus Code 9G73+HR, 1200 Logements).
    name: 'Felicita Prime',
    // Les coordonnées viennent de la résolution de ce Plus Code.
    address: "1200 Logements, non loin de l'église Saint-Camille, Ouagadougou",
    latitude: 12.3638781, longitude: -1.4954969,
    phone: '+226 04 83 35 37',
    whatsapp: '+226 03 04 81 81',      // déclaré dans le champ « WhatsApp number »
    facebook: 'https://www.facebook.com/Felicitaprime',
    instagram: null,                   // seul un compte TikTok est lié
    website: null,                     // aucun site web publié
    // La page indique « Always open ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Restaurant, pâtisserie et bar des 1200 Logements, à deux pas de l'église Saint-Camille. Ouvert en continu. TikTok : @felicita.prime5.",
  },
  {
    // Sources : page Facebook officielle (profile.php?id=100063536562658) et
    // site levinnouveau.com. La page est classée « Wine/spirits » sur Facebook
    // mais se présente elle-même comme un restaurant, et le site n'est qu'un
    // site de restaurant (menu, commande en ligne, événements).
    //
    // L'établissement a déménagé : la bio et une publication épinglée annoncent
    // le 7e étage de l'immeuble Liza Market, avenue Kwame Nkrumah.
    name: 'Le Vin Nouveau',
    address: "7e étage de l'immeuble Liza Market, avenue Kwame Nkrumah, Ouagadougou",
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 57 03 75 75',
    whatsapp: '+226 57 03 75 75',      // déclaré dans le champ « WhatsApp number »
    facebook: 'https://www.facebook.com/profile.php?id=100063536562658',
    instagram: null,
    website: 'https://levinnouveau.com',
    // Facebook affiche « Open now » sans détailler la semaine, et le site ne
    // publie aucun horaire : pas de quoi reconstituer une grille, donc null.
    openingHours: null,
    description: "Restaurant de l'avenue Kwame Nkrumah, installé au 7e étage de l'immeuble Liza Market depuis son déménagement. Carte d'entrées, plats chauds, desserts et boissons, menu de la semaine à commander en ligne avant 11h, plats à emporter et livraison. La maison organise aussi des rendez-vous réguliers — buffet du jeudi, soirées en amoureux, ateliers de peinture, ruptures du jeûne — et assure un service traiteur pour cérémonies et événements. E-mail : contact@levinnouveau.com.",
  },
  {
    // Source : page Facebook officielle (facebook.com/Avantvol), consultée dans
    // le navigateur — catégorie Facebook « Restaurant », 29 K abonnés, 86 % de
    // recommandations sur 7 avis. Téléphone et WhatsApp sont deux numéros
    // distincts, tous deux déclarés dans « Contact info ».
    //
    // L'établissement est à Loumbila, pas à Ouagadougou. `city` reste
    // 'Ouagadougou' — l'annuaire ne requête que les villes de CITIES
    // (constants/index.ts) et la fiche serait invisible autrement ; l'adresse,
    // elle, indique la vraie localisation.
    name: 'Escale Village Loumbila',
    address: 'Kossoghin à droite, Loumbila',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 57 47 00 00',
    whatsapp: '+226 54 83 62 52',
    facebook: 'https://www.facebook.com/Avantvol',
    instagram: null,
    website: null,                     // aucun site web publié
    // La page indique « Always open ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Restaurant routier et service traiteur à Loumbila, sur la route de Kaya : l'adresse accueille les voyageurs à Kossoghin à droite, à une vingtaine de kilomètres de Ouagadougou. Ouvert en continu. L'établissement anime aussi des rendez-vous réguliers, dont ses journées Escale Village. E-mail : escalevillageloumbila@gmail.com.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
