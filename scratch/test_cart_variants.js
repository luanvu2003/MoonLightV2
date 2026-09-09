// Prototype logic for in-cart color and size switcher
const testProducts = [
  {
    id: 1,
    name: "Áo Vest Luxury Slim Fit Hoàng Gia",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
    price: 2450000,
    variants: [
      {
        color: "Đen Hoàng Gia",
        price: 2450000,
        img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
        sizes: [
          { size: "M", stock: 20 },
          { size: "L", stock: 20 },
          { size: "XL", stock: 10 }
        ]
      },
      {
        color: "Xanh Navy Đêm",
        price: 2450000,
        img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
        sizes: [
          { size: "M", stock: 15 },
          { size: "L", stock: 15 },
          { size: "XL", stock: 8 }
        ]
      }
    ]
  }
];

let cart = [
  {
    id: 1,
    name: "Áo Vest Luxury Slim Fit Hoàng Gia",
    price: 2450000,
    color: "Đen Hoàng Gia",
    size: "L",
    quantity: 1,
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800"
  },
  {
    id: 1,
    name: "Áo Vest Luxury Slim Fit Hoàng Gia",
    price: 2450000,
    color: "Xanh Navy Đêm",
    size: "M",
    quantity: 2,
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800"
  }
];

function changeCartItemColor(index, newColor) {
  if (!cart[index]) return;
  const item = cart[index];
  const p = testProducts.find(x => String(x.id) === String(item.id));
  if (!p || !p.variants) return;
  const newV = p.variants.find(v => v.color === newColor);
  if (!newV) return;

  item.color = newColor;
  item.price = newV.price || p.price;
  item.img = newV.img || p.image;
  item.image = newV.img || p.image;

  // Check if current size is valid in new variant
  const hasSize = newV.sizes && newV.sizes.some(s => (s.size || s.name || s) === item.size && (s.stock ?? 1) > 0);
  if (!hasSize && newV.sizes && newV.sizes.length > 0) {
    const firstAvail = newV.sizes.find(s => (s.stock ?? 1) > 0) || newV.sizes[0];
    item.size = typeof firstAvail === 'string' ? firstAvail : (firstAvail.size || firstAvail.name || 'M');
  }

  // Check if another item in cart matches (same id, color, size)
  const dupIdx = cart.findIndex((it, i) => i !== index && String(it.id) === String(item.id) && it.color === item.color && it.size === item.size);
  if (dupIdx > -1) {
    cart[dupIdx].quantity += item.quantity;
    cart.splice(index, 1);
  }
}

function changeCartItemSize(index, newSize) {
  if (!cart[index]) return;
  const item = cart[index];
  const p = testProducts.find(x => String(x.id) === String(item.id));
  if (p && p.variants) {
    const v = p.variants.find(va => va.color === item.color);
    if (v && v.sizes) {
      const s = v.sizes.find(sz => (sz.size || sz.name || sz) === newSize);
      const maxStock = s ? (typeof s === 'object' ? (s.stock ?? 999) : 999) : 999;
      if (maxStock <= 0) return;
      if (item.quantity > maxStock) item.quantity = maxStock;
    }
  }

  item.size = newSize;

  // Check duplicate
  const dupIdx = cart.findIndex((it, i) => i !== index && String(it.id) === String(item.id) && it.color === item.color && it.size === item.size);
  if (dupIdx > -1) {
    cart[dupIdx].quantity += item.quantity;
    cart.splice(index, 1);
  }
}

console.log("Before change color:", JSON.stringify(cart));
changeCartItemColor(1, "Đen Hoàng Gia");
console.log("After change color to Đen Hoàng Gia (size was M, no conflict with L):", JSON.stringify(cart));
changeCartItemSize(1, "L");
console.log("After change size to L (now conflicts with item 0 -> should merge):", JSON.stringify(cart));
