import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — ESPACE AGENT  (/agent)
   Koneksyon: etikèt + PIN · Prospects · Lien · Classement · Paie
   ============================================================ */

const C = {
  bg: "#F7F2F6", card: "#FFFFFF", ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.58)", inkFaint: "rgba(58,14,51,.38)",
  blush: "#E5247E", magenta: "#C2238E", gold: "#E0A50A",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};

const PAR_VENUE = 750;
const OBJECTIF = 60;
const NIVEAUX = [
  { k: "silver", l: "Silver", n: 30, bonus: 2500, icon: "🥈" },
  { k: "gold", l: "Gold", n: 48, bonus: 5000, icon: "🥇" },
  { k: "diamond", l: "Diamond", n: 66, bonus: 7500, icon: "💎" },
];
const ETAPES = [
  { k: "nouveau", l: "Nouveau", tone: "warn" },
  { k: "contacte", l: "Contacté", tone: "info" },
  { k: "suivi", l: "Suivi fait", tone: "info" },
  { k: "reserve", l: "Réservé", tone: "ok" },
  { k: "venue", l: "Venue", tone: "ok" },
  { k: "perdu", l: "Perdu", tone: "bad" },
];
const etapeDe = (k) => ETAPES.find((e) => e.k === k) || ETAPES[0];

const gdes = (n) => Number(n || 0).toLocaleString("fr-FR") + " gdes";
const today = () => new Date().toISOString().slice(0, 10);
const moisCourant = () => today().slice(0, 7);
const quand = (iso) => iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "";
const initiales = (p) => ((p.prenom || "?")[0] + (p.nom || "")[0]).toUpperCase();

function Card({ children, style }) {
  return <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: "0 6px 20px rgba(142,44,154,.06)", ...style }}>{children}</div>;
}
function Badge({ tone = "neutral", children }) {
  const map = { ok: ["rgba(30,132,73,.10)", C.green], warn: ["rgba(224,165,10,.16)", "#9A7000"], info: ["rgba(194,35,142,.10)", C.magenta], bad: ["rgba(192,57,43,.10)", C.danger], neutral: ["rgba(58,14,51,.06)", C.inkSoft] };
  const [bg, fg] = map[tone] || map.neutral;
  return <span style={{ background: bg, color: fg, fontSize: 10.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
}
const btnPrim = { border: "none", borderRadius: 999, padding: "11px 16px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif", textDecoration: "none" };
const btnGhost = { border: `1.3px solid ${C.line}`, borderRadius: 999, padding: "9px 14px", background: "#fff", color: C.ink, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif", textDecoration: "none" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 11, border: `1.3px solid ${C.line}`, background: "#fff", color: C.ink, fontSize: 13.5, fontFamily: "'Inter',sans-serif", outline: "none" };

function Barre({ pct }) {
  return <div style={{ height: 8, borderRadius: 999, background: "rgba(142,44,154,.12)", overflow: "hidden" }}><div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%", background: `linear-gradient(90deg, ${C.blush}, ${C.magenta})` }} /></div>;
}

/* ---------------- Koneksyon ---------------- */
function Connexion({ agents, onOk }) {
  const [etq, setEtq] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const entrer = () => {
    const a = agents.find((x) => x.etiquette === etq);
    if (!a) { setErr("Choisissez votre nom."); return; }
    if (String(a.pin || "") !== pin) { setErr("Code incorrect."); return; }
    try { sessionStorage.setItem("mt_agent", a.id); } catch (e) {}
    onOk(a);
  };
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter',sans-serif" }}>
      <Card style={{ padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, textAlign: "center", color: C.ink }}>👑 MISS THANI</div>
        <div style={{ fontSize: 10, letterSpacing: "2px", color: C.magenta, fontWeight: 700, textAlign: "center", marginTop: 4, marginBottom: 20 }}>ESPACE AGENT</div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.inkSoft, marginBottom: 5 }}>Votre nom</label>
        <select style={input} value={etq} onChange={(e) => { setEtq(e.target.value); setErr(""); }}>
          <option value="">Choisir…</option>
          {agents.map((a) => <option key={a.id} value={a.etiquette}>{a.prenom} {a.nom}</option>)}
        </select>
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.inkSoft, margin: "12px 0 5px" }}>Code (4 chiffres)</label>
        <input style={{ ...input, textAlign: "center", letterSpacing: 6, fontSize: 18 }} type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") entrer(); }} placeholder="••••" />
        {err && <p style={{ color: C.danger, fontSize: 12.5, margin: "8px 0 0" }}>{err}</p>}
        <button onClick={entrer} style={{ ...btnPrim, width: "100%", marginTop: 14, padding: "12px" }}>Entrer</button>
        {agents.length === 0 && <p style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 12, textAlign: "center" }}>Aucun agent enregistré. L'administration doit créer votre compte.</p>}
      </Card>
    </div>
  );
}

/* ---------------- App ---------------- */
export default function Agent() {
  const [agents, setAgents] = useState([]);
  const [moi, setMoi] = useState(null);
  const [tab, setTab] = useState("bord");
  const [d, setD] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profils").select("*").eq("role", "agent").eq("actif", true).order("prenom");
      setAgents(data || []);
      try {
        const id = sessionStorage.getItem("mt_agent");
        const a = (data || []).find((x) => x.id === id);
        if (a) setMoi(a);
      } catch (e) {}
    })();
  }, []);

  const recharger = async () => {
    const [pr, pf, pg] = await Promise.all([
      supabase.from("prospects").select("*").not("etiquette", "is", null).order("cree_le", { ascending: false }),
      supabase.from("profils").select("*"),
      supabase.from("programmes").select("*"),
    ]);
    setD({ prospects: pr.data || [], profils: pf.data || [], programmes: pg.data || [] });
  };
  useEffect(() => { if (moi) recharger(); }, [moi]);

  if (!moi) return <Connexion agents={agents} onOk={setMoi} />;
  if (!d) return <div style={{ padding: 30, fontFamily: "'Inter',sans-serif", color: C.inkSoft }}>Chargement…</div>;

  /* ---- Kalkil ---- */
  const profilDe = (id) => d.profils.find((p) => p.id === id) || {};
  const progNom = (id) => (d.programmes.find((p) => p.id === id) || {}).nom || "—";
  const mesProspects = d.prospects.filter((p) => p.etiquette === moi.etiquette);
  const mois = moisCourant();
  const venues = mesProspects.filter((p) => p.etape === "venue" && (p.venue_le || "").slice(0, 7) === mois).length;
  const inscritsMois = mesProspects.filter((p) => (p.cree_le || "").slice(0, 7) === mois).length;
  const aFaire = mesProspects.filter((p) => ["nouveau", "contacte", "suivi"].includes(p.etape) && (!p.rappel_le || p.rappel_le <= today()));
  const lien = `${window.location.origin}/?ref=${encodeURIComponent(moi.etiquette)}`;

  /* Klasman: venues pa ajan, mwa sa a */
  const classement = agents.map((a) => ({ a, n: d.prospects.filter((p) => p.etiquette === a.etiquette && p.etape === "venue" && (p.venue_le || "").slice(0, 7) === mois).length })).sort((x, y) => y.n - x.n);
  const monRang = classement.findIndex((x) => x.a.id === moi.id) + 1;
  const bonus = NIVEAUX.filter((n) => venues >= n.n && classement[0] && classement[0].a.id === moi.id).reduce((s, n) => s + n.bonus, 0);
  const prochain = NIVEAUX.find((n) => venues < n.n);

  const changerEtape = async (p, etape) => {
    const patch = { etape };
    if (etape === "venue") patch.venue_le = today();
    setD((x) => ({ ...x, prospects: x.prospects.map((y) => (y.id === p.id ? { ...y, ...patch } : y)) }));
    await supabase.from("prospects").update(patch).eq("id", p.id);
  };
  const rappeler = async (p, jours) => {
    const dt = new Date(); dt.setDate(dt.getDate() + jours);
    const r = dt.toISOString().slice(0, 10);
    setD((x) => ({ ...x, prospects: x.prospects.map((y) => (y.id === p.id ? { ...y, rappel_le: r } : y)) }));
    await supabase.from("prospects").update({ rappel_le: r }).eq("id", p.id);
  };
  const sortir = () => { try { sessionStorage.removeItem("mt_agent"); } catch (e) {} setMoi(null); setD(null); };

  const TABS = [{ k: "bord", l: "Bord" }, { k: "prospects", l: "Prospects" }, { k: "lien", l: "Mon lien" }, { k: "classement", l: "Classement" }, { k: "paie", l: "Paie" }];

  const Prospect = ({ p, compact }) => {
    const pf = profilDe(p.profil_id);
    const e = etapeDe(p.etape);
    const [open, setOpen] = useState(false);
    return (
      <Card style={{ padding: 12, marginBottom: 8, borderColor: aFaire.includes(p) && !compact ? "rgba(229,36,126,.35)" : C.line }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(229,36,126,.10)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{initiales(pf)}</span>
          <div style={{ flex: 1, minWidth: 0 }} onClick={() => setOpen((v) => !v)}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{pf.prenom} {pf.nom}</div>
            <div style={{ fontSize: 10.5, color: C.inkFaint }}>{progNom(p.programme_id)} · {quand(p.cree_le)}{p.rappel_le && p.rappel_le > today() ? ` · rappel ${quand(p.rappel_le)}` : ""}</div>
          </div>
          <Badge tone={e.tone}>{e.l}</Badge>
        </div>
        {(open || !compact) && (
          <div style={{ marginTop: 10, display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
            <select value={p.etape} onChange={(ev) => changerEtape(p, ev.target.value)} style={{ ...input, width: "auto", flex: 1, minWidth: 130, padding: "8px 10px", fontSize: 12, fontWeight: 700 }}>
              {ETAPES.map((x) => <option key={x.k} value={x.k}>{x.l}</option>)}
            </select>
            {pf.whatsapp && <a href={`https://wa.me/509${pf.whatsapp}?text=${encodeURIComponent(`Bonjou ${pf.prenom}, se ${moi.prenom} nan Miss Thani. Mwen wè w te enskri pou ${progNom(p.programme_id)}. Èske w vle m ede w rezève plas ou?`)}`} target="_blank" rel="noopener noreferrer" onClick={() => { if (p.etape === "nouveau") changerEtape(p, "contacte"); }} style={{ ...btnGhost, padding: "7px 11px", fontSize: 11.5, color: C.green, borderColor: "rgba(30,132,73,.35)" }}>WhatsApp</a>}
            {pf.whatsapp && <a href={`tel:+509${pf.whatsapp}`} style={{ ...btnGhost, padding: "7px 11px", fontSize: 11.5 }}>📞</a>}
            <button onClick={() => rappeler(p, 3)} style={{ ...btnGhost, padding: "7px 11px", fontSize: 11 }}>Rappel +3j</button>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.ink }}>
      <style>{`*{box-sizing:border-box}body{margin:0}.mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}`}</style>
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>{initiales(moi)}</span>
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{moi.prenom} {moi.nom}</div>
                <div style={{ fontSize: 10, color: C.magenta, fontWeight: 700, letterSpacing: "1px" }}>AGENT · {moi.etiquette}</div>
              </div>
            </div>
            <button onClick={sortir} style={{ ...btnGhost, padding: "6px 12px", fontSize: 11.5 }}>Quitter</button>
          </div>
          <div className="mt-row" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {TABS.map((t) => { const on = tab === t.k; return <button key={t.k} onClick={() => setTab(t.k)} style={{ flexShrink: 0, padding: "7px 13px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{t.l}</button>; })}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 40px" }}>
        {/* ---------- BORD ---------- */}
        {tab === "bord" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[["Inscrites ce mois", String(inscritsMois), C.blush], ["Venues ce mois", String(venues), C.green], ["À relancer", String(aFaire.length), C.gold], ["Gains estimés", gdes(venues * PAR_VENUE + bonus), C.magenta]].map(([l, v, c]) => (
                <Card key={l} style={{ padding: 13 }}><div style={{ fontSize: 20, fontWeight: 800, color: c, lineHeight: 1.1 }}>{v}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>{l}</div></Card>
              ))}
            </div>

            <Card style={{ padding: 14, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>Objectif du mois</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft }}>{venues} / {OBJECTIF}</span>
              </div>
              <Barre pct={(venues / OBJECTIF) * 100} />
              {NIVEAUX.map((n) => (
                <div key={n.k} style={{ display: "flex", alignItems: "center", gap: 9, padding: "8px 0", borderTop: `1px solid ${C.line}`, marginTop: n.k === "silver" ? 12 : 0 }}>
                  <span style={{ fontSize: 16 }}>{n.icon}</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{n.l}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{n.n} venues · bonus {gdes(n.bonus)} au premier</div></div>
                  {venues >= n.n ? <Badge tone="ok">Atteint</Badge> : <span style={{ fontSize: 11, fontWeight: 800, color: C.inkFaint }}>{n.n - venues} restantes</span>}
                </div>
              ))}
            </Card>

            <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>À FAIRE AUJOURD'HUI ({aFaire.length})</div>
            {aFaire.length === 0 ? <Card style={{ padding: 22, textAlign: "center" }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Rien à relancer. Partagez votre lien !</p></Card> : aFaire.slice(0, 8).map((p) => <Prospect key={p.id} p={p} />)}
          </>
        )}

        {/* ---------- PROSPECTS ---------- */}
        {tab === "prospects" && (
          <>
            <div style={{ marginBottom: 10 }}><Badge tone="info">{mesProspects.length} prospect{mesProspects.length > 1 ? "s" : ""}</Badge></div>
            {mesProspects.length === 0 ? <Card style={{ padding: 22, textAlign: "center" }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune inscription par votre lien pour le moment.</p></Card> : mesProspects.map((p) => <Prospect key={p.id} p={p} compact />)}
          </>
        )}

        {/* ---------- LIEN ---------- */}
        {tab === "lien" && <LienBloc lien={lien} moi={moi} n={mesProspects.length} />}

        {/* ---------- CLASSEMENT ---------- */}
        {tab === "classement" && (
          <>
            <div style={{ marginBottom: 10 }}><Badge tone="info">{new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</Badge></div>
            <Card style={{ padding: "4px 14px" }}>
              {classement.map((x, i) => {
                const max = Math.max(1, classement[0].n);
                const me = x.a.id === moi.id;
                return (
                  <div key={x.a.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                    <span style={{ width: 22, textAlign: "center", fontSize: i < 3 ? 15 : 12, fontWeight: 800, color: C.inkFaint }}>{["🥇", "🥈", "🥉"][i] || i + 1}</span>
                    <span style={{ width: 90, fontSize: 12.5, fontWeight: me ? 800 : 700, color: me ? C.blush : C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.a.prenom}{me ? " (moi)" : ""}</span>
                    <div style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(142,44,154,.10)", overflow: "hidden" }}><div style={{ width: `${(x.n / max) * 100}%`, height: "100%", background: me ? `linear-gradient(90deg, ${C.blush}, ${C.magenta})` : "rgba(142,44,154,.35)" }} /></div>
                    <span style={{ width: 46, textAlign: "right", fontSize: 11.5, fontWeight: 800, color: C.inkSoft }}>{x.n}</span>
                  </div>
                );
              })}
            </Card>
            <Card style={{ padding: 14, marginTop: 12, background: "rgba(229,36,126,.06)", borderColor: "rgba(229,36,126,.25)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>Vous êtes {monRang}{monRang === 1 ? "er" : "e"} ce mois-ci</div>
              <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 3 }}>{prochain ? `Encore ${prochain.n - venues} venues pour ${prochain.l}.` : "Tous les niveaux atteints !"}</div>
            </Card>
          </>
        )}

        {/* ---------- PAIE ---------- */}
        {tab === "paie" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <Card style={{ padding: 13 }}><div style={{ fontSize: 18, fontWeight: 800, color: C.ink }}>{gdes(venues * PAR_VENUE)}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>{venues} venues × {PAR_VENUE}</div></Card>
              <Card style={{ padding: 13 }}><div style={{ fontSize: 18, fontWeight: 800, color: C.gold }}>{gdes(bonus)}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>Bonus de niveau</div></Card>
            </div>
            <Card style={{ padding: 16, background: "rgba(229,36,126,.07)", borderColor: "rgba(229,36,126,.30)", marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 700 }}>Total du mois</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.blush, marginTop: 3 }}>{gdes(venues * PAR_VENUE + bonus)}</div>
              <div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 2 }}>Versé le 5 du mois suivant, après validation de la direction</div>
            </Card>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>VENUES CE MOIS</div>
            <Card style={{ padding: "4px 14px" }}>
              {mesProspects.filter((p) => p.etape === "venue" && (p.venue_le || "").slice(0, 7) === mois).map((p, i) => { const pf = profilDe(p.profil_id); return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{pf.prenom} {pf.nom}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{progNom(p.programme_id)} · venue le {quand(p.venue_le)}</div></div>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: C.green }}>+ {gdes(PAR_VENUE)}</span>
                </div>
              ); })}
              {venues === 0 && <p style={{ margin: "10px 0", fontSize: 12.5, color: C.inkSoft }}>Aucune venue ce mois-ci pour le moment.</p>}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function LienBloc({ lien, moi, n }) {
  const [ok, setOk] = useState(false);
  const copier = () => { try { navigator.clipboard.writeText(lien); } catch (e) {} setOk(true); setTimeout(() => setOk(false), 2000); };
  const msg = `Bonjou! Miss Thani Make-up & Lace Club ap ouvri yon nouvo sesyon — onglerie, makiyaj, très, dreadlocks. Enskri isit la 👇\n${lien}`;
  return (
    <>
      <Card style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink, marginBottom: 6 }}>Mon lien de parrainage</div>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: C.inkSoft, lineHeight: 1.55 }}>Toute personne qui s'inscrit par ce lien porte votre étiquette <strong style={{ color: C.magenta }}>{moi.etiquette}</strong> et compte pour vous.</p>
        <code style={{ display: "block", background: "rgba(194,35,142,.05)", border: `1px solid ${C.line}`, borderRadius: 11, padding: "10px 12px", fontSize: 12, color: C.ink, wordBreak: "break-all", marginBottom: 10 }}>{lien}</code>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={copier} style={{ ...btnPrim, flex: 1 }}>{ok ? "✓ Copié" : "Copier le lien"}</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnPrim, flex: 1, background: "#25D366" }}>Partager sur WhatsApp</a>
        </div>
      </Card>
      <Card style={{ padding: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>PERFORMANCE</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0" }}><span style={{ color: C.inkSoft }}>Inscriptions par votre lien</span><strong>{n}</strong></div>
      </Card>
    </>
  );
}
