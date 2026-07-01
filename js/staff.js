/* ==========================================================================
   STAFF.JS - POS SYSTEM (BÁN HÀNG)
   ========================================================================== */

let products = JSON.parse(localStorage.getItem('moonlight_products')) || [];
let posCart = [];
let currentPosSelection = { product: null, variantIndex: 0, sizeName: '', maxStock: 0 };

document.addEventListener('DOMContentLoaded', () => {
    checkStaffAuth();
    initPosSystem();
});

function checkStaffAuth() {
    const user = JSON.parse(localStorage.getItem('moonlight_user'));
    if (!user) window.location.href = 'login.html';
    document.getElementById('staffName').innerText = user.name;
}

function initPosSystem() { renderPosProducts(); renderPosCart(); }

function renderPosProducts(keyword = '') {
    const grid = document.getElementById('posProductGrid');
    if(!grid) return;
    products = JSON.parse(localStorage.getItem('moonlight_products')) || []; 
    
    let list = products;
    if(keyword) list = list.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));

    grid.innerHTML = list.map(p => {
        const v = p.variants[0];
        const totalStock = p.variants.reduce((sum, v) => sum + v.sizes.reduce((s, size) => s + (size.stock||0), 0), 0);
        return `<div class="pos-product-card" onclick="openPosVariantModal(${p.id})">
            <span class="pos-stock-badge" style="background:${totalStock>0?'rgba(0,0,0,0.6)':'red'}">Kho: ${totalStock}</span>
            <img src="${v.img}" class="pos-card-img"><div class="pos-card-info"><div class="pos-card-name">${p.name}</div><div class="pos-card-price">${v.price.toLocaleString()}₫</div></div>
        </div>`;
    }).join('');
}

function searchPosProduct() { renderPosProducts(document.getElementById('posSearchInput').value); }

function openPosVariantModal(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    currentPosSelection = { product: p, variantIndex: 0, sizeName: '', maxStock: 0 };
    
    // Render Màu
    let html = `<div class="pos-v-section-title">Chọn Màu</div><div class="pos-v-options" id="posColorOpts">`;
    p.variants.forEach((v, idx) => {
        html += `<div class="pos-v-btn ${idx===0?'selected':''}" onclick="setPosVariant(${idx})"><span style="width:10px;height:10px;background:${v.hex};border-radius:50%;display:inline-block"></span> ${v.color}</div>`;
    });
    html += `</div>`;
    
    // Render Size
    html += `<div class="pos-v-section-title">Chọn Size</div><div class="pos-v-options" id="posSizeOpts">${renderSizeBtns(p.variants[0].sizes)}</div>`;
    
    document.getElementById('posVariantContainer').innerHTML = html;
    document.getElementById('posVariantModal').classList.add('open');
}

function renderSizeBtns(sizes) {
    if(!sizes || sizes.length===0) return 'Hết hàng';
    return sizes.map(s => {
        // Auto select first available
        if(!currentPosSelection.sizeName && s.stock > 0) { currentPosSelection.sizeName = s.name; currentPosSelection.maxStock = s.stock; }
        const isSelected = currentPosSelection.sizeName === s.name;
        const disabled = s.stock <= 0 ? 'opacity:0.3;pointer-events:none' : '';
        return `<div class="pos-v-btn ${isSelected?'selected':''}" style="${disabled}" onclick="setPosSize('${s.name}', ${s.stock})">${s.name} <small>(${s.stock})</small></div>`;
    }).join('');
}

function setPosVariant(idx) {
    currentPosSelection.variantIndex = idx; currentPosSelection.sizeName = '';
    document.querySelectorAll('#posColorOpts .pos-v-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('#posColorOpts .pos-v-btn')[idx].classList.add('selected');
    document.getElementById('posSizeOpts').innerHTML = renderSizeBtns(currentPosSelection.product.variants[idx].sizes);
}

function setPosSize(name, stock) {
    currentPosSelection.sizeName = name; currentPosSelection.maxStock = stock;
    document.querySelectorAll('#posSizeOpts .pos-v-btn').forEach(b => {
        b.classList.remove('selected');
        if(b.innerText.includes(name)) b.classList.add('selected');
    });
}

function confirmPosAddToCart() {
    const { product, variantIndex, sizeName, maxStock } = currentPosSelection;
    if (!sizeName) return alert("Chọn size!");
    const v = product.variants[variantIndex];
    const item = { id: product.id, name: product.name, price: v.price, img: v.img, color: v.color, size: sizeName, quantity: 1, maxStock };
    
    const exist = posCart.find(i => i.id===item.id && i.color===item.color && i.size===item.size);
    if(exist) { if(exist.quantity < exist.maxStock) exist.quantity++; else alert("Hết kho!"); }
    else posCart.push(item);
    
    renderPosCart(); document.getElementById('posVariantModal').classList.remove('open');
}

function renderPosCart() {
    const container = document.getElementById('posCartItems');
    if(!container) return;
    let total=0, qty=0;
    container.innerHTML = posCart.map((item, idx) => {
        total += item.price*item.quantity; qty+=item.quantity;
        return `<div class="pos-item"><img src="${item.img}"><div class="pos-item-info"><div class="pos-item-name">${item.name}</div><div class="pos-item-meta">${item.color} | ${item.size}</div><div class="pos-item-price">${item.price.toLocaleString()}₫</div></div><div class="pos-qty-ctrl"><button class="pos-qty-btn" onclick="posQty(${idx},-1)">-</button><input class="pos-qty-val" value="${item.quantity}" readonly><button class="pos-qty-btn" onclick="posQty(${idx},1)">+</button></div><button style="margin-left:5px;background:none;border:none;color:#ff4444" onclick="posRemove(${idx})">x</button></div>`;
    }).join('');
    document.getElementById('posTotalPrice').innerText = total.toLocaleString()+'₫';
    document.getElementById('posTotalQty').innerText = qty;
}
function posQty(idx, chg) {
    const item = posCart[idx];
    if(item.quantity+chg > item.maxStock) return alert("Hết hàng!");
    item.quantity+=chg;
    if(item.quantity<=0) posCart.splice(idx,1);
    renderPosCart();
}
function posRemove(idx) { posCart.splice(idx,1); renderPosCart(); }
function closePosModal() { document.getElementById('posVariantModal').classList.remove('open'); }

function processPosCheckout() {
    if(posCart.length===0) return alert("Giỏ trống!");
    const name = document.getElementById('posCusName').value || 'Khách lẻ';
    const total = posCart.reduce((s,i)=>s+i.price*i.quantity,0);
    
    if(confirm(`Thanh toán ${total.toLocaleString()}₫?`)) {
        const order = { id: "POS"+Date.now().toString().slice(-6), customer: {name, address: "Tại cửa hàng"}, items: [...posCart], total, status: 'completed', isPaid: true, date: new Date().toLocaleString('vi-VN'), paymentMethod: document.querySelector('input[name="posPayment"]:checked').value };
        let orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
        orders.unshift(order);
        localStorage.setItem('moonlight_orders', JSON.stringify(orders));

        // Trừ kho
        posCart.forEach(c => {
            const pIdx = products.findIndex(p=>p.id===c.id);
            if(pIdx!==-1) {
                const vIdx = products[pIdx].variants.findIndex(v=>v.color===c.color);
                const sIdx = products[pIdx].variants[vIdx].sizes.findIndex(s=>s.name===c.size);
                if(sIdx!==-1) products[pIdx].variants[vIdx].sizes[sIdx].stock -= c.quantity;
                products[pIdx].stock -= c.quantity;
                products[pIdx].sold += c.quantity;
            }
        });
        localStorage.setItem('moonlight_products', JSON.stringify(products));
        
        posCart = []; renderPosCart(); renderPosProducts();
        alert("Thành công!");
    }
}