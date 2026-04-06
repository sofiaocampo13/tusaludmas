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

  // Vincula un paciente (por link_code) al cuidador.
  // Retorna { alreadyLinked: true } si otro cuidador ya lo tiene.
  // Retorna { alreadyYours: true } si ya está vinculado a este cuidador.
  linkPatient: (caregiverId, linkCode, callback) => {
    // 1. Buscar al paciente por su link_code
    const findSql = `SELECT id, roles_id FROM users WHERE link_code = ? AND state = 1 LIMIT 1`;
    db.query(findSql, [linkCode], (err, patients) => {
      if (err) return callback(err);
      if (!patients.length) return callback(null, { notFound: true });

      const patient = patients[0];
      // Validar que sea paciente (roles_id = 2)
      if (patient.roles_id !== 2) return callback(null, { notPatient: true });

      // 2. Verificar si ya está vinculado a algún cuidador
      const checkSql = `SELECT caregiver_id FROM caregiver_patient WHERE patient_id = ? LIMIT 1`;
      db.query(checkSql, [patient.id], (err2, links) => {
        if (err2) return callback(err2);
        if (links.length > 0) {
          if (links[0].caregiver_id === parseInt(caregiverId)) {
            return callback(null, { alreadyYours: true });
          }
          return callback(null, { alreadyLinked: true });
        }

        // 3. Vincular
        const insertSql = `INSERT INTO caregiver_patient (caregiver_id, patient_id) VALUES (?, ?)`;
        db.query(insertSql, [caregiverId, patient.id], (err3) => {
          if (err3) return callback(err3);
          callback(null, { success: true, patientId: patient.id });
        });
      });
    });
  },
};

export default Caregiver;

