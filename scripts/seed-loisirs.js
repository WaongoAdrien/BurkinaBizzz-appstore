// scripts/seed-loisirs.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des lieux de loisirs / distraction.
//
// Lancer   :  node scripts/seed-loisirs.js
// Aperçu   :  node scripts/seed-loisirs.js --dry-run
// Réécrire :  node scripts/seed-loisirs.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// Catégorie 'Attractions' : catégorie existante la plus proche pour un lieu de
// loisirs (il n'existe pas de catégorie Jeux / Divertissement dans l'app).
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses, everyDay } = require('./lib/business-seed');

const CATEGORY = 'Attractions';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Source : page Facebook officielle (profile.php?id=100093817431762).
    // Catégorie Facebook : « Video Game ». La bio écrit « Kaparla », mais le
    // champ Adresse de la page indique « Karpala noura » — c'est celui-ci qui est repris.
    name: 'Weïbiland',
    address: 'Karpala noura',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 07 60 65 34',
    facebook: 'https://www.facebook.com/profile.php?id=100093817431762',
    instagram: null,
    openingHours: null,                // aucun horaire publié (la page indique seulement « Fermé »)
    description: 'Espace de réalité virtuelle et d\'arcade, présenté comme le 1er du genre au Burkina Faso. Jeux VR et bornes d\'arcade. Karpala, Ouagadougou.',
  },
  {
    // Source : page Facebook officielle, catégorie « Tourist Attraction ».
    // Google Maps référence le lieu en double, sous deux noms différents
    // (« Espace écotouristique chez Komi » et « Espace komi ») mais au même
    // Plus Code 8GQC+HQ7 — d'où viennent les coordonnées ci-dessous.
    name: 'Espace culturel chez Komi',
    address: 'Karpala, en face de la mairie, au château Onea (8GQC+HQ7), Ouagadougou',
    latitude: 12.3389125, longitude: -1.4780781,
    phone: '+226 44 96 21 31',
    whatsapp: null,                    // aucun numéro WhatsApp publié
    facebook: 'https://www.facebook.com/profile.php?id=61590748363218',
    instagram: null,
    website: null,                     // aucun site web publié
    // Facebook indique « Always open ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Espace éco-touristique et culturel du quartier Karpala, rassemblant une variété d'espèces végétales et animales. L'établissement met en avant le tourisme local et propose des plats locaux dans un cadre nature.",
  },
  {
    // Sources : page Facebook officielle + site de l'association organisatrice,
    // acmur-rdvcheznous.org.
    // Festival « hors les murs » : les spectacles se jouent dans la rue et dans
    // les quartiers, il n'y a donc pas de lieu fixe. Le site ne publie qu'une
    // boîte postale (11 BP 671 Ouagadougou 11), d'où l'adresse et les
    // coordonnées laissées nulles.
    name: 'Festival Rendez-vous chez nous',
    address: null,
    latitude: null, longitude: null,
    phone: '+226 64 00 20 01',
    whatsapp: null,                    // aucun numéro WhatsApp publié
    facebook: 'https://www.facebook.com/festivalrendezvouscheznous',
    instagram: null,
    website: 'https://acmur-rdvcheznous.org',
    openingHours: null,                // événement ponctuel, pas d'horaires d'ouverture
    description: "Festival des arts de la rue de Ouagadougou, entièrement gratuit et joué hors les murs, dans les rues et les quartiers de la ville. Au programme : théâtre de rue, cirque, clowns, marionnettes, danse et musique. Il est organisé par l'ACMUR (Association Arts, Clowns, Marionnettes et Musique dans nos rues), créée en 2002 pour structurer et développer les arts de la rue en Afrique de l'Ouest. Direction artistique : Boniface Kagambega.",
  },
  {
    // Source : page Facebook officielle (profile.php?id=61572143407199).
    // Seule fiche de ce seed située à Bobo-Dioulasso.
    // Aucune adresse précise ni coordonnées publiées : la page n'indique que
    // la ville. L'adresse e-mail de contact (ad.maisonparole@gmail.com) rattache
    // le festival à la Maison de la Parole.
    name: 'Festival Yeleen',
    city: 'Bobo-Dioulasso',
    address: null,
    latitude: null, longitude: null,
    phone: '+226 76 55 95 92',
    whatsapp: null,                    // aucun numéro WhatsApp publié
    facebook: 'https://www.facebook.com/profile.php?id=61572143407199',
    instagram: null,
    website: null,                     // aucun site web publié
    openingHours: null,                // événement ponctuel, pas d'horaires d'ouverture
    description: "Festival international de conte de Bobo-Dioulasso. L'édition 2026 se tient du 23 au 30 décembre. La programmation réunit conteurs et artistes burkinabè et internationaux.",
  },
  {
    // Sources : page Facebook officielle + fiche Google Maps « OASIS DU CHEVAL »
    // (école d'équitation, 4,1/5 sur 275 avis). Identification confirmée par la
    // boîte postale, identique des deux côtés (10 BP 13351 Ouagadougou 10).
    //
    // La page Facebook affiche « ffe.com » en lien, ce qui pointerait vers la
    // Fédération Française d'Équitation. Le vrai lien est le sous-domaine du
    // club sur la plateforme de la FFE, oasisducheval.ffe.com, que Google Maps
    // donne en entier et qui répond bien : c'est celui qui est retenu.
    name: 'Oasis du Cheval',
    categories: ['Attractions', 'Sport-Gym'],
    address: "Nioko 1 — échangeur de l'Est direction Fada, 2e feu à droite après la fin de la double voie (station Total), puis 2 km, long mur sur la droite (9HR9+JG), Ouagadougou",
    latitude: 12.3915165, longitude: -1.4312225,
    phone: '+226 76 20 63 67',
    whatsapp: null,                    // aucun numéro WhatsApp publié
    facebook: 'https://www.facebook.com/profile.php?id=100027949466113',
    instagram: null,
    website: 'https://oasisducheval.ffe.com',
    // Facebook affiche « Always open », ce qui n'est pas crédible pour un centre
    // équestre, et Google ne publie aucun horaire : laissé null plutôt que
    // d'afficher un « ouvert 24h/24 » trompeur dans l'app.
    openingHours: null,
    description: "Centre d'activités équestres et de loisirs situé à Nioko 1, à l'est de Ouagadougou. Il propose des cours d'équitation pour tous les âges et tous les niveaux ainsi que des promenades à cheval, dans un cadre calme et arboré.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
