import Patient from '../models/patientModel.js';

export const getDashboardData = (req, res) => {
    const { id } = req.params; 

    Patient.getAppointments(id, (err, appointments) => {
        if (err) {
            console.error("Error en citas:", err);
            return res.status(500).json({ success: false, message: "Error al consultar citas" });
        }

        Patient.getAlarms(id, (err, alarms) => {
            if (err) {
                console.error("Error en alarmas:", err);
                return res.status(500).json({ success: false, message: "Error al consultar alarmas" });
            }

            res.json({
                success: true,
                data: {
                    appointments: appointments,
                    alarms: alarms
                }
            });
        });
    });
};