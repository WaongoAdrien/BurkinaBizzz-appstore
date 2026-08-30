// scripts/seed-sport.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des salles de sport et centres de remise en forme.
//
// Lancer   :  node scripts/seed-sport.js
// Aperçu   :  node scripts/seed-sport.js --dry-run
// Réécrire :  node scripts/seed-sport.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses } = require('./lib/business-seed');

const CATEGORY = 'Sport-Gym';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Source : page Facebook officielle (fitnessouaga). La page s'intitule
    // « Crossfit Ouaga » et la bio présente la structure sous le nom
    // « 100% Fitness ».
    //
    // Google Maps référence deux fiches voisines sur cette même avenue :
    //   - « Crossfit ouaga2000 » (Gym, Plus Code 8F4J+HP5) — nom identique à la
    //     page Facebook, d'où viennent les coordonnées ci-dessous ;
    //   - « Centre Sportif OUAGA 2000 » (complexe sportif), qui porte exactement
    //     le même téléphone que la page Facebook et précise le repère
    //     « face à la DG des douanes ».
    // Les deux désignent selon toute vraisemblance le même site.
    name: 'CrossFit Ouaga',
    address: 'Avenue Pascal Zagré, face à la DG des douanes, Ouaga 2000 (8F4J+HP5), Ouagadougou',
    latitude: 12.3063875, longitude: -1.5181406,
    phone: '+226 62 76 76 66',
    // Facebook publie explicitement un numéro WhatsApp distinct du téléphone.
    whatsapp: '+226 65 38 99 89',
    facebook: 'https://www.facebook.com/fitnessouaga',
    instagram: null,
    // fitnessouaga.com est annoncé sur la page Facebook mais le domaine ne
    // résout plus (NXDOMAIN) : lien volontairement omis.
    website: null,
    // Facebook affiche « Open now » sans détailler la semaine, et Google ne
    // donne qu'une heure de fermeture (21h) sans heure d'ouverture : pas de
    // quoi reconstituer une grille honnête, donc null.
    openingHours: null,
    description: "Centre de remise en forme de Ouaga 2000, encadré par des professionnels du fitness. Cours de CrossFit et de spinning, coaching personnalisé, suivi nutritionnel et de performance. La salle organise régulièrement des programmes collectifs de transformation physique sur plusieurs semaines.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
