/* Temporary Supabase diagnostic. Remove after the connection is verified. */
window.addEventListener('load', async () => {
  const el = document.getElementById('program-list');
  if (!el || !window.supabase) return;

  try {
    const all = await window.supabase
      .from('programs')
      .select('id,title,is_active')
      .order('id', { ascending: true })
      .limit(5);

    if (all.error) {
      console.error('SUPABASE PROGRAMS ERROR', all.error);
      el.innerHTML = `<div class="empty-state"><p><strong>Supabase hiba</strong></p><p style="font-size:13px;margin-top:8px;word-break:break-word">${escapeDebug(all.error.message)}</p><p style="font-size:12px;margin-top:8px">Code: ${escapeDebug(all.error.code || '')}</p></div>`;
      return;
    }

    console.log('SUPABASE PROGRAMS TEST', all.data);
    const active = (all.data || []).filter(p => p.is_active === true).length;
    const inactive = (all.data || []).filter(p => p.is_active !== true).length;

    if (!all.data || all.data.length === 0) {
      el.innerHTML = `<div class="empty-state"><p><strong>A Supabase lekérdezés 0 programot adott vissza.</strong></p><p style="font-size:13px;margin-top:8px">A kapcsolat működik, de az API nem lát rekordot a programs táblában.</p></div>`;
    } else if (active === 0) {
      el.innerHTML = `<div class="empty-state"><p><strong>Megvan a kapcsolat, de nincs aktív program.</strong></p><p style="font-size:13px;margin-top:8px">Tesztelt rekordok: ${all.data.length}, aktív: ${active}, inaktív: ${inactive}.</p></div>`;
    } else {
      el.innerHTML = `<div class="empty-state"><p><strong>A Supabase kapcsolat működik.</strong></p><p style="font-size:13px;margin-top:8px">Tesztelt rekordok: ${all.data.length}, aktív: ${active}. Első program: ${escapeDebug(all.data[0].title)}</p></div>`;
    }
  } catch (e) {
    console.error('SUPABASE DIAGNOSTIC EXCEPTION', e);
    el.innerHTML = `<div class="empty-state"><p><strong>Supabase kapcsolati hiba</strong></p><p style="font-size:13px;margin-top:8px;word-break:break-word">${escapeDebug(e.message || e)}</p></div>`;
  }
});

function escapeDebug(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
