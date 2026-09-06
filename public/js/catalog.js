/**
 * 🌙 MoonLight Luxury — Catalog & Filter Engine (catalog.js)
 * Tích hợp toàn diện: MoonlightAPI (MongoDB), Smart Size Advisor (Chiều cao & Cân nặng),
 * Bộ lọc đa tiêu chí (Danh mục, Giới tính, Size, Giá, Kiểu dáng), URL Deep Linking,
 * Quick View, Wishlist, và Giỏ hàng đồng bộ.
 */

// ==========================================================================
// 1. DỮ LIỆU SẢN PHẨM MẪU CHUẨN LUXURY (FALLBACK TOÀN DIỆN)
// ==========================================================================
const CATALOG_FALLBACK_PRODUCTS = [
  {
    "_id": "67c3db00d57e603b70b50001",
    "id": 1,
    "name": "Áo Vest Luxury Slim Fit Hoàng Gia",
    "description": "Chất liệu len Ý dệt thủ công cao cấp, form dáng Slimfit tôn vẻ lịch lãm và quý phái.",
    "category": "vest",
    "type": "vest",
    "gender": "Nam",
    "style": "Slimfit",
    "price": 2450000,
    "originalPrice": 2800000,
    "image": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80",
    "rating": 5,
    "sold": 48,
    "salePercent": 12,
    "badge": "HOT",
    "variants": [
      {
        "color": "Đen Hoàng Gia",
        "colorCode": "#000000",
        "hex": "#000000",
        "img": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80",
        "price": 2450000,
        "sizes": [
          {
            "name": "M",
            "size": "M",
            "stock": 15
          },
          {
            "name": "L",
            "size": "L",
            "stock": 20
          },
          {
            "name": "XL",
            "size": "XL",
            "stock": 10
          }
        ]
      },
      {
        "color": "Xanh Navy Đêm",
        "colorCode": "#1a2a3a",
        "hex": "#1a2a3a",
        "img": "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&auto=format&fit=crop&q=80",
        "price": 2450000,
        "sizes": [
          {
            "name": "M",
            "size": "M",
            "stock": 12
          },
          {
            "name": "L",
            "size": "L",
            "stock": 18
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50002",
    "id": 2,
    "name": "Áo Sơ Mi Lụa Mulberry MoonLight",
    "description": "Vải lụa tơ tằm Mulberry 100%, bóng nhẹ tinh tế, mềm mượt thoáng khí tối đa.",
    "category": "somi",
    "type": "somi",
    "gender": "Nam",
    "style": "Regular fit",
    "price": 890000,
    "originalPrice": 990000,
    "image": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "sold": 125,
    "salePercent": 0,
    "badge": "NEW",
    "variants": [
      {
        "color": "Trắng Ngọc Trai",
        "colorCode": "#f8fafc",
        "hex": "#f8fafc",
        "img": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80",
        "price": 890000,
        "sizes": [
          {
            "name": "S",
            "size": "S",
            "stock": 25
          },
          {
            "name": "M",
            "size": "M",
            "stock": 35
          },
          {
            "name": "L",
            "size": "L",
            "stock": 30
          },
          {
            "name": "XL",
            "size": "XL",
            "stock": 15
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50003",
    "id": 3,
    "name": "Áo Polo Dệt Kim Diamond Knit",
    "description": "Dệt kim sợi cotton Pima cao cấp, họa tiết kim cương dập chìm sang trọng.",
    "category": "polo",
    "type": "polo",
    "gender": "Nam",
    "style": "Slimfit",
    "price": 650000,
    "originalPrice": 760000,
    "image": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "sold": 210,
    "salePercent": 15,
    "badge": "BEST SELLER",
    "variants": [
      {
        "color": "Be Ánh Kim",
        "colorCode": "#d2b48c",
        "hex": "#d2b48c",
        "img": "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80",
        "price": 650000,
        "sizes": [
          {
            "name": "M",
            "size": "M",
            "stock": 40
          },
          {
            "name": "L",
            "size": "L",
            "stock": 50
          },
          {
            "name": "XL",
            "size": "XL",
            "stock": 20
          }
        ]
      },
      {
        "color": "Đen Obsidian",
        "colorCode": "#111827",
        "hex": "#111827",
        "img": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80",
        "price": 650000,
        "sizes": [
          {
            "name": "S",
            "size": "S",
            "stock": 20
          },
          {
            "name": "M",
            "size": "M",
            "stock": 30
          },
          {
            "name": "L",
            "size": "L",
            "stock": 25
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50004",
    "id": 4,
    "name": "Quần Âu May Đo Sartorial Cao Cấp",
    "description": "Vải dệt chéo chống nhăn, cạp đai Gurkha mang đậm phong cách quý ông cổ điển.",
    "category": "quanau",
    "type": "quanau",
    "gender": "Nam",
    "style": "May đo cao cấp",
    "price": 950000,
    "originalPrice": 1100000,
    "image": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "sold": 95,
    "salePercent": 0,
    "badge": "SIGNATURE",
    "variants": [
      {
        "color": "Xám Tro",
        "colorCode": "#708090",
        "hex": "#708090",
        "img": "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80",
        "price": 950000,
        "sizes": [
          {
            "name": "30",
            "size": "30",
            "stock": 20
          },
          {
            "name": "31",
            "size": "31",
            "stock": 25
          },
          {
            "name": "32",
            "size": "32",
            "stock": 22
          }
        ]
      },
      {
        "color": "Đen Tuyển Chọn",
        "colorCode": "#1a1a1a",
        "hex": "#1a1a1a",
        "img": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80",
        "price": 950000,
        "sizes": [
          {
            "name": "29",
            "size": "29",
            "stock": 15
          },
          {
            "name": "30",
            "size": "30",
            "stock": 25
          },
          {
            "name": "31",
            "size": "31",
            "stock": 30
          },
          {
            "name": "32",
            "size": "32",
            "stock": 18
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50005",
    "id": 5,
    "name": "Áo Thun Pima Cotton Heavyweight Oversize",
    "description": "Cotton Pima định lượng 280gsm dày dặn, đứng form chuẩn streetwear sang trọng.",
    "category": "aothun",
    "type": "aothun",
    "gender": "Unisex",
    "style": "Oversize",
    "price": 490000,
    "originalPrice": 550000,
    "image": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "sold": 340,
    "salePercent": 11,
    "badge": "BEST VALUE",
    "variants": [
      {
        "color": "Trắng Sữa",
        "colorCode": "#fdfbf7",
        "hex": "#fdfbf7",
        "img": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
        "price": 490000,
        "sizes": [
          {
            "name": "S",
            "size": "S",
            "stock": 30
          },
          {
            "name": "M",
            "size": "M",
            "stock": 45
          },
          {
            "name": "L",
            "size": "L",
            "stock": 50
          },
          {
            "name": "XL",
            "size": "XL",
            "stock": 25
          }
        ]
      },
      {
        "color": "Đen Mờ Charcoal",
        "colorCode": "#222222",
        "hex": "#222222",
        "img": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80",
        "price": 490000,
        "sizes": [
          {
            "name": "M",
            "size": "M",
            "stock": 40
          },
          {
            "name": "L",
            "size": "L",
            "stock": 40
          },
          {
            "name": "XL",
            "size": "XL",
            "stock": 30
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50006",
    "id": 6,
    "name": "Áo Blazer Nữ Parisian Chic Đẳng Cấp",
    "description": "Thiết kế tôn eo thon, vai đệm nhẹ thanh thoát chuẩn phong cách quý cô Pháp.",
    "category": "vest",
    "type": "vest",
    "gender": "Nu",
    "style": "Slimfit",
    "price": 1890000,
    "originalPrice": 2200000,
    "image": "https://images.unsplash.com/photo-1548624313-039e222d730b?w=800&auto=format&fit=crop&q=80",
    "rating": 5,
    "sold": 62,
    "salePercent": 14,
    "badge": "HOT TREND",
    "variants": [
      {
        "color": "Nâu Kem Latte",
        "colorCode": "#c5a880",
        "hex": "#c5a880",
        "img": "https://images.unsplash.com/photo-1548624313-039e222d730b?w=800&auto=format&fit=crop&q=80",
        "price": 1890000,
        "sizes": [
          {
            "name": "S",
            "size": "S",
            "stock": 20
          },
          {
            "name": "M",
            "size": "M",
            "stock": 25
          },
          {
            "name": "L",
            "size": "L",
            "stock": 15
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50007",
    "id": 7,
    "name": "Đầm Dạ Hội Lụa Satin Moonlit Night",
    "description": "Lụa satin cao cấp óng ả mềm rủ, xẻ tà tinh tế quyến rũ cho đêm tiệc thượng lưu.",
    "category": "dam",
    "type": "dam",
    "gender": "Nu",
    "style": "Dạ hội",
    "price": 2150000,
    "originalPrice": 2500000,
    "image": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "sold": 38,
    "salePercent": 0,
    "badge": "LIMITED",
    "variants": [
      {
        "color": "Đỏ Burgundy Quý Tộc",
        "colorCode": "#6b1426",
        "hex": "#6b1426",
        "img": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80",
        "price": 2150000,
        "sizes": [
          {
            "name": "S",
            "size": "S",
            "stock": 15
          },
          {
            "name": "M",
            "size": "M",
            "stock": 20
          },
          {
            "name": "L",
            "size": "L",
            "stock": 10
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50008",
    "id": 8,
    "name": "Quần Jeans Selvedge Denim Cổ Điển",
    "description": "Vải denim dệt biên Nhật Bản 14oz bền bỉ vượt thời gian, phai màu tự nhiên theo năm tháng.",
    "category": "quanjeans",
    "type": "quanjeans",
    "gender": "Nam",
    "style": "Regular fit",
    "price": 1150000,
    "originalPrice": 1350000,
    "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "sold": 145,
    "salePercent": 15,
    "badge": "",
    "variants": [
      {
        "color": "Xanh Indigo Raw",
        "colorCode": "#1c2841",
        "hex": "#1c2841",
        "img": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80",
        "price": 1150000,
        "sizes": [
          {
            "name": "29",
            "size": "29",
            "stock": 18
          },
          {
            "name": "30",
            "size": "30",
            "stock": 25
          },
          {
            "name": "31",
            "size": "31",
            "stock": 22
          },
          {
            "name": "32",
            "size": "32",
            "stock": 15
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50009",
    "id": 9,
    "name": "Chân Váy Xếp Ly Midi Ánh Kim",
    "description": "Xếp ly tỉ mỉ bằng công nghệ nhiệt cao áp, vải dập hạt kim sa nhẹ nhàng nữ tính.",
    "category": "vay",
    "type": "vay",
    "gender": "Nu",
    "style": "Xòe tự nhiên",
    "price": 780000,
    "originalPrice": 890000,
    "image": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "sold": 88,
    "salePercent": 12,
    "badge": "",
    "variants": [
      {
        "color": "Vàng Champagne Mờ",
        "colorCode": "#e8d8b8",
        "hex": "#e8d8b8",
        "img": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=80",
        "price": 780000,
        "sizes": [
          {
            "name": "S",
            "size": "S",
            "stock": 20
          },
          {
            "name": "M",
            "size": "M",
            "stock": 30
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50010",
    "id": 10,
    "name": "Áo Sơ Mi Nữ Cổ Nơ Lụa Tơ Tằm",
    "description": "Chi tiết nơ cổ thanh lịch, cúc bọc vải cùng tông sang trọng cho quý cô công sở.",
    "category": "somi",
    "type": "somi",
    "gender": "Nu",
    "style": "Regular fit",
    "price": 920000,
    "originalPrice": 1050000,
    "image": "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "sold": 110,
    "salePercent": 0,
    "badge": "POPULAR",
    "variants": [
      {
        "color": "Hồng Phấn Pastel",
        "colorCode": "#f4dcd6",
        "hex": "#f4dcd6",
        "img": "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&auto=format&fit=crop&q=80",
        "price": 920000,
        "sizes": [
          {
            "name": "S",
            "size": "S",
            "stock": 25
          },
          {
            "name": "M",
            "size": "M",
            "stock": 30
          },
          {
            "name": "L",
            "size": "L",
            "stock": 20
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50011",
    "id": 11,
    "name": "Thắt Lưng Da Bò Ý Khóa Vàng MoonLight",
    "description": "Da bò full-grain nhập khẩu Ý, mặt khóa hợp kim mạ vàng 18K khắc laser tinh xảo.",
    "category": "phukien",
    "type": "phukien",
    "gender": "Nam",
    "style": "Freesize",
    "price": 850000,
    "originalPrice": 950000,
    "image": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop&q=80",
    "rating": 5,
    "sold": 190,
    "salePercent": 10,
    "badge": "",
    "variants": [
      {
        "color": "Nâu Espresso",
        "colorCode": "#3d2314",
        "hex": "#3d2314",
        "img": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&auto=format&fit=crop&q=80",
        "price": 850000,
        "sizes": [
          {
            "name": "Freesize",
            "size": "Freesize",
            "stock": 45
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50012",
    "id": 12,
    "name": "Áo Hoodie Nỉ Bông Unisex MoonLight Essential",
    "description": "Chất nỉ bông 380gsm siêu ấm, mũ 2 lớp đứng form in logo dạ quang MoonLight.",
    "category": "aothun",
    "type": "aothun",
    "gender": "Unisex",
    "style": "Oversize",
    "price": 620000,
    "originalPrice": 700000,
    "image": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "sold": 145,
    "salePercent": 11,
    "badge": "BEST SELLER",
    "variants": [
      {
        "color": "Xám Khói",
        "colorCode": "#94a3b8",
        "hex": "#94a3b8",
        "img": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80",
        "price": 620000,
        "sizes": [
          {
            "name": "M",
            "size": "M",
            "stock": 25
          },
          {
            "name": "L",
            "size": "L",
            "stock": 35
          },
          {
            "name": "XL",
            "size": "XL",
            "stock": 30
          },
          {
            "name": "XXL",
            "size": "XXL",
            "stock": 15
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50013",
    "id": 13,
    "name": "Áo Khoác Trench Coat Dáng Dài Anh Quốc",
    "description": "Vải Gabardine chống thấm nước cao cấp, đai lưng thắt tôn dáng mang đậm phong cách London.",
    "category": "vest",
    "type": "vest",
    "gender": "Nam",
    "style": "Regular fit",
    "price": 3200000,
    "originalPrice": 3600000,
    "image": "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80",
    "rating": 5,
    "sold": 35,
    "salePercent": 0,
    "badge": "EXCLUSIVE",
    "variants": [
      {
        "color": "Vàng Kaki Cổ Điển",
        "colorCode": "#c2a649",
        "hex": "#c2a649",
        "img": "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=80",
        "price": 3200000,
        "sizes": [
          {
            "name": "M",
            "size": "M",
            "stock": 10
          },
          {
            "name": "L",
            "size": "L",
            "stock": 15
          },
          {
            "name": "XL",
            "size": "XL",
            "stock": 8
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50014",
    "id": 14,
    "name": "Quần Chino Khaki Slimfit Co Giãn 4 Chiều",
    "description": "Cotton Twill co giãn thoải mái, cạp quần lót viền lụa chống tuột khi sơ vin.",
    "category": "quanau",
    "type": "quanau",
    "gender": "Nam",
    "style": "Slimfit",
    "price": 680000,
    "originalPrice": 750000,
    "image": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "sold": 160,
    "salePercent": 10,
    "badge": "SALE",
    "variants": [
      {
        "color": "Be Cát Sa Mạc",
        "colorCode": "#e0d5c1",
        "hex": "#e0d5c1",
        "img": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80",
        "price": 680000,
        "sizes": [
          {
            "name": "29",
            "size": "29",
            "stock": 20
          },
          {
            "name": "30",
            "size": "30",
            "stock": 25
          },
          {
            "name": "31",
            "size": "31",
            "stock": 30
          },
          {
            "name": "32",
            "size": "32",
            "stock": 20
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50015",
    "id": 15,
    "name": "Áo Len Cổ Lọ Cashmere Thượng Hạng",
    "description": "100% sợi lông dê Cashmere Himalaya siêu mềm nhẹ, giữ ấm đỉnh cao mà không hề bí bách.",
    "category": "aothun",
    "type": "aothun",
    "gender": "Unisex",
    "style": "Regular fit",
    "price": 1450000,
    "originalPrice": 1700000,
    "image": "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=80",
    "rating": 5,
    "sold": 52,
    "salePercent": 0,
    "badge": "LUXURY",
    "variants": [
      {
        "color": "Trắng Ngà Tự Nhiên",
        "colorCode": "#fdfbf7",
        "hex": "#fdfbf7",
        "img": "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=80",
        "price": 1450000,
        "sizes": [
          {
            "name": "S",
            "size": "S",
            "stock": 15
          },
          {
            "name": "M",
            "size": "M",
            "stock": 25
          },
          {
            "name": "L",
            "size": "L",
            "stock": 20
          },
          {
            "name": "XL",
            "size": "XL",
            "stock": 10
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50016",
    "id": 16,
    "name": "Set Vest Dạ Tweed Quý Cô Thượng Lưu",
    "description": "Dạ Tweed dệt kim tuyến ánh ngọc, form crop trẻ trung kết hợp chân váy chữ A quý tộc.",
    "category": "vest",
    "type": "vest",
    "gender": "Nu",
    "style": "Slimfit",
    "price": 2650000,
    "originalPrice": 3000000,
    "image": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
    "rating": 5,
    "sold": 28,
    "salePercent": 0,
    "badge": "NEW",
    "variants": [
      {
        "color": "Houndstooth Đen Trắng",
        "colorCode": "#262626",
        "hex": "#262626",
        "img": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80",
        "price": 2650000,
        "sizes": [
          {
            "name": "S",
            "size": "S",
            "stock": 12
          },
          {
            "name": "M",
            "size": "M",
            "stock": 18
          },
          {
            "name": "L",
            "size": "L",
            "stock": 10
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50017",
    "id": 17,
    "name": "Ví Da Cá Sấu Khâu Tay MoonLight Signature",
    "description": "Da cá sấu sông Nile nguyên tấm tuyển chọn, khâu chỉ sáp thủ công từng đường kim mũi chỉ.",
    "category": "phukien",
    "type": "phukien",
    "gender": "Nam",
    "style": "Freesize",
    "price": 1250000,
    "originalPrice": 1450000,
    "image": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "sold": 76,
    "salePercent": 0,
    "badge": "LIMITED",
    "variants": [
      {
        "color": "Đen Bóng Sơn Mài",
        "colorCode": "#0a0a0a",
        "hex": "#0a0a0a",
        "img": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
        "price": 1250000,
        "sizes": [
          {
            "name": "Freesize",
            "size": "Freesize",
            "stock": 50
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b50018",
    "id": 18,
    "name": "Giày Loafer Da Bóng Đế Phíp Hoàng Gia",
    "description": "Da bê Pháp thuộc thảo mộc bóng loáng, cấu trúc may đế Goodyear siêu êm ái và bền chắc.",
    "category": "phukien",
    "type": "phukien",
    "gender": "Nam",
    "style": "Freesize",
    "price": 2850000,
    "originalPrice": 3200000,
    "image": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80",
    "rating": 5,
    "sold": 45,
    "salePercent": 0,
    "badge": "VIP",
    "variants": [
      {
        "color": "Nâu Da Bò Rượu Vang",
        "colorCode": "#582900",
        "hex": "#582900",
        "img": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&auto=format&fit=crop&q=80",
        "price": 2850000,
        "sizes": [
          {
            "name": "39",
            "size": "39",
            "stock": 10
          },
          {
            "name": "40",
            "size": "40",
            "stock": 15
          },
          {
            "name": "41",
            "size": "41",
            "stock": 20
          },
          {
            "name": "42",
            "size": "42",
            "stock": 12
          },
          {
            "name": "43",
            "size": "43",
            "stock": 8
          }
        ]
      }
    ],
    "isActive": true
  }
];

// 2. TRẠNG THÁI BỘ LỌC TOÀN CỤC (GLOBAL FILTER STATE)
// ==========================================================================
const catalogState = {
  allProducts: [],
  filteredProducts: [],
  displayedLimit: 20,
  limitStep: 20,
  gender: 'all',          // 'all' | 'Nam' | 'Nu' | 'Unisex'
  category: 'all',        // 'all' | 'vest' | 'somi' | 'polo' | 'aothun' | 'quanau' | 'quanjeans' | 'dam' | 'vay' | 'phukien'
  minPrice: null,
  maxPrice: null,
  selectedSizes: new Set(),
  selectedStyles: new Set(),
  searchKeyword: '',
  sortBy: 'featured',     // 'featured' | 'price-asc' | 'price-desc' | 'newest' | 'bestseller' | 'rating'
  viewMode: 'grid-3',     // 'grid-3' | 'grid-4' | 'grid-list'
  
  // Smart Size Advisor
  advisorGender: 'Nam',
  advisorHeight: 172,
  advisorWeight: 68,
  advisorFit: 'regular',  // 'slim' | 'regular' | 'loose'
  advisorSizeResult: 'L',
  advisorActive: false
};

// ==========================================================================
// 3. THUẬT TOÁN TÍNH SIZE THÔNG MINH THEO CHIỀU CAO & CÂN NẶNG
// ==========================================================================
function calculateSmartSize(gender, height, weight, fit) {
  let baseSize = 'L';

  if (gender === 'Nam') {
    if (height < 165) {
      if (weight < 53) baseSize = 'S';
      else if (weight <= 62) baseSize = 'M';
      else baseSize = 'L';
    } else if (height <= 172) {
      if (weight < 58) baseSize = 'S';
      else if (weight <= 67) baseSize = 'M';
      else if (weight <= 76) baseSize = 'L';
      else baseSize = 'XL';
    } else if (height <= 178) {
      if (weight < 64) baseSize = 'M';
      else if (weight <= 74) baseSize = 'L';
      else if (weight <= 84) baseSize = 'XL';
      else baseSize = 'XXL';
    } else if (height <= 185) {
      if (weight < 70) baseSize = 'L';
      else if (weight <= 82) baseSize = 'XL';
      else baseSize = 'XXL';
    } else {
      if (weight < 78) baseSize = 'XL';
      else baseSize = 'XXL';
    }
  } else {
    // Nữ
    if (height < 155) {
      if (weight < 45) baseSize = 'S';
      else if (weight <= 52) baseSize = 'M';
      else baseSize = 'L';
    } else if (height <= 162) {
      if (weight < 48) baseSize = 'S';
      else if (weight <= 55) baseSize = 'M';
      else if (weight <= 62) baseSize = 'L';
      else baseSize = 'XL';
    } else if (height <= 170) {
      if (weight < 53) baseSize = 'S';
      else if (weight <= 60) baseSize = 'M';
      else if (weight <= 68) baseSize = 'L';
      else baseSize = 'XL';
    } else {
      if (weight < 58) baseSize = 'M';
      else if (weight <= 68) baseSize = 'L';
      else baseSize = 'XL';
    }
  }

  // Điều chỉnh theo form dáng mong muốn
  const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
  let curIndex = sizeOrder.indexOf(baseSize);

  if (fit === 'loose' && curIndex < sizeOrder.length - 1) {
    baseSize = sizeOrder[curIndex + 1];
  } else if (fit === 'slim' && curIndex > 0) {
    baseSize = sizeOrder[curIndex - 1];
  }

  return baseSize;
}

// Cập nhật giao diện Advisor theo thời gian thực
function updateAdvisorUI() {
  const size = calculateSmartSize(
    catalogState.advisorGender,
    catalogState.advisorHeight,
    catalogState.advisorWeight,
    catalogState.advisorFit
  );
  catalogState.advisorSizeResult = size;

  const resultEl = document.getElementById('advisorResultSize');
  const hintEl = document.getElementById('advisorResultHint');
  const hText = document.getElementById('advisorHeightVal');
  const wText = document.getElementById('advisorWeightVal');

  if (resultEl) resultEl.innerText = `SIZE ${size}`;
  if (hText) hText.innerText = `${catalogState.advisorHeight} cm`;
  if (wText) wText.innerText = `${catalogState.advisorWeight} kg`;

  const fitName = catalogState.advisorFit === 'slim' ? 'Ôm vừa người' : (catalogState.advisorFit === 'loose' ? 'Rộng rãi thoải mái' : 'Chuẩn form vừa vặn');
  if (hintEl) {
    hintEl.innerText = `Độ phù hợp 98% cho ${catalogState.advisorGender.toLowerCase()}, ${catalogState.advisorHeight}cm / ${catalogState.advisorWeight}kg (${fitName}).`;
  }
}

// ==========================================================================
// 4. ENGINE LỌC & SẮP XẾP SẢN PHẨM (FILTER & SORT ENGINE)
// ==========================================================================
function applyFiltersAndRender(resetLimit = true) {
  if (resetLimit) {
    catalogState.displayedLimit = 20;
  }
  let list = [...catalogState.allProducts];

  // 1. Lọc Giới tính
  if (catalogState.gender !== 'all') {
    list = list.filter(p => p.gender === catalogState.gender || p.gender === 'Unisex');
  }

  // 2. Lọc Danh mục
  if (catalogState.category !== 'all') {
    list = list.filter(p => p.category === catalogState.category || p.type === catalogState.category);
  }

  // 3. Lọc Khoảng giá
  if (catalogState.minPrice !== null) {
    list = list.filter(p => p.price >= catalogState.minPrice);
  }
  if (catalogState.maxPrice !== null) {
    list = list.filter(p => p.price <= catalogState.maxPrice);
  }

  // 4. Lọc Size đã chọn (bao gồm size từ Smart Advisor)
  if (catalogState.selectedSizes.size > 0) {
    list = list.filter(p => {
      if (!p.variants || p.variants.length === 0) return true;
      return p.variants.some(v => 
        v.sizes && v.sizes.some(s => {
          const sName = typeof s === 'string' ? s : (s.size || s.name);
          return catalogState.selectedSizes.has(sName) && (s.stock === undefined || s.stock > 0);
        })
      );
    });
  }

  // 5. Lọc Kiểu dáng (Style)
  if (catalogState.selectedStyles.size > 0) {
    list = list.filter(p => {
      const pStyle = (p.style || '').toLowerCase();
      const pDesc = (p.description || '').toLowerCase();
      for (const st of catalogState.selectedStyles) {
        const stLower = st.toLowerCase();
        if (pStyle.includes(stLower) || pDesc.includes(stLower)) return true;
      }
      return false;
    });
  }

  // 6. Tìm kiếm từ khóa
  if (catalogState.searchKeyword) {
    const kw = catalogState.searchKeyword.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(kw) || 
      (p.description && p.description.toLowerCase().includes(kw)) ||
      (p.category && p.category.toLowerCase().includes(kw))
    );
  }

  // 7. Sắp xếp (Sorting)
  if (catalogState.sortBy === 'price-asc') {
    list.sort((a, b) => a.price - b.price);
  } else if (catalogState.sortBy === 'price-desc') {
    list.sort((a, b) => b.price - a.price);
  } else if (catalogState.sortBy === 'newest') {
    list.sort((a, b) => (new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
  } else if (catalogState.sortBy === 'bestseller') {
    list.sort((a, b) => (b.sold || 0) - (a.sold || 0));
  } else if (catalogState.sortBy === 'rating') {
    list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  catalogState.filteredProducts = list;

  renderProductsGrid(list);
  renderActiveFiltersBar();
  updateCategoryCounts();
  syncURLWithState();
}

// ==========================================================================
// 5. RENDER LƯỚI SẢN PHẨM & CARD CHI TIẾT (VỚI HIỆU ỨNG LUXURY MƯỢT MÀ)
// ==========================================================================
function createCatalogCardHTML(p, idx, isNewAppend = false) {
  const prodId = p._id || p.id;
  const wishlist = getWishlistIds();
  const isLiked = wishlist.includes(String(prodId));
  const firstVariant = (p.variants && p.variants.length > 0) ? p.variants[0] : null;
  const priceNum = (firstVariant && firstVariant.price) ? firstVariant.price : (p.price || 0);
  const displayPrice = priceNum ? Number(priceNum).toLocaleString('vi-VN') + '₫' : 'Liên hệ';
  const oldPrice = (p.originalPrice && p.originalPrice > priceNum) ? Number(p.originalPrice).toLocaleString('vi-VN') + '₫' : '';
  const imgUrl = (firstVariant && firstVariant.img) ? firstVariant.img : (p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800');
  const percent = p.salePercent || 0;
  const iconClass = isLiked ? 'fas' : 'far';
  const badgeText = percent > 0 ? `-${percent}%` : (p.badge ? p.badge : '');

  // Thu thập danh sách màu sắc đang có
  const swatches = (p.variants || []).filter((va) => va.colorCode || va.hex || va.color);
  const swatchesHtml = swatches.length > 0 ? `
    <div class="card-swatches">
      ${swatches.slice(0, 5).map((va, sIdx) => {
        const hex = va.colorCode || va.hex || '#0a0a0a';
        const vImg = va.img || p.image || '';
        const vPrice = va.price || p.price || 0;
        return `
          <span class="swatch-dot ${sIdx === 0 ? 'active' : ''}" 
                style="background: ${hex};" 
                title="${va.color || ''}" 
                onclick="changeCardVariant(event, '${prodId}', '${vImg}', ${vPrice})">
          </span>`;
      }).join('')}
    </div>` : '';

  // Thu thập danh sách size đang có
  const allSizes = [];
  if (p.variants && p.variants.length > 0) {
    p.variants.forEach((va) => {
      if (va.sizes && Array.isArray(va.sizes)) {
        va.sizes.forEach((sz) => {
          const szName = typeof sz === 'string' ? sz : (sz.size || sz.name);
          if (szName && !allSizes.includes(szName)) allSizes.push(szName);
        });
      }
    });
  }
  if (allSizes.length === 0 && p.sizes && Array.isArray(p.sizes)) {
    p.sizes.forEach((sz) => {
      const szName = typeof sz === 'string' ? sz : (sz.size || sz.name);
      if (szName && !allSizes.includes(szName)) allSizes.push(szName);
    });
  }
  if (allSizes.length === 0) {
    allSizes.push('S', 'M', 'L', 'XL');
  }

  const sizesHtml = `
    <div class="card-sizes">
      ${allSizes.slice(0, 5).map((sz) => {
        const isAdvised = (typeof catalogState !== 'undefined' && catalogState.selectedSizes && catalogState.selectedSizes.has(sz));
        return `<span class="card-size-pill ${isAdvised ? 'highlight' : ''}">${sz}</span>`;
      }).join('')}
    </div>`;

  // Độ trễ stagger animation để tạo hiệu ứng lướt mềm mại
  const animDelay = isNewAppend ? Math.min(idx * 0.045, 0.4) : Math.min((idx % 12) * 0.035, 0.42);

  return `
    <div class="product-card card-enter-active" data-id="${prodId}" style="--card-delay: ${animDelay}s;">
        <div class="card-img">
            ${badgeText ? `<span class="badge-sale">${badgeText}</span>` : ''}
            <button class="wishlist-btn ${isLiked ? 'active' : ''}" onclick="toggleWishlist(this, '${prodId}')" title="Thêm vào yêu thích">
              <i class="${iconClass} fa-heart"></i>
            </button>
            <img src="${imgUrl}" alt="${p.name}" loading="lazy">
            <div class="card-overlay-btns">
                <a href="product.html?id=${prodId}" class="view-btn"><i class="far fa-eye"></i> XEM CHI TIẾT</a>
                <button class="add-btn" onclick="quickAddToCart('${prodId}')"><i class="fas fa-shopping-cart"></i> THÊM NHANH</button>
            </div>
        </div>
        <div class="card-info">
            <h3><a href="product.html?id=${prodId}">${p.name}</a></h3>
            <div class="product-meta">
                <span class="stars"><i class="fas fa-star" style="color:#f59e0b;"></i> ${p.rating || 5}</span>
                <span class="sold-count">Đã bán ${p.sold || 0}</span>
            </div>
            ${swatchesHtml}
            ${sizesHtml}
            <div class="price">
                <span class="new-price">${displayPrice}</span>
                ${oldPrice ? `<span class="old-price">${oldPrice}</span>` : ''}
            </div>
        </div>
    </div>`;
}

function renderProductsGrid(products) {
  const grid = document.getElementById('catalogProductsGrid');
  const countEl = document.getElementById('catalogResultsCount');
  const loadMoreBox = document.getElementById('catalogLoadMoreContainer');
  if (!grid) return;

  const totalCount = products ? products.length : 0;
  const currentLimit = catalogState.displayedLimit || 20;

  // Hiệu ứng pulse cập nhật số lượng mượt mà
  if (countEl) {
    countEl.innerHTML = `Tìm thấy <strong>${totalCount}</strong> sản phẩm`;
    countEl.classList.remove('count-updated');
    void countEl.offsetWidth; // Force reflow để trigger animation
    countEl.classList.add('count-updated');
  }

  // Quản lý nút XEM THÊM với hiệu ứng
  if (loadMoreBox) {
    if (totalCount > currentLimit) {
      loadMoreBox.style.display = 'flex';
      const remaining = totalCount - currentLimit;
      loadMoreBox.innerHTML = `
        <button class="btn-luxury-outline" onclick="loadMoreCatalogProducts()">
          <span>XEM THÊM (${remaining} SẢN PHẨM)</span>
          <i class="fas fa-arrow-down"></i>
        </button>
      `;
    } else if (totalCount > 10) {
      loadMoreBox.style.display = 'flex';
      loadMoreBox.innerHTML = `
        <div class="all-products-loaded">
          <i class="fas fa-check-circle"></i> Đã hiển thị tất cả ${totalCount} sản phẩm
        </div>
      `;
    } else {
      loadMoreBox.style.display = 'none';
      loadMoreBox.innerHTML = '';
    }
  }

  if (totalCount === 0) {
    grid.innerHTML = `
      <div class="catalog-empty-state card-enter-active">
        <div class="catalog-empty-icon"><i class="fas fa-search"></i></div>
        <div class="catalog-empty-title">Không tìm thấy sản phẩm phù hợp</div>
        <div class="catalog-empty-desc">Rất tiếc, không có sản phẩm nào khớp với tiêu chí bạn đã lọc. Hãy thử nới lỏng bộ lọc hoặc xóa bớt size đã chọn.</div>
        <button class="btn-reset-filters" onclick="resetAllFilters()" style="margin: 0 auto; background: var(--catalog-gold); color: #000; padding: 10px 24px; border-radius: 8px; font-weight: 700;">
          <i class="fas fa-rotate-right"></i> Xóa Tất Cả Bộ Lọc
        </button>
      </div>
    `;
    return;
  }

  const sliced = products.slice(0, currentLimit);
  grid.innerHTML = sliced.map((p, idx) => createCatalogCardHTML(p, idx, false)).join('');
}

// Hàm bấm Xem Thêm sản phẩm mượt mà (Append mượt, không xóa toàn bộ DOM)
function loadMoreCatalogProducts() {
  const loadMoreBox = document.getElementById('catalogLoadMoreContainer');
  const btn = loadMoreBox ? loadMoreBox.querySelector('.btn-luxury-outline') : null;
  if (!btn || btn.classList.contains('btn-loading')) return;

  // 1. Chuyển nút sang trạng thái đang tải cực mượt
  btn.classList.add('btn-loading');
  btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>ĐANG TẢI THÊM...</span>';

  // 2. Tạo độ trễ tự nhiên (260ms) để hiệu ứng chuyển động chân thật
  setTimeout(() => {
    const grid = document.getElementById('catalogProductsGrid');
    const allProds = catalogState.filteredProducts || [];
    const oldLimit = catalogState.displayedLimit || 20;
    const step = catalogState.limitStep || 20;
    const newLimit = oldLimit + step;
    catalogState.displayedLimit = newLimit;

    const newProducts = allProds.slice(oldLimit, newLimit);
    if (grid && newProducts.length > 0) {
      const newCardsHTML = newProducts.map((p, i) => createCatalogCardHTML(p, i, true)).join('');
      grid.insertAdjacentHTML('beforeend', newCardsHTML);
    }

    // 3. Cập nhật nút bấm
    if (newLimit >= allProds.length) {
      if (loadMoreBox) {
        loadMoreBox.innerHTML = `
          <div class="all-products-loaded">
            <i class="fas fa-check-circle"></i> Đã hiển thị tất cả ${allProds.length} sản phẩm
          </div>
        `;
      }
    } else {
      btn.classList.remove('btn-loading');
      const remaining = allProds.length - newLimit;
      btn.innerHTML = `<span>XEM THÊM (${remaining} SẢN PHẨM)</span> <i class="fas fa-arrow-down"></i>`;
    }

    // 4. Cuộn nhẹ xuống để người dùng thấy ngay các sản phẩm mới
    window.scrollBy({ top: 120, behavior: 'smooth' });
  }, 260);
}

// Đổi ảnh và giá card khi bấm chọn chấm màu
function switchCardVariant(e, pId, imgUrl, priceStr) {
  if (typeof changeCardVariant === 'function') {
    changeCardVariant(e, pId, imgUrl, priceStr);
  }
}

// ==========================================================================
// 6. THANH TAG BỘ LỌC ĐANG ÁP DỤNG (ACTIVE FILTER CHIPS)
// ==========================================================================
function renderActiveFiltersBar() {
  const bar = document.getElementById('activeFiltersBar');
  if (!bar) return;

  const chips = [];

  if (catalogState.gender !== 'all') {
    chips.push({
      label: `Giới tính: ${catalogState.gender === 'Nu' ? 'Nữ' : catalogState.gender}`,
      clear: () => setGenderFilter('all')
    });
  }

  if (catalogState.category !== 'all') {
    chips.push({
      label: `Danh mục: ${formatCatName(catalogState.category)}`,
      clear: () => setCategoryFilter('all')
    });
  }

  if (catalogState.minPrice || catalogState.maxPrice) {
    const minTxt = catalogState.minPrice ? (catalogState.minPrice / 1000) + 'k' : '0';
    const maxTxt = catalogState.maxPrice ? (catalogState.maxPrice / 1000) + 'k' : 'Max';
    chips.push({
      label: `Giá: ${minTxt} - ${maxTxt}`,
      clear: () => { catalogState.minPrice = null; catalogState.maxPrice = null; applyFiltersAndRender(); }
    });
  }

  catalogState.selectedSizes.forEach(sz => {
    chips.push({
      label: `Size ${sz}`,
      clear: () => toggleSizeFilter(sz)
    });
  });

  catalogState.selectedStyles.forEach(st => {
    chips.push({
      label: `Kiểu dáng: ${st}`,
      clear: () => toggleStyleFilter(st)
    });
  });

  if (catalogState.searchKeyword) {
    chips.push({
      label: `Từ khóa: "${catalogState.searchKeyword}"`,
      clear: () => { catalogState.searchKeyword = ''; applyFiltersAndRender(); }
    });
  }

  if (chips.length === 0) {
    bar.innerHTML = '';
    bar.style.display = 'none';
    return;
  }

  bar.style.display = 'flex';
  bar.innerHTML = chips.map((c, i) => `
    <span class="active-filter-tag">
      ${c.label}
      <i class="fas fa-times" onclick="removeActiveFilterChip(${i})"></i>
    </span>
  `).join('') + `
    <button class="btn-reset-filters" onclick="resetAllFilters()" style="margin-left: 8px;">
      <i class="fas fa-trash-can"></i> Xóa tất cả
    </button>
  `;

  window._activeFilterChips = chips;
}

function removeActiveFilterChip(index) {
  if (window._activeFilterChips && window._activeFilterChips[index]) {
    window._activeFilterChips[index].clear();
  }
}

function updateCategoryCounts() {
  const catBtns = document.querySelectorAll('.filter-cat-btn');
  catBtns.forEach(btn => {
    const cat = btn.getAttribute('data-cat');
    if (!cat) return;
    const countEl = btn.querySelector('.filter-cat-count');
    if (!countEl) return;

    if (cat === 'all') {
      countEl.innerText = catalogState.allProducts.length;
    } else {
      const count = catalogState.allProducts.filter(p => p.category === cat || p.type === cat).length;
      countEl.innerText = count;
    }
  });
}

function formatCatName(cat) {
  const map = {
    all: 'Tất Cả Sản Phẩm',
    vest: 'Áo Vest & Blazer',
    somi: 'Áo Sơ Mi Luxury',
    polo: 'Áo Polo Premium',
    aothun: 'Áo Thun & Hoodie',
    quanau: 'Quần Âu May Đo',
    quanjeans: 'Quần Jeans',
    dam: 'Váy & Đầm Dạ Hội',
    vay: 'Chân Váy',
    phukien: 'Phụ Kiện Da'
  };
  return map[cat] || cat;
}

// ==========================================================================
// 7. CÁC HÀM XỬ LÝ SỰ KIỆN LỌC (EVENT HANDLERS)
// ==========================================================================
function setGenderFilter(gender) {
  catalogState.gender = gender;
  document.querySelectorAll('.gender-chip-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-gender') === gender);
  });
  applyFiltersAndRender();
}

function setCategoryFilter(cat) {
  catalogState.category = cat;
  document.querySelectorAll('.filter-cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-cat') === cat);
  });
  applyFiltersAndRender();
}

function toggleSizeFilter(size) {
  if (catalogState.selectedSizes.has(size)) {
    catalogState.selectedSizes.delete(size);
  } else {
    catalogState.selectedSizes.add(size);
  }

  document.querySelectorAll('.size-chip-btn').forEach(btn => {
    const sz = btn.getAttribute('data-size');
    btn.classList.toggle('active', catalogState.selectedSizes.has(sz));
  });

  applyFiltersAndRender();
}

function toggleStyleFilter(style) {
  if (catalogState.selectedStyles.has(style)) {
    catalogState.selectedStyles.delete(style);
  } else {
    catalogState.selectedStyles.add(style);
  }

  document.querySelectorAll('.style-pill-btn').forEach(btn => {
    const st = btn.getAttribute('data-style');
    btn.classList.toggle('active', catalogState.selectedStyles.has(st));
  });

  applyFiltersAndRender();
}

function setPricePreset(min, max) {
  catalogState.minPrice = min;
  catalogState.maxPrice = max;

  const minInput = document.getElementById('priceMinInput');
  const maxInput = document.getElementById('priceMaxInput');
  if (minInput) minInput.value = min || '';
  if (maxInput) maxInput.value = max || '';

  document.querySelectorAll('.price-preset-btn').forEach(btn => {
    const bMin = btn.getAttribute('data-min') ? Number(btn.getAttribute('data-min')) : null;
    const bMax = btn.getAttribute('data-max') ? Number(btn.getAttribute('data-max')) : null;
    btn.classList.toggle('active', bMin === min && bMax === max);
  });

  applyFiltersAndRender();
}

function applyCustomPriceInput() {
  const minVal = document.getElementById('priceMinInput')?.value;
  const maxVal = document.getElementById('priceMaxInput')?.value;

  catalogState.minPrice = minVal ? parseInt(minVal, 10) : null;
  catalogState.maxPrice = maxVal ? parseInt(maxVal, 10) : null;

  document.querySelectorAll('.price-preset-btn').forEach(b => b.classList.remove('active'));
  applyFiltersAndRender();
}

function resetAllFilters() {
  catalogState.gender = 'all';
  catalogState.category = 'all';
  catalogState.minPrice = null;
  catalogState.maxPrice = null;
  catalogState.selectedSizes.clear();
  catalogState.selectedStyles.clear();
  catalogState.searchKeyword = '';
  catalogState.sortBy = 'featured';

  // Cập nhật DOM
  document.querySelectorAll('.gender-chip-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-gender') === 'all'));
  document.querySelectorAll('.filter-cat-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-cat') === 'all'));
  document.querySelectorAll('.size-chip-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.style-pill-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.price-preset-btn').forEach(b => b.classList.remove('active'));

  const minInput = document.getElementById('priceMinInput');
  const maxInput = document.getElementById('priceMaxInput');
  const searchInput = document.getElementById('catalogSearchInput');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('catalogSortSelect');
  if (sortSelect) sortSelect.value = 'featured';

  applyFiltersAndRender();
  if (typeof showToast === 'function') {
    showToast("Đã xóa bộ lọc", "Đã hiển thị lại toàn bộ sản phẩm", "info");
  }
}

// Áp dụng Size tính từ Smart Advisor vào danh sách sản phẩm
function applyAdvisorSizeToFilter() {
  const recSize = catalogState.advisorSizeResult;
  if (!recSize) return;

  // Đặt giới tính theo advisor
  catalogState.gender = catalogState.advisorGender;
  document.querySelectorAll('.gender-chip-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-gender') === catalogState.gender));

  // Tích chọn size này
  catalogState.selectedSizes.clear();
  catalogState.selectedSizes.add(recSize);

  document.querySelectorAll('.size-chip-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-size') === recSize);
  });

  applyFiltersAndRender();

  if (typeof showToast === 'function') {
    showToast("Gợi Ý Vóc Dáng", `Đang lọc các sản phẩm có Size ${recSize} vừa vặn với bạn!`, "success");
  }
}

// Đổi chế độ xem (3 cột / 4 cột / 1 cột)
function setViewMode(mode) {
  catalogState.viewMode = mode;
  const grid = document.getElementById('catalogProductsGrid');
  if (!grid) return;

  grid.className = `catalog-products-grid ${mode === 'grid-4' ? 'grid-4' : (mode === 'grid-list' ? 'grid-list' : '')}`;

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === mode);
  });
}

// ==========================================================================
// 8. ĐỒNG BỘ URL QUERY & DEEP LINKING (URL SYNC)
// ==========================================================================
function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  
  if (params.has('category')) {
    catalogState.category = params.get('category');
    document.querySelectorAll('.filter-cat-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-cat') === catalogState.category));
  }
  if (params.has('gender')) {
    catalogState.gender = params.get('gender');
    document.querySelectorAll('.gender-chip-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-gender') === catalogState.gender));
  }
  if (params.has('size')) {
    const szList = params.get('size').split(',');
    szList.forEach(s => catalogState.selectedSizes.add(s.trim()));
    document.querySelectorAll('.size-chip-btn').forEach(b => b.classList.toggle('active', catalogState.selectedSizes.has(b.getAttribute('data-size'))));
  }
  if (params.has('search')) {
    catalogState.searchKeyword = params.get('search');
    const sInput = document.getElementById('catalogSearchInput');
    if (sInput) sInput.value = catalogState.searchKeyword;
  }
  if (params.has('minPrice')) catalogState.minPrice = Number(params.get('minPrice'));
  if (params.has('maxPrice')) catalogState.maxPrice = Number(params.get('maxPrice'));
  if (params.has('sort')) {
    catalogState.sortBy = params.get('sort');
    const sortSelect = document.getElementById('catalogSortSelect');
    if (sortSelect) sortSelect.value = catalogState.sortBy;
  }
}

function syncURLWithState() {
  const params = new URLSearchParams();
  if (catalogState.category !== 'all') params.set('category', catalogState.category);
  if (catalogState.gender !== 'all') params.set('gender', catalogState.gender);
  if (catalogState.selectedSizes.size > 0) params.set('size', Array.from(catalogState.selectedSizes).join(','));
  if (catalogState.searchKeyword) params.set('search', catalogState.searchKeyword);
  if (catalogState.minPrice) params.set('minPrice', catalogState.minPrice);
  if (catalogState.maxPrice) params.set('maxPrice', catalogState.maxPrice);
  if (catalogState.sortBy !== 'featured') params.set('sort', catalogState.sortBy);

  const queryStr = params.toString();
  const newURL = window.location.pathname + (queryStr ? `?${queryStr}` : '');
  window.history.replaceState({}, '', newURL);
}

// ==========================================================================
// 9. QUẢN LÝ GIỎ HÀNG & DANH SÁCH YÊU THÍCH (CART & WISHLIST)
// ==========================================================================
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('moonlight_cart')) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('moonlight_cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const badges = document.querySelectorAll('#cartBadge, .cart-badge');
  badges.forEach(b => {
    b.innerText = totalQty;
    b.style.display = totalQty > 0 ? 'flex' : 'none';
  });
}

function quickAddToCart(productId) {
  const prod = catalogState.allProducts.find(p => String(p._id || p.id) === String(productId));
  if (!prod) return;

  const firstVariant = prod.variants && prod.variants.length > 0 ? prod.variants[0] : null;
  let firstSize = 'Freesize';
  if (firstVariant && firstVariant.sizes && firstVariant.sizes.length > 0) {
    const s0 = firstVariant.sizes[0];
    firstSize = typeof s0 === 'string' ? s0 : (s0.size || s0.name || 'Freesize');
  }

  const cart = getCart();
  const existingIdx = cart.findIndex(it => String(it.id) === String(productId) && it.size === firstSize);

  if (existingIdx > -1) {
    cart[existingIdx].quantity += 1;
  } else {
    cart.push({
      id: prod._id || prod.id,
      _id: prod._id || prod.id,
      name: prod.name,
      price: firstVariant ? firstVariant.price : prod.price,
      image: firstVariant ? firstVariant.img : prod.image,
      img: firstVariant ? firstVariant.img : prod.image,
      size: firstSize,
      color: firstVariant ? firstVariant.color : 'Tiêu chuẩn',
      quantity: 1
    });
  }

  saveCart(cart);
  if (window.cart) window.cart = cart;
  if (typeof renderCartSidebar === 'function') renderCartSidebar();
  if (typeof updateCartIcon === 'function') updateCartIcon();
  if (typeof toggleCart === 'function') toggleCart();

  if (typeof showToast === 'function') {
    showToast("Đã Thêm Vào Giỏ", `+1 ${prod.name} (${firstSize})`, "success");
  }
}

function getWishlistIds() {
  try {
    return JSON.parse(localStorage.getItem('moonlight_wishlist')) || [];
  } catch (e) {
    return [];
  }
}

function toggleWishlist(arg1, arg2) {
  let productId = null;
  let clickedBtn = null;

  if (typeof arg1 === 'object' && arg1 !== null) {
    if (arg1.nodeType) {
      // Form: toggleWishlist(btnElement, id)
      clickedBtn = arg1;
      productId = arg2;
    } else if (arg1.stopPropagation) {
      // Event passed first (rare)
      arg1.stopPropagation();
      productId = arg2;
    }
  } else if (arg1 === null && arg2) {
    // Form: toggleWishlist(null, id) from wishlist sidebar
    productId = arg2;
  } else {
    // Form: toggleWishlist(productId, event) from catalog card
    productId = arg1;
    if (arg2 && typeof arg2.stopPropagation === 'function') {
      arg2.stopPropagation();
    }
  }

  if (!productId) return;
  const idStr = String(productId);
  let wishlist = getWishlistIds();
  const exists = wishlist.includes(idStr);

  if (exists) {
    wishlist = wishlist.filter(id => id !== idStr);
    if (typeof showToast === 'function') showToast("Yêu Thích", "Đã xóa sản phẩm khỏi danh sách yêu thích", "info");
  } else {
    wishlist.push(idStr);
    if (typeof showToast === 'function') showToast("Yêu Thích", "Đã thêm sản phẩm vào danh sách yêu thích!", "success");
  }

  localStorage.setItem('moonlight_wishlist', JSON.stringify(wishlist));
  if (window.wishlist) window.wishlist = wishlist;
  if (typeof renderWishlistSidebar === 'function') renderWishlistSidebar();
  if (typeof updateWishlistIcon === 'function') updateWishlistIcon();
  
  // Cập nhật icon trái tim trên product-card
  const allCardBtns = document.querySelectorAll(`.product-card[data-id="${productId}"] .wishlist-btn, .catalog-card[data-id="${productId}"] .btn-card-wishlist`);
  allCardBtns.forEach(cardBtn => {
    cardBtn.classList.toggle('active', !exists);
    const icon = cardBtn.querySelector('i');
    if (icon) icon.className = !exists ? 'fas fa-heart' : 'far fa-heart';
  });

  if (clickedBtn) {
    clickedBtn.classList.toggle('active', !exists);
    const icon = clickedBtn.querySelector('i');
    if (icon) icon.className = !exists ? 'fas fa-heart' : 'far fa-heart';
  }

  const badge = document.getElementById('wishlistBadge');
  if (badge) {
    badge.innerText = wishlist.length;
    badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  }
}

// ==========================================================================
// 10. QUICK VIEW & CHI TIẾT SẢN PHẨM (Đã gỡ bỏ popup theo yêu cầu)
// ==========================================================================
function openQuickView(productId) {
  if (productId) {
    window.location.href = `product.html?id=${productId}`;
  }
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  if (modal) modal.style.display = 'none';
}

function selectQuickViewVariant() {}
function selectQuickViewSize() {}
function confirmQuickViewAddToCart() {}

// Mobile Filter Drawer Toggle
function toggleMobileFilters() {
  const sidebar = document.getElementById('catalogSidebar');
  const overlay = document.getElementById('mobileFilterOverlay');
  if (sidebar) sidebar.classList.toggle('mobile-open');
  if (overlay) overlay.classList.toggle('active');
}

// ==========================================================================
// 11. KHỞI TẠO TRANG CATALOG (INIT)
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // 0. Tắt preloader ngay khi DOM sẵn sàng
  if (typeof dismissPreloader === 'function') dismissPreloader();

  // 1. Tải giỏ hàng & wishlist badges
  updateCartBadge();
  const wlBadge = document.getElementById('wishlistBadge');
  if (wlBadge) {
    const wl = getWishlistIds();
    wlBadge.innerText = wl.length;
    wlBadge.style.display = wl.length > 0 ? 'flex' : 'none';
  }

  // 2. Nạp dữ liệu sản phẩm NGAY LẬP TỨC (0ms) từ LocalStorage hoặc Fallback
  // Giúp trang luôn hiển thị ngay, không bao giờ bị đơ spinner hay lỗi mạng!
  let initialProducts = [];
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
  }

  catalogState.allProducts = initialProducts;

  // 3. Đọc tham số URL (Deep Linking)
  parseURLParams();

  // 4. Khởi tạo Smart Size Advisor UI
  updateAdvisorUI();

  // 5. Gắn sự kiện Slider Chiều cao & Cân nặng
  const hSlider = document.getElementById('advisorHeightSlider');
  const wSlider = document.getElementById('advisorWeightSlider');
  if (hSlider) {
    hSlider.addEventListener('input', (e) => {
      catalogState.advisorHeight = parseInt(e.target.value, 10);
      updateAdvisorUI();
    });
  }
  if (wSlider) {
    wSlider.addEventListener('input', (e) => {
      catalogState.advisorWeight = parseInt(e.target.value, 10);
      updateAdvisorUI();
    });
  }

  // Sự kiện nút Giới tính Advisor
  document.querySelectorAll('.advisor-gender-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.advisor-gender-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      catalogState.advisorGender = btn.getAttribute('data-gender');
      updateAdvisorUI();
    });
  });

  // Sự kiện Sort Select
  const sortSelect = document.getElementById('catalogSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      catalogState.sortBy = e.target.value;
      applyFiltersAndRender();
    });
  }

  // Sự kiện Tìm kiếm với icon loading xoay mượt mà
  const searchInput = document.getElementById('catalogSearchInput');
  if (searchInput) {
    let searchDebounce = null;
    const searchIcon = document.querySelector('.catalog-search-wrap .search-icon');
    searchInput.addEventListener('input', (e) => {
      if (searchIcon) {
        searchIcon.className = 'fas fa-circle-notch fa-spin search-icon';
        searchIcon.style.color = 'var(--catalog-gold, #dfba73)';
      }
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        if (searchIcon) {
          searchIcon.className = 'fas fa-search search-icon';
          searchIcon.style.color = '';
        }
        catalogState.searchKeyword = e.target.value.trim();
        applyFiltersAndRender();
      }, 200);
    });
  }

  // Sự kiện Search Overlay (Từ Navbar)
  const overlaySearchInput = document.getElementById('searchInput');
  if (overlaySearchInput) {
    let overlayDebounce = null;
    overlaySearchInput.addEventListener('input', (e) => {
      clearTimeout(overlayDebounce);
      overlayDebounce = setTimeout(() => {
        catalogState.searchKeyword = e.target.value.trim();
        if (searchInput) searchInput.value = e.target.value;
        applyFiltersAndRender();
      }, 300);
    });
    overlaySearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        toggleSearch();
      }
    });
  }

  // Khởi tạo trạng thái Giỏ hàng và Yêu thích từ shop.js
  if (typeof updateCartIcon === 'function') updateCartIcon();
  if (typeof updateWishlistIcon === 'function') updateWishlistIcon();
  if (typeof renderWishlistSidebar === 'function') renderWishlistSidebar();
  if (typeof renderCartSidebar === 'function') renderCartSidebar();

  // 6. RENDER NGAY LẬP TỨC (0ms) để người dùng thấy ngay danh sách sản phẩm
  applyFiltersAndRender();
  if (typeof dismissPreloader === 'function') dismissPreloader();

  // 7. ĐỒNG BỘ DỮ LIỆU TỪ BACKEND REST API NGẦM (Background Sync)
  try {
    if (window.MoonlightAPI && typeof MoonlightAPI.getProducts === 'function') {
      const res = await MoonlightAPI.getProducts();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        catalogState.allProducts = res.data;
        try {
          localStorage.setItem('moonlight_products', JSON.stringify(res.data));
        } catch (err) {}
        // Cập nhật lại sản phẩm và số lượng danh mục mà không làm gián đoạn trải nghiệm
        applyFiltersAndRender(false);
      }
    }
  } catch (err) {
    console.warn('[Catalog] Dữ liệu API đang tải hoặc dùng dữ liệu cục bộ:', err.message);
  }
});
