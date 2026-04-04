import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cargarMedicamentos = () => {
    const filePath = path.join(__dirname, 'data', 'medicamentos.csv');
    
    console.log('--- Iniciando importación limpia y corregida ---');

    let contador = 0;

    fs.createReadStream(filePath)
        .pipe(csv({ separator: ',' })) 
        .on('data', (row) => {
            // Filtro de actividad y vigencia
            const estaActivo = !row.fechainactivo || row.fechainactivo.trim() === '';
            const esVigente = row.estadoregistro && row.estadoregistro.trim() === 'Vigente';

            if (estaActivo && esVigente) {
                const query = `INSERT INTO medicines 
                               (name, principio_activo, concentracion, forma_farmaceutica, titular) 
                               VALUES (?, ?, ?, ?, ?)`;
                
                // Combinamos cantidad y unidadmedida para que no salgan letras raras
                // Ejemplo: "50" + "mg" = "50 mg"
                const concentracionReal = `${row.cantidad || ''} ${row.unidadmedida || ''}`.trim();

                const values = [
                    row.producto?.trim() || 'Sin nombre', 
                    row.principioactivo?.trim() || null, 
                    concentracionReal || null, 
                    row.formafarmaceutica?.trim() || null, 
                    row.titular?.trim() || null
                ];

                db.query(query, values, (err) => {
                    if (err) {
                        console.error(`❌ Error en: ${row.producto?.substring(0, 20)}`, err.message);
                    } else {
                        contador++;
                        // Te avisará cada 1000 registros para no saturar la consola
                        if (contador % 1000 === 0) {
                            console.log(`✅ ${contador} medicamentos guardados con éxito...`);
                        }
                    }
                });
            }
        })
        .on('end', () => {
            console.log('--- Archivo procesado al 100% ---');
            console.log('Espera un momento a que terminen las inserciones en la base de datos.');
        });
};

cargarMedicamentos();