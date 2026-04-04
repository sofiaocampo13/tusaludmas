import express from "express";
import cors from "cors"; 
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import alarmRoutes from './routes/alarmRoutes.js';
import externalRoutes from './routes/externalRoutes.js';

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Rutas
// Usamos /api/auth para tus nuevas funciones de recuperación y login
app.use('/api/auth', authRoutes); 

// Mantenemos las rutas que ya estaban en main
app.use('/api/data', dataRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/external', externalRoutes);

// Ruta de prueba
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "Conexión exitosa desde el Backend de Node.js" });
});

export default app;