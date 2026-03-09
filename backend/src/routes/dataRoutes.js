import express from 'express';
import {
  getUserById,
  getCaregiverPatients,
  listMedicinesCatalog,
  createMedicineCatalog,
  listPatientMedicines,
  createPatientMedicine,
  listPatientAppointments,
  createPatientAppointment,
  listPatientAlarmas,
} from '../controllers/dataController.js';

const router = express.Router();

router.get('/users/:id', getUserById);
router.get('/caregivers/:caregiverId/patients', getCaregiverPatients);

router.get('/medicines', listMedicinesCatalog);
router.post('/medicines', createMedicineCatalog);

router.get('/patients/:patientId/medicines', listPatientMedicines);
router.post('/patients/:patientId/medicines', createPatientMedicine);

router.get('/patients/:patientId/appointments', listPatientAppointments);
router.post('/patients/:patientId/appointments', createPatientAppointment);

router.get('/patients/:patientId/alarmas', listPatientAlarmas);

export default router;

