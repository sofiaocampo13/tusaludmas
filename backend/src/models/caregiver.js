import db from '../config/db.js';

const Caregiver = {
  getPatients: (caregiverId, callback) => {
    const sql = `
      SELECT u.id, u.username, u.first_name, u.last_name, u.email, u.phone, u.link_code
      FROM caregiver_patient cp
      JOIN users u ON u.id = cp.patient_id
      WHERE cp.caregiver_id = ?
      ORDER BY u.id ASC
    `;
    db.query(sql, [caregiverId], callback);
  },
};

export default Caregiver;

