import express from 'express';
const router = express.Router();
import { addDoctorExternal } from '../controllers/externalController.js';

// Definimos la ruta POST
router.post('/add-doctor', addDoctorExternal);

export default router;