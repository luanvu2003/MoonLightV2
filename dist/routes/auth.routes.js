import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
const router = Router();
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/send-register-otp', AuthController.sendRegisterOtp);
router.post('/verify-register-otp', AuthController.verifyRegisterOtp);
router.get('/google/config', AuthController.getGoogleConfig);
router.post('/google', AuthController.googleAuth);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.getMe);
router.post('/sync', authenticate, AuthController.syncUserData);
router.put('/password', authenticate, AuthController.changePassword);
router.put('/avatar', authenticate, AuthController.updateAvatar);
export default router;
//# sourceMappingURL=auth.routes.js.map