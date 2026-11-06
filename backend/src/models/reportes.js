import db from '../config/db.js';

const Reportes = {
  create: (caregiverId, titulo, descripcion, categoria, imagen, callback) => {
    // La columna `imagen` solo se usa cuando hay captura, así los reportes sin
    // imagen siguen funcionando aunque la migración backend/sql/reportes_imagen.sql
    // todavía no se haya ejecutado.
    const columnas = ['caregiver_id', 'titulo', 'descripcion', 'categoria'];
    const valores = [caregiverId, titulo, descripcion, categoria || 'general'];
    if (imagen) {
      columnas.push('imagen');
      valores.push(imagen);
    }
    const sql = `
      INSERT INTO reportes (${columnas.join(', ')})
      VALUES (${columnas.map(() => '?').join(', ')})
    `;
    db.query(sql, valores, callback);
  },

  getAll: (callback) => {
    const consulta = (columnaImagen) => `
      SELECT
        r.id, r.caregiver_id, r.titulo, r.descripcion,
        r.categoria, r.estado, r.created_at${columnaImagen},
        u.first_name, u.last_name, u.username, u.email
      FROM reportes r
      JOIN users u ON u.id = r.caregiver_id
      ORDER BY r.created_at DESC
    `;
    db.query(consulta(', r.imagen'), (err, results) => {
      // Si la migración backend/sql/reportes_imagen.sql no se ha ejecutado, la
      // columna no existe: se listan los reportes igual, sin captura.
      if (err && err.code === 'ER_BAD_FIELD_ERROR') {
        return db.query(consulta(''), callback);
      }
      callback(err, results);
    });
  },

  updateEstado: (id, estado, callback) => {
    const sql = `UPDATE reportes SET estado = ? WHERE id = ?`;
    db.query(sql, [estado, id], callback);
  },
};

export default Reportes;
