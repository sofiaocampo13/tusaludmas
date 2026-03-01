import express from "express";
import cors from "cors"; 
import authRoutes from './routes/authRoutes.js'; // CAMBIO: Usamos import y añadimos .js
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import alarmRoutes from './routes/alarmRoutes.js';


const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Rutas
app.use('/api', authRoutes); // Conectamos tus rutas de login

app.use('/api', patientRoutes); 

app.use('/api/appointments', appointmentRoutes);
app.use('/api/alarms', alarmRoutes);

// Ruta de prueba
app.get('/api/saludo', (req, res) => {
  res.json({ mensaje: "Conexión exitosa desde el Backend de Node.js" });
});



// Exportar la instancia de la app
export default app;
