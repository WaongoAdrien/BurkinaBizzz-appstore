// scripts/notify-new.js
// ─────────────────────────────────────────────────────────────────────────────
// Envoie une notification push par nouvelle fiche : entreprise de l'annuaire,
// événement ou site touristique.
//
// Aperçu   :  node scripts/notify-new.js --dry-run
// Envoi    :  node scripts/notify-new.js
// Amorçage :  node scripts/notify-new.js --baseline
//
// ── Comment le script sait ce qui est « nouveau » ────────────────────────────
// Il marque chaque fiche notifiée d'un champ `notifiedAt`, et n'envoie que pour
// celles qui n'en ont pas. Pas d'horloge à comparer, donc pas de fiche sautée
// ni renotifiée, et une entreprise soumise il y a un mois puis approuvée
// aujourd'hui part bien au moment de son approbation.
//
// ⚠ Premier lancement : `--baseline` marque tout l'existant comme déjà notifié
// sans rien envoyer. Sans ça, le premier envoi partirait pour les ~100 fiches
// déjà en base.
//
// Les jetons vivent dans `pushTokens` (voir lib/push.ts et firestore.rules).
// Ce script passe par le SDK Admin : les règles ne s'y appliquent pas.
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');
const admin = require('firebase-admin');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'kosso-gym-00b786807f6b.json');
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Expo refuse les lots de plus de 100 messages.
const CHUNK = 100;

// Ce qu'on surveille. `filter` écarte les fiches qui existent mais ne sont pas
// encore publiques — une entreprise en attente de modération, par exemple.
const SOURCES = [
  {
    collection: 'businesses',
    filter: d => d.status === 'approved',
    title: 'Nouvelle entreprise sur BurkinaBizz',
    body: d => [d.name, [d.category, d.city].filter(Boolean).join(' · ')].filter(Boolean).join(' — '),
    type: 'business',
  },
  {
    collection: 'events',
    filter: () => true,
    title: 'Nouvel événement',
    body: d => [d.name, d.location].filter(Boolean).join(' — '),
    type: 'event',
  },
  {
    collection: 'touristSites',
    filter: () => true,
    title: 'Nouveau site touristique',
    body: d => [d.name, d.location].filter(Boolean).join(' — '),
    type: 'site',
  },
];

const chunks = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

// Un envoi = un lot de messages identiques adressés à 100 jetons au plus.
// Expo renvoie un ticket par message, dans l'ordre : un ticket en erreur
// « DeviceNotRegistered » désigne donc un jeton à supprimer.
async function sendChunk(tokens, message) {
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(tokens.map(to => ({ to, sound: 'default', ...message }))),
  });

  if (!res.ok) throw new Error(`Expo a répondu ${res.status} ${res.statusText}`);

  const { data: tickets = [], errors } = await res.json();
  if (errors?.length) throw new Error(errors.map(e => e.message).join(' / '));

  const dead = [];
  tickets.forEach((ticket, i) => {
    if (ticket.status !== 'error') return;
    if (ticket.details?.error === 'DeviceNotRegistered') dead.push(tokens[i]);
    else console.warn(`  ⚠ ${tokens[i].slice(0, 24)}… : ${ticket.message}`);
  });
  return dead;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const baseline = process.argv.includes('--baseline');

  admin.initializeApp({ credential: admin.credential.cert(require(SERVICE_ACCOUNT_PATH)) });
  const db = admin.firestore();

  // ── Ce qu'il y a à annoncer ────────────────────────────────────────────────
  const pending = [];
  for (const source of SOURCES) {
    const snap = await db.collection(source.collection).get();
    snap.forEach(doc => {
      const data = doc.data();
      if (data.notifiedAt || !source.filter(data)) return;
      pending.push({ ref: doc.ref, id: doc.id, source, data });
    });
  }

  if (!pending.length) {
    console.log('Rien de nouveau à annoncer.');
    return;
  }

  // ── Amorçage : on marque sans envoyer ─────────────────────────────────────
  if (baseline) {
    console.log(`${pending.length} fiche(s) marquée(s) comme déjà notifiée(s), sans envoi :`);
    for (const item of pending) {
      console.log(`  · ${item.source.collection}/${item.id} — ${item.data.name}`);
      if (!dryRun) await item.ref.update({ notifiedAt: admin.firestore.FieldValue.serverTimestamp() });
    }
    console.log(`\n${dryRun ? '[aperçu] ' : ''}Amorçage terminé. Les prochains ajouts seront notifiés.`);
    return;
  }

  // ── Les destinataires ─────────────────────────────────────────────────────
  const tokenSnap = await db.collection('pushTokens').get();
  const tokens = tokenSnap.docs.map(d => d.data().token).filter(t => typeof t === 'string' && t.startsWith('Expo'));

  console.log(`${pending.length} fiche(s) à annoncer, ${tokens.length} terminal(aux) enregistré(s).\n`);
  if (!tokens.length && !dryRun) {
    console.log('Aucun jeton enregistré : rien n\'est envoyé et rien n\'est marqué.');
    return;
  }

  // ── Envoi, une notification par fiche ─────────────────────────────────────
  const dead = new Set();
  let sent = 0;

  for (const item of pending) {
    const message = {
      title: item.source.title,
      body: item.source.body(item.data),
      data: { type: item.source.type, id: item.id },
    };
    console.log(`${dryRun ? '~ aperçu ' : '→ envoi  '} ${message.title} : ${message.body}`);

    if (dryRun) continue;

    for (const chunk of chunks(tokens, CHUNK)) {
      (await sendChunk(chunk, message)).forEach(t => dead.add(t));
    }
    // Marquée seulement après un envoi réussi : si le script casse en cours de
    // route, la fiche repartira au prochain lancement plutôt que d'être perdue.
    await item.ref.update({ notifiedAt: admin.firestore.FieldValue.serverTimestamp() });
    sent++;
  }

  // ── Ménage : les installations désinstallées ──────────────────────────────
  for (const token of dead) {
    await db.collection('pushTokens').doc(token).delete();
  }

  console.log(
    `\n${dryRun ? '[aperçu] ' : ''}Terminé — ${sent} notification(s) envoyée(s)` +
    (dead.size ? `, ${dead.size} jeton(s) obsolète(s) supprimé(s).` : '.')
  );
}

main().then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec de l\'envoi :', err.message);
  process.exit(1);
});
