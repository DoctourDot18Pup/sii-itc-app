-- Eventos personales del estudiante
CREATE TABLE IF NOT EXISTS public.calendario_eventos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo      TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin    TIMESTAMPTZ,
  numero_control TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cal_eventos_nc ON public.calendario_eventos (numero_control);

-- Preferencias de notificaciones por correo
CREATE TABLE IF NOT EXISTS public.notificaciones_config (
  numero_control   TEXT PRIMARY KEY,
  email            TEXT NOT NULL,
  activo           BOOLEAN DEFAULT FALSE,
  dias_anticipacion INTEGER DEFAULT 3,
  categorias       TEXT[] DEFAULT ARRAY['evaluacion','suspension','evento'],
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: cada estudiante solo ve sus propios datos
ALTER TABLE public.calendario_eventos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones_config ENABLE ROW LEVEL SECURITY;

-- Políticas abiertas para anon key (el JWT del estudiante no pasa a Supabase Auth,
-- el control de acceso lo hace la app al filtrar por numero_control)
CREATE POLICY "acceso_anonimo_cal" ON public.calendario_eventos   FOR ALL TO anon USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "acceso_anonimo_notif" ON public.notificaciones_config FOR ALL TO anon USING (TRUE) WITH CHECK (TRUE);
