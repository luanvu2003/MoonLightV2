import fs from 'fs';

let content = fs.readFileSync('public/js/catalog.js', 'utf-8');
const target = `  let initialProducts = [];
  try {
    const cached = localStorage.getItem('moonlight_products');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialProducts = parsed;
      }
    }
  } catch (e) {}

  if (initialProducts.length === 0) {
    initialProducts = CATALOG_FALLBACK_PRODUCTS;
  }`;

const replacement = `  let initialProducts = [];
  try {
    const savedVersion = localStorage.getItem('moonlight_data_version');
    const cached = localStorage.getItem('moonlight_products');
    if (cached && savedVersion === 'v3.5') {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialProducts = parsed;
      }
    }
  } catch (e) {}

  if (initialProducts.length === 0) {
    initialProducts = CATALOG_FALLBACK_PRODUCTS;
    try {
      localStorage.setItem('moonlight_products', JSON.stringify(initialProducts));
      localStorage.setItem('moonlight_data_version', 'v3.5');
    } catch (e) {}
  }`;

const normalized = content.replace(/\r\n/g, '\n');
if (normalized.includes(target)) {
  const updated = normalized.replace(target, replacement);
  fs.writeFileSync('public/js/catalog.js', updated, 'utf-8');
  console.log('✅ Updated catalog.js with v3.5 cache versioning');
} else {
  console.error('❌ Target not found in catalog.js');
}
