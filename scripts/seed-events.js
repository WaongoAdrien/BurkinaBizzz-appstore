// scripts/seed-events.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent de la collection `events` (écran « Événements »).
//
// Lancer   :  node scripts/seed-events.js
// Aperçu   :  node scripts/seed-events.js --dry-run
// Réécrire :  node scripts/seed-events.js --force
//
// Schéma : voir l'interface EventItem dans app/evenement.tsx.
//   - `date` / `endDate` au format ISO 'YYYY-MM-DD'. `date` peut rester null
//     quand aucune date n'est publiée (deux fiches existantes le font déjà).
//   - `category` alimente les filtres de l'écran, construits à partir des
//     valeurs présentes : réutiliser une catégorie existante quand c'est
//     possible (Culture, Musique, Danse, Sport, Mode, Tradition, Gastronomie…).
//   - Un champ absent reste null — aucune valeur n'est inventée.
//
// Les fiches existantes ont été créées depuis le panneau admin et portent des
// IDs aléatoires ; elles ne sont pas gérées ici. Le garde-fou par nom empêche
// tout doublon avec elles.
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'kosso-gym-00b786807f6b.json');

const DIACRITICS = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g'
);

// ID déterministe dérivé du nom — c'est ce qui rend le seed idempotent.
function docId(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── ÉVÉNEMENTS ───────────────────────────────────────────────────────────────
const EVENTS = [
  {
    // Sources : page Facebook officielle (festivalrendezvouscheznous) et site
    // de l'association organisatrice, acmur-rdvcheznous.org.
    // Aucune date d'édition n'est publiée, ni sur la page Facebook ni sur le
    // site (dont l'actualité s'arrête en 2016) : `date` reste donc null, comme
    // pour Jazz à Ouaga et le Festival Garba.
    name: 'Festival Rendez-vous chez nous',
    category: 'Culture',
    location: 'Ouagadougou',
    date: null,
    endDate: null,
    phone: '+226 64 00 20 01',
    website: 'https://acmur-rdvcheznous.org',
    facebook: 'https://www.facebook.com/festivalrendezvouscheznous',
    mapLink: null,
    image: null,                       // aucune image libre de droits disponible
    description: "Festival des arts de la rue de Ouagadougou, entièrement gratuit et joué hors les murs, dans les rues et les quartiers de la ville. Au programme : théâtre de rue, cirque, clowns, marionnettes, danse et musique. Il est organisé par l'ACMUR (Association Arts, Clowns, Marionnettes et Musique dans nos rues), créée en 2002 pour structurer et développer les arts de la rue en Afrique de l'Ouest.",
  },
  {
    // Source : page Facebook officielle (profile.php?id=61572143407199), qui
    // annonce « Festival international de conte YELEEN du 23 au 30 décembre 2026 ».
    name: 'Festival Yeleen',
    category: 'Culture',
    location: 'Bobo-Dioulasso',
    date: '2026-12-23',
    endDate: '2026-12-30',
    phone: '+226 76 55 95 92',
    website: null,                     // aucun site web publié
    facebook: 'https://www.facebook.com/profile.php?id=61572143407199',
    mapLink: null,
    image: null,                       // aucune image libre de droits disponible
    description: "Festival international de conte de Bobo-Dioulasso, dont l'édition 2026 se tient du 23 au 30 décembre. La programmation réunit conteurs et artistes burkinabè et internationaux.",
  },
];

async function main() {
  const force = process.argv.includes('--force');
  const dryRun = process.argv.includes('--dry-run');

  admin.initializeApp({ credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)) });
  const db = admin.firestore();

  // Garde-fou : une fiche du même nom peut déjà exister sous un ID aléatoire.
  const existing = await db.collection('events').get();
  const byName = new Map();
  existing.forEach(d => byName.set((d.data().name || '').toLowerCase().trim(), d.id));

  let created = 0, updated = 0, skipped = 0;

  for (const ev of EVENTS) {
    const id = docId(ev.name);
    const clash = byName.get(ev.name.toLowerCase().trim());

    if (clash && clash !== id) {
      console.log(`⚠ ignoré  ${id} — un événement "${ev.name}" existe déjà (${clash})`);
      skipped++;
      continue;
    }

    const ref = db.collection('events').doc(id);
    const snap = await ref.get();

    if (snap.exists && !force) {
      console.log(`↷ ignoré  ${id} (déjà présent)`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`${snap.exists ? '~ maj    ' : '+ créé   '} ${id} — ${ev.name}`);
      snap.exists ? updated++ : created++;
      continue;
    }

    if (snap.exists) {
      // On préserve createdAt et l'image éventuellement ajoutée depuis l'admin.
      const { image, ...rest } = ev;
      await ref.set(rest, { merge: true });
      console.log(`~ maj     ${id}`);
      updated++;
    } else {
      await ref.set({ ...ev, createdAt: admin.firestore.FieldValue.serverTimestamp() });
      console.log(`+ créé    ${id}`);
      created++;
    }
  }

  console.log(
    `\n${dryRun ? '[aperçu] ' : ''}Terminé — ${created} créé(s), ${updated} mis à jour, ${skipped} ignoré(s).`
  );
}

main().then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
