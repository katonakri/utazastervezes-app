/**
 * data.js
 * ------------------------------------------------------------------
 * MOCK ADATOK — STEP 1 (UI prototípus)
 *
 * Ezek az objektumok szándékosan ugyanazt a "alakot" követik, mint a
 * későbbi Supabase táblák (programs / votes), hogy a Step 5-ben
 * (Frontend + Supabase integráció) minimális legyen az átalakítás:
 * elég lesz az app.js-ben a data-access réteget (lásd DataStore az
 * app.js tetején) Supabase hívásokra cserélni, a render- és
 * state-logika változatlan maradhat.
 *
 * A képek Wikimedia Commons publikus, szabadon felhasználható
 * fájljaira mutatnak (Special:FilePath állandó hivatkozás). Ha egy
 * kép mégsem eleg jó minőségű / releváns, a program_id alapján itt,
 * a data.js-ben egyszerűen cserélhető — az UI automatikusan egy
 * halvány, kategóriaszínű illusztrációra vált vissza, ha egy kép
 * mégsem töltődne be (lásd app.js -> handleImageError).
 * ------------------------------------------------------------------
 */

// Az öt fős társaság — ebből választ a felhasználó induláskor.
const USERS = ['Kristóf', 'Anna', 'Tina', 'Péter', 'Zsófi'];

// Kategóriák — sorrend = megjelenési sorrend a szűrősávban.
const CATEGORIES = [
  { id: 'osszes', label: 'Összes', icon: 'grid' },
  { id: 'termeszet', label: 'Természet', icon: 'tree' },
  { id: 'viz', label: 'Víz', icon: 'droplet' },
  { id: 'gyerek', label: 'Gyerek', icon: 'smile' },
  { id: 'latnivalo', label: 'Látnivaló', icon: 'crown' },
  { id: 'kisvasut', label: 'Kisvasút', icon: 'train' },
];

// Rendezési lehetőségek.
const SORT_OPTIONS = [
  { id: 'liked', label: 'Leginkább lájkolt' },
  { id: 'closest', label: 'Legközelebbi' },
  { id: 'shortest', label: 'Legrövidebb' },
  { id: 'price', label: 'Ár szerint' },
];

/**
 * PROGRAMS — a leendő Supabase "programs" tábla tükre.
 * A duration_hours_min és price_sort_value mezők NEM jelennek meg a
 * UI-n — kizárólag rendezési segédértékek (lásd 7. pont: Legrövidebb /
 * Ár szerint), hogy ne kelljen a megjelenített szöveget ("1–2 óra",
 * "Belépős") parse-olni.
 */
const PROGRAMS = [
  {
    id: 1,
    title: 'Síkfőkúti tavak',
    category: 'termeszet',
    icon: 'tree',
    image_url:
      'https://commons.wikimedia.org/wiki/Special:FilePath/A_S%C3%ADkf%C5%91k%C3%BAt_Project_panor%C3%A1ma_k%C3%A9pe.jpg',
    description:
      'Tavak, erdő, forrás, patak és játszótér. Kellemes, árnyékos séta kisgyerekkel is.',
    distance_km: 1.2,
    drive_minutes: 3,
    duration: '1–2 óra',
    duration_hours_min: 1,
    price: 'Ingyenes',
    price_sort_value: 0,
    google_maps_url:
      'https://www.google.com/maps/search/?api=1&query=S%C3%ADkf%C5%91k%C3%BAti+tavak+Noszvaj',
    official_url: 'https://www.google.com/search?q=S%C3%ADkf%C5%91k%C3%BAti+tavak+Noszvaj',
    is_active: true,
    created_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 2,
    title: 'Bogácsi Gyógy- és Strandfürdő',
    category: 'viz',
    icon: 'droplet',
    image_url:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Therm%C3%A1lf%C3%BCrd%C5%91,_D%C3%B3zsa_Gy%C3%B6rgy_utca,_Bog%C3%A1cs2.jpg',
    description:
      'Pancsoló Paradicsom, gyerekmedencék és csúszdák. Tökéletes nyári program.',
    distance_km: 10,
    drive_minutes: 15,
    duration: '3–5 óra',
    duration_hours_min: 3,
    price: 'Belépős',
    price_sort_value: 1,
    google_maps_url:
      'https://www.google.com/maps/search/?api=1&query=Bog%C3%A1csi+Gy%C3%B3gy-+%C3%A9s+Strandf%C3%BCrd%C5%91',
    official_url:
      'https://www.bogacs.hu/index.php/hu/szabadido/programok/esemenynaptar/venue/8-bogacsi-gyogy-es-strandfurdo',
    is_active: true,
    created_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 3,
    title: 'Noszvaji barlanglakások',
    category: 'latnivalo',
    icon: 'crown',
    image_url:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Barlanglak%C3%A1sok_Noszvajon.jpg',
    description:
      'Egyedülálló barlanglakások, érdekes történetekkel a noszvaji múltról.',
    distance_km: 1.5,
    drive_minutes: 4,
    duration: '1–1,5 óra',
    duration_hours_min: 1,
    price: 'Felnőtt 1 000 Ft, gyermek 500 Ft',
    price_sort_value: 1000,
    google_maps_url: 'https://www.google.com/maps/search/?api=1&query=Noszvaji+barlanglak%C3%A1sok',
    official_url: 'https://www.google.com/search?q=noszvaji+barlanglak%C3%A1sok',
    is_active: true,
    created_at: '2026-06-01T10:00:00Z',
  },
  {
    id: 4,
    title: 'Szilvásváradi kisvasút',
    category: 'kisvasut',
    icon: 'train',
    image_url:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Szalajka_Valley_Forest_Railway,_Mk48-403,_2016_Hungary.jpg',
    description: 'A kisvasút felvisz a Szalajka-völgybe, nagy élmény a gyerekeknek is.',
    distance_km: 30,
    drive_minutes: 40,
    duration: '2–3 óra',
    duration_hours_min: 2,
    price: 'Belépős',
    price_sort_value: 1,
    google_maps_url:
      'https://www.google.com/maps/search/?api=1&query=Szilv%C3%A1sv%C3%A1radi+Erdei+Vas%C3%BAt',
    official_url: 'https://www.szilvasvarad.hu/hu/szalajka-volgy/szilvasvaradi-erdei-kisvasut',
    is_active: true,
    created_at: '2026-06-01T10:00:00Z',
  },
];

/**
 * MOCK_VOTES — a leendő Supabase "votes" tábla tükre.
 * FONTOS: csak 5 felhasználó van, ezért program_id + user_name
 * páronként legfeljebb 1 rekord szerepelhet (ugyanaz a unique
 * constraint, amit a valódi táblán is elő kell írni — lásd Step 3).
 */
const MOCK_VOTES = [
  // Síkfőkúti tavak (1) — 4 like, 0 dislike
  { id: 'v1', program_id: 1, user_name: 'Kristóf', vote_type: 'like', updated_at: '2026-06-02T08:00:00Z' },
  { id: 'v2', program_id: 1, user_name: 'Anna', vote_type: 'like', updated_at: '2026-06-02T08:05:00Z' },
  { id: 'v3', program_id: 1, user_name: 'Tina', vote_type: 'like', updated_at: '2026-06-02T08:10:00Z' },
  { id: 'v4', program_id: 1, user_name: 'Zsófi', vote_type: 'like', updated_at: '2026-06-02T08:15:00Z' },

  // Bogácsi Gyógy- és Strandfürdő (2) — 5 like, 0 dislike
  { id: 'v5', program_id: 2, user_name: 'Kristóf', vote_type: 'like', updated_at: '2026-06-02T08:20:00Z' },
  { id: 'v6', program_id: 2, user_name: 'Anna', vote_type: 'like', updated_at: '2026-06-02T08:25:00Z' },
  { id: 'v7', program_id: 2, user_name: 'Tina', vote_type: 'like', updated_at: '2026-06-02T08:30:00Z' },
  { id: 'v8', program_id: 2, user_name: 'Péter', vote_type: 'like', updated_at: '2026-06-02T08:35:00Z' },
  { id: 'v9', program_id: 2, user_name: 'Zsófi', vote_type: 'like', updated_at: '2026-06-02T08:40:00Z' },

  // Noszvaji barlanglakások (3) — 3 like, 1 dislike
  { id: 'v10', program_id: 3, user_name: 'Kristóf', vote_type: 'like', updated_at: '2026-06-02T08:45:00Z' },
  { id: 'v11', program_id: 3, user_name: 'Tina', vote_type: 'like', updated_at: '2026-06-02T08:50:00Z' },
  { id: 'v12', program_id: 3, user_name: 'Zsófi', vote_type: 'like', updated_at: '2026-06-02T08:55:00Z' },
  { id: 'v13', program_id: 3, user_name: 'Anna', vote_type: 'dislike', updated_at: '2026-06-02T09:00:00Z' },

  // Szilvásváradi kisvasút (4) — 4 like, 1 dislike
  { id: 'v14', program_id: 4, user_name: 'Kristóf', vote_type: 'like', updated_at: '2026-06-02T09:05:00Z' },
  { id: 'v15', program_id: 4, user_name: 'Anna', vote_type: 'like', updated_at: '2026-06-02T09:10:00Z' },
  { id: 'v16', program_id: 4, user_name: 'Péter', vote_type: 'like', updated_at: '2026-06-02T09:15:00Z' },
  { id: 'v17', program_id: 4, user_name: 'Zsófi', vote_type: 'like', updated_at: '2026-06-02T09:20:00Z' },
  { id: 'v18', program_id: 4, user_name: 'Tina', vote_type: 'dislike', updated_at: '2026-06-02T09:25:00Z' },
];
