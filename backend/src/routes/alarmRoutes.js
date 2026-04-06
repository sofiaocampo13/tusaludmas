import express from 'express';
const router = express.Router();
import { createAlarm, updateAlarmState, updateAlarm, deleteAlarm, getAlarmsByPatient, snoozeAlarm } from '../controllers/alarmController.js';

router.post('/', createAlarm);
router.post('/:id/posponer', snoozeAlarm);       // state=3, +10 min
router.put('/:id', updateAlarm);                  // state=1 tomada, state=2 no tomada
router.delete('/:id', deleteAlarm);
router.get('/paciente/:id', getAlarmsByPatient);

export default router;