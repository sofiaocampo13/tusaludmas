import db from '../config/db.js';

const User = {
    // Método para registrar cualquier tipo de usuario
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
            WHERE (u.username = ? OR u.email = ?) AND u.password = ? AND u.state = 1`;
        db.query(sql, [username, username, password], callback);
    },

    // --- FUNCIONES DE RECUPERACIÓN DE CONTRASEÑA ---
    findByEmail: (email, callback) => {
        const sql = 'SELECT * FROM users WHERE email = ? AND state = 1';
        db.query(sql, [email], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0]);
        });
    },

    saveResetToken: (userId, token, expires, callback) => {
        const sql = `
            UPDATE users 
            SET resetPasswordToken = ?, resetPasswordExpires = ? 
            WHERE id = ?`;
        db.query(sql, [token, expires, userId], callback);
    },

    // ESTA ES LA QUE TE FALTABA:
    findByResetToken: (token, callback) => {
        const sql = `
            SELECT * FROM users 
            WHERE resetPasswordToken = ? 
            AND resetPasswordExpires > NOW() 
            AND state = 1`;
        db.query(sql, [token], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results[0]);
        });
    },

    updatePassword: (userId, newPassword, callback) => {
        const sql = `
            UPDATE users 
            SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL 
            WHERE id = ?`;
        db.query(sql, [newPassword, userId], callback);
    },
    // ----------------------------------------------

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

    findAll: (callback) => {
        const sql = `
            SELECT u.id, u.username, u.email, u.state, r.name as role_name 
            FROM users u 
            JOIN roles r ON u.roles_id = r.id`;
        db.query(sql, callback);
    },

    updateLocation: (userId, lat, lng, callback) => {
        const sql = 'UPDATE users SET latitude = ?, longitude = ? WHERE id = ?';
        db.query(sql, [lat, lng, userId], callback);
    },

    getPatientByCaregiver: (caregiverId, callback) => {
        const sql = `
            SELECT id, first_name, last_name, latitude, longitude, phone 
            FROM users 
            WHERE cuidador_id = ?
            LIMIT 1`;
        db.query(sql, [caregiverId], callback);
    },

    update: (userId, userData, callback) => {
        const { first_name, last_name, email, phone } = userData;
        const username = email ? email.split('@')[0] : null;

        const sql = `
            UPDATE users 
            SET first_name = ?, last_name = ?, email = ?, username = ?, phone = ?
            WHERE id = ?`;

        db.query(sql, [first_name, last_name, email, username, phone, userId], callback);
    }
};

export default User;