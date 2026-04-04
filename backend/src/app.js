import express from "express";
import cors from "cors"; 
import authRoutes from './routes/authRoutes.js';
import dataRoutes from './routes/dataRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import alarmRoutes from './routes/alarmRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';

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

// Ruta de prueba
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "Conexión exitosa desde el Backend de Node.js" });
});

export default app;