import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — GESTION DE LA BOUTIQUE
   Kòmand · Paiements · Produits & stock
   Aksè: modpas (chanje l anba a)
   ============================================================ */

const MOT_DE_PASSE = "boutique2026";

const C = {
  bg: "#F7F2F6", card: "#FFFFFF", ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.58)", inkFaint: "rgba(58,14,51,.38)",
  blush: "#E5247E", magenta: "#C2238E", gold: "#E0A50A",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};

const gdes = (n) => Number(n || 0).toLocaleString("fr-FR") + " gdes";
const quand = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) + " · " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

const STATUTS = [
  { k: "a_preparer", l: "À préparer", tone: "warn" },
  { k: "prete", l: "Prête", tone: "info" },
  { k: "livree", l: "Livrée", tone: "ok" },
  { k: "annulee", l: "Annulée", tone: "bad" },
];
const statutDe = (k) => STATUTS.find((s) => s.k === k) || STATUTS[0];

function Badge({ tone = "neutral", children }) {
  const map = {
    ok: ["rgba(30,132,73,.10)", C.green], warn: ["rgba(224,165,10,.16)", "#9A7000"],
    info: ["rgba(194,35,142,.10)", C.magenta], bad: ["rgba(192,57,43,.10)", C.danger],
    neutral: ["rgba(58,14,51,.06)", C.inkSoft],
  };
  const [bg, fg] = map[tone] || map.neutral;
  return <span style={{ background: bg, color: fg, fontSize: 10.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
}

function Card({ children, style }) {
  return <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: "0 6px 20px rgba(142,44,154,.06)", ...style }}>{children}</div>;
}

const btnPrim = { border: "none", borderRadius: 999, padding: "9px 16px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", fontFamily: "'Inter',sans-serif" };
const btnGhost = { border: `1.3px solid ${C.line}`, borderRadius: 999, padding: "8px 14px", background: "#fff", color: C.ink, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", fontFamily: "'Inter',sans-serif" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 11, border: `1.3px solid ${C.line}`, background: "#fff", color: C.ink, fontSize: 13, fontFamily: "'Inter',sans-serif", outline: "none" };

/* ============================ TABLEAU DE BORD ============================ */
function Bord({ go }) {
  const [d, setD] = useState(null);

  useEffect(() => {
    (async () => {
      const [c, p, pa] = await Promise.all([
        supabase.from("commandes").select("*").order("cree_le", { ascending: false }),
        supabase.from("produits").select("*"),
        supabase.from("paiements").select("*").eq("objet", "commande"),
      ]);
      setD({ commandes: c.data || [], produits: p.data || [], paiements: pa.data || [] });
    })();
  }, []);

  if (!d) return <p style={{ color: C.inkSoft, fontSize: 13 }}>Chargement…</p>;

  const jour = (iso) => (iso || "").slice(0, 10);
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const valides = d.commandes.filter((c) => c.statut !== "annulee");
  const ventesJour = valides.filter((c) => jour(c.cree_le) === aujourdhui).reduce((s, c) => s + Number(c.total || 0), 0);
  const aPreparer = d.commandes.filter((c) => c.statut === "a_preparer").length;
  const enAttente = d.paiements.filter((p) => p.statut === "en_attente").length;
  const alertes = d.produits.filter((p) => Number(p.stock) <= 5);

  /* 7 dènye jou yo */
  const jours = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(); dt.setDate(dt.getDate() - i);
    const iso = dt.toISOString().slice(0, 10);
    const v = valides.filter((c) => jour(c.cree_le) === iso).reduce((s, c) => s + Number(c.total || 0), 0);
    jours.push({ iso, l: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][dt.getDay()], v });
  }
  const max = Math.max(1, ...jours.map((j) => j.v));
  const semaine = jours.reduce((s, j) => s + j.v, 0);

  const Kpi = ({ l, v, c, onClick }) => (
    <Card style={{ padding: 13, cursor: onClick ? "pointer" : "default" }}>
      <div onClick={onClick}>
        <div style={{ fontSize: 20, fontWeight: 800, color: c, lineHeight: 1.1 }}>{v}</div>
        <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>{l}</div>
      </div>
    </Card>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <Kpi l="Ventes du jour" v={gdes(ventesJour)} c={C.ink} />
        <Kpi l="Commandes à préparer" v={String(aPreparer)} c={C.blush} onClick={() => go("commandes")} />
        <Kpi l="Paiements à vérifier" v={String(enAttente)} c={C.gold} onClick={() => go("paiements")} />
        <Kpi l="Alertes de stock" v={String(alertes.length)} c={alertes.length ? C.danger : C.green} onClick={() => go("produits")} />
      </div>

      <Card style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>Ventes — 7 derniers jours</span>
          <Badge tone="info">{gdes(semaine)}</Badge>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
          {jours.map((j) => (
            <div key={j.iso} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: C.inkSoft }}>{j.v ? (j.v >= 1000 ? (j.v / 1000).toFixed(1) + "k" : j.v) : ""}</span>
              <div style={{ width: "100%", height: `${(j.v / max) * 100}%`, minHeight: j.v ? 6 : 2, borderRadius: "5px 5px 0 0", background: j.v ? `linear-gradient(180deg, ${C.blush}, ${C.magenta})` : "rgba(142,44,154,.10)" }} />
              <span style={{ fontSize: 9.5, color: C.inkFaint, fontWeight: 700 }}>{j.l}</span>
            </div>
          ))}
        </div>
      </Card>

      {alertes.length > 0 && (
        <Card style={{ padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink, marginBottom: 8 }}>Stock faible</div>
          {alertes.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
              <span style={{ fontSize: 18 }}>{p.emoji}</span>
              <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: C.ink }}>{p.nom}</span>
              <Badge tone={Number(p.stock) <= 0 ? "bad" : "warn"}>{Number(p.stock) <= 0 ? "Rupture" : p.stock + " restants"}</Badge>
            </div>
          ))}
        </Card>
      )}

      <Card style={{ padding: 14 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink, marginBottom: 8 }}>Dernières commandes</div>
        {d.commandes.slice(0, 4).map((c, i) => {
          const st = statutDe(c.statut);
          return (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{c.nom_client || "Sans nom"}</div>
                <div style={{ fontSize: 10.5, color: C.inkFaint }}>{quand(c.cree_le)}</div>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: C.magenta }}>{gdes(c.total)}</span>
              <Badge tone={st.tone}>{st.l}</Badge>
            </div>
          );
        })}
        {d.commandes.length === 0 && <p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune commande encore.</p>}
      </Card>
    </>
  );
}

/* ============================ KLIYAN ============================ */
function Clientes() {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("commandes").select("*").neq("statut", "annulee");
      const m = {};
      (data || []).forEach((c) => {
        const k = c.telephone || c.nom_client;
        if (!m[k]) m[k] = { nom: c.nom_client, tel: c.telephone, n: 0, total: 0, dernier: c.cree_le };
        m[k].n += 1; m[k].total += Number(c.total || 0);
        if (c.cree_le > m[k].dernier) m[k].dernier = c.cree_le;
      });
      setRows(Object.values(m).sort((a, b) => b.total - a.total));
    })();
  }, []);

  if (rows === null) return <p style={{ color: C.inkSoft, fontSize: 13 }}>Chargement…</p>;
  if (rows.length === 0) return <Card style={{ padding: 26, textAlign: "center" }}><p style={{ margin: 0, fontSize: 13, color: C.inkSoft }}>Aucune cliente pour le moment.</p></Card>;

  return (
    <>
      <div style={{ marginBottom: 12 }}><Badge tone="info">{rows.length} cliente{rows.length > 1 ? "s" : ""}</Badge></div>
      {rows.map((c) => (
        <Card key={c.tel || c.nom} style={{ padding: 13, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <span style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(229,36,126,.10)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
              {(c.nom || "?").split(" ").map((x) => x[0]).slice(0, 2).join("")}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{c.nom || "Sans nom"}</div>
              <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>{c.tel} · {c.n} commande{c.n > 1 ? "s" : ""} · dernière {quand(c.dernier)}</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: C.magenta }}>{gdes(c.total)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <a href={`https://wa.me/509${c.tel}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, padding: "6px 12px", fontSize: 11.5, color: C.green, borderColor: "rgba(30,132,73,.35)", textDecoration: "none" }}>Écrire</a>
          </div>
        </Card>
      ))}
    </>
  );
}

/* ============================ KÒMAND ============================ */
function Commandes() {
  const [rows, setRows] = useState(null);
  const [lignes, setLignes] = useState({});
  const [filtre, setFiltre] = useState("a_preparer");
  const [ouvert, setOuvert] = useState("");

  const charger = async () => {
    const { data } = await supabase.from("commandes").select("*").order("cree_le", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { charger(); }, []);

  const voir = async (id) => {
    if (ouvert === id) { setOuvert(""); return; }
    setOuvert(id);
    if (!lignes[id]) {
      const { data } = await supabase.from("commande_lignes").select("*").eq("commande_id", id);
      setLignes((l) => ({ ...l, [id]: data || [] }));
    }
  };

  const changer = async (id, statut) => {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, statut } : x)));
    await supabase.from("commandes").update({ statut }).eq("id", id);
  };

  const list = (rows || []).filter((r) => filtre === "tous" || r.statut === filtre);

  return (
    <>
      <div className="mt-row" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
        {[{ k: "tous", l: "Toutes" }, ...STATUTS].map((s) => {
          const on = filtre === s.k;
          return <button key={s.k} onClick={() => setFiltre(s.k)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{s.l}</button>;
        })}
      </div>

      {rows === null ? <p style={{ color: C.inkSoft, fontSize: 13 }}>Chargement…</p> : list.length === 0 ? (
        <Card style={{ padding: 30, textAlign: "center" }}><p style={{ margin: 0, fontSize: 13, color: C.inkSoft }}>Aucune commande ici.</p></Card>
      ) : list.map((c) => {
        const st = statutDe(c.statut);
        const on = ouvert === c.id;
        return (
          <Card key={c.id} style={{ marginBottom: 10, overflow: "hidden" }}>
            <button onClick={() => voir(c.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 14, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{c.nom_client || "Sans nom"}</span>
                  <Badge tone={st.tone}>{st.l}</Badge>
                </div>
                <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 3 }}>
                  {c.telephone} · {c.mode_livraison === "livraison" ? "Livraison" : "Retrait"} · {quand(c.cree_le)}
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 800, color: C.magenta, flexShrink: 0 }}>{gdes(c.total)}</span>
            </button>

            {on && (
              <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${C.line}` }}>
                <div style={{ padding: "10px 0" }}>
                  {(lignes[c.id] || []).map((l) => (
                    <div key={l.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0", color: C.ink }}>
                      <span>{l.quantite} × {l.nom_produit}</span>
                      <span style={{ fontWeight: 700 }}>{gdes(l.quantite * l.prix_unitaire)}</span>
                    </div>
                  ))}
                  {c.adresse && <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 6 }}>📍 {c.adresse}</div>}
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {c.statut === "a_preparer" && <button onClick={() => changer(c.id, "prete")} style={btnPrim}>✓ Marquer prête</button>}
                  {c.statut === "prete" && <button onClick={() => changer(c.id, "livree")} style={btnPrim}>🚚 Marquer livrée</button>}
                  {c.statut !== "annulee" && c.statut !== "livree" && <button onClick={() => changer(c.id, "annulee")} style={{ ...btnGhost, color: C.danger, borderColor: "rgba(192,57,43,.35)" }}>Annuler</button>}
                  <a href={`https://wa.me/509${c.telephone}?text=${encodeURIComponent(`Bonjou ${c.nom_client}, kòmand ou nan boutik Miss Thani a ${c.statut === "prete" ? "prè" : "an preparasyon"}.`)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, textDecoration: "none", color: C.green, borderColor: "rgba(30,132,73,.35)" }}>WhatsApp</a>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </>
  );
}

/* ============================ PEMAN ============================ */
function Paiements() {
  const [rows, setRows] = useState(null);
  const [preuves, setPreuves] = useState({});

  const charger = async () => {
    const { data } = await supabase.from("paiements").select("*").eq("objet", "commande").order("recu_le", { ascending: false });
    setRows(data || []);
    const ids = (data || []).map((p) => p.id);
    if (ids.length) {
      const { data: pr } = await supabase.from("preuves_paiement").select("*").in("paiement_id", ids);
      const m = {};
      (pr || []).forEach((x) => { m[x.paiement_id] = x; });
      setPreuves(m);
    }
  };
  useEffect(() => { charger(); }, []);

  const decider = async (p, statut) => {
    setRows((r) => r.map((x) => (x.id === p.id ? { ...x, statut } : x)));
    await supabase.from("paiements").update({ statut }).eq("id", p.id);
    if (preuves[p.id]) {
      await supabase.from("preuves_paiement").update({ valide_le: new Date().toISOString() }).eq("id", preuves[p.id].id);
    }
  };

  const attente = (rows || []).filter((p) => p.statut === "en_attente");
  const autres = (rows || []).filter((p) => p.statut !== "en_attente");

  const Ligne = ({ p }) => {
    const pr = preuves[p.id];
    const tone = p.statut === "valide" ? "ok" : p.statut === "rejete" ? "bad" : "warn";
    const lbl = p.statut === "valide" ? "Validé" : p.statut === "rejete" ? "Rejeté" : "À vérifier";
    return (
      <Card style={{ marginBottom: 10, overflow: "hidden" }}>
        {pr && (
          <a href={pr.image_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", height: 150, background: `url(${pr.image_url}) center/cover`, position: "relative" }}>
            <span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(255,255,255,.94)", color: C.magenta, fontSize: 11, fontWeight: 800, padding: "5px 11px", borderRadius: 999 }}>Voir en grand</span>
          </a>
        )}
        <div style={{ padding: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{gdes(p.montant)}</div>
              <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>{p.mode || "—"} · {quand(p.recu_le)}</div>
            </div>
            <Badge tone={tone}>{lbl}</Badge>
          </div>
          {p.statut === "en_attente" && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => decider(p, "valide")} style={{ ...btnPrim, flex: 1, justifyContent: "center" }}>✓ Valider</button>
              <button onClick={() => decider(p, "rejete")} style={{ ...btnGhost, color: C.danger, borderColor: "rgba(192,57,43,.35)" }}>Rejeter</button>
            </div>
          )}
        </div>
      </Card>
    );
  };

  if (rows === null) return <p style={{ color: C.inkSoft, fontSize: 13 }}>Chargement…</p>;
  return (
    <>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 10 }}>À VÉRIFIER ({attente.length})</div>
      {attente.length === 0 ? <Card style={{ padding: 22, textAlign: "center", marginBottom: 18 }}><p style={{ margin: 0, fontSize: 13, color: C.inkSoft }}>Tout est à jour.</p></Card> : attente.map((p) => <Ligne key={p.id} p={p} />)}
      {autres.length > 0 && (
        <>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.inkFaint, letterSpacing: ".3px", margin: "18px 0 10px" }}>HISTORIQUE</div>
          {autres.map((p) => <Ligne key={p.id} p={p} />)}
        </>
      )}
    </>
  );
}

/* ============================ PWODWI ============================ */
function Produits() {
  const [rows, setRows] = useState(null);
  const [edit, setEdit] = useState("");
  const [draft, setDraft] = useState({});
  const [nouveau, setNouveau] = useState(false);
  const [nv, setNv] = useState({ nom: "", categorie: "", prix_public: "", prix_eleve: "", stock: "", emoji: "📦", description: "" });

  const charger = async () => {
    const { data } = await supabase.from("produits").select("*").order("ordre");
    setRows(data || []);
  };
  useEffect(() => { charger(); }, []);

  const ouvrir = (p) => { setEdit(p.id); setDraft({ prix_public: p.prix_public, prix_eleve: p.prix_eleve || "", stock: p.stock }); };
  const sauver = async (p) => {
    const patch = { prix_public: Number(draft.prix_public) || 0, prix_eleve: draft.prix_eleve === "" ? null : Number(draft.prix_eleve), stock: Number(draft.stock) || 0 };
    setRows((r) => r.map((x) => (x.id === p.id ? { ...x, ...patch } : x)));
    await supabase.from("produits").update(patch).eq("id", p.id);
    setEdit("");
  };
  const visible = async (p) => {
    setRows((r) => r.map((x) => (x.id === p.id ? { ...x, visible: !p.visible } : x)));
    await supabase.from("produits").update({ visible: !p.visible }).eq("id", p.id);
  };
  const stock = async (p, d, motif) => {
    const s = Math.max(0, Number(p.stock) + d);
    setRows((r) => r.map((x) => (x.id === p.id ? { ...x, stock: s } : x)));
    await supabase.from("produits").update({ stock: s }).eq("id", p.id);
    await supabase.from("mouvements_stock").insert({ produit_id: p.id, delta: d, motif: motif || (d > 0 ? "reassort" : "correction") });
  };
  const [histo, setHisto] = useState(null);
  const voirHisto = async () => {
    if (histo) { setHisto(null); return; }
    const { data } = await supabase.from("mouvements_stock").select("*").order("cree_le", { ascending: false }).limit(40);
    setHisto(data || []);
  };
  const ajouter = async () => {
    if (!nv.nom.trim()) return;
    const row = { nom: nv.nom.trim(), categorie: nv.categorie.trim() || null, description: nv.description.trim() || null, prix_public: Number(nv.prix_public) || 0, prix_eleve: nv.prix_eleve === "" ? null : Number(nv.prix_eleve), stock: Number(nv.stock) || 0, emoji: nv.emoji || "📦", visible: true, ordre: (rows || []).length + 1 };
    const { data } = await supabase.from("produits").insert(row).select().single();
    if (data) setRows((r) => [...(r || []), data]);
    setNouveau(false);
    setNv({ nom: "", categorie: "", prix_public: "", prix_eleve: "", stock: "", emoji: "📦", description: "" });
  };

  if (rows === null) return <p style={{ color: C.inkSoft, fontSize: 13 }}>Chargement…</p>;
  const alertes = rows.filter((p) => Number(p.stock) <= 5).length;
  const valeur = rows.reduce((s, p) => s + Number(p.prix_public || 0) * Number(p.stock || 0), 0);
  const nomDe = (id) => (rows.find((p) => p.id === id) || {}).nom || "—";

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
        <Card style={{ padding: 12 }}><div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{gdes(valeur)}</div><div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 2 }}>Valeur du stock</div></Card>
        <Card style={{ padding: 12 }}><div style={{ fontSize: 14, fontWeight: 800, color: alertes ? C.danger : C.green }}>{alertes}</div><div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 2 }}>Alertes</div></Card>
        <Card style={{ padding: 12 }}><div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{rows.length}</div><div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 2 }}>Références</div></Card>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 7 }}>
          <button onClick={voirHisto} style={{ ...btnGhost, padding: "7px 12px", fontSize: 11.5 }}>{histo ? "Fermer l'historique" : "Historique"}</button>
          <button onClick={() => window.print()} style={{ ...btnGhost, padding: "7px 12px", fontSize: 11.5 }}>🖨 Inventaire</button>
        </div>
        <button onClick={() => setNouveau((v) => !v)} style={btnPrim}>+ Produit</button>
      </div>

      {histo && (
        <Card style={{ padding: 13, marginBottom: 14 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink, marginBottom: 6 }}>Mouvements récents</div>
          {histo.length === 0 ? <p style={{ margin: 0, fontSize: 12, color: C.inkSoft }}>Aucun mouvement enregistré.</p> : histo.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderTop: `1px solid ${C.line}`, fontSize: 12 }}>
              <span style={{ fontWeight: 800, color: m.delta > 0 ? C.green : C.danger, width: 32 }}>{m.delta > 0 ? "+" : ""}{m.delta}</span>
              <span style={{ flex: 1, color: C.ink }}>{nomDe(m.produit_id)}</span>
              <span style={{ color: C.inkFaint, fontSize: 10.5 }}>{m.motif} · {quand(m.cree_le)}</span>
            </div>
          ))}
        </Card>
      )}

      {nouveau && (
        <Card style={{ padding: 14, marginBottom: 14, borderColor: "rgba(229,36,126,.40)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ gridColumn: "1 / -1" }}><input style={input} placeholder="Nom du produit" value={nv.nom} onChange={(e) => setNv({ ...nv, nom: e.target.value })} /></div>
            <input style={input} placeholder="Catégorie" value={nv.categorie} onChange={(e) => setNv({ ...nv, categorie: e.target.value })} />
            <input style={input} placeholder="Emoji" value={nv.emoji} onChange={(e) => setNv({ ...nv, emoji: e.target.value })} />
            <input style={input} inputMode="numeric" placeholder="Prix public" value={nv.prix_public} onChange={(e) => setNv({ ...nv, prix_public: e.target.value })} />
            <input style={input} inputMode="numeric" placeholder="Prix élève (optionnel)" value={nv.prix_eleve} onChange={(e) => setNv({ ...nv, prix_eleve: e.target.value })} />
            <input style={input} inputMode="numeric" placeholder="Stock" value={nv.stock} onChange={(e) => setNv({ ...nv, stock: e.target.value })} />
            <div style={{ gridColumn: "1 / -1" }}><input style={input} placeholder="Description courte" value={nv.description} onChange={(e) => setNv({ ...nv, description: e.target.value })} /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={ajouter} style={{ ...btnPrim, flex: 1, justifyContent: "center" }}>Enregistrer</button>
            <button onClick={() => setNouveau(false)} style={btnGhost}>Annuler</button>
          </div>
        </Card>
      )}

      {rows.map((p) => {
        const on = edit === p.id;
        const rupture = Number(p.stock) <= 0;
        return (
          <Card key={p.id} style={{ padding: 13, marginBottom: 10, opacity: p.visible ? 1 : 0.6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span style={{ width: 42, height: 42, borderRadius: 11, background: "rgba(229,36,126,.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{p.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{p.nom}</span>
                  {!p.visible && <Badge tone="neutral">Masqué</Badge>}
                  <Badge tone={rupture ? "bad" : Number(p.stock) <= 5 ? "warn" : "ok"}>{rupture ? "Rupture" : p.stock + " en stock"}</Badge>
                </div>
                <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>{p.categorie || "—"} · {gdes(p.prix_public)}{p.prix_eleve ? ` · élève ${gdes(p.prix_eleve)}` : ""}</div>
              </div>
            </div>

            {on ? (
              <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div><label style={{ fontSize: 10.5, fontWeight: 700, color: C.inkSoft }}>Prix public</label><input style={input} inputMode="numeric" value={draft.prix_public} onChange={(e) => setDraft({ ...draft, prix_public: e.target.value })} /></div>
                <div><label style={{ fontSize: 10.5, fontWeight: 700, color: C.inkSoft }}>Prix élève</label><input style={input} inputMode="numeric" value={draft.prix_eleve} onChange={(e) => setDraft({ ...draft, prix_eleve: e.target.value })} /></div>
                <div><label style={{ fontSize: 10.5, fontWeight: 700, color: C.inkSoft }}>Stock</label><input style={input} inputMode="numeric" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} /></div>
                <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
                  <button onClick={() => sauver(p)} style={{ ...btnPrim, flex: 1, justifyContent: "center" }}>✓ Enregistrer</button>
                  <button onClick={() => setEdit("")} style={btnGhost}>Annuler</button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 11, flexWrap: "wrap" }}>
                <button onClick={() => stock(p, -1)} style={{ width: 30, height: 30, borderRadius: "50%", border: `1.3px solid ${C.line}`, background: "#fff", cursor: "pointer", color: C.ink }}>−</button>
                <button onClick={() => stock(p, 1)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, cursor: "pointer", color: "#fff" }}>+</button>
                <span style={{ flex: 1 }} />
                <button onClick={() => ouvrir(p)} style={{ ...btnGhost, padding: "6px 12px", fontSize: 11.5 }}>Modifier</button>
                <button onClick={() => visible(p)} style={{ ...btnGhost, padding: "6px 12px", fontSize: 11.5, color: p.visible ? C.danger : C.green }}>{p.visible ? "Masquer" : "Afficher"}</button>
              </div>
            )}
          </Card>
        );
      })}
    </>
  );
}

/* ============================ APP ============================ */
export default function GestionBoutique() {
  const [ok, setOk] = useState(() => { try { return sessionStorage.getItem("mt_gb") === "1"; } catch (e) { return false; } });
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("bord");

  const entrer = () => {
    if (pwd === MOT_DE_PASSE) { setOk(true); try { sessionStorage.setItem("mt_gb", "1"); } catch (e) {} }
    else setErr("Mot de passe incorrect.");
  };

  const shell = { minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.ink };

  if (!ok) {
    return (
      <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Card style={{ padding: 24, width: "100%", maxWidth: 360 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, textAlign: "center" }}>👑 MISS THANI</div>
          <div style={{ fontSize: 10, letterSpacing: "2px", color: C.magenta, fontWeight: 700, textAlign: "center", marginTop: 4, marginBottom: 20 }}>GESTION BOUTIQUE</div>
          <input style={input} type="password" placeholder="Mot de passe" value={pwd} onChange={(e) => { setPwd(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") entrer(); }} autoFocus />
          {err && <p style={{ color: C.danger, fontSize: 12.5, margin: "8px 0 0" }}>{err}</p>}
          <button onClick={entrer} style={{ ...btnPrim, width: "100%", justifyContent: "center", marginTop: 12, padding: "12px" }}>Entrer</button>
        </Card>
      </div>
    );
  }

  const TABS = [{ k: "bord", l: "Bord" }, { k: "commandes", l: "Commandes" }, { k: "paiements", l: "Paiements" }, { k: "produits", l: "Produits" }, { k: "clientes", l: "Clientes" }];

  return (
    <div style={shell}>
      <style>{`*{box-sizing:border-box}body{margin:0}.mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}`}</style>
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700 }}>👑 MISS THANI</div>
            <div style={{ fontSize: 9, letterSpacing: "2px", color: C.magenta, fontWeight: 700, marginTop: 3 }}>GESTION BOUTIQUE</div>
          </div>
          <div className="mt-row" style={{ display: "flex", gap: 6, overflowX: "auto", maxWidth: "62%" }}>
            {TABS.map((t) => {
              const on = tab === t.k;
              return <button key={t.k} onClick={() => setTab(t.k)} style={{ flexShrink: 0, padding: "7px 13px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{t.l}</button>;
            })}
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 40px" }}>
        {tab === "bord" && <Bord go={setTab} />}
        {tab === "commandes" && <Commandes />}
        {tab === "paiements" && <Paiements />}
        {tab === "produits" && <Produits />}
        {tab === "clientes" && <Clientes />}
      </main>
    </div>
  );
}
