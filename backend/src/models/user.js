import db from '../config/db.js';

const User = {
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

    // ESTE ES EL MÉTODO QUE LISTA TODOS LOS USUARIOS, INCLUYENDO SU ROL
    findAll: (callback) => {
        const sql = `
            SELECT u.id, u.username, u.email, u.state, r.name as role_name 
            FROM users u 
            JOIN roles r ON u.roles_id = r.id`;
        db.query(sql, callback);
    },

    // --- NUEVOS MÉTODOS PARA UBICACIÓN ---
    
    // Nota: Si db.query no devuelve promesas, usa callbacks aquí también por consistencia
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
    }
};

export default User;

fff