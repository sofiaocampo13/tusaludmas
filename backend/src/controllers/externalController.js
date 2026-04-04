import db from '../config/db.js';
import bcrypt from 'bcrypt';

export const addDoctorExternal = async (req, res) => {
    // Recibimos los datos básicos que enviaría la EPS
    const { first_name, last_name, email, password, phone } = req.body;

    // Validación mínima
    if (!first_name || !email || !password) {
        return res.status(400).json({ success: false, message: "Faltan campos obligatorios (nombre, email, password)" });
    }

    try {
        // 1. Encriptamos la contraseña por seguridad
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 2. Generamos un nombre de usuario basado en el email
        const username = email.split('@')[0];

        // 3. Insertamos en la tabla 'users' con roles_id = 4 (médico)
        const sql = `
            INSERT INTO users 
            (username, first_name, last_name, password, email, phone, roles_id, state) 
            VALUES (?, ?, ?, ?, ?, ?, 4, 1)`;

        db.query(sql, [username, first_name, last_name, hashedPassword, email, phone || null], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: "El correo ya está registrado" });
                }
                console.error("Error EPS API:", err);
                return res.status(500).json({ success: false, message: "Error en la base de datos" });
            }
            
            res.status(201).json({ 
                success: true, 
                message: "Médico registrado exitosamente por la EPS", 
                doctorId: result.insertId 
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};