import db from '../config/db.js';

export const createAlarm = (req, res) => {
    // Usamos los nombres exactos de tu tabla
    const { title, alarm_datetime, users_id, appointment_id, patient_medicine_id } = req.body; 
    
    // El 'state' lo podemos poner en 1 (activo) por defecto si no lo envían
    const sql = `INSERT INTO alarmas (title, alarm_datetime, users_id, appointment_id, patient_medicine_id, state) 
                 VALUES (?, ?, ?, ?, ?, 1)`;
    
    db.query(sql, [title, alarm_datetime, users_id, appointment_id || null, patient_medicine_id || null], (err, result) => {
        if (err) {
            console.error("Error en DB:", err);
            return res.status(500).json({ success: false, error: err });
        }
        res.json({ success: true, message: "Alarma configurada correctamente", id: result.insertId });
    });
};

export const updateAlarmState = (req, res) => {
    const { id } = req.params;
    const { state } = req.body; // 1 para activo, 0 para inactivo
    db.query(`UPDATE alarmas SET state = ? WHERE id = ?`, [state, id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, message: "Estado de la alarma actualizado" });
    });
};