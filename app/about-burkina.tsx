// app/about-burkina.tsx — About Burkina Faso

import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Modal, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Colors } from '../constants';
import { useTranslation, registerTranslations } from '../lib/LanguageContext';

const normalizeUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

registerTranslations({
  'À propos du Burkina Faso': 'About Burkina Faso',
  "Surnommé « le pays des hommes intègres », le Burkina Faso est une terre de savanes, de royaumes anciens et d'une mosaïque de peuples et de traditions qui font la richesse de l'Afrique de l'Ouest.":
    'Nicknamed "the land of upright people," Burkina Faso is a land of savannas, ancient kingdoms, and a mosaic of peoples and traditions that enrich West Africa.',
  'Monnaie': 'Currency',
  'Population': 'Population',
  'Ville principale': 'Main city',
  'Burkina Faso': 'Burkina Faso',
  "Afrique de l'Ouest": 'West Africa',
  'Bobo-Dioulasso': 'Bobo-Dioulasso',
  'Ville culturelle': 'Cultural city',
  'Voyager': 'Travel',
  'Informations de voyage': 'Travel information',
  'Géographie': 'Geography',
  "Le Burkina Faso est un pays d'Afrique de l'Ouest, bordé par le Mali, le Niger, le Bénin, le Togo, le Ghana et la Côte d'Ivoire. Son relief est dominé par de vastes plateaux de savane parsemés de baobabs, ainsi que par des formations rocheuses spectaculaires comme les pics de Sindou et les falaises de Banfora. Le climat, de type sahélien, alterne entre une longue saison sèche marquée par l'harmattan et une saison des pluies, de juin à septembre, qui verdit les paysages. Le fleuve Mouhoun (Volta Noire) et ses affluents sont essentiels à l'agriculture du pays.":
    "Burkina Faso is a West African country bordered by Mali, Niger, Benin, Togo, Ghana, and Côte d'Ivoire. Its landscape is dominated by vast savanna plateaus dotted with baobab trees, along with spectacular rock formations such as the Sindou Peaks and the Banfora cliffs. The climate is Sahelian, alternating between a long dry season marked by the harmattan wind and a rainy season from June to September that turns the landscape green. The Mouhoun River (Black Volta) and its tributaries are essential to the country's agriculture.",
  'Les pics de Sindou, près de Banfora': 'The Sindou Peaks, near Banfora',
  'Histoire': 'History',
  "L'histoire du Burkina Faso remonte à de puissants royaumes précoloniaux, dont les royaumes mossis fondés dès le XVe siècle autour de Ouagadougou, aux côtés des terres des peuples Gourounsi, Bobo, Lobi et Sénoufo, chacun avec ses propres traditions et organisations sociales. Le territoire devient une colonie française sous le nom de Haute-Volta avant d'accéder à l'indépendance le 5 août 1960. En 1984, le pays est rebaptisé « Burkina Faso », un nom formé à partir du mooré et du dioula signifiant « la patrie des hommes intègres » — un héritage qui reste aujourd'hui une source de fierté nationale.":
    'The history of Burkina Faso traces back to powerful precolonial kingdoms, including the Mossi kingdoms founded as early as the 15th century around Ouagadougou, alongside the lands of the Gurunsi, Bobo, Lobi, and Senufo peoples, each with its own traditions and social organization. The territory became a French colony under the name Upper Volta before gaining independence on August 5, 1960. In 1984, the country was renamed "Burkina Faso," a name formed from the Mooré and Dioula languages meaning "the homeland of upright people" — a legacy that remains a source of national pride today.',
  'Culture': 'Culture',
  'Le Burkina Faso est une mosaïque de plus de 60 groupes ethniques — Mossis, Peuls, Bobos, Lobis, Gourmantchés et bien d\'autres — chacun avec sa langue, ses coutumes et son artisanat. Le français est la langue officielle, aux côtés du mooré et du dioula, largement parlés dans tout le pays.':
    'Burkina Faso is a mosaic of more than 60 ethnic groups — Mossi, Fulani, Bobo, Lobi, Gourmantché, and many others — each with its own language, customs, and craftsmanship. French is the official language, alongside Mooré and Dioula, which are widely spoken throughout the country.',
  'La Grande Mosquée de Bobo-Dioulasso, joyau de l\'architecture soudano-sahélienne': 'The Grand Mosque of Bobo-Dioulasso, a jewel of Sudano-Sahelian architecture',
  'Le pays est aussi réputé pour son artisanat, ses masques rituels, et sa musique au djembé et au balafon, qui rythment les fêtes villageoises. Sa scène culturelle rayonne bien au-delà de ses frontières grâce au FESPACO, le plus grand festival de cinéma d\'Afrique, organisé tous les deux ans à Ouagadougou.':
    "The country is also renowned for its craftsmanship, ritual masks, and djembe and balafon music, which set the rhythm for village celebrations. Its cultural scene reaches well beyond its borders thanks to FESPACO, Africa's largest film festival, held every two years in Ouagadougou.",
  'Danseurs traditionnels en pays kasena': 'Traditional dancers in Kasena country',
  'Art et artisanat': 'Art and craftsmanship',
  "La sculpture, les masques rituels, le tissage et le travail du bronze et du cuir occupent une place centrale dans la vie burkinabè. Transmis de génération en génération, ces savoir-faire artisanaux allient fonction rituelle et valeur artistique, et se retrouvent aussi bien dans les cérémonies villageoises que sur les marchés d'art contemporain.":
    "Sculpture, ritual masks, weaving, and bronze and leatherwork hold a central place in Burkinabè life. Passed down through generations, these artisanal skills combine ritual function with artistic value, and are found both in village ceremonies and in contemporary art markets.",
  'Sculpture et artisanat traditionnel burkinabè': 'Traditional Burkinabè sculpture and craftsmanship',
  'Croyances et spiritualité': 'Beliefs and spirituality',
  "Aux côtés de l'islam et du christianisme, les religions traditionnelles africaines restent profondément ancrées dans la société burkinabè. Cultes des ancêtres, rites d'initiation et sites naturels sacrés — mares, bois et collines — structurent encore aujourd'hui la vie spirituelle de nombreuses communautés, dans un esprit de coexistence pacifique entre les croyances.":
    "Alongside Islam and Christianity, traditional African religions remain deeply rooted in Burkinabè society. Ancestor worship, initiation rites, and sacred natural sites — ponds, groves, and hills — still shape the spiritual life of many communities today, in a spirit of peaceful coexistence between faiths.",
  'Rite traditionnel burkinabè': 'Traditional Burkinabè ritual',
  'Cuisine et gastronomie': 'Cuisine and gastronomy',
  "La cuisine burkinabè repose sur des céréales locales — mil, sorgho et maïs — souvent servies en pâte (tô) accompagnée de sauces à base de gombo, de feuilles de baobab ou d'arachide. Riz gras, poulet bicyclette et brochettes grillées complètent un répertoire culinaire convivial, généralement partagé en famille ou entre voisins.":
    "Burkinabè cuisine is built on local grains — millet, sorghum, and corn — often served as a paste (tô) with okra, baobab leaf, or peanut-based sauces. Riz gras, free-range \"bicycle chicken,\" and grilled skewers round out a convivial culinary repertoire, typically shared among family or neighbors.",
  'Le tô, plat traditionnel accompagné de sauce gombo': 'Tô, a traditional dish served with okra sauce',
  'Habits traditionnels et textiles': 'Traditional dress and textiles',
  "Le boubou ample, le faso dan fani (tissu tissé à la main) et les parures perlées marquent les grandes occasions — mariages, baptêmes et fêtes coutumières. Le faso dan fani, en particulier, est devenu un symbole de fierté nationale et de valorisation du savoir-faire textile local depuis les années 1990.":
    "The flowing boubou, faso dan fani (hand-woven cloth), and beaded ornaments mark major occasions — weddings, baptisms, and traditional festivals. Faso dan fani in particular has become a symbol of national pride and of championing local textile craftsmanship since the 1990s.",
  'Tissage traditionnel du faso dan fani': 'Traditional weaving of faso dan fani',
  'Visa électronique (eVisa)': 'Electronic visa (eVisa)',
  'Site officiel visaburkina.bf': 'Official site visaburkina.bf',
  'Fiche de voyage officielle': 'Official travel advisory',
  'Site officiel fichedevoyage.gov.bf': 'Official site fichedevoyage.gov.bf',
  'Conseils météo': 'Weather tips',
  'Le Burkina Faso connaît deux grandes saisons. La saison sèche (novembre à mai) est marquée par l\'harmattan, un vent chaud et poussiéreux, avec des températures pouvant dépasser 35°C en mars-avril — prévoyez des vêtements légers, un chapeau et une bonne hydratation. La saison des pluies (juin à septembre) apporte des averses parfois intenses en fin de journée, avec une chaleur plus humide; un vêtement de pluie léger est utile. Les soirées peuvent être plus fraîches en décembre-janvier, surtout la nuit.':
    'Burkina Faso has two main seasons. The dry season (November to May) is marked by the harmattan, a hot and dusty wind, with temperatures that can exceed 35°C in March-April — pack light clothing, a hat, and stay well hydrated. The rainy season (June to September) brings sometimes intense downpours in the late afternoon, along with more humid heat; a light rain jacket is useful. Evenings can be cooler in December-January, especially at night.',
  "Envie d'évasion ?": 'Feeling adventurous?',
  'Découvrez les plus beaux sites touristiques du Burkina Faso': "Discover Burkina Faso's most beautiful tourist sites",
  'Numéros utiles': 'Useful numbers',
  'Urgences': 'Emergencies',
  'Police Secours': 'Police',
  'Sapeurs-Pompiers': 'Fire brigade',
  'SAMU (urgences médicales)': 'SAMU (medical emergencies)',
  'Centre Antipoison': 'Poison control',
  'Urgences psychiatriques': 'Psychiatric emergencies',
  'Hôpitaux et cliniques': 'Hospitals and clinics',
  'CHU Yalgado Ouédraogo — Ouagadougou': 'CHU Yalgado Ouédraogo — Ouagadougou',
  'CHU Sourô Sanou — Bobo-Dioulasso': 'CHU Sourô Sanou — Bobo-Dioulasso',
  'Polyclinique Notre Dame de la Paix — Ouagadougou': 'Polyclinique Notre Dame de la Paix — Ouagadougou',
  'Sites officiels': 'Official sites',
  'Sites officiels du gouvernement': 'Government official sites',
  'Gouvernement': 'Government',
  'Site web': 'Website',
  'Aucun numéro disponible pour le moment.': 'No numbers available at the moment.',
  'Aucun site disponible pour le moment.': 'No sites available at the moment.',
  'Paludisme : comment se protéger': 'Malaria: how to protect yourself',
  "Le paludisme, transmis par piqûre de moustique, reste très présent au Burkina Faso. Le ministère de la Santé et de l'Hygiène Publique recommande de dormir chaque nuit sous une moustiquaire imprégnée d'insecticide longue durée (MILDA), y compris en voyage.":
    "Malaria, spread by mosquito bites, is still very common in Burkina Faso. The Ministry of Health and Public Hygiene recommends sleeping every night under a long-lasting insecticide-treated bed net (MILDA), including while traveling.",
  "D'autres gestes recommandés par le ministère : éliminer les eaux stagnantes autour du logement (lieux de reproduction des moustiques) et se protéger le soir avec des vêtements couvrants ou un répulsif cutané.":
    "Other steps recommended by the Ministry: clear standing water around where you're staying (mosquito breeding sites), and protect yourself in the evening with covering clothing or a skin repellent.",
  'Fièvre jaune : vérifier les exigences': 'Yellow fever: check requirements',
  'Ministère de la Santé — sante.gov.bf': 'Ministry of Health — sante.gov.bf',
});

const HERO_IMAGE = require('../assets/images/siegecib.webp');
const TOURISM_CTA_IMAGE = require('../assets/maps.png');

const EVISA_URL = 'https://www.visaburkina.bf/en/home/';
const FICHE_VOYAGE_URL = 'https://fichedevoyage.gov.bf/';
const SANTE_GOV_URL = 'https://www.sante.gov.bf/';

// Sindou Peaks (Domes de Fabédougou), near Banfora — Wegmann, CC BY-SA 3.0 (Wikimedia Commons)
const GEOGRAPHY_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Pic_de_sindou.JPG/1280px-Pic_de_sindou.JPG';
// Grand Mosque of Bobo-Dioulasso — qiv, CC BY-SA 2.0 (Wikimedia Commons)
const MOSQUE_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Moschee_von_Bobo-Dioulasso.jpg/1280px-Moschee_von_Bobo-Dioulasso.jpg';
// Traditional Kasena dancers, Tiébélé — Zaongo Christian Marie Michel, CC BY-SA 4.0 (Wikimedia Commons)
const DANCERS_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Ti%C3%A9b%C3%A9l%C3%A9.jpg/1280px-Ti%C3%A9b%C3%A9l%C3%A9.jpg';
// New culture sections, sourced from visiteburkina.com/culture
const ART_IMAGE = 'https://res.cloudinary.com/dapmfpr1t/image/upload/f_auto,q_auto,w_3840,c_fill/v1771174260/mario-la-pergola-u6qz22_ygoi-unsplash_1_.jpg_kg3paz.webp';
const BELIEFS_IMAGE = 'https://res.cloudinary.com/dapmfpr1t/image/upload/f_auto,q_auto,w_3840,c_fill/v1769562576/arton54844-2973e_ertjhd.jpg';
const CUISINE_IMAGE = 'https://res.cloudinary.com/dapmfpr1t/image/upload/f_auto,q_auto,w_3840,c_fill/v1769562780/Tot-%C3%A0-la-sauce-gombo_xut0tg.jpg';
const TEXTILES_IMAGE = 'https://res.cloudinary.com/dapmfpr1t/image/upload/f_auto,q_auto,w_3840,c_fill/v1771174432/MnUne_qcafos.jpg';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SectionImage({ uri, caption }: { uri: string; caption: string }) {
  return (
    <View style={styles.sectionImageWrap}>
      <Image source={{ uri }} style={styles.sectionImage} resizeMode="cover" />
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

function NumberRow({ label, number, icon }: { label: string; number: string; icon: string }) {
  return (
    <TouchableOpacity
      style={styles.travelLinkCard}
      onPress={() => Linking.openURL(`tel:${number.replace(/\s+/g, '')}`)}
      activeOpacity={0.8}
    >
      <View style={[styles.travelLinkIcon, { backgroundColor: Colors.primary + '1c' }]}>
        <Ionicons name={(icon || 'call-outline') as any} size={22} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.travelLinkTitle}>{label}</Text>
        <Text style={styles.travelLinkSub}>{number}</Text>
      </View>
      <Ionicons name="call-outline" size={18} color={Colors.primary} />
    </TouchableOpacity>
  );
}

function OfficialSiteRow({ name, description, website, facebook, icon }: { name: string; description?: string; website?: string; facebook?: string; icon: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.officialCard}>
      <View style={styles.officialHeader}>
        <View style={[styles.travelLinkIcon, { backgroundColor: Colors.primary + '1c' }]}>
          <Ionicons name={(icon || 'business-outline') as any} size={22} color={Colors.primary} />
        </View>
        <Text style={styles.travelLinkTitle} numberOfLines={2}>{name}</Text>
      </View>
      {description ? <Text style={styles.officialDesc}>{description}</Text> : null}
      {(website || facebook) && (
        <View style={styles.officialLinkRow}>
          {website ? (
            <TouchableOpacity
              style={styles.officialLinkBtn}
              onPress={() => Linking.openURL(normalizeUrl(website))}
              activeOpacity={0.8}
            >
              <Ionicons name="globe-outline" size={15} color={Colors.primary} />
              <Text style={styles.officialLinkText}>{t('Site web')}</Text>
            </TouchableOpacity>
          ) : null}
          {facebook ? (
            <TouchableOpacity
              style={styles.officialLinkBtn}
              onPress={() => Linking.openURL(normalizeUrl(facebook))}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-facebook" size={15} color={Colors.primary} />
              <Text style={styles.officialLinkText}>Facebook</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
}

export default function AboutBurkinaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [travelModalVisible, setTravelModalVisible] = useState(false);
  const [numbersModalVisible, setNumbersModalVisible] = useState(false);
  const [sitesModalVisible, setSitesModalVisible] = useState(false);
  const [usefulNumbers, setUsefulNumbers] = useState<any[]>([]);
  const [officialSites, setOfficialSites] = useState<any[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const u1 = onSnapshot(
      query(collection(db, 'usefulNumbers'), orderBy('order', 'asc')),
      snap => setUsefulNumbers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    const u2 = onSnapshot(
      query(collection(db, 'officialSites'), orderBy('order', 'asc')),
      snap => setOfficialSites(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => { u1(); u2(); };
  }, []);

  // Groups numbers under their `group` label, preserving the order groups first appear in.
  const numberGroups: string[] = [];
  const numbersByGroup: Record<string, any[]> = {};
  usefulNumbers.forEach(n => {
    const g = n.group || t('Numéros utiles');
    if (!numbersByGroup[g]) { numbersByGroup[g] = []; numberGroups.push(g); }
    numbersByGroup[g].push(n);
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#e8ecf0' }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO — full-bleed, extends behind the status bar */}
        <View style={styles.hero}>
          <Image source={HERO_IMAGE} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.65)']}
            style={styles.heroOverlay}
          >
            <Text style={styles.heroTitle}>{t('À propos du Burkina Faso')}</Text>
          </LinearGradient>

        </View>

        {/* BODY */}
        <View style={styles.body}>
          <Text style={styles.intro}>
            {t("Surnommé « le pays des hommes intègres », le Burkina Faso est une terre de savanes, de royaumes anciens et d'une mosaïque de peuples et de traditions qui font la richesse de l'Afrique de l'Ouest.")}
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('Monnaie')}</Text>
              <Text style={styles.infoValue}>Franc CFA</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('Population')}</Text>
              <Text style={styles.infoValue}>24M+</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('Ville principale')}</Text>
              <Text style={styles.infoValue}>Ouagadougou</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('Burkina Faso')}</Text>
              <Text style={styles.infoValue}>{t("Afrique de l'Ouest")}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>{t('Bobo-Dioulasso')}</Text>
              <Text style={styles.infoValue}>{t('Ville culturelle')}</Text>
            </View>
            <TouchableOpacity style={styles.infoCard} onPress={() => setTravelModalVisible(true)} activeOpacity={0.75}>
              <Text style={styles.infoLabel}>{t('Voyager')}</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue}>{t('Informations de voyage')}</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoCard} onPress={() => setNumbersModalVisible(true)} activeOpacity={0.75}>
              <Text style={styles.infoLabel}>{t('Urgences')}</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue}>{t('Numéros utiles')}</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoCard} onPress={() => setSitesModalVisible(true)} activeOpacity={0.75}>
              <Text style={styles.infoLabel}>{t('Gouvernement')}</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue}>{t('Sites officiels')}</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>

          <Section title={t('Géographie')}>
            <Text style={styles.paragraph}>
              {t("Le Burkina Faso est un pays d'Afrique de l'Ouest, bordé par le Mali, le Niger, le Bénin, le Togo, le Ghana et la Côte d'Ivoire. Son relief est dominé par de vastes plateaux de savane parsemés de baobabs, ainsi que par des formations rocheuses spectaculaires comme les pics de Sindou et les falaises de Banfora. Le climat, de type sahélien, alterne entre une longue saison sèche marquée par l'harmattan et une saison des pluies, de juin à septembre, qui verdit les paysages. Le fleuve Mouhoun (Volta Noire) et ses affluents sont essentiels à l'agriculture du pays.")}
            </Text>
            <SectionImage uri={GEOGRAPHY_IMAGE} caption={t('Les pics de Sindou, près de Banfora')} />
          </Section>

          <Section title={t('Histoire')}>
            <Text style={styles.paragraph}>
              {t("L'histoire du Burkina Faso remonte à de puissants royaumes précoloniaux, dont les royaumes mossis fondés dès le XVe siècle autour de Ouagadougou, aux côtés des terres des peuples Gourounsi, Bobo, Lobi et Sénoufo, chacun avec ses propres traditions et organisations sociales. Le territoire devient une colonie française sous le nom de Haute-Volta avant d'accéder à l'indépendance le 5 août 1960. En 1984, le pays est rebaptisé « Burkina Faso », un nom formé à partir du mooré et du dioula signifiant « la patrie des hommes intègres » — un héritage qui reste aujourd'hui une source de fierté nationale.")}
            </Text>
          </Section>

          <Section title={t('Culture')}>
            <Text style={styles.paragraph}>
              {t("Le Burkina Faso est une mosaïque de plus de 60 groupes ethniques — Mossis, Peuls, Bobos, Lobis, Gourmantchés et bien d'autres — chacun avec sa langue, ses coutumes et son artisanat. Le français est la langue officielle, aux côtés du mooré et du dioula, largement parlés dans tout le pays.")}
            </Text>
            <SectionImage uri={MOSQUE_IMAGE} caption={t("La Grande Mosquée de Bobo-Dioulasso, joyau de l'architecture soudano-sahélienne")} />
            <Text style={styles.paragraph}>
              {t("Le pays est aussi réputé pour son artisanat, ses masques rituels, et sa musique au djembé et au balafon, qui rythment les fêtes villageoises. Sa scène culturelle rayonne bien au-delà de ses frontières grâce au FESPACO, le plus grand festival de cinéma d'Afrique, organisé tous les deux ans à Ouagadougou.")}
            </Text>
            <SectionImage uri={DANCERS_IMAGE} caption={t('Danseurs traditionnels en pays kasena')} />
          </Section>

          <Section title={t('Art et artisanat')}>
            <Text style={styles.paragraph}>
              {t("La sculpture, les masques rituels, le tissage et le travail du bronze et du cuir occupent une place centrale dans la vie burkinabè. Transmis de génération en génération, ces savoir-faire artisanaux allient fonction rituelle et valeur artistique, et se retrouvent aussi bien dans les cérémonies villageoises que sur les marchés d'art contemporain.")}
            </Text>
            <SectionImage uri={ART_IMAGE} caption={t('Sculpture et artisanat traditionnel burkinabè')} />
          </Section>

          <Section title={t('Croyances et spiritualité')}>
            <Text style={styles.paragraph}>
              {t("Aux côtés de l'islam et du christianisme, les religions traditionnelles africaines restent profondément ancrées dans la société burkinabè. Cultes des ancêtres, rites d'initiation et sites naturels sacrés — mares, bois et collines — structurent encore aujourd'hui la vie spirituelle de nombreuses communautés, dans un esprit de coexistence pacifique entre les croyances.")}
            </Text>
            <SectionImage uri={BELIEFS_IMAGE} caption={t('Rite traditionnel burkinabè')} />
          </Section>

          <Section title={t('Cuisine et gastronomie')}>
            <Text style={styles.paragraph}>
              {t("La cuisine burkinabè repose sur des céréales locales — mil, sorgho et maïs — souvent servies en pâte (tô) accompagnée de sauces à base de gombo, de feuilles de baobab ou d'arachide. Riz gras, poulet bicyclette et brochettes grillées complètent un répertoire culinaire convivial, généralement partagé en famille ou entre voisins.")}
            </Text>
            <SectionImage uri={CUISINE_IMAGE} caption={t('Le tô, plat traditionnel accompagné de sauce gombo')} />
          </Section>

          <Section title={t('Habits traditionnels et textiles')}>
            <Text style={styles.paragraph}>
              {t("Le boubou ample, le faso dan fani (tissu tissé à la main) et les parures perlées marquent les grandes occasions — mariages, baptêmes et fêtes coutumières. Le faso dan fani, en particulier, est devenu un symbole de fierté nationale et de valorisation du savoir-faire textile local depuis les années 1990.")}
            </Text>
            <SectionImage uri={TEXTILES_IMAGE} caption={t('Tissage traditionnel du faso dan fani')} />
          </Section>

          {/* TOURISM CTA */}
          <TouchableOpacity
            style={styles.tourismCta}
            onPress={() => router.push('/tourism-sites')}
            activeOpacity={0.9}
          >
            <Image source={TOURISM_CTA_IMAGE} style={styles.tourismCtaImage} resizeMode="cover" />
            <LinearGradient
              colors={['rgba(11,30,61,0.35)', 'rgba(11,30,61,0.92)']}
              style={styles.tourismCtaOverlay}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.tourismCtaTitle}>{t('Envie d\'évasion ?')}</Text>
                <Text style={styles.tourismCtaSub}>{t('Découvrez les plus beaux sites touristiques du Burkina Faso')}</Text>
              </View>
              <View style={styles.tourismCtaArrow}>
                <Ionicons name="arrow-forward" size={20} color={Colors.headerGradient[1]} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* TRAVEL INFORMATION MODAL */}
      <Modal
        visible={travelModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setTravelModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.headerGradient[0]} />
          <LinearGradient
            colors={Colors.headerGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>{t('Informations de voyage')}</Text>
            <TouchableOpacity onPress={() => setTravelModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <TouchableOpacity
              style={styles.travelLinkCard}
              onPress={() => Linking.openURL(EVISA_URL)}
              activeOpacity={0.8}
            >
              <View style={[styles.travelLinkIcon, { backgroundColor: Colors.primary + '1c' }]}>
                <Ionicons name="document-text-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.travelLinkTitle}>{t('Visa électronique (eVisa)')}</Text>
                <Text style={styles.travelLinkSub}>{t('Site officiel visaburkina.bf')}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.travelLinkCard}
              onPress={() => Linking.openURL(FICHE_VOYAGE_URL)}
              activeOpacity={0.8}
            >
              <View style={[styles.travelLinkIcon, { backgroundColor: Colors.primary + '1c' }]}>
                <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.travelLinkTitle}>{t('Fiche de voyage officielle')}</Text>
                <Text style={styles.travelLinkSub}>{t('Site officiel fichedevoyage.gov.bf')}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.travelLinkCard}
              onPress={() => Linking.openURL(SANTE_GOV_URL)}
              activeOpacity={0.8}
            >
              <View style={[styles.travelLinkIcon, { backgroundColor: Colors.primary + '1c' }]}>
                <Ionicons name="medkit-outline" size={22} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.travelLinkTitle}>{t('Fièvre jaune : vérifier les exigences')}</Text>
                <Text style={styles.travelLinkSub}>{t('Ministère de la Santé — sante.gov.bf')}</Text>
              </View>
              <Ionicons name="open-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>

            <View style={styles.tipsSection}>
              <View style={styles.tipsHeaderRow}>
                <Ionicons name="bug-outline" size={18} color={Colors.cta} />
                <Text style={styles.tipsTitle}>{t('Paludisme : comment se protéger')}</Text>
              </View>
              <Text style={styles.tipsParagraph}>
                {t("Le paludisme, transmis par piqûre de moustique, reste très présent au Burkina Faso. Le ministère de la Santé et de l'Hygiène Publique recommande de dormir chaque nuit sous une moustiquaire imprégnée d'insecticide longue durée (MILDA), y compris en voyage.")}
              </Text>
              <Text style={[styles.tipsParagraph, { marginTop: 10 }]}>
                {t("D'autres gestes recommandés par le ministère : éliminer les eaux stagnantes autour du logement (lieux de reproduction des moustiques) et se protéger le soir avec des vêtements couvrants ou un répulsif cutané.")}
              </Text>
            </View>

            <View style={styles.tipsSection}>
              <View style={styles.tipsHeaderRow}>
                <Ionicons name="partly-sunny-outline" size={18} color={Colors.cta} />
                <Text style={styles.tipsTitle}>{t('Conseils météo')}</Text>
              </View>
              <Text style={styles.tipsParagraph}>
                {t("Le Burkina Faso connaît deux grandes saisons. La saison sèche (novembre à mai) est marquée par l'harmattan, un vent chaud et poussiéreux, avec des températures pouvant dépasser 35°C en mars-avril — prévoyez des vêtements légers, un chapeau et une bonne hydratation. La saison des pluies (juin à septembre) apporte des averses parfois intenses en fin de journée, avec une chaleur plus humide; un vêtement de pluie léger est utile. Les soirées peuvent être plus fraîches en décembre-janvier, surtout la nuit.")}
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* USEFUL NUMBERS MODAL */}
      <Modal
        visible={numbersModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setNumbersModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.headerGradient[0]} />
          <LinearGradient
            colors={Colors.headerGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>{t('Numéros utiles')}</Text>
            <TouchableOpacity onPress={() => setNumbersModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {numberGroups.length === 0 ? (
              <Text style={styles.emptyModalText}>{t('Aucun numéro disponible pour le moment.')}</Text>
            ) : (
              numberGroups.map((group, i) => (
                <View key={group}>
                  <Text style={[styles.tipsTitle, { marginTop: i === 0 ? 0 : 16, marginBottom: 10 }]}>{t(group)}</Text>
                  {numbersByGroup[group].map(item => (
                    <NumberRow key={item.id} label={t(item.label)} number={item.number} icon={item.icon} />
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* OFFICIAL GOVERNMENT SITES MODAL */}
      <Modal
        visible={sitesModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSitesModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor={Colors.headerGradient[0]} />
          <LinearGradient
            colors={Colors.headerGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>{t('Sites officiels du gouvernement')}</Text>
            <TouchableOpacity onPress={() => setSitesModalVisible(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {officialSites.length === 0 ? (
              <Text style={styles.emptyModalText}>{t('Aucun site disponible pour le moment.')}</Text>
            ) : (
              officialSites.map(item => (
                <OfficialSiteRow
                  key={item.id}
                  name={t(item.name)}
                  description={item.description ? t(item.description) : undefined}
                  website={item.website}
                  facebook={item.facebook}
                  icon={item.icon}
                />
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 340, width: '100%' },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: 10, paddingTop: 20, paddingBottom: 40 },
  intro: { fontSize: 15, fontWeight: '400', lineHeight: 22, color: '#1A1A1A', marginBottom: 24 },
  infoValueRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  modalContainer: { flex: 1, backgroundColor: '#e8ecf0' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '400', color: '#fff' },
  modalClose: { fontSize: 24, color: '#fff', fontWeight: '400', padding: 4 },
  modalContent: { padding: 20, paddingBottom: 40 },
  travelLinkCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  travelLinkIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  travelLinkTitle: { fontSize: 14, fontWeight: '400', color: '#1A1A1A', marginBottom: 2 },
  travelLinkSub: { fontSize: 12, color: '#8A8A8A' },
  officialCard: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 12,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  officialHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  officialDesc: { fontSize: 12.5, lineHeight: 18, color: '#5A5A5A', marginBottom: 10 },
  officialLinkRow: { flexDirection: 'row', gap: 10 },
  officialLinkBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: Colors.primary + '1c', borderRadius: 6, paddingVertical: 8, paddingHorizontal: 12, flex: 1,
  },
  officialLinkText: { fontSize: 12.5, fontWeight: '400', color: Colors.primary },
  emptyModalText: { fontSize: 13, color: '#8A8A8A', textAlign: 'center', marginTop: 30 },
  tipsSection: { marginTop: 10, backgroundColor: '#fff', borderRadius: 10, padding: 14 },
  tipsHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tipsTitle: { fontSize: 15, fontWeight: '400', color: '#1A1A1A' },
  tipsParagraph: { fontSize: 13, lineHeight: 20, color: '#3A3A3A' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  infoCard: { width: '48%', backgroundColor: '#F7F7F7', borderRadius: 7, padding: 12, marginBottom: 10 },
  infoLabel: { fontSize: 11, fontWeight: '400', color: '#8A8A8A', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '400', color: '#1A1A1A' },
  section: { marginBottom: 26 },
  sectionTitle: { fontSize: 18, fontWeight: '400', color: Colors.primary, marginBottom: 10 },
  paragraph: { fontSize: 14, lineHeight: 21, color: '#3A3A3A', marginBottom: 14 },
  sectionImageWrap: { marginBottom: 14 },
  sectionImage: { width: '100%', height: 190, borderRadius: 8 },
  caption: { fontSize: 11, color: '#8A8A8A', marginTop: 6, textAlign: 'center' },
  tourismCta: {
    height: 150, borderRadius: 12, overflow: 'hidden', marginTop: 8,
    elevation: 4, shadowColor: Colors.headerGradient[0],
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  tourismCtaImage: { width: '100%', height: '100%', position: 'absolute' },
  tourismCtaOverlay: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    padding: 18, gap: 14,
  },
  tourismCtaTitle: { fontSize: 17, fontWeight: '600', color: '#fff', marginBottom: 4 },
  tourismCtaSub: { fontSize: 12.5, lineHeight: 17, color: 'rgba(255,255,255,0.85)' },
  tourismCtaArrow: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
});
