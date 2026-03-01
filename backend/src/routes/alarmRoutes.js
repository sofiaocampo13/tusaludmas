import express from 'express';
const router = express.Router();
import { createAlarm, updateAlarmState } from '../controllers/alarmController.js';

router.post('/', createAlarm);
router.put('/:id', updateAlarmState);

export default router;