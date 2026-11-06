import express from 'express';
const router = express.Router();
// Nota: También recuerda poner .js al importar el controlador
import { getAllUsers, login, loginByCode, register, updateUser, updateUserState } from '../controllers/authController.js';
import { forgotPassword, resetPassword } from '../controllers/passwordResetController.js';


router.post('/login', login);
router.post('/login-code', loginByCode);
router.get('/users', getAllUsers);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/update/:id', updateUser);
router.patch('/users/:id/state', updateUserState);

export default router;
