import User from '../models/user.js';
import bcrypt from 'bcrypt'; 
import nodemailer from 'nodemailer';
import crypto from 'crypto';

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

// REGISTRO DE USUARIO
export const register = async (req, res) => {
    const { first_name, last_name, email, password, roleType } = req.body;

    if (!first_name || !email || !password) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const roles_id = (roleType === 'cuidador') ? 3 : 2;

        User.create({ 
            first_name, 
            last_name, 
            email, 
            password: hashedPassword,
            roles_id 
        }, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "El correo o usuario ya existe" });
                }
                console.error("Error al crear:", err);
                return res.status(500).json({ message: "Error al registrar en la base de datos" });
            }
            
            res.status(201).json({ 
                success: true,
                message: `Usuario ${roleType || 'paciente'} registrado con éxito`,
                userId: result.insertId 
            });
        });
    } catch (error) {
        console.error("Error en el catch:", error);
        res.status(500).json({ message: "Error en el servidor", details: error.message });
    }
};

export const updateUser = (req, res) => {
    const { id } = req.params; 
    const userData = req.body;

    User.update(id, userData, (err, result) => {
        if (err) {
            console.error('Error al actualizar:', err);
            return res.status(500).json({ success: false, message: 'Error al actualizar datos' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.json({ success: true, message: 'Datos actualizados correctamente' });
    });
};

// --- RECUPERACIÓN: PASO 1 (Enviar Email) ---
export const forgotPassword = (req, res) => {
    const { email } = req.body;

    User.findByEmail(email, async (err, user) => {
        if (err) return res.status(500).json({ msg: 'Error en la base de datos' });
        if (!user) return res.status(404).json({ msg: 'El correo no está registrado' });

        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hora

        User.saveResetToken(user.id, token, expires, async (err) => {
            if (err) return res.status(500).json({ msg: 'Error al guardar el token' });

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: '"Tu Salud +" <tusaludmas.app@gmail.com>',
                to: user.email,
                subject: 'Recuperación de Contraseña',
                html: `<h1>Hola ${user.first_name}</h1>
                       <p>Has solicitado restablecer tu contraseña en Tu Salud +.</p>
                       <p>Tu código de recuperación es: <b>${token}</b></p>
                       <p>Si no fuiste tú, ignora este mensaje.</p>`
            };

            try {
                await transporter.sendMail(mailOptions);
                res.json({ success: true, message: 'Correo enviado con éxito' });
            } catch (error) {
                console.error("Error enviando email:", error);
                res.status(500).json({ msg: 'Error al enviar el email' });
            }
        });
    });
};

// --- RECUPERACIÓN: PASO 2 (Restablecer Contraseña) ---
// ESTA ES LA FUNCIÓN QUE TE FALTABA PARA QUE LAS RUTAS NO DEN ERROR
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Faltan datos (token o contraseña)' });
    }

    // 1. Validamos el token
    User.findByResetToken(token, async (err, user) => {
        if (err) return res.status(500).json({ success: false, message: 'Error de base de datos' });
        if (!user) return res.status(400).json({ success: false, message: 'El código es inválido o ha expirado' });

        try {
            // 2. Encriptamos la nueva clave
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // 3. Actualizamos en la DB
            User.updatePassword(user.id, hashedPassword, (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Error al actualizar contraseña' });
                res.json({ success: true, message: 'Contraseña actualizada con éxito' });
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    });
};