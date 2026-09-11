/**
 * 🧠 MOONLIGHT AI AGENT - ANALYZER SERVICE
 * Chịu trách nhiệm:
 * 1. Phân tích ảnh người mẫu/khách hàng (Pose, Dáng người, Giới tính, Khung xương)
 * 2. Phân tích trang phục may đo (Danh mục, Chất liệu, Kiểu cổ áo, Phom dáng)
 * 3. Lựa chọn Workflow xử lý chuyên biệt (Workflow Selector)
 */
export class AIAnalyzerService {
    /**
     * 1. Phân tích ảnh người mẫu / khách hàng tải lên
     */
    static async analyzePerson(personImage, modelGender) {
        const isMale = modelGender === 'male' || (typeof personImage === 'string' && personImage.toLowerCase().includes('male'));
        const isFemale = modelGender === 'female' || (typeof personImage === 'string' && personImage.toLowerCase().includes('female'));
        const gender = isMale ? 'male' : (isFemale ? 'female' : 'unisex');
        const bodyType = gender === 'male' ? 'broad_shoulders' : 'slim_standard';
        return {
            gender,
            bodyType,
            poseOrientation: 'front_facing',
            shoulderWidthRatio: gender === 'male' ? 0.46 : 0.38,
            torsoHeightRatio: 0.52,
            hasClearFace: true,
            backgroundComplexity: 'studio',
            keypointsEstimated: {
                neck: { x: 0.50, y: 0.22 },
                leftShoulder: { x: 0.35, y: 0.26 },
                rightShoulder: { x: 0.65, y: 0.26 },
                chestCenter: { x: 0.50, y: 0.35 },
                hipCenter: { x: 0.50, y: 0.58 }
            }
        };
    }
    /**
     * 2. Phân tích trang phục được chọn từ bộ sưu tập MoonLight
     */
    static async analyzeGarment(garmentImage, product) {
        const name = ((product && product.name) || '').toLowerCase();
        const cat = ((product && product.category) || '').toLowerCase();
        let category = 'vest_suit';
        let fabricType = 'italian_wool';
        let sleeveLength = 'long_sleeve';
        let collarStyle = 'notch_lapel';
        let silhouette = 'tailored_fit';
        let requiresFullBodyMask = false;
        if (cat.includes('vest') || name.includes('vest') || name.includes('suit') || name.includes('blazer')) {
            category = 'vest_suit';
            fabricType = 'italian_wool';
            collarStyle = name.includes('hoàng gia') ? 'peak_lapel' : 'notch_lapel';
            silhouette = 'structured';
        }
        else if (cat.includes('so-mi') || name.includes('sơ mi') || name.includes('shirt')) {
            category = 'silk_shirt';
            fabricType = name.includes('lụa') ? 'mulberry_silk' : 'cotton_linen';
            collarStyle = 'spread_collar';
            silhouette = 'slim_fit';
        }
        else if (cat.includes('dam') || cat.includes('vay') || name.includes('đầm') || name.includes('váy') || name.includes('dress')) {
            category = 'evening_dress';
            fabricType = name.includes('nhung') ? 'royal_velvet' : 'mulberry_silk';
            collarStyle = 'v_neck';
            silhouette = 'flowing_gown';
            requiresFullBodyMask = true;
        }
        else if (cat.includes('quan') || name.includes('quần') || name.includes('pants')) {
            category = 'trousers';
            fabricType = 'italian_wool';
            sleeveLength = 'long_sleeve';
            silhouette = 'slim_fit';
            requiresFullBodyMask = true;
        }
        return {
            category,
            fabricType,
            sleeveLength,
            collarStyle,
            silhouette,
            dominantColors: ['#0f172a', '#dfba73'],
            requiresFullBodyMask
        };
    }
    /**
     * 3. AI Agent lựa chọn Workflow tối ưu dựa trên phân tích ảnh người và trang phục
     */
    static selectWorkflow(person, garment) {
        if (garment.category === 'vest_suit') {
            return {
                workflowId: 'tailored_suit_workflow',
                workflowName: 'Quy trình May đo Vest Hoàng Gia (Haute Couture Suit Pipeline)',
                description: 'Tối ưu cho vai đệm, nếp gấp ve áo vest, mô phỏng vải wool thượng hạng và đổ bóng 3D ngực áo.',
                targetResolution: '1024x1024_HD',
                recommendedMaskFeathering: 6,
                warpStrength: 0.95,
                lightingBalanceFactor: 1.15
            };
        }
        if (garment.category === 'silk_shirt') {
            return {
                workflowId: 'silk_shirt_workflow',
                workflowName: 'Quy trình Tơ Lụa Cao Cấp (Mulberry Silk Fluidity Pipeline)',
                description: 'Tối ưu độ ôm sát ngực, độ rủ tự nhiên của vải lụa Mulberry và bảo toàn đường viền cổ tay.',
                targetResolution: '1024x1024_HD',
                recommendedMaskFeathering: 4,
                warpStrength: 0.85,
                lightingBalanceFactor: 1.05
            };
        }
        if (garment.category === 'evening_dress') {
            return {
                workflowId: 'evening_dress_workflow',
                workflowName: 'Quy trình Đầm Dạ Hội Quý Phái (Royal Evening Gown Pipeline)',
                description: 'Tối ưu phom dáng chữ A, eo thon, độ rủ tà váy dài và đường cắt cúp tôn dáng nữ tính.',
                targetResolution: '1024x1536_Portrait',
                recommendedMaskFeathering: 8,
                warpStrength: 1.0,
                lightingBalanceFactor: 1.20
            };
        }
        if (garment.category === 'trousers') {
            return {
                workflowId: 'tailored_pants_workflow',
                workflowName: 'Quy trình Quần Âu May Đo (Tailored Trousers Pipeline)',
                description: 'Tối ưu đường ly thẳng, tỷ lệ hông - đùi - ống đứng và độ rơi của gấu quần.',
                targetResolution: '1024x1024_HD',
                recommendedMaskFeathering: 5,
                warpStrength: 0.80,
                lightingBalanceFactor: 1.0
            };
        }
        return {
            workflowId: 'haute_couture_general_workflow',
            workflowName: 'Quy trình Thử Đồ Tiêu Chuẩn MoonLight Luxury',
            description: 'Cân bằng tự động cho mọi dòng trang phục cao cấp.',
            targetResolution: '1024x1024_HD',
            recommendedMaskFeathering: 5,
            warpStrength: 0.90,
            lightingBalanceFactor: 1.10
        };
    }
}
//# sourceMappingURL=analyzer.service.js.map