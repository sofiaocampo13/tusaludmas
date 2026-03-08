import express from 'express';
const router = express.Router();
// Nota: También recuerda poner .js al importar el controlador
import { getAllUsers, login, loginByCode } from '../controllers/authController.js'; 

router.post('/login', login);
router.post('/login-code', loginByCode);
router.get('/users', getAllUsers);

export default router;

fff