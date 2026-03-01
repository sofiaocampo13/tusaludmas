import express from 'express';
const router = express.Router();
import { getDashboardData } from '../controllers/patientController.js';

// El frontend llamará a: /api/patient/dashboard/ID_DEL_PACIENTE
router.get('/patient/dashboard/:id', getDashboardData);

export default router;