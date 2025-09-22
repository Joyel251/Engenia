import { supabaseAdmin, TABLES } from '@/lib/supabase';
import { hashPassword, comparePassword } from '@/lib/auth';

export async function POST(req) {
  try {
    const { username, oldPassword, newPassword } = await req.json();
    if (!username || !oldPassword || !newPassword) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    // Fetch admin user
    const { data: admin, error } = await supabaseAdmin
      .from(TABLES.ADMIN)
      .select('*')
      .eq('username', username)
      .single();
    if (error || !admin) {
      return new Response(JSON.stringify({ error: 'Admin not found' }), { status: 404 });
    }

    // If username is 'admin' and oldPassword is 'admin123', allow reset regardless of hash
    let valid = false;
    if (username === 'admin' && oldPassword === 'admin123') {
      valid = true;
    } else {
      valid = await comparePassword(oldPassword, admin.password);
    }
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Old password incorrect' }), { status: 401 });
    }

    // Hash new password
    const hashed = await hashPassword(newPassword);

    // Update password in DB
    const { error: updateErr } = await supabaseAdmin
      .from(TABLES.ADMIN)
      .update({ password: hashed })
      .eq('username', username);
    if (updateErr) {
      return new Response(JSON.stringify({ error: 'Failed to update password' }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
