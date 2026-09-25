import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false },
  // Devuelve DATETIME/DATE como texto plano ("2026-09-25 20:15:00") en vez de
  // objetos Date. Sin esto, mysql2 los interpreta en la zona horaria del
  // servidor y al serializarlos a JSON salen como UTC, lo que desplazaba las
  // horas de alarmas y citas al mostrarlas en el celular.
  dateStrings: true
});

db.connect((err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.message);
    return;
  }
  console.log('Base de datos "tusaludmas" conectada correctamente.');
});

export default db;