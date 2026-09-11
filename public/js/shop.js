/* ==========================================================================
   SHOP.JS - LOGIC DÀNH CHO KHÁCH HÀNG (FRONTEND)
   Dùng cho: index.html, product.html, checkout.html
   Tích hợp toàn diện: MoonlightAPI, Wishlist Drawer, Lọc danh mục nhanh,
   Tra cứu đơn hàng, Bảng size, và Tương thích Responsive di động.
   ========================================================================== */

// --- 0. DANH MỤC SẢN PHẨM MẪU CHUẨN LUXURY (DỰ PHÒNG CỤC BỘ) ---
const SHOP_FALLBACK_PRODUCTS = [
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
    "image": "/images/garments/suit.jpg",
    "images": [
      "/images/garments/suit.jpg",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80",
      "/images/garments/suit_cutout.png"
    ],
    "rating": 5,
    "sold": 48,
    "salePercent": 12,
    "badge": "HOT",
    "variants": [
      {
        "color": "Đen Hoàng Gia",
        "colorCode": "#000000",
        "hex": "#000000",
        "img": "/images/garments/suit.jpg",
        "images": [
          "/images/garments/suit.jpg",
          "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=900&auto=format&fit=crop&q=80",
          "/images/garments/suit_cutout.png"
        ],
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
        "img": "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?w=900&auto=format&fit=crop&q=80",
          "/images/garments/suit.jpg"
        ],
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
    "image": "/images/garments/shirt.jpg",
    "images": [
      "/images/garments/shirt.jpg",
      "https://images.unsplash.com/photo-1620012253295-c15c429fbb41?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&auto=format&fit=crop&q=80",
      "/images/garments/shirt_cutout.png"
    ],
    "rating": 4.9,
    "sold": 125,
    "salePercent": 0,
    "badge": "NEW",
    "variants": [
      {
        "color": "Trắng Ngọc Trai",
        "colorCode": "#f8fafc",
        "hex": "#f8fafc",
        "img": "/images/garments/shirt.jpg",
        "images": [
          "/images/garments/shirt.jpg",
          "https://images.unsplash.com/photo-1620012253295-c15c429fbb41?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&auto=format&fit=crop&q=80",
          "/images/garments/shirt_cutout.png"
        ],
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
      },
      {
        "color": "Xanh Sky Thanh Lịch",
        "colorCode": "#b8d5e5",
        "hex": "#b8d5e5",
        "img": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=900&auto=format&fit=crop&q=80",
          "/images/garments/shirt.jpg"
        ],
        "price": 890000,
        "sizes": [
          {
            "name": "M",
            "size": "M",
            "stock": 20
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
    "image": "/images/garments/polo.jpg",
    "images": [
      "/images/garments/polo.jpg",
      "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1625910513413-7e189c445610?w=900&auto=format&fit=crop&q=80",
      "/images/garments/polo_cutout.png"
    ],
    "rating": 4.8,
    "sold": 210,
    "salePercent": 15,
    "badge": "BEST SELLER",
    "variants": [
      {
        "color": "Be Ánh Kim",
        "colorCode": "#d2b48c",
        "hex": "#d2b48c",
        "img": "/images/garments/polo.jpg",
        "images": [
          "/images/garments/polo.jpg",
          "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1625910513413-7e189c445610?w=900&auto=format&fit=crop&q=80",
          "/images/garments/polo_cutout.png"
        ],
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
        "img": "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80",
          "/images/garments/polo.jpg"
        ],
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
    "image": "/images/garments/pants.jpg",
    "images": [
      "/images/garments/pants.jpg",
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=900&auto=format&fit=crop&q=80",
      "/images/garments/pants_cutout.png"
    ],
    "rating": 4.9,
    "sold": 95,
    "salePercent": 0,
    "badge": "SIGNATURE",
    "variants": [
      {
        "color": "Xám Tro",
        "colorCode": "#708090",
        "hex": "#708090",
        "img": "/images/garments/pants.jpg",
        "images": [
          "/images/garments/pants.jpg",
          "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=900&auto=format&fit=crop&q=80",
          "/images/garments/pants_cutout.png"
        ],
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
        "img": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&auto=format&fit=crop&q=80",
          "/images/garments/pants.jpg"
        ],
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
    "image": "/images/garments/pima_tee.jpg",
    "images": [
      "/images/garments/pima_tee.jpg",
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&auto=format&fit=crop&q=80",
      "/images/garments/pima_tee_cutout.png"
    ],
    "rating": 4.7,
    "sold": 340,
    "salePercent": 11,
    "badge": "BEST VALUE",
    "variants": [
      {
        "color": "Trắng Sữa",
        "colorCode": "#fdfbf7",
        "hex": "#fdfbf7",
        "img": "/images/garments/pima_tee.jpg",
        "images": [
          "/images/garments/pima_tee.jpg",
          "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&auto=format&fit=crop&q=80",
          "/images/garments/pima_tee_cutout.png"
        ],
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
        "img": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1618354691229-88d47f285158?w=900&auto=format&fit=crop&q=80",
          "/images/garments/pima_tee.jpg"
        ],
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
    "image": "/images/garments/women_blazer.jpg",
    "images": [
      "/images/garments/women_blazer.jpg",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=900&auto=format&fit=crop&q=80",
      "/images/garments/women_blazer_cutout.png"
    ],
    "rating": 5,
    "sold": 62,
    "salePercent": 14,
    "badge": "HOT TREND",
    "variants": [
      {
        "color": "Nâu Kem Latte",
        "colorCode": "#c5a880",
        "hex": "#c5a880",
        "img": "/images/garments/women_blazer.jpg",
        "images": [
          "/images/garments/women_blazer.jpg",
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=900&auto=format&fit=crop&q=80",
          "/images/garments/women_blazer_cutout.png"
        ],
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
      },
      {
        "color": "Đen Quý Phái",
        "colorCode": "#111111",
        "hex": "#111111",
        "img": "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
          "/images/garments/women_blazer.jpg"
        ],
        "price": 1890000,
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
    "image": "/images/garments/dress.jpg",
    "images": [
      "/images/garments/dress.jpg",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&auto=format&fit=crop&q=80",
      "/images/garments/dress_cutout.png"
    ],
    "rating": 4.9,
    "sold": 38,
    "salePercent": 0,
    "badge": "LIMITED",
    "variants": [
      {
        "color": "Đỏ Burgundy Quý Tộc",
        "colorCode": "#6b1426",
        "hex": "#6b1426",
        "img": "/images/garments/dress.jpg",
        "images": [
          "/images/garments/dress.jpg",
          "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&auto=format&fit=crop&q=80",
          "/images/garments/dress_cutout.png"
        ],
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
      },
      {
        "color": "Đen Huyền Bí",
        "colorCode": "#0d0d0d",
        "hex": "#0d0d0d",
        "img": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&auto=format&fit=crop&q=80",
          "/images/garments/dress.jpg"
        ],
        "price": 2150000,
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
    "image": "/images/garments/denim_jeans.jpg",
    "images": [
      "/images/garments/denim_jeans.jpg",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=900&auto=format&fit=crop&q=80",
      "/images/garments/denim_jeans_cutout.png"
    ],
    "rating": 4.8,
    "sold": 145,
    "salePercent": 15,
    "badge": "",
    "variants": [
      {
        "color": "Xanh Indigo Raw",
        "colorCode": "#1c2841",
        "hex": "#1c2841",
        "img": "/images/garments/denim_jeans.jpg",
        "images": [
          "/images/garments/denim_jeans.jpg",
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=900&auto=format&fit=crop&q=80",
          "/images/garments/denim_jeans_cutout.png"
        ],
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
      },
      {
        "color": "Xanh Vintage Wash",
        "colorCode": "#3c5b82",
        "hex": "#3c5b82",
        "img": "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1511196044526-7875bca61201?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&auto=format&fit=crop&q=80",
          "/images/garments/denim_jeans.jpg"
        ],
        "price": 1150000,
        "sizes": [
          {
            "name": "29",
            "size": "29",
            "stock": 15
          },
          {
            "name": "30",
            "size": "30",
            "stock": 20
          },
          {
            "name": "31",
            "size": "31",
            "stock": 25
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
    "image": "/images/garments/pleated_skirt.jpg",
    "images": [
      "/images/garments/pleated_skirt.jpg",
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?w=900&auto=format&fit=crop&q=80",
      "/images/garments/pleated_skirt_cutout.png"
    ],
    "rating": 4.8,
    "sold": 88,
    "salePercent": 12,
    "badge": "",
    "variants": [
      {
        "color": "Vàng Champagne Mờ",
        "colorCode": "#e8d8b8",
        "hex": "#e8d8b8",
        "img": "/images/garments/pleated_skirt.jpg",
        "images": [
          "/images/garments/pleated_skirt.jpg",
          "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?w=900&auto=format&fit=crop&q=80",
          "/images/garments/pleated_skirt_cutout.png"
        ],
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
      },
      {
        "color": "Đen Ánh Kim Sa",
        "colorCode": "#1e1e1e",
        "hex": "#1e1e1e",
        "img": "https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
          "/images/garments/pleated_skirt.jpg"
        ],
        "price": 780000,
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
    "image": "/images/garments/silk_blouse.jpg",
    "images": [
      "/images/garments/silk_blouse.jpg",
      "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&auto=format&fit=crop&q=80",
      "/images/garments/silk_blouse_cutout.png"
    ],
    "rating": 4.9,
    "sold": 110,
    "salePercent": 0,
    "badge": "POPULAR",
    "variants": [
      {
        "color": "Hồng Phấn Pastel",
        "colorCode": "#f4dcd6",
        "hex": "#f4dcd6",
        "img": "/images/garments/silk_blouse.jpg",
        "images": [
          "/images/garments/silk_blouse.jpg",
          "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=900&auto=format&fit=crop&q=80",
          "/images/garments/silk_blouse_cutout.png"
        ],
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
      },
      {
        "color": "Trắng Ngà Tinh Khôi",
        "colorCode": "#faf8f5",
        "hex": "#faf8f5",
        "img": "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=900&auto=format&fit=crop&q=80",
          "/images/garments/silk_blouse.jpg"
        ],
        "price": 920000,
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
    "image": "/images/garments/belt.jpg",
    "images": [
      "/images/garments/belt.jpg",
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=80"
    ],
    "rating": 5,
    "sold": 190,
    "salePercent": 10,
    "badge": "",
    "variants": [
      {
        "color": "Nâu Espresso",
        "colorCode": "#3d2314",
        "hex": "#3d2314",
        "img": "/images/garments/belt.jpg",
        "images": [
          "/images/garments/belt.jpg",
          "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=80"
        ],
        "price": 850000,
        "sizes": [
          {
            "name": "Freesize",
            "size": "Freesize",
            "stock": 45
          }
        ]
      },
      {
        "color": "Đen Tuyệt Đối",
        "colorCode": "#0f0f0f",
        "hex": "#0f0f0f",
        "img": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=900&auto=format&fit=crop&q=80",
          "/images/garments/belt.jpg"
        ],
        "price": 850000,
        "sizes": [
          {
            "name": "Freesize",
            "size": "Freesize",
            "stock": 35
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
    "image": "/images/garments/hoodie.jpg",
    "images": [
      "/images/garments/hoodie.jpg",
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=900&auto=format&fit=crop&q=80",
      "/images/garments/hoodie_cutout.png"
    ],
    "rating": 4.9,
    "sold": 145,
    "salePercent": 11,
    "badge": "BEST SELLER",
    "variants": [
      {
        "color": "Xám Khói",
        "colorCode": "#94a3b8",
        "hex": "#94a3b8",
        "img": "/images/garments/hoodie.jpg",
        "images": [
          "/images/garments/hoodie.jpg",
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=900&auto=format&fit=crop&q=80",
          "/images/garments/hoodie_cutout.png"
        ],
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
      },
      {
        "color": "Đen Jet Black",
        "colorCode": "#121212",
        "hex": "#121212",
        "img": "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80",
          "/images/garments/hoodie.jpg"
        ],
        "price": 620000,
        "sizes": [
          {
            "name": "M",
            "size": "M",
            "stock": 20
          },
          {
            "name": "L",
            "size": "L",
            "stock": 25
          },
          {
            "name": "XL",
            "size": "XL",
            "stock": 20
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
    "image": "/images/garments/trench_coat.jpg",
    "images": [
      "/images/garments/trench_coat.jpg",
      "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&auto=format&fit=crop&q=80",
      "/images/garments/trench_coat_cutout.png"
    ],
    "rating": 5,
    "sold": 35,
    "salePercent": 0,
    "badge": "EXCLUSIVE",
    "variants": [
      {
        "color": "Vàng Kaki Cổ Điển",
        "colorCode": "#c2a649",
        "hex": "#c2a649",
        "img": "/images/garments/trench_coat.jpg",
        "images": [
          "/images/garments/trench_coat.jpg",
          "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&auto=format&fit=crop&q=80",
          "/images/garments/trench_coat_cutout.png"
        ],
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
      },
      {
        "color": "Xanh Rêu Quý Phái",
        "colorCode": "#3a483a",
        "hex": "#3a483a",
        "img": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=900&auto=format&fit=crop&q=80",
          "/images/garments/trench_coat.jpg"
        ],
        "price": 3200000,
        "sizes": [
          {
            "name": "M",
            "size": "M",
            "stock": 8
          },
          {
            "name": "L",
            "size": "L",
            "stock": 12
          }
        ]
      }
    ],
    "isActive": true
  },
  {
    "_id": "67c3db00d57e603b70b500014",
    "id": 14,
    "name": "Quần Chino Khaki Slimfit Co Giãn 4 Chiều",
    "description": "Cotton Twill co giãn thoải mái, cạp quần lót viền lụa chống tuột khi sơ vin.",
    "category": "quanau",
    "type": "quanau",
    "gender": "Nam",
    "style": "Slimfit",
    "price": 680000,
    "originalPrice": 750000,
    "image": "/images/garments/khaki_chino.jpg",
    "images": [
      "/images/garments/khaki_chino.jpg",
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=900&auto=format&fit=crop&q=80",
      "/images/garments/khaki_chino_cutout.png"
    ],
    "rating": 4.8,
    "sold": 160,
    "salePercent": 10,
    "badge": "SALE",
    "variants": [
      {
        "color": "Be Cát Sa Mạc",
        "colorCode": "#e0d5c1",
        "hex": "#e0d5c1",
        "img": "/images/garments/khaki_chino.jpg",
        "images": [
          "/images/garments/khaki_chino.jpg",
          "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=900&auto=format&fit=crop&q=80",
          "/images/garments/khaki_chino_cutout.png"
        ],
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
      },
      {
        "color": "Xanh Navy Đậm",
        "colorCode": "#17253b",
        "hex": "#17253b",
        "img": "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=900&auto=format&fit=crop&q=80",
          "/images/garments/khaki_chino.jpg"
        ],
        "price": 680000,
        "sizes": [
          {
            "name": "29",
            "size": "29",
            "stock": 15
          },
          {
            "name": "30",
            "size": "30",
            "stock": 20
          },
          {
            "name": "31",
            "size": "31",
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
    "image": "/images/garments/cashmere_sweater.jpg",
    "images": [
      "/images/garments/cashmere_sweater.jpg",
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=900&auto=format&fit=crop&q=80",
      "/images/garments/cashmere_sweater_cutout.png"
    ],
    "rating": 5,
    "sold": 52,
    "salePercent": 0,
    "badge": "LUXURY",
    "variants": [
      {
        "color": "Trắng Ngà Tự Nhiên",
        "colorCode": "#fdfbf7",
        "hex": "#fdfbf7",
        "img": "/images/garments/cashmere_sweater.jpg",
        "images": [
          "/images/garments/cashmere_sweater.jpg",
          "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=900&auto=format&fit=crop&q=80",
          "/images/garments/cashmere_sweater_cutout.png"
        ],
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
      },
      {
        "color": "Đen Midnight",
        "colorCode": "#151515",
        "hex": "#151515",
        "img": "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=900&auto=format&fit=crop&q=80",
          "/images/garments/cashmere_sweater.jpg"
        ],
        "price": 1450000,
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
    "image": "/images/garments/tweed_suit.jpg",
    "images": [
      "/images/garments/tweed_suit.jpg",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80",
      "/images/garments/tweed_suit_cutout.png"
    ],
    "rating": 5,
    "sold": 28,
    "salePercent": 0,
    "badge": "NEW",
    "variants": [
      {
        "color": "Houndstooth Đen Trắng",
        "colorCode": "#262626",
        "hex": "#262626",
        "img": "/images/garments/tweed_suit.jpg",
        "images": [
          "/images/garments/tweed_suit.jpg",
          "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&auto=format&fit=crop&q=80",
          "/images/garments/tweed_suit_cutout.png"
        ],
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
      },
      {
        "color": "Hồng Pastel Tiểu Thư",
        "colorCode": "#f5d5db",
        "hex": "#f5d5db",
        "img": "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1550614000-4895a10e1bfd?w=900&auto=format&fit=crop&q=80",
          "/images/garments/tweed_suit.jpg"
        ],
        "price": 2650000,
        "sizes": [
          {
            "name": "S",
            "size": "S",
            "stock": 10
          },
          {
            "name": "M",
            "size": "M",
            "stock": 15
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
    "image": "/images/garments/wallet.jpg",
    "images": [
      "/images/garments/wallet.jpg",
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=80"
    ],
    "rating": 4.9,
    "sold": 76,
    "salePercent": 0,
    "badge": "LIMITED",
    "variants": [
      {
        "color": "Đen Bóng Sơn Mài",
        "colorCode": "#0a0a0a",
        "hex": "#0a0a0a",
        "img": "/images/garments/wallet.jpg",
        "images": [
          "/images/garments/wallet.jpg",
          "https://images.unsplash.com/photo-1627123424574-724758594e93?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=80"
        ],
        "price": 1250000,
        "sizes": [
          {
            "name": "Freesize",
            "size": "Freesize",
            "stock": 50
          }
        ]
      },
      {
        "color": "Nâu Cigar Cổ Điển",
        "colorCode": "#45220c",
        "hex": "#45220c",
        "img": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1627123424574-724758594e93?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=80",
          "/images/garments/wallet.jpg"
        ],
        "price": 1250000,
        "sizes": [
          {
            "name": "Freesize",
            "size": "Freesize",
            "stock": 40
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
    "image": "/images/garments/loafer.jpg",
    "images": [
      "/images/garments/loafer.jpg",
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=900&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=900&auto=format&fit=crop&q=80"
    ],
    "rating": 5,
    "sold": 45,
    "salePercent": 0,
    "badge": "VIP",
    "variants": [
      {
        "color": "Nâu Da Bò Rượu Vang",
        "colorCode": "#582900",
        "hex": "#582900",
        "img": "/images/garments/loafer.jpg",
        "images": [
          "/images/garments/loafer.jpg",
          "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=900&auto=format&fit=crop&q=80"
        ],
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
      },
      {
        "color": "Đen Tuyệt Hảo Black Tie",
        "colorCode": "#111111",
        "hex": "#111111",
        "img": "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=900&auto=format&fit=crop&q=80",
        "images": [
          "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&auto=format&fit=crop&q=80",
          "/images/garments/loafer.jpg"
        ],
        "price": 2850000,
        "sizes": [
          {
            "name": "39",
            "size": "39",
            "stock": 8
          },
          {
            "name": "40",
            "size": "40",
            "stock": 12
          },
          {
            "name": "41",
            "size": "41",
            "stock": 15
          },
          {
            "name": "42",
            "size": "42",
            "stock": 10
          }
        ]
      }
    ],
    "isActive": true
  }
];

// --- 1. KHỞI TẠO DỮ LIỆU AN TOÀN & ĐỒNG BỘ ẢNH MỚI (v3.5) ---
const MOONLIGHT_DATA_VERSION = 'v3.5';
let products = [];
try {
  const savedVersion = localStorage.getItem('moonlight_data_version');
  const rawProducts = localStorage.getItem('moonlight_products');
  if (rawProducts && savedVersion === MOONLIGHT_DATA_VERSION) {
    const parsed = JSON.parse(rawProducts);
    if (Array.isArray(parsed) && parsed.length > 0) {
      products = parsed;
    }
  }
} catch (e) {}

if (!Array.isArray(products) || products.length === 0) {
  products = [...SHOP_FALLBACK_PRODUCTS];
  try {
    localStorage.setItem('moonlight_products', JSON.stringify(products));
    localStorage.setItem('moonlight_data_version', MOONLIGHT_DATA_VERSION);
  } catch (e) {}
} else if (products.length < SHOP_FALLBACK_PRODUCTS.length) {
  const existingIds = new Set(products.map((p) => String(p._id || p.id)));
  SHOP_FALLBACK_PRODUCTS.forEach((sp) => {
    if (!existingIds.has(String(sp._id || sp.id))) {
      products.push(sp);
    }
  });
  try {
    localStorage.setItem('moonlight_products', JSON.stringify(products));
    localStorage.setItem('moonlight_data_version', MOONLIGHT_DATA_VERSION);
  } catch (e) {}
}

let cart = [];
try {
  const rawCart = localStorage.getItem('moonlight_cart');
  if (rawCart) {
    const parsed = JSON.parse(rawCart);
    if (Array.isArray(parsed)) cart = parsed;
  }
} catch (e) {}

function getWishlistIds() {
  try {
    const raw = localStorage.getItem('moonlight_wishlist');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return Array.from(new Set(parsed.map((x) => String(x).trim()))).filter(Boolean);
  } catch (e) {
    return [];
  }
}

let wishlist = getWishlistIds();
window.wishlist = wishlist;
window.getWishlistIds = getWishlistIds;

// Biến dùng cho trang chi tiết
let currentProduct = null;
let selectedColor = null;
let selectedSizeName = null;
let quantity = 1;
let currentShopCategory = 'all';
let displayedProducts = 8;

// Quản lý Preloader Loading màn hình
function dismissPreloader() {
  const preloader = document.getElementById('pagePreloader');
  if (preloader) {
    preloader.classList.add('loaded');
    preloader.style.opacity = '0';
    preloader.style.pointerEvents = 'none';
    setTimeout(() => {
      preloader.style.display = 'none';
    }, 400);
  }
}

window.showPageLoading = function() {
  const preloader = document.getElementById('pagePreloader');
  if (preloader) {
    preloader.style.display = 'flex';
    preloader.style.pointerEvents = 'auto';
    requestAnimationFrame(() => {
      preloader.classList.remove('loaded');
      preloader.style.opacity = '1';
    });
  }
};

window.hidePageLoading = function() {
  dismissPreloader();
};

// Đảm bảo preloader biến mất ngay khi trang bắt đầu sẵn sàng (không phụ thuộc vào mạng)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  dismissPreloader();
} else {
  window.addEventListener('load', () => setTimeout(dismissPreloader, 100));
}
setTimeout(dismissPreloader, 600);

// --- 2. ĐIỀU HƯỚNG & KHỞI TẠO (ROUTER) ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Tắt loading preloader NGAY LẬP TỨC (0ms)
  dismissPreloader();

  try {
    updateCartIcon();
    updateWishlistIcon();
    if (typeof initCustomerAuthUI === 'function') initCustomerAuthUI();
  } catch (e) {}

  // 2. RENDER GIAO DIỆN NGAY LẬP TỨC (0ms) từ dữ liệu có sẵn
  // A. Nếu đang ở Trang chủ (index.html)
  if (document.getElementById('product-grid')) {
    try {
      renderShop(displayedProducts);
      renderBestSellers(4);
      setupSearch();
    } catch (err) {
      console.warn('[Shop] Lỗi render trang chủ:', err);
    }
  }

  // Luôn kích hoạt Mobile Menu và Scroll Effects trên mọi trang khách hàng (trừ admin)
  if (!window.location.pathname.includes('admin.html') && !window.location.pathname.includes('staff.html')) {
    try {
      setupMobileMenu();
      setupScrollEffects();
    } catch (err) {
      console.warn('[Shop] Lỗi thiết lập scroll/menu:', err);
    }
  }

  // B. Nếu đang ở Trang chi tiết (product.html)
  if (document.getElementById('productDetailContainer')) {
    try {
      loadProductDetail();
    } catch (err) {
      console.warn('[Shop] Lỗi load chi tiết:', err);
    }
  }

  // C. Nếu đang ở Trang thanh toán (checkout.html)
  if (document.getElementById('checkoutItems')) {
    try {
      renderCheckoutPage();
    } catch (err) {
      console.warn('[Shop] Lỗi render checkout:', err);
    }
  }

  // Tắt loading lần nữa sau khi đã render xong DOM
  dismissPreloader();

  // 3. ĐỒNG BỘ DỮ LIỆU TỪ BACKEND REST API CHẠY NGẦM (Background Sync)
  // Không bao giờ block giao diện hay làm đứng màn hình loading!
  initProductsData().catch((err) => {
    console.warn('[Shop] Dữ liệu API nền:', err.message);
  });
});

// Nạp dữ liệu sản phẩm từ Backend REST API
// Nạp dữ liệu sản phẩm từ Backend REST API & LocalStorage
async function initProductsData() {
  // 1. Luôn ưu tiên đọc dữ liệu mới nhất từ LocalStorage trước (nơi Admin vừa cập nhật)
  const localData = localStorage.getItem('moonlight_products');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        products = parsed;
      }
    } catch (e) {}
  }

  // 2. Bổ sung từ API nếu có kết nối
  try {
    if (window.MoonlightAPI) {
      const res = await window.MoonlightAPI.getProducts();
      if (res && res.data && res.data.length > 0) {
        if (!products || products.length === 0) {
          products = res.data.map((p, idx) => ({
            ...p,
            id: p.id || idx + 1,
            variants: (p.variants && p.variants.length > 0) ? p.variants : [
              {
                color: 'Tiêu chuẩn',
                hex: '#000000',
                img: p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
                price: p.price || 500000,
                sizes: [{ name: 'M', stock: 20 }, { name: 'L', stock: 20 }]
              }
            ]
          }));
          localStorage.setItem('moonlight_products', JSON.stringify(products));
        } else {
          // Bổ sung các sản phẩm từ API mà local chưa có (không ghi đè màu sắc Admin vừa sửa)
          res.data.forEach((apiP) => {
            const exists = products.some((lp) => String(lp.id) === String(apiP.id) || String(lp._id) === String(apiP._id));
            if (!exists) {
              products.push(apiP);
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Shop] Sử dụng dữ liệu cục bộ:', err.message);
  }

  // 3. Fallback an toàn nếu chưa có gì hoặc thiếu sản phẩm mới
  if (!products || products.length === 0) {
    products = [...SHOP_FALLBACK_PRODUCTS];
    localStorage.setItem('moonlight_products', JSON.stringify(products));
  } else if (products.length < SHOP_FALLBACK_PRODUCTS.length) {
    const existingIds = new Set(products.map(p => String(p._id || p.id)));
    SHOP_FALLBACK_PRODUCTS.forEach(sp => {
      if (!existingIds.has(String(sp._id || sp.id))) {
        products.push(sp);
      }
    });
    localStorage.setItem('moonlight_products', JSON.stringify(products));
  }

  if (document.getElementById('product-grid') && products.length > 0) {
    renderShop(displayedProducts);
    renderBestSellers(4);
  }
}

// Lắng nghe thay đổi từ Admin ở tab khác theo thời gian thực (Cross-tab Real-time Sync)
window.addEventListener('storage', (e) => {
  if (e.key === 'moonlight_products') {
    try {
      const updated = JSON.parse(e.newValue);
      if (Array.isArray(updated) && updated.length > 0) {
        products = updated;
        if (document.getElementById('productDetailContainer')) {
          loadProductDetail();
        }
        if (document.getElementById('product-grid')) {
          renderShop(displayedProducts);
          renderBestSellers(4);
        }
      }
    } catch (err) {}
  }
});

// --- 3. LOGIC TRANG CHỦ (INDEX) ---

function renderShop(limit) {
  let list = products;
  if (currentShopCategory !== 'all') {
    list = products.filter((p) => (p.category || p.type) === currentShopCategory);
  }
  const sliced = list.slice(0, limit);
  renderProductGrid(sliced, 'product-grid');

  const btn = document.getElementById('loadMoreContainer');
  if (btn) btn.style.display = limit >= list.length ? 'none' : 'flex';
}

function renderBestSellers(limit) {
  const sorted = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0));
  const list = sorted.slice(0, limit);
  renderProductGrid(list, 'best-seller-grid');

  const btn = document.getElementById('loadMoreBestSeller');
  if (btn) btn.style.display = limit >= sorted.length ? 'none' : 'flex';
}

function changeCardVariant(e, prodId, imgUrl, price) {
  if (e) e.stopPropagation();
  const cards = document.querySelectorAll(`.product-card[data-id="${prodId}"]`);
  cards.forEach((card) => {
    if (imgUrl) {
      const imgEl = card.querySelector('.card-img img');
      if (imgEl) imgEl.src = imgUrl;
    }
    if (e && e.target) {
      const swatches = card.querySelectorAll('.swatch-dot');
      swatches.forEach((s) => s.classList.remove('active'));
      const targetTitle = e.target.getAttribute('title');
      const match = card.querySelector(`.swatch-dot[title="${targetTitle}"]`);
      if (match) match.classList.add('active');
      else e.target.classList.add('active');
    }
    if (price && Number(price) > 0) {
      const priceEl = card.querySelector('.price .new-price') || card.querySelector('.price');
      if (priceEl) priceEl.innerText = Number(price).toLocaleString('vi-VN') + '₫';
    }
  });
}

function renderProductGrid(data, elementId) {
  const grid = document.getElementById(elementId);
  if (!grid) return;

  if (data.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px 0; color:#888;">Chưa có sản phẩm nào trong danh mục này.</p>';
    return;
  }

  grid.innerHTML = data
    .map((p, idx) => {
      const v = (p.variants && p.variants.length > 0) ? p.variants[0] : { img: p.image || '', price: p.price || 0 };
      const percent = p.salePercent || 0;
      const isLiked = wishlist.some((x) => String(x) === String(p.id) || String(x) === String(p._id));
      const iconClass = isLiked ? 'fas' : 'far';
      const prodId = p.id || p._id;
      const priceNum = v.price || p.price || 0;
      const displayPrice = priceNum ? Number(priceNum).toLocaleString('vi-VN') + '₫' : 'Liên hệ';
      const oldPrice = (p.originalPrice && p.originalPrice > priceNum) ? Number(p.originalPrice).toLocaleString('vi-VN') + '₫' : '';
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
          ${allSizes.slice(0, 5).map((sz) => `<span class="card-size-pill">${sz}</span>`).join('')}
        </div>`;

      return `
      <div class="product-card card-enter-active" data-id="${prodId}" style="--card-delay: ${(idx % 8) * 0.04}s;">
          <div class="card-img">
              ${badgeText ? `<span class="badge-sale">${badgeText}</span>` : ''}
              <button class="wishlist-btn ${isLiked ? 'active' : ''}" onclick="toggleWishlist(this, '${prodId}')" title="Thêm vào yêu thích">
                <i class="${iconClass} fa-heart"></i>
              </button>
              <img src="${v.img}" alt="${p.name}" loading="lazy">
              <div class="card-overlay-btns">
                  <a href="product.html?id=${prodId}" class="view-btn"><i class="far fa-eye"></i> XEM CHI TIẾT</a>
                  <button class="add-btn" onclick="quickAdd('${prodId}')"><i class="fas fa-shopping-cart"></i> THÊM NHANH</button>
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
    })
    .join('');
}

function loadMoreProducts() {
  const loadMoreBox = document.getElementById('loadMoreContainer');
  const btn = loadMoreBox ? loadMoreBox.querySelector('.btn-luxury-outline') : null;
  if (btn && btn.classList.contains('btn-loading')) return;

  if (btn) {
    btn.classList.add('btn-loading');
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>ĐANG TẢI THÊM...</span>';
  }

  setTimeout(() => {
    displayedProducts += 4;
    renderShop(displayedProducts);
    if (btn) {
      btn.classList.remove('btn-loading');
      btn.innerHTML = '<span>XEM THÊM</span> <i class="fas fa-arrow-down"></i>';
    }
    window.scrollBy({ top: 120, behavior: 'smooth' });
  }, 260);
}

function loadMoreBestSellers() {
  const loadMoreBox = document.getElementById('loadMoreBestSeller');
  const btn = loadMoreBox ? loadMoreBox.querySelector('.btn-luxury-outline') : null;
  if (btn && btn.classList.contains('btn-loading')) return;

  if (btn) {
    btn.classList.add('btn-loading');
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>ĐANG TẢI THÊM...</span>';
  }

  setTimeout(() => {
    renderBestSellers(products.length);
    if (btn) {
      btn.classList.remove('btn-loading');
      btn.innerHTML = '<span>XEM THÊM</span> <i class="fas fa-arrow-down"></i>';
    }
    window.scrollBy({ top: 120, behavior: 'smooth' });
  }, 260);
}

// Lọc sản phẩm theo danh mục từ thanh Filter Pills
function filterShopCategory(cat) {
  currentShopCategory = cat;
  document.querySelectorAll('.shop-filter-chip').forEach((chip) => {
    chip.classList.remove('active');
    if (chip.getAttribute('data-cat') === cat) chip.classList.add('active');
  });

  displayedProducts = 8;
  renderShop(displayedProducts);

  const shopSec = document.getElementById('shop');
  if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
}

// --- 4. LOGIC TRANG CHI TIẾT (PRODUCT DETAIL) ---

async function loadProductDetail() {
  const container = document.getElementById('productDetailContainer');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  let id = urlParams.get('id');

  // 1. Luôn nạp dữ liệu mới nhất từ LocalStorage trước (nơi Admin vừa cập nhật)
  const localData = localStorage.getItem('moonlight_products');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        products = parsed;
      }
    } catch (e) {}
  }

  // Đảm bảo có danh sách sản phẩm
  if (!products || products.length === 0) {
    products = [...SHOP_FALLBACK_PRODUCTS];
  }

  // Nếu không truyền id trên URL, mặc định hiển thị sản phẩm đầu tiên
  if (!id && products.length > 0) {
    id = products[0].id || products[0]._id;
  }

  // Tìm trong danh sách LocalStorage trước
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
  }

  // Fallback nếu vẫn chưa tìm thấy
  if (!currentProduct) {
    currentProduct = SHOP_FALLBACK_PRODUCTS.find((p) => String(p.id) === String(id) || String(p._id) === String(id)) || products[0] || SHOP_FALLBACK_PRODUCTS[0];
  }

  if (!currentProduct) {
    container.innerHTML = `
      <div style="text-align:center; padding:60px 20px; width:100%;">
        <i class="fas fa-box-open" style="font-size:48px; color:#cbd5e1; margin-bottom:16px;"></i>
        <h3 style="margin:0 0 10px 0; color:#0f172a; font-size:22px;">Sản phẩm không tồn tại!</h3>
        <p style="color:#64748b; font-size:14px; margin-bottom:20px;">Sản phẩm bạn đang tìm kiếm có thể đã được cập nhật hoặc chuyển sang danh mục khác.</p>
        <a href="index.html#shop" class="btn-primary" style="display:inline-block; padding:12px 28px; text-decoration:none;">QUAY VỀ CỬA HÀNG</a>
      </div>
    `;
    return;
  }

  selectedColor = (currentProduct.variants && currentProduct.variants.length > 0)
    ? currentProduct.variants[0]
    : {
        color: 'Tiêu chuẩn',
        hex: '#000000',
        img: currentProduct.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
        images: currentProduct.images || [currentProduct.image],
        price: currentProduct.price || 500000,
        sizes: [{ name: 'M', size: 'M', stock: 20 }, { name: 'L', size: 'L', stock: 20 }]
      };

  currentGalleryIndex = 0;
  selectedSizeName = null;
  quantity = 1;

  renderDetailHTML();
  renderRelatedProducts();
  renderProductReviews(id || currentProduct.id || currentProduct._id);
}

let currentGalleryIndex = 0;

function getSelectedColorImages() {
  if (!selectedColor) return [];
  if (Array.isArray(selectedColor.images) && selectedColor.images.length > 0) {
    return selectedColor.images;
  }
  if (currentProduct && Array.isArray(currentProduct.images) && currentProduct.images.length > 0) {
    return currentProduct.images;
  }
  return [selectedColor.img || (currentProduct ? currentProduct.image : '')].filter(Boolean);
}

function switchDetailGalleryImage(index) {
  const currentImages = getSelectedColorImages();
  if (!currentImages || !currentImages[index]) return;
  currentGalleryIndex = index;

  const mainImg = document.getElementById('mainDetailImg');
  if (mainImg) {
    mainImg.style.opacity = '0.35';
    mainImg.style.transform = 'scale(0.98)';
    setTimeout(() => {
      mainImg.src = currentImages[index];
      mainImg.style.opacity = '1';
      mainImg.style.transform = 'scale(1)';
    }, 120);
  }

  // Cập nhật trạng thái active cho thumbnail
  const thumbItems = document.querySelectorAll('#galleryThumbsSlider .thumb-item');
  thumbItems.forEach((item, idx) => {
    item.classList.toggle('active', idx === index);
  });

  // Cập nhật số đếm ảnh
  const counterEl = document.getElementById('galleryCurrentIdx');
  if (counterEl) counterEl.innerText = index + 1;
}

function navDetailGallery(direction) {
  const currentImages = getSelectedColorImages();
  if (!currentImages || currentImages.length <= 1) return;
  let newIdx = currentGalleryIndex + direction;
  if (newIdx < 0) newIdx = currentImages.length - 1;
  if (newIdx >= currentImages.length) newIdx = 0;
  switchDetailGalleryImage(newIdx);
}

function renderDetailHTML() {
  const container = document.getElementById('productDetailContainer');
  if (!container || !currentProduct) return;

  const percent = (selectedColor.oldPrice && selectedColor.oldPrice > selectedColor.price)
    ? Math.round(((selectedColor.oldPrice - selectedColor.price) / selectedColor.oldPrice) * 100)
    : (currentProduct.salePercent || 0);

  const oldPriceVal = selectedColor.oldPrice || (percent > 0 ? Math.round(selectedColor.price / (1 - percent / 100)) : 0);
  const currentId = currentProduct.id || currentProduct._id;
  const isLiked = wishlist.some((x) => String(x) === String(currentId));
  const iconClass = isLiked ? 'fas' : 'far';

  const variants = (currentProduct.variants && currentProduct.variants.length > 0)
    ? currentProduct.variants
    : [selectedColor];

  const currentGalleryImages = getSelectedColorImages();
  if (currentGalleryIndex >= currentGalleryImages.length) {
    currentGalleryIndex = 0;
  }
  const currentMainImgUrl = currentGalleryImages[currentGalleryIndex] || selectedColor.img || currentProduct.image;

  container.innerHTML = `
    <div class="pd-image-col">
      <div class="main-img-wrapper">
        <button class="wishlist-btn ${isLiked ? 'active' : ''}" 
                style="opacity:1; transform:none; top:18px; right:18px; width:45px; height:45px; font-size:20px; z-index:10; background:rgba(255,255,255,0.92); box-shadow:0 4px 12px rgba(0,0,0,0.1);" 
                onclick="toggleWishlist(this, '${currentId}')" 
                title="Yêu thích">
          <i class="${iconClass} fa-heart"></i>
        </button>
        ${percent > 0 ? `<span class="badge-sale" style="top:18px; left:18px; border-radius:4px; padding:6px 12px; font-size:12px; z-index:7;">GIẢM ${percent}%</span>` : (currentProduct.badge ? `<span class="badge-sale" style="top:18px; left:18px; border-radius:4px; padding:6px 12px; font-size:12px; z-index:7; background:var(--gold, #dfba73); color:#000;">${currentProduct.badge}</span>` : '')}
        
        <img src="${currentMainImgUrl}" id="mainDetailImg" alt="${currentProduct.name}">

        ${currentGalleryImages.length > 1 ? `
          <button type="button" class="gallery-nav-btn prev" onclick="navDetailGallery(-1)" title="Ảnh trước"><i class="fas fa-chevron-left"></i></button>
          <button type="button" class="gallery-nav-btn next" onclick="navDetailGallery(1)" title="Ảnh tiếp theo"><i class="fas fa-chevron-right"></i></button>
        ` : ''}

        <div class="gallery-counter-badge" id="galleryCounter">
          <i class="fas fa-camera"></i> <span id="galleryCurrentIdx">${currentGalleryIndex + 1}</span> / <span id="galleryTotal">${currentGalleryImages.length}</span>
        </div>

        <div class="gallery-color-badge">
          <span class="color-dot" style="background:${selectedColor.hex || selectedColor.colorCode || '#dfba73'}"></span>
          <span>${selectedColor.color}</span>
        </div>
      </div>

      <!-- Dải ảnh phụ theo màu sắc (Thumbnails Gallery) -->
      ${currentGalleryImages.length > 1 ? `
        <div class="detail-gallery-thumbnails">
          <div class="gallery-thumbs-header">
            <span><i class="fas fa-images" style="color:var(--gold, #dfba73); margin-right:4px;"></i> Ảnh chi tiết màu <strong>${selectedColor.color}</strong>:</span>
          </div>
          <div class="gallery-thumbs-slider" id="galleryThumbsSlider">
            ${currentGalleryImages.map((imgUrl, idx) => `
              <div class="thumb-item ${idx === currentGalleryIndex ? 'active' : ''}" 
                   onclick="switchDetailGalleryImage(${idx})" 
                   title="Xem góc chụp ${idx + 1}">
                <img src="${imgUrl}" alt="${currentProduct.name} - góc ${idx + 1}">
                <span class="thumb-number">${idx + 1}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Chọn nhanh theo phân loại màu sắc -->
      ${variants.length > 1 ? `
        <div class="variant-swatch-row">
          <span class="swatch-row-label">Đổi màu xem toàn bộ ảnh:</span>
          <div class="variant-swatches">
            ${variants.map((v, idx) => `
              <div class="swatch-card ${v.color === selectedColor.color ? 'active' : ''}" onclick="selectColor(${idx}, this)" title="Xem bộ ảnh màu ${v.color}">
                <img src="${v.img || (v.images && v.images[0])}" alt="${v.color}">
                <div class="swatch-info">
                  <span class="swatch-dot" style="background:${v.hex || v.colorCode || '#000'}"></span>
                  <span class="swatch-name">${v.color}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>

    <div class="pd-info-col">
      <h1 class="pd-title">${currentProduct.name}</h1>
      
      <div class="pd-rating">
        <div style="color:#f59e0b; display:inline-flex; gap:3px;">
          <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>
        </div>
        <span style="font-weight:700; color:#0f172a; margin-left:6px;">${currentProduct.rating || '5.0'}</span> / 5
        <span style="margin:0 10px; color:#cbd5e1;">|</span>
        <span style="color:#64748b;">Đã bán ${(currentProduct.sold || 48).toLocaleString('vi-VN')}</span>
      </div>

      <div class="pd-price-box">
        <span class="pd-price" id="detailPrice">${Number(selectedColor.price).toLocaleString('vi-VN')}₫</span>
        ${oldPriceVal > selectedColor.price ? `<span class="pd-old-price" id="detailOldPrice">${Number(oldPriceVal).toLocaleString('vi-VN')}₫</span>` : ''}
        ${percent > 0 ? `<span class="pd-discount-tag" id="detailSaleTag">-${percent}%</span>` : ''}
      </div>
      
      <p class="pd-desc">${currentProduct.description || currentProduct.desc || 'Thiết kế tinh xảo từ chất liệu cao cấp, tôn vinh phong cách sang trọng và lịch lãm của quý ông hiện đại.'}</p>
      
      <div class="pd-option-group">
        <span class="option-label">Màu sắc: <strong id="colorName" style="color:var(--gold, #dfba73); font-weight:700;">${selectedColor.color}</strong></span>
        <div class="color-selector">
          ${variants.map((v, idx) => `
            <div class="color-btn ${v.color === selectedColor.color ? 'selected' : ''}" onclick="selectColor(${idx}, this)">
              <span class="color-dot" style="background:${v.hex || v.colorCode || '#c5a059'}"></span> ${v.color}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="pd-option-group">
        <div class="size-header-row">
          <span class="option-label" style="margin-bottom:0;">Kích thước: <strong id="sizeName" style="color:var(--gold, #dfba73); font-weight:700;">${selectedSizeName ? selectedSizeName : 'Vui lòng chọn size'}</strong></span>
          <div id="sizeStockBadge"></div>
        </div>
        <div class="size-selector" id="sizeSelectorContainer"></div>
      </div>

      <div class="pd-actions">
        <div class="qty-input-group">
          <button class="qty-nav-btn" onclick="updateDetailQty(-1)" type="button">-</button>
          <input type="text" class="qty-val" id="detailQty" value="${quantity}" readonly>
          <button class="qty-nav-btn" onclick="updateDetailQty(1)" type="button">+</button>
        </div>
        <button class="btn-add-cart-lg" onclick="addDetailToCart()" type="button"><i class="fas fa-shopping-bag" style="margin-right:8px;"></i> THÊM VÀO GIỎ HÀNG</button>
      </div>

      <div style="margin-top:30px; padding-top:20px; border-top:1px solid #eee; display:flex; gap:20px; color:#64748b; font-size:12.5px; flex-wrap:wrap;">
        <div><i class="fas fa-shipping-fast" style="color:var(--gold, #dfba73); margin-right:6px;"></i> Miễn phí ship từ 1.000.000₫</div>
        <div><i class="fas fa-undo-alt" style="color:var(--gold, #dfba73); margin-right:6px;"></i> Đổi hàng trong 30 ngày</div>
        <div><i class="fas fa-shield-alt" style="color:var(--gold, #dfba73); margin-right:6px;"></i> 100% hàng chính hãng</div>
      </div>
    </div>
  `;

  renderSizeButtons();
}

function renderSizeButtons() {
  const sizeContainer = document.getElementById('sizeSelectorContainer');
  if (!sizeContainer) return;

  if (!selectedColor.sizes || selectedColor.sizes.length === 0) {
    sizeContainer.innerHTML = '<span style="color:#94a3b8; font-style:italic;">Freesize / Liên hệ đặt may</span>';
    return;
  }

  sizeContainer.innerHTML = selectedColor.sizes
    .map((s) => {
      const sName = typeof s === 'string' ? s : (s.size || s.name || 'Free');
      const sStock = (typeof s === 'object' && s !== null) ? (s.stock ?? 0) : 10;
      const isOutOfStock = sStock <= 0;
      const isSelected = selectedSizeName === sName;

      return `
        <div class="size-btn ${isSelected ? 'selected' : ''} ${isOutOfStock ? 'disabled' : ''}" 
             onclick="selectSize('${sName}', ${sStock}, this)">
             ${sName}
        </div>`;
    })
    .join('');
}

function selectColor(index, btn) {
  if (!currentProduct || !currentProduct.variants || !currentProduct.variants[index]) return;
  selectedColor = currentProduct.variants[index];
  selectedSizeName = null;
  renderDetailHTML();
}

function selectSize(name, stock, btn) {
  if (stock <= 0) {
    showToast({
      title: 'Hết hàng',
      message: `Kích cỡ ${name} của màu ${selectedColor ? selectedColor.color : ''} hiện đã tạm hết hàng. Quý khách vui lòng chọn size hoặc màu khác nhé!`,
      type: 'warning'
    });
    return;
  }

  selectedSizeName = name;
  const sizeNameEl = document.getElementById('sizeName');
  if (sizeNameEl) sizeNameEl.innerText = name;

  const badgeContainer = document.getElementById('sizeStockBadge');
  if (badgeContainer) {
    if (stock <= 5) {
      badgeContainer.innerHTML = `
        <span class="luxury-stock-badge urgency">
          <span class="flame-icon-box"><i class="fas fa-fire-flame-curved"></i></span>
          <span class="badge-text">Chỉ còn <strong>${stock}</strong> cái!</span>
          <span class="pulse-beacon"></span>
        </span>
      `;
    } else {
      badgeContainer.innerHTML = `
        <span class="luxury-stock-badge available">
          <i class="fas fa-check-circle"></i> Còn <strong>${stock}</strong> sản phẩm
        </span>
      `;
    }
  }

  // Tự động điều chỉnh số lượng nếu số lượng chọn vượt quá tồn kho
  if (quantity > stock) {
    quantity = stock;
    const el = document.getElementById('detailQty');
    if (el) el.value = quantity;
    showToast({
      title: 'Giới hạn số lượng',
      message: `Đã tự động chỉnh số lượng về ${stock} theo đúng số lượng còn trong kho.`,
      type: 'info'
    });
  }

  document.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('selected'));
  if (btn) btn.classList.add('selected');
}

function updateDetailQty(change) {
  let maxStock = 999;
  if (selectedSizeName && selectedColor && Array.isArray(selectedColor.sizes)) {
    const sizeObj = selectedColor.sizes.find((s) => (s.size || s.name) === selectedSizeName);
    if (sizeObj) {
      maxStock = sizeObj.stock ?? 0;
    }
  }

  const targetQty = quantity + change;
  if (targetQty < 1) return;

  if (change > 0 && targetQty > maxStock) {
    showToast({
      title: 'Tồn kho không đủ',
      message: `Size ${selectedSizeName || ''} chỉ còn tối đa ${maxStock} sản phẩm trong kho!`,
      type: 'warning'
    });
    quantity = Math.max(1, maxStock);
  } else {
    quantity = targetQty;
  }

  const el = document.getElementById('detailQty');
  if (el) el.value = quantity;
}

function addDetailToCart() {
  if (!selectedSizeName) {
    showToast({ title: 'Chưa chọn size', message: 'Vui lòng chọn kích thước phù hợp trước khi thêm vào giỏ hàng.', type: 'warning' });
    return;
  }

  const sizeObj = (selectedColor.sizes || []).find((s) => (s.name || s.size) === selectedSizeName);
  const availableStock = sizeObj ? (sizeObj.stock ?? 0) : 0;

  if (availableStock <= 0) {
    showToast({ title: 'Hết hàng', message: `Size ${selectedSizeName} đã hết hàng. Vui lòng chọn kích cỡ khác!`, type: 'error' });
    return;
  }

  const currentId = currentProduct.id || currentProduct._id;
  const existingInCart = cart.find((i) => String(i.id) === String(currentId) && i.color === selectedColor.color && i.size === selectedSizeName);
  const currentInCartQty = existingInCart ? existingInCart.quantity : 0;

  if (currentInCartQty + quantity > availableStock) {
    const remainingCanAdd = Math.max(0, availableStock - currentInCartQty);
    if (remainingCanAdd <= 0) {
      showToast({
        title: 'Đã đạt giới hạn',
        message: `Bạn đã có ${currentInCartQty} cái trong giỏ hàng (kho chỉ còn ${availableStock} cái). Không thể thêm tiếp!`,
        type: 'warning'
      });
    } else {
      showToast({
        title: 'Tồn kho không đủ',
        message: `Kho chỉ còn ${availableStock} cái. Bạn đã có ${currentInCartQty} cái trong giỏ, chỉ có thể thêm tối đa ${remainingCanAdd} cái nữa!`,
        type: 'warning'
      });
    }
    return;
  }

  const item = {
    id: currentId,
    _id: currentId,
    name: currentProduct.name,
    price: selectedColor.price,
    img: selectedColor.img || currentProduct.image,
    image: selectedColor.img || currentProduct.image,
    color: selectedColor.color,
    size: selectedSizeName,
    quantity: quantity
  };

  addToCart(item);
}

function renderRelatedProducts() {
  const grid = document.getElementById('related-grid');
  if (!grid) return;
  const currentId = currentProduct ? (currentProduct.id || currentProduct._id) : null;
  const related = products.filter((p) => String(p.id || p._id) !== String(currentId)).slice(0, 4);
  renderProductGrid(related, 'related-grid');
}

// --- 5. LOGIC GIỎ HÀNG (CORE) ---

function addToCart(newItem) {
  const exist = cart.find((i) => String(i.id) === String(newItem.id) && i.color === newItem.color && i.size === newItem.size);
  if (exist) {
    exist.quantity += newItem.quantity;
  } else {
    cart.push(newItem);
  }

  saveCart();
  renderCartSidebar();
  updateCartIcon();
  // Chỉ thêm số ở giỏ hàng, KHÔNG mở container giỏ hàng
  showToast({ title: 'Thêm vào giỏ thành công', message: `+${newItem.quantity} "${newItem.name}" (${newItem.color || ''} · ${newItem.size || ''})`, type: 'success' });
}

function quickAdd(id) {
  const allProds = (typeof catalogState !== 'undefined' && catalogState.allProducts && catalogState.allProducts.length > 0)
    ? catalogState.allProducts
    : products;
  const p = allProds.find((x) => String(x.id) === String(id) || String(x._id) === String(id));
  if (!p) return;

  const v = (p.variants && p.variants.length > 0) ? p.variants[0] : { price: p.price, img: p.image, color: 'Tiêu chuẩn' };
  let chosenSize = 'M';
  if (v.sizes && v.sizes.length > 0) {
    const firstS = v.sizes[0];
    chosenSize = typeof firstS === 'string' ? firstS : (firstS.size || firstS.name || 'M');
  }

  const item = {
    id: p.id || p._id,
    _id: p.id || p._id,
    name: p.name,
    price: v.price || p.price || 0,
    img: v.img || p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
    image: v.img || p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
    color: v.color || 'Tiêu chuẩn',
    size: chosenSize,
    quantity: 1
  };
  addToCart(item);
}

function saveCart() {
  localStorage.setItem('moonlight_cart', JSON.stringify(cart));
}

function updateCartIcon() {
  try {
    cart = JSON.parse(localStorage.getItem('moonlight_cart')) || [];
  } catch (e) {}
  // CHỈ chọn #cartBadge và .cart-badge, TUYỆT ĐỐI không chọn .badge vì sẽ bị trùng sang #wishlistBadge
  const badges = document.querySelectorAll('#cartBadge, .cart-badge');
  const totalQty = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  badges.forEach((badge) => {
    badge.innerText = totalQty;
    badge.style.display = totalQty > 0 ? 'flex' : 'none';
    badge.classList.remove('badge-pop');
    void badge.offsetWidth;
    badge.classList.add('badge-pop');
  });
  // Đồng bộ lại icon yêu thích chính xác độc lập
  updateWishlistIcon();
}

function renderCartSidebar() {
  const list = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!list) return;

  try {
    cart = JSON.parse(localStorage.getItem('moonlight_cart')) || [];
  } catch (e) {}

  if (cart.length === 0) {
    list.innerHTML = `
      <div style="text-align:center; padding:40px 20px; color:#888;">
        <i class="fas fa-shopping-bag" style="font-size:36px; margin-bottom:12px; opacity:0.35;"></i>
        <p style="margin:0; font-size:14px;">Giỏ hàng của bạn đang trống</p>
      </div>
    `;
    if (totalEl) totalEl.innerText = '0₫';
    return;
  }

  const allProds = (typeof catalogState !== 'undefined' && catalogState.allProducts && catalogState.allProducts.length > 0)
    ? catalogState.allProducts
    : (typeof products !== 'undefined' && products.length > 0 ? products : SHOP_FALLBACK_PRODUCTS);

  let total = 0;
  list.innerHTML = cart
    .map((item, idx) => {
      total += (item.price || 0) * (item.quantity || 1);
      const p = allProds.find((x) => String(x.id || x._id) === String(item.id || item._id));
      const variants = (p && p.variants && p.variants.length > 0) ? p.variants : [];
      const currentVariant = variants.find((v) => v.color === item.color) || variants[0];
      const availableSizes = (currentVariant && currentVariant.sizes && currentVariant.sizes.length > 0)
        ? currentVariant.sizes
        : ['S', 'M', 'L', 'XL'];
      const imgSrc = item.img || item.image || (currentVariant ? currentVariant.img : (p ? p.image : 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800'));

      // 1. Selector màu sắc trực tiếp trong giỏ
      let colorSelectorHTML = '';
      if (variants.length > 1) {
        colorSelectorHTML = `
          <div class="cart-opt-box" style="position:relative; flex:1; min-width:100px;">
            <label style="display:block; font-size:9.5px; color:#64748b; font-weight:700; text-transform:uppercase; margin-bottom:2px; letter-spacing:0.3px;">Màu</label>
            <div style="position:relative;">
              <select class="cart-inline-select" onchange="changeCartItemColor(${idx}, this.value)" style="width:100%; font-size:11px; font-weight:600; font-family:var(--font); border:1px solid #cbd5e1; border-radius:4px; padding:3px 18px 3px 6px; background:#f8fafc; color:#0f172a; cursor:pointer; outline:none; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
                ${variants.map(v => `<option value="${v.color}" ${v.color === item.color ? 'selected' : ''}>${v.color}</option>`).join('')}
              </select>
              <i class="fas fa-chevron-down" style="position:absolute; right:6px; top:50%; transform:translateY(-50%); font-size:8px; color:#94a3b8; pointer-events:none;"></i>
            </div>
          </div>
        `;
      } else {
        colorSelectorHTML = `
          <div class="cart-opt-box" style="flex:1; min-width:75px;">
            <label style="display:block; font-size:9.5px; color:#64748b; font-weight:700; text-transform:uppercase; margin-bottom:2px; letter-spacing:0.3px;">Màu</label>
            <div style="font-size:11px; font-weight:600; color:#334155; padding:3px 0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${item.color || 'Tiêu chuẩn'}
            </div>
          </div>
        `;
      }

      // 2. Selector size kích thước trực tiếp trong giỏ
      const sizeSelectorHTML = `
        <div class="cart-opt-box" style="position:relative; width:80px;">
          <label style="display:block; font-size:9.5px; color:#64748b; font-weight:700; text-transform:uppercase; margin-bottom:2px; letter-spacing:0.3px;">Size</label>
          <div style="position:relative;">
            <select class="cart-inline-select" onchange="changeCartItemSize(${idx}, this.value)" style="width:100%; font-size:11px; font-weight:700; font-family:var(--font); border:1px solid #cbd5e1; border-radius:4px; padding:3px 18px 3px 6px; background:#f8fafc; color:#0f172a; cursor:pointer; outline:none;">
              ${availableSizes.map(s => {
                const sName = typeof s === 'string' ? s : (s.size || s.name);
                const sStock = typeof s === 'object' && s !== null ? (s.stock ?? 10) : 10;
                const disabled = sStock <= 0 ? 'disabled' : '';
                const note = sStock <= 0 ? ' (Hết)' : '';
                return `<option value="${sName}" ${sName === item.size ? 'selected' : ''} ${disabled}>${sName}${note}</option>`;
              }).join('')}
            </select>
            <i class="fas fa-chevron-down" style="position:absolute; right:6px; top:50%; transform:translateY(-50%); font-size:8px; color:#94a3b8; pointer-events:none;"></i>
          </div>
        </div>
      `;

      return `
      <div class="cart-item-row" style="display:flex; gap:12px; padding:12px 0; border-bottom:1px solid #f1f5f9; align-items:flex-start;">
          <img src="${imgSrc}" style="width:55px; height:68px; object-fit:cover; border-radius:4px; border:1px solid #e2e8f0; flex-shrink:0;" alt="${item.name}">
          <div class="cart-item-info" style="flex:1; min-width:0;">
              <h4 style="font-size:13px; margin:0 0 3px 0; color:#0f172a; font-weight:600; line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${item.name}">${item.name}</h4>
              
              <!-- Tùy chọn Màu & Size trực tiếp trong giỏ hàng -->
              <div class="cart-item-variants-edit" style="display:flex; gap:6px; margin:4px 0 6px 0; align-items:center;">
                  ${colorSelectorHTML}
                  ${sizeSelectorHTML}
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                  <strong style="font-size:13px; color:var(--gold); font-weight:700;">${((item.price || 0) * (item.quantity || 1)).toLocaleString('vi-VN')}₫</strong>
                  <div style="background:#f1f5f9; display:flex; align-items:center; border-radius:4px; padding:2px;">
                      <button onclick="changeCartQty(${idx}, -1)" style="border:none; background:none; padding:2px 8px; cursor:pointer; font-weight:700;">-</button>
                      <span style="font-size:12px; padding:0 6px; font-weight:600;">${item.quantity || 1}</span>
                      <button onclick="changeCartQty(${idx}, 1)" style="border:none; background:none; padding:2px 8px; cursor:pointer; font-weight:700;">+</button>
                  </div>
              </div>
          </div>
          <div onclick="removeCartItem(${idx})" style="cursor:pointer; color:#ef4444; padding:6px; margin-top:2px;" title="Xóa món"><i class="fas fa-trash"></i></div>
      </div>`;
    })
    .join('');

  if (totalEl) totalEl.innerText = `${total.toLocaleString('vi-VN')}₫`;
}

// Thay đổi màu sắc trực tiếp trong giỏ hàng
function changeCartItemColor(index, newColor) {
  try {
    cart = JSON.parse(localStorage.getItem('moonlight_cart')) || [];
  } catch (e) {}
  if (!cart[index]) return;

  const item = cart[index];
  const allProds = (typeof catalogState !== 'undefined' && catalogState.allProducts && catalogState.allProducts.length > 0)
    ? catalogState.allProducts
    : (typeof products !== 'undefined' && products.length > 0 ? products : SHOP_FALLBACK_PRODUCTS);
  const p = allProds.find((x) => String(x.id || x._id) === String(item.id || item._id));
  if (!p || !p.variants) return;

  const newV = p.variants.find((v) => v.color === newColor);
  if (!newV) return;

  item.color = newColor;
  item.price = newV.price || p.price;
  item.img = newV.img || p.image;
  item.image = newV.img || p.image;

  // Kiểm tra size hiện tại có hợp lệ ở variant màu mới không
  const hasSize = newV.sizes && newV.sizes.some((s) => (s.size || s.name || s) === item.size && (s.stock ?? 1) > 0);
  if (!hasSize && newV.sizes && newV.sizes.length > 0) {
    const firstAvail = newV.sizes.find((s) => (s.stock ?? 1) > 0) || newV.sizes[0];
    item.size = typeof firstAvail === 'string' ? firstAvail : (firstAvail.size || firstAvail.name || 'M');
  }

  // Tự động gộp nếu trùng với một món khác đã có trong giỏ
  const dupIdx = cart.findIndex((it, i) => i !== index && String(it.id || it._id) === String(item.id || item._id) && it.color === item.color && it.size === item.size);
  if (dupIdx > -1) {
    cart[dupIdx].quantity += (item.quantity || 1);
    cart.splice(index, 1);
  }

  saveCart();
  renderCartSidebar();
  updateCartIcon();
  if (typeof renderCheckoutPage === 'function') renderCheckoutPage();
  if (typeof showToast === 'function') {
    showToast({ title: 'Đã đổi màu', message: `Đã đổi sang màu "${newColor}"`, type: 'success' });
  }
}
window.changeCartItemColor = changeCartItemColor;

// Thay đổi size trực tiếp trong giỏ hàng
function changeCartItemSize(index, newSize) {
  try {
    cart = JSON.parse(localStorage.getItem('moonlight_cart')) || [];
  } catch (e) {}
  if (!cart[index]) return;

  const item = cart[index];
  const allProds = (typeof catalogState !== 'undefined' && catalogState.allProducts && catalogState.allProducts.length > 0)
    ? catalogState.allProducts
    : (typeof products !== 'undefined' && products.length > 0 ? products : SHOP_FALLBACK_PRODUCTS);
  const p = allProds.find((x) => String(x.id || x._id) === String(item.id || item._id));

  if (p && p.variants) {
    const v = p.variants.find((va) => va.color === item.color);
    if (v && v.sizes) {
      const s = v.sizes.find((sz) => (sz.size || sz.name || sz) === newSize);
      const maxStock = s ? (typeof s === 'object' ? (s.stock ?? 999) : 999) : 999;
      if (maxStock <= 0) {
        if (typeof showToast === 'function') {
          showToast({ title: 'Hết hàng', message: `Size ${newSize} của màu "${item.color}" hiện đã hết hàng!`, type: 'warning' });
        }
        renderCartSidebar();
        return;
      }
      if ((item.quantity || 1) > maxStock) {
        item.quantity = maxStock;
        if (typeof showToast === 'function') {
          showToast({ title: 'Tồn kho giới hạn', message: `Size ${newSize} chỉ còn ${maxStock} cái trong kho. Đã tự động điều chỉnh số lượng.`, type: 'info' });
        }
      }
    }
  }

  item.size = newSize;

  // Tự động gộp nếu trùng với một món khác đã có trong giỏ
  const dupIdx = cart.findIndex((it, i) => i !== index && String(it.id || it._id) === String(item.id || item._id) && it.color === item.color && it.size === item.size);
  if (dupIdx > -1) {
    cart[dupIdx].quantity += (item.quantity || 1);
    cart.splice(index, 1);
  }

  saveCart();
  renderCartSidebar();
  updateCartIcon();
  if (typeof renderCheckoutPage === 'function') renderCheckoutPage();
  if (typeof showToast === 'function') {
    showToast({ title: 'Đã đổi size', message: `Đã đổi sang Size ${newSize}`, type: 'success' });
  }
}
window.changeCartItemSize = changeCartItemSize;

function changeCartQty(index, change) {
  try {
    cart = JSON.parse(localStorage.getItem('moonlight_cart')) || [];
  } catch (e) {}
  if (!cart[index]) return;

  const item = cart[index];
  if (change > 0) {
    const allProds = (typeof catalogState !== 'undefined' && catalogState.allProducts && catalogState.allProducts.length > 0)
      ? catalogState.allProducts
      : products;
    const p = allProds.find((x) => String(x.id || x._id) === String(item.id || item._id));
    if (p && p.variants) {
      const v = p.variants.find((va) => va.color === item.color);
      if (v && v.sizes) {
        const s = v.sizes.find((sz) => (sz.size || sz.name) === item.size);
        const maxStock = s ? (s.stock ?? 999) : 999;
        if ((item.quantity || 1) + change > maxStock) {
          showToast({
            title: 'Tồn kho giới hạn',
            message: `Sản phẩm "${item.name}" (${item.color} - Size ${item.size}) chỉ còn tối đa ${maxStock} cái trong kho!`,
            type: 'warning'
          });
          return;
        }
      }
    }
  }

  cart[index].quantity = (cart[index].quantity || 1) + change;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart();
  renderCartSidebar();
  updateCartIcon();
  if (typeof updateCartBadge === 'function') updateCartBadge();
}

function removeCartItem(index) {
  try {
    cart = JSON.parse(localStorage.getItem('moonlight_cart')) || [];
  } catch (e) {}
  if (!cart[index]) return;
  cart.splice(index, 1);
  saveCart();
  renderCartSidebar();
  updateCartIcon();
  if (typeof updateCartBadge === 'function') updateCartBadge();
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  if (sidebar) {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
    if (sidebar.classList.contains('open')) renderCartSidebar();
  }
}

// Chuyển sang trang thanh toán
function goToCheckout() {
  if (cart.length === 0) {
    showToast({ title: 'Giỏ hàng trống', message: 'Vui lòng chọn sản phẩm trước khi tiến hành thanh toán.', type: 'warning' });
    return;
  }
  window.location.href = 'checkout.html';
}

// --- 6. LOGIC YÊU THÍCH (WISHLIST SIDEBAR) ---

function updateWishlistIcon() {
  wishlist = getWishlistIds();
  window.wishlist = wishlist;
  const badge = document.getElementById('wishlistBadge');
  if (badge) {
    badge.innerText = wishlist.length;
    badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  }
}

function toggleWishlistSidebar() {
  const sidebar = document.getElementById('wishlistSidebar');
  const overlay = document.getElementById('wishlistOverlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
  if (sidebar.classList.contains('open')) {
    renderWishlistSidebar();
  }
}

function renderWishlistSidebar() {
  const container = document.getElementById('wishlistItems');
  if (!container) return;

  wishlist = getWishlistIds();
  window.wishlist = wishlist;

  const allProds = (typeof catalogState !== 'undefined' && catalogState.allProducts && catalogState.allProducts.length > 0)
    ? catalogState.allProducts
    : products;

  const likedProducts = allProds.filter((p) =>
    wishlist.some((x) => String(x) === String(p.id) || String(x) === String(p._id))
  );

  if (likedProducts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:50px 20px; color:#888;">
        <i class="far fa-heart" style="font-size:40px; margin-bottom:12px; opacity:0.4;"></i>
        <div style="font-weight:700; color:#333; margin-bottom:6px;">Danh sách yêu thích trống</div>
        <p style="font-size:13px; line-height:1.5;">Nhấn biểu tượng trái tim ở các sản phẩm bạn thích để lưu lại tại đây.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = likedProducts
    .map((p) => {
      const v = (p.variants && p.variants.length > 0) ? p.variants[0] : { img: p.image || '', price: p.price || 0 };
      const prodId = String(p.id || p._id || '');
      const imgSrc = v.img || p.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800';
      return `
      <div class="cart-item-row" style="display:flex; gap:12px; padding:14px 0; border-bottom:1px solid #f1f5f9; align-items:center;">
        <img src="${imgSrc}" style="width:55px; height:68px; object-fit:cover; border-radius:4px;" alt="${p.name}">
        <div style="flex:1;">
          <h4 style="font-size:13px; margin:0 0 4px 0;"><a href="product.html?id=${prodId}" style="color:#0f172a; text-decoration:none;">${p.name}</a></h4>
          <strong style="color:var(--gold); font-size:13px;">${Number(v.price || p.price || 0).toLocaleString('vi-VN')}₫</strong>
          <div style="margin-top:6px; display:flex; gap:12px; align-items:center;">
            <a href="product.html?id=${prodId}" style="font-size:11px; color:#5b50f6; font-weight:700; text-decoration:none;">Xem chi tiết &rarr;</a>
            <button onclick="quickAdd('${prodId}')" style="background:none; border:none; color:#10b981; font-size:11px; font-weight:700; cursor:pointer;">+ Giỏ hàng</button>
          </div>
        </div>
        <button onclick="toggleWishlist(null, '${prodId}')" style="background:none; border:none; color:#ef4444; cursor:pointer; padding:6px;" title="Bỏ thích">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    })
    .join('');
}

function toggleWishlist(btn, id) {
  let productId = null;
  let clickedBtn = null;

  if (typeof btn === 'object' && btn !== null) {
    if (btn.nodeType) {
      clickedBtn = btn;
      productId = id;
    } else if (btn.stopPropagation) {
      btn.stopPropagation();
      productId = id;
    }
  } else if (btn === null && id) {
    productId = id;
  } else {
    productId = btn;
    if (id && typeof id.stopPropagation === 'function') {
      id.stopPropagation();
    }
  }

  if (!productId) return;
  const strId = String(productId).trim();
  wishlist = getWishlistIds();
  const exists = wishlist.some((x) => String(x) === strId);

  if (exists) {
    wishlist = wishlist.filter((x) => String(x) !== strId);
    if (typeof showToast === 'function') {
      showToast({ title: 'Đã bỏ thích', message: 'Đã xóa sản phẩm khỏi danh sách yêu thích.', type: 'info' });
    }
  } else {
    wishlist.push(strId);
    if (typeof showToast === 'function') {
      showToast({ title: 'Đã yêu thích', message: 'Đã lưu sản phẩm vào danh sách yêu thích.', type: 'success' });
    }
  }

  localStorage.setItem('moonlight_wishlist', JSON.stringify(wishlist));
  window.wishlist = wishlist;
  updateWishlistIcon();

  // 1. Cập nhật tất cả các nút tim của sản phẩm này trên toàn bộ giao diện
  const targetSelectors = [
    `.product-card[data-id="${strId}"] .wishlist-btn`,
    `.catalog-card[data-id="${strId}"] .btn-card-wishlist`,
    `.catalog-card[data-id="${strId}"] .wishlist-btn`
  ];

  if (typeof currentProduct !== 'undefined' && currentProduct && (String(currentProduct.id) === strId || String(currentProduct._id) === strId)) {
    targetSelectors.push('.main-img-wrapper .wishlist-btn');
  }

  const allBtns = document.querySelectorAll(targetSelectors.join(', '));
  allBtns.forEach((b) => {
    b.classList.toggle('active', !exists);
    const ic = b.querySelector('i');
    if (ic) {
      ic.className = !exists ? 'fas fa-heart' : 'far fa-heart';
    }
  });

  if (clickedBtn) {
    clickedBtn.classList.toggle('active', !exists);
    const ic = clickedBtn.querySelector('i');
    if (ic) {
      ic.className = !exists ? 'fas fa-heart' : 'far fa-heart';
    }
  }

  // 2. Cập nhật lại sidebar yêu thích nếu đang mở
  const sidebar = document.getElementById('wishlistSidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    renderWishlistSidebar();
  }
}

// --- 7. LOGIC THANH TOÁN (CHECKOUT) ---

// --- QUẢN LÝ ĐỊA CHỈ HÀNH CHÍNH (TỈNH/THÀNH - QUẬN/HUYỆN - PHƯỜNG/XÃ) ---
const addressGeoState = {
  provinces: [],
  districtsCache: {},
  wardsCache: {},
  initialized: false
};

// 63 tỉnh thành Việt Nam (chuẩn hóa dự phòng)
const VN_PROVINCES_FALLBACK = [
  { code: 1, name: "Thành phố Hà Nội" },
  { code: 79, name: "Thành phố Hồ Chí Minh" },
  { code: 31, name: "Thành phố Hải Phòng" },
  { code: 48, name: "Thành phố Đà Nẵng" },
  { code: 92, name: "Thành phố Cần Thơ" },
  { code: 89, name: "Tỉnh An Giang" },
  { code: 77, name: "Tỉnh Bà Rịa - Vũng Tàu" },
  { code: 24, name: "Tỉnh Bắc Giang" },
  { code: 6, name: "Tỉnh Bắc Kạn" },
  { code: 95, name: "Tỉnh Bạc Liêu" },
  { code: 27, name: "Tỉnh Bắc Ninh" },
  { code: 83, name: "Tỉnh Bến Tre" },
  { code: 52, name: "Tỉnh Bình Định" },
  { code: 74, name: "Tỉnh Bình Dương" },
  { code: 70, name: "Tỉnh Bình Phước" },
  { code: 60, name: "Tỉnh Bình Thuận" },
  { code: 96, name: "Tỉnh Cà Mau" },
  { code: 4, name: "Tỉnh Cao Bằng" },
  { code: 66, name: "Tỉnh Đắk Lắk" },
  { code: 67, name: "Tỉnh Đắk Nông" },
  { code: 11, name: "Tỉnh Điện Biên" },
  { code: 75, name: "Tỉnh Đồng Nai" },
  { code: 87, name: "Tỉnh Đồng Tháp" },
  { code: 64, name: "Tỉnh Gia Lai" },
  { code: 2, name: "Tỉnh Hà Giang" },
  { code: 35, name: "Tỉnh Hà Nam" },
  { code: 42, name: "Tỉnh Hà Tĩnh" },
  { code: 30, name: "Tỉnh Hải Dương" },
  { code: 93, name: "Tỉnh Hậu Giang" },
  { code: 17, name: "Tỉnh Hòa Bình" },
  { code: 33, name: "Tỉnh Hưng Yên" },
  { code: 56, name: "Tỉnh Khánh Hòa" },
  { code: 91, name: "Tỉnh Kiên Giang" },
  { code: 62, name: "Tỉnh Kon Tum" },
  { code: 12, name: "Tỉnh Lai Châu" },
  { code: 68, name: "Tỉnh Lâm Đồng" },
  { code: 20, name: "Tỉnh Lạng Sơn" },
  { code: 10, name: "Tỉnh Lào Cai" },
  { code: 80, name: "Tỉnh Long An" },
  { code: 36, name: "Tỉnh Nam Định" },
  { code: 40, name: "Tỉnh Nghệ An" },
  { code: 37, name: "Tỉnh Ninh Bình" },
  { code: 58, name: "Tỉnh Ninh Thuận" },
  { code: 25, name: "Tỉnh Phú Thọ" },
  { code: 54, name: "Tỉnh Phú Yên" },
  { code: 44, name: "Tỉnh Quảng Bình" },
  { code: 49, name: "Tỉnh Quảng Nam" },
  { code: 51, name: "Tỉnh Quảng Ngãi" },
  { code: 22, name: "Tỉnh Quảng Ninh" },
  { code: 45, name: "Tỉnh Quảng Trị" },
  { code: 94, name: "Tỉnh Sóc Trăng" },
  { code: 14, name: "Tỉnh Sơn La" },
  { code: 72, name: "Tỉnh Tây Ninh" },
  { code: 34, name: "Tỉnh Thái Bình" },
  { code: 19, name: "Tỉnh Thái Nguyên" },
  { code: 38, name: "Tỉnh Thanh Hóa" },
  { code: 46, name: "Tỉnh Thừa Thiên Huế" },
  { code: 82, name: "Tỉnh Tiền Giang" },
  { code: 84, name: "Tỉnh Trà Vinh" },
  { code: 8, name: "Tỉnh Tuyên Quang" },
  { code: 86, name: "Tỉnh Vĩnh Long" },
  { code: 26, name: "Tỉnh Vĩnh Phúc" },
  { code: 15, name: "Tỉnh Yên Bái" }
];

// Helper escape HTML cho shop
function escapeHtmlShop(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let checkoutSavedAddresses = [];
let currentSelectedCheckoutAddressId = null;
let isSelectingCheckoutAddress = false;

// Dọn dẹp các thông báo chọn địa chỉ cũ nếu còn hiển thị để tránh dồn ứ nhiều thông báo
function dismissExistingAddressToasts() {
  const toastBox = document.getElementById('toast-box');
  if (!toastBox) return;
  toastBox.querySelectorAll('.toast').forEach(t => {
    const title = t.querySelector('.toast__title');
    if (title && (/địa chỉ/i.test(title.textContent) || /dia chi/i.test(title.textContent))) {
      t.remove();
    }
  });
}

// Hiển thị danh sách địa chỉ đã lưu của khách hàng tại trang thanh toán (checkout)
function renderCheckoutAddressPicker(addresses) {
  checkoutSavedAddresses = addresses || [];
  const container = document.getElementById('checkoutAddressPickerList');
  if (!container) return;

  if (checkoutSavedAddresses.length === 0) {
    container.innerHTML = `
      <div style="font-size:12.5px; color:#64748b; padding:4px 0;">
        <i class="fas fa-info-circle"></i> Bạn chưa có địa chỉ nhận hàng trong sổ địa chỉ. Hãy điền thông tin bên dưới hoặc <a href="profile.html?tab=profile" target="_blank" style="color:var(--gold,#dfba73); font-weight:600; text-decoration:none;">thêm địa chỉ tại đây</a>.
      </div>
    `;
    return;
  }

  // Sắp xếp: Địa chỉ mặc định lên đầu
  const sorted = [...checkoutSavedAddresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  checkoutSavedAddresses = sorted;

  // Nếu chưa chọn địa chỉ nào thì ưu tiên chọn địa chỉ mặc định
  if (!currentSelectedCheckoutAddressId) {
    const defaultAddr = sorted.find(a => a.isDefault) || sorted[0];
    currentSelectedCheckoutAddressId = defaultAddr ? String(defaultAddr._id) : 'custom';
  }

  container.innerHTML = sorted.map(addr => {
    const isSelected = String(addr._id) === String(currentSelectedCheckoutAddressId);
    const isDef = !!addr.isDefault;
    const labelText = addr.label || 'Nhà riêng';
    const labelIcon = labelText === 'Văn phòng' ? 'fa-building' : (labelText === 'Khác' ? 'fa-map-pin' : 'fa-home');
    const displayAddr = addr.fullAddress || [addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');

    return `
      <div class="checkout-addr-option ${isSelected ? 'selected' : ''}" data-addr-id="${addr._id}" onclick="selectCheckoutSavedAddress('${addr._id}', event)" role="button" tabindex="0" style="display:flex; flex-direction:row; align-items:flex-start; gap:12px; width:100%; box-sizing:border-box;">
        <input type="radio" name="checkoutAddressSelectRadio" value="${addr._id}" ${isSelected ? 'checked' : ''} class="checkout-addr-radio" tabindex="-1" style="width:18px!important; min-width:18px!important; max-width:18px!important; height:18px!important; flex:0 0 18px!important; flex-shrink:0!important; margin:2px 0 0 0!important; padding:0!important; border:none!important; pointer-events:none; accent-color:var(--gold,#dfba73);">
        <div class="checkout-addr-content" style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap;">
            <strong style="font-size:13.5px; color:#0f172a;">${escapeHtmlShop(addr.recipientName || 'Người nhận')}</strong>
            <span style="font-size:12.5px; color:#64748b; font-weight:600;"><i class="fas fa-phone-alt" style="font-size:11px; margin-right:3px;"></i>${escapeHtmlShop(addr.phone || '')}</span>
            <span class="badge-addr-label" style="font-size:10.5px; padding:1px 6px;"><i class="fas ${labelIcon}"></i> ${escapeHtmlShop(labelText)}</span>
            ${isDef ? `<span class="badge-addr-default" style="font-size:10.5px; padding:1px 6px;"><i class="fas fa-check-circle"></i> Mặc định</span>` : ''}
          </div>
          <div style="font-size:12.5px; color:#334155; line-height:1.45; word-break:break-word;">
            ${escapeHtmlShop(displayAddr)}
          </div>
        </div>
      </div>
    `;
  }).join('') + `
    <div class="checkout-addr-option ${currentSelectedCheckoutAddressId === 'custom' ? 'selected' : ''}" data-addr-id="custom" onclick="selectCheckoutSavedAddress('custom', event)" role="button" tabindex="0" style="display:flex; flex-direction:row; align-items:flex-start; gap:12px; width:100%; box-sizing:border-box;">
      <input type="radio" name="checkoutAddressSelectRadio" value="custom" ${currentSelectedCheckoutAddressId === 'custom' ? 'checked' : ''} class="checkout-addr-radio" tabindex="-1" style="width:18px!important; min-width:18px!important; max-width:18px!important; height:18px!important; flex:0 0 18px!important; flex-shrink:0!important; margin:2px 0 0 0!important; padding:0!important; border:none!important; pointer-events:none; accent-color:var(--gold,#dfba73);">
      <div class="checkout-addr-content" style="flex:1; min-width:0;">
        <div style="display:flex; align-items:center; gap:6px;">
          <strong style="font-size:13px; color:#0f172a;"><i class="fas fa-plus-circle" style="color:var(--gold,#dfba73);"></i> Giao đến địa chỉ mới khác</strong>
        </div>
        <p style="font-size:11.5px; color:#64748b; margin:2px 0 0 0;">Nhập số điện thoại và địa chỉ nhận hàng riêng cho đơn này bên dưới</p>
      </div>
    </div>
  `;

  // Điền dữ liệu cho lần đầu tải trang (không bắn notify)
  applySelectedCheckoutAddress(currentSelectedCheckoutAddressId, false);
}

// Xử lý khi khách bấm chọn một địa chỉ
function selectCheckoutSavedAddress(addrId, event) {
  if (event) {
    event.stopPropagation();
  }

  const strId = String(addrId);
  // Nếu đã đang chọn địa chỉ này rồi thì không làm gì cả, không bắn lại thông báo
  if (currentSelectedCheckoutAddressId === strId) return;

  // Khóa chống double-click nhanh
  if (isSelectingCheckoutAddress) return;
  isSelectingCheckoutAddress = true;
  setTimeout(() => { isSelectingCheckoutAddress = false; }, 300);

  currentSelectedCheckoutAddressId = strId;

  // Đồng bộ giao diện radio & class selected
  document.querySelectorAll('#checkoutAddressPickerList .checkout-addr-option').forEach(opt => {
    const isThis = opt.getAttribute('data-addr-id') === strId;
    opt.classList.toggle('selected', isThis);
    const radio = opt.querySelector('input[type="radio"]');
    if (radio) radio.checked = isThis;
  });

  applySelectedCheckoutAddress(strId, true);
}

// Áp dụng dữ liệu địa chỉ đã chọn vào form thanh toán
function applySelectedCheckoutAddress(addrId, showNotification = true) {
  const phoneInput = document.getElementById('cusPhone');
  const streetInput = document.getElementById('cusStreet');
  const provEl = document.getElementById('cusProvince');

  if (addrId === 'custom') {
    if (streetInput) streetInput.value = '';
    if (provEl) {
      provEl.value = '';
      provEl.dispatchEvent(new Event('change'));
    }
    if (typeof updateCheckoutAddressValue === 'function') updateCheckoutAddressValue();
    if (showNotification && typeof showToast === 'function') {
      dismissExistingAddressToasts();
      showToast({ title: 'Nhập địa chỉ mới', message: 'Vui lòng điền thông tin địa chỉ nhận hàng bên dưới.', type: 'info' });
    }
    return;
  }

  const addr = checkoutSavedAddresses.find(a => String(a._id) === String(addrId));
  if (!addr) return;

  if (phoneInput && addr.phone) {
    phoneInput.value = addr.phone;
  }
  if (streetInput && addr.street) {
    streetInput.value = addr.street;
  }

  restoreCheckoutAddress(addr);

  if (showNotification && typeof showToast === 'function') {
    dismissExistingAddressToasts();
    showToast({
      title: 'Đã chọn địa chỉ',
      message: `Đã áp dụng địa chỉ giao hàng của ${addr.recipientName || 'bạn'}.`,
      type: 'success'
    });
  }
}

// Chuyển đổi trạng thái dùng thông tin tài khoản đã lưu khi checkout
function toggleUseSavedCustomerProfile(useSaved) {
  const loggedUser = JSON.parse(localStorage.getItem('moonlight_user') || 'null');
  if (!loggedUser) return;

  const phoneInput = document.getElementById('cusPhone');
  const streetInput = document.getElementById('cusStreet');
  const provEl = document.getElementById('cusProvince');

  if (useSaved) {
    if (phoneInput && loggedUser.phone) phoneInput.value = loggedUser.phone;
    if (streetInput && loggedUser.street) streetInput.value = loggedUser.street;
    restoreCheckoutAddress(loggedUser);
    showToast({ title: 'Đã dùng thông tin lưu', message: 'Hệ thống đã tự động điền thông tin tài khoản của bạn.', type: 'info' });
  } else {
    // Để trống các trường SĐT & địa chỉ để khách nhập mới cho đơn này (Họ tên vẫn cố định theo tài khoản)
    if (phoneInput) phoneInput.value = '';
    if (streetInput) streetInput.value = '';
    if (provEl) {
      provEl.value = '';
      provEl.dispatchEvent(new Event('change'));
    }
  }
}

// Khôi phục bộ chọn Tỉnh / Quận / Phường đồng bộ
function restoreCheckoutAddress(source) {
  if (!source) return;
  const pVal = source.provinceCode || source.province;
  const provEl = document.getElementById('cusProvince');
  if (!provEl || !pVal) return;

  const tryMatch = () => {
    let matchedOpt = Array.from(provEl.options).find(o => o.value === String(pVal) || o.getAttribute('data-name') === pVal || (pVal && o.text.includes(pVal)));
    if (matchedOpt) {
      provEl.value = matchedOpt.value;
      provEl.dispatchEvent(new Event('change'));
      setTimeout(() => {
        const dVal = source.districtCode || source.district;
        const distEl = document.getElementById('cusDistrict');
        if (distEl && dVal) {
          let matchedDist = Array.from(distEl.options).find(o => o.value === String(dVal) || o.getAttribute('data-name') === dVal || (dVal && o.text.includes(dVal)));
          if (matchedDist) {
            distEl.value = matchedDist.value;
            distEl.dispatchEvent(new Event('change'));
            setTimeout(() => {
              const wVal = source.wardCode || source.ward;
              const wardEl = document.getElementById('cusWard');
              if (wardEl && wVal) {
                let matchedWard = Array.from(wardEl.options).find(o => o.value === String(wVal) || o.getAttribute('data-name') === wVal || (wVal && o.text.includes(wVal)));
                if (matchedWard) wardEl.value = matchedWard.value;
                if (typeof updateCheckoutAddressValue === 'function') updateCheckoutAddressValue();
              }
            }, 180);
          }
        }
      }, 180);
    }
  };

  // Nếu provinces chưa nạp xong thì chờ xíu
  if (provEl.options.length <= 1) {
    setTimeout(tryMatch, 300);
  } else {
    tryMatch();
  }
}

function updateCheckoutAddressValue() {
  const provinceEl = document.getElementById('cusProvince');
  const districtEl = document.getElementById('cusDistrict');
  const wardEl = document.getElementById('cusWard');
  const streetEl = document.getElementById('cusStreet');
  const addressHiddenEl = document.getElementById('cusAddress');
  const previewCard = document.getElementById('addressPreviewCard');
  const previewText = document.getElementById('addressPreviewText');

  if (!provinceEl || !addressHiddenEl) return;

  const street = (streetEl?.value || '').trim();
  const provinceName = (provinceEl.selectedIndex > 0 && !provinceEl.options[provinceEl.selectedIndex].text.startsWith('--'))
    ? provinceEl.options[provinceEl.selectedIndex].text
    : '';
  const districtName = (districtEl && districtEl.selectedIndex > 0 && !districtEl.options[districtEl.selectedIndex].text.startsWith('--'))
    ? districtEl.options[districtEl.selectedIndex].text
    : '';
  const wardName = (wardEl && wardEl.selectedIndex > 0 && !wardEl.options[wardEl.selectedIndex].text.startsWith('--'))
    ? wardEl.options[wardEl.selectedIndex].text
    : '';

  const parts = [];
  if (street) parts.push(street);
  if (wardName) parts.push(wardName);
  if (districtName) parts.push(districtName);
  if (provinceName) parts.push(provinceName);

  const full = parts.join(', ');
  addressHiddenEl.value = full;

  if (previewCard && previewText) {
    if (full && (street || wardName || districtName || provinceName)) {
      previewCard.style.display = 'flex';
      previewText.textContent = full;
    } else {
      previewCard.style.display = 'none';
    }
  }
}

async function initCheckoutAddressSelector() {
  const provinceEl = document.getElementById('cusProvince');
  const districtEl = document.getElementById('cusDistrict');
  const wardEl = document.getElementById('cusWard');
  const streetEl = document.getElementById('cusStreet');

  if (!provinceEl || !districtEl || !wardEl || !streetEl) return;
  if (addressGeoState.initialized) return;
  addressGeoState.initialized = true;

  // Lắng nghe nhập số nhà, tên đường
  streetEl.addEventListener('input', updateCheckoutAddressValue);

  // 1. Tải danh sách Tỉnh/Thành phố
  try {
    provinceEl.innerHTML = '<option value="">-- Đang nạp danh sách Tỉnh / Thành phố... --</option>';
    let list = [];
    try {
      const res = await fetch('https://provinces.open-api.vn/api/v1/p/');
      if (res.ok) {
        list = await res.json();
      }
    } catch (apiErr) {
      console.warn('Lỗi kết nối open-api.vn, sử dụng fallback dự phòng:', apiErr);
    }

    if (!list || list.length === 0) {
      list = VN_PROVINCES_FALLBACK;
    }

    addressGeoState.provinces = list;
    provinceEl.innerHTML = '<option value="">-- Chọn Tỉnh / Thành phố --</option>' +
      list.map(p => `<option value="${p.code}" data-name="${p.name}">${p.name}</option>`).join('');

  } catch (err) {
    console.error('Lỗi khởi tạo danh sách tỉnh thành:', err);
    provinceEl.innerHTML = '<option value="">-- Chọn Tỉnh / Thành phố --</option>' +
      VN_PROVINCES_FALLBACK.map(p => `<option value="${p.code}" data-name="${p.name}">${p.name}</option>`).join('');
  }

  // 2. Sự kiện thay đổi Tỉnh / Thành phố
  provinceEl.addEventListener('change', async function () {
    const pCode = this.value;
    districtEl.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>';
    districtEl.disabled = true;
    wardEl.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
    wardEl.disabled = true;
    updateCheckoutAddressValue();

    if (!pCode) return;

    districtEl.innerHTML = '<option value="">-- Đang nạp Quận / Huyện... --</option>';

    try {
      let districts = addressGeoState.districtsCache[pCode];
      if (!districts) {
        const res = await fetch(`https://provinces.open-api.vn/api/v1/p/${pCode}?depth=2`);
        if (res.ok) {
          const data = await res.json();
          districts = data.districts || [];
          addressGeoState.districtsCache[pCode] = districts;
        }
      }

      if (districts && districts.length > 0) {
        districtEl.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>' +
          districts.map(d => `<option value="${d.code}" data-name="${d.name}">${d.name}</option>`).join('');
        districtEl.disabled = false;
      } else {
        districtEl.innerHTML = '<option value="">-- Không có dữ liệu quận/huyện --</option>';
      }
    } catch (dErr) {
      console.error('Lỗi nạp danh sách quận huyện:', dErr);
      districtEl.innerHTML = '<option value="">-- Lỗi nạp dữ liệu (Vui lòng thử lại) --</option>';
    }
  });

  // 3. Sự kiện thay đổi Quận / Huyện
  districtEl.addEventListener('change', async function () {
    const dCode = this.value;
    wardEl.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>';
    wardEl.disabled = true;
    updateCheckoutAddressValue();

    if (!dCode) return;

    wardEl.innerHTML = '<option value="">-- Đang nạp Phường / Xã... --</option>';

    try {
      let wards = addressGeoState.wardsCache[dCode];
      if (!wards) {
        const res = await fetch(`https://provinces.open-api.vn/api/v1/d/${dCode}?depth=2`);
        if (res.ok) {
          const data = await res.json();
          wards = data.wards || [];
          addressGeoState.wardsCache[dCode] = wards;
        }
      }

      if (wards && wards.length > 0) {
        wardEl.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>' +
          wards.map(w => `<option value="${w.code}" data-name="${w.name}">${w.name}</option>`).join('');
        wardEl.disabled = false;
      } else {
        wardEl.innerHTML = '<option value="">-- Không có dữ liệu phường/xã --</option>';
      }
    } catch (wErr) {
      console.error('Lỗi nạp danh sách phường xã:', wErr);
      wardEl.innerHTML = '<option value="">-- Lỗi nạp dữ liệu (Vui lòng thử lại) --</option>';
    }
  });

  // 4. Sự kiện thay đổi Phường / Xã
  wardEl.addEventListener('change', function () {
    updateCheckoutAddressValue();
  });

  // 5. Khôi phục thông tin khách hàng đã đặt lần trước nếu có
  try {
    const savedCustomer = JSON.parse(localStorage.getItem('moonlight_saved_customer') || 'null');
    if (savedCustomer) {
      const cusNameEl = document.getElementById('cusName');
      const cusPhoneEl = document.getElementById('cusPhone');
      if (cusNameEl && !cusNameEl.value && savedCustomer.name) cusNameEl.value = savedCustomer.name;
      if (cusPhoneEl && !cusPhoneEl.value && savedCustomer.phone) cusPhoneEl.value = savedCustomer.phone;
      if (savedCustomer.street && !streetEl.value) streetEl.value = savedCustomer.street;

      if (savedCustomer.provinceCode) {
        provinceEl.value = savedCustomer.provinceCode;
        const pCode = savedCustomer.provinceCode;
        districtEl.innerHTML = '<option value="">-- Đang nạp Quận / Huyện... --</option>';
        fetch(`https://provinces.open-api.vn/api/v1/p/${pCode}?depth=2`)
          .then(r => r.json())
          .then(data => {
            const districts = data.districts || [];
            addressGeoState.districtsCache[pCode] = districts;
            districtEl.innerHTML = '<option value="">-- Chọn Quận / Huyện --</option>' +
              districts.map(d => `<option value="${d.code}" data-name="${d.name}">${d.name}</option>`).join('');
            districtEl.disabled = false;
            if (savedCustomer.districtCode) {
              districtEl.value = savedCustomer.districtCode;
              const dCode = savedCustomer.districtCode;
              wardEl.innerHTML = '<option value="">-- Đang nạp Phường / Xã... --</option>';
              return fetch(`https://provinces.open-api.vn/api/v1/d/${dCode}?depth=2`)
                .then(r => r.json())
                .then(wData => {
                  const wards = wData.wards || [];
                  addressGeoState.wardsCache[dCode] = wards;
                  wardEl.innerHTML = '<option value="">-- Chọn Phường / Xã --</option>' +
                    wards.map(w => `<option value="${w.code}" data-name="${w.name}">${w.name}</option>`).join('');
                  wardEl.disabled = false;
                  if (savedCustomer.wardCode) {
                    wardEl.value = savedCustomer.wardCode;
                  }
                  updateCheckoutAddressValue();
                });
            }
          })
          .catch(e => console.warn('Không thể tự động khôi phục quận/phường:', e));
      }
    }
  } catch (err) {
    console.warn('Lỗi đọc moonlight_saved_customer:', err);
  }
}

function renderCheckoutPage() {
  const container = document.getElementById('checkoutItems');
  const subTotalEl = document.getElementById('checkoutSubtotal');
  const totalEl = document.getElementById('checkoutTotal');

  // Khởi tạo bộ chọn địa chỉ nếu đang ở trang checkout
  initCheckoutAddressSelector();

  // Tự động điền thông tin khách hàng và xử lý khóa Họ Tên cố định theo tài khoản
  try {
    const loggedUser = JSON.parse(localStorage.getItem('moonlight_user') || 'null');
    const savedCustomer = JSON.parse(localStorage.getItem('moonlight_saved_customer') || 'null');

    const savedCard = document.getElementById('checkoutSavedProfileCard');
    const nameInput = document.getElementById('cusName');
    const phoneInput = document.getElementById('cusPhone');
    const streetInput = document.getElementById('cusStreet');
    const nameLockedNotice = document.getElementById('cusNameLockedNotice');
    const nameLockIcon = document.getElementById('cusNameLockIcon');

    if (loggedUser) {
      // 1. NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP:
      // RÀNG BUỘC CỐ ĐỊNH: Họ và tên KHÔNG THỂ SỬA
      if (nameInput) {
        nameInput.value = loggedUser.name || loggedUser.username || '';
        nameInput.readOnly = true;
        nameInput.classList.add('input-locked');
        nameInput.title = 'Họ và tên cố định theo tài khoản MoonLight của bạn, không thể chỉnh sửa.';
      }
      if (nameLockedNotice) nameLockedNotice.style.display = 'inline-flex';
      if (nameLockIcon) nameLockIcon.style.display = 'block';

      // Số điện thoại CÓ THỂ SỬA
      if (phoneInput) {
        phoneInput.readOnly = false;
        if (!phoneInput.value && loggedUser.phone) {
          phoneInput.value = loggedUser.phone;
        }
      }

      // Hiển thị khối tùy chọn thông tin đã lưu
      if (savedCard) {
        savedCard.style.display = 'block';

        let userAddresses = Array.isArray(loggedUser.addresses) ? loggedUser.addresses : [];
        if (userAddresses.length > 0) {
          renderCheckoutAddressPicker(userAddresses);
        } else if (loggedUser.province || loggedUser.address) {
          // Trường hợp tài khoản cũ có 1 địa chỉ phẳng
          const legacyAddr = {
            _id: 'legacy_default',
            recipientName: loggedUser.name || loggedUser.username || 'Khách hàng',
            phone: loggedUser.phone || '',
            province: loggedUser.province || '',
            provinceCode: loggedUser.provinceCode || '',
            district: loggedUser.district || '',
            districtCode: loggedUser.districtCode || '',
            ward: loggedUser.ward || '',
            wardCode: loggedUser.wardCode || '',
            street: loggedUser.street || '',
            fullAddress: loggedUser.address || '',
            isDefault: true,
            label: 'Nhà riêng'
          };
          renderCheckoutAddressPicker([legacyAddr]);
        } else {
          renderCheckoutAddressPicker([]);
        }

        // Tải thêm từ API để luôn đồng bộ mới nhất
        if (typeof MoonlightAPI !== 'undefined' && typeof MoonlightAPI.getMyAddresses === 'function') {
          MoonlightAPI.getMyAddresses().then(res => {
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
              loggedUser.addresses = res.data;
              localStorage.setItem('moonlight_user', JSON.stringify(loggedUser));
              renderCheckoutAddressPicker(res.data);
            }
          }).catch(() => {});
        }
      }
    } else {
      // KHÁCH VÃNG LAI: Tên có thể sửa bình thường
      if (nameInput) {
        nameInput.readOnly = false;
        nameInput.classList.remove('input-locked');
      }
      if (nameLockedNotice) nameLockedNotice.style.display = 'none';
      if (nameLockIcon) nameLockIcon.style.display = 'none';
      if (savedCard) savedCard.style.display = 'none';

      if (savedCustomer) {
        if (nameInput && !nameInput.value && savedCustomer.name) nameInput.value = savedCustomer.name;
        if (phoneInput && !phoneInput.value && savedCustomer.phone) phoneInput.value = savedCustomer.phone;
        if (streetInput && !streetInput.value && savedCustomer.street) streetInput.value = savedCustomer.street;
        if (savedCustomer.provinceCode || savedCustomer.province) {
          restoreCheckoutAddress(savedCustomer);
        }
      }
    }
  } catch (e) {
    console.warn('Lỗi khôi phục thông tin checkout:', e);
  }

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:35px 15px;">
        <i class="fas fa-shopping-bag" style="font-size:38px; color:#cbd5e1; margin-bottom:12px; display:block;"></i>
        <h4 style="margin:0 0 6px 0; color:#0f172a; font-size:15px;">Giỏ hàng của bạn đang trống</h4>
        <p style="margin:0 0 16px 0; color:#64748b; font-size:13px;">Hãy chọn các thiết kế mới nhất tại cửa hàng.</p>
        <a href="index.html#shop" class="btn-primary" style="display:inline-block; padding:10px 24px; font-size:12px; text-decoration:none; border-radius:4px;">MUA SẮM NGAY</a>
      </div>
    `;
    if (subTotalEl) subTotalEl.innerText = '0₫';
    if (totalEl) totalEl.innerText = '0₫';
    return;
  }

  let total = 0;
  container.innerHTML = cart
    .map((item) => {
      total += item.price * item.quantity;
      return `
      <div class="order-item-mini" style="display:flex; gap:14px; margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid #f1f5f9; align-items:center;">
          <img src="${item.img}" style="width:60px; height:72px; object-fit:cover; border-radius:4px; border:1px solid #e2e8f0; flex-shrink:0;">
          <div style="flex:1;">
              <h4 style="font-size:13.5px; margin:0 0 4px 0; color:#0f172a; font-weight:600;">${item.name}</h4>
              <p style="font-size:12px; color:#64748b; margin:0;">${item.color || 'Tiêu chuẩn'} | Size: <strong>${item.size || 'Freesize'}</strong></p>
              <p style="font-size:12px; margin:4px 0 0 0; color:#475569;">Số lượng: <strong>${item.quantity}</strong></p>
          </div>
          <div style="font-weight:700; font-size:14px; color:#0f172a;">${(item.price * item.quantity).toLocaleString('vi-VN')}₫</div>
      </div>`;
    })
    .join('') + `
      <a href="index.html#shop" class="btn-add-more-items">
        <i class="fas fa-plus-circle" style="color:var(--gold, #dfba73);"></i> CHỌN THÊM SẢN PHẨM KHÁC
      </a>
    `;

  if (subTotalEl) subTotalEl.innerText = `${total.toLocaleString('vi-VN')}₫`;
  if (totalEl) totalEl.innerText = `${total.toLocaleString('vi-VN')}₫`;

  // Cập nhật thẻ VietQR xem trước đồng bộ với mã đơn hàng
  updateVietQrPreview(total);
}

// --- TIỆN ÍCH CHUYỂN KHOẢN VIETQR TPBANK ---
function getOrCreateCheckoutOrderCode() {
  if (!window._currentCheckoutOrderCode) {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    window._currentCheckoutOrderCode = `ML-${todayStr}-${randCode}`;
  }
  return window._currentCheckoutOrderCode;
}

function updateVietQrPreview(forcedTotal) {
  const qrImg = document.getElementById('checkoutVietQrImg');
  const amountEl = document.getElementById('checkoutBankingAmount');
  const memoEl = document.getElementById('checkoutBankingMemo');
  if (!qrImg && !amountEl && !memoEl) return;

  let total = (typeof forcedTotal === 'number') ? forcedTotal : 0;
  if (total === 0 && Array.isArray(cart) && cart.length > 0) {
    total = cart.reduce((s, i) => s + ((Number(i.price) || 0) * (Number(i.quantity) || 1)), 0);
  }

  // Luôn dùng mã đơn hàng duy nhất để nội dung CK ở form và popup modal khớp 100%
  const memo = getOrCreateCheckoutOrderCode();

  if (amountEl) {
    amountEl.textContent = `${total.toLocaleString('vi-VN')}₫`;
    amountEl.dataset.rawAmount = String(total);
  }

  if (memoEl) {
    memoEl.textContent = memo;
  }

  if (qrImg) {
    const qrUrl = `https://img.vietqr.io/image/TPB-0393203037-compact2.png?amount=${total}&addInfo=${encodeURIComponent(memo)}&accountName=VU%20PHAM%20LUAN`;
    if (qrImg.src !== qrUrl) {
      qrImg.src = qrUrl;
    }
  }
}

function copyText(text, successMsg = 'Đã sao chép thành công!') {
  if (!text) return;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast({ title: 'Đã sao chép', message: successMsg, type: 'success', duration: 2500 });
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (successful) {
      showToast({ title: 'Đã sao chép', message: successMsg, type: 'success', duration: 2500 });
    }
  } catch (err) {
    showToast({ title: 'Sao chép', message: text, type: 'info', duration: 3000 });
  }
}

function copyTransferAmount() {
  const amountEl = document.getElementById('checkoutBankingAmount');
  const val = amountEl ? (amountEl.dataset.rawAmount || amountEl.textContent.replace(/[^0-9]/g, '')) : '0';
  copyText(val, `Đã chép số tiền: ${Number(val).toLocaleString('vi-VN')}₫`);
}

function copyTransferMemo() {
  const memoEl = document.getElementById('checkoutBankingMemo');
  const val = memoEl ? memoEl.textContent.trim() : 'MOONLIGHT';
  copyText(val, `Đã chép nội dung: ${val}`);
}

function copyModalAmount() {
  const amountEl = document.getElementById('modalTransferAmount');
  const val = amountEl ? amountEl.textContent.replace(/[^0-9]/g, '') : (window._currentCheckoutTotal || '0');
  copyText(val, `Đã chép số tiền: ${Number(val).toLocaleString('vi-VN')}₫`);
}

function copyModalMemo() {
  const memoEl = document.getElementById('modalTransferMemo');
  const val = memoEl ? memoEl.textContent.trim() : (window._currentCheckoutOrderCode || 'MOONLIGHT');
  copyText(val, `Đã chép nội dung: ${val}`);
}

async function handleConfirmTransfer(customCode) {
  const code = customCode || window._currentCheckoutOrderCode;
  if (!code) {
    showToast({ title: 'Lỗi', message: 'Không tìm thấy mã đơn hàng để xác nhận.', type: 'warning' });
    return;
  }

  const btn = document.getElementById('btnConfirmTransfer');
  const notice = document.getElementById('transferConfirmedNotice');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:6px;"></i> ĐANG XÁC NHẬN CHUYỂN KHOẢN...';
  }

  try {
    if (window.MoonlightAPI && window.MoonlightAPI.confirmBankTransfer) {
      await window.MoonlightAPI.confirmBankTransfer(code);
    }

    // Cập nhật trạng thái trong localStorage nếu có
    try {
      let orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
      const ord = orders.find(o => o.orderCode === code || o.id === code);
      if (ord) {
        ord.isPaid = true;
        ord.customerTransferConfirmed = true;
        localStorage.setItem('moonlight_orders', JSON.stringify(orders));
      }
    } catch (e) {}

    if (btn) btn.style.display = 'none';
    if (notice) notice.style.display = 'flex';

    showToast({
      title: 'Xác nhận thành công! 🎉',
      message: `Cảm ơn bạn! Đơn hàng ${code} đã được ghi nhận thanh toán TPBank.`,
      type: 'success',
      duration: 6000
    });
  } catch (err) {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle"></i> TÔI ĐÃ CHUYỂN KHOẢN THÀNH CÔNG';
    }
    showToast({
      title: 'Xác nhận chuyển khoản',
      message: err.message || 'Đã ghi nhận thông tin xác nhận của bạn.',
      type: 'info'
    });
  }
}

async function handleCheckout(e) {
  e.preventDefault();
  if (cart.length === 0) {
    showToast({ title: 'Giỏ hàng trống', message: 'Vui lòng chọn sản phẩm trước khi thanh toán!', type: 'warning' });
    return;
  }

  // Kiểm tra tồn kho toàn bộ giỏ hàng trước khi cho phép đặt
  const allProds = (typeof catalogState !== 'undefined' && catalogState.allProducts && catalogState.allProducts.length > 0)
    ? catalogState.allProducts
    : products;

  for (const item of cart) {
    const p = allProds.find((x) => String(x.id || x._id) === String(item.id || item._id));
    if (p && p.variants) {
      const v = p.variants.find((va) => va.color === item.color);
      if (v && v.sizes) {
        const s = v.sizes.find((sz) => (sz.size || sz.name) === item.size);
        const maxStock = s ? (s.stock ?? 999) : 999;
        if (item.quantity > maxStock) {
          showToast({
            title: 'Tồn kho không đủ',
            message: `Sản phẩm "${item.name}" (${item.color} - Size ${item.size}) chỉ còn ${maxStock} cái trong kho. Vui lòng giảm số lượng!`,
            type: 'warning'
          });
          return;
        }
      }
    }
  }

  const name = document.getElementById('cusName')?.value.trim();
  const phone = document.getElementById('cusPhone')?.value.trim();
  const note = document.getElementById('cusNote')?.value.trim() || '';
  const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cod';

  if (!name) {
    showToast({ title: 'Thiếu họ tên', message: 'Vui lòng nhập họ và tên người nhận hàng.', type: 'warning' });
    document.getElementById('cusName')?.focus();
    return;
  }

  if (!phone) {
    showToast({ title: 'Thiếu số điện thoại', message: 'Vui lòng nhập số điện thoại người nhận hàng.', type: 'warning' });
    document.getElementById('cusPhone')?.focus();
    return;
  }

  const provinceEl = document.getElementById('cusProvince');
  const districtEl = document.getElementById('cusDistrict');
  const wardEl = document.getElementById('cusWard');
  const streetEl = document.getElementById('cusStreet');
  const addressHiddenEl = document.getElementById('cusAddress');

  // Kiểm tra tính hợp lệ của địa chỉ phân cấp
  if (provinceEl && !provinceEl.value) {
    showToast({ title: 'Thiếu địa chỉ', message: 'Vui lòng chọn Tỉnh / Thành phố nhận hàng.', type: 'warning' });
    provinceEl.focus();
    return;
  }
  if (districtEl && !districtEl.value) {
    showToast({ title: 'Thiếu địa chỉ', message: 'Vui lòng chọn Quận / Huyện nhận hàng.', type: 'warning' });
    districtEl.focus();
    return;
  }
  if (wardEl && !wardEl.value) {
    showToast({ title: 'Thiếu địa chỉ', message: 'Vui lòng chọn Phường / Xã nhận hàng.', type: 'warning' });
    wardEl.focus();
    return;
  }
  if (streetEl && !streetEl.value.trim()) {
    showToast({ title: 'Thiếu số nhà', message: 'Vui lòng nhập số nhà, tên đường nhận hàng.', type: 'warning' });
    streetEl.focus();
    return;
  }

  // Cập nhật lại chuỗi địa chỉ đầy đủ
  updateCheckoutAddressValue();
  const address = (addressHiddenEl?.value || '').trim() || (streetEl?.value || '').trim();

  if (!address) {
    showToast({ title: 'Thiếu địa chỉ', message: 'Vui lòng nhập đầy đủ thông tin địa chỉ nhận hàng.', type: 'warning' });
    return;
  }

  // Chuẩn hóa toàn bộ danh sách mặt hàng để khớp schema OrderItem
  const formattedItems = cart.map((item) => {
    const pId = item.productId || item.id || item._id || 'prod_' + Date.now();
    const pName = item.productName || item.name || 'Sản phẩm';
    const pPrice = Number(item.price) || 0;
    const pQty = Number(item.quantity) || 1;
    return {
      productId: pId,
      id: pId,
      productName: pName,
      name: pName,
      variant: item.variant || [item.color, item.size].filter(Boolean).join(' - ') || 'Tiêu chuẩn',
      color: item.color || '',
      size: item.size || '',
      img: item.img || item.image || '',
      price: pPrice,
      quantity: pQty,
      subtotal: (item.subtotal !== undefined && !isNaN(Number(item.subtotal)))
        ? Number(item.subtotal)
        : pPrice * pQty
    };
  });

  const orderCode = getOrCreateCheckoutOrderCode();
  const subtotal = formattedItems.reduce((s, i) => s + i.subtotal, 0);
  const total = subtotal;

  let loggedCustomer = null;
  try {
    loggedCustomer = JSON.parse(localStorage.getItem('moonlight_user') || 'null');
  } catch (e) {}

  const newOrder = {
    id: orderCode,
    orderCode,
    customerId: loggedCustomer ? (loggedCustomer.id || loggedCustomer._id) : undefined,
    customer: { 
      name, 
      phone, 
      email: loggedCustomer ? (loggedCustomer.email || '') : '',
      address, 
      note 
    },
    items: formattedItems,
    subtotal,
    total,
    status: 'pending',
    isPaid: false,
    paymentMethod: paymentMethod === 'cod' ? 'cod' : 'banking',
    date: new Date().toLocaleString('vi-VN')
  };

  // Nút submit trạng thái loading
  const submitBtn = document.querySelector('.btn-place-order');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i> ĐANG XỬ LÝ ĐẶT HÀNG...';
    submitBtn.disabled = true;
  }

  // Gửi API backend nếu có
  try {
    if (window.MoonlightAPI) {
      const orderRes = await window.MoonlightAPI.createOrder(newOrder);
      if (orderRes && orderRes.data && orderRes.data.updatedCustomerUser) {
        localStorage.setItem('moonlight_user', JSON.stringify(orderRes.data.updatedCustomerUser));
        if (typeof updateCustomerNavbarUI === 'function') updateCustomerNavbarUI();
      }
    }
  } catch (err) {
    if (submitBtn) {
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
    }
    showToast({
      title: 'Không thể hoàn tất đặt hàng',
      message: err.message || 'Lỗi kết nối máy chủ',
      type: 'error'
    });
    return;
  }

  // Lưu thông tin khách hàng để tự điền cho các lần sau
  try {
    const savedCustomerData = {
      name,
      phone,
      address,
      street: streetEl?.value?.trim() || '',
      province: provinceEl?.options[provinceEl.selectedIndex]?.text || '',
      provinceCode: provinceEl?.value || '',
      district: districtEl?.options[districtEl.selectedIndex]?.text || '',
      districtCode: districtEl?.value || '',
      ward: wardEl?.options[wardEl.selectedIndex]?.text || '',
      wardCode: wardEl?.value || ''
    };
    localStorage.setItem('moonlight_saved_customer', JSON.stringify(savedCustomerData));

    // Cập nhật ngay vào tài khoản đăng nhập hiện tại nếu có
    const currUser = JSON.parse(localStorage.getItem('moonlight_user') || 'null');
    if (currUser) {
      Object.assign(currUser, savedCustomerData);
      localStorage.setItem('moonlight_user', JSON.stringify(currUser));
    }
  } catch (saveErr) {}

  // Lưu vào LocalStorage
  let orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
  orders.unshift(newOrder);
  localStorage.setItem('moonlight_orders', JSON.stringify(orders));

  cart = [];
  saveCart();
  updateCartIcon();

  const successModal = document.getElementById('orderSuccessModal');
  const codeEl = document.getElementById('successOrderCode');
  const modalStatusHalo = document.getElementById('modalStatusHalo');
  const modalStatusIcon = document.getElementById('modalStatusIcon');
  const modalStatusTitle = document.getElementById('modalStatusTitle');
  const modalStatusSubtitle = document.getElementById('modalStatusSubtitle');
  const modalCodDetails = document.getElementById('modalCodDetails');

  const modalBankingSec = document.getElementById('modalBankingSection');
  const modalQrWrapper = document.getElementById('modalQrWrapper');
  const modalVietQrImg = document.getElementById('modalVietQrImg');
  const modalTransferAmount = document.getElementById('modalTransferAmount');
  const modalTransferMemo = document.getElementById('modalTransferMemo');
  const modalWaitingNotice = document.getElementById('modalWaitingNotice');
  const modalPaidSuccessBox = document.getElementById('modalPaidSuccessBox');

  window._currentCheckoutOrderCode = orderCode;
  window._currentCheckoutTotal = total;

  if (successModal) {
    if (codeEl) codeEl.textContent = orderCode;

    if (paymentMethod === 'banking' && modalBankingSec) {
      // 1. TRẠNG THÁI CHỜ CHUYỂN KHOẢN: Không hiện đặt hàng thành công trước khi tiền vào
      if (modalStatusHalo) modalStatusHalo.className = 'success-icon-halo waiting-banking';
      if (modalStatusIcon) modalStatusIcon.className = 'fas fa-qrcode';
      if (modalStatusTitle) modalStatusTitle.textContent = 'CHỜ THANH TOÁN CHUYỂN KHOẢN';
      if (modalStatusSubtitle) {
        modalStatusSubtitle.innerHTML = `Đơn hàng <strong>${orderCode}</strong> đã được tạo. Vui lòng quét mã VietQR TPBank bên dưới để thanh toán.`;
      }
      if (modalCodDetails) modalCodDetails.style.display = 'none';

      modalBankingSec.style.display = 'block';
      if (modalQrWrapper) modalQrWrapper.style.display = 'flex';
      if (modalTransferAmount) modalTransferAmount.textContent = `${total.toLocaleString('vi-VN')}₫`;
      if (modalTransferMemo) modalTransferMemo.textContent = orderCode;
      if (modalVietQrImg) {
        modalVietQrImg.src = `https://img.vietqr.io/image/TPB-0393203037-compact2.png?amount=${total}&addInfo=${encodeURIComponent(orderCode)}&accountName=VU%20PHAM%20LUAN`;
      }
      if (modalWaitingNotice) modalWaitingNotice.style.display = 'flex';
      if (modalPaidSuccessBox) modalPaidSuccessBox.style.display = 'none';

      showToast({
        title: 'Đang chờ thanh toán TPBank',
        message: `Quý khách vui lòng quét mã QR chuyển khoản đúng ${total.toLocaleString('vi-VN')}₫`,
        type: 'info',
        duration: 6000
      });

      // Lắng nghe tự động tín hiệu tiền về từ SePay Webhook
      startAutoPaymentCheck(orderCode, total);
    } else {
      // 2. TRẠNG THÁI ĐẶT HÀNG COD (Thanh toán khi nhận hàng)
      if (modalStatusHalo) modalStatusHalo.className = 'success-icon-halo';
      if (modalStatusIcon) modalStatusIcon.className = 'fas fa-check';
      if (modalStatusTitle) modalStatusTitle.textContent = 'ĐẶT HÀNG THÀNH CÔNG!';
      if (modalStatusSubtitle) {
        modalStatusSubtitle.innerHTML = 'Cảm ơn bạn đã tin tưởng và mua sắm tại <strong>Moon Light</strong>.';
      }
      if (modalCodDetails) {
        modalCodDetails.style.display = 'block';
        modalCodDetails.innerHTML = `
          <p><i class="fas fa-phone-volume" style="color:var(--gold, #dfba73); margin-right:6px;"></i> Chuyên viên Moon Light sẽ sớm liên hệ qua số điện thoại để xác nhận.</p>
          <p style="margin-top:6px; font-size:12.5px; color:#64748b;"><i class="fas fa-shield-alt" style="color:#10b981; margin-right:6px;"></i> Quý khách được kiểm tra hàng trước khi thanh toán.</p>
        `;
      }
      if (modalBankingSec) modalBankingSec.style.display = 'none';

      showToast({
        title: 'Đặt hàng thành công! 🎉',
        message: `Mã đơn của bạn: ${orderCode}`,
        type: 'success',
        duration: 8000
      });
    }

    successModal.classList.add('active');
  } else {
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2500);
  }
}

// --- TỰ ĐỘNG BẮT TÍN HIỆU TIỀN VÀO (AUTO PAYMENT LISTENER) ---
let _pollPaymentTimer = null;
function startAutoPaymentCheck(orderCode, total) {
  if (_pollPaymentTimer) clearInterval(_pollPaymentTimer);
  if (!orderCode) return;

  _pollPaymentTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/v1/orders/${encodeURIComponent(orderCode)}/status`);
      const json = await res.json();
      if (json && json.success && json.data && json.data.isPaid) {
        clearInterval(_pollPaymentTimer);
        _pollPaymentTimer = null;

        const modalStatusHalo = document.getElementById('modalStatusHalo');
        const modalStatusIcon = document.getElementById('modalStatusIcon');
        const modalStatusTitle = document.getElementById('modalStatusTitle');
        const modalStatusSubtitle = document.getElementById('modalStatusSubtitle');
        const modalCodDetails = document.getElementById('modalCodDetails');

        const qrBox = document.getElementById('modalQrWrapper');
        const waitingNotice = document.getElementById('modalWaitingNotice');
        const paidBox = document.getElementById('modalPaidSuccessBox');

        // Cập nhật giao diện: CHÍNH THỨC ĐẶT HÀNG & THANH TOÁN THÀNH CÔNG!
        if (modalStatusHalo) modalStatusHalo.className = 'success-icon-halo';
        if (modalStatusIcon) modalStatusIcon.className = 'fas fa-check';
        if (modalStatusTitle) modalStatusTitle.textContent = 'ĐẶT HÀNG & THANH TOÁN THÀNH CÔNG! 🎉';
        if (modalStatusSubtitle) {
          modalStatusSubtitle.innerHTML = `Moon Light đã nhận được tiền chuyển khoản từ tài khoản TPBank. Đơn hàng đang được chuẩn bị đóng gói giao ngay!`;
        }
        if (modalCodDetails) {
          modalCodDetails.style.display = 'block';
          modalCodDetails.innerHTML = `
            <p><i class="fas fa-box-open" style="color:var(--gold, #dfba73); margin-right:6px;"></i> Đơn hàng đã được thanh toán thành công và chuyển sang bộ phận đóng gói.</p>
            <p style="margin-top:6px; font-size:12.5px; color:#10b981;"><i class="fas fa-check-double" style="margin-right:6px;"></i> Quý khách không cần trả thêm bất kỳ khoản tiền nào khi nhận hàng.</p>
          `;
        }

        if (qrBox) qrBox.style.display = 'none';
        if (waitingNotice) waitingNotice.style.display = 'none';
        if (paidBox) paidBox.style.display = 'flex';

        showToast({
          title: 'Thanh toán thành công! 🎉',
          message: `Đơn hàng ${orderCode} đã khớp lệnh thanh toán TPBank. Cảm ơn bạn!`,
          type: 'success',
          duration: 9000
        });
      }
    } catch (err) {}
  }, 2000);
}

// --- 8. TIỆN ÍCH & TƯƠNG TÁC GIAO DIỆN ---

// Tìm kiếm
function setupSearch() {
  const input = document.getElementById('searchInput');
  if (input) {
    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        const keyword = e.target.value.toLowerCase().trim();
        if (!keyword) return;
        const grid = document.getElementById('product-grid');
        if (grid) {
          const filtered = products.filter((p) => p.name.toLowerCase().includes(keyword));
          renderProductGrid(filtered, 'product-grid');
          toggleSearch();
          const shopSec = document.getElementById('shop');
          if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = `catalog.html?search=${encodeURIComponent(keyword)}`;
        }
      }
    });
  }
}

function toggleSearch() {
  const overlay = document.getElementById('searchOverlay');
  if (overlay) overlay.classList.toggle('open');
  const input = document.getElementById('searchInput');
  if (input && overlay.classList.contains('open')) input.focus();
}

function toggleMobileMenu() {
  const menu = document.querySelector('.menu') || document.querySelector('#navbar .menu');
  const overlay = document.getElementById('mobileMenuOverlay');
  if (menu) menu.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}
window.toggleMobileMenu = toggleMobileMenu;
window.toggleSearch = toggleSearch;

// Scroll Effects (Navbar đổi màu, Nút lên đầu trang, Reveal Animation)
function setupScrollEffects() {
  const navbar = document.getElementById('navbar');

  const checkScrollState = () => {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;

    // 1. Navbar scrolled style
    if (navbar) {
      if (scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // 2. Scroll to top button show/hide
    if (scrollTopBtn) {
      if (scrollY > 250) {
        scrollTopBtn.classList.add('show');
      } else {
        scrollTopBtn.classList.remove('show');
      }
    }
  };

  window.removeEventListener('scroll', checkScrollState);
  window.addEventListener('scroll', checkScrollState, { passive: true });
  checkScrollState();

  // 3. Scroll to top click
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.onclick = (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }

  // 4. Reveal Animations
  const elements = document.querySelectorAll('.reveal');
  if (elements.length > 0 && typeof IntersectionObserver !== 'undefined') {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    elements.forEach((el) => observer.observe(el));
  }
}

// Mobile Menu Navigation
function setupMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.menu');
  const overlay = document.querySelector('.mobile-menu-overlay');

  if (toggleBtn && menu) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    });
  }

  if (overlay && menu) {
    overlay.addEventListener('click', () => {
      menu.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  document.querySelectorAll('.menu a').forEach((link) => {
    link.addEventListener('click', () => {
      if (menu) menu.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    });
  });
}

// Đăng ký nhận bản tin Newsletter
function handleNewsletter(e) {
  e.preventDefault();
  const form = e.target;
  const input = form.querySelector('input[type="email"]');
  const email = (input?.value || '').trim();

  if (!email || !email.includes('@')) {
    showToast({ title: 'Email không hợp lệ', message: 'Vui lòng nhập địa chỉ email chính xác.', type: 'warning' });
    return;
  }

  let subs = JSON.parse(localStorage.getItem('moonlight_subscribers')) || [];
  if (!subs.includes(email)) {
    subs.push(email);
    localStorage.setItem('moonlight_subscribers', JSON.stringify(subs));
  }

  if (input) input.value = '';
  showToast({
    title: 'Đăng ký thành công!',
    message: 'Mã giảm giá 10% của bạn là: MOONLIGHT10 (áp dụng khi thanh toán)',
    type: 'success'
  });
}

// Toast Notification (Hỗ trợ cả 3 tham số và 1 object)
function showToast(arg1, arg2, arg3) {
  let title = 'Thông báo';
  let message = '';
  let type = 'info';

  if (typeof arg1 === 'object' && arg1 !== null) {
    title = arg1.title || 'Thông báo';
    message = arg1.message || arg1.msg || '';
    type = arg1.type || 'info';
  } else if (typeof arg1 === 'string') {
    if (arg3 !== undefined) {
      title = arg1;
      message = arg2 || '';
      type = arg3 || 'info';
    } else if (arg2 !== undefined) {
      if (['success', 'info', 'warning', 'error', 'danger'].includes(arg1.toLowerCase())) {
        type = arg1.toLowerCase() === 'danger' ? 'error' : arg1.toLowerCase();
        title = type === 'success' ? 'Thành công' : type === 'error' ? 'Thất bại' : type === 'warning' ? 'Cảnh báo' : 'Thông báo';
        message = arg2;
      } else {
        title = arg1;
        message = arg2;
        type = 'info';
      }
    } else {
      title = 'Thông báo';
      message = arg1;
      type = 'info';
    }
  }

  if (!['success', 'info', 'warning', 'error'].includes(type)) {
    type = 'info';
  }

  let box = document.getElementById('toast-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toast-box';
    document.body.appendChild(box);
  }

  // Chống spam: Nếu thông báo có cùng tiêu đề và nội dung đang hiển thị thì không tạo thêm
  const existingDup = Array.from(box.querySelectorAll('.toast')).find(t => {
    const tTitle = t.querySelector('.toast__title')?.textContent?.trim() || '';
    const tMsg = t.querySelector('.toast__msg')?.textContent?.trim() || '';
    return tTitle === title.trim() && tMsg === message.trim();
  });
  if (existingDup) return;

  const toast = document.createElement('div');
  const icons = {
    success: 'fas fa-check-circle',
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-circle',
    error: 'fas fa-exclamation-triangle'
  };

  toast.classList.add('toast', `toast--${type}`);
  toast.innerHTML = `
        <div class="toast__icon"><i class="${icons[type] || icons.info}"></i></div>
        <div class="toast__body">
            <h3 class="toast__title">${title}</h3>
            <p class="toast__msg">${message}</p>
        </div>
        <div class="toast__close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></div>
    `;

  box.appendChild(toast);

  setTimeout(() => {
    if (toast && toast.parentElement) toast.remove();
  }, 3500);
}

// --- 9. MODALS CHÂN TRANG (TRA CỨU ĐƠN, BẢNG SIZE, CHÍNH SÁCH) ---

function openOrderTrackingModal() {
  const m = document.getElementById('orderTrackingModal');
  if (m) m.classList.add('open');
}
function closeOrderTrackingModal() {
  const m = document.getElementById('orderTrackingModal');
  if (m) m.classList.remove('open');
}

function handleTrackOrderSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('trackOrderInput');
  const val = (input?.value || '').trim().toLowerCase();
  const resContainer = document.getElementById('trackOrderResult');
  if (!val || !resContainer) return;

  const orders = JSON.parse(localStorage.getItem('moonlight_orders')) || [];
  const found = orders.find(
    (o) =>
      (o.id && o.id.toLowerCase().includes(val)) ||
      (o.orderCode && o.orderCode.toLowerCase().includes(val)) ||
      (o.customer?.phone && o.customer.phone.includes(val))
  );

  if (found) {
    const statusMap = {
      pending: '🟡 Chờ xác nhận',
      confirmed: '🔵 Đã xác nhận',
      shipping: '🚚 Đang giao hàng',
      completed: '✅ Đã hoàn thành',
      cancelled: '❌ Đã hủy'
    };
    resContainer.innerHTML = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-top:14px; text-align:left;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <strong>Mã đơn: #${found.orderCode || found.id}</strong>
          <span style="font-weight:700;">${statusMap[found.status] || found.status}</span>
        </div>
        <div style="font-size:12px; color:#64748b; line-height:1.6;">
          <div>Khách hàng: <strong>${found.customer?.name || 'Khách lẻ'}</strong> (${found.customer?.phone || ''})</div>
          <div>Tổng tiền: <strong style="color:var(--gold); font-size:14px;">${Number(found.total || 0).toLocaleString('vi-VN')}₫</strong></div>
          <div>Ngày đặt: ${found.date || (found.createdAt ? new Date(found.createdAt).toLocaleDateString('vi-VN') : 'Mới đây')}</div>
          <div style="margin-top:6px; font-style:italic;">Địa chỉ: ${found.customer?.address || 'Tại cửa hàng'}</div>
        </div>
      </div>
    `;
  } else {
    resContainer.innerHTML = `
      <div style="color:#ef4444; font-size:13px; margin-top:14px; padding:12px; background:rgba(239, 68, 68, 0.08); border-radius:6px;">
        Không tìm thấy đơn hàng nào khớp với mã đơn hoặc SĐT này. Quý khách vui lòng kiểm tra lại!
      </div>
    `;
  }
}

function openSizeGuideModal() {
  const m = document.getElementById('sizeGuideModal');
  if (m) m.classList.add('open');
}
function closeSizeGuideModal() {
  const m = document.getElementById('sizeGuideModal');
  if (m) m.classList.remove('open');
}

function openPolicyModal() {
  const m = document.getElementById('policyModal');
  if (m) m.classList.add('open');
}
function closePolicyModal() {
  const m = document.getElementById('policyModal');
  if (m) m.classList.remove('open');
}

// --- 10. REVIEWS SẢN PHẨM RIÊNG BIỆT ---
let selectedRating = 0;

function rateStar(star) {
  selectedRating = star;
  const ratingInput = document.getElementById('ratingValue');
  if (ratingInput) ratingInput.value = star;

  const stars = document.querySelectorAll('.star-rating-input i');
  stars.forEach((s, index) => {
    if (index < star) {
      s.classList.remove('far');
      s.classList.add('fas');
      s.style.color = '#f59e0b';
    } else {
      s.classList.remove('fas');
      s.classList.add('far');
      s.style.color = '';
    }
  });
}

function renderProductReviews(pid) {
  const listContainer = document.getElementById('reviewsList');
  if (!listContainer) return;

  let allReviews = JSON.parse(localStorage.getItem('moonlight_all_reviews')) || [];
  const productReviews = allReviews.filter((r) => String(r.productId) === String(pid));

  const avgScore =
    productReviews.length > 0
      ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
      : currentProduct && currentProduct.rating
      ? currentProduct.rating
      : '5.0';

  const count = productReviews.length;
  const avgEl = document.querySelector('.average-rating');
  if (avgEl) avgEl.innerText = avgScore;
  const totalEl = document.querySelector('.total-reviews');
  if (totalEl) totalEl.innerText = `(${count} đánh giá)`;

  const starsStatic = document.querySelector('.stars-static');
  if (starsStatic) {
    const rounded = Math.round(Number(avgScore) || 5);
    starsStatic.innerHTML = '★'.repeat(Math.min(5, rounded)) + '☆'.repeat(Math.max(0, 5 - rounded));
  }

  if (productReviews.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align:center; padding:35px 20px; color:#888;">
        <i class="far fa-comment-dots" style="font-size:32px; margin-bottom:10px; opacity:0.5; display:block;"></i>
        Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ cảm nhận của bạn!
      </div>
    `;
    return;
  }

  listContainer.innerHTML = productReviews
    .map((rev) => {
      const initials = (rev.name || 'K').split(' ').map((w) => w[0]).filter(Boolean).slice(-2).join('').toUpperCase();
      return `
      <div class="review-item" style="margin-bottom:20px; padding-bottom:18px; border-bottom:1px solid #eee; display:flex; gap:16px; align-items:flex-start;">
        <div class="review-avatar" style="width:44px; height:44px; border-radius:50%; background:linear-gradient(135deg, #1e293b, #0f172a); border:2px solid #dfba73; display:flex; align-items:center; justify-content:center; font-weight:700; color:#dfba73; flex-shrink:0; font-size:15px; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          ${initials}
        </div>
        <div class="review-content" style="flex:1;">
          <div class="review-top" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <strong style="color:#0f172a; font-size:15px; font-weight:700;">${rev.name}</strong>
            <span class="review-date" style="font-size:12.5px; color:#64748b;">${rev.date || 'Gần đây'}</span>
          </div>
          <div class="stars-display" style="color:#f59e0b; font-size:13px; margin:2px 0 6px 0;">
            ${'★'.repeat(rev.rating)}${'☆'.repeat(Math.max(0, 5 - rev.rating))}
          </div>
          <p style="margin:0; color:#334155; line-height:1.6; font-size:14px;">${rev.content}</p>
          ${
            rev.shopReply
              ? `
            <div class="shop-reply-customer-view" style="margin-top:12px; background:#f8fafc; border-left:3px solid var(--gold, #dfba73); border-radius:0 8px 8px 0; padding:12px 16px; font-size:13px; border:1px solid #e2e8f0; border-left-width:3px;">
              <div class="customer-reply-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
                <span class="customer-reply-brand" style="color:#0f172a; font-weight:700; font-size:12px; text-transform:uppercase; letter-spacing:0.5px; display:inline-flex; align-items:center; gap:6px;">
                  <i class="fas fa-shield-alt" style="color:#dfba73;"></i> Phản Hồi Từ MoonLight
                </span>
                <small style="color:#64748b; font-size:11.5px;">${rev.shopReplyDate || ''}</small>
              </div>
              <p class="customer-reply-content" style="margin:0; color:#334155; line-height:1.55; font-size:13px;">${rev.shopReply}</p>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `;
    })
    .join('');
}

function submitReview(e) {
  e.preventDefault();
  if (selectedRating === 0) {
    showToast({ title: 'Chưa chọn số sao', message: 'Vui lòng chọn số sao đánh giá sản phẩm.', type: 'warning' });
    return;
  }

  const nameInput = document.getElementById('reviewerName');
  const contentInput = document.getElementById('reviewContent');
  const name = nameInput ? nameInput.value.trim() : 'Khách hàng';
  const content = contentInput ? contentInput.value.trim() : '';

  if (!content) {
    showToast({ title: 'Nội dung trống', message: 'Vui lòng viết đôi lời cảm nhận về sản phẩm.', type: 'warning' });
    return;
  }

  const pid = currentProduct ? currentProduct.id || currentProduct._id : 1;
  const pName = currentProduct ? currentProduct.name : 'Sản phẩm';

  const newReview = {
    id: Date.now(),
    productId: pid,
    productName: pName,
    name,
    rating: selectedRating,
    content,
    date: new Date().toLocaleDateString('vi-VN'),
    status: 'approved'
  };

  let allReviews = JSON.parse(localStorage.getItem('moonlight_all_reviews')) || [];
  allReviews.unshift(newReview);
  localStorage.setItem('moonlight_all_reviews', JSON.stringify(allReviews));

  const form = document.getElementById('reviewForm');
  if (form) form.reset();
  rateStar(0);

  showToast({ title: 'Cảm ơn quý khách!', message: 'Đánh giá của bạn đã được hiển thị công khai.', type: 'success' });
  renderProductReviews(pid);
}

// GHI ĐÈ TOÀN BỘ WINDOW.ALERT MẶC ĐỊNH BẰNG THÔNG BÁO TOAST/NOTIFY SANG TRỌNG
if (typeof window !== 'undefined') {
  window.alert = function (message) {
    if (typeof showToast === 'function') {
      const msgStr = String(message || '');
      let type = 'info';
      let title = 'Thông báo';

      if (msgStr.toLowerCase().includes('thành công')) {
        type = 'success';
        title = 'Thành công';
      } else if (msgStr.toLowerCase().includes('lỗi') || msgStr.toLowerCase().includes('thất bại') || msgStr.toLowerCase().includes('không thể')) {
        type = 'error';
        title = 'Thông báo lỗi';
      } else if (msgStr.toLowerCase().includes('vui lòng') || msgStr.toLowerCase().includes('hết hàng') || msgStr.toLowerCase().includes('chỉ còn')) {
        type = 'warning';
        title = 'Cảnh báo';
      }

      showToast({ title, message: msgStr, type });
    } else {
      console.log('[Notice]', message);
    }
  };
}

// ==========================================================================
// 12. HỆ THỐNG ĐĂNG KÝ / ĐĂNG NHẬP KHÁCH HÀNG & GOOGLE IDENTITY SERVICES
// ==========================================================================

let isGoogleGsiInitialized = false;

function initCustomerAuthUI() {
  // 1. Nạp thư viện Google Identity Services nếu chưa có
  if (!document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
    const gs = document.createElement('script');
    gs.src = 'https://accounts.google.com/gsi/client';
    gs.async = true;
    gs.defer = true;
    document.head.appendChild(gs);
  }

  // 2. Tự động chèn Icon Tài khoản vào thanh Navbar nếu chưa có
  const navIcons = document.querySelector('.nav-icons');
  if (navIcons && !document.getElementById('navUserBtn')) {
    navIcons.insertAdjacentHTML(
      'beforeend',
      `
      <div class="icon-item nav-user-item" id="navUserBtn" onclick="handleUserIconClick(event)" title="Tài khoản">
        <i class="far fa-user" id="navUserIcon"></i>
        <span class="user-active-dot" id="userActiveDot" style="display:none;"></span>
        <div class="user-dropdown-menu" id="userDropdownMenu">
          <div class="user-dropdown-header">
            <div class="user-dropdown-avatar" id="dropdownUserAvatar"><i class="fas fa-user"></i></div>
            <div class="user-dropdown-info">
              <strong id="dropdownUserName">Khách hàng</strong>
              <span class="user-tier-badge" id="dropdownUserTier">Khách mới</span>
            </div>
          </div>
          <div class="user-dropdown-divider"></div>
          <a href="admin.html" class="user-dropdown-item admin-only-link" id="dropdownAdminLink" style="display:none;"><i class="fas fa-crown"></i> Trang quản trị Admin</a>
          <a href="profile.html?tab=profile" class="user-dropdown-item"><i class="fas fa-user-circle"></i> Thông tin cá nhân</a>
          <a href="profile.html?tab=orders" class="user-dropdown-item"><i class="fas fa-box-open"></i> Đơn mua của tôi</a>
          <a href="profile.html?tab=tickets" class="user-dropdown-item"><i class="fas fa-headset"></i> Yêu cầu hỗ trợ</a>
          <a href="checkout.html" class="user-dropdown-item"><i class="fas fa-shopping-bag"></i> Giỏ hàng của tôi</a>
          <div class="user-dropdown-divider"></div>
          <a href="javascript:void(0)" onclick="handleCustomerLogout()" class="user-dropdown-item text-danger"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
        </div>
      </div>
    `
    );
  }

  // 3. Tự động chèn Auth Modal vào DOM nếu chưa có
  if (!document.getElementById('authModalOverlay')) {
    document.body.insertAdjacentHTML(
      'beforeend',
      `
      <!-- LUXURY CUSTOMER AUTH MODAL -->
      <div class="auth-modal-overlay" id="authModalOverlay" onclick="if(event.target === this) closeAuthModal()">
        <div class="auth-modal-card">
          <button class="auth-modal-close" onclick="closeAuthModal()"><i class="fas fa-times"></i></button>
          <div class="auth-modal-header">
            <div class="auth-brand-logo">MOON<span style="color:var(--gold,#d4af37)">LIGHT</span>.</div>
            <p class="auth-modal-subtitle">Trải nghiệm mua sắm thời trang may đo cao cấp</p>
            <div class="auth-tabs">
              <button type="button" class="auth-tab-btn active" id="tabLoginBtn" onclick="switchAuthTab('login')">ĐĂNG NHẬP</button>
              <button type="button" class="auth-tab-btn" id="tabRegisterBtn" onclick="switchAuthTab('register')">ĐĂNG KÝ</button>
            </div>
          </div>

          <div class="auth-modal-body">
            <!-- Nút Google Đăng Nhập 1-Click -->
            <div class="google-auth-wrapper">
              <div id="g_id_onload" style="display:none;"></div>
              <button type="button" class="btn-google-custom" onclick="triggerGoogleSignIn()">
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/></svg>
                <span>Tiếp tục với Google</span>
              </button>
            </div>

            <div class="auth-divider">
              <span>HOẶC TÀI KHOẢN MOONLIGHT</span>
            </div>

            <!-- Form Đăng Nhập -->
            <form id="customerLoginForm" onsubmit="handleCustomerLoginSubmit(event)">
              <div class="auth-form-group">
                <label>Tên đăng nhập hoặc Email</label>
                <div class="auth-input-wrapper">
                  <i class="far fa-user"></i>
                  <input type="text" id="custLoginUsername" placeholder="Nhập username hoặc email..." required autocomplete="username">
                </div>
              </div>
              <div class="auth-form-group">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <label>Mật khẩu</label>
                </div>
                <div class="auth-input-wrapper">
                  <i class="fas fa-lock"></i>
                  <input type="password" id="custLoginPassword" placeholder="Nhập mật khẩu..." required autocomplete="current-password">
                  <button type="button" class="auth-pwd-toggle" onclick="toggleAuthPasswordVisibility('custLoginPassword', this)" title="Hiện/Ẩn mật khẩu" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; color:#94a3b8; padding:0; z-index:3;"><i class="far fa-eye" style="position:static!important; left:auto!important; top:auto!important; transform:none!important; pointer-events:none;"></i></button>
                </div>
              </div>
              <div id="customerLoginAlert" class="auth-alert error" style="display:none;"></div>
              <button type="submit" class="btn-auth-submit" id="custLoginSubmitBtn">
                <span>ĐĂNG NHẬP</span> <i class="fas fa-arrow-right"></i>
              </button>
            </form>

            <!-- Form Đăng Ký (Bổ sung Họ và tên) -->
            <form id="customerRegisterForm" style="display:none;" onsubmit="handleCustomerRegisterStep1(event)">
              <div class="auth-form-group">
                <label>Họ và tên *</label>
                <div class="auth-input-wrapper">
                  <i class="far fa-id-badge"></i>
                  <input type="text" id="custRegFullName" placeholder="Ví dụ: Nguyễn Văn A..." required autocomplete="name">
                </div>
              </div>
              <div class="auth-form-group">
                <label>Tên tài khoản (Username)</label>
                <div class="auth-input-wrapper">
                  <i class="far fa-user"></i>
                  <input type="text" id="custRegUsername" placeholder="Nhập tên tài khoản (viết liền không dấu)..." required autocomplete="username" minlength="3">
                </div>
              </div>
              <div class="auth-form-group">
                <label>Địa chỉ Email nhận mã xác minh</label>
                <div class="auth-input-wrapper">
                  <i class="far fa-envelope"></i>
                  <input type="email" id="custRegEmail" placeholder="Ví dụ: yourname@gmail.com..." required autocomplete="email">
                </div>
              </div>
              <div class="auth-form-group">
                <label>Mật khẩu</label>
                <div class="auth-input-wrapper">
                  <i class="fas fa-lock"></i>
                  <input type="password" id="custRegPassword" placeholder="Tối thiểu 3 ký tự..." required autocomplete="new-password" minlength="3">
                  <button type="button" class="auth-pwd-toggle" onclick="toggleAuthPasswordVisibility('custRegPassword', this)" title="Hiện/Ẩn mật khẩu" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; color:#94a3b8; padding:0; z-index:3;"><i class="far fa-eye" style="position:static!important; left:auto!important; top:auto!important; transform:none!important; pointer-events:none;"></i></button>
                </div>
              </div>
              <div class="auth-form-group">
                <label>Nhập lại mật khẩu</label>
                <div class="auth-input-wrapper">
                  <i class="fas fa-shield-alt"></i>
                  <input type="password" id="custRegConfirmPassword" placeholder="Nhập lại mật khẩu vừa đặt..." required autocomplete="new-password" minlength="3">
                  <button type="button" class="auth-pwd-toggle" onclick="toggleAuthPasswordVisibility('custRegConfirmPassword', this)" title="Hiện/Ẩn mật khẩu" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); width:32px; height:32px; display:inline-flex; align-items:center; justify-content:center; background:none; border:none; cursor:pointer; color:#94a3b8; padding:0; z-index:3;"><i class="far fa-eye" style="position:static!important; left:auto!important; top:auto!important; transform:none!important; pointer-events:none;"></i></button>
                </div>
              </div>
              <div id="customerRegAlert" class="auth-alert error" style="display:none;"></div>
              <button type="submit" class="btn-auth-submit" id="custRegSubmitBtn">
                <span>TIẾP TỤC & NHẬN MÃ QUA EMAIL</span> <i class="fas fa-paper-plane"></i>
              </button>
            </form>

            <!-- Form Xác Thực Mã OTP qua Email -->
            <form id="customerOtpForm" style="display:none;" onsubmit="handleCustomerOtpSubmit(event)">
              <div style="text-align:center; margin-bottom:18px;">
                <div style="width:52px; height:52px; border-radius:50%; background:rgba(223,186,115,0.12); color:var(--gold); display:flex; align-items:center; justify-content:center; margin:0 auto 10px; font-size:22px; border:1px solid rgba(223,186,115,0.3);">
                  <i class="fas fa-envelope-open-text"></i>
                </div>
                <h4 style="color:#fff; margin:0 0 6px 0; font-size:16px; font-weight:700;">XÁC MINH EMAIL</h4>
                <p style="color:#94a3b8; font-size:12.5px; margin:0; line-height:1.5;">
                  Mã xác thực 6 số đã được gửi đến:<br>
                  <strong id="otpTargetEmail" style="color:var(--gold); font-size:13px;">email@gmail.com</strong>
                </p>
              </div>
              <div class="auth-form-group">
                <label style="text-align:center; display:block; margin-bottom:8px;">Nhập mã xác thực 6 số</label>
                <div class="auth-input-wrapper" style="max-width:240px; margin:0 auto;">
                  <input type="text" id="custRegOtp" placeholder="------" required maxlength="6" pattern="[0-9]{6}" autocomplete="one-time-code" style="text-align:center; font-size:26px; letter-spacing:10px; font-weight:900; color:var(--gold); font-family:monospace; padding:10px 0;">
                </div>
              </div>
              <div id="customerOtpAlert" class="auth-alert error" style="display:none;"></div>
              <button type="submit" class="btn-auth-submit" id="custOtpSubmitBtn">
                <span>XÁC NHẬN & TẠO TÀI KHOẢN</span> <i class="fas fa-check-circle"></i>
              </button>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:14px; font-size:12px;">
                <button type="button" onclick="backToRegisterForm()" style="background:none; border:none; color:#94a3b8; cursor:pointer; padding:0; display:flex; align-items:center; gap:4px;">
                  <i class="fas fa-arrow-left"></i> Sửa thông tin
                </button>
                <button type="button" id="resendOtpBtn" onclick="resendRegisterOtp()" style="background:none; border:none; color:var(--gold); cursor:pointer; padding:0; font-weight:600;">
                  Gửi lại mã (<span id="otpCountdownText">60s</span>)
                </button>
              </div>
            </form>
          </div>
          <div class="auth-modal-footer">
            Bằng việc tiếp tục, bạn đồng ý với <a href="javascript:void(0)" onclick="openBoutiqueModal('policyModal')">Chính sách bảo mật MoonLight</a>
          </div>
        </div>
      </div>

      <!-- MODAL ĐƠN HÀNG CỦA TÔI -->
      <div class="boutique-modal-overlay" id="customerOrdersModal" onclick="if(event.target === this) closeCustomerOrdersModal()">
        <div class="boutique-modal-card" style="max-width:680px;">
          <div class="boutique-modal-header">
            <h3><i class="fas fa-box-open" style="color:var(--gold,#d4af37)"></i> ĐƠN HÀNG CỦA TÔI</h3>
            <button class="boutique-modal-close" onclick="closeCustomerOrdersModal()"><i class="fas fa-times"></i></button>
          </div>
          <div class="boutique-modal-body" id="customerOrdersList" style="max-height:65vh; overflow-y:auto; padding:18px 24px;">
            <div style="text-align:center; padding:30px; color:#888;">
              <i class="fas fa-spinner fa-spin" style="font-size:24px;"></i> Đang tải danh sách đơn hàng...
            </div>
          </div>
        </div>
      </div>
    `
    );
  }

  // 4. Lắng nghe sự kiện click bên ngoài để đóng dropdown menu
  document.addEventListener('click', (e) => {
    const menu = document.getElementById('userDropdownMenu');
    const btn = document.getElementById('navUserBtn');
    if (menu && menu.classList.contains('show')) {
      if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
        menu.classList.remove('show');
      }
    }
  });

  // 5. Cập nhật trạng thái hiển thị của Navbar
  updateCustomerNavbarUI();
}

function updateCustomerNavbarUI() {
  const user = JSON.parse(localStorage.getItem('moonlight_user') || 'null');
  const token = typeof MoonlightAPI !== 'undefined' ? MoonlightAPI.getToken() : localStorage.getItem('moonlight_token');
  const userIcon = document.getElementById('navUserIcon');
  const userDot = document.getElementById('userActiveDot');
  const nameEl = document.getElementById('dropdownUserName');
  const tierEl = document.getElementById('dropdownUserTier');
  const avatarEl = document.getElementById('dropdownUserAvatar');
  const adminLinks = document.querySelectorAll('.admin-only-link, #dropdownAdminLink');

  if (user && token) {
    if (userIcon) userIcon.className = 'fas fa-user-check';
    if (userDot) userDot.style.display = 'block';
    if (nameEl) nameEl.innerText = user.name || user.username || 'Khách hàng';

    // Cập nhật huy hiệu vai trò
    const roleLower = String(user.role || '').toLowerCase();
    const isStaffOrAdmin = ['admin', 'owner', 'staff'].includes(roleLower);

    if (tierEl) {
      if (roleLower === 'admin') {
        tierEl.innerText = 'Quản Trị Viên';
      } else if (roleLower === 'owner') {
        tierEl.innerText = 'Chủ Cửa Hàng';
      } else if (roleLower === 'staff') {
        tierEl.innerText = 'Nhân Viên Cửa Hàng';
      } else {
        tierEl.innerText = user.tier || 'Thành Viên';
      }
    }

    if (avatarEl) {
      if (user.avatar) {
        avatarEl.innerHTML = `<img src="${user.avatar}" alt="${user.name}">`;
      } else {
        avatarEl.innerHTML = `<i class="fas fa-user"></i>`;
      }
    }

    // Hiển thị nút vào trang Admin CHỈ DÀNH RIÊNG cho Admin, Chủ cửa hàng (Owner), và Nhân viên (Staff)
    if (isStaffOrAdmin) {
      if (adminLinks.length > 0) {
        adminLinks.forEach(link => {
          link.style.display = 'flex';
        });
      } else {
        // Tự động chèn nếu trang chưa có sẵn
        const menu = document.getElementById('userDropdownMenu');
        const profileLink = menu?.querySelector('a[href*="profile.html?tab=profile"]');
        if (menu && profileLink) {
          const adminHtml = `<a href="admin.html" class="user-dropdown-item admin-only-link" id="dropdownAdminLink" style="display:flex;"><i class="fas fa-crown"></i> Trang quản trị Admin</a>`;
          profileLink.insertAdjacentHTML('beforebegin', adminHtml);
        }
      }
    } else {
      adminLinks.forEach(link => {
        link.style.display = 'none';
      });
    }
  } else {
    if (userIcon) userIcon.className = 'far fa-user';
    if (userDot) userDot.style.display = 'none';
    const menu = document.getElementById('userDropdownMenu');
    if (menu) menu.classList.remove('show');
    adminLinks.forEach(link => {
      link.style.display = 'none';
    });
  }
}

function handleUserIconClick(event) {
  if (event) event.stopPropagation();
  const token = typeof MoonlightAPI !== 'undefined' ? MoonlightAPI.getToken() : localStorage.getItem('moonlight_token');
  const user = JSON.parse(localStorage.getItem('moonlight_user') || 'null');

  if (token && user) {
    // Nếu đã đăng nhập: bật/tắt dropdown menu
    const menu = document.getElementById('userDropdownMenu');
    if (menu) menu.classList.toggle('show');
  } else {
    // Nếu chưa đăng nhập: mở Auth Modal
    openAuthModal('login');
  }
}

function openAuthModal(tab = 'login') {
  const overlay = document.getElementById('authModalOverlay');
  if (!overlay) return;
  overlay.classList.add('open');
  switchAuthTab(tab);

  // Thử khởi tạo Google Identity Services
  setupGoogleIdentityServices();
}

function closeAuthModal() {
  const overlay = document.getElementById('authModalOverlay');
  if (overlay) overlay.classList.remove('open');
}

let registerOtpCountdownInterval = null;
let pendingRegisterData = null;

function switchAuthTab(tab) {
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegBtn = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('customerLoginForm');
  const regForm = document.getElementById('customerRegisterForm');
  const otpForm = document.getElementById('customerOtpForm');
  const loginAlert = document.getElementById('customerLoginAlert');
  const regAlert = document.getElementById('customerRegAlert');
  const otpAlert = document.getElementById('customerOtpAlert');
  const googleWrapper = document.querySelector('.google-auth-wrapper');
  const authDivider = document.querySelector('.auth-divider');

  if (loginAlert) loginAlert.style.display = 'none';
  if (regAlert) regAlert.style.display = 'none';
  if (otpAlert) otpAlert.style.display = 'none';
  if (otpForm) otpForm.style.display = 'none';
  if (googleWrapper) googleWrapper.style.display = 'block';
  if (authDivider) authDivider.style.display = 'flex';

  if (tab === 'register') {
    if (tabLoginBtn) tabLoginBtn.classList.remove('active');
    if (tabRegBtn) tabRegBtn.classList.add('active');
    if (loginForm) loginForm.style.display = 'none';
    if (regForm) regForm.style.display = 'block';
  } else {
    if (tabRegBtn) tabRegBtn.classList.remove('active');
    if (tabLoginBtn) tabLoginBtn.classList.add('active');
    if (loginForm) loginForm.style.display = 'block';
    if (regForm) regForm.style.display = 'none';
  }
}

function toggleAuthPasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPwd = input.type === 'password';
  input.type = isPwd ? 'text' : 'password';
  const icon = btn.querySelector('i');
  if (icon) {
    icon.className = isPwd ? 'far fa-eye-slash' : 'far fa-eye';
  }
}

async function handleCustomerLoginSubmit(event) {
  event.preventDefault();
  const u = document.getElementById('custLoginUsername').value.trim();
  const p = document.getElementById('custLoginPassword').value.trim();
  const alertBox = document.getElementById('customerLoginAlert');
  const submitBtn = document.getElementById('custLoginSubmitBtn');

  if (!u || !p) return;

  const originalContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG ĐĂNG NHẬP...';
  if (alertBox) alertBox.style.display = 'none';

  try {
    const res = await MoonlightAPI.login(u, p);
    if (res && res.success) {
      updateCustomerNavbarUI();
      closeAuthModal();
      showToast({
        title: 'Đăng nhập thành công',
        message: `Chào mừng ${res.data?.user?.name || u} trở lại với MoonLight!`,
        type: 'success'
      });

      // Tự động đồng bộ giỏ hàng và danh sách yêu thích
      await syncUserDataWithServer();
    } else {
      throw new Error(res?.message || 'Tài khoản hoặc mật khẩu không chính xác.');
    }
  } catch (err) {
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerText = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalContent;
  }
}

async function handleCustomerRegisterStep1(event) {
  event.preventDefault();
  const fullNameEl = document.getElementById('custRegFullName');
  const fullName = fullNameEl ? fullNameEl.value.trim() : '';
  const username = document.getElementById('custRegUsername').value.trim();
  const email = document.getElementById('custRegEmail').value.trim();
  const password = document.getElementById('custRegPassword').value;
  const confirmPassword = document.getElementById('custRegConfirmPassword').value;
  const alertBox = document.getElementById('customerRegAlert');
  const submitBtn = document.getElementById('custRegSubmitBtn');

  if (alertBox) alertBox.style.display = 'none';

  if (!fullName) {
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerText = 'Vui lòng nhập họ và tên đầy đủ của bạn!';
    }
    return;
  }

  if (password !== confirmPassword) {
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerText = 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập!';
    }
    return;
  }

  if (password.length < 3) {
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerText = 'Mật khẩu phải có tối thiểu 3 ký tự!';
    }
    return;
  }

  const originalContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG GỬI MÃ XÁC MINH...';

  try {
    const res = await MoonlightAPI.sendRegisterOtp(username, email);
    if (res && res.success) {
      pendingRegisterData = { name: fullName, username, email, password, confirmPassword };

      // Chuyển sang màn hình nhập mã OTP
      const regForm = document.getElementById('customerRegisterForm');
      const otpForm = document.getElementById('customerOtpForm');
      const googleWrapper = document.querySelector('.google-auth-wrapper');
      const authDivider = document.querySelector('.auth-divider');
      const targetEmailEl = document.getElementById('otpTargetEmail');

      if (regForm) regForm.style.display = 'none';
      if (googleWrapper) googleWrapper.style.display = 'none';
      if (authDivider) authDivider.style.display = 'none';
      if (otpForm) otpForm.style.display = 'block';
      if (targetEmailEl) targetEmailEl.innerText = email;

      const otpInput = document.getElementById('custRegOtp');
      if (otpInput) {
        otpInput.value = '';
        setTimeout(() => otpInput.focus(), 200);
      }

      startOtpCountdown();

      showToast({
        title: 'Đã gửi mã xác minh',
        message: `Mã OTP 6 số đã được gửi tới email: ${email}. Vui lòng kiểm tra hộp thư!`,
        type: 'info'
      });
    } else {
      throw new Error(res?.message || 'Không thể gửi mã xác minh.');
    }
  } catch (err) {
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerText = err.message || 'Lỗi gửi mã xác minh. Vui lòng kiểm tra lại.';
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalContent;
  }
}

async function handleCustomerOtpSubmit(event) {
  event.preventDefault();
  const otpInput = document.getElementById('custRegOtp');
  const otp = otpInput ? otpInput.value.trim() : '';
  const alertBox = document.getElementById('customerOtpAlert');
  const submitBtn = document.getElementById('custOtpSubmitBtn');

  if (!pendingRegisterData || !otp) return;
  if (alertBox) alertBox.style.display = 'none';

  const originalContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ĐANG XÁC MINH...';

  try {
    const res = await MoonlightAPI.verifyRegisterOtp({
      ...pendingRegisterData,
      otp
    });

    if (res && res.success) {
      if (registerOtpCountdownInterval) clearInterval(registerOtpCountdownInterval);
      updateCustomerNavbarUI();
      closeAuthModal();
      showToast({
        title: 'Đăng ký thành công',
        message: `Chào mừng ${res.data?.user?.username || 'bạn'} đã trở thành thành viên MoonLight!`,
        type: 'success'
      });

      pendingRegisterData = null;
      await syncUserDataWithServer();
    } else {
      throw new Error(res?.message || 'Mã xác minh không chính xác.');
    }
  } catch (err) {
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerText = err.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.';
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalContent;
  }
}

function backToRegisterForm() {
  if (registerOtpCountdownInterval) clearInterval(registerOtpCountdownInterval);
  const regForm = document.getElementById('customerRegisterForm');
  const otpForm = document.getElementById('customerOtpForm');
  const googleWrapper = document.querySelector('.google-auth-wrapper');
  const authDivider = document.querySelector('.auth-divider');
  if (otpForm) otpForm.style.display = 'none';
  if (regForm) regForm.style.display = 'block';
  if (googleWrapper) googleWrapper.style.display = 'block';
  if (authDivider) authDivider.style.display = 'flex';
}

async function resendRegisterOtp() {
  if (!pendingRegisterData) return;
  const resendBtn = document.getElementById('resendOtpBtn');
  if (resendBtn && resendBtn.disabled) return;

  try {
    showToast({ title: 'Gửi lại OTP', message: 'Đang gửi lại mã xác minh mới...', type: 'info' });
    const res = await MoonlightAPI.sendRegisterOtp(pendingRegisterData.username, pendingRegisterData.email);
    if (res && res.success) {
      startOtpCountdown();
      showToast({ title: 'Đã gửi mã mới', message: 'Mã xác minh mới đã được gửi tới email của bạn!', type: 'success' });
    } else {
      throw new Error(res?.message || 'Không thể gửi lại mã.');
    }
  } catch (err) {
    showToast({ title: 'Gửi mã thất bại', message: err.message || 'Lỗi gửi mã OTP', type: 'error' });
  }
}

function startOtpCountdown() {
  if (registerOtpCountdownInterval) clearInterval(registerOtpCountdownInterval);
  let seconds = 60;
  const countdownEl = document.getElementById('otpCountdownText');
  const resendBtn = document.getElementById('resendOtpBtn');

  if (resendBtn) {
    resendBtn.disabled = true;
    resendBtn.style.opacity = '0.5';
    resendBtn.style.cursor = 'not-allowed';
  }
  if (countdownEl) countdownEl.innerText = `${seconds}s`;

  registerOtpCountdownInterval = setInterval(() => {
    seconds--;
    if (countdownEl) countdownEl.innerText = `${seconds}s`;
    if (seconds <= 0) {
      clearInterval(registerOtpCountdownInterval);
      if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.style.opacity = '1';
        resendBtn.style.cursor = 'pointer';
        resendBtn.innerHTML = '<i class="fas fa-redo-alt"></i> Gửi lại mã';
      }
    }
  }, 1000);
}

function handleCustomerLogout() {
  if (typeof MoonlightAPI !== 'undefined') {
    MoonlightAPI.logout();
  } else {
    localStorage.removeItem('moonlight_token');
    localStorage.removeItem('moonlight_user');
  }
  updateCustomerNavbarUI();
  showToast({
    title: 'Đã đăng xuất',
    message: 'Bạn đã đăng xuất tài khoản an toàn.',
    type: 'info'
  });
}

// Tải Google Client ID từ backend và thiết lập Google Sign-In
async function initGoogleOAuthFromBackend() {
  if (window.GOOGLE_CLIENT_ID) return window.GOOGLE_CLIENT_ID;
  try {
    const saved = localStorage.getItem('moonlight_google_client_id');
    if (saved) window.GOOGLE_CLIENT_ID = saved;
    if (window.MoonlightAPI && typeof window.MoonlightAPI.getGoogleConfig === 'function') {
      const cfg = await window.MoonlightAPI.getGoogleConfig();
      if (cfg && cfg.clientId) {
        window.GOOGLE_CLIENT_ID = cfg.clientId;
      }
    }
  } catch (e) {}

  if (window.GOOGLE_CLIENT_ID) {
    setupGoogleIdentityServices();
  }
  return window.GOOGLE_CLIENT_ID || '';
}

// Thiết lập Google Identity Services
function setupGoogleIdentityServices() {
  if (typeof window.google === 'undefined' || !window.google.accounts) {
    return;
  }

  if (isGoogleGsiInitialized) return;

  const clientId = window.GOOGLE_CLIENT_ID || '';
  if (!clientId) return;

  try {
    if (window.google.accounts.id) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false
      });
      isGoogleGsiInitialized = true;
    }
  } catch (err) {
    console.warn('[Google GSI] Init warning:', err);
  }
}

async function triggerGoogleSignIn() {
  const alertBox = document.getElementById('customerLoginAlert');
  if (alertBox) alertBox.style.display = 'none';

  const clientId = await initGoogleOAuthFromBackend();

  // 1. NẾU ĐÃ CÓ GOOGLE CLIENT ID: Mở trực tiếp cửa sổ chọn tài khoản Google thật
  if (clientId && typeof window.google !== 'undefined' && window.google.accounts) {
    // A. Mở popup OAuth2 chuẩn Google
    if (window.google.accounts.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (resp) => {
            if (resp && resp.access_token) {
              try {
                showToast({ title: 'Google Sign-In', message: 'Đang xác thực tài khoản Google...', type: 'info' });
                const res = await MoonlightAPI.loginWithGoogle(null, resp.access_token);
                if (res && res.success) {
                  updateCustomerNavbarUI();
                  closeAuthModal();
                  showToast({
                    title: 'Đăng nhập Google thành công',
                    message: `Chào mừng ${res.data?.user?.name || 'quý khách'} đến với MoonLight!`,
                    type: 'success'
                  });
                  await syncUserDataWithServer();
                } else {
                  throw new Error(res?.message || 'Xác thực Google thất bại.');
                }
              } catch (err) {
                if (alertBox) {
                  alertBox.style.display = 'block';
                  alertBox.innerText = err.message || 'Lỗi đăng nhập Google.';
                }
              }
            }
          }
        });
        tokenClient.requestAccessToken();
        return;
      } catch (err) {
        console.warn('OAuth2 popup fallback:', err);
      }
    }

    // B. Fallback qua GSI prompt
    if (window.google.accounts.id) {
      setupGoogleIdentityServices();
      google.accounts.id.prompt();
      return;
    }
  }

  // 2. NẾU CHƯA CÓ CLIENT ID: Mở Modal Hướng dẫn kích hoạt sang trọng
  openGoogleSetupGuideModal();
}

function openGoogleSetupGuideModal() {
  let overlay = document.getElementById('googleGuideOverlay');
  if (!overlay) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="auth-modal-overlay open" id="googleGuideOverlay" style="z-index:100001;" onclick="if(event.target===this)closeGoogleGuideModal()">
        <div class="auth-modal-card" style="max-width:480px;">
          <div class="auth-modal-header" style="text-align:center; display:block; position:relative; padding-bottom:12px;">
            <button class="btn-auth-close" onclick="closeGoogleGuideModal()" style="position:absolute; right:18px; top:18px;">&times;</button>
            <div style="font-size:36px; color:#4285F4; margin-bottom:8px;"><i class="fab fa-google"></i></div>
            <h3 style="margin:0 0 6px 0; font-size:17px; font-weight:700; color:#fff;">KÍCH HOẠT GOOGLE SIGN-IN</h3>
            <p style="margin:0; font-size:12px; color:#94a3b8;">Đăng nhập 1-click bằng tài khoản Gmail thật</p>
          </div>
          <div class="auth-modal-body" style="padding:20px;">
            <p style="font-size:13px; color:#cbd5e1; line-height:1.6; margin-bottom:14px;">
              Để Google cho phép mở cửa sổ đăng nhập Gmail chính thức, website cần có <strong>Google Client ID</strong> (được Google cấp miễn phí trong 1 phút).
            </p>
            <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(223,186,115,0.3); border-radius:8px; padding:14px; margin-bottom:16px;">
              <label style="font-size:12px; font-weight:600; color:var(--gold); display:block; margin-bottom:6px;">
                <i class="fas fa-key"></i> Dán Google Client ID của bạn vào đây:
              </label>
              <input type="text" id="manualGoogleClientIdInput" placeholder="Ví dụ: 123456789-xxx.apps.googleusercontent.com" style="width:100%; padding:10px 12px; background:#0b1120; border:1px solid #334155; border-radius:6px; color:#fff; font-size:12px; margin-bottom:10px; box-sizing:border-box;">
              <button type="button" class="btn-primary" onclick="saveManualGoogleClientIdAndSignIn()" style="width:100%; padding:10px; font-size:12.5px; font-weight:700; justify-content:center; display:flex; align-items:center; gap:8px;">
                <i class="fab fa-google"></i> LƯU & MỞ ĐĂNG NHẬP GOOGLE THẬT
              </button>
            </div>
            <div style="display:flex; gap:10px;">
              <button type="button" class="btn-outline" onclick="runDemoGoogleSignIn()" style="flex:1; font-size:12px; padding:9px; justify-content:center; display:flex; align-items:center; gap:6px;">
                <i class="fas fa-user-check"></i> Đăng nhập thử (Demo)
              </button>
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="btn-outline" style="flex:1; font-size:12px; padding:9px; justify-content:center; display:flex; align-items:center; gap:6px; text-decoration:none; text-align:center;">
                <i class="fas fa-external-link-alt"></i> Lấy Client ID (Free)
              </a>
            </div>
          </div>
        </div>
      </div>
    `);
  } else {
    overlay.classList.add('open');
  }
}

function closeGoogleGuideModal() {
  const overlay = document.getElementById('googleGuideOverlay');
  if (overlay) overlay.classList.remove('open');
}

async function saveManualGoogleClientIdAndSignIn() {
  const input = document.getElementById('manualGoogleClientIdInput');
  const val = input ? input.value.trim() : '';
  if (!val) {
    showToast({ title: 'Thiếu Client ID', message: 'Vui lòng dán chuỗi Google Client ID vào ô.', type: 'warning' });
    return;
  }
  localStorage.setItem('moonlight_google_client_id', val);
  window.GOOGLE_CLIENT_ID = val;
  isGoogleGsiInitialized = false;
  setupGoogleIdentityServices();
  closeGoogleGuideModal();
  showToast({ title: 'Đã lưu Google Client ID', message: 'Đang mở cửa sổ đăng nhập Google...', type: 'success' });
  setTimeout(() => { triggerGoogleSignIn(); }, 400);
}

async function runDemoGoogleSignIn() {
  closeGoogleGuideModal();
  const demoEmail = 'khachhang.luxury@gmail.com';
  const mockPayload = {
    sub: 'google_sub_' + Math.abs(hashCode(demoEmail)),
    email: demoEmail,
    name: 'Khách Hàng Google (Demo)',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    email_verified: true
  };
  const headerB64 = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payloadB64 = btoa(unescape(encodeURIComponent(JSON.stringify(mockPayload))));
  const mockCredential = `${headerB64}.${payloadB64}.mock_signature`;
  await handleGoogleCredentialResponse({ credential: mockCredential });
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

async function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) return;

  const alertBox = document.getElementById('customerLoginAlert');
  if (alertBox) alertBox.style.display = 'none';

  try {
    showToast({ title: 'Xác thực Google', message: 'Đang kết nối tài khoản Google...', type: 'info' });
    const res = await MoonlightAPI.loginWithGoogle(response.credential);
    if (res && res.success) {
      updateCustomerNavbarUI();
      closeAuthModal();
      showToast({
        title: 'Đăng nhập Google thành công',
        message: `Chào mừng ${res.data?.user?.name || 'quý khách'} đến với MoonLight!`,
        type: 'success'
      });
      await syncUserDataWithServer();
    } else {
      throw new Error(res?.message || 'Xác thực Google không thành công.');
    }
  } catch (err) {
    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerText = err.message || 'Không thể đăng nhập bằng Google lúc này.';
    }
  }
}

// Đồng bộ dữ liệu giỏ hàng & danh sách yêu thích giữa trình duyệt và server
async function syncUserDataWithServer() {
  try {
    const localCart = JSON.parse(localStorage.getItem('moonlight_cart') || '[]');
    const localWl = getWishlistIds();
    const res = await MoonlightAPI.syncCustomerData(localCart, localWl);
    if (res && res.data) {
      // Nếu server có dữ liệu giỏ hàng mới hơn, cập nhật lại
      if (Array.isArray(res.data.cart) && res.data.cart.length > 0) {
        localStorage.setItem('moonlight_cart', JSON.stringify(res.data.cart));
        updateCartIcon();
      }
      if (Array.isArray(res.data.wishlist) && res.data.wishlist.length > 0) {
        localStorage.setItem('moonlight_wishlist', JSON.stringify(res.data.wishlist));
        updateWishlistIcon();
      }
    }
  } catch (e) {
    console.warn('[Sync] Sync failed:', e);
  }
}

// Mở trang Đơn Hàng Của Tôi (Trang riêng biệt profile.html)
function openCustomerOrdersModal() {
  window.location.href = 'profile.html?tab=orders';
}

async function legacyCustomerOrdersModal() {
  const modal = document.getElementById('customerOrdersModal');
  const container = document.getElementById('customerOrdersList');
  if (!modal || !container) return;

  modal.classList.add('open');
  const user = JSON.parse(localStorage.getItem('moonlight_user') || 'null');

  if (!user) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:#888;">
        <i class="far fa-user" style="font-size:40px; margin-bottom:12px; opacity:0.4;"></i>
        <p>Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn.</p>
        <button class="btn-primary" onclick="closeCustomerOrdersModal(); openAuthModal('login');" style="margin-top:12px;">ĐĂNG NHẬP NGAY</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="text-align:center; padding:30px; color:#888;">
      <i class="fas fa-spinner fa-spin" style="font-size:24px;"></i> Đang tải đơn hàng...
    </div>
  `;

  try {
    let orders = [];
    if (typeof MoonlightAPI !== 'undefined') {
      const res = await MoonlightAPI.getOrders({ search: user.phone || user.username || user.email || '' });
      if (res && res.data) {
        orders = Array.isArray(res.data) ? res.data : (res.data.items || []);
      }
    }

    if (orders.length === 0) {
      // Tìm trong localStorage fallback
      const localOrders = JSON.parse(localStorage.getItem('moonlight_all_orders') || '[]');
      orders = localOrders.filter((o) => {
        const cPhone = o.customer?.phone || '';
        const cName = o.customer?.name || '';
        return (user.phone && cPhone === user.phone) || (user.name && cName.includes(user.name));
      });
    }

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; color:#888;">
          <i class="fas fa-box-open" style="font-size:42px; margin-bottom:12px; opacity:0.35;"></i>
          <h4 style="color:#333; margin-bottom:6px;">Bạn chưa có đơn hàng nào</h4>
          <p style="font-size:13px;">Hãy khám phá các bộ sưu tập thời trang cao cấp của MoonLight ngay!</p>
          <a href="catalog.html" class="btn-primary" style="display:inline-flex; margin-top:14px; padding:10px 24px; text-decoration:none; font-size:12px;">XEM BỘ SƯU TẬP</a>
        </div>
      `;
      return;
    }

    const statusMap = {
      pending: { text: 'Chờ xác nhận', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
      confirmed: { text: 'Đã xác nhận', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
      shipping: { text: 'Đang giao hàng', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
      completed: { text: 'Giao thành công', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
      cancelled: { text: 'Đã hủy đơn', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' }
    };

    container.innerHTML = orders
      .map((o) => {
        const st = statusMap[o.status] || { text: o.status, color: '#64748b', bg: '#f1f5f9' };
        const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : (o.date || 'Gần đây');
        const itemsList = (o.items || [])
          .map((it) => `${it.productName || it.name || 'Sản phẩm'} (${it.variant || ''}) x${it.quantity || 1}`)
          .join(', ');

        return `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <strong style="color:#0f172a; font-family:monospace; font-size:13.5px;">${o.orderCode || '#' + (o._id || o.id).toString().slice(-6)}</strong>
              <span style="background:${st.bg}; color:${st.color}; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:700;">${st.text}</span>
            </div>
            <div style="font-size:12.5px; color:#64748b; margin-bottom:8px; line-height:1.5;">${itemsList || 'Chi tiết đơn hàng'}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; border-top:1px dashed #e2e8f0; padding-top:8px;">
              <span style="color:#94a3b8;">${dateStr} · ${o.paymentMethod === 'banking' ? 'Chuyển khoản' : 'COD'}</span>
              <strong style="color:var(--gold,#d4af37); font-size:14px;">${Number(o.total || 0).toLocaleString('vi-VN')}₫</strong>
            </div>
          </div>
        `;
      })
      .join('');
  } catch (err) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px; color:#ef4444;">
        <i class="fas fa-exclamation-circle" style="font-size:24px; margin-bottom:8px;"></i>
        <p>Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.</p>
      </div>
    `;
  }
}

function closeCustomerOrdersModal() {
  const modal = document.getElementById('customerOrdersModal');
  if (modal) modal.classList.remove('open');
}

// Tự động đánh dấu mục active trên Header Menu phù hợp theo trang hiện tại
function highlightActiveNavMenu() {
  const menuLinks = document.querySelectorAll('#navbar .menu > a, .menu a');
  if (!menuLinks || menuLinks.length === 0) return;

  const path = window.location.pathname.toLowerCase();
  const search = window.location.search.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  // Xóa class active cũ
  menuLinks.forEach(link => link.classList.remove('active'));

  let matchedLink = null;

  if (hash === '#footer') {
    matchedLink = Array.from(menuLinks).find(l => (l.getAttribute('href') || '').includes('#footer'));
  } else if (path.includes('try-on')) {
    matchedLink = Array.from(menuLinks).find(l => (l.getAttribute('href') || '').includes('try-on'));
  } else if (search.includes('gender=nam')) {
    matchedLink = Array.from(menuLinks).find(l => (l.getAttribute('href') || '').includes('gender=Nam') || (l.getAttribute('href') || '').includes('gender=nam'));
  } else if (search.includes('gender=nu')) {
    matchedLink = Array.from(menuLinks).find(l => (l.getAttribute('href') || '').includes('gender=Nu') || (l.getAttribute('href') || '').includes('gender=nu'));
  } else if (path.includes('catalog') || path.includes('product')) {
    matchedLink = Array.from(menuLinks).find(l => {
      const href = l.getAttribute('href') || '';
      return href.startsWith('catalog.html') && !href.includes('gender=');
    });
  } else if (path.endsWith('/') || path.includes('index.html') || path === '') {
    matchedLink = Array.from(menuLinks).find(l => {
      const href = l.getAttribute('href') || '';
      return href === 'index.html' || href === '/' || href === './index.html';
    });
  }

  if (matchedLink) {
    matchedLink.classList.add('active');
  }
}

window.selectCheckoutSavedAddress = selectCheckoutSavedAddress;
window.renderCheckoutAddressPicker = renderCheckoutAddressPicker;
window.highlightActiveNavMenu = highlightActiveNavMenu;
window.toggleAuthPasswordVisibility = toggleAuthPasswordVisibility;

// Khởi chạy ngay lập tức nếu DOM đã sẵn sàng
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initCustomerAuthUI();
  highlightActiveNavMenu();
  setupScrollEffects();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    highlightActiveNavMenu();
    setupScrollEffects();
  });
}