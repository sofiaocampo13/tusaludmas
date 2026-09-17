import User from '../models/user.js';
import bcrypt from 'bcrypt';
import { calculateAge, isAdult, LEGAL_AGE } from '../utils/age.js';

// LOGIN ESTÁNDAR
export const login = (req, res) => {
    const { username, password } = req.body;

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
    const { code } = req.body;

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

// LISTAR TODOS LOS USUARIOS
export const getAllUsers = (req, res) => {
    User.findAll((err, results) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error al obtener la lista de usuarios' 
            });
        }

        const safeUsers = results.map(({ password, ...user }) => user);
        
        res.json({ 
            success: true, 
            users: safeUsers 
        });
    });
};

// Genera un código alfanumérico único de 6 caracteres
function generateLinkCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// REGISTRO DE USUARIO
export const register = async (req, res) => {
    const { first_name, last_name, username, email, password, phone, birth_date, roleType } = req.body;

    if (!first_name || !last_name || !username || !email || !password || !phone || !birth_date) {
        return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
    }

    // Mayoría de edad según la fecha actual de Colombia (aplica a paciente y cuidador)
    const age = calculateAge(birth_date);
    if (age === null) {
        return res.status(400).json({ success: false, message: "La fecha de nacimiento no es válida" });
    }
    if (age < 0) {
        return res.status(400).json({ success: false, message: "La fecha de nacimiento no puede ser futura" });
    }
    if (!isAdult(birth_date)) {
        return res.status(400).json({
            success: false,
            message: `Debes ser mayor de edad (${LEGAL_AGE} años cumplidos) para registrarte.`
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const roles_id = roleType === 'cuidador' ? 3 : 2;
        const link_code = roleType === 'paciente' ? generateLinkCode() : null;

        User.create({
            first_name,
            last_name,
            username,
            email,
            password: hashedPassword,
            phone,
            birth_date,
            roles_id,
            link_code
        }, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: "El correo o nombre de usuario ya está registrado" });
                }
                console.error("Error al crear usuario:", err);
                return res.status(500).json({ success: false, message: "Error al registrar en la base de datos" });
            }
            res.status(201).json({
                success: true,
                message: `${roleType === 'cuidador' ? 'Cuidador' : 'Paciente'} registrado con éxito`,
                userId: result.insertId,
                ...(link_code && { link_code })
            });
        });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ success: false, message: "Error en el servidor", details: error.message });
    }
};

export const updateUser = (req, res) => {
    const { id } = req.params;
    const userData = req.body;

    if (!userData || Object.keys(userData).length === 0) {
        return res.status(400).json({ success: false, message: 'No se recibieron datos para actualizar' });
    }

    try {
        User.update(id, userData, (err, result) => {
            if (err) {
                console.error('Error al actualizar:', err);
                return res.status(500).json({ success: false, message: 'Error al actualizar datos: ' + err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }

            res.json({ success: true, message: 'Datos actualizados correctamente' });
        });
    } catch (error) {
        console.error('Error inesperado en updateUser:', error);
        res.status(500).json({ success: false, message: 'Error inesperado: ' + error.message });
    }
};
export const updateUserState = (req, res) => {
    const { id } = req.params;
    const { state } = req.body;

    if (state !== 0 && state !== 1) {
        return res.status(400).json({ success: false, message: 'Estado inválido' });
    }

    User.updateState(id, state, (err, result) => {
        if (err) {
            console.error('Error al actualizar estado:', err);
            return res.status(500).json({ success: false, message: 'Error al actualizar estado del usuario' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        return res.json({
            success: true,
            message: state === 0 ? 'Usuario suspendido correctamente' : 'Usuario activado correctamente'
        });
    });
};