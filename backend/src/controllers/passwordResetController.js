import crypto from 'crypto';
import bcrypt from 'bcrypt';
import db from '../config/db.js';
import { isMailConfigured, sendPasswordResetCode } from '../utils/mailer.js';

const CODE_MINUTES = 15;        // vigencia del código
const RESEND_SECONDS = 60;      // espera mínima entre dos códigos para la misma cuenta
const MAX_ATTEMPTS = 5;         // intentos fallidos antes de invalidar el código

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mismas reglas que el registro (frontend/app/auth/register.tsx)
const passwordError = (password) => {
  if (typeof password !== 'string' || password.length < 8) return 'La contraseña debe tener mínimo 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe tener una letra mayúscula.';
  if (!/[a-z]/.test(password)) return 'La contraseña debe tener una letra minúscula.';
  if (!/\d/.test(password)) return 'La contraseña debe tener un número.';
  return null;
};

const query = (sql, params = []) => db.promise().query(sql, params).then(([rows]) => rows);

const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();

// POST /api/forgot-password  { email }
// La respuesta es la misma exista o no el correo, para no revelar qué cuentas están registradas.
export const forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: 'Ingresa un correo electrónico válido.' });
  }
  if (!isMailConfigured()) {
    console.error('forgot-password: faltan SMTP_USER / SMTP_PASS en backend/.env');
    return res.status(503).json({ success: false, message: 'El servicio de correo no está disponible por ahora.' });
  }

  const generic = {
    success: true,
    message: `Si el correo está registrado, te enviamos un código que vence en ${CODE_MINUTES} minutos.`,
  };

  try {
    const [user] = await query('SELECT id FROM users WHERE LOWER(email) = ? AND state = 1 LIMIT 1', [email]);
    if (!user) return res.json(generic);

    const [reciente] = await query(
      'SELECT id FROM password_resets WHERE users_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL ? SECOND)',
      [user.id, RESEND_SECONDS]
    );
    if (reciente) return res.json(generic);

    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = await bcrypt.hash(code, 10);

    await query(
      `INSERT INTO password_resets (users_id, code_hash, expires_at)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
       ON DUPLICATE KEY UPDATE code_hash = VALUES(code_hash), expires_at = VALUES(expires_at),
                               attempts = 0, created_at = NOW()`,
      [user.id, codeHash, CODE_MINUTES]
    );

    try {
      await sendPasswordResetCode(email, code, CODE_MINUTES);
    } catch (mailErr) {
      console.error('forgot-password: no se pudo enviar el correo:', mailErr.message);
      await query('DELETE FROM password_resets WHERE users_id = ?', [user.id]);
      return res.status(502).json({ success: false, message: 'No se pudo enviar el correo. Intenta de nuevo más tarde.' });
    }

    return res.json(generic);
  } catch (err) {
    console.error('forgot-password:', err);
    return res.status(500).json({ success: false, message: 'Error de servidor' });
  }
};

// POST /api/reset-password  { email, code, newPassword }
export const resetPassword = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const code = String(req.body?.code ?? '').replace(/\s+/g, '');
  const { newPassword } = req.body ?? {};

  if (!EMAIL_REGEX.test(email) || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ success: false, message: 'Correo o código inválido.' });
  }
  const pwdErr = passwordError(newPassword);
  if (pwdErr) return res.status(400).json({ success: false, message: pwdErr });

  const invalid = () => res.status(400).json({ success: false, message: 'El código es incorrecto o ya venció.' });

  try {
    const [user] = await query('SELECT id FROM users WHERE LOWER(email) = ? AND state = 1 LIMIT 1', [email]);
    if (!user) return invalid();

    const [reset] = await query(
      'SELECT id, code_hash, attempts FROM password_resets WHERE users_id = ? AND expires_at > NOW()',
      [user.id]
    );
    if (!reset) return invalid();

    if (reset.attempts >= MAX_ATTEMPTS) {
      await query('DELETE FROM password_resets WHERE id = ?', [reset.id]);
      return res.status(429).json({ success: false, message: 'Demasiados intentos. Pide un código nuevo.' });
    }

    if (!(await bcrypt.compare(code, reset.code_hash))) {
      await query('UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?', [reset.id]);
      return invalid();
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
    await query('DELETE FROM password_resets WHERE users_id = ?', [user.id]);

    return res.json({ success: true, message: 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.' });
  } catch (err) {
    console.error('reset-password:', err);
    return res.status(500).json({ success: false, message: 'Error de servidor' });
  }
};
