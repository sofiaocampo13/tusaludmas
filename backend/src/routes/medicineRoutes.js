import express from 'express';
import Medicines from '../models/medicines.js';

const router = express.Router();

// Ruta de búsqueda: GET /api/medicines/search?term=...
router.get('/search', (req, res) => {
  const { term } = req.query;
  
  if (!term) {
    return res.json([]); 
  }

  Medicines.searchByName(term, (err, results) => {
    if (err) {
      console.error("Error SQL en búsqueda:", err);
      // Enviamos JSON incluso en error para evitar el SyntaxError: < en el front
      return res.status(500).json({ error: "Error interno del servidor", details: err });
    }
    res.json(results || []);
  });
});

// Opcional: Ruta para listar todo el catálogo si se llama a /api/medicines
router.get('/', (req, res) => {
  Medicines.listCatalog((err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

export default router;