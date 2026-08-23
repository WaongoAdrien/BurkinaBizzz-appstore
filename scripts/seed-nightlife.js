// scripts/seed-nightlife.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des établissements de nuit (night clubs / lounges) à Ouagadougou.
//
// Lancer   :  node scripts/seed-nightlife.js
// Aperçu   :  node scripts/seed-nightlife.js --dry-run
// Réécrire :  node scripts/seed-nightlife.js --force
//
// Idempotence : chaque fiche a un ID de document déterministe dérivé de son nom
// (voir docId). Une relance ignore les fiches déjà présentes — les photos et les
// retouches faites depuis l'app ne sont jamais écrasées. --force réécrit les
// champs descriptifs (createdAt, photos et verified sont préservés).
//
// Schéma réutilisé tel quel (collection `businesses`, cf. app/vendor/add-business.tsx) :
//   - catégorie      : 'Soirées' (catégorie existante pour la vie nocturne)
//   - quartier       : location.address
//   - GPS            : location.latitude / location.longitude
//   - horaires       : openingHours structuré par jour ({open,close,closed}, "HH:MM")
//                      Les fermetures après minuit sont gérées nativement
//                      (lib/openingHours.ts traite close < open comme une nuitée).
//   - verified       : champ booléen déjà présent dans le type Business et affiché
//                      sous forme de badge "Vérifié" sur la fiche.
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'kosso-gym-00b786807f6b.json');

// ── PROPRIÉTAIRE ─────────────────────────────────────────────────────────────
// Les fiches de l'annuaire appartiennent au compte admin, comme les 258 autres.
const OWNER = {
  ownerId: 'mSnAilZG3Ra1oTrq2KhQsCBuLzB3',
  ownerName: 'Adrien Waongo',
};

const CITY = 'Ouagadougou';
const CATEGORY = 'Soirées';
const STATUS = 'approved';

// ── HORAIRES ─────────────────────────────────────────────────────────────────
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const CLOSED = { closed: true };

// hours({ friday: ['22:00','05:00'], saturday: ['22:00','05:00'] })
// -> tous les autres jours fermés.
function hours(spec) {
  const out = {};
  for (const day of DAYS) {
    const v = spec[day];
    out[day] = v ? { open: v[0], close: v[1], closed: false } : CLOSED;
  }
  return out;
}

// everyDay('23:00','06:00', { saturday: ['11:00','06:00'] }) -> même plage 7j/7,
// avec surcharge éventuelle pour certains jours.
function everyDay(open, close, overrides = {}) {
  const spec = {};
  for (const day of DAYS) spec[day] = overrides[day] || [open, close];
  return hours(spec);
}

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

// ID déterministe dérivé du nom — c'est ce qui rend le seed idempotent.
// 'Convivium Luxury Lounge' -> 'convivium-luxury-lounge'
const DIACRITICS = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g'
);

function docId(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildDoc(v) {
  return {
    name: v.name,
    category: CATEGORY,
    categories: [CATEGORY],
    city: CITY,
    description: v.description,
    phone: v.phone,           // null si inconnu — aucun numéro inventé
    whatsapp: null,
    strictWhatsapp: true,     // pas de repli sur `phone` pour le bouton WhatsApp
    facebook: v.facebook,
    instagram: v.instagram,
    website: null,
    photos: [],
    coverPhoto: '',
    openingHours: v.openingHours,
    location: {
      address: v.address,
      latitude: v.latitude,
      longitude: v.longitude,
    },
    ownerId: OWNER.ownerId,
    ownerName: OWNER.ownerName,
    status: STATUS,
    priority: 0,
    verified: false,          // à passer à true après vérification manuelle
  };
}

async function main() {
  const force = process.argv.includes('--force');
  const dryRun = process.argv.includes('--dry-run');

  admin.initializeApp({ credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)) });
  const db = admin.firestore();

  // Garde-fou : une fiche portant le même nom peut déjà exister sous un ID
  // aléatoire (les fiches créées depuis l'app n'ont pas d'ID déterministe).
  const existing = await db.collection('businesses').get();
  const byName = new Map();
  existing.forEach(d => byName.set((d.data().name || '').toLowerCase().trim(), d.id));

  let created = 0, updated = 0, skipped = 0;

  for (const v of VENUES) {
    const id = docId(v.name);
    const clash = byName.get(v.name.toLowerCase().trim());

    if (clash && clash !== id) {
      console.log(`⚠ ignoré  ${id} — une fiche "${v.name}" existe déjà (${clash})`);
      skipped++;
      continue;
    }

    const ref = db.collection('businesses').doc(id);
    const snap = await ref.get();
    const data = buildDoc(v);

    if (snap.exists && !force) {
      console.log(`↷ ignoré  ${id} (déjà présent)`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`${snap.exists ? '~ maj    ' : '+ créé   '} ${id} — ${data.name}`);
      snap.exists ? updated++ : created++;
      continue;
    }

    if (snap.exists) {
      // On préserve createdAt, photos et le verified déjà basculé à true.
      const { verified, ...rest } = data;
      await ref.set(rest, { merge: true });
      console.log(`~ maj     ${id}`);
      updated++;
    } else {
      await ref.set({ ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      console.log(`+ créé    ${id}`);
      created++;
    }
  }

  console.log(
    `\n${dryRun ? '[aperçu] ' : ''}Terminé — ${created} créée(s), ${updated} mise(s) à jour, ${skipped} ignorée(s).`
  );
  process.exit(0);
}

main().catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
