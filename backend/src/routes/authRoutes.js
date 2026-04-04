import express from 'express';
const router = express.Router();
import { 
    getAllUsers, 
    login, 
    loginByCode, 
    register, 
    updateUser, 
    forgotPassword, 
    resetPassword 
} from '../controllers/authController.js'; 

router.post('/login', login);
router.post('/login-code', loginByCode);
router.get('/users', getAllUsers);
router.post('/register', register);
router.put('/update/:id', updateUser);

// Rutas de recuperación
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;