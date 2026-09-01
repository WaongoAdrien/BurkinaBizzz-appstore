// scripts/seed-shopping.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des boutiques et marques (mode, artisanat, cadeaux).
//
// Lancer   :  node scripts/seed-shopping.js
// Aperçu   :  node scripts/seed-shopping.js --dry-run
// Réécrire :  node scripts/seed-shopping.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses } = require('./lib/business-seed');

const CATEGORY = 'Shopping';

// ── ÉTABLISSEMENTS ───────────────────────────────────────────────────────────
// Un champ absent/null reste null — aucune valeur n'est inventée.
const VENUES = [
  {
    // Sources : page Facebook officielle (femfaso) + fiche Google Maps
    // « Siège FemFaso » (boutique de cadeaux, 4,4/5 sur 14 avis), qui donne la
    // rue exacte — la page Facebook, elle, ne mentionne que la ville.
    name: 'FemFaso',
    categories: ['Shopping', 'Produits Locaux'],
    address: 'Rue 28.512, Zone I (9GCG+6C), Ouagadougou',
    latitude: 12.3705233, longitude: -1.4739655,
    phone: '+226 61 22 08 08',
    // Numéro déclaré explicitement dans le champ « WhatsApp number » de la
    // page, identique à la ligne de contact.
    whatsapp: '+226 61 22 08 08',
    facebook: 'https://www.facebook.com/femfaso',
    instagram: null,
    website: null,                     // aucun site web publié
    // Facebook affiche « Closed now » sans détailler la semaine, et Google ne
    // donne qu'une heure d'ouverture (9h le lundi) sans heure de fermeture :
    // pas de quoi reconstituer une grille honnête, donc null.
    openingHours: null,
    description: "Marque ethno chic de Ouagadougou consacrée à la redécouverte de l'artisanat textile africain. Sacs, maroquinerie et accessoires travaillés en Faso Danfani, ainsi que des coffrets cadeaux d'entreprise habillés du même tissu. Livraison possible.",
  },
  {
    // Source : page Facebook officielle (facebook.com/cobyfreeshop), consultée
    // dans le navigateur — catégorie Facebook « Clothing store », 89 K abonnés,
    // 90 % de recommandations sur 67 avis.
    // La bio publie deux numéros et cite deux adresses : la boutique du centre
    // ville (à 50 m de l'hôtel Pacific) et celle des 1200 Logements, en face de
    // Coris Bank. Le champ « Address » de la page ne décrit que la première.
    name: 'Coby Free Shop',
    address: "Avenue de l'UEMOA, centre-ville, derrière Telecel Kwame Nkrumah, Ouagadougou (09 BP 379)",
    latitude: null, longitude: null,   // la page n'épingle que le centre de Ouagadougou
    phone: '+226 70 68 56 26',
    // La page affiche un bouton WhatsApp mais ne publie aucun numéro dédié :
    // rien ne dit lequel des deux numéros de la bio il utilise.
    whatsapp: null,
    facebook: 'https://www.facebook.com/cobyfreeshop',
    instagram: null,
    // La section « Links » renvoie vers cobyfreeshop.com, mais le domaine ne
    // résout plus (NXDOMAIN) — non retenu.
    website: null,
    // Facebook n'affiche que « Closed now », sans grille hebdomadaire.
    openingHours: null,
    description: "Magasin d'habillement de Ouagadougou, sur deux adresses : le centre-ville, avenue de l'UEMOA derrière Telecel Kwame Nkrumah et à 50 m de l'hôtel Pacific, et les 1200 Logements, en face de Coris Bank. Prêt-à-porter, chaussures et maroquinerie en cuir. Second numéro : +226 62 43 43 43. E-mail : cobyfreeshop@yahoo.fr.",
  },
  {
    // Source : page Facebook officielle (facebook.com/fragranceparfumerieouaga),
    // consultée dans le navigateur — catégorie Facebook « Cosmetics store »,
    // 86 K abonnés, 84 % de recommandations sur 107 avis. Téléphone et WhatsApp
    // sont deux numéros distincts, tous deux déclarés dans « Contact info ».
    name: 'Fragrance Parfumerie Ouaga 2000',
    categories: ['Shopping', 'Coiffure & Beauté'],
    // La page ne donne que le quartier et la boîte postale, sans rue.
    address: 'Ouaga 2000, Ouagadougou (06 BP 9636 Ouagadougou 06)',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 78 21 37 73',
    whatsapp: '+226 60 33 57 57',
    facebook: 'https://www.facebook.com/fragranceparfumerieouaga',
    instagram: null,
    website: null,                     // aucun site web publié
    // Facebook n'affiche que « Closed now », sans grille hebdomadaire.
    openingHours: null,
    description: "Parfumerie de Ouaga 2000 : parfums de marques et produits cosmétiques. E-mail : fragranceboutik@yahoo.fr.",
  },
  {
    // Source : page Facebook officielle (facebook.com/lebeaupagne), consultée
    // dans le navigateur — catégorie Facebook « Shopping & retail », 25 K
    // abonnés. Le même numéro sert de téléphone et de WhatsApp (déclaré dans
    // les deux champs de « Contact info »).
    name: 'Le Beau Pagne',
    categories: ['Shopping', 'Produits Locaux'],
    // Adresse du champ « Address » de la page ; les publications précisent le
    // repère : même goudron que l'OCECOS (DGEC) et le lycée Saint-Joseph.
    address: 'Boulevard Ratag Rima, Samandin, Ouagadougou',
    // La page publie un lien Google Maps (maps.app.goo.gl/c9Vck619pNQom4ZX9)
    // mais il pointe vers une fiche sans coordonnées exploitables.
    latitude: null, longitude: null,
    phone: '+226 77 39 93 15',
    whatsapp: '+226 77 39 93 15',
    facebook: 'https://www.facebook.com/lebeaupagne',
    instagram: null,                   // seul un compte TikTok est lié
    website: null,                     // aucun site web publié
    // Facebook n'affiche que « Closed now », sans grille hebdomadaire.
    openingHours: null,
    description: "Boutique de pagnes de Samandin, sur le même goudron que l'OCECOS (DGEC) et le lycée Saint-Joseph. Bogolan, batik, woodin et kente, vendus au complet de trois pagnes. Livraison dans Ouagadougou et expédition partout au Burkina Faso et à l'étranger. TikTok : @lebeaupagne. E-mail : lebeaupagnebf@gmail.com.",
  },
  {
    // Source : page Facebook officielle (profile.php?id=100064042953343),
    // consultée dans le navigateur — catégorie Facebook « Retail company »,
    // 29 K abonnés. La section « Contact info » ne publie qu'un téléphone :
    // ni e-mail, ni site, ni numéro WhatsApp.
    name: "Class'en boubou",
    // Le champ « Address » de la page ne donne que le quartier.
    address: 'Zone 1, Ouagadougou',
    latitude: null, longitude: null,   // coordonnées non publiées
    phone: '+226 72 61 53 08',
    whatsapp: null,                    // aucun numéro WhatsApp publié
    facebook: 'https://www.facebook.com/profile.php?id=100064042953343',
    instagram: null,
    website: null,
    // Facebook n'affiche que « Closed now », sans grille hebdomadaire.
    openingHours: null,
    description: "Boutique de la Zone 1 spécialisée dans la vente de boubous et de sandales / nu-pieds. La page propose la prise de rendez-vous en ligne (bouton « Book now »).",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
