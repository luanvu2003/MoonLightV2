import os
import time
import base64
import requests
from pathlib import Path
from typing import Dict, Any, Optional
import logging

from backend.config.settings import settings
from backend.agent.analyzer import Analyzer, PersonAnalysis, GarmentAnalysis
from backend.agent.workflow import WorkflowSelector, WorkflowDecision
from backend.ai.parsing import HumanParser, HumanParsingResult
from backend.ai.masking import ClothMaskGenerator, ClothMaskResult
from backend.ai.vton import VTONEngine
from backend.ai.quality import QualityEvaluator, QualityCheckResult

logger = logging.getLogger("TryOnAgent")

class TryOnAgent:
    @staticmethod
    def _resolve_image_to_path(img_src: str, prefix: str = "img") -> str:
        """
        Chuyển đổi Base64, URL hoặc Local Path thành file ảnh cục bộ
        """
        timestamp = int(time.time() * 1000)
        
        # 1. Base64
        if img_src.startswith("data:image"):
            try:
                header, encoded = img_src.split(",", 1)
                ext = "png" if "png" in header else "jpg"
                file_path = str(settings.STORAGE_UPLOADS_DIR / f"{prefix}_{timestamp}.{ext}")
                with open(file_path, "wb") as fh:
                    fh.write(base64.b64decode(encoded))
                return file_path
            except Exception as e:
                logger.error(f"Lỗi decode base64: {e}")

        # 2. Check if local path or URL points to a file on this server
        from urllib.parse import urlparse
        if img_src.startswith("http://") or img_src.startswith("https://"):
            clean_path = urlparse(img_src).path.lstrip("/")
        else:
            clean_path = img_src.lstrip("/")

        candidate_paths = [
            settings.WORKSPACE_ROOT / clean_path,
            settings.WORKSPACE_ROOT / "public" / clean_path,
            Path(clean_path)
        ]
        for p in candidate_paths:
            if p.exists():
                if prefix == "garment":
                    p_cutout = p.parent / f"{p.stem}_cutout.png"
                    if p_cutout.exists():
                        logger.info(f"✨ [Path Resolver] Sử dụng cutout chất lượng cao: {p_cutout}")
                        return str(p_cutout)
                return str(p)

        # 3. Download external HTTP/HTTPS URL if not on local disk
        if img_src.startswith("http://") or img_src.startswith("https://"):
            try:
                ext = "png" if ".png" in img_src.lower() else "jpg"
                file_path = str(settings.STORAGE_UPLOADS_DIR / f"{prefix}_{timestamp}.{ext}")
                resp = requests.get(img_src, timeout=30)
                if resp.status_code == 200:
                    with open(file_path, "wb") as fh:
                        fh.write(resp.content)
                    return file_path
            except Exception as e:
                logger.error(f"Lỗi tải ảnh từ URL: {e}")

        return img_src

    @classmethod
    def execute_workflow(
        cls,
        person_image_src: str,
        garment_image_src: str,
        product_meta: Optional[Dict[str, Any]] = None,
        model_gender: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Thực thi Master AI Virtual Try-On Pipeline theo sơ đồ 7 bước
        """
        start_time = time.time()
        pipeline_stages = []

        # Chuẩn hóa đường dẫn file
        person_path = cls._resolve_image_to_path(person_image_src, prefix="person")
        garment_path = cls._resolve_image_to_path(garment_image_src, prefix="garment")

        if not product_meta:
            product_meta = {
                "name": "Trang Phục May Đo MoonLight",
                "price": 2850000,
                "category": "Thời trang cao cấp"
            }

        # ── BƯỚC 1: AI AGENT - PHÂN TÍCH ẢNH & ÁO ──
        t0 = time.time()
        person_analysis = Analyzer.analyze_person(person_path, model_gender)
        garment_analysis = Analyzer.analyze_garment(garment_path, product_meta)
        pipeline_stages.append({
            "stageId": "analysis",
            "title": "AI Agent · Phân tích ảnh người & trang phục",
            "durationMs": int((time.time() - t0) * 1000),
            "status": "passed"
        })

        # ── BƯỚC 2: CHỌN WORKFLOW TỐI ƯU ──
        t1 = time.time()
        workflow = WorkflowSelector.select_workflow(person_analysis, garment_analysis)
        pipeline_stages.append({
            "stageId": "workflow",
            "title": f"Workflow Engine · {workflow.name}",
            "durationMs": int((time.time() - t1) * 1000),
            "status": "passed"
        })

        # ── BƯỚC 3: HUMAN PARSING ──
        t2 = time.time()
        parsing_result = HumanParser.parse_body(person_path, person_analysis)
        pipeline_stages.append({
            "stageId": "parsing",
            "title": "Human Parsing · Phân đoạn giải phẫu & bảo vệ khuôn mặt",
            "durationMs": int((time.time() - t2) * 1000),
            "status": "passed"
        })

        # ── BƯỚC 4, 5, 6: CLOTH MASK + VTON + QUALITY CHECK + RETRY LOOP ──
        max_attempts = 2
        attempt = 1
        final_result_path = ""
        provider = ""
        quality_check = None

        while attempt <= max_attempts:
            # Cloth Mask
            t_mask = time.time()
            cloth_mask = ClothMaskGenerator.generate_mask(
                person_path, parsing_result, garment_analysis, workflow, attempt
            )
            pipeline_stages.append({
                "stageId": "mask",
                "title": f"Cloth Mask · Tạo mặt nạ khử lem viền (Lần {attempt})",
                "durationMs": int((time.time() - t_mask) * 1000),
                "status": "passed"
            })

            # VTON Model
            t_vton = time.time()
            final_result_path, provider = VTONEngine.run_vton(
                person_path,
                garment_path,
                cloth_mask,
                workflow,
                garment_desc=garment_analysis.description,
                attempt=attempt
            )
            pipeline_stages.append({
                "stageId": "vton",
                "title": f"VTON Model · Chạy Neural Model ({provider})",
                "durationMs": int((time.time() - t_vton) * 1000),
                "status": "passed"
            })

            # Quality Check
            t_qc = time.time()
            quality_check = QualityEvaluator.evaluate(
                final_result_path, workflow, provider, attempt
            )
            pipeline_stages.append({
                "stageId": "quality",
                "title": f"Quality Check · Đạt {quality_check.overall_score}% ({quality_check.decision})",
                "durationMs": int((time.time() - t_qc) * 1000),
                "status": "passed" if quality_check.passed else "retried"
            })

            if quality_check.passed or attempt >= max_attempts:
                break
            attempt += 1

        # Chuyển đổi đường dẫn ảnh kết quả thành URL công khai
        res_filename = Path(final_result_path).name
        public_url = f"/uploads/tryon/{res_filename}"

        return {
            "status": "completed",
            "provider": provider,
            "resultImage": public_url,
            "originalImage": person_image_src,
            "garmentImage": garment_image_src,
            "product": product_meta,
            "workflow": {
                "workflowId": workflow.workflow_id,
                "workflowName": workflow.name,
                "name": workflow.name,
                "description": workflow.description,
                "targetResolution": workflow.target_resolution,
                "warpStrength": workflow.warp_strength,
                "denoiseSteps": workflow.denoise_steps
            },
            "qualityCheck": {
                "score": quality_check.overall_score if quality_check else 96.5,
                "overallScore": quality_check.overall_score if quality_check else 96.5,
                "decision": quality_check.decision if quality_check else "PASS",
                "metrics": {
                    "collarAlignment": quality_check.metrics.collar_alignment if quality_check else 98.2,
                    "fabricTextureRetention": quality_check.metrics.fabric_texture_retention if quality_check else 97.5,
                    "lightingConsistency": quality_check.metrics.lighting_consistency if quality_check else 96.8,
                    "boundarySmoothness": quality_check.metrics.boundary_smoothness if quality_check else 97.0
                },
                "details": quality_check.details if quality_check else "Chất lượng đạt chuẩn MoonLight Luxury."
            },
            "analysis": {
                "person": person_analysis.dict(),
                "garment": garment_analysis.dict()
            },
            "pipelineStages": pipeline_stages,
            "totalDurationMs": int((time.time() - start_time) * 1000)
        }
