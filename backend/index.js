import dotenv from "dotenv";
import app from "./src/app.js";
import "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
