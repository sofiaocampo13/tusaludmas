import express from 'express';
const router = express.Router();

// Importamos las funciones desde el controlador
// Asegúrate de que los nombres coincidan con los que exportaste en externalController.js
import {
    registerClinic,
    registerDoctorWithCheck,
    getClinics
} from '../controllers/externalController.js';

router.get('/clinics', getClinics);
router.post('/register-clinic', registerClinic);
router.post('/register-doctor', registerDoctorWithCheck);

export default router;