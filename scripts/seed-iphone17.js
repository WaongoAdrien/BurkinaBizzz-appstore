// scripts/seed-iphone17.js
// ─────────────────────────────────────────────────────────────────────────────
// One-shot, idempotent seed for the iPhone 17 Pro / Pro Max / Air listings.
//
// Run with:   node scripts/seed-iphone17.js
// Overwrite:  node scripts/seed-iphone17.js --force
// Preview:    node scripts/seed-iphone17.js --dry-run
//
// Idempotency: each listing uses a deterministic document ID derived from its
// model + storage (see docId below). Re-running skips any listing that already
// exists, so photos or edits made later in the app are never clobbered.
// Pass --force to overwrite the descriptive fields anyway (createdAt and photos
// are always preserved on existing docs).
//
// Writes go through the Admin SDK with the service-account key, which bypasses
// firestore.rules — that is why this can seed listings the vendor UI would
// otherwise have to create one by one.
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'kosso-gym-00b786807f6b.json');

// ── SELLER ───────────────────────────────────────────────────────────────────
// ownerName is the seller name shown on the product page. Products link to a
// vendor USER via ownerId — there is no businessId on the product model — so
// ownerId must be a real uid from the `users` collection.
const SELLER = {
  ownerId: 'mSnAilZG3Ra1oTrq2KhQsCBuLzB3', // Adrien Waongo (admin)
  ownerName: 'US STORE',
  phone: '+1 646 478 65 15',                // formatted to match the existing iPhone listing
  whatsapp: '+1 646 478 65 15',
};

// ── SHARED LISTING ATTRIBUTES ────────────────────────────────────────────────
const CITY = 'Ouagadougou';
const CATEGORY = 'Téléphones & Tablettes';
const ESIM_NOTE =
  '⚠️ Modèle eSIM uniquement (pas de tiroir SIM physique) — compatible Orange, ' +
  'Moov et Telecel, aide à l\'activation offerte.';

// ── FAMILIES ─────────────────────────────────────────────────────────────────
// Per-family spec line + colours. Storage/price vary per listing (MODELS below);
// everything else about a model is shared across its storage tiers.
const FAMILIES = {
  'iPhone 17 Pro': {
    colors: 'Orange cosmique, Bleu profond, Argent',
    specs:
      'Écran Super Retina XDR 6,3 po ProMotion 120 Hz, puce A19 Pro, triple capteur 48 MP ' +
      'avec zoom optique jusqu\'à 8x, jusqu\'à 33 h de lecture vidéo, USB-C.',
  },
  'iPhone 17 Pro Max': {
    colors: 'Orange cosmique, Bleu profond, Argent',
    specs:
      'Écran Super Retina XDR 6,9 po ProMotion 120 Hz, puce A19 Pro, triple capteur 48 MP ' +
      'avec zoom optique jusqu\'à 8x, jusqu\'à 39 h de lecture vidéo, USB-C.',
  },
  'iPhone Air': {
    colors: 'Bleu ciel, Or clair, Blanc nuage, Noir sidéral',
    specs:
      'L\'iPhone le plus fin jamais conçu (5,6 mm) avec châssis en titane. ' +
      'Écran Super Retina XDR 6,5 po ProMotion 120 Hz, puce A19 Pro, caméra Fusion 48 MP, ' +
      'caméra frontale Center Stage 18 MP, jusqu\'à 27 h de lecture vidéo, USB-C.',
  },
};

// ── MODELS ───────────────────────────────────────────────────────────────────
const MODELS = [
  { model: 'iPhone 17 Pro',     storage: '256 Go', price: 835000 },
  { model: 'iPhone 17 Pro',     storage: '512 Go', price: 945000 },
  { model: 'iPhone 17 Pro',     storage: '1 To',   price: 1100000 },
  { model: 'iPhone 17 Pro Max', storage: '256 Go', price: 925000 },
  { model: 'iPhone 17 Pro Max', storage: '512 Go', price: 1075000 },
  { model: 'iPhone 17 Pro Max', storage: '1 To',   price: 1225000 },
  { model: 'iPhone Air',        storage: '256 Go', price: 750000 },
  { model: 'iPhone Air',        storage: '512 Go', price: 880000 },
  { model: 'iPhone Air',        storage: '1 To',   price: 1010000 },
];

// Deterministic, human-readable document ID — this is what makes the seed
// idempotent. 'iPhone 17 Pro Max' + '512 Go' -> 'iphone-17-pro-max-512-go'
const DIACRITICS = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g'
);

function docId({ model, storage }) {
  return `${model} ${storage}`
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildName({ model, storage }) {
  return `${model} ${storage} — Neuf scellé (Apple USA)`;
}

function buildDescription({ model, storage }) {
  const family = FAMILIES[model];
  if (!family) throw new Error(`No FAMILIES entry for model "${model}"`);
  return [
    `${model} ${storage} — NEUF, scellé, importé directement d'Apple (USA).`,
    family.specs,
    `Couleurs : ${family.colors}.`,
    'Livraison à Ouagadougou.',
    ESIM_NOTE,
  ].join('\n');
}

function buildDoc(spec) {
  return {
    name: buildName(spec),
    category: CATEGORY,
    city: CITY,
    description: buildDescription(spec),
    price: spec.price, // number in Firestore; formatted as "835 000 FCFA" in the UI
    negotiable: false,
    stockStatus: 'in_stock',
    stockQuantity: null,
    phone: SELLER.phone,
    whatsapp: SELLER.whatsapp,
    photos: [],
    imageUrl: '',
    ownerId: SELLER.ownerId,
    ownerName: SELLER.ownerName,
    status: 'pending',
  };
}

async function main() {
  const force = process.argv.includes('--force');
  const dryRun = process.argv.includes('--dry-run');

  const unset = Object.entries(SELLER).filter(([, v]) => v === 'REPLACE_ME');
  if (unset.length) {
    console.error(
      `✖ SELLER.${unset.map(([k]) => k).join(', SELLER.')} still set to REPLACE_ME.\n` +
      '  Fill in the SELLER block at the top of this script before running.'
    );
    process.exit(1);
  }

  admin.initializeApp({ credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)) });
  const db = admin.firestore();

  let created = 0, updated = 0, skipped = 0;

  for (const spec of MODELS) {
    const id = docId(spec);
    const ref = db.collection('products').doc(id);
    const snap = await ref.get();
    const data = buildDoc(spec);

    if (snap.exists && !force) {
      console.log(`↷ skip    ${id} (already exists)`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`${snap.exists ? '~ update ' : '+ create '} ${id} — ${data.name} — ${data.price}`);
      snap.exists ? updated++ : created++;
      continue;
    }

    if (snap.exists) {
      // Preserve createdAt and any photos added through the app.
      await ref.set(data, { merge: true });
      console.log(`~ update  ${id}`);
      updated++;
    } else {
      await ref.set({ ...data, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      console.log(`+ create  ${id}`);
      created++;
    }
  }

  console.log(
    `\n${dryRun ? '[dry run] ' : ''}Done — ${created} created, ${updated} updated, ${skipped} skipped.` +
    (created || updated ? `\nListings are status='${buildDoc(MODELS[0]).status}'.` : '')
  );
  process.exit(0);
}

main().catch(err => {
  console.error('✖ Seed failed:', err.message);
  process.exit(1);
});
