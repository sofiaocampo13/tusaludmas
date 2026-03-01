import express from 'express';
const router = express.Router();
import { createAppointment, deleteAppointment } from '../controllers/appointmentController.js';

router.post('/', createAppointment);
router.delete('/:id', deleteAppointment);

export default router;