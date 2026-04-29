'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth/session'
import { getKardex, getEstudiante } from '@/lib/api/estudiante'
import type { KardexData, EstudianteData } from '@/types/api'

export default function KardexImprimirPage() {
  const router = useRouter()
  const [kardex, setKardex] = useState<KardexData | null>(null)
  const [estudiante, setEstudiante] = useState<EstudianteData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) { router.replace('/login'); return }
    Promise.all([getKardex(token), getEstudiante(token)])
      .then(([k, e]) => { setKardex(k); setEstudiante(e) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div style={{ padding: 40, fontFamily: 'Arial, sans-serif', fontSize: 13, color: '#555' }}>
        Cargando datos del kardex…
      </div>
    )
  }

  if (!kardex || !estudiante) {
    return (
      <div style={{ padding: 40, fontFamily: 'Arial, sans-serif' }}>
        No se pudieron cargar los datos. Cierra esta ventana e intenta de nuevo.
      </div>
    )
  }

  const hoy = new Date().toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const indiceRep = Number(estudiante.materias_cursadas) > 0
    ? ((Number(estudiante.materias_reprobadas) / Number(estudiante.materias_cursadas)) * 100).toFixed(0)
    : '0'

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, Helvetica, sans-serif; background: #e8e8e8; }

        .boleta {
          max-width: 900px;
          margin: 0 auto;
          padding: 28px 36px;
          background: #fff;
          min-height: 100vh;
        }

        .toolbar {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          align-items: center;
        }

        .btn-print {
          padding: 9px 22px;
          background: #0b2a1a;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          font-family: Arial, sans-serif;
        }

        .btn-back {
          padding: 9px 16px;
          background: transparent;
          border: 1.5px solid #ccc;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13px;
          font-family: Arial, sans-serif;
          color: #555;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 10px;
          border-bottom: 2px solid #222;
          margin-bottom: 12px;
          gap: 12px;
        }

        .header-logos {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 8px;
          font-weight: 700;
          color: #444;
          text-align: center;
          line-height: 1.3;
        }

        .logo-sep {
          width: 44px; height: 44px;
          border: 1px solid #999;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 7px; font-weight: 700; color: #555; text-align: center;
          padding: 4px;
          line-height: 1.2;
        }

        .logo-tecnm {
          width: 44px; height: 44px;
          border: 1px solid #999;
          border-radius: 4px;
          display: flex; align-items: center; justify-content: center;
          font-size: 7px; font-weight: 700; color: #555; text-align: center;
          padding: 4px;
          line-height: 1.3;
        }

        .header-title {
          flex: 1;
          text-align: center;
          font-size: 15px;
          font-weight: 700;
          color: #111;
          align-self: center;
        }

        .header-meta {
          font-size: 10px;
          line-height: 1.7;
          text-align: right;
          flex-shrink: 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px 32px;
          font-size: 11px;
          margin-bottom: 14px;
          line-height: 1.8;
        }

        table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 14px;
        }

        th {
          border: 1px solid #555;
          padding: 4px 6px;
          font-size: 9.5px;
          background: #e8e8e8;
          font-weight: 700;
          text-align: left;
          white-space: nowrap;
        }

        td {
          border: 1px solid #aaa;
          padding: 3px 6px;
          font-size: 9.5px;
          line-height: 1.3;
        }

        .num { text-align: center; }

        tr:nth-child(even) td { background: #fafafa; }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px 48px;
          font-size: 11px;
          border: 1px solid #555;
          padding: 10px 14px;
          line-height: 1.9;
        }

        @media print {
          .toolbar { display: none !important; }
          body { background: #fff; }
          .boleta { padding: 12px 20px; min-height: auto; }

          tr { page-break-inside: avoid; }
        }

        @page {
          size: A4;
          margin: 12mm 10mm;
        }
      `}</style>

      <div className="boleta">
        {/* Barra de herramientas */}
        <div className="toolbar">
          <button className="btn-print" onClick={() => window.print()}>
            🖨 Imprimir / Guardar como PDF
          </button>
          <button className="btn-back" onClick={() => window.close()}>
            ✕ Cerrar
          </button>
          <span style={{ fontSize: 11, color: '#888', marginLeft: 4 }}>
            Al guardar como PDF, selecciona "Guardar como PDF" como destino de impresión.
          </span>
        </div>

        {/* Encabezado */}
        <div className="header">
          <div className="header-logos">
            <div className="logo-sep">Secretaría de Educación Pública</div>
            <div className="logo-tecnm">TECNOLÓGICO NACIONAL DE MÉXICO</div>
          </div>
          <div className="header-title">Instituto Tecnológico de Celaya</div>
          <div className="header-meta">
            <div><b>Clave:</b> 11DIT0003E</div>
            <div><b>Asunto:</b> Kardex</div>
            <div><b>Lugar:</b> Celaya, Gto</div>
            <div><b>Fecha:</b> {hoy}</div>
          </div>
        </div>

        {/* Datos del estudiante */}
        <div className="info-grid">
          <div><b>Matrícula:</b> {estudiante.numero_control}</div>
          <div><b>Nivel:</b> Licenciatura</div>
          <div><b>Nombre:</b> {estudiante.persona}</div>
          <div><b>Plan de estudios:</b> Ingeniería en Sistemas Computacionales</div>
          <div><b>Semestre / grupo:</b> {estudiante.semestre}</div>
          <div><b>Turno:</b> C.Celaya</div>
        </div>

        {/* Tabla del kardex */}
        <table>
          <thead>
            <tr>
              <th>Clave</th>
              <th>Materia</th>
              <th className="num">Créditos</th>
              <th className="num">Calificación</th>
              <th>Opción</th>
              <th className="num">Semestre</th>
              <th>Periodo</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {kardex.kardex.map((item, i) => (
              <tr key={i}>
                <td>{item.clave_materia}</td>
                <td>{item.nombre_materia}</td>
                <td className="num">{item.creditos}</td>
                <td className="num">{item.calificacion || '—'}</td>
                <td>{item.descripcion || 'NORMAL / ORDINARIO'}</td>
                <td className="num">{item.semestre}</td>
                <td>{item.periodo}</td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Estadísticas finales */}
        <div className="stats-grid">
          <div><b>Promedio ponderado:</b> {estudiante.promedio_ponderado}</div>
          <div><b>Promedio aritmético:</b> {estudiante.promedio_aritmetico}</div>
          <div><b>No. materias cursadas:</b> {estudiante.materias_cursadas}</div>
          <div><b>No. Materias aprobadas:</b> {estudiante.materias_aprobadas}</div>
          <div><b>No. Materias reprobadas:</b> {estudiante.materias_reprobadas}</div>
          <div><b>Indice de reprobación:</b> {indiceRep} %</div>
          <div><b>Créditos acumulados:</b> {estudiante.creditos_acumulados} / 260</div>
          <div><b>% de avance:</b> {Number(estudiante.porcentaje_avance).toFixed(2)} %</div>
        </div>
      </div>
    </>
  )
}
