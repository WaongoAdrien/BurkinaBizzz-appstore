// scripts/seed-soirees-petitfute.js
// ─────────────────────────────────────────────────────────────────────────────
// Seed idempotent des établissements de nuit de Ouagadougou.
//
// Lancer   :  node scripts/seed-soirees-petitfute.js
// Aperçu   :  node scripts/seed-soirees-petitfute.js --dry-run
// Réécrire :  node scripts/seed-soirees-petitfute.js --force
//
// Idempotence, schéma et écriture : voir scripts/lib/business-seed.js.
//
// SOURCE ─────────────────────────────────────────────────────────────────────
// Données factuelles (nom, quartier, téléphone, jours et heures d'ouverture,
// tarifs) relevées sur les fiches Petit Futé « S'amuser et sortir — Région de
// Ouagadougou ». Les textes rédactionnels du Petit Futé sont protégés : aucune
// de leurs descriptions n'est reprise ici, toutes les descriptions ci-dessous
// sont réécrites à partir des seuls éléments factuels.
//
// FIABILITÉ ──────────────────────────────────────────────────────────────────
// Ce corpus provient d'un guide alimenté par des éditions papier successives et
// plusieurs indices le datent (enseignes citées sous leur ancien nom : ex-Majestic,
// ex-Jimmy's, ex-Grand Kundé). Les fiches sont donc créées avec verified: false
// et méritent un appel de vérification avant d'être marquées vérifiées.
//
// NON REPRIS ─────────────────────────────────────────────────────────────────
// Sur les 41 fiches de la source :
//   - 10 hors catégorie Soirées (4 cinémas, 2 cybercafés, 1 bowling, 1 casino,
//     2 salles de spectacle) — relèveraient d'Attractions ou de Services ;
//   - 1 doublon : Le Cartel Light Club existe déjà (id cartel-light-club) ;
//   - 2 sans aucune donnée exploitable (Le Zoodo, La Tour de Contrôle) :
//     ni téléphone, ni adresse, ni horaires.
// ─────────────────────────────────────────────────────────────────────────────

const { seedBusinesses, hours, everyDay } = require('./lib/business-seed');

const CATEGORY = 'Soirées';

// Un champ absent/null reste null — aucune valeur n'est inventée. En
// particulier, les horaires ne sont renseignés que lorsque la source donne une
// heure d'ouverture ET de fermeture ; « jusqu'à l'aube » ou « au petit matin »
// restent en null plutôt que d'être convertis en une heure arbitraire.
const VENUES = [
  {
    name: 'Le Titis',
    address: 'Avenue Babanguida, Ouagadougou',
    phone: '+226 50 36 97 23',
    description: "Maquis de taille modeste doté d'une salle climatisée, sur l'avenue Babanguida. Il se trouve à environ 200 m du croisement avec l'avenue Charles-de-Gaulle, sur la droite en venant de l'ancienne Présidence.",
  },
  {
    name: 'Calypso Night Club',
    address: 'Koulouba, Avenue Kennedy, Ouagadougou',
    openingHours: everyDay('23:00', '06:00'),
    description: "Discothèque du quartier Koulouba ouverte tous les jours de 23h à 6h, très fréquentée en fin de nuit. L'entrée est gratuite, une consommation est obligatoire.",
  },
  {
    name: 'Le Wakati',
    address: 'Quartier Gounghin, Ouagadougou',
    description: "Scène de concert installée dans une cour plantée d'arbres, à Gounghin. La programmation fait la part belle aux groupes live.",
  },
  {
    name: 'Le Sport Bar',
    address: 'Gounghin, Ouagadougou',
    description: 'Grand maquis de Gounghin avec piste de danse, ouvert tous les jours. Concerts live du mercredi au dimanche : reggae le mercredi et le jeudi, orchestre le vendredi, le samedi et le dimanche.',
  },
  {
    name: 'Le Nirvana',
    address: 'Cité An III, Avenue des armées, Ouagadougou',
    openingHours: hours({ friday: ['22:30', '06:00'], saturday: ['22:30', '06:00'] }),
    description: "Boîte de nuit climatisée de la Cité An III, ouverte uniquement le vendredi et le samedi à partir de 22h30. Entrée à 3 500 FCFA avec une consommation, boisson supplémentaire à 1 500 FCFA. Clientèle mêlant Burkinabè et expatriés.",
  },
  {
    name: 'Le Taxi Brousse',
    categories: ['Soirées', 'Restauration'],
    address: "Avenue Kwamé N'Krumah, Ouagadougou",
    phone: '+226 78 83 03 55',
    description: "Bar animé de l'avenue Kwamé N'Krumah, ouvert tous les jours à partir de 17h. Petite restauration : environ 200 FCFA la brochette de bœuf, 1 000 FCFA les frites ou l'aloco, 5 000 FCFA le poulet.",
  },
  {
    name: 'Fresh Club',
    categories: ['Soirées', 'Restauration'],
    address: "Patte d'Oie, Ouagadougou",
    phone: '+226 70 23 45 19',
    description: "Club de la Patte d'Oie, anciennement le Majestic. Ouvert tous les jours de 19h jusqu'au petit matin : restauration, bar, billard et piste de danse. Entrée gratuite, consommations à partir de 1 000 FCFA.",
  },
  {
    name: 'Le Centro',
    categories: ['Soirées', 'Restauration'],
    address: 'Quartier de Koulouba, Ouagadougou',
    phone: '+226 66 66 66 34',
    description: 'Bar musical climatisé du centre-ville, ouvert tous les jours à partir de 18h. On peut y dîner, y organiser un afterwork ou y passer la soirée.',
  },
  {
    name: 'Appaloosa',
    categories: ['Soirées', 'Restauration'],
    address: 'Quartier Koulouba, Avenue Guillaume Ouédraogo, Ouagadougou',
    phone: '+226 78 30 58 57',
    openingHours: everyDay('19:00', '04:00'),
    description: 'Bar-pub-restaurant à l\'ambiance lounge, ouvert tous les jours de 19h à 4h. Salle climatisée et cuisine tex-mex, américaine et libanaise.',
  },
  {
    name: 'Byblos',
    address: 'Ouagadougou',
    phone: '+226 78 86 12 02',
    description: "Discothèque ouverte tous les jours, anciennement le Jimmy's. Elle dispose de deux pistes de danse.",
  },
  {
    name: 'Le Jamaïca',
    address: 'Quartier Dapoya, Ouagadougou',
    description: 'Maquis du quartier Dapoya, historiquement associé à la scène reggae de Ouagadougou.',
  },
  {
    name: 'Le Lilas Vif',
    address: 'Proche du stade du 4-Août, Ouagadougou',
    phone: '+226 78 10 60 52',
    description: "Maquis doté d'une salle intérieure aux allures de boîte de nuit, près du stade du 4-Août. Tous les styles de musique y sont programmés.",
  },
  {
    name: 'Matata',
    address: 'Dapoya, Ouagadougou',
    description: "L'une des adresses les plus connues de Dapoya, réputée pour sa programmation de musique ivoirienne. Ouverte tous les jours, entrée gratuite.",
  },
  {
    name: 'Music-Hall',
    categories: ['Soirées', 'Restauration'],
    address: '431 rue des Ecoles, quartier Paspanga, Ouagadougou',
    phone: '+226 50 33 14 37',
    description: "Maquis-boîte du quartier Paspanga, ouvert tous les jours de 10h jusqu'au petit matin. La carte propose notamment des hamburgers.",
  },
  {
    name: 'Le Number One',
    categories: ['Soirées', 'Restauration'],
    address: 'Gounghin, Rue Guisga, Ouagadougou',
    openingHours: everyDay('08:00', '00:00'),
    description: "Maquis de longue date à Gounghin, ouvert de 8h à minuit et jusqu'à 2h le week-end. Spécialités de poisson et de poulet grillés : comptez environ 3 500 FCFA le poulet et 2 500 FCFA la carpe.",
  },
  {
    name: 'La Ouagalaise',
    address: "Derrière l'aéroport, près des 1 200 logements, Ouagadougou",
    description: "Maquis réputé pour ses soirées animées, situé derrière l'aéroport, à proximité des 1 200 logements.",
  },
  {
    name: 'Papa Gayo',
    address: 'Au-dessus du Byblos, Ouagadougou',
    phone: '+226 70 25 41 23',
    description: 'Club installé au-dessus du Byblos, ouvert du jeudi au dimanche. Il attire une clientèle plutôt jeune.',
  },
  {
    name: 'La Pharmacie de Garde',
    address: 'À côté du Matata, quartier de Dapoya, Ouagadougou',
    description: 'Maquis dansant du quartier Dapoya, voisin immédiat du Matata.',
  },
  {
    name: 'Le RJV 226',
    address: 'Avenue Bassawarga, Ouagadougou',
    description: "Maquis dansant de l'avenue Bassawarga, anciennement le Grand Kundé. Deux grandes paillotes équipées de miroirs accueillent les danseurs.",
  },
  {
    name: 'Le Tip Top',
    address: 'Quartier de Dassasgho, sur la route de Fada, Ouagadougou',
    description: "Grand maquis de Dassasgho, sur la route de Fada, particulièrement animé le week-end. Repère : après la station-service OTAM en venant de la gare de l'Est, à 50 m du goudron.",
  },
  {
    name: 'Havana Club',
    address: 'Rond-point des Nations-Unies, Ouagadougou',
    phone: '+226 78 87 32 46',
    description: 'Discothèque du rond-point des Nations-Unies, ouverte du lundi au samedi à partir de 21h. Soirées à thème régulières : hip-hop, reggae, sets DJ et battles de danse.',
  },
  {
    name: 'Le Nomade',
    address: '114 rue Gandaogo, Zone du Bois, Ouagadougou',
    phone: '+226 74 01 23 74',
    description: 'Bar installé sous les manguiers dans la Zone du Bois, au cadre calme, avec une programmation de musiques du monde.',
  },
  {
    name: 'Chez Black Lion',
    address: 'Gounghin, Ouagadougou',
    phone: '+226 78 59 27 35',
    description: "Bar d'inspiration rasta tenu par Eric, dit « Black Lion », à Gounghin. Ouvert tous les jours à partir de 18h jusqu'au petit matin.",
  },
  {
    name: 'Black Diamond',
    address: 'Boulevard des Tensoba, Ouagadougou',
    phone: '+226 72 22 21 20',
    openingHours: everyDay('20:00', '06:00'),
    description: "Boîte de nuit du boulevard des Tensoba, reconnaissable à la tour Eiffel lumineuse dressée devant son entrée. Ouverte tous les jours de 20h à 6h, entrée gratuite, consommation à partir de 1 000 FCFA.",
  },
  {
    name: 'La Maison Blanche',
    address: 'Boulevard des Tensoba, Ouagadougou',
    phone: '+226 68 13 85 07',
    openingHours: everyDay('20:00', '06:00'),
    description: 'Boîte de nuit du boulevard des Tensoba, fréquentée par la jeunesse ouagalaise comme par les expatriés. Ouverte tous les jours de 20h à 6h, entrée gratuite, consommation à partir de 1 000 FCFA.',
  },
  {
    name: 'Cosy Corner',
    categories: ['Soirées', 'Restauration'],
    address: 'Ouagadougou',
    phone: '+226 53 23 88 88',
    openingHours: hours({
      wednesday: ['18:00', '02:00'], thursday: ['18:00', '02:00'],
      friday: ['18:00', '02:00'], saturday: ['18:00', '02:00'],
      sunday: ['18:00', '02:00'],
    }),
    description: "Bar-restaurant-lounge construit à partir de conteneurs, à l'architecture moderne et métallique. Ouvert du mercredi au dimanche de 18h à 2h. Comptez environ 4 000 FCFA les tenders de poulet pané et 10 000 FCFA l'assiette de tapas pour six personnes.",
  },
  {
    name: 'La Camionnette',
    categories: ['Soirées', 'Restauration'],
    address: 'Rue 11.19, quartier de Ouidi-Kologh Naba, Ouagadougou',
    phone: '+226 66 25 11 11',
    openingHours: everyDay('07:00', '00:00'),
    description: "Maquis de quartier dont le comptoir est aménagé dans une camionnette. Ouvert tous les jours de 7h à minuit (fermeture occasionnelle le mardi). Bière pression, ambiance familiale et accès aux personnes à mobilité réduite.",
  },
  {
    name: "Le P'tit Bazar",
    address: 'Centre-ville, Ouagadougou',
    phone: '+226 78 14 43 32',
    openingHours: hours({ friday: ['18:00', '02:00'], saturday: ['18:00', '02:00'] }),
    description: "Bar live du centre-ville réputé pour sa programmation musicale. Ouvert le vendredi et le samedi de 18h à 2h, ainsi que le dernier jeudi de chaque mois. Entrée à 1 000 FCFA.",
  },
];

seedBusinesses(VENUES, CATEGORY).then(() => process.exit(0)).catch(err => {
  console.error('✖ Échec du seed :', err.message);
  process.exit(1);
});
