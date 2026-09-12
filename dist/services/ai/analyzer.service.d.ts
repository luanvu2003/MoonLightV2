/**
 * 🧠 MOONLIGHT AI AGENT - ANALYZER SERVICE
 * Chịu trách nhiệm:
 * 1. Phân tích ảnh người mẫu/khách hàng (Pose, Dáng người, Giới tính, Khung xương)
 * 2. Phân tích trang phục may đo (Danh mục, Chất liệu, Kiểu cổ áo, Phom dáng)
 * 3. Lựa chọn Workflow xử lý chuyên biệt (Workflow Selector)
 */
export interface PersonAnalysisResult {
    gender: 'male' | 'female' | 'unisex';
    bodyType: 'tall_athletic' | 'slim_standard' | 'petite' | 'broad_shoulders';
    poseOrientation: 'front_facing' | 'slight_angle' | 'full_body';
    shoulderWidthRatio: number;
    torsoHeightRatio: number;
    hasClearFace: boolean;
    backgroundComplexity: 'clean' | 'studio' | 'complex';
    keypointsEstimated: {
        neck: {
            x: number;
            y: number;
        };
        leftShoulder: {
            x: number;
            y: number;
        };
        rightShoulder: {
            x: number;
            y: number;
        };
        chestCenter: {
            x: number;
            y: number;
        };
        hipCenter: {
            x: number;
            y: number;
        };
    };
}
export interface GarmentAnalysisResult {
    category: 'vest_suit' | 'silk_shirt' | 'evening_dress' | 'trousers' | 'shoes' | 'outerwear_coat';
    fabricType: 'italian_wool' | 'mulberry_silk' | 'royal_velvet' | 'cashmere' | 'cotton_linen' | 'genuine_leather';
    sleeveLength: 'long_sleeve' | 'short_sleeve' | 'sleeveless' | 'none';
    collarStyle: 'notch_lapel' | 'peak_lapel' | 'spread_collar' | 'band_collar' | 'v_neck' | 'none';
    silhouette: 'slim_fit' | 'tailored_fit' | 'flowing_gown' | 'structured' | 'classic_loafer';
    dominantColors: string[];
    requiresFullBodyMask: boolean;
}
export interface WorkflowDecision {
    workflowId: 'tailored_suit_workflow' | 'silk_shirt_workflow' | 'evening_dress_workflow' | 'tailored_pants_workflow' | 'royal_footwear_workflow' | 'haute_couture_general_workflow';
    workflowName: string;
    description: string;
    targetResolution: string;
    recommendedMaskFeathering: number;
    warpStrength: number;
    lightingBalanceFactor: number;
}
export declare class AIAnalyzerService {
    /**
     * 1. Phân tích ảnh người mẫu / khách hàng tải lên
     */
    static analyzePerson(personImage: string, modelGender?: string): Promise<PersonAnalysisResult>;
    /**
     * 2. Phân tích trang phục được chọn từ bộ sưu tập MoonLight
     */
    static analyzeGarment(garmentImage: string, product?: any): Promise<GarmentAnalysisResult>;
    /**
     * 3. AI Agent lựa chọn Workflow tối ưu dựa trên phân tích ảnh người và trang phục
     */
    static selectWorkflow(person: PersonAnalysisResult, garment: GarmentAnalysisResult): WorkflowDecision;
}
