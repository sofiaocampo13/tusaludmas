import db from '../config/db.js';
import bcrypt from 'bcrypt';

const User = {
    // Método para registrar cualquier tipo de usuario (Paciente o Cuidador)
    create: (userData, callback) => {
        const { first_name, last_name, email, password, roles_id } = userData;
        
        const username = email.split('@')[0];

        const sql = `
            INSERT INTO users 
            (username, first_name, last_name, password, email, state, roles_id) 
            VALUES (?, ?, ?, ?, ?, 1, ?)`;

        db.query(sql, [username, first_name, last_name, password, email, roles_id], callback);
    },

    authenticate: (username, password, callback) => {
        const sql = `
            SELECT u.*, r.name as role_name
            FROM users u
            JOIN roles r ON u.roles_id = r.id
            WHERE (u.username = ? OR u.email = ?) AND u.state = 1`;
        db.query(sql, [username, username], async (err, results) => {
            if (err) return callback(err, []);
            if (!results.length) return callback(null, []);
            const user = results[0];
            let match = false;
            if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
                match = await bcrypt.compare(password, user.password);
            } else {
                // Fallback para contraseñas en texto plano (mientras se migran)
                match = user.password === password;
            }
            callback(null, match ? results : []);
        });
    },

    findByCode: (code, callback) => {
        const sql = `
            SELECT u.*, r.name as role_name 
            FROM users u 
            JOIN roles r ON u.roles_id = r.id 
            WHERE u.link_code = ? AND u.state = 1`;
        db.query(sql, [code], callback);
    },

    findById: (id, callback) => {
        const sql = `
            SELECT u.*, r.name as role_name
            FROM users u
            LEFT JOIN roles r ON u.roles_id = r.id
            WHERE u.id = ?`;
        db.query(sql, [id], callback);
    },

    // LISTA TODOS LOS USUARIOS CON SU ROL
    findAll: (callback) => {
        const sql = `
            SELECT u.id, u.username, u.email, u.state, r.name as role_name 
            FROM users u 
            JOIN roles r ON u.roles_id = r.id`;
        db.query(sql, callback);
    },

    // ACTUALIZA LA UBICACIÓN DEL USUARIO
    updateLocation: (userId, lat, lng, callback) => {
        const sql = 'UPDATE users SET latitude = ?, longitude = ? WHERE id = ?';
        db.query(sql, [lat, lng, userId], callback);
    },

    getPatientByCaregiver: (caregiverId, callback) => {
        const sql = `
            SELECT u.id, u.first_name, u.last_name, u.latitude, u.longitude, u.phone
            FROM users u
            JOIN caregiver_patient cp ON cp.patient_id = u.id
            WHERE cp.caregiver_id = ?
            LIMIT 1`;
        db.query(sql, [caregiverId], callback);
    },

    // ACTUALIZAR DATOS DEL USUARIO
    update: (userId, userData, callback) => {
        const { first_name, last_name, email, phone } = userData;

        const sql = `
            UPDATE users
            SET first_name = ?, last_name = ?, email = ?, phone = ?
            WHERE id = ?`;

        db.query(sql, [first_name, last_name, email, phone, userId], callback);
    }
};

export default User;