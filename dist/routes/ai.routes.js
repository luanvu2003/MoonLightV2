import { Router } from 'express';
import { AIController } from '../controllers/ai.controller.js';
const router = Router();
// GET /api/v1/ai/sample-models -> Lấy danh sách người mẫu chuẩn có sẵn
router.get('/sample-models', AIController.getSampleModels);
// GET /api/v1/ai/workflows -> Lấy danh sách các AI Workflows may đo chuyên biệt
router.get('/workflows', AIController.getWorkflows);
// POST /api/v1/ai/try-on -> AI Virtual Try-On: Ghép đồ thời trang lên người mẫu / người dùng
router.post('/try-on', AIController.tryOn);
export default router;
//# sourceMappingURL=ai.routes.js.map