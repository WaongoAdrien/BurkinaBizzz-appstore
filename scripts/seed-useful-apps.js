// scripts/seed-useful-apps.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent de la collection `usefulApps` (écran « Applications utiles »).
//
// Lancer   :  node scripts/seed-useful-apps.js
// Aperçu   :  node scripts/seed-useful-apps.js --dry-run
// Réécrire :  node scripts/seed-useful-apps.js --force
//
// Schéma : voir l'interface UsefulApp dans app/applications.tsx.
//   - `order` pilote le tri de la liste (croissant).
//   - `category` alimente les filtres, construits dynamiquement à partir des
//     fiches existantes : une nouvelle valeur crée simplement un nouveau filtre.
//   - Un champ absent reste absent — aucune valeur n'est inventée.
//
// Les 4 premières fiches (Orange Money, Moov Money, Coris Money, WhatsApp) ont
// été créées depuis le panneau admin et portent des IDs aléatoires ; elles ne
// sont pas gérées ici. Le garde-fou par nom empêche tout doublon avec elles.
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

// ── APPLICATIONS ─────────────────────────────────────────────────────────────
const APPS = [
  {
    // Sources : site officiel letsgo-app.com, App Store (id 6741215667,
    // éditeur KADER KABORE) et Google Play (com.bazarsoftech.letsgo,
    // éditeur BAZAR SOFT TECH).
    name: 'LetsGo BF',
    category: 'Transport',
    description: "Commandez un taxi 100 % électrique à Ouagadougou depuis votre téléphone. Réservation VTC avec tarif personnalisé, suivi du chauffeur en temps réel, historique des trajets et service de livraison de colis. Paiement en espèces ou par mobile money.",
    androidUrl: 'https://play.google.com/store/apps/details?id=com.bazarsoftech.letsgo',
    iosUrl: 'https://apps.apple.com/app/id6741215667',
    website: 'https://letsgo-app.com',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/00/e6/e4/00e6e43b-c97d-a896-3fe6-31e5c4421d42/AppIcon-0-0-1x_U007epad-0-1-85-220.png/512x512bb.jpg',
    order: 5,
  },
  {
    // Sources : fiche Google Play (com.fasozaaka.faso_zaaka, éditeur
    // « Faso Zaaka », mise à jour du 11 août 2026, catégorie « House & Home »)
    // et site officiel fasozaaka.com. Aucune version iOS : une recherche sur
    // l'App Store ne renvoie aucune fiche de l'éditeur.
    name: 'Faso Zaaka',
    category: 'Immobilier',
    description: "Application immobilière burkinabè pour chercher, louer, acheter, vendre ou publier un bien au Burkina Faso. Maisons, appartements, villas, résidences meublées, terrains et parcelles à Ouagadougou, Bobo-Dioulasso et ailleurs, avec filtres par ville, quartier, budget et type de bien. Photos, prix et descriptions consultables avant la visite, contact direct avec l'annonceur et négociation du loyer ou de la caution dans l'application. Les propriétaires, agences et démarcheurs peuvent publier et gérer leurs annonces depuis leur compte.",
    androidUrl: 'https://play.google.com/store/apps/details?id=com.fasozaaka.faso_zaaka',
    website: 'https://fasozaaka.com',
    image: 'https://play-lh.googleusercontent.com/12USW7aflgz466ifDehKTnMoAep_VHxDmKJ6jEBoDZWCSefOC-ThRX14Mqe0r8KF9XCzrpMqJts=s512-rw',
    order: 6,
  },
  {
    // Sources : page Facebook officielle (facebook.com/kaysexpressapp), site
    // kaysexpress.com — d'où viennent les liens de stores, la page Facebook ne
    // publiant que des raccourcis shorturl.at — App Store (id 6754810748,
    // éditeur Youssouf Woumtana) et Google Play
    // (com.toogoon.taxi.customer.toogoon_taxi_rider_app_v2, éditeur Heven Inc.).
    // Seule l'app client est référencée ici ; l'app conducteur & livreur
    // (com.toogoon.toogoon_driver_v2) ne concerne pas le grand public.
    name: 'Kays Express',
    category: 'Transport',
    description: "Commandez une course VTC ou un livreur à Ouagadougou et Bobo-Dioulasso. Chauffeur trouvé en quelques touches à partir de votre position, tarif estimé avant la commande, suivi du chauffeur ou du colis en temps réel sur la carte, partage du trajet avec vos proches, historique et reçus téléchargeables. Paiement en espèces ou par mobile money. Une offre entreprise, Kays Express Pro, propose facturation centralisée et suivi des déplacements des collaborateurs.",
    androidUrl: 'https://play.google.com/store/apps/details?id=com.toogoon.taxi.customer.toogoon_taxi_rider_app_v2',
    iosUrl: 'https://apps.apple.com/app/id6754810748',
    website: 'https://kaysexpress.com',
    image: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/54/c2/84/54c284bd-45e5-6cf7-bde9-a7fd9f1ab3f2/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/512x512bb.jpg',
    order: 7,
  },
];

async function main() {
  const force = process.argv.includes('--force');
  const dryRun = process.argv.includes('--dry-run');

  admin.initializeApp({ credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)) });
  const db = admin.firestore();

  // Garde-fou : une fiche du même nom peut déjà exister sous un ID aléatoire
  // (les fiches créées depuis le panneau admin n'ont pas d'ID déterministe).
  const existing = await db.collection('usefulApps').get();
  const byName = new Map();
  existing.forEach(d => byName.set((d.data().name || '').toLowerCase().trim(), d.id));

  let created = 0, updated = 0, skipped = 0;

  for (const app of APPS) {
    const id = docId(app.name);
    const clash = byName.get(app.name.toLowerCase().trim());

    if (clash && clash !== id) {
      console.log(`⚠ ignoré  ${id} — une fiche "${app.name}" existe déjà (${clash})`);
      skipped++;
      continue;
    }

    const ref = db.collection('usefulApps').doc(id);
    const snap = await ref.get();

    if (snap.exists && !force) {
      console.log(`↷ ignoré  ${id} (déjà présent)`);
      skipped++;
      continue;
    }

    if (dryRun) {
      console.log(`${snap.exists ? '~ maj    ' : '+ créé   '} ${id} — ${app.name}`);
      snap.exists ? updated++ : created++;
      continue;
    }

    await ref.set(app, { merge: true });
    console.log(`${snap.exists ? '~ maj    ' : '+ créé   '} ${id}`);
    snap.exists ? updated++ : created++;
  }

  console.log(
    `\n${dryRun ? '[aperçu] ' : ''}Terminé — ${created} créée(s), ${updated} mise(s) à jour, ${skipped} ignorée(s).`
  );
}

main().then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
