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
    }
};

export default User;