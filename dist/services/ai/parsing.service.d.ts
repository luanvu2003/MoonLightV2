/**
 * 👤 MOONLIGHT AI - HUMAN PARSING SERVICE
 * Phân tách các phân đoạn giải phẫu cơ thể người (Anatomy Segmentation):
 * - Đầu, tóc, khuôn mặt (Bảo tồn 100%)
 * - Vùng cổ, ngực, cánh tay, bàn tay (Bảo tồn màu da & cử chỉ)
 * - Vùng trang phục hiện tại (Chuyển tiếp cho Cloth Masking)
 */
import { PersonAnalysisResult } from './analyzer.service.js';
export interface HumanParsingResult {
    parsedSegments: {
        headAndHair: {
            protected: boolean;
            confidence: number;
        };
        neckSkin: {
            protected: boolean;
            confidence: number;
        };
        armsAndHands: {
            protected: boolean;
            confidence: number;
        };
        currentClothingRegion: {
            replace: boolean;
            bounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            };
        };
        legsAndFeet: {
            protected: boolean;
            confidence: number;
        };
        background: {
            preserved: boolean;
            confidence: number;
        };
    };
    keyAnatomyPoints: {
        chinY: number;
        throatCenter: {
            x: number;
            y: number;
        };
        leftCollarBone: {
            x: number;
            y: number;
        };
        rightCollarBone: {
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
        waistLineY: number;
    };
    parsingConfidence: number;
}
export declare class AIParsingService {
    /**
     * Thực hiện phân đoạn giải phẫu cơ thể người
     */
    static parseHumanBody(personImage: string, personAnalysis: PersonAnalysisResult): Promise<HumanParsingResult>;
}
