const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { nombre, empresa, telefono, mensaje } = req.body || {};

  if (!nombre || !empresa || !mensaje) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8" /></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#2563eb,#06b6d4);padding:32px 36px;">
                <h1 style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                  Nexo<span style="opacity:0.85;">Pyme</span>
                </h1>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Nueva consulta recibida desde el formulario web</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:36px;">
                <h2 style="margin:0 0 24px;color:#0f172a;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;border-bottom:2px solid #e2e8f0;padding-bottom:12px;">
                  Datos del consultante
                </h2>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;width:130px;vertical-align:top;">
                      <span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Nombre</span>
                    </td>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                      <span style="font-size:15px;color:#0f172a;font-weight:500;">${escapeHtml(nombre)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                      <span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Empresa</span>
                    </td>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                      <span style="font-size:15px;color:#0f172a;font-weight:500;">${escapeHtml(empresa)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                      <span style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Teléfono</span>
                    </td>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                      <span style="font-size:15px;color:#0f172a;font-weight:500;">${telefono ? escapeHtml(telefono) : '—'}</span>
                    </td>
                  </tr>
                </table>

                <h2 style="margin:28px 0 12px;color:#0f172a;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Mensaje</h2>
                <div style="background:#f8fafc;border-left:3px solid #2563eb;border-radius:0 8px 8px 0;padding:16px 20px;">
                  <p style="margin:0;font-size:15px;color:#334155;line-height:1.7;white-space:pre-wrap;">${escapeHtml(mensaje)}</p>
                </div>

                <div style="margin-top:32px;padding:16px 20px;background:#eff6ff;border-radius:8px;border:1px solid #bfdbfe;">
                  <p style="margin:0;font-size:12px;color:#3b82f6;">
                    📅 Recibido el ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;">
                <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                  Este correo fue generado automáticamente por el formulario de <strong>nexopyme.com.ar</strong>
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `NexoPyme Web <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: 'CONSULTA FORMULARIO WEB',
      html,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error enviando email:', err.message);
    return res.status(500).json({ error: 'No se pudo enviar el correo. Intentá de nuevo.' });
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
