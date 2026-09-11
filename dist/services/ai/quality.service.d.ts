/**
 * 🔍 MOONLIGHT AI - QUALITY CHECK SERVICE
 * Kiểm định chất lượng ảnh thử đồ đầu ra (Quality Assurance Gate):
 * - Đánh giá độ khớp viền cổ, viền vai và cánh tay
 * - Kiểm tra độ sắc nét chi tiết chất liệu vải
 * - Đo lường độ cân bằng ánh sáng 3D
 * - Quyết định: PASS (Đạt chuẩn -> Xuất kết quả) hay FAIL (Chưa đạt -> Tự động Retry)
 */
import { WorkflowDecision, GarmentAnalysisResult, PersonAnalysisResult } from './analyzer.service.js';
import { ClothMaskResult } from './masking.service.js';
export interface QualityCheckResult {
    passed: boolean;
    decision: 'PASS' | 'FAIL_RETRY';
    overallScore: number;
    metrics: {
        boundaryAlignment: number;
        fabricDetailResolution: number;
        lightingConsistency: number;
        poseIntegrity: number;
        artifactSuppression: number;
    };
    feedback: string[];
    retryRecommended: boolean;
    adjustmentParameters?: {
        extraFeathering: number;
        lightingCorrection: number;
        warpMultiplier: number;
    };
}
export declare class AIQualityService {
    /**
     * Ngưỡng tiêu chuẩn MoonLight Haute Couture để PASS (Tối thiểu 90%)
     */
    static PASS_THRESHOLD: number;
    /**
     * Kiểm định chất lượng ảnh kết quả
     */
    static evaluateQuality(hasResultImage: boolean, provider: string, person: PersonAnalysisResult, garment: GarmentAnalysisResult, mask: ClothMaskResult, workflow: WorkflowDecision, attemptNumber?: number): QualityCheckResult;
}
