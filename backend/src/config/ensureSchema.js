import db from './db.js';

// La base de datos real vive en otro equipo y los cambios llegan solo por git,
// así que no se pueden pedir scripts SQL manuales. Al arrancar, el backend crea
// lo que falta. Todo es idempotente: si ya existe, no hace nada.
// (Los mismos cambios están documentados en backend/sql/.)

const q = (sql, params = []) => db.promise().query(sql, params).then(([rows]) => rows);

const tableExists = async (table) => {
  const [row] = await q(
    'SELECT COUNT(*) AS c FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?',
    [table]
  );
  return row.c > 0;
};

const columnExists = async (table, column) => {
  const [row] = await q(
    'SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [table, column]
  );
  return row.c > 0;
};

const PASSWORD_RESETS = (conFk) => `
  CREATE TABLE IF NOT EXISTS password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    users_id INT NOT NULL UNIQUE,
    code_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    attempts TINYINT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ${conFk ? ', FOREIGN KEY (users_id) REFERENCES users (id) ON DELETE CASCADE' : ''}
  )`;

export default async function ensureSchema() {
  try {
    // Recuperación de contraseña: códigos de un solo uso (con hash)
    if (!(await tableExists('password_resets'))) {
      try {
        await q(PASSWORD_RESETS(true));
      } catch {
        await q(PASSWORD_RESETS(false)); // si la llave foránea no es compatible, se crea sin ella
      }
      console.log('Esquema: tabla password_resets creada.');
    }

    // Reportes: captura de pantalla opcional
    if ((await tableExists('reportes')) && !(await columnExists('reportes', 'imagen'))) {
      await q('ALTER TABLE reportes ADD COLUMN imagen MEDIUMTEXT NULL');
      console.log('Esquema: columna reportes.imagen creada.');
    }
  } catch (err) {
    // No se detiene el servidor: lo que no dependa de estos cambios sigue funcionando.
    console.error('Esquema: no se pudo actualizar la base de datos automáticamente:', err.message);
    console.error('Ejecuta a mano los scripts de backend/sql/ con un usuario con permisos de CREATE/ALTER.');
  }
}
