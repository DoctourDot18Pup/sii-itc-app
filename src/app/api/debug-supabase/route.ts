export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const urlDefined = !!url && url !== 'undefined'
  const keyDefined = !!key && key !== 'undefined'

  // Safe prefix — enough to confirm it's the right key without exposing it
  const keyPrefix = keyDefined ? key!.slice(0, 24) + '…' : null

  let supabaseStatus: number | null = null
  let supabaseError: string | null = null

  if (urlDefined && keyDefined) {
    try {
      const res = await fetch(`${url}/rest/v1/calendario_eventos?select=id&limit=1`, {
        headers: {
          apikey: key!,
          Authorization: `Bearer ${key!}`,
        },
      })
      supabaseStatus = res.status
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        supabaseError = text.slice(0, 200)
      }
    } catch (e) {
      supabaseError = String(e)
    }
  }

  return Response.json({
    urlDefined,
    keyDefined,
    keyPrefix,
    supabaseStatus,
    supabaseError,
    urlValue: urlDefined ? url : null,
  })
}
