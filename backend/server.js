const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión a la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      //usuario de MySQL
    password: '12345',      //contraseña de MySQL
    database: 'tusaludmas'
});

// Ruta de Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `
    SELECT 
        u.id, 
        u.username, 
        u.first_name,    -- <--- Nuevo
        u.last_name,     -- <--- Nuevo
        u.link_code, 
        r.name AS role 
    FROM users u 
    JOIN roles r ON u.roles_id = r.id 
    WHERE (u.username = ? OR u.email = ?) 
    AND u.password = ? AND u.state = TRUE`;

    db.execute(query, [username, username, password], (err, results) => {
        if (err) {
            return res.status(500).json({ error: "Error en el servidor" });
        }

        if (results.length > 0) {
            res.json({
                success: true,
                message: "Login exitoso",
                user: results[0]
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Usuario/email o contraseña incorrectos"
            });
        }
    });
});

app.post('/login-code', (req, res) => {
    const { code } = req.body;

    const query = `
    SELECT 
        p.id AS paciente_id, 
        p.username AS paciente_nombre,
        p.link_code,  -- <--- AGREGAMOS ESTA LÍNEA
        c.username AS cuidador_nombre,
        c.state AS cuidador_activo
    FROM users p
    INNER JOIN users c ON p.cuidador_id = c.id
    WHERE p.link_code = ? 
    AND p.state = TRUE 
    AND c.state = TRUE`;

    db.execute(query, [code], (err, results) => {
        if (err) return res.status(500).json({ error: "Error de servidor" });

        if (results.length > 0) {
            // Vínculo detectado y activo
            res.json({
                success: true,
                user: results[0],
                message: `Vinculado con el cuidador: ${results[0].cuidador_nombre}`
            });
        } else {
            // El código no existe O el cuidador fue desactivado
            res.status(401).json({
                success: false,
                message: "Código inválido o cuidador no disponible."
            });
        }
    });
});

app.listen(3000, () => {
    console.log("Servidor corriendo en http://localhost:3000");
});