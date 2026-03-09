import db from '../config/db.js';

const Alarmas = {
  createForPatientMedicine: (users_id, patient_medicine_id, title, alarm_datetime, callback) => {
    const sql = `
      INSERT INTO alarmas (users_id, patient_medicine_id, title, alarm_datetime, state)
      VALUES (?, ?, ?, ?, 1)
    `;
    db.query(sql, [users_id, patient_medicine_id, title ?? null, alarm_datetime ?? null], callback);
  },

  createForAppointment: (users_id, appointment_id, title, alarm_datetime, callback) => {
    const sql = `
      INSERT INTO alarmas (users_id, appointment_id, title, alarm_datetime, state)
      VALUES (?, ?, ?, ?, 1)
    `;
    db.query(sql, [users_id, appointment_id, title ?? null, alarm_datetime ?? null], callback);
  },

  listByPatient: (users_id, callback) => {
    const sql = `
      SELECT
        a.id,
        a.users_id,
        a.appointment_id,
        a.patient_medicine_id,
        a.title,
        a.alarm_datetime,
        a.state,
        pm.dose as pm_dose,
        pm.frequency as pm_frequency,
        m.name as medicine_name,
        ap.description as appointment_description,
        ap.status as appointment_status,
        l.name as location_name,
        l.address as location_address
      FROM alarmas a
      LEFT JOIN patient_medicines pm ON pm.id = a.patient_medicine_id
      LEFT JOIN medicines m ON m.id = pm.medicine_id
      LEFT JOIN appointments ap ON ap.id = a.appointment_id
      LEFT JOIN locations l ON l.id = ap.location_id
      WHERE a.users_id = ? AND a.state = 1
      ORDER BY a.alarm_datetime DESC
      LIMIT 50
    `;
    db.query(sql, [users_id], callback);
  },
};

export default Alarmas;

