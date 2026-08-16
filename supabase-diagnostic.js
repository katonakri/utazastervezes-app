/* Temporary Supabase diagnostic. Remove after the connection is verified. */
window.addEventListener('load', async () => {
  const el = document.getElementById('program-list');
  if (!el || !window.supabase) return;

  try {
    const result = await window.supabase
      .from('programs')
      .select('id,title,is_active')
      .order('id', { ascending: true })
      .limit(5);

    if (result.error) {
      console.error('SUPABASE PROGRAMS ERROR', result.error);
      el.innerHTML = `<div class="empty-state"><p><strong>Supabase hiba</strong></p><p style="font-size:13px;margin-top:8px;word-break:break-word">${escapeDebug(result.error.message)}</p><p style="font-size:12px;margin-top:8px">Code: ${escapeDebug(result.error.code || '')}</p></div>`;
      return;
    }

    console.log('SUPABASE PROGRAMS TEST', result.data);
    const active = (result.data || []).filter(p => p.is_active === true).length;
    const inactive = (result.data || []).filter(p => p.is_active !== true).length;

    if (!result.data || result.data.length === 0) {
      el.innerHTML = `<div class="empty-state"><p><strong>A Supabase lekérdezés 0 programot adott vissza.</strong></p><p style="font-size:13px;margin-top:8px">A kapcsolat működik, de az API nem lát rekordot a programs táblában.</p></div>`;
    } else if (active === 0) {
      el.innerHTML = `<div class="empty-state"><p><strong>Megvan a kapcsolat, de nincs aktív program.</strong></p><p style="font-size:13px;margin-top:8px">Tesztelt rekordok: ${result.data.length}, aktív: ${active}, inaktív: ${inactive}.</p></div>`;
    } else {
      el.innerHTML = `<div class="empty-state"><p><strong>A Supabase kapcsolat működik.</strong></p><p style="font-size:13px;margin-top:8px">Tesztelt rekordok: ${result.data.length}, aktív: ${active}. Első program: ${escapeDebug(result.data[0].title)}</p></div>`;
    }
  } catch (e) {
    console.error('SUPABASE DIAGNOSTIC EXCEPTION', e);
    el.innerHTML = `<div class="empty-state"><p><strong>Supabase kapcsolati hiba</strong></p><p style="font-size:13px;margin-top:8px;word-break:break-word">${escapeDebug(e.message || e)}</p></div>`;
  }
});

function escapeDebug(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
