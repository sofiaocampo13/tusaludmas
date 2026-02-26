import express from 'express';
const router = express.Router();
// Nota: También recuerda poner .js al importar el controlador
import { login, loginByCode } from '../controllers/authController.js'; 

router.post('/login', login);
router.post('/login-code', loginByCode);

export default router; // <--- Esto es lo que soluciona tu error actual