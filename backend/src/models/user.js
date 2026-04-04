import db from '../config/db.js';

const User = {
    // Método para registrar cualquier tipo de usuario (Paciente o Cuidador)
    create: (userData, callback) => {
        const { first_name, last_name, email, password, roles_id } = userData;
        
        // Generación automática del username para cumplir con la restricción UNI y NOT NULL
        const username = email.split('@')[0];

        // Usamos el roles_id enviado (2 para Paciente, 3 para Cuidador) y state=1 por defecto
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
            SELECT id, first_name, last_name, latitude, longitude, phone 
            FROM users 
            WHERE cuidador_id = ?
            LIMIT 1`;
        db.query(sql, [caregiverId], callback);
    },

    // ACTUALIZAR DATOS DEL USUARIO
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
