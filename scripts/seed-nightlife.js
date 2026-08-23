// scripts/seed-nightlife.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des établissements de nuit (night clubs / lounges) à Ouagadougou.
//
// Lancer   :  node scripts/seed-nightlife.js
// Aperçu   :  node scripts/seed-nightlife.js --dry-run
// Réécrire :  node scripts/seed-nightlife.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// Catégorie 'Soirées' = catégorie existante pour la vie nocturne.
// ─────────────────────────────────────────────────────────────────────────────

const { hours, everyDay, seedBusinesses } = require('./lib/business-seed');

const CATEGORY = 'Soirées';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    name: 'The 1Xl Night Club (ex Top 2000)',
    address: 'Ouaga 2000, Avenue Pascal Zagré',
    latitude: 12.30622, longitude: -1.51145,
    phone: '+226 64 24 38 24',
    facebook: 'https://web.facebook.com/profile.php?id=100083270436083',
    instagram: 'the_1xl',
    openingHours: hours({ friday: ['22:00', '05:00'], saturday: ['22:00', '05:00'] }),
    description: 'Le club de référence à Ouaga 2000. Climatisé, afrobeats, espaces intérieur et terrasse. Réservation conseillée le week-end.',
  },
  {
    name: 'Cartel Light Club',
    address: 'Koulouba, Avenue Boumédienne',
    latitude: 12.36503, longitude: -1.51121,
    phone: '+226 68 79 66 66',
    facebook: 'https://www.facebook.com/CartelLightClub/',
    instagram: null,
    openingHours: hours({
      thursday: ['22:30', '05:00'], friday: ['22:30', '05:00'], saturday: ['22:30', '05:00'],
    }),
    description: 'Club climatisé au centre-ville, musique afro-caribéenne et occidentale, tenue correcte exigée.',
  },
  {
    name: 'VIP Night',
    address: 'Cissin',
    latitude: 12.31234, longitude: -1.52899,
    phone: '+226 71 31 31 31',
    facebook: null,
    instagram: null,
    openingHours: everyDay('23:00', '06:00'),
    description: 'Night club ouvert 7 nuits sur 7, ambiance animée.',
  },
  {
    name: 'Queen Night Club',
    address: 'Kalgondin, rue 30.66',
    latitude: 12.34720, longitude: -1.50293,
    phone: null,
    facebook: null,
    instagram: null,
    openingHours: null, // horaires inconnus -> badge "Horaires non renseignés"
    description: 'Grande piste de danse, salons spacieux, réputé pour la qualité de ses DJ.',
  },
  {
    name: 'OPIUM',
    address: 'Koulouba',
    latitude: 12.36498, longitude: -1.51132,
    phone: null,
    facebook: null,
    instagram: null,
    openingHours: everyDay('18:00', '02:00'),
    description: "Lounge chic pour l'after-work et les soirées dansantes (kizomba, salsa, afrobeats).",
  },
  {
    name: 'Convivium Luxury Lounge',
    address: 'Ouaga 2000',
    latitude: 12.31289, longitude: -1.50955,
    phone: '+226 01 95 11 11',
    facebook: null,
    instagram: null,
    openingHours: hours({ friday: ['18:00', '00:00'], saturday: ['18:00', '05:00'] }),
    description: 'Lounge haut de gamme avec grand espace extérieur, concerts live et groupes en terrasse.',
  },
  {
    name: 'Medellin VIP Lounge',
    address: 'Tampouy',
    latitude: 12.38392, longitude: -1.56925,
    phone: '+226 64 96 32 30',
    facebook: null,
    instagram: null,
    openingHours: everyDay('10:00', '04:00'),
    description: 'Lounge décontracté avec billard et chicha, ouvert jusqu\'à tard.',
  },
  {
    name: 'Complexe Fun Lounge',
    address: "Zone d'Activités Diverses (ZAD)",
    latitude: 12.34800, longitude: -1.49434,
    phone: '+226 64 74 74 19',
    facebook: null,
    instagram: null,
    openingHours: everyDay('11:00', '05:00', { saturday: ['11:00', '06:00'] }),
    description: 'Complexe polyvalent, bonne option en groupe, ouvert très tard.',
  },
];


seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
