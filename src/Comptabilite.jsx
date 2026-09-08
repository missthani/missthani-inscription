import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — COMPTABILITÉ  (/comptabilite)
   École + Boutique · Dépenses · Salaires · Taxes (Haïti)
   Sources : DGI (dgi.gouv.ht), décret du 29 sept. 2005 (IR),
   loi TCA. Estimations — à confirmer avec votre comptable.
   ============================================================ */

const MOT_DE_PASSE = "compta2026";

const C = {
  bg: "#F7F2F6", card: "#FFFFFF", ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.58)", inkFaint: "rgba(58,14,51,.38)",
  blush: "#E5247E", magenta: "#C2238E", gold: "#E0A50A",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};

/* Barèm IR pèsonn fizik — dekrè 29 sept. 2005, art. 149 (anyèl, gdes) */
const BAREME = [
  { jusqua: 60000, taux: 0 },
  { jusqua: 240000, taux: 10 },
  { jusqua: 480000, taux: 15 },
  { jusqua: 1000000, taux: 25 },
  { jusqua: Infinity, taux: 30 },
];
function impotBareme(revenuAnnuel) {
  let reste = Math.max(0, revenuAnnuel), bas = 0, total = 0;
  for (const t of BAREME) {
    const tranche = Math.max(0, Math.min(reste, t.jusqua - bas));
    total += tranche * t.taux / 100;
    reste -= tranche; bas = t.jusqua;
    if (reste <= 0) break;
  }
  return Math.round(total);
}

const gdes = (n) => Math.round(Number(n || 0)).toLocaleString("fr-FR") + " gdes";
const today = () => new Date().toISOString().slice(0, 10);
const moisDe = (iso) => (iso || "").slice(0, 7);
const libMois = (m) => { if (!m) return ""; const [y, mm] = m.split("-").map(Number); return ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"][mm - 1] + " " + y; };
const fmt = (s) => { if (!s) return ""; const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return `${d} ${["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."][m - 1]} ${y}`; };
/* Egzèsis fiskal Ayiti: 1 oktòb → 30 septanm */
const exerciceDe = (iso) => { const [y, m] = (iso || today()).slice(0, 7).split("-").map(Number); return m >= 10 ? `${y}-${y + 1}` : `${y - 1}-${y}`; };
const dansExercice = (iso, ex) => exerciceDe(iso) === ex;

function Card({ children, style }) { return <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: "0 6px 20px rgba(142,44,154,.06)", ...style }}>{children}</div>; }
function Badge({ tone = "neutral", children }) {
  const map = { ok: ["rgba(30,132,73,.10)", C.green], warn: ["rgba(224,165,10,.16)", "#9A7000"], info: ["rgba(194,35,142,.10)", C.magenta], bad: ["rgba(192,57,43,.10)", C.danger], neutral: ["rgba(58,14,51,.06)", C.inkSoft] };
  const [bg, fg] = map[tone] || map.neutral;
  return <span style={{ background: bg, color: fg, fontSize: 10.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
}
const btnPrim = { border: "none", borderRadius: 999, padding: "11px 16px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif" };
const btnGhost = { border: `1.3px solid ${C.line}`, borderRadius: 999, padding: "9px 14px", background: "#fff", color: C.ink, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 11, border: `1.3px solid ${C.line}`, background: "#fff", color: C.ink, fontSize: 13.5, fontFamily: "'Inter',sans-serif", outline: "none" };
const label = { display: "block", fontSize: 11, fontWeight: 700, color: C.inkSoft, marginBottom: 5 };
const Ligne = ({ l, v, c, bold }) => <div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0", fontSize: bold ? 13.5 : 12.5, fontWeight: bold ? 800 : 500, color: C.ink }}><span style={{ color: bold ? C.ink : C.inkSoft }}>{l}</span><span style={{ color: c || C.ink, fontWeight: 800 }}>{v}</span></div>;
const Titre = ({ children, right }) => <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}><span style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px" }}>{children}</span>{right}</div>;

/* ---------- Kalkil yon fich pè ---------- */
function calculerPaie(brut, boni, P) {
  const b = Number(brut) || 0, bo = Number(boni) || 0;
  const base = b * (1 - P.abattement / 100);
  const iriAnnuel = impotBareme(base * 12);
  const iri = Math.round(iriAnnuel / 12) + Math.round(bo * P.boni / 100);
  const ona_emp = b * P.ona_emp / 100, ofatma_emp = b * P.ofatma_emp / 100;
  const cas = b * P.cas / 100, fdu = b * P.fdu / 100, cfgdct = b >= 5000 ? b * P.cfgdct / 100 : 0;
  const net = b + bo - iri - ona_emp - ofatma_emp - cas - fdu - cfgdct;
  const ona_pat = b * P.ona_pat / 100, ofatma_pat = b * P.ofatma_pat / 100, tms = b * P.tms / 100;
  return { brut: b, boni: bo, iri, ona_emp, ofatma_emp, cas, fdu, cfgdct, net, ona_pat, ofatma_pat, tms, cout: b + bo + ona_pat + ofatma_pat + tms };
}

export default function Comptabilite() {
  const [ok, setOk] = useState(() => { try { return sessionStorage.getItem("mt_compta") === "1"; } catch (e) { return false; } });
  const [pwd, setPwd] = useState(""); const [err, setErr] = useState("");
  const [tab, setTab] = useState("bord");
  const [mois, setMois] = useState(moisDe(today()));
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState("");

  const entrer = () => { if (pwd === MOT_DE_PASSE) { setOk(true); try { sessionStorage.setItem("mt_compta", "1"); } catch (e) {} } else setErr("Mot de passe incorrect."); };

  const recharger = async () => {
    const [pa, cm, dp, em, py, pr, rt] = await Promise.all([
      supabase.from("paiements").select("*").eq("statut", "valide"),
      supabase.from("commandes").select("*").eq("statut", "livree"),
      supabase.from("depenses").select("*").order("date_dep", { ascending: false }),
      supabase.from("employes").select("*").order("nom"),
      supabase.from("paies").select("*"),
      supabase.from("parametres_compta").select("*"),
      supabase.from("retraits").select("*").eq("statut", "paye"),
    ]);
    const P = {}; (pr.data || []).forEach((x) => { P[x.cle] = x.valeur; });
    const num = (k, def) => (P[k] === undefined || P[k] === "" ? def : Number(P[k]));
    setD({
      paiements: pa.data || [], commandes: cm.data || [], depenses: dp.data || [], employes: em.data || [], paies: py.data || [], retraits: rt.data || [],
      Praw: pr.data || [],
      P: { regime: P.regime || "individuel", prix_ttc: (P.prix_ttc || "oui") === "oui", tca: num("tca", 10), is_societe: num("is_societe", 30), ona_emp: num("ona_emp", 6), ona_pat: num("ona_pat", 6), ofatma_emp: num("ofatma_emp", 3), ofatma_pat: num("ofatma_pat", 3), cas: num("cas", 1), fdu: num("fdu", 1), cfgdct: num("cfgdct", 1), tms: num("tms", 2), abattement: num("abattement", 10), boni: num("boni", 10), retenue_commission: num("retenue_commission", 15), patente: num("patente", 0), cfpb: num("cfpb", 0), impot_precedent: num("impot_precedent", 0), nif: P.nif || "" },
    });
  };
  useEffect(() => { if (ok) recharger(); }, [ok]);

  const shell = { minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.ink };
  if (!ok) return (
    <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Card style={{ padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, textAlign: "center" }}>👑 MISS THANI</div>
        <div style={{ fontSize: 10, letterSpacing: "2px", color: C.magenta, fontWeight: 700, textAlign: "center", marginTop: 4, marginBottom: 20 }}>COMPTABILITÉ</div>
        <input style={input} type="password" placeholder="Mot de passe" value={pwd} onChange={(e) => { setPwd(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") entrer(); }} autoFocus />
        {err && <p style={{ color: C.danger, fontSize: 12.5, margin: "8px 0 0" }}>{err}</p>}
        <button onClick={entrer} style={{ ...btnPrim, width: "100%", marginTop: 12, padding: "12px" }}>Entrer</button>
      </Card>
    </div>
  );
  if (!d) return <div style={{ ...shell, padding: 30, color: C.inkSoft }}>Chargement…</div>;

  const P = d.P;
  const ex = exerciceDe(mois + "-01");

  /* ---------- REVNI ---------- */
  const revEcoleM = d.paiements.filter((p) => p.objet !== "commande" && moisDe(p.recu_le) === mois).reduce((s, p) => s + Number(p.montant || 0), 0);
  const revBoutM = d.commandes.filter((c) => moisDe(c.cree_le) === mois).reduce((s, c) => s + Number(c.total || 0), 0);
  const revM = revEcoleM + revBoutM;
  const revEcoleEx = d.paiements.filter((p) => p.objet !== "commande" && dansExercice(p.recu_le, ex)).reduce((s, p) => s + Number(p.montant || 0), 0);
  const revBoutEx = d.commandes.filter((c) => dansExercice(c.cree_le, ex)).reduce((s, c) => s + Number(c.total || 0), 0);
  const revEx = revEcoleEx + revBoutEx;

  /* ---------- TCA ---------- */
  const tcaDe = (ttc) => (P.prix_ttc ? ttc * P.tca / (100 + P.tca) : ttc * P.tca / 100);
  const htDe = (ttc) => ttc - tcaDe(ttc);
  const tcaM = tcaDe(revM);
  const tcaEx = tcaDe(revEx);

  /* ---------- DEPANS ---------- */
  const depM = d.depenses.filter((x) => moisDe(x.date_dep) === mois);
  const depEx = d.depenses.filter((x) => dansExercice(x.date_dep, ex));
  const totDepM = depM.reduce((s, x) => s + Number(x.montant), 0);
  const totDepEx = depEx.reduce((s, x) => s + Number(x.montant), 0);

  /* ---------- SALÈ ---------- */
  const paiesM = d.paies.filter((p) => p.mois === mois);
  const paiesEx = d.paies.filter((p) => dansExercice(p.mois + "-01", ex));
  const coutSalM = paiesM.reduce((s, p) => s + Number(p.brut) + Number(p.boni) + Number(p.ona_pat) + Number(p.ofatma_pat) + Number(p.tms), 0);
  const coutSalEx = paiesEx.reduce((s, p) => s + Number(p.brut) + Number(p.boni) + Number(p.ona_pat) + Number(p.ofatma_pat) + Number(p.tms), 0);
  const retenuesM = paiesM.reduce((s, p) => s + Number(p.iri) + Number(p.cas) + Number(p.fdu) + Number(p.cfgdct), 0);
  const onaM = paiesM.reduce((s, p) => s + Number(p.ona_emp) + Number(p.ona_pat), 0);
  const ofatmaM = paiesM.reduce((s, p) => s + Number(p.ofatma_emp) + Number(p.ofatma_pat), 0);
  const tmsM = paiesM.reduce((s, p) => s + Number(p.tms), 0);

  /* ---------- KOMISYON PATNÈ ---------- */
  const comM = d.retraits.filter((r) => moisDe(r.paye_le || r.cree_le) === mois).reduce((s, r) => s + Number(r.montant), 0);
  const comEx = d.retraits.filter((r) => dansExercice(r.paye_le || r.cree_le, ex)).reduce((s, r) => s + Number(r.montant), 0);
  const retComM = comM * P.retenue_commission / 100;

  /* ---------- REZILTA ---------- */
  const resM = htDe(revM) - totDepM - coutSalM - comM;
  const resEx = htDe(revEx) - totDepEx - coutSalEx - comEx;
  const irEx = P.regime === "societe" ? Math.max(0, resEx) * P.is_societe / 100 : impotBareme(Math.max(0, resEx));
  const acompte = P.impot_precedent * 0.75 / 3;

  /* ---------- Aksyon ---------- */
  const setParam = async (cle, valeur) => { await supabase.from("parametres_compta").upsert({ cle, valeur: String(valeur) }); recharger(); };
  const ajouterDep = async (f) => { await supabase.from("depenses").insert(f); recharger(); };
  const supprDep = async (id) => { await supabase.from("depenses").delete().eq("id", id); recharger(); };
  const ajouterEmp = async (f) => { await supabase.from("employes").insert(f); recharger(); };
  const genererPaie = async (e, boni) => {
    const c = calculerPaie(e.salaire_brut, boni, P);
    await supabase.from("paies").upsert({ employe_id: e.id, mois, ...c, cout: undefined }, { onConflict: "employe_id,mois" });
    recharger();
  };
  const togglePaye = async (p) => { await supabase.from("paies").update({ paye: !p.paye }).eq("id", p.id); recharger(); };

  const TABS = [{ k: "bord", l: "Bord" }, { k: "revenus", l: "Revenus" }, { k: "depenses", l: "Dépenses" }, { k: "salaires", l: "Salaires" }, { k: "taxes", l: "Taxes" }, { k: "params", l: "Réglages" }];
  const moisOpts = []; for (let i = 0; i < 14; i++) { const dt = new Date(); dt.setDate(1); dt.setMonth(dt.getMonth() - i); moisOpts.push(dt.toISOString().slice(0, 7)); }

  return (
    <div style={shell}>
      <style>{`*{box-sizing:border-box}body{margin:0}.mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}input::placeholder{color:rgba(58,14,51,.32)}`}</style>
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 10 }}>
            <div style={{ lineHeight: 1 }}><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700 }}>👑 MISS THANI</div><div style={{ fontSize: 9, letterSpacing: "2px", color: C.magenta, fontWeight: 700, marginTop: 3 }}>COMPTABILITÉ · EXERCICE {ex}</div></div>
            <select value={mois} onChange={(e) => setMois(e.target.value)} style={{ ...input, width: "auto", padding: "7px 10px", fontSize: 12, fontWeight: 700 }}>{moisOpts.map((m) => <option key={m} value={m}>{libMois(m)}</option>)}</select>
          </div>
          <div className="mt-row" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {TABS.map((t) => { const on = tab === t.k; return <button key={t.k} onClick={() => setTab(t.k)} style={{ flexShrink: 0, padding: "7px 13px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{t.l}</button>; })}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "16px 16px 40px" }}>
        {msg && <div style={{ marginBottom: 12, padding: "10px 13px", borderRadius: 12, background: "rgba(30,132,73,.10)", fontSize: 12.5, fontWeight: 700, color: C.green }}>{msg}</div>}

        {/* ================= BORD ================= */}
        {tab === "bord" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[["Revenus école", gdes(revEcoleM), C.blush], ["Revenus boutique", gdes(revBoutM), C.magenta], ["Dépenses + salaires", gdes(totDepM + coutSalM + comM), C.danger], ["Résultat (HT)", gdes(resM), resM >= 0 ? C.green : C.danger]].map(([l, v, c]) => (
                <Card key={l} style={{ padding: 13 }}><div style={{ fontSize: 18, fontWeight: 800, color: c, lineHeight: 1.1 }}>{v}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>{l} · {libMois(mois)}</div></Card>
              ))}
            </div>
            <Card style={{ padding: 14, marginBottom: 14, background: "rgba(224,165,10,.08)", borderColor: "rgba(224,165,10,.40)" }}>
              <Titre>À VERSER AVANT LE 15 {libMois(moisOpts[moisOpts.indexOf(mois) - 1] || mois).toUpperCase()}</Titre>
              <Ligne l={`TCA ${P.tca} % sur ${gdes(revM)}`} v={gdes(tcaM)} />
              <Ligne l="Retenues sur salaires (IRI + CAS + FDU + CFGDCT)" v={gdes(retenuesM)} />
              <Ligne l="ONA (employé + employeur)" v={gdes(onaM)} />
              <Ligne l="OFATMA (employé + employeur)" v={gdes(ofatmaM)} />
              <Ligne l="Taxe sur la masse salariale" v={gdes(tmsM)} />
              {comM > 0 && <Ligne l={`Retenue ${P.retenue_commission} % sur commissions partenaires`} v={gdes(retComM)} />}
              <div style={{ borderTop: `1px solid rgba(224,165,10,.4)`, marginTop: 6 }}><Ligne l="Total du mois" v={gdes(tcaM + retenuesM + onaM + ofatmaM + tmsM + retComM)} bold /></div>
            </Card>
            <Card style={{ padding: 14, marginBottom: 14 }}>
              <Titre right={<Badge tone="info">{ex}</Badge>}>EXERCICE EN COURS (1 oct. → 30 sept.)</Titre>
              <Ligne l="Chiffre d'affaires TTC" v={gdes(revEx)} />
              <Ligne l="dont TCA collectée" v={gdes(tcaEx)} c={C.inkSoft} />
              <Ligne l="Dépenses" v={gdes(totDepEx)} c={C.danger} />
              <Ligne l="Salaires + charges" v={gdes(coutSalEx)} c={C.danger} />
              <Ligne l="Commissions partenaires" v={gdes(comEx)} c={C.danger} />
              <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 6 }}><Ligne l="Résultat estimé" v={gdes(resEx)} c={resEx >= 0 ? C.green : C.danger} bold /></div>
              <Ligne l={P.regime === "societe" ? `Impôt sur les sociétés (${P.is_societe} %)` : "Impôt sur le revenu (barème progressif)"} v={gdes(irEx)} c={C.magenta} bold />
            </Card>
            <Card style={{ padding: 13 }}>
              <div style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.55 }}>⚠️ Ces montants sont des <strong>estimations</strong> calculées à partir des données saisies. Le nouveau Code fiscal entre en vigueur le <strong>1er octobre 2026</strong> — faites vérifier les taux par votre comptable.</div>
            </Card>
          </>
        )}

        {/* ================= REVENUS ================= */}
        {tab === "revenus" && (
          <>
            <Card style={{ padding: 14, marginBottom: 12 }}>
              <Titre right={<Badge tone="info">{libMois(mois)}</Badge>}>RÉPARTITION</Titre>
              <Ligne l="École — inscriptions, uniformes, kits" v={gdes(revEcoleM)} />
              <Ligne l="Boutique — commandes livrées" v={gdes(revBoutM)} />
              <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 6 }}><Ligne l="Total TTC" v={gdes(revM)} bold /></div>
              <Ligne l={`TCA ${P.tca} % ${P.prix_ttc ? "(incluse)" : "(à ajouter)"}`} v={gdes(tcaM)} c={C.magenta} />
              <Ligne l="Chiffre d'affaires HT" v={gdes(htDe(revM))} c={C.green} bold />
            </Card>
            <Titre>ÉCOLE</Titre>
            <Card style={{ padding: "4px 14px", marginBottom: 14 }}>
              {d.paiements.filter((p) => p.objet !== "commande" && moisDe(p.recu_le) === mois).map((p, i) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: i ? `1px solid ${C.line}` : "none", fontSize: 12.5 }}>
                  <span style={{ color: C.inkSoft }}>{fmt(p.recu_le)} · {p.objet} · {p.mode || "—"}</span><strong>{gdes(p.montant)}</strong>
                </div>
              ))}
              {revEcoleM === 0 && <p style={{ margin: "10px 0", fontSize: 12.5, color: C.inkSoft }}>Aucun paiement validé ce mois.</p>}
            </Card>
            <Titre>BOUTIQUE</Titre>
            <Card style={{ padding: "4px 14px" }}>
              {d.commandes.filter((c) => moisDe(c.cree_le) === mois).map((c, i) => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "8px 0", borderTop: i ? `1px solid ${C.line}` : "none", fontSize: 12.5 }}>
                  <span style={{ color: C.inkSoft }}>{fmt(c.cree_le)} · {c.nom_client}</span><strong>{gdes(c.total)}</strong>
                </div>
              ))}
              {revBoutM === 0 && <p style={{ margin: "10px 0", fontSize: 12.5, color: C.inkSoft }}>Aucune commande livrée ce mois.</p>}
            </Card>
          </>
        )}

        {/* ================= DÉPENSES ================= */}
        {tab === "depenses" && <Depenses d={d} depM={depM} mois={mois} totDepM={totDepM} onAdd={ajouterDep} onDel={supprDep} />}

        {/* ================= SALAIRES ================= */}
        {tab === "salaires" && <Salaires d={d} P={P} mois={mois} paiesM={paiesM} onAddEmp={ajouterEmp} onGen={genererPaie} onToggle={togglePaye} />}

        {/* ================= TAXES ================= */}
        {tab === "taxes" && (
          <>
            <Card style={{ padding: 14, marginBottom: 12 }}>
              <Titre>CALENDRIER FISCAL — ÉCHÉANCES</Titre>
              {[
                ["Chaque mois, 1–15", "TCA du mois précédent", gdes(tcaM)],
                ["Chaque mois, 1–15", "Retenues sur salaires, ONA, OFATMA, TMS", gdes(retenuesM + onaM + ofatmaM + tmsM)],
                ["15 oct · 15 nov · 15 déc", "Acomptes provisionnels (3 × 25 % de l'IR précédent)", gdes(acompte) + " × 3"],
                ["1 oct → 31 janv", "Déclaration définitive d'impôt sur le revenu", "—"],
                ["1 oct → 31 déc", "Renouvellement de la patente", gdes(P.patente)],
                ["1 oct → 31 mars", "CFPB (contribution foncière)", gdes(P.cfpb)],
              ].map(([q, t, m], i) => (
                <div key={t} style={{ display: "flex", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                  <div style={{ width: 118, flexShrink: 0, fontSize: 10.5, fontWeight: 800, color: C.magenta, lineHeight: 1.4 }}>{q}</div>
                  <div style={{ flex: 1, fontSize: 12.5, color: C.ink }}>{t}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.inkSoft, whiteSpace: "nowrap" }}>{m}</div>
                </div>
              ))}
            </Card>
            <Card style={{ padding: 14, marginBottom: 12 }}>
              <Titre right={<Badge tone="info">{ex}</Badge>}>IMPÔT SUR LE REVENU — ESTIMATION</Titre>
              <Ligne l="Résultat imposable estimé" v={gdes(Math.max(0, resEx))} />
              {P.regime === "individuel" ? BAREME.map((t, i) => {
                const bas = i ? BAREME[i - 1].jusqua : 0; const haut = t.jusqua === Infinity ? "et plus" : gdes(t.jusqua);
                const tranche = Math.max(0, Math.min(Math.max(0, resEx), t.jusqua) - bas);
                return <Ligne key={i} l={`${gdes(bas)} → ${haut} · ${t.taux} %`} v={gdes(tranche * t.taux / 100)} c={C.inkSoft} />;
              }) : <Ligne l={`Taux sociétés ${P.is_societe} %`} v={gdes(irEx)} />}
              <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 6 }}><Ligne l="Impôt estimé" v={gdes(irEx)} c={C.magenta} bold /></div>
              <Ligne l="Acomptes déjà prévus (75 % de l'IR précédent)" v={gdes(P.impot_precedent * 0.75)} c={C.inkSoft} />
              <Ligne l="Solde estimé à la déclaration" v={gdes(Math.max(0, irEx - P.impot_precedent * 0.75))} bold />
            </Card>
            <Card style={{ padding: 14 }}>
              <Titre>RÈGLES APPLIQUÉES (HAÏTI)</Titre>
              {[
                `TCA ${P.tca} % sur toute vente ou prestation — déclaration et versement du 1er au 15 du mois suivant (loi du 19 sept. 1982).`,
                "Impôt sur le revenu : barème progressif 0 / 10 / 15 / 25 / 30 % pour l'entreprise individuelle (décret du 29 sept. 2005, art. 149) ; 30 % pour les sociétés.",
                "Exercice fiscal du 1er octobre au 30 septembre. Déclaration définitive entre le 1er octobre et le 31 janvier.",
                "Acomptes provisionnels : 75 % de l'impôt de l'exercice précédent, en trois versements égaux les 15 octobre, novembre et décembre.",
                `Salaires : abattement ${P.abattement} % puis barème IR ; retenues employé ONA ${P.ona_emp} %, OFATMA ${P.ofatma_emp} %, CAS ${P.cas} %, FDU ${P.fdu} %, CFGDCT ${P.cfgdct} % (salaire ≥ 5 000). Employeur : ONA ${P.ona_pat} %, OFATMA ${P.ofatma_pat} %, TMS ${P.tms} %.`,
                `Bonis et 13e mois : ${P.boni} % forfaitaire. Commissions versées à des non-patentés : retenue ${P.retenue_commission} %.`,
                "Patente et CFPB : annuelles, montants fixés par la commune / la DGI — à saisir dans Réglages.",
              ].map((x) => <div key={x} style={{ display: "flex", gap: 8, fontSize: 12, color: C.inkSoft, padding: "5px 0", lineHeight: 1.55 }}><span style={{ color: C.magenta, fontWeight: 800 }}>•</span>{x}</div>)}
            </Card>
          </>
        )}

        {/* ================= RÉGLAGES ================= */}
        {tab === "params" && (
          <>
            <Card style={{ padding: 14, marginBottom: 12 }}>
              <Titre>ENTREPRISE</Titre>
              <label style={label}>Régime fiscal</label>
              <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
                {[["individuel", "Entreprise individuelle (barème)"], ["societe", "Société (30 %)"]].map(([k, l]) => <button key={k} onClick={() => setParam("regime", k)} style={{ flex: 1, padding: "9px 8px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${P.regime === k ? C.magenta : C.line}`, background: P.regime === k ? C.magenta : "#fff", color: P.regime === k ? "#fff" : C.ink }}>{l}</button>)}
              </div>
              <label style={label}>Les prix affichés incluent-ils la TCA ?</label>
              <div style={{ display: "flex", gap: 7 }}>
                {[["oui", "Oui, TCA incluse"], ["non", "Non, TCA en plus"]].map(([k, l]) => <button key={k} onClick={() => setParam("prix_ttc", k)} style={{ flex: 1, padding: "9px 8px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${(P.prix_ttc ? "oui" : "non") === k ? C.magenta : C.line}`, background: (P.prix_ttc ? "oui" : "non") === k ? C.magenta : "#fff", color: (P.prix_ttc ? "oui" : "non") === k ? "#fff" : C.ink }}>{l}</button>)}
              </div>
            </Card>
            <Card style={{ padding: 14 }}>
              <Titre>TAUX ET MONTANTS</Titre>
              {d.Praw.filter((x) => !["regime", "prix_ttc"].includes(x.cle)).map((x) => <ParamLigne key={x.cle} x={x} onSave={setParam} />)}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function ParamLigne({ x, onSave }) {
  const [v, setV] = useState(x.valeur || "");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: `1px solid ${C.line}` }}>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{x.note || x.cle}</div><div style={{ fontSize: 10, color: C.inkFaint, fontFamily: "monospace" }}>{x.cle}</div></div>
      <input style={{ ...input, width: 110, textAlign: "right", padding: "7px 10px" }} value={v} onChange={(e) => setV(e.target.value)} onBlur={() => { if (v !== x.valeur) onSave(x.cle, v); }} />
    </div>
  );
}

function Depenses({ d, depM, mois, totDepM, onAdd, onDel }) {
  const [f, setF] = useState({ date_dep: today(), entite: "ecole", categorie: "materiel", libelle: "", montant: "", fournisseur: "" });
  const CATS = ["loyer", "materiel", "achat_stock", "marketing", "transport", "electricite_internet", "entretien", "autre"];
  const parCat = {}; depM.forEach((x) => { parCat[x.categorie] = (parCat[x.categorie] || 0) + Number(x.montant); });
  return (
    <>
      <Card style={{ padding: 14, marginBottom: 12 }}>
        <Titre>NOUVELLE DÉPENSE</Titre>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><label style={label}>Date</label><input style={input} type="date" value={f.date_dep} onChange={(e) => setF({ ...f, date_dep: e.target.value })} /></div>
          <div><label style={label}>Entité</label><select style={input} value={f.entite} onChange={(e) => setF({ ...f, entite: e.target.value })}><option value="ecole">École</option><option value="boutique">Boutique</option></select></div>
          <div><label style={label}>Catégorie</label><select style={input} value={f.categorie} onChange={(e) => setF({ ...f, categorie: e.target.value })}>{CATS.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}</select></div>
          <div><label style={label}>Montant (gdes)</label><input style={input} inputMode="numeric" value={f.montant} onChange={(e) => setF({ ...f, montant: e.target.value.replace(/\D/g, "") })} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={label}>Libellé</label><input style={input} value={f.libelle} onChange={(e) => setF({ ...f, libelle: e.target.value })} placeholder="Ex : Loyer du local — septembre" /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={label}>Fournisseur (optionnel)</label><input style={input} value={f.fournisseur} onChange={(e) => setF({ ...f, fournisseur: e.target.value })} /></div>
        </div>
        <button onClick={() => { if (!f.libelle.trim() || !f.montant) return; onAdd({ ...f, montant: Number(f.montant) }); setF({ ...f, libelle: "", montant: "", fournisseur: "" }); }} style={{ ...btnPrim, width: "100%", marginTop: 10, padding: "11px" }}>+ Enregistrer</button>
      </Card>
      <Card style={{ padding: 14, marginBottom: 12 }}>
        <Titre right={<Badge tone="bad">{gdes(totDepM)}</Badge>}>{libMois(mois).toUpperCase()} — PAR CATÉGORIE</Titre>
        {Object.entries(parCat).sort((a, b) => b[1] - a[1]).map(([c, v]) => <Ligne key={c} l={c.replace("_", " ")} v={gdes(v)} />)}
        {depM.length === 0 && <p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune dépense ce mois.</p>}
      </Card>
      {depM.map((x) => (
        <Card key={x.id} style={{ padding: 12, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{x.libelle}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{fmt(x.date_dep)} · {x.entite} · {x.categorie}{x.fournisseur ? ` · ${x.fournisseur}` : ""}</div></div>
            <strong style={{ color: C.danger }}>{gdes(x.montant)}</strong>
            <button onClick={() => { if (window.confirm("Supprimer cette dépense ?")) onDel(x.id); }} style={{ border: "none", background: "none", cursor: "pointer", color: C.inkFaint, fontSize: 16 }}>✕</button>
          </div>
        </Card>
      ))}
    </>
  );
}

function Salaires({ d, P, mois, paiesM, onAddEmp, onGen, onToggle }) {
  const [nv, setNv] = useState({ nom: "", poste: "", entite: "ecole", salaire_brut: "" });
  const [boni, setBoni] = useState({});
  const [open, setOpen] = useState(false);
  const paieDe = (e) => paiesM.find((p) => p.employe_id === e.id);
  const totalNet = paiesM.reduce((s, p) => s + Number(p.net), 0);
  const totalCout = paiesM.reduce((s, p) => s + Number(p.brut) + Number(p.boni) + Number(p.ona_pat) + Number(p.ofatma_pat) + Number(p.tms), 0);
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <Card style={{ padding: 13 }}><div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>{gdes(totalNet)}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>Net à verser · {libMois(mois)}</div></Card>
        <Card style={{ padding: 13 }}><div style={{ fontSize: 17, fontWeight: 800, color: C.danger }}>{gdes(totalCout)}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>Coût total employeur</div></Card>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}><button onClick={() => setOpen((v) => !v)} style={btnPrim}>+ Employé(e)</button></div>
      {open && (
        <Card style={{ padding: 14, marginBottom: 12, borderColor: "rgba(229,36,126,.35)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ gridColumn: "1 / -1" }}><input style={input} placeholder="Nom complet" value={nv.nom} onChange={(e) => setNv({ ...nv, nom: e.target.value })} /></div>
            <input style={input} placeholder="Poste" value={nv.poste} onChange={(e) => setNv({ ...nv, poste: e.target.value })} />
            <select style={input} value={nv.entite} onChange={(e) => setNv({ ...nv, entite: e.target.value })}><option value="ecole">École</option><option value="boutique">Boutique</option></select>
            <div style={{ gridColumn: "1 / -1" }}><input style={input} inputMode="numeric" placeholder="Salaire brut mensuel (gdes)" value={nv.salaire_brut} onChange={(e) => setNv({ ...nv, salaire_brut: e.target.value.replace(/\D/g, "") })} /></div>
          </div>
          <button onClick={() => { if (!nv.nom.trim() || !nv.salaire_brut) return; onAddEmp({ ...nv, salaire_brut: Number(nv.salaire_brut) }); setNv({ nom: "", poste: "", entite: "ecole", salaire_brut: "" }); setOpen(false); }} style={{ ...btnPrim, width: "100%", marginTop: 10 }}>Enregistrer</button>
        </Card>
      )}
      {d.employes.filter((e) => e.actif).map((e) => {
        const p = paieDe(e);
        const sim = calculerPaie(e.salaire_brut, boni[e.id] || 0, P);
        const show = p || sim;
        return (
          <Card key={e.id} style={{ padding: 13, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{e.nom}</div><div style={{ fontSize: 11, color: C.inkSoft }}>{e.poste || "—"} · {e.entite} · brut {gdes(e.salaire_brut)}</div></div>
              {p ? <Badge tone={p.paye ? "ok" : "warn"}>{p.paye ? "Payé" : "À payer"}</Badge> : <Badge tone="neutral">Non généré</Badge>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 16px", fontSize: 11.5 }}>
              <Ligne l={`IRI (abatt. ${P.abattement} %)`} v={gdes(show.iri)} c={C.inkSoft} />
              <Ligne l="ONA employé" v={gdes(show.ona_emp)} c={C.inkSoft} />
              <Ligne l="OFATMA employé" v={gdes(show.ofatma_emp)} c={C.inkSoft} />
              <Ligne l="CAS + FDU + CFGDCT" v={gdes(Number(show.cas) + Number(show.fdu) + Number(show.cfgdct))} c={C.inkSoft} />
              <Ligne l="ONA + OFATMA employeur" v={gdes(Number(show.ona_pat) + Number(show.ofatma_pat))} c={C.inkSoft} />
              <Ligne l="TMS employeur" v={gdes(show.tms)} c={C.inkSoft} />
            </div>
            <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 4 }}><Ligne l="Net à verser" v={gdes(show.net)} c={C.green} bold /></div>
            {!p ? (
              <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                <input style={{ ...input, width: 130, padding: "8px 10px" }} inputMode="numeric" placeholder="Boni (gdes)" value={boni[e.id] || ""} onChange={(ev) => setBoni({ ...boni, [e.id]: ev.target.value.replace(/\D/g, "") })} />
                <button onClick={() => onGen(e, Number(boni[e.id]) || 0)} style={{ ...btnPrim, flex: 1 }}>Générer la fiche de {libMois(mois)}</button>
              </div>
            ) : (
              <button onClick={() => onToggle(p)} style={{ ...btnGhost, width: "100%", marginTop: 8, color: p.paye ? C.inkFaint : C.green }}>{p.paye ? "Marquer non payé" : "✓ Marquer payé"}</button>
            )}
          </Card>
        );
      })}
      {d.employes.length === 0 && <Card style={{ padding: 22, textAlign: "center" }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucun(e) employé(e). Ajoutez-en pour générer les fiches de paie.</p></Card>}
    </>
  );
}
