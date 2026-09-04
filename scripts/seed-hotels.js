// scripts/seed-hotels.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des hôtels / espaces de séjour.
//
// Lancer   :  node scripts/seed-hotels.js
// Aperçu   :  node scripts/seed-hotels.js --dry-run
// Réécrire :  node scripts/seed-hotels.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses, everyDay } = require('./lib/business-seed');

const CATEGORY = 'Hôtellerie';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Source : page Facebook officielle (profile.php?id=61585418196536).
    // Catégorie Facebook : « Hotel Services Company ».
    name: 'Riim Palace de Gampela',
    address: 'RN4, Gampela, à 300 m de Coca-Cola',
    latitude: null, longitude: null,   // coordonnées non publiées
    // Deux numéros distincts sur la page : le téléphone affiché et un numéro
    // WhatsApp dédié (confirmé par le lien wa.me/22672200101).
    phone: '+226 44 10 20 68',
    whatsapp: '+226 72 20 01 01',
    facebook: 'https://www.facebook.com/profile.php?id=61585418196536',
    instagram: 'riim_palace_gampela',
    // La page indique « Always open ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Espace détente à Gampela : chambres climatisées et suites, salle de conférence ultra-moderne, piscine, restaurant-bar et service traiteur sur mesure. Situé sur la RN4, à 300 m de Coca-Cola.",
  },
  {
    // Source : page Facebook officielle (facebook.com/residencewifi).
    // Catégorie Facebook : « Hotel & Lodging », mais l'offre (studios et
    // appartements meublés en location journalière) relève de « Résidence meublée ».
    name: 'Résidence WIFI',
    categories: ['Résidence meublée'],
    // La page donne son adresse sous forme de Plus Code Google ; les coordonnées
    // viennent de sa résolution. Aucun nom de quartier n'est publié pour recouper.
    address: '6FW7+9R Ouagadougou',
    latitude: 12.2459375, longitude: -1.5354375,
    phone: '+226 69 11 05 47',
    // La bio invite à réserver « via WhatsApp » mais la page ne publie aucun
    // numéro WhatsApp dédié — non déduit du téléphone.
    whatsapp: null,
    facebook: 'https://www.facebook.com/residencewifi',
    instagram: null,
    website: null,
    // La page indique « Always open ».
    openingHours: everyDay('00:00', '00:00'),
    description: "Studios et appartements meublés au cœur de la ville : wifi illimité, équipements complets et service de ménage. Location journalière, hebdomadaire ou mensuelle.",
  },
  {
    // Source : page Facebook officielle (facebook.com/MassabaLodge).
    // La page se décrit comme « Bar - Restaurant - Hébergement », d'où les deux
    // catégories ; catégorie Facebook : « Lodge ».
    name: 'Massaba Lodge',
    categories: ['Hôtellerie', 'Restauration'],
    address: 'Zogona',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 64 77 20 20',
    // Déclaré dans le champ « WhatsApp number » de la page.
    whatsapp: '+226 64 77 20 20',
    facebook: 'https://www.facebook.com/MassabaLodge',
    instagram: 'massabalodge',
    website: null,                     // aucun site, seul un lien Instagram
    // La page indique « Always open ».
    openingHours: everyDay('00:00', '00:00'),
    description: 'Bar, restaurant et hébergement à Zogona, Ouagadougou.',
  },
  {
    // Source : page Facebook officielle (facebook.com/akandalodge).
    // ⚠ L'établissement est à KOUDOUGOU, pas à Ouagadougou. Le type City de
    // l'app ne connaît que Ouagadougou et Bobo-Dioulasso ; classé à Ouagadougou
    // sur décision explicite, faute de mieux. L'adresse et la première phrase de
    // la description annoncent Koudougou pour éviter toute confusion.
    // À rebasculer si 'Koudougou' est un jour ajouté au type City.
    name: 'Akanda Lodge',
    categories: ['Hôtellerie', 'Attractions'],
    address: "Koudougou, non loin de l'université Norbert Zongo, à 200 m à droite après Gapal",
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 57 63 36 24',
    facebook: 'https://www.facebook.com/akandalodge',
    instagram: null,
    website: null,
    openingHours: null,                // aucun horaire publié
    description: "Situé à Koudougou, non loin de l'université Norbert Zongo. Hébergement et loisirs : villas meublées, terrasse, bar, billard et baby-foot, espace VIP climatisé.",
  },
  {
    // Source : page Facebook officielle (profile.php?id=61550925737347).
    // Même téléphone (+226 60 16 80 80) et même e-mail (contact@villakaya.net)
    // que Villa Kaya : même exploitant, à deux adresses distinctes (Zogona ici,
    // Saint Léon pour Villa Kaya). Les deux fiches sont donc reliées.
    // L'adresse est publiée sous forme de Plus Code ; les coordonnées viennent
    // de sa résolution, qui tombe bien à Zogona.
    name: "L'Hédone Hôtel Ouagadougou",
    address: 'Zogona (9GJ4+6R8)',
    latitude: 12.3805375, longitude: -1.4929219,
    phone: '+226 60 16 80 80',
    facebook: 'https://www.facebook.com/profile.php?id=61550925737347',
    instagram: null,
    website: null,                     // villakaya.net redirige vers une page Facebook indisponible
    openingHours: null,                // aucun horaire publié
    description: 'Hôtel de charme à Zogona, Ouagadougou.',
    relatedBusinessId: 'villa-kaya',
  },
  {
    // Sources : page Facebook officielle + site hoteland-bf.com.
    // L'adresse est publiée sous forme de Plus Code sur le site ; les
    // coordonnées viennent de sa résolution, qui tombe bien à Ouaga 2000.
    name: 'Complexe Hôtelier AnD',
    categories: ['Hôtellerie', 'Restauration'],
    address: 'Ouaga 2000 (7GV7+F28), Ouagadougou',
    latitude: 12.2936625, longitude: -1.4874219,
    phone: '+226 05 22 02 02',
    whatsapp: '+226 05 22 02 02',      // numéro WhatsApp affiché tel quel sur le site
    facebook: 'https://www.facebook.com/profile.php?id=61559526430454',
    instagram: null,
    website: 'https://hoteland-bf.com',
    // Facebook indique « Always open » et le site annonce une réception 24h/24.
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Hôtel-restaurant de Ouaga 2000. Trois catégories de chambres, petit-déjeuner inclus : Standard à 37 500 FCFA, Privilège à 42 500 FCFA et Prestige à 50 000 FCFA la nuit. Réception ouverte 24h/24, room-service, conciergerie et petit-déjeuner servi de 7h15 à 11h en salle ou en chambre. Terrasse panoramique au 3e étage, bar et restaurant sur place.",
  },
  {
    // Source : page Facebook officielle.
    name: 'Welcome Lodge',
    address: 'Ouaga 2000, non loin du Monument des Martyrs, Ouagadougou',
    // Deux fiches « Welcome Lodge » distinctes existent sur Google Maps sans
    // moyen de trancher laquelle correspond à cette page : coordonnées laissées
    // nulles plutôt que de risquer un point erroné sur la carte.
    latitude: null, longitude: null,
    phone: '+226 65 80 94 85',
    // Le bouton WhatsApp de la page pointe vers un autre numéro que le
    // téléphone affiché — les deux sont donc renseignés séparément.
    whatsapp: '+226 60 60 15 07',
    facebook: 'https://www.facebook.com/welcomelodgeouaga',
    instagram: null,
    // welcome-lodgebf.com est enregistré mais non exploité : le domaine
    // n'affiche que la page d'attente du registrar LWS.
    website: null,
    // Facebook indique « Always open ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Résidence de charme au cœur de Ouaga 2000, à proximité du Monument des Martyrs. Cadre sécurisé et accueil disponible 24h/24.",
  },
  {
    // Sources : page Facebook officielle + site palmbeach-burkina.com.
    // Coordonnées : fiche Google Maps « Hotel Palm Beach », confirmée par le
    // téléphone identique à celui publié sur Facebook et sur le site.
    name: 'Palm Beach Hôtel',
    categories: ['Hôtellerie', 'Restauration'],
    address: "Avenue Kwamé N'Krumah, Ouagadougou",
    latitude: 12.362092, longitude: -1.5182527,
    phone: '+226 25 31 09 91',
    // Ligne fixe, aucun numéro WhatsApp publié.
    whatsapp: null,
    facebook: 'https://www.facebook.com/PalmBeachHotelOuaga',
    instagram: null,
    website: 'https://palmbeach-burkina.com',
    // Facebook indique « Always open ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Hôtel 3 étoiles de l'avenue Kwamé N'Krumah, au centre de Ouagadougou. Chambres standard rénovées, chambres privilège et suites ministérielles, toutes équipées d'une salle de bain, d'un téléphone avec ligne directe, d'une télévision (plus de 20 chaînes), d'un mini-bar et d'une radio ; les suites disposent en plus d'un salon. Piscine, Wi-Fi et parking gratuits, bar-restaurant et trois salles de réunion pour conférences et séminaires. Tarifs publiés par l'hôtel : de 50 000 FCFA la chambre standard single à 125 000 FCFA la suite ministérielle double, petit-déjeuner buffet à 5 000 FCFA.",
  },
  {
    // Source : page Facebook officielle (aucune autre source publique trouvée).
    name: 'Résidence La Palmeraie Ouaga',
    address: 'Avenue du Prof. Joseph Ki-Zerbo, Ouagadougou',
    // Établissement absent de Google Maps : coordonnées laissées nulles.
    latitude: null, longitude: null,
    phone: '+226 25 30 48 90',
    // Ligne fixe, aucun numéro WhatsApp publié.
    whatsapp: null,
    facebook: 'https://www.facebook.com/profile.php?id=100069818692170',
    instagram: null,
    // fortandem.com est annoncé sur la page Facebook mais le domaine ne résout
    // plus (aucun enregistrement DNS) : lien volontairement omis.
    website: null,
    // Facebook indique « Always open ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Résidence hôtelière de l'avenue du Professeur Joseph Ki-Zerbo, à Ouagadougou. Elle compte 27 chambres réparties en 5 catégories, de la Standard à la Suite Junior.",
  },
  {
    // Sources : page Facebook officielle + fiche Google Maps « Cocody + ».
    // Identification de la fiche Maps corroborée par deux éléments : le quartier
    // (Bilbalogho) et la distance au stade Municipal — 250 m, ce qui recoupe le
    // « non loin du stade Municipal » annoncé par l'établissement lui-même.
    // Réserve : Google Maps affiche un autre numéro (+226 78 00 36 82), sans
    // doute périmé (avis vieux de 5 à 6 ans) ; on retient celui de Facebook.
    name: 'Cocody Plus Ouaga',
    categories: ['Hôtellerie', 'Restauration', 'Soirées'],
    address: 'Bilbalogho, non loin du stade Municipal (9F69+GC), Ouagadougou',
    latitude: 12.3612587, longitude: -1.5314043,
    phone: '+226 54 08 08 06',
    whatsapp: '+226 61 28 67 67',     // numéro du bouton WhatsApp de la page
    facebook: 'https://www.facebook.com/Cocodyplus',
    instagram: null,
    // cocodyplus.com et cocosyplus.com (annoncé sur Maps) ne résolvent ni l'un
    // ni l'autre : aucun site exploitable.
    website: null,
    // « Open 24 hours » sur Google Maps ; Facebook ne publie pas d'horaires.
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Complexe réunissant chambres d'hôtes, spa, restaurant et bar lounge, à Bilbalogho, à quelques pas du stade Municipal. Massages et prestations bien-être, restauration sur place, à emporter ou en livraison, et espace accueillant réceptions et cérémonies.",
  },
  {
    // Source : fiche Google Maps « Palace HOTEL » (3 étoiles, 893 avis).
    name: 'Palace Hôtel',
    address: 'Ouaga 2000 (8F4C+HMP), Ouagadougou',
    latitude: 12.3064745, longitude: -1.5282857,
    phone: '+226 25 37 50 60',
    whatsapp: null,
    facebook: null,
    instagram: null,
    // Google Maps renvoie vers une page Google Sites au nom de l'hôtel, mais ses
    // boutons « BOOK NOW » pointent tous vers une recherche Booking.com avec un
    // identifiant d'affiliation (aid=1224331) — et sur la ville entière, pas sur
    // cet hôtel. Il s'agit donc d'une page d'affiliation tierce, pas du site de
    // l'établissement : lien volontairement omis.
    website: null,
    // Réception annoncée 24h/24.
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Hôtel 3 étoiles de Ouaga 2000. Chambres climatisées équipées d'un minibar et d'un réfrigérateur. Réception ouverte 24h/24, service en chambre, consigne à bagages et blanchisserie. Piscine extérieure, Wi-Fi, petit-déjeuner et parking gratuits. Arrivée et départ à 12h.",
  },
  {
    // Sources : page Facebook officielle + fiche Google Maps « Hotel Timbila »
    // (3 étoiles, 172 avis), dont le téléphone est identique à celui de Facebook.
    // Pabré est à une quinzaine de kilomètres au nord de Ouagadougou ; Google
    // Maps rattache d'ailleurs l'adresse à Ouagadougou, comme les fiches
    // existantes de Gampela, Loumbila ou Saponé.
    name: 'Hôtel Timbila',
    categories: ['Hôtellerie', 'Restauration'],
    address: 'Route N22, Pabré (GC2M+RF), Ouagadougou',
    latitude: 12.5021207, longitude: -1.5663581,
    phone: '+226 70 29 70 00',
    whatsapp: '+226 70 29 70 00',      // bouton WhatsApp de la page : même numéro
    facebook: 'https://www.facebook.com/profile.php?id=100063499542507',
    instagram: null,
    // hoteltimbila.com est annoncé sur la page Facebook mais le domaine ne
    // résout plus (aucun enregistrement DNS) : lien volontairement omis.
    website: null,
    // Facebook indique « Always open ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Hôtel 3 étoiles installé à l'entrée de Pabré, au nord de Ouagadougou, dans un cadre verdoyant. L'établissement dispose d'un restaurant, d'un bar, d'une pizzeria, d'une piscine et d'une salle de conférence.",
  },
  {
    // Sources : page Facebook officielle, site hotelresidenceprestige.com et
    // fiche Google Maps, dont le téléphone est identique à celui de Facebook.
    name: 'Hôtel Résidence Prestige',
    categories: ['Hôtellerie', 'Restauration'],
    address: 'Ouaga 2000, Ouagadougou',
    latitude: 12.3111047, longitude: -1.506337,
    phone: '+226 25 37 43 20',
    whatsapp: null,                    // aucun numéro WhatsApp publié
    facebook: 'https://www.facebook.com/profile.php?id=100064227872114',
    instagram: null,
    website: 'https://hotelresidenceprestige.com',
    // Facebook indique « Always open ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Hôtel 3 étoiles au cœur de Ouaga 2000, le quartier d'affaires et résidentiel de Ouagadougou. Il compte 35 chambres et suites climatisées réparties en trois catégories — standard, suite junior et suite prestige — équipées d'un mini-bar, d'un téléviseur plasma avec abonnement Canal+, d'un détecteur de fumée et d'un accès Wi-Fi haut débit gratuit. Bar-restaurant proposant une cuisine africaine, européenne et asiatique, service traiteur pour séminaires et cérémonies, et salle de réunion/banquet.",
  },
  {
    // Sources : page Facebook officielle + fiche Google Maps.
    // Les coordonnées viennent du lien Maps que l'établissement publie
    // lui-même dans le champ adresse de sa page Facebook.
    name: 'Village Nong Taaba',
    categories: ['Hôtellerie', 'Restauration'],
    address: 'Ouaga 2000 (8G58+48C), Ouagadougou',
    latitude: 12.3062498, longitude: -1.4818459,
    // Deux lignes existent : Facebook affiche le 25 46 00 93 en bouton d'appel,
    // Google Maps le 25 46 00 92. On retient celle mise en avant par la page.
    phone: '+226 25 46 00 93',
    whatsapp: null,                    // aucun numéro WhatsApp publié
    facebook: 'https://www.facebook.com/profile.php?id=100089731410469',
    instagram: null,
    website: null,                     // aucun site web publié
    // Facebook indique « Always open ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Complexe hôtelier de Ouaga 2000 réunissant hébergement, restaurant, bar, piscine, spa et espace cérémonial. Cadre paisible et architecture traditionnelle, avec Wi-Fi, parking gratuit, piscine extérieure et service de blanchisserie. L'établissement accueille aussi les familles.",
  },
  {
    // Sources : site chezgiuliana.com (à jour, mention de copyright 2025) et
    // fiche Google Maps, dont le téléphone est identique à celui du site.
    // La page Facebook, elle, n'est plus alimentée depuis des années : elle ne
    // publie qu'une adresse e-mail, sans téléphone.
    name: "Maison d'hôtes Chez Giuliana",
    categories: ['Hôtellerie', 'Résidence meublée'],
    address: 'Rue Lamine Guye, porte 733, 1200 Logements, Ouagadougou',
    latitude: 12.3643302, longitude: -1.4951026,
    phone: '+226 25 46 46 36',
    whatsapp: null,                    // aucun numéro WhatsApp publié
    facebook: 'https://www.facebook.com/profile.php?id=100057320655940',
    instagram: null,
    website: 'https://www.chezgiuliana.com',
    openingHours: null,                // aucun horaire publié
    description: "Maison d'hôtes du quartier résidentiel des 1200 Logements, entre l'aéroport et le centre-ville. Chambres climatisées et individuellement décorées, équipées de moustiquaires, avec Wi-Fi gratuit et petit-déjeuner servi sur la terrasse panoramique. Groupe électrogène et réservoirs d'eau assurent électricité et eau en continu. Services : restaurant avec livraison, cuisine commune, bibliothèque et salle de réunion, pressing, parking gratuit, transfert aéroport et location de 4x4. La maison loue également deux villas meublées pour les longs séjours, tout compris : la villa Wemtem (2 chambres) à 35 000 FCFA la journée, minimum deux semaines, ou 650 000 FCFA le mois, et la villa Gianni (deux studios et un appartement) à 45 000 FCFA la journée. Second numéro : +226 75 32 75 32.",
  },
  {
    // Sources : page Facebook officielle + fiche Google Maps, dont le téléphone
    // est identique. Les coordonnées viennent du lien Maps que l'établissement
    // publie lui-même dans ses publications.
    // Réserve : Facebook annonce « Always open » tandis que Google indique une
    // fermeture à minuit. On retient la déclaration de l'établissement, la fiche
    // Google n'étant pas revendiquée (« Claim this business »).
    name: 'Première Classe +',
    categories: ['Hôtellerie', 'Restauration'],
    address: 'Ouaga 2000 (8G64+Q7), Ouagadougou',
    latitude: 12.3119742, longitude: -1.4942768,
    phone: '+226 55 96 96 42',
    whatsapp: '+226 55 96 96 42',      // bouton WhatsApp de la page : même numéro
    facebook: 'https://www.facebook.com/premiereclasseplus',
    instagram: null,
    website: null,                     // aucun site web publié
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Complexe de Ouaga 2000 réunissant chambres d'hôtes, spa, piscine, restaurant lounge, espace événementiel et salle de conférence. L'adresse s'adresse aussi bien aux séjours de détente qu'aux séminaires et réunions professionnelles.",
  },
  {
    // Sources : site officiel soniahotels.com (page d'accueil + « Contact us »)
    // et la page Facebook officielle (facebook.com/SoniaHotelsOuagadougou).
    // Le site publie trois numéros ; le premier est retenu comme téléphone
    // principal, les deux autres sont cités dans la description.
    name: 'Sonia Hôtel',
    categories: ['Hôtellerie', 'Restauration'],
    address: 'Secteur 6, Rue Mogho Naaba Kiba (6.10), à côté de TCV, Ouagadougou (01 BP 2606 Ouaga 01)',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 01 61 61 61',
    whatsapp: null,                    // aucun numéro WhatsApp publié
    facebook: 'https://www.facebook.com/SoniaHotelsOuagadougou',
    instagram: null,                   // seuls Facebook et Google Maps sont liés
    website: 'https://soniahotels.com',
    openingHours: null,                // aucun horaire publié
    description: "Hôtel 4 étoiles du centre-ville, à deux minutes de l'aéroport international. 80 chambres avec internet haut débit gratuit, téléviseurs connectés et climatisation individuelle. L'établissement réunit plusieurs restaurants et bars (Chez Mona, Marhaba, Mojos, The Sugar Club, Shimmers) ainsi qu'un service en chambre, une piscine, le spa et centre de remise en forme Body and Soul, et l'espace événementiel et de conférence Le Rendez-Vous. Les clients des Club Suites accèdent au salon VIP Shimmers. Autres numéros : +226 58 61 61 61 et +226 58 50 50 50. E-mail : info@soniahotels.com.",
  },
  {
    // Sources : page Facebook officielle (facebook.com/hotelsissiman) —
    // catégorie « Hotel resort », 15 K abonnés, 98 % de recommandations sur
    // 445 avis — et site officiel hotelsissiman.com, qui précise le secteur.
    //
    // Seule fiche hors Ouagadougou de ce seed : `city` est explicite, et
    // Bobo-Dioulasso fait bien partie de CITIES (constants/index.ts), donc la
    // fiche est visible dans l'annuaire.
    name: 'Hôtel Sissiman',
    city: 'Bobo-Dioulasso',
    address: 'Sarfalao, secteur 17, Bobo-Dioulasso (01 BP 1245)',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 20 98 01 08',
    // La page affiche un bouton WhatsApp mais ne déclare aucun numéro dédié.
    whatsapp: null,
    facebook: 'https://www.facebook.com/hotelsissiman',
    instagram: null,
    website: 'https://hotelsissiman.com',
    // La page indique « Always open ».
    // open === close dans lib/openingHours.ts = ouvert 24h/24.
    openingHours: everyDay('00:00', '00:00'),
    description: "Hôtel 4 étoiles du quartier Sarfalao, à Bobo-Dioulasso : 62 chambres réparties en huit catégories, des chambres standard aux suites émeraude, en passant par les doubles supérieures et deluxe, les suites junior et les appartements F2 et F4. Restaurant gastronomique de cuisine africaine et internationale, bar américain, piscine extérieure avec terrasse et bar, salle de fitness, spa et salles de conférence équipées. L'établissement abrite aussi une école hôtelière, la Sissiman International Hotel School. Second numéro : +226 74 24 29 29. E-mail : resa@hotelsissiman.com.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
