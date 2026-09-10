import { GenderCategory } from '../types/enums.js';
export declare const LUXURY_PRODUCTS: {
    _id: string;
    id: number;
    name: string;
    description: string;
    category: string;
    type: string;
    gender: GenderCategory;
    style: string;
    price: number;
    originalPrice: number;
    image: string;
    images: string[];
    rating: number;
    sold: number;
    salePercent: number;
    badge: string;
    variants: {
        color: string;
        colorCode: string;
        hex: string;
        img: string;
        images: string[];
        price: number;
        sizes: {
            name: string;
            size: string;
            stock: number;
        }[];
    }[];
    isActive: boolean;
}[];
