update category : Just edit constants/index.ts directly. Here are some ideas tailored to Burkina Faso:export const CATEGORIES: CategoryItem[] = [
  { label: 'Alimentation',  icon: '🍽️', color: '#E65100' },  // maquis, restaurants, street food
  { label: 'Mode & Tissus', icon: '👘', color: '#6A1B9A' },  // faso dan fani, pagnes, tailleurs
  { label: 'Électronique',  icon: '📱', color: '#1565C0' },  // téléphones, réparations
  { label: 'Services',      icon: '🔧', color: '#00695C' },  // plombiers, électriciens, menuisiers
  { label: 'Transport',     icon: '🛵', color: '#F57F17' },  // zémidjans, taxis, location motos
  { label: 'Beauté',        icon: '💈', color: '#AD1457' },  // coiffure, salons, soins
  { label: 'Santé',         icon: '🏥', color: '#00838F' },  // cliniques, pharmacies, tradipraticiens
  { label: 'Agriculture',   icon: '🌾', color: '#558B2F' },  // vivriers, maraîchage, élevage
  { label: 'Artisanat',     icon: '🪘', color: '#A0522D' },  // sculpture, bijoux, poterie, bronze
  { label: 'Éducation',     icon: '📚', color: '#1976D2' },  // écoles, cours particuliers, formations
  { label: 'Immobilier',    icon: '🏠', color: '#455A64' },  // locations, ventes, construction
  { label: 'Autre',         icon: '📦', color: '#37474F' },
];


then Also update the Category type in types/index.ts to match — just add the new label names:
export type Category =
  | 'Alimentation'
  | 'Mode & Tissus'
  | 'Électronique'
  | 'Services'
  | 'Transport'
  | 'Beauté'
  | 'Santé'
  | 'Agriculture'
  | 'Artisanat'
  | 'Éducation'
  | 'Immobilier'
  | 'Autre';