import fs from 'fs';

const products = JSON.parse(fs.readFileSync('scratch/products.json', 'utf-8'));
const productsFormatted = JSON.stringify(products, null, 2);

// 1. Update shop.js
let shopJs = fs.readFileSync('public/js/shop.js', 'utf-8');
const shopStart = shopJs.indexOf('const SHOP_FALLBACK_PRODUCTS = [');
const shopMarker = '// --- 1. KHỞI TẠO DỮ LIỆU AN TOÀN ---';
const shopMarkerIdx = shopJs.indexOf(shopMarker);

if (shopStart !== -1 && shopMarkerIdx !== -1) {
  const beforeMarker = shopJs.substring(0, shopMarkerIdx);
  const lastBracket = beforeMarker.lastIndexOf('];');
  if (lastBracket !== -1) {
    const newShopJs = shopJs.substring(0, shopStart) +
      `const SHOP_FALLBACK_PRODUCTS = ${productsFormatted};\n\n` +
      shopJs.substring(shopMarkerIdx);
    fs.writeFileSync('public/js/shop.js', newShopJs, 'utf-8');
    console.log('✅ Updated SHOP_FALLBACK_PRODUCTS in public/js/shop.js');
  } else {
    console.error('❌ Could not find lastBracket in shop.js');
  }
} else {
  console.error('❌ Could not find markers in public/js/shop.js:', { shopStart, shopMarkerIdx });
}

// 2. Update catalog.js
let catalogJs = fs.readFileSync('public/js/catalog.js', 'utf-8');
const catStart = catalogJs.indexOf('const CATALOG_FALLBACK_PRODUCTS = [');
const catMarker = '// 2. TRẠNG THÁI BỘ LỌC TOÀN CỤC';
const catMarkerIdx = catalogJs.indexOf(catMarker);

if (catStart !== -1 && catMarkerIdx !== -1) {
  const beforeMarker = catalogJs.substring(0, catMarkerIdx);
  const lastBracket = beforeMarker.lastIndexOf('];');
  if (lastBracket !== -1) {
    const newCatJs = catalogJs.substring(0, catStart) +
      `const CATALOG_FALLBACK_PRODUCTS = ${productsFormatted};\n\n` +
      catalogJs.substring(catMarkerIdx);
    fs.writeFileSync('public/js/catalog.js', newCatJs, 'utf-8');
    console.log('✅ Updated CATALOG_FALLBACK_PRODUCTS in public/js/catalog.js');
  } else {
    console.error('❌ Could not find lastBracket in catalog.js');
  }
} else {
  console.error('❌ Could not find markers in public/js/catalog.js:', { catStart, catMarkerIdx });
}
