import express from "express";
import cors from "cors"; 
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import alarmRoutes from './routes/alarmRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import externalRoutes from './routes/externalRoutes.js';
import reporteRoutes from './routes/reporteRoutes.js';
const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Rutas
app.use('/api', authRoutes);
app.use('/api', dataRoutes);

app.use('/api', patientRoutes); 
app.use('/api/patients', patientRoutes);

app.use('/api/appointments', appointmentRoutes);
app.use('/api/alarms', alarmRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/catalog', medicineRoutes);

app.use('/api/external', externalRoutes);
app.use('/api/reportes', reporteRoutes);
// Ruta de prueba
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "Conexión exitosa desde el Backend de Node.js" });
});

// Manejo global de errores - siempre devuelve JSON
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err.stack);
  res.status(500).json({ success: false, message: 'Error interno del servidor: ' + err.message });
});

export default app;