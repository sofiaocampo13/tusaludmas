import dotenv from "dotenv";
import app from "./src/app.js";
import "./src/config/db.js";
import ensureSchema from "./src/config/ensureSchema.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  // Crea las tablas/columnas nuevas si faltan (ver src/config/ensureSchema.js)
  ensureSchema();
});
