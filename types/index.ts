// types/index.ts

export interface BusinessLocation {
  address?: string;          // typed address string
  latitude?: number;
  longitude?: number;
}

export interface DayHours {
  open?: string;    // "HH:MM", 24h
  close?: string;   // "HH:MM", 24h
  closed: boolean;
}

export interface OpeningHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface Business {
  id: string;
  name: string;
  category: Category;
  categories?: Category[];     // NEW: Multiple categories
  description: string;
  city: City;
  phone: string;
  whatsapp?: string;
  strictWhatsapp?: boolean; // NEW: when true, don't fall back to `phone` for the WhatsApp button — only businesses created after this flag was introduced have it
  facebook?: string;
  instagram?: string;
  website?: string;        // NEW: business website URL
  photos: string[];        // array of image URLs
  coverPhoto: string;      // first photo or main image
  location?: BusinessLocation;  // optional GPS/address
  ownerId: string;
  ownerName: string;
  status: 'pending' | 'approved';
  createdAt: string | Date;
  pinned?: boolean;        // admin pin to top
  priority?: number;       // NEW: manual ordering (0-100, higher = appears first)
    verified?: boolean;  // NEW: admin verified status
  relatedBusinessId?: string; // NEW: links to another business listing (e.g. a second branch/location)
  openingHours?: OpeningHours; // NEW: per-day open/close times, used to compute live Ouvert/Fermé status
}

export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: 'pending' | 'vendor' | 'admin';
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  city: City;
  photos?: string[];       // array of image URLs
  imageUrl?: string;       // legacy single-image field, first photo used as fallback
  price: number;
  negotiable?: boolean;    // NEW: shown as "Négociable" badge, invites WhatsApp bargaining
  phone?: string;
  whatsapp?: string;
  ownerId?: string;
  ownerName?: string;
  status?: 'pending' | 'approved';
  createdAt?: string | Date;
}

export type ProductCategory =
  | 'Téléphones & Tablettes'
  | 'Électronique'
  | 'Informatique'
  | 'Véhicules'
  | 'Mode & Vêtements'
  | 'Meubles & Maison'
  | 'Immobilier'
  | 'Loisirs & Sports'
  | 'Bébé & Enfants'
  | 'Autres';

export interface ProductCategoryItem {
  label: ProductCategory;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons' | 'MaterialIcons';
  color: string;
}


export type Category =
  | 'Shopping'
  | 'Restauration'
  | 'Hôtellerie'
  |'Sport-Gym'
  | 'Résidence meublée'
  | 'Services'
  | 'Electroniques'
  | 'Coiffure & Beauté'
  | 'Pharmacies'
  | 'Produits Locaux'
  | 'Soirées'
  | 'Attractions'
  | 'Immobilier'
  | 'Alimentation'
  | 'Automobile'
  | 'Autres';

export type City =
  | 'Ouagadougou'
  | 'Bobo-Dioulasso'
  | 'China'
  | 'New York'
  | 'South Korea';

export interface CategoryItem {
  label: Category;
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons' | 'MaterialIcons';
  color: string;
}

export interface AddBusinessForm {
  name: string;
  category: Category;
  description: string;
  city: City;
  phone: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  photoUris: string[];   // local URIs before upload
}
