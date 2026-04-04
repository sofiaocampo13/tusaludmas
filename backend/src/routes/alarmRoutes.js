import express from 'express';
const router = express.Router();
import { createAlarm, updateAlarmState, updateAlarm, deleteAlarm, getAlarmsByPatient } from '../controllers/alarmController.js';

router.post('/', createAlarm);
router.put('/:id', updateAlarm);
router.delete('/:id', deleteAlarm);
router.get('/paciente/:id', getAlarmsByPatient);

export default router;