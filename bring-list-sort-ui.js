(() => {
  const SORT_KEY='bring_list_sort_v2', DIR_KEY='bring_list_sort_dir_v2';
  const rank = text => {
    if (text.includes('Deli és Peti')) return 1;
    if (text.includes('Tina és Kristóf')) return 2;
    if (text.includes('Ármin')) return 3;
    if (text.includes('Ott vesszük')) return 4;
    if (text.includes('Még senki')) return 99;
    return 50;
  };
  function sortDom(){
    const list=document.getElementById('bring-list'); if(!list) return;
    const mode=localStorage.getItem(SORT_KEY)||'assignee';
    const dir=localStorage.getItem(DIR_KEY)==='desc'?-1:1;
    [...list.querySelectorAll(':scope > .bring-card')].sort((a,b)=>{
      let c=0;
      if(mode==='name') c=(a.querySelector('h3')?.textContent||'').localeCompare(b.querySelector('h3')?.textContent||'','hu');
      else if(mode==='assignee') c=rank(a.querySelector('.bring-card__assignees')?.textContent||'')-rank(b.querySelector('.bring-card__assignees')?.textContent||'');
      else c=([...list.children].indexOf(a)-[...list.children].indexOf(b));
      if(!c) c=(a.querySelector('h3')?.textContent||'').localeCompare(b.querySelector('h3')?.textContent||'','hu');
      return c*dir;
    }).forEach(x=>list.appendChild(x));
  }
  function addControls(){
    const filters=document.querySelector('.bring-filters'); if(!filters || document.querySelector('.bring-sort')) return;
    const wrap=document.createElement('div'); wrap.className='bring-sort';
    const current=localStorage.getItem(SORT_KEY)||'assignee';
    const dir=localStorage.getItem(DIR_KEY)==='desc';
    wrap.innerHTML=`<label for="bring-sort-select">Rendezés:</label><select id="bring-sort-select"><option value="assignee">Ki hozza?</option><option value="name">Megnevezés</option></select><button id="bring-sort-dir" type="button" aria-label="Rendezési irány">${dir?'↓':'↑'}</button>`;
    filters.insertAdjacentElement('afterend',wrap);
    const select=wrap.querySelector('select'); select.value=current;
    select.addEventListener('change',()=>{localStorage.setItem(SORT_KEY,select.value);sortDom();});
    wrap.querySelector('button').addEventListener('click',()=>{localStorage.setItem(DIR_KEY,localStorage.getItem(DIR_KEY)==='desc'?'asc':'desc');wrap.querySelector('button').textContent=localStorage.getItem(DIR_KEY)==='desc'?'↓':'↑';sortDom();});
  }
  const observer=new MutationObserver(()=>{ addControls(); sortDom(); });
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',()=>{addControls();sortDom();});
})();
