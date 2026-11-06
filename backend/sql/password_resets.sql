-- Códigos de un solo uso para recuperar la contraseña (se guardan con hash, nunca en claro).
-- Ejecutar una vez sobre la base de datos tusaludmas:
CREATE TABLE IF NOT EXISTS password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  users_id INT NOT NULL UNIQUE,
  code_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (users_id) REFERENCES users (id) ON DELETE CASCADE
);
