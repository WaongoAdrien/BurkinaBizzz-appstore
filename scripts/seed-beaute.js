// scripts/seed-beaute.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des salons de coiffure, instituts de beauté et soins.
//
// Lancer   :  node scripts/seed-beaute.js
// Aperçu   :  node scripts/seed-beaute.js --dry-run
// Réécrire :  node scripts/seed-beaute.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses } = require('./lib/business-seed');

const CATEGORY = 'Coiffure & Beauté';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Sources : page Facebook officielle (profile.php?id=100063612442195) et
    // fiche Google Maps « Das'hair kalgondin » (salon de beauté, 4,4/5 sur
    // 16 avis), dont l'adresse — Zone d'Activités Diverses — est identique à
    // celle de la page Facebook.
    //
    // La page Facebook est celle de l'enseigne, pas d'une succursale : Google
    // recense trois adresses à Ouagadougou (Das'hair kalgondin, Das'hair Man et
    // Das'hair 1200). Une seule fiche est créée ici, sur l'adresse annoncée par
    // la page ; les deux autres pourront faire l'objet de fiches distinctes
    // reliées par relatedBusinessId si besoin.
    name: "Das'hair",
    address: "Zone d'Activités Diverses (Kalgondin), Ouagadougou",
    latitude: 12.3429015, longitude: -1.5028926,
    phone: '+226 67 12 88 62',
    whatsapp: '+226 67 12 88 62',      // bouton WhatsApp de la page : même numéro
    facebook: 'https://www.facebook.com/profile.php?id=100063612442195',
    // Le champ Instagram de la page contient « Das’hair », c'est-à-dire le nom
    // commercial avec une apostrophe typographique — un caractère interdit dans
    // un identifiant Instagram. Le lien est donc inexploitable et n'est pas repris.
    instagram: null,
    website: null,                     // aucun site web publié
    // Facebook affiche « Closed now » sans détailler la semaine, et Google ne
    // donne qu'une heure d'ouverture (9h30) sans heure de fermeture : pas de
    // quoi reconstituer une grille honnête, donc null.
    openingHours: null,
    description: "Salon de beauté capillaire à Ouagadougou, spécialisé dans le soin naturel et personnalisé du cheveu. L'enseigne compte plusieurs adresses dans la ville, dont un salon dédié aux hommes (Das'hair Man) et une adresse au quartier 1200 Logements.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
