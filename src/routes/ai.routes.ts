import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';

const router = Router();

// GET /api/v1/ai/sample-models -> Lấy danh sách người mẫu chuẩn có sẵn
router.get('/sample-models', AIController.getSampleModels);

// POST /api/v1/ai/try-on -> AI Virtual Try-On: Ghép đồ thời trang lên người mẫu / người dùng
router.post('/try-on', AIController.tryOn);

export default router;
