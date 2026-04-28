import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { EVENTOS_ACADEMICOS, CATEGORIA_CONFIG, type CategoriaEvento } from '@/lib/data/calendario-academico'

// Vercel Cron invoca esta ruta a las 8:00 AM hora CDMX (UTC-6) todos los días
// Configurado en vercel.json → crons[].schedule = "0 14 * * *"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // service role, NO la anon key
)

function htmlEmail(nombre: string, eventos: typeof EVENTOS_ACADEMICOS): string {
  const filas = eventos.map(e => {
    const cfg = CATEGORIA_CONFIG[e.categoria as CategoriaEvento]
    const rango = e.fecha_fin && e.fecha_fin !== e.fecha_inicio
      ? `${e.fecha_inicio} – ${e.fecha_fin}`
      : e.fecha_inicio
    return `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #e6e3d6;">
          <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;background:${cfg.badge};color:${cfg.text};margin-bottom:4px;">${cfg.label}</span>
          <div style="font-weight:600;font-size:13px;color:#1b1d1a;">${e.titulo}</div>
          <div style="font-size:12px;color:#6b7280;margin-top:2px;">${rango}</div>
        </td>
      </tr>`
  }).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fbf9f3;font-family:Inter,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;border:1px solid #e6e3d6;overflow:hidden;">
    <tr>
      <td style="background:#0b2a1a;padding:28px 32px;">
        <div style="color:#b8975b;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:6px;">SII Linces · TecNM Celaya</div>
        <div style="color:#fff;font-size:20px;font-weight:700;">Recordatorio académico</div>
        <div style="color:rgba(243,234,219,.7);font-size:13px;margin-top:4px;">Hola ${nombre}, estos eventos se aproximan:</div>
      </td>
    </tr>
    <tr><td><table width="100%" cellpadding="0" cellspacing="0">${filas}</table></td></tr>
    <tr>
      <td style="padding:20px 32px;background:#fbf9f3;border-top:1px solid #e6e3d6;">
        <div style="font-size:11px;color:#9ca3af;">
          Recibiste este correo porque activaste las notificaciones en <b>SII Linces</b>.<br>
          Puedes desactivarlas en cualquier momento desde la sección Calendario de la app.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function GET(req: NextRequest) {
  // Verificar que la petición viene de Vercel Cron (o de un cliente autorizado)
  const secret = req.headers.get('authorization')
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  // Obtener estudiantes con notificaciones activas
  const { data: configs, error } = await supabaseAdmin
    .from('notificaciones_config')
    .select('*')
    .eq('activo', true)

  if (error || !configs?.length) {
    return NextResponse.json({ enviados: 0, mensaje: 'Sin suscriptores activos' })
  }

  let enviados = 0

  for (const cfg of configs) {
    const limite = new Date(hoy)
    limite.setDate(limite.getDate() + cfg.dias_anticipacion)
    const limiteStr = limite.toISOString().slice(0, 10)
    const hoyStr = hoy.toISOString().slice(0, 10)

    const eventosPendientes = EVENTOS_ACADEMICOS.filter(e =>
      cfg.categorias.includes(e.categoria) &&
      e.importante &&
      e.fecha_inicio >= hoyStr &&
      e.fecha_inicio <= limiteStr
    )

    if (eventosPendientes.length === 0) continue

    const nombre = cfg.numero_control  // fallback si no tenemos el nombre
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SII Linces <noreply@sii-linces.celaya.tecnm.mx>',
        to: [cfg.email],
        subject: `📅 Recordatorio: ${eventosPendientes.length} evento${eventosPendientes.length > 1 ? 's' : ''} próximo${eventosPendientes.length > 1 ? 's' : ''}`,
        html: htmlEmail(nombre, eventosPendientes),
      }),
    })

    if (res.ok) enviados++
  }

  return NextResponse.json({ enviados, total: configs.length })
}
