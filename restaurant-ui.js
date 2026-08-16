/* Restaurant category UI additions. Loaded after data.js and before app.js. */

ICON_PATHS.restaurant = '<path d="M6 3v7.2a3 3 0 0 0 6 0V3M9 3v7M12 3v7"/><path d="M9 13v8"/><path d="M17 3v18"/><path d="M17 3c2.1 1.1 3.1 3.2 3.1 5.5 0 2.3-1 4.1-3.1 4.8"/>';

if (!CATEGORIES.some((category) => category.id === 'etterem')) {
  CATEGORIES.push({ id: 'etterem', label: 'Étterem', icon: 'restaurant' });
}
