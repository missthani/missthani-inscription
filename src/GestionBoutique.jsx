-- ============================================================
-- MISS THANI — Istorik mouvman stòk
-- Kole nan Supabase → SQL Editor → New snippet → Run
-- ============================================================
create table if not exists mouvements_stock (
  id uuid primary key default gen_random_uuid(),
  produit_id uuid references produits(id) on delete cascade,
  delta int not null,                 -- +5 = antre, -1 = sòti
  motif text,                         -- vente · reassort · perte · inventaire · correction
  cree_le timestamptz default now()
);
create index if not exists idx_mouv_produit on mouvements_stock(produit_id);

alter table mouvements_stock enable row level security;
drop policy if exists lire_mouv on mouvements_stock;
create policy lire_mouv on mouvements_stock for select using (true);
drop policy if exists creer_mouv on mouvements_stock;
create policy creer_mouv on mouvements_stock for insert with check (true);
