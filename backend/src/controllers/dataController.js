import User from '../models/user.js';
import Caregiver from '../models/caregiver.js';
import Medicines from '../models/medicines.js';
import Appointments from '../models/appointments.js';
import Alarmas from '../models/alarmas.js';

export const getUserById = (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ success: false, message: 'Falta id' });

  User.findById(id, (err, results) => {
    if (err) {
      console.error('Error DB getUserById:', err);
      return res.status(500).json({ success: false, message: 'Error de servidor' });
    }
    if (!results?.length) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    const user = results[0];
    delete user.password;
    return res.json({ success: true, user });
  });
};

export const getCaregiverPatients = (req, res) => {
  const { caregiverId } = req.params;
  if (!caregiverId) return res.status(400).json({ success: false, message: 'Falta caregiverId' });

  Caregiver.getPatients(caregiverId, (err, results) => {
    if (err) {
      console.error('Error DB getCaregiverPatients:', err);
      return res.status(500).json({ success: false, message: 'Error de servidor' });
    }
    return res.json({ success: true, patients: results || [] });
  });
};

export const listMedicinesCatalog = (req, res) => {
  Medicines.listCatalog((err, results) => {
    if (err) {
      console.error('Error DB listMedicinesCatalog:', err);
      return res.status(500).json({ success: false, message: 'Error de servidor' });
    }
    return res.json({ success: true, medicines: results || [] });
  });
};

export const createMedicineCatalog = (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Falta name' });

  Medicines.createCatalog(name, description, (err, result) => {
    if (err) {
      console.error('Error DB createMedicineCatalog:', err);
      return res.status(500).json({ success: false, message: 'Error de servidor' });
    }
    return res.json({ success: true, id: result.insertId });
  });
};

export const listPatientMedicines = (req, res) => {
  const { patientId } = req.params;
  if (!patientId) return res.status(400).json({ success: false, message: 'Falta patientId' });

  Medicines.listByPatient(patientId, (err, results) => {
    if (err) {
      console.error('Error DB listPatientMedicines:', err);
      return res.status(500).json({ success: false, message: 'Error de servidor' });
    }
    return res.json({ success: true, patient_medicines: results || [] });
  });
};

export const createPatientMedicine = (req, res) => {
  const { patientId } = req.params;
  const { medicine_id, dose, frequency, start_date, end_date, alarm_datetime, alarm_title } = req.body;
  if (!patientId) return res.status(400).json({ success: false, message: 'Falta patientId' });
  if (!medicine_id) return res.status(400).json({ success: false, message: 'Falta medicine_id' });

  Medicines.assignToPatient(patientId, medicine_id, dose, frequency, start_date, end_date, (err, result) => {
    if (err) {
      console.error('Error DB createPatientMedicine:', err);
      return res.status(500).json({ success: false, message: 'Error de servidor' });
    }
    const patient_medicine_id = result.insertId;
    if (!alarm_datetime) {
      return res.json({ success: true, id: patient_medicine_id });
    }
    Alarmas.createForPatientMedicine(patientId, patient_medicine_id, alarm_title ?? 'Toma', alarm_datetime, (err2) => {
      if (err2) {
        console.error('Error DB createAlarmaForPatientMedicine:', err2);
        // Creamos el patient_medicine aunque falle la alarma
        return res.json({ success: true, id: patient_medicine_id, warning: 'No se pudo crear la alarma' });
      }
      return res.json({ success: true, id: patient_medicine_id });
    });
  });
};

export const listPatientAppointments = (req, res) => {
  const { patientId } = req.params;
  if (!patientId) return res.status(400).json({ success: false, message: 'Falta patientId' });

  Appointments.listByPatient(patientId, (err, results) => {
    if (err) {
      console.error('Error DB listPatientAppointments:', err);
      return res.status(500).json({ success: false, message: 'Error de servidor' });
    }
    return res.json({ success: true, appointments: results || [] });
  });
};

export const createPatientAppointment = (req, res) => {
  const { patientId } = req.params;
  const {
    description,
    status,
    appointment_datetime,
    location_name,
    location_address,
    location_latitude,
    location_longitude,
    alarm_datetime,
    alarm_title,
  } = req.body;

  if (!patientId) return res.status(400).json({ success: false, message: 'Falta patientId' });
  if (!appointment_datetime) return res.status(400).json({ success: false, message: 'Falta appointment_datetime' });

  const createWithLocationId = (location_id) => {
    Appointments.createAppointment(patientId, location_id, appointment_datetime, description, status, (err, result) => {
      if (err) {
        console.error('Error DB createPatientAppointment:', err);
        return res.status(500).json({ success: false, message: 'Error de servidor' });
      }
      const appointment_id = result.insertId;
      if (!alarm_datetime) return res.json({ success: true, id: appointment_id });

      Alarmas.createForAppointment(patientId, appointment_id, alarm_title ?? 'Cita', alarm_datetime, (err2) => {
        if (err2) {
          console.error('Error DB createAlarmaForAppointment:', err2);
          return res.json({ success: true, id: appointment_id, warning: 'No se pudo crear la alarma' });
        }
        return res.json({ success: true, id: appointment_id });
      });
    });
  };

  // Si no se envía location_name/address, creamos la cita sin location_id
  if (!location_name && !location_address) {
    return createWithLocationId(null);
  }

  Appointments.createLocation(location_name, location_address, location_latitude, location_longitude, (err, result) => {
    if (err) {
      console.error('Error DB createLocation:', err);
      // Si falla, igual intentamos crear la cita sin location_id
      return createWithLocationId(null);
    }
    return createWithLocationId(result.insertId);
  });
};

export const listPatientAlarmas = (req, res) => {
  const { patientId } = req.params;
  if (!patientId) return res.status(400).json({ success: false, message: 'Falta patientId' });

  Alarmas.listByPatient(patientId, (err, results) => {
    if (err) {
      console.error('Error DB listPatientAlarmas:', err);
      return res.status(500).json({ success: false, message: 'Error de servidor' });
    }
    return res.json({ success: true, alarmas: results || [] });
  });
};

