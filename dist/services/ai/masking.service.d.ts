/**
 * 🎭 MOONLIGHT AI - CLOTH MASK SERVICE
 * Tạo mặt nạ trang phục chính xác (Cloth Inpainting Mask):
 * - Tách bóc lớp áo/váy cũ của người mẫu
 * - Làm mềm viền (Anti-aliasing feathering)
 * - Khử lem màu áo cũ vào da thịt và nền xung quanh
 */
import { HumanParsingResult } from './parsing.service.js';
import { GarmentAnalysisResult, WorkflowDecision } from './analyzer.service.js';
export interface ClothMaskResult {
    maskType: 'upper_body_mask' | 'full_body_mask' | 'lower_body_mask' | 'footwear_mask';
    featherRadiusPx: number;
    antiBleedErosionPx: number;
    collarContourPreserved: boolean;
    maskCoverageRatio: number;
    maskConfidence: number;
}
export declare class AIMaskingService {
    /**
     * Tạo mặt nạ vùng trang phục cần thay thế
     */
    static generateClothMask(parsing: HumanParsingResult, garment: GarmentAnalysisResult, workflow: WorkflowDecision, refinementPass?: number): Promise<ClothMaskResult>;
}
