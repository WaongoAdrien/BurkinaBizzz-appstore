// scripts/lib/business-seed.js
// ─────────────────────────────────────────────────────────────────────────────
// Logique partagée par les seeds de fiches `businesses` (nightlife, restaurants…).
//
// Schéma réutilisé tel quel, cf. app/vendor/add-business.tsx :
//   - quartier : location.address        - GPS : location.latitude / longitude
//   - horaires : openingHours structuré par jour ({open, close, closed}, "HH:MM")
//     Les fermetures après minuit sont gérées nativement par lib/openingHours.ts
//     (close < open = nuitée).
//   - verified : booléen déjà présent dans le type Business, affiché en badge.
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', '..', 'kosso-gym-00b786807f6b.json');

// Les fiches de l'annuaire appartiennent au compte admin, comme toutes les autres.
const OWNER = {
  ownerId: 'mSnAilZG3Ra1oTrq2KhQsCBuLzB3',
  ownerName: 'Adrien Waongo',
};

const CITY = 'Ouagadougou';
const STATUS = 'approved';

// ── HORAIRES ─────────────────────────────────────────────────────────────────
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const CLOSED = { closed: true };

// hours({ friday: ['22:00','05:00'] }) -> tous les autres jours fermés.
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

// ID déterministe dérivé du nom — c'est ce qui rend les seeds idempotents.
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

// Un champ absent/null reste null — aucune valeur n'est inventée.
function buildBusiness(v, category) {
  return {
    name: v.name,
    category,
    categories: [category],
    city: v.city || CITY,
    description: v.description,
    phone: v.phone ?? null,
    whatsapp: v.whatsapp ?? null,
    strictWhatsapp: true,     // pas de repli sur `phone` pour le bouton WhatsApp
    facebook: v.facebook ?? null,
    instagram: v.instagram ?? null,
    website: v.website ?? null,
    photos: [],
    coverPhoto: '',
    openingHours: v.openingHours ?? null,
    location: {
      address: v.address ?? null,
      latitude: v.latitude ?? null,
      longitude: v.longitude ?? null,
    },
    ownerId: OWNER.ownerId,
    ownerName: OWNER.ownerName,
    status: STATUS,
    priority: 0,
    verified: false,          // à passer à true après vérification manuelle
  };
}

async function seedBusinesses(venues, category, argv = process.argv) {
  const force = argv.includes('--force');
  const dryRun = argv.includes('--dry-run');

  admin.initializeApp({ credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)) });
  const db = admin.firestore();

  // Garde-fou : une fiche du même nom peut déjà exister sous un ID aléatoire
  // (les fiches créées depuis l'app n'ont pas d'ID déterministe).
  const existing = await db.collection('businesses').get();
  const byName = new Map();
  existing.forEach(d => byName.set((d.data().name || '').toLowerCase().trim(), d.id));

  let created = 0, updated = 0, skipped = 0;

  for (const v of venues) {
    const id = docId(v.name);
    const clash = byName.get(v.name.toLowerCase().trim());

    if (clash && clash !== id) {
      console.log(`⚠ ignoré  ${id} — une fiche "${v.name}" existe déjà (${clash})`);
      skipped++;
      continue;
    }

    const ref = db.collection('businesses').doc(id);
    const snap = await ref.get();
    const data = buildBusiness(v, category);

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
}

module.exports = { OWNER, CITY, STATUS, DAYS, hours, everyDay, docId, buildBusiness, seedBusinesses };
