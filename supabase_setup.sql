-- ==================================================================
-- Noszvaj és környéke — Supabase séma és seed adatok
-- (STEP 3: táblák / kulcsok / RLS  +  STEP 4: demo programok)
-- ==================================================================
-- HASZNÁLAT:
--   Supabase Dashboard → SQL Editor → New query → illeszd be a teljes
--   fájlt → Run. A script a teljes séma felépítését egyszerre végzi el.
--
-- Ha újra le akarod futtatni (pl. tesztelés után nulláról), előtte:
--   drop table if exists public.votes;
--   drop table if exists public.programs;
-- ==================================================================


-- ------------------------------------------------------------------
-- 1) PROGRAMS TÁBLA
-- ------------------------------------------------------------------
create table if not exists public.programs (
  id                  bigint generated always as identity primary key,
  title               text not null,
  category            text not null
                        check (category in ('termeszet','viz','gyerek','latnivalo','kisvasut')),
  icon                text,
  image_url           text,
  description         text,
  distance_km         numeric(6,2),
  drive_minutes       integer,
  duration            text,          -- megjelenített szöveg, pl. "1–2 óra"
  duration_hours_min  numeric(4,1),  -- csak rendezéshez ("Legrövidebb"), nem jelenik meg a UI-n
  price               text,          -- megjelenített szöveg, pl. "Ingyenes" / "Belépős" / "Felnőtt 1 000 Ft, gyermek 500 Ft"
  price_sort_value    integer,       -- csak rendezéshez ("Ár szerint"): 0 = ingyenes, nagyobb = drágább/ismeretlen ár
  google_maps_url     text,
  official_url        text,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now()
);

comment on table public.programs is 'A noszvaji utazás választható programjai.';
comment on column public.programs.duration_hours_min is 'Rendezési segédmező, nem jelenik meg a UI-n.';
comment on column public.programs.price_sort_value is 'Rendezési segédmező, nem jelenik meg a UI-n.';


-- ------------------------------------------------------------------
-- 2) VOTES TÁBLA
-- ------------------------------------------------------------------
create table if not exists public.votes (
  id            bigint generated always as identity primary key,
  program_id    bigint not null references public.programs (id) on delete cascade,
  user_name     text not null
                  check (user_name in ('Deli','Peti','Ármin','Tina','Kristóf')),
  vote_type     text not null check (vote_type in ('like','dislike')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- egy felhasználó egy programra csak egy szavazattal rendelkezhet
  constraint votes_program_user_unique unique (program_id, user_name)
);

comment on table public.votes is 'Like/Dislike szavazatok — max. 1 szavazat / fő / program.';

-- updated_at automatikus frissítése minden módosításnál
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_votes_updated_at on public.votes;
create trigger trg_votes_updated_at
  before update on public.votes
  for each row
  execute function public.set_updated_at();


-- ------------------------------------------------------------------
-- 3) ROW LEVEL SECURITY
-- ------------------------------------------------------------------
-- FONTOS, amit érdemes tudni: mivel a specifikáció szerint nincs
-- valódi authentication (a névválasztás csak localStorage, nincs
-- jelszó/OAuth), az adatbázis szintjén nem lehet kriptográfiailag
-- garantálni, hogy valaki csak a saját neve alatt szavaz — bárki, aki
-- ismeri az anon kulcsot, technikailag be tudna küldeni szavazatot
-- más nevében is. Ez a specifikációban is vállalt, tudatos
-- egyszerűsítés egy 5 fős, zárt, bizalmi körben használt MVP-hez.
-- Amit az RLS itt ténylegesen garantál:
--   - a programs tábla az anon kulccsal KIZÁRÓLAG olvasható, nem írható
--     (a programok kezelése a Supabase Dashboardból történik)
--   - a votes táblába csak a rögzített 5 névvel és csak "like"/"dislike"
--     értékkel lehet szavazatot beküldeni (lásd check constraint-ek)
--   - egy név egy programra csak 1 szavazatot hozhat létre (unique constraint)

alter table public.programs enable row level security;
alter table public.votes    enable row level security;

-- programs: mindenki olvashatja az aktív programokat; írás nincs az API-n keresztül
drop policy if exists "programs_select_active" on public.programs;
create policy "programs_select_active"
  on public.programs for select
  to anon, authenticated
  using (is_active = true);

-- votes: mindenki lát minden szavazatot (kell a "Ki hogyan szavazott?" nézethez)
drop policy if exists "votes_select_all" on public.votes;
create policy "votes_select_all"
  on public.votes for select
  to anon, authenticated
  using (true);

drop policy if exists "votes_insert_all" on public.votes;
create policy "votes_insert_all"
  on public.votes for insert
  to anon, authenticated
  with check (true);

drop policy if exists "votes_update_all" on public.votes;
create policy "votes_update_all"
  on public.votes for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "votes_delete_all" on public.votes;
create policy "votes_delete_all"
  on public.votes for delete
  to anon, authenticated
  using (true);

-- jogosultságok (a legtöbb Supabase projektben ez alapból be van állítva
-- a public sémára, de biztos, ami biztos, explicit módon is megadjuk)
grant usage on schema public to anon, authenticated;
grant select on public.programs to anon, authenticated;
grant select, insert, update, delete on public.votes to anon, authenticated;


-- ------------------------------------------------------------------
-- 4) DEMO PROGRAMOK FELTÖLTÉSE (ugyanaz a 4 program, mint a Step 1 UI-ban)
-- ------------------------------------------------------------------
insert into public.programs
  (title, category, icon, image_url, description, distance_km, drive_minutes,
   duration, duration_hours_min, price, price_sort_value,
   google_maps_url, official_url, is_active)
values
  (
    'Síkfőkúti tavak', 'termeszet', 'tree',
    'https://commons.wikimedia.org/wiki/Special:FilePath/A_S%C3%ADkf%C5%91k_Project_panor%C3%A1ma_k%C3%A9pe.jpg',
    'Tavak, erdő, forrás, patak és játszótér. Kellemes, árnyékos séta kisgyerekkel is.',
    1.2, 3,
    '1–2 óra', 1, 'Ingyenes', 0,
    'https://www.google.com/maps/search/?api=1&query=S%C3%ADkf%C5%91k%C3%BAti+tavak+Noszvaj',
    'https://www.google.com/search?q=S%C3%ADkf%C5%91k%C3%BAti+tavak+Noszvaj',
    true
  ),
  (
    'Bogácsi Gyógy- és Strandfürdő', 'viz', 'droplet',
    'https://commons.wikimedia.org/wiki/Special:FilePath/Therm%C3%A1lf%C3%BCrd%C5%91,_D%C3%B3zsa_Gy%C3%B6rgy_utca,_Bog%C3%A1cs2.jpg',
    'Pancsoló Paradicsom, gyerekmedencék és csúszdák. Tökéletes nyári program.',
    10, 15,
    '3–5 óra', 3, 'Belépős', 1,
    'https://www.google.com/maps/search/?api=1&query=Bog%C3%A1csi+Gy%C3%B3gy-+%C3%A9s+Strandf%C3%BCrd%C5%91',
    'https://www.bogacs.hu/index.php/hu/szabadido/programok/esemenynaptar/venue/8-bogacsi-gyogy-es-strandfurdo',
    true
  ),
  (
    'Noszvaji barlanglakások', 'latnivalo', 'crown',
    'https://commons.wikimedia.org/wiki/Special:FilePath/Barlanglak%C3%A1sok_Noszvajon.jpg',
    'Egyedülálló barlanglakások, érdekes történetekkel a noszvaji múltról.',
    1.5, 4,
    '1–1,5 óra', 1, 'Felnőtt 1 000 Ft, gyermek 500 Ft', 1000,
    'https://www.google.com/maps/search/?api=1&query=Noszvaji+barlanglak%C3%A1sok',
    'https://www.google.com/search?q=noszvaji+barlanglak%C3%A1sok',
    true
  ),
  (
    'Szilvásváradi kisvasút', 'kisvasut', 'train',
    'https://commons.wikimedia.org/wiki/Special:FilePath/Szalajka_Valley_Forest_Railway,_Mk48-403,_2016_Hungary.jpg',
    'A kisvasút felvisz a Szalajka-völgybe, nagy élmény a gyerekeknek is.',
    30, 40,
    '2–3 óra', 2, 'Belépős', 1,
    'https://www.google.com/maps/search/?api=1&query=Szilv%C3%A1sv%C3%A1radi+Erdei+Vas%C3%BAt',
    'https://www.szilvasvarad.hu/hu/szalajka-volgy/szilvasvaradi-erdei-kisvasut',
    true
  );


-- ------------------------------------------------------------------
-- 5) ELLENŐRZÉS — futtasd le külön, a script után, hogy lásd az eredményt
-- ------------------------------------------------------------------
-- select * from public.programs order by id;
-- select * from public.votes;
