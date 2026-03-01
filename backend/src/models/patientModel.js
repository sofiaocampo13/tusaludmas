import db from '../config/db.js';

const Patient = {
    // Obtener citas del paciente
    getAppointments: (userId, callback) => {
        // Quitamos date_time porque no existe en tus columnas de appointments
        const sql = `SELECT * FROM appointments WHERE users_id = ?`;
        db.query(sql, [userId], callback);
    },

    // Obtener alarmas del paciente
    getAlarms: (userId, callback) => {
        const sql = `SELECT * FROM alarmas WHERE users_id = ?`;
        db.query(sql, [userId], callback);
    }
};

export default Patient;