import db from '../config/db.js';

const User = {
    authenticate: (identifier, password, callback) => {
        const sql = 'SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?';
        db.query(sql, [identifier, identifier, password], callback);
    }
};

export default User; // <--- Exportación moderna