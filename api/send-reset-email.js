import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email requerido' })

  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim().toLowerCase(),
      options: { redirectTo: `${process.env.SITE_URL}/reset-password` }
    })

    if (error) throw error

    const resend = new Resend(process.env.RESEND_API_KEY)

    await resend.emails.send({
      from: 'Nexo Capital <noreply@nexocapital.com>',
      to: email.trim().toLowerCase(),
      subject: 'Recupera tu contraseña — Nexo Capital',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px 16px;">
          <h2 style="color:#0B1F33;margin-bottom:8px;">Recupera tu contraseña</h2>
          <p style="color:#444;">Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Nexo Capital</strong>.</p>
          <p style="color:#444;">Haz clic en el botón para crear una nueva contraseña:</p>
          <a href="${data.properties.action_link}"
             style="display:inline-block;background:#16D5B5;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;margin:16px 0;">
            Restablecer contraseña
          </a>
          <p style="color:#888;font-size:13px;margin-top:24px;">Este enlace expira en 1 hora. Si no solicitaste esto, puedes ignorar este correo.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
          <p style="color:#bbb;font-size:12px;">Nexo Capital — Servicios Financieros</p>
        </div>
      `
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('send-reset-email error:', err)
    return res.status(500).json({ error: 'No se pudo enviar el correo' })
  }
}
