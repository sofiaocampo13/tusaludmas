import db from '../config/db.js';

const User = {
    authenticate: (identifier, password, callback) => {
        // Agregamos r.name para saber si es 'Admin', 'Paciente' o 'Cuidador'
        const sql = `
            SELECT u.*, r.name as role_name 
            FROM users u 
            JOIN roles r ON u.roles_id = r.id 
            WHERE (u.username = ? OR u.email = ?) AND u.password = ? AND u.state = 1`;
        db.query(sql, [identifier, identifier, password], callback);
    }
};

export default User;