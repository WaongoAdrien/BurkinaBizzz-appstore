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

[REDACTED — Resend API key removed, rotate in Resend dashboard]

  this my claude AI link to make update easy: https://claude.ai/share/8f986d7c-7362-4fbc-9544-dd94d470e345 
icon : https://ionic.io/ionicons

build: eas build --platform ios --profile production
  push to app connect: eas submit --platform ios


  To update: npx expo install expo-updates 
  eas update:configure
  eas update --channel production --message "Fix login button alignment"
  eas submit --platform ios

this case the icon name to appear : ${cat.icon} look for it adn delete it 

  # ⭐ Business Priority System - Admin Guide

## ✅ What's Implemented:

You can now manually control the order businesses appear in the Annuaire!

---

## 📝 How to Use:

### **As Admin:**

1. **Go to Admin Panel**
2. **Click "Modifier" (Edit)** on any business
3. **Scroll down** to see new section: **"⭐ Position (Admin)"**
4. **Enter Priority number** (0-100):
   - `100` = Appears at the very top
   - `50` = Middle position
   - `10` = Lower position
   - `0` = Default (sorted by date)
5. **Save** → Business moves to new position

---

## 🎯 Sorting Logic:

Businesses appear in this order:

```
1️⃣ PINNED (📌) businesses first
   ↓ (within pinned, sorted by priority)
   
2️⃣ PRIORITY (⭐) number (highest first)
   ↓ (higher number = appears earlier)
   
3️⃣ DATE (newest first)
```

---

## 💡 Example:

**You set:**
- Restaurant A: Priority 100
- Restaurant B: Priority 50
- Restaurant C: Priority 0 (default)
- Restaurant D: Priority 0 (default)
- Hotel Z: Priority 80, Pinned ✅

**Users see:**
```
📌 Hotel Z (pinned, priority 80)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
🍽️ Restaurant A (priority 100) ← Appears first
🍽️ Restaurant B (priority 50)
🍽️ Restaurant C (newest date)
🍽️ Restaurant D (older date)
```

---

## 🔢 Priority Number Guide:

| Priority | Use Case |
|----------|----------|
| **90-100** | Featured/Premium businesses |
| **70-89** | High-quality businesses |
| **50-69** | Good businesses to highlight |
| **10-49** | Slight boost |
| **0** | Default (sorted by date) |

---

## ⚙️ Technical Details:

- **Field:** `priority` (number, 0-100)
- **Default:** 0 (no boost)
- **Admin only:** Regular vendors cannot see or change priority
- **Works with pinned:** Pinned businesses respect priority too
- **No database migration needed:** Optional field, existing businesses = priority 0

---

## 🎨 Admin UI:

New section in edit form (admin only):
```
┌─────────────────────────────────┐
│ ⭐ Position (Admin)              │
├─────────────────────────────────┤
│ Priorité: [50____]              │
│ 💡 0 = ordre par défaut         │
│    100 = tout en haut           │
└─────────────────────────────────┘
```

---

## 🚀 Use Cases:

✅ **Promote paying advertisers** - Give them priority 80-100
✅ **Boost quality businesses** - Priority 60-70
✅ **Feature new partners** - Priority 90
✅ **Seasonal promotions** - Temporarily boost priority
✅ **Fix business ordering** - Manual control when needed

---

## 📌 Notes:

- Vendors **cannot see** the priority field
- Priority works **with** the pinned system (not instead of)
- Easy to change anytime
- Set to 0 to return to default ordering
- No effect on search results (only on main list)

Done! 🎉
