import Reportes from '../models/reportes.js';

export const createReporte = (req, res) => {
  const { caregiver_id, titulo, descripcion, categoria, imagen } = req.body;

  if (!caregiver_id || !titulo?.trim() || !descripcion?.trim()) {
    return res.status(400).json({ success: false, message: 'caregiver_id, titulo y descripcion son requeridos' });
  }

  // La captura es opcional y debe ser una imagen en data URI (la manda la app)
  if (imagen && !/^data:image\/(png|jpe?g|webp);base64,/i.test(imagen)) {
    return res.status(400).json({ success: false, message: 'La captura adjunta no es una imagen válida' });
  }

  Reportes.create(caregiver_id, titulo.trim(), descripcion.trim(), categoria, imagen || null, (err, result) => {
    if (err) {
      console.error('Error DB createReporte:', err);
      return res.status(500).json({ success: false, message: 'Error de servidor' });
    }
    return res.json({ success: true, id: result.insertId });
  });
};

export const getAllReportes = (req, res) => {
  Reportes.getAll((err, results) => {
    if (err) {
      console.error('Error DB getAllReportes:', err);
      return res.status(500).json({ success: false, message: 'Error de servidor' });
    }
    return res.json({ success: true, reports: results || [] });
  });
};

export const updateReporteEstado = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!id || estado === undefined) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  Reportes.updateEstado(id, estado, (err) => {
    if (err) {
      console.error('Error DB updateReporteEstado:', err);
      return res.status(500).json({ success: false, message: 'Error de servidor' });
    }
    return res.json({ success: true });
  });
};
