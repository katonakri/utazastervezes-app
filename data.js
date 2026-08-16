/**
 * data.js
 * ------------------------------------------------------------------
 * MOCK ADATOK — Step 1 örökség. Az éles programadatok a Supabase-ből
 * érkeznek; ebből a fájlból jelenleg a felhasználók és UI-konfigurációk
 * vannak használatban.
 * ------------------------------------------------------------------
 */

// Az öt fős társaság — ebből választ a felhasználó induláskor.
const USERS = ['Deli', 'Peti', 'Ármin', 'Tina', 'Kristóf'];

// Kategóriák — sorrend = megjelenési sorrend a szűrősávban.
const CATEGORIES = [
  { id: 'osszes', label: 'Összes', icon: 'grid' },
  { id: 'termeszet', label: 'Természet', icon: 'tree' },
  { id: 'viz', label: 'Víz', icon: 'droplet' },
  { id: 'gyerek', label: 'Gyerek', icon: 'smile' },
  { id: 'latnivalo', label: 'Látnivaló', icon: 'crown' },
  { id: 'kisvasut', label: 'Kisvasút', icon: 'train' },
  { id: 'etterem', label: 'Étterem', icon: 'restaurant' },
];

const SORT_OPTIONS = [
  { id: 'liked', label: 'Leginkább lájkolt' },
  { id: 'closest', label: 'Legközelebbi' },
  { id: 'shortest', label: 'Legrövidebb' },
  { id: 'price', label: 'Ár szerint' },
];

// A régi mock programok kompatibilitási célból megmaradnak.
const PROGRAMS = [];
const MOCK_VOTES = [];
