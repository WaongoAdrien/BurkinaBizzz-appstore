// scripts/seed-services.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des entreprises de services.
//
// Lancer   :  node scripts/seed-services.js
// Aperçu   :  node scripts/seed-services.js --dry-run
// Réécrire :  node scripts/seed-services.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// Une fiche peut porter plusieurs catégories via `categories` ; la première
// devient la catégorie principale.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses, everyDay } = require('./lib/business-seed');

const CATEGORY = 'Services';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Source : site officiel toolebf.com (pas de page Facebook trouvée).
    name: 'Toole Livraison',
    categories: ['Services', 'Autres'],
    // Le site donne l'adresse sous forme de Plus Code Google ; les coordonnées
    // viennent de la résolution de ce code, qui tombe bien à Wayalghin.
    address: 'CG3J+GH9 Wayalguin',
    latitude: 12.4037875, longitude: -1.4685156,
    phone: '+226 04 95 85 00',
    // Le site ne publie qu'un lien wa.me/message/… (lien de conversation, pas
    // un numéro) — impossible d'en déduire le numéro WhatsApp, donc laissé vide.
    whatsapp: null,
    facebook: null,
    instagram: null,
    website: 'https://www.toolebf.com',
    // Le site annonce « 24/7 · Jour & nuit ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: 'Plateforme de livraison de colis à Ouagadougou. La commande se fait directement par WhatsApp : le devis est généré automatiquement et la course est confiée à un livreur indépendant à proximité. Livraison express, colis volumineux, livraison de nuit, envois groupés et suivi en temps réel. Paiement mobile money ou à la livraison.',
  },
  {
    // Source : page Facebook officielle (facebook.com/destinyeventsbf),
    // consultée dans le navigateur — catégorie Facebook « Event Videographer »,
    // 8,4 K abonnés. La section « Contact info » ne publie qu'un téléphone et
    // un e-mail : pas d'adresse postale ni de numéro WhatsApp dédié, bien que
    // la page affiche un bouton WhatsApp.
    name: 'Destiny Events',
    categories: ['Services'],
    address: null,                     // aucune adresse publiée, seulement la ville
    latitude: null, longitude: null,
    phone: '+226 63 62 86 86',
    whatsapp: null,
    facebook: 'https://www.facebook.com/destinyeventsbf',
    instagram: null,
    website: null,                     // aucun site web publié
    // La page annonce un studio photo ouvert 7j/7 mais ne publie aucun horaire.
    openingHours: null,
    description: "Équipe de photographes et vidéastes d'événements basée à Ouagadougou : fiançailles, mariages, baptêmes, anniversaires et autres événements privés, avec des images livrées dans les délais. L'enseigne tient également un studio photo ouvert 7j/7. E-mail : destinypicturesbf@gmail.com.",
  },
  {
    // Source : page Facebook officielle (facebook.com/sdfinternationale, nom
    // affiché « SDF Voyage »), consultée dans le navigateur — catégorie
    // Facebook « Local business », 9,2 K abonnés.
    //
    // Le champ « Contact info » ne donne qu'un mobile ; les autres numéros
    // vus (25 50 50 21, 63 90 96 95) viennent de publications, dont une de
    // 2023 : seul le numéro déclaré par la page est retenu comme téléphone,
    // le standard étant cité dans la description.
    name: 'SDF Voyage',
    categories: ['Services'],
    address: 'Rue 10.60, secteur 8, Hamdallaye, Ouagadougou',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 67 26 01 68',
    whatsapp: null,                    // aucun numéro WhatsApp publié
    facebook: 'https://www.facebook.com/sdfinternationale',
    instagram: null,
    // La page renvoie vers sdfvoyage.online, mais le domaine ne résout plus
    // (NXDOMAIN) — non retenu.
    website: null,
    openingHours: null,                // aucun horaire publié
    description: "Agence de voyage de Ouagadougou, à Hamdallaye : billetterie, assistance visa, assurance voyage, hébergement, réservations, organisation de voyages touristiques, location de voitures et conseils. Standard annoncé sur ses supports : +226 25 50 50 21. E-mail : sdfvoyage@gmail.com.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
