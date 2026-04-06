import express from 'express';
const router = express.Router();

// Importamos las funciones desde el controlador
// Asegúrate de que los nombres coincidan con los que exportaste en externalController.js
import { 
    registerClinic, 
    registerDoctorWithCheck 
} from '../controllers/externalController.js';

/**
 * RUTA: POST /api/external/register-clinic
 * DESCRIPCIÓN: Permite a la EPS crear una nueva clínica en la tabla 'locations'.
 */
router.post('/register-clinic', registerClinic);

/**
 * RUTA: POST /api/external/register-doctor
 * DESCRIPCIÓN: Registra un médico en la tabla 'users' solo si la clínica proporcionada existe.
 */
router.post('/register-doctor', registerDoctorWithCheck);

export default router;