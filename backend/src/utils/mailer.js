import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
// El .env está dentro del repositorio (ver .gitignore: no lo ignora si ya estaba
// versionado), así que las credenciales del correo van en .env.local, que sí se ignora.
dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env.local') });

// Cuenta que envía los correos. La contraseña NO es la de Gmail: es una
// "contraseña de aplicación" (Cuenta de Google > Seguridad > Contraseñas de
// aplicaciones) y va solo en backend/.env.local, nunca en el código.
const { SMTP_USER, SMTP_PASS } = process.env;

export const isMailConfigured = () => Boolean(SMTP_USER && SMTP_PASS);

let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
};

export const sendPasswordResetCode = async (to, code, minutes) => {
  await getTransporter().sendMail({
    from: `"TUSALUD+" <${SMTP_USER}>`,
    to,
    subject: 'Código para restablecer tu contraseña - TUSALUD+',
    text:
      `Tu código para restablecer la contraseña de TUSALUD+ es: ${code}\n\n` +
      `Vence en ${minutes} minutos. Si no lo pediste, ignora este mensaje: tu contraseña no cambia.`,
    html:
      `<p>Tu código para restablecer la contraseña de <b>TUSALUD+</b> es:</p>` +
      `<p style="font-size:28px;letter-spacing:6px;font-weight:bold">${code}</p>` +
      `<p>Vence en ${minutes} minutos. Si no lo pediste, ignora este mensaje: tu contraseña no cambia.</p>`,
  });
};
