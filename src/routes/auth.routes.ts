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
router.put('/profile', authenticate, AuthController.updateProfile);

// Sổ địa chỉ giao hàng
router.get('/addresses', authenticate, AuthController.getAddresses);
router.post('/addresses', authenticate, AuthController.addAddress);
router.put('/addresses/:id', authenticate, AuthController.updateAddress);
router.delete('/addresses/:id', authenticate, AuthController.deleteAddress);
router.patch('/addresses/:id/default', authenticate, AuthController.setDefaultAddress);

export default router;
