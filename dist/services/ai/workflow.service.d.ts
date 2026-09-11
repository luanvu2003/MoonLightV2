/**
 * 🚀 MOONLIGHT AI - VIRTUAL TRY-ON WORKFLOW ORCHESTRATOR
 * Điều phối luồng toàn diện theo sơ đồ kiến trúc hệ thống:
 * Website Shop -> AI Agent (Phân tích ảnh + Phân tích áo + Chọn Workflow)
 *              -> Human Parsing
 *              -> Cloth Mask
 *              -> Virtual Try-On Model
 *              -> Quality Check (PASS -> Result / FAIL -> Retry)
 *              -> Website Shop Output
 */
import { PersonAnalysisResult, GarmentAnalysisResult, WorkflowDecision } from './analyzer.service.js';
import { HumanParsingResult } from './parsing.service.js';
import { ClothMaskResult } from './masking.service.js';
import { QualityCheckResult } from './quality.service.js';
export interface PipelineStageEvent {
    stageId: 'person_analysis' | 'garment_analysis' | 'workflow_selection' | 'human_parsing' | 'cloth_masking' | 'vton_model' | 'quality_check';
    title: string;
    description: string;
    status: 'passed' | 'retrying' | 'completed';
    durationMs: number;
    details?: any;
}
export interface TryOnPipelineResult {
    status: 'completed';
    provider: string;
    resultImage: string;
    originalImage: string;
    garmentImage: string;
    product?: any;
    workflow: WorkflowDecision;
    analysis: {
        person: PersonAnalysisResult;
        garment: GarmentAnalysisResult;
    };
    humanParsing: HumanParsingResult;
    clothMask: ClothMaskResult;
    qualityCheck: QualityCheckResult;
    pipelineStages: PipelineStageEvent[];
    retryCount: number;
    totalDurationMs: number;
    meta: {
        confidenceScore: number;
        bodyPoseMatched: boolean;
        fabricLightingAdjusted: boolean;
    };
}
export declare class AIWorkflowService {
    /**
     * Thực thi toàn bộ quy trình Virtual Try-On theo chuẩn kiến trúc
     */
    static runTryOnWorkflow(params: {
        personImage: string;
        garmentImage: string;
        product?: any;
        modelGender?: string;
        vtonModelCaller: (personImage: string, garmentImage: string, workflow: WorkflowDecision, garmentDesc: string, mask: ClothMaskResult, attempt: number) => Promise<{
            resultUrl: string;
            provider: string;
        }>;
    }): Promise<TryOnPipelineResult>;
}
