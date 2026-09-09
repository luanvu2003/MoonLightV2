import fs from 'fs';

let content = fs.readFileSync('public/js/shop.js', 'utf-8');

const brokenTarget = `  // Tìm trong danh sách LocalStorage trước
  currentProduct = products.find((p) => String(p.id) === String(id) || String(p._id) === String(id));

      if (apiRes && (apiRes.data || apiRes.product)) {
        currentProduct = apiRes.data || apiRes.product;
      }
    } catch (e) {
      console.warn('[Shop] Không tìm thấy sản phẩm qua API:', e.message);
    }
  }`;

const fixedTarget = `  // Tìm trong danh sách LocalStorage trước
  currentProduct = products.find((p) => String(p.id) === String(id) || String(p._id) === String(id));

  // Thử tải trực tiếp từ Backend API nếu chưa thấy
  if (!currentProduct && window.MoonlightAPI && id) {
    try {
      const apiRes = await window.MoonlightAPI.getProductById(id);
      if (apiRes && (apiRes.data || apiRes.product)) {
        currentProduct = apiRes.data || apiRes.product;
      }
    } catch (e) {
      console.warn('[Shop] Không tìm thấy sản phẩm qua API:', e.message);
    }
  }`;

// normalize \r\n to \n for replacement
const normalized = content.replace(/\r\n/g, '\n');
if (normalized.includes(brokenTarget)) {
  const newContent = normalized.replace(brokenTarget, fixedTarget);
  fs.writeFileSync('public/js/shop.js', newContent, 'utf-8');
  console.log('✅ Fixed loadProductDetail MoonlightAPI block');
} else {
  console.log('⚠️ Broken target not found, checking with regex');
  const regex = /currentProduct = products\.find\(\(p\) => String\(p\.id\) === String\(id\) \|\| String\(p\._id\) === String\(id\)\);\s+if \(apiRes && \(apiRes\.data \|\| apiRes\.product\)\) \{[\s\S]*?console\.warn\('\[Shop\] Không tìm thấy sản phẩm qua API:', e\.message\);\s+\}\s+\}/;
  if (regex.test(normalized)) {
    const newContent = normalized.replace(regex, `currentProduct = products.find((p) => String(p.id) === String(id) || String(p._id) === String(id));\n\n  // Thử tải trực tiếp từ Backend API nếu chưa thấy\n  if (!currentProduct && window.MoonlightAPI && id) {\n    try {\n      const apiRes = await window.MoonlightAPI.getProductById(id);\n      if (apiRes && (apiRes.data || apiRes.product)) {\n        currentProduct = apiRes.data || apiRes.product;\n      }\n    } catch (e) {\n      console.warn('[Shop] Không tìm thấy sản phẩm qua API:', e.message);\n    }\n  }`);
    fs.writeFileSync('public/js/shop.js', newContent, 'utf-8');
    console.log('✅ Fixed loadProductDetail via regex!');
  } else {
    console.error('❌ Regex match failed too');
  }
}
