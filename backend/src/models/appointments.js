import db from '../config/db.js';

const Appointments = {
  createLocation: (name, address, latitude, longitude, callback) => {
    const sql = `INSERT INTO locations (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`;
    db.query(sql, [name ?? null, address ?? null, latitude ?? null, longitude ?? null], callback);
  },

  createAppointment: (users_id, location_id, appointment_datetime, description, status, callback) => {
    const sql = `
      INSERT INTO appointments (users_id, location_id, appointment_datetime, description, status)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [users_id, location_id ?? null, appointment_datetime ?? null, description ?? null, status ?? null], callback);
  },

  listByPatient: (users_id, callback) => {
    const sql = `
      SELECT
        a.id,
        a.users_id,
        a.location_id,
        a.appointment_datetime,
        a.description,
        a.status,
        l.name as location_name,
        l.address as location_address,
        l.latitude as location_latitude,
        l.longitude as location_longitude
      FROM appointments a
      LEFT JOIN locations l ON l.id = a.location_id
      WHERE a.users_id = ?
      ORDER BY a.appointment_datetime DESC
    `;
    db.query(sql, [users_id], callback);
  },
};

export default Appointments;

