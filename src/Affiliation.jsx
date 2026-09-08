import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — ESPACE AFFILIATION  (/affiliation)
   Liens · Conversions · Kit promo · Paiements
   ============================================================ */

const C = {
  bg: "#F7F2F6", card: "#FFFFFF", ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.58)", inkFaint: "rgba(58,14,51,.38)",
  blush: "#E5247E", magenta: "#C2238E", gold: "#E0A50A",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};
const PALIERS = [
  { l: "Bronze", n: 0, pct: 10 },
  { l: "Argent", n: 15, pct: 15 },
  { l: "Or", n: 40, pct: 20 },
  { l: "Platine", n: 80, pct: 25 },
];
const SEUIL_RETRAIT = 2500;
const PAIEMENT_NUM = "509 4643 3016";

const gdes = (n) => Number(n || 0).toLocaleString("fr-FR") + " gdes";
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (s) => { if (!s) return ""; const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return `${d} ${["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."][m - 1]} ${y}`; };
const initiales = (p) => ((p.prenom || "?")[0] + (p.nom || "")[0]).toUpperCase();

function Card({ children, style }) { return <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: "0 6px 20px rgba(142,44,154,.06)", ...style }}>{children}</div>; }
function Badge({ tone = "neutral", children }) {
  const map = { ok: ["rgba(30,132,73,.10)", C.green], warn: ["rgba(224,165,10,.16)", "#9A7000"], info: ["rgba(194,35,142,.10)", C.magenta], bad: ["rgba(192,57,43,.10)", C.danger], neutral: ["rgba(58,14,51,.06)", C.inkSoft] };
  const [bg, fg] = map[tone] || map.neutral;
  return <span style={{ background: bg, color: fg, fontSize: 10.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
}
const btnPrim = { border: "none", borderRadius: 999, padding: "11px 16px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif", textDecoration: "none" };
const btnGhost = { border: `1.3px solid ${C.line}`, borderRadius: 999, padding: "9px 14px", background: "#fff", color: C.ink, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif", textDecoration: "none" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 11, border: `1.3px solid ${C.line}`, background: "#fff", color: C.ink, fontSize: 13.5, fontFamily: "'Inter',sans-serif", outline: "none" };
const label = { display: "block", fontSize: 11, fontWeight: 700, color: C.inkSoft, marginBottom: 5 };

function Connexion({ liste, onOk }) {
  const [etq, setEtq] = useState(""); const [pin, setPin] = useState(""); const [err, setErr] = useState("");
  const entrer = () => {
    const a = liste.find((x) => x.etiquette === etq);
    if (!a) { setErr("Choisissez votre nom."); return; }
    if (String(a.pin || "") !== pin) { setErr("Code incorrect."); return; }
    try { sessionStorage.setItem("mt_aff", a.id); } catch (e) {}
    onOk(a);
  };
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter',sans-serif" }}>
      <Card style={{ padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, textAlign: "center", color: C.ink }}>👑 MISS THANI</div>
        <div style={{ fontSize: 10, letterSpacing: "2px", color: C.magenta, fontWeight: 700, textAlign: "center", marginTop: 4, marginBottom: 20 }}>AFFILIATION</div>
        <label style={label}>Votre nom</label>
        <select style={input} value={etq} onChange={(e) => { setEtq(e.target.value); setErr(""); }}><option value="">Choisir…</option>{liste.map((a) => <option key={a.id} value={a.etiquette}>{a.prenom} {a.nom}</option>)}</select>
        <label style={{ ...label, marginTop: 12 }}>Code (4 chiffres)</label>
        <input style={{ ...input, textAlign: "center", letterSpacing: 6, fontSize: 18 }} type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") entrer(); }} placeholder="••••" />
        {err && <p style={{ color: C.danger, fontSize: 12.5, margin: "8px 0 0" }}>{err}</p>}
        <button onClick={entrer} style={{ ...btnPrim, width: "100%", marginTop: 14, padding: "12px" }}>Entrer</button>
        {liste.length === 0 && <p style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 12, textAlign: "center" }}>Aucune affiliée enregistrée.</p>}
      </Card>
    </div>
  );
}

export default function Affiliation() {
  const [liste, setListe] = useState([]);
  const [moi, setMoi] = useState(null);
  const [tab, setTab] = useState("bord");
  const [d, setD] = useState(null);
  const [copie, setCopie] = useState("");
  const [retrait, setRetrait] = useState({ montant: "", mode: "moncash", numero: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profils").select("*").eq("role", "affilie").eq("actif", true).order("prenom");
      setListe(data || []);
      try { const id = sessionStorage.getItem("mt_aff"); const a = (data || []).find((x) => x.id === id); if (a) setMoi(a); } catch (e) {}
    })();
  }, []);

  const recharger = async () => {
    const etq = moi.etiquette;
    const [pr, cm, pg, pd, cl, pa, rt] = await Promise.all([
      supabase.from("prospects").select("*").eq("etiquette", etq),
      supabase.from("commandes").select("*").eq("etiquette", etq),
      supabase.from("programmes").select("*").eq("actif", true).order("ordre"),
      supabase.from("produits").select("*").eq("visible", true).order("ordre"),
      supabase.from("clics").select("*").eq("etiquette", etq),
      supabase.from("paiements").select("*"),
      supabase.from("retraits").select("*").eq("profil_id", moi.id).order("cree_le", { ascending: false }),
    ]);
    setD({ prospects: pr.data || [], commandes: cm.data || [], programmes: pg.data || [], produits: pd.data || [], clics: cl.data || [], paiements: pa.data || [], retraits: rt.data || [] });
  };
  useEffect(() => { if (moi) recharger(); }, [moi]);

  if (!moi) return <Connexion liste={liste} onOk={setMoi} />;
  if (!d) return <div style={{ padding: 30, fontFamily: "'Inter',sans-serif", color: C.inkSoft }}>Chargement…</div>;

  /* ---- Konvèsyon yo ---- */
  const progDe = (id) => d.programmes.find((p) => p.id === id) || {};
  const inscValide = (pr) => d.paiements.some((p) => p.profil_id === pr.profil_id && p.objet === "inscription" && p.statut === "valide");
  const conv = [
    ...d.prospects.map((pr) => ({ id: pr.id, quoi: progDe(pr.programme_id).nom || "Formation", base: Number(progDe(pr.programme_id).prix_inscription || 0), date: pr.cree_le, statut: inscValide(pr) ? "validee" : pr.etape === "perdu" ? "annulee" : "attente", type: "inscription" })),
    ...d.commandes.map((c) => ({ id: c.id, quoi: `Commande boutique`, base: Number(c.total || 0), date: c.cree_le, statut: c.statut === "livree" ? "validee" : c.statut === "annulee" ? "annulee" : "attente", type: "commande" })),
  ].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const nbValidees = conv.filter((c) => c.statut === "validee").length;
  const palier = [...PALIERS].reverse().find((p) => nbValidees >= p.n) || PALIERS[0];
  const suivant = PALIERS.find((p) => nbValidees < p.n);
  const commission = (c) => Math.round(c.base * palier.pct / 100);
  const gagne = conv.filter((c) => c.statut === "validee").reduce((s, c) => s + commission(c), 0);
  const attente = conv.filter((c) => c.statut === "attente").reduce((s, c) => s + commission(c), 0);
  const paye = d.retraits.filter((r) => r.statut === "paye").reduce((s, r) => s + Number(r.montant), 0);
  const demande = d.retraits.filter((r) => r.statut === "demande").reduce((s, r) => s + Number(r.montant), 0);
  const dispo = Math.max(0, gagne - paye - demande);
  const clics = d.clics.length;
  const taux = clics ? ((conv.length / clics) * 100).toFixed(1) : "0";
  const base = window.location.origin;
  const lienDe = (cible) => `${base}${cible === "boutique" ? "/boutique" : "/"}?ref=${encodeURIComponent(moi.etiquette)}${cible && cible !== "accueil" && cible !== "boutique" ? `&c=${encodeURIComponent(cible)}` : ""}`;
  const liens = [
    { t: "Page d'accueil", cible: "accueil", clics: d.clics.filter((c) => c.cible === "accueil").length, conv: d.prospects.length },
    { t: "Boutique", cible: "boutique", clics: d.clics.filter((c) => c.cible === "boutique").length, conv: d.commandes.length },
    ...d.programmes.map((p) => ({ t: `Formation ${p.nom}`, cible: p.nom, clics: d.clics.filter((c) => c.cible === p.nom).length, conv: d.prospects.filter((x) => x.programme_id === p.id).length })),
  ];

  const copier = (txt, k) => { try { navigator.clipboard.writeText(txt); } catch (e) {} setCopie(k); setTimeout(() => setCopie(""), 2000); };
  const demanderRetrait = async () => {
    const m = Number(retrait.montant) || 0;
    if (m < SEUIL_RETRAIT) { setMsg(`Erreur — minimum ${gdes(SEUIL_RETRAIT)}.`); return; }
    if (m > dispo) { setMsg(`Erreur — solde disponible : ${gdes(dispo)}.`); return; }
    if (!/^\d{8}$/.test(retrait.numero.replace(/\D/g, ""))) { setMsg("Erreur — numéro MonCash/NatCash invalide."); return; }
    await supabase.from("retraits").insert({ profil_id: moi.id, montant: m, mode: retrait.mode, numero: retrait.numero.replace(/\D/g, ""), statut: "demande" });
    setMsg("✓ Demande envoyée — traitement sous 48 h."); setRetrait({ montant: "", mode: "moncash", numero: "" }); recharger(); setTimeout(() => setMsg(""), 4000);
  };
  const sortir = () => { try { sessionStorage.removeItem("mt_aff"); } catch (e) {} setMoi(null); setD(null); };

  const TEXTES = [
    `Ou vle aprann yon metye ki ka fè w lajan? Miss Thani ap ouvri yon nouvo sesyon. Enskri kounye a 👇 ${lienDe("accueil")}`,
    `De la débutante à la pro : formations en onglerie, maquillage et tresses à Pétion-Ville. Places limitées ! ${lienDe("accueil")}`,
    `Kit, materyèl ak inifòm pwofesyonèl — boutik Miss Thani la ouvri pou tout moun 🛍️ ${lienDe("boutique")}`,
  ];
  const TABS = [{ k: "bord", l: "Bord" }, { k: "liens", l: "Mes liens" }, { k: "kit", l: "Kit promo" }, { k: "conv", l: "Conversions" }, { k: "paie", l: "Paiements" }];
  const toneConv = (s) => (s === "validee" ? "ok" : s === "annulee" ? "bad" : "warn");
  const lblConv = (s) => (s === "validee" ? "Validée" : s === "annulee" ? "Annulée" : "En attente");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.ink }}>
      <style>{`*{box-sizing:border-box}body{margin:0}.mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}input::placeholder{color:rgba(58,14,51,.32)}`}</style>
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>{initiales(moi)}</span>
              <div style={{ lineHeight: 1.15 }}><div style={{ fontSize: 14, fontWeight: 800 }}>{moi.prenom} {moi.nom}</div><div style={{ fontSize: 10, color: C.magenta, fontWeight: 700, letterSpacing: "1px" }}>{palier.l.toUpperCase()} · {palier.pct} % · {moi.etiquette}</div></div>
            </div>
            <button onClick={sortir} style={{ ...btnGhost, padding: "6px 12px", fontSize: 11.5 }}>Quitter</button>
          </div>
          <div className="mt-row" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {TABS.map((t) => { const on = tab === t.k; return <button key={t.k} onClick={() => setTab(t.k)} style={{ flexShrink: 0, padding: "7px 13px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{t.l}</button>; })}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 40px" }}>
        {tab === "bord" && (
          <>
            <div style={{ borderRadius: 18, padding: "16px 18px", background: `linear-gradient(120deg, ${C.blush}, ${C.magenta})`, color: "#fff", marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".5px", opacity: 0.9 }}>NIVEAU {palier.l.toUpperCase()} · COMMISSION {palier.pct} %</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 21, fontWeight: 700, marginTop: 3 }}>Code affilié : {moi.etiquette}</div>
              {suivant && <>
                <div style={{ height: 7, borderRadius: 999, background: "rgba(255,255,255,.28)", overflow: "hidden", marginTop: 10 }}><div style={{ width: `${(nbValidees / suivant.n) * 100}%`, height: "100%", background: "#fff" }} /></div>
                <div style={{ fontSize: 11, opacity: 0.92, marginTop: 5 }}>{nbValidees}/{suivant.n} — encore {suivant.n - nbValidees} conversion{suivant.n - nbValidees > 1 ? "s" : ""} pour {suivant.l} ({suivant.pct} %)</div>
              </>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[["Clics", String(clics), C.blush], ["Conversions", String(conv.length), C.magenta], ["Taux", taux + " %", C.green], ["Solde disponible", gdes(dispo), C.gold]].map(([l, v, c]) => (
                <Card key={l} style={{ padding: 13 }}><div style={{ fontSize: 20, fontWeight: 800, color: c, lineHeight: 1.1 }}>{v}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>{l}</div></Card>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>DERNIÈRES CONVERSIONS</div>
            {conv.length === 0 ? <Card style={{ padding: 22, textAlign: "center" }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune conversion encore. Partagez vos liens !</p></Card> : conv.slice(0, 5).map((c) => (
              <Card key={c.id} style={{ padding: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{c.quoi}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{fmt(c.date)}</div></div>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: c.statut === "validee" ? C.green : C.inkFaint }}>+ {gdes(commission(c))}</span>
                  <Badge tone={toneConv(c.statut)}>{lblConv(c.statut)}</Badge>
                </div>
              </Card>
            ))}
          </>
        )}

        {tab === "liens" && (
          <>
            <Card style={{ padding: 13, marginBottom: 12, background: "rgba(229,36,126,.06)", borderColor: "rgba(229,36,126,.25)" }}>
              <div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>Chaque lien porte votre code <strong style={{ color: C.magenta }}>{moi.etiquette}</strong>. Toute inscription ou commande faite après un clic vous est attribuée.</div>
            </Card>
            {liens.map((l) => { const url = lienDe(l.cible); return (
              <Card key={l.cible} style={{ padding: 13, marginBottom: 10 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{l.t}</div>
                <code style={{ display: "block", background: "rgba(194,35,142,.05)", border: `1px solid ${C.line}`, borderRadius: 10, padding: "8px 11px", fontSize: 11, color: C.ink, wordBreak: "break-all", margin: "8px 0" }}>{url}</code>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, color: C.inkSoft, fontWeight: 700, flex: 1 }}>{l.clics} clics · {l.conv} conversion{l.conv > 1 ? "s" : ""}</span>
                  <button onClick={() => copier(url, l.cible)} style={{ ...btnPrim, padding: "8px 14px" }}>{copie === l.cible ? "✓ Copié" : "Copier"}</button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, padding: "8px 12px", color: C.green, borderColor: "rgba(30,132,73,.35)" }}>WA</a>
                </div>
              </Card>
            ); })}
          </>
        )}

        {tab === "kit" && (
          <>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>TEXTES PRÊTS À COPIER</div>
            {TEXTES.map((t, i) => (
              <Card key={i} style={{ padding: 13, marginBottom: 10 }}>
                <div style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.6, wordBreak: "break-word" }}>{t}</div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                  <button onClick={() => copier(t, "t" + i)} style={{ ...btnGhost, padding: "6px 12px", fontSize: 11.5 }}>{copie === "t" + i ? "✓ Copié" : "Copier"}</button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(t)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnPrim, padding: "6px 12px", fontSize: 11.5, background: "#25D366" }}>Partager</a>
                </div>
              </Card>
            ))}
            <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", margin: "16px 0 8px" }}>PRODUITS À PROMOUVOIR</div>
            {d.produits.map((p) => (
              <Card key={p.id} style={{ padding: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{p.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{p.nom}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{gdes(p.prix_public)} · commission {gdes(Math.round(p.prix_public * palier.pct / 100))}</div></div>
                  <button onClick={() => copier(lienDe("boutique"), "p" + p.id)} style={{ ...btnGhost, padding: "6px 12px", fontSize: 11.5 }}>{copie === "p" + p.id ? "✓" : "Lien"}</button>
                </div>
              </Card>
            ))}
          </>
        )}

        {tab === "conv" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 14 }}>
              {PALIERS.map((p) => { const on = p.l === palier.l; return (
                <Card key={p.l} style={{ padding: "10px 6px", textAlign: "center", borderColor: on ? "rgba(229,36,126,.45)" : C.line, background: on ? "rgba(229,36,126,.05)" : C.card }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: C.ink }}>{p.l}</div><div style={{ fontSize: 9.5, color: C.inkFaint }}>dès {p.n}</div><div style={{ fontSize: 14, fontWeight: 800, color: C.magenta, marginTop: 3 }}>{p.pct} %</div>
                </Card>
              ); })}
            </div>
            {conv.length === 0 ? <Card style={{ padding: 22, textAlign: "center" }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune conversion.</p></Card> : conv.map((c) => (
              <Card key={c.id} style={{ padding: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{c.quoi}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{fmt(c.date)} · base {gdes(c.base)}</div></div>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: c.statut === "validee" ? C.green : C.inkFaint }}>{gdes(commission(c))}</span>
                  <Badge tone={toneConv(c.statut)}>{lblConv(c.statut)}</Badge>
                </div>
              </Card>
            ))}
          </>
        )}

        {tab === "paie" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <Card style={{ padding: 13, background: "rgba(229,36,126,.07)", borderColor: "rgba(229,36,126,.30)" }}><div style={{ fontSize: 20, fontWeight: 800, color: C.blush }}>{gdes(dispo)}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>Disponible</div></Card>
              <Card style={{ padding: 13 }}><div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>{gdes(attente)}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>En attente de validation</div></Card>
              <Card style={{ padding: 13 }}><div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{gdes(paye)}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>Déjà perçu</div></Card>
              <Card style={{ padding: 13 }}><div style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>{gdes(demande)}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>Retrait demandé</div></Card>
            </div>

            <Card style={{ padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 10 }}>DEMANDER UN RETRAIT (min. {gdes(SEUIL_RETRAIT)})</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><label style={label}>Montant</label><input style={input} inputMode="numeric" value={retrait.montant} onChange={(e) => { setRetrait({ ...retrait, montant: e.target.value.replace(/\D/g, "") }); setMsg(""); }} placeholder={String(dispo)} /></div>
                <div><label style={label}>Mode</label><select style={input} value={retrait.mode} onChange={(e) => setRetrait({ ...retrait, mode: e.target.value })}><option value="moncash">MonCash</option><option value="natcash">NatCash</option></select></div>
                <div style={{ gridColumn: "1 / -1" }}><label style={label}>Numéro à créditer</label><input style={input} inputMode="tel" value={retrait.numero} onChange={(e) => { setRetrait({ ...retrait, numero: e.target.value }); setMsg(""); }} placeholder="3712 3456" /></div>
              </div>
              {msg && <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 11, background: msg.startsWith("Erreur") ? "rgba(192,57,43,.10)" : "rgba(30,132,73,.10)", fontSize: 12.5, fontWeight: 700, color: msg.startsWith("Erreur") ? C.danger : C.green }}>{msg}</div>}
              <button onClick={demanderRetrait} disabled={dispo < SEUIL_RETRAIT} style={{ ...btnPrim, width: "100%", marginTop: 12, padding: "12px", opacity: dispo < SEUIL_RETRAIT ? 0.5 : 1 }}>Envoyer la demande</button>
            </Card>

            <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>HISTORIQUE</div>
            <Card style={{ padding: "4px 14px", marginBottom: 14 }}>
              {d.retraits.length === 0 && <p style={{ margin: "10px 0", fontSize: 12.5, color: C.inkSoft }}>Aucun retrait.</p>}
              {d.retraits.map((r, i) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{gdes(r.montant)}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{r.mode} · {fmt(r.cree_le)}</div></div>
                  <Badge tone={r.statut === "paye" ? "ok" : r.statut === "refuse" ? "bad" : "info"}>{r.statut === "paye" ? "Payé" : r.statut === "refuse" ? "Refusé" : "Demandé"}</Badge>
                </div>
              ))}
            </Card>
            <Card style={{ padding: 14 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>RÈGLES</div>
              {["Commission versée après validation du paiement (inscription) ou livraison (commande)", "Le niveau monte avec le nombre de conversions validées", `Seuil minimum de retrait : ${gdes(SEUIL_RETRAIT)}`, "Paiement MonCash / NatCash sous 48 h ouvrables", "Toute inscription annulée ou remboursée annule la commission"].map((x) => <div key={x} style={{ display: "flex", gap: 8, fontSize: 12.5, color: C.inkSoft, padding: "4px 0", lineHeight: 1.5 }}><span style={{ color: C.green, fontWeight: 800 }}>✓</span>{x}</div>)}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
