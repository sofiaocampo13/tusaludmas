import db from '../config/db.js';

const Medicines = {
  listCatalog: (callback) => {
    const sql = `SELECT id, name, principio_activo, concentracion FROM medicines ORDER BY name ASC`;
    db.query(sql, [], callback);
  },

  //Insertar los campos que realmente tienes en la DB
  createCatalog: (name, principio_activo, concentracion, callback) => {
    const sql = `INSERT INTO medicines (name, principio_activo, concentracion) VALUES (?, ?, ?)`;
    db.query(sql, [name, principio_activo ?? null, concentracion ?? null], callback);
  },

  assignToPatient: (users_id, medicine_id, dose, frequency, start_date, end_date, callback) => {
    const sql = `
      INSERT INTO patient_medicines (users_id, medicine_id, dose, frequency, start_date, end_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [users_id, medicine_id, dose ?? null, frequency ?? null, start_date ?? null, end_date ?? null], callback);
  },

  searchByName: (term, callback) => {
  const sql = `
    SELECT id, name, principio_activo, concentracion 
    FROM medicines 
    WHERE name LIKE ? OR principio_activo LIKE ?
    LIMIT 10
  `;
  db.query(sql, [`%${term}%`, `%${term}%`], callback);
}, 

  listByPatient: (users_id, callback) => {
    const sql = `
      SELECT
        pm.id,
        pm.users_id,
        pm.medicine_id,
        pm.dose,
        pm.frequency,
        pm.start_date,
        pm.end_date,
        m.name as medicine_name,
        m.principio_activo as medicine_principio,
        m.concentracion as medicine_concentracion
      FROM patient_medicines pm
      JOIN medicines m ON m.id = pm.medicine_id
      WHERE pm.users_id = ?
      ORDER BY pm.id DESC
    `;
    db.query(sql, [users_id], callback);
  },
};

export default Medicines;