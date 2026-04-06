import db from '../config/db.js';

export const createAlarm = (req, res) => {
    // Usamos los nombres exactos de tu tabla
    const { title, alarm_datetime, users_id, appointment_id, patient_medicine_id } = req.body; 
    
    // El 'state' lo podemos poner en 1 (activo) por defecto si no lo envían
    // state: 0=pendiente, 1=tomada, 2=no tomada, 3=pospuesta 10 min
    const sql = `INSERT INTO alarmas (title, alarm_datetime, users_id, appointment_id, patient_medicine_id, state)
                 VALUES (?, ?, ?, ?, ?, 0)`;
    
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
    const { state } = req.body;
    db.query(`UPDATE alarmas SET state = ? WHERE id = ?`, [state, id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
};

// PUT /:id — actualiza state y/o alarm_datetime según lo que se envíe
export const updateAlarm = (req, res) => {
    const { id } = req.params;
    const { state, alarm_datetime } = req.body;

    const fields = [];
    const values = [];
    if (state !== undefined) { fields.push('state = ?'); values.push(state); }
    if (alarm_datetime !== undefined) { fields.push('alarm_datetime = ?'); values.push(alarm_datetime); }

    if (fields.length === 0) return res.status(400).json({ success: false, message: 'Nada que actualizar' });
    values.push(id);

    db.query(`UPDATE alarmas SET ${fields.join(', ')} WHERE id = ?`, values, (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
};

export const deleteAlarm = (req, res) => {
    const { id } = req.params;
    db.query(`DELETE FROM alarmas WHERE id = ?`, [id], (err) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true });
    });
};

import Alarmas from '../models/alarmas.js';

export const snoozeAlarm = (req, res) => {
    const { id } = req.params;
    Alarmas.snooze(id, (err) => {
        if (err) return res.status(500).json({ success: false, error: err });
        res.json({ success: true, message: 'Alarma pospuesta 10 minutos' });
    });
};

import Patient from '../models/patientModel.js';

export const getAlarmsByPatient = (req, res) => {
    const { id } = req.params;
    Patient.getAlarms(id, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: err });
        res.json(results); // Envía las alarmas al celular
    });
};