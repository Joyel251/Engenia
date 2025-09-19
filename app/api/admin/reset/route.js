import { supabaseAdmin, TABLES } from '@/lib/supabase'
import { verifyTokenEdge } from '@/lib/edge-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req) {
  try {
    // Auth: require Bearer token
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const payload = await verifyTokenEdge(token)
    if (!payload?.adminId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
    }

    // 1) Delete all winners
    const { error: delErr } = await supabaseAdmin
      .from(TABLES.WINNERS)
      .delete()
      .neq('id', '')
    if (delErr) throw delErr

    // 1b) Reset all events to ONGOING
    const { error: evErr } = await supabaseAdmin
      .from(TABLES.EVENTS)
      .update({ status: 'ONGOING' })
      .neq('id', '')
    if (evErr) throw evErr

    // 2) Reset all department points to 0 (bulk UPDATE to avoid NOT NULL constraint issues)
    const { error: updErr } = await supabaseAdmin
      .from(TABLES.DEPARTMENTS)
      .update({ points: 0 })
      .neq('id', '')
    if (updErr) throw updErr

    // 3) Reset settings to defaults
    const defaults = { leaderboardVisible: true, lockdown: false, showPodium: false }
    // Try update existing row; if none, insert default with id '1'
    const { data: settingsList, error: getSErr } = await supabaseAdmin
      .from(TABLES.SETTINGS)
      .select('id')
    if (getSErr) throw getSErr
    if (settingsList && settingsList.length > 0) {
      const { error: setErr } = await supabaseAdmin
        .from(TABLES.SETTINGS)
        .update(defaults)
        .neq('id', '')
      if (setErr) throw setErr
    } else {
      const { error: insErr } = await supabaseAdmin
        .from(TABLES.SETTINGS)
        .insert([{ id: '1', ...defaults }])
      if (insErr) throw insErr
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (error) {
    console.error('[admin reset] failed:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 })
  }
}
