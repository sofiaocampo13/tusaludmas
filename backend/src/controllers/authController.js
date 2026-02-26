import User from '../models/User.js'; // Asegúrate que el modelo también use export default

export const login = (req, res) => {
    const { username, password } = req.body;
    User.authenticate(username, password, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: "Error" });
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: "Credenciales incorrectas" });
        }
    });
};

export const loginByCode = (req, res) => {
    // ... tu lógica de código aquí
};