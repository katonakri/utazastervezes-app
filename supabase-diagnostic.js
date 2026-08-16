document.addEventListener('DOMContentLoaded', async () => {
  const el = document.getElementById('program-list');
  if (!el || !window.supabase) return;

  try {
    const result = await window.supabase
      .from('programs')
      .select('id, title, is_active')
      .order('id', { ascending: true })
      .limit(1);

    if (result.error) {
      console.error('Supabase programs diagnostic:', result.error);
      el.innerHTML = `<div class="empty-state"><p><strong>Nem sikerült betölteni a programokat.</strong></p><p style="font-size:13px;margin-top:8px;">Supabase hiba: ${String(result.error.message || result.error)}</p><p style="font-size:12px;margin-top:8px;">F12 → Console alatt további részlet látható.</p></div>`;
    } else if (!result.data || result.data.length === 0) {
      console.warn('Supabase programs diagnostic: a lekérdezés 0 rekordot adott vissza.');
    }
  } catch (error) {
    console.error('Supabase diagnostic exception:', error);
    el.innerHTML = `<div class="empty-state"><p><strong>Supabase kapcsolati hiba.</strong></p><p style="font-size:13px;margin-top:8px;">${String(error.message || error)}</p></div>`;
  }
});
