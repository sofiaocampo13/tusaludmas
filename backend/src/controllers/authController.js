import User from '../models/user.js';

// LOGIN ESTÁNDAR
export const login = (req, res) => {
    const { username, password } = req.body; // Cambiado a username

    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Por favor, ingrese usuario y contraseña.' 
        });
    }

    User.authenticate(username, password, (err, results) => {
        if (err) {
            console.error('Error DB:', err);
            return res.status(500).json({ success: false, message: 'Error de servidor' });
        }

        if (results.length > 0) {
            const user = results[0];
            delete user.password;
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    });
};

// LOGIN POR CÓDIGO
export const loginByCode = (req, res) => {
    const { code } = req.body; // Coincide con tu authService.ts

    if (!code) {
        return res.status(400).json({ success: false, message: 'Ingrese el código' });
    }

    User.findByCode(code, (err, results) => {
        if (err) return res.status(500).json({ success: false });
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: 'Código no válido' });
        }
    });
};