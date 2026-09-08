import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — CARRIÈRES & FORMATION INTERNE  (/carrieres)
   Organigramme · Postes · Formations · Mon parcours
   ============================================================ */

const MOT_DE_PASSE = "equipe2026";

const C = {
  bg: "#F7F2F6", card: "#FFFFFF", ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.58)", inkFaint: "rgba(58,14,51,.38)",
  blush: "#E5247E", magenta: "#C2238E", gold: "#E0A50A",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};
const BRANCHES = ["Pédagogie", "Administration", "Commercial", "Direction"];
const fmt = (s) => { if (!s) return ""; const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return `${d} ${["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."][m - 1]} ${y}`; };
const lignes = (t) => String(t || "").split("\n").map((x) => x.trim()).filter(Boolean);

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
const typeTone = (t) => (t === "obligatoire" ? "bad" : t === "metier" ? "info" : "warn");
const typeLbl = (t) => (t === "obligatoire" ? "Obligatoire" : t === "metier" ? "Métier" : "Évolution");

/* ---------- Fich pòs (detay) ---------- */
function FichePoste({ p, onClose, postes }) {
  const Bloc = ({ titre, txt, tone }) => lignes(txt).length ? (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, color: tone, letterSpacing: ".3px", marginBottom: 5 }}>{titre}</div>
      {lignes(txt).map((l) => <div key={l} style={{ display: "flex", gap: 8, fontSize: 12.5, color: C.inkSoft, padding: "2px 0", lineHeight: 1.55 }}><span style={{ width: 4, height: 4, borderRadius: 999, background: tone, marginTop: 8, flexShrink: 0 }} />{l}</div>)}
    </div>
  ) : null;
  const sup = postes.find((x) => x.titre === p.superieur_titre);
  return (
    <Card style={{ padding: 0, overflow: "hidden", marginTop: 14 }}>
      <div style={{ padding: "14px 16px", background: `linear-gradient(120deg, ${C.blush}, ${C.magenta})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div><div style={{ fontSize: 10.5, opacity: 0.9, fontWeight: 700, letterSpacing: ".5px" }}>{p.branche.toUpperCase()} · NIVEAU {p.niveau}{p.salaire ? ` · ${p.salaire.toUpperCase()}` : ""}</div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, marginTop: 2 }}>{p.titre}</div></div>
        {onClose && <button onClick={onClose} style={{ border: "none", background: "none", color: "#fff", cursor: "pointer", fontSize: 18 }}>✕</button>}
      </div>
      <div style={{ padding: 16 }}>
        {sup && <div style={{ fontSize: 11.5, color: C.inkSoft, marginBottom: 12 }}>Rend compte à : <strong style={{ color: C.ink }}>{sup.titre}</strong></div>}
        <Bloc titre="MISSIONS" txt={p.missions} tone={C.magenta} />
        <Bloc titre="EXIGENCES POUR ENTRER" txt={p.exigences} tone={C.blush} />
        <Bloc titre="FORMATIONS INTERNES" txt={p.formations} tone={C.green} />
        <Bloc titre="POUR ÊTRE PROMUE" txt={p.promotion} tone={C.gold} />
        {p.suivant_titre && <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: 12, background: "rgba(229,36,126,.06)", border: "1px solid rgba(229,36,126,.22)" }}><span style={{ color: C.magenta, fontWeight: 800 }}>→</span><div><div style={{ fontSize: 10.5, color: C.inkSoft, fontWeight: 700 }}>Poste suivant</div><div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{p.suivant_titre}</div></div></div>}
      </div>
    </Card>
  );
}

/* ---------- Òganigram (pyebwa reyèl, soti nan superieur_titre) ---------- */
function Organigramme({ postes, employes, onPick }) {
  const enfants = (titre) => postes.filter((p) => p.superieur_titre === titre).sort((a, b) => a.ordre - b.ordre);
  const racines = postes.filter((p) => !p.superieur_titre);
  const qui = (titre) => employes.filter((e) => e.poste_id && (postes.find((p) => p.id === e.poste_id) || {}).titre === titre);
  const Noeud = ({ p, prof }) => {
    const kids = enfants(p.titre);
    const occ = qui(p.titre);
    return (
      <div style={{ marginLeft: prof ? 18 : 0, position: "relative" }}>
        {prof > 0 && <span style={{ position: "absolute", left: -12, top: 0, bottom: 0, width: 1, background: C.line }} />}
        {prof > 0 && <span style={{ position: "absolute", left: -12, top: 22, width: 12, height: 1, background: C.line }} />}
        <button onClick={() => onPick(p)} style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 12, cursor: "pointer", border: `1.3px solid ${prof === 0 ? "transparent" : C.line}`, background: prof === 0 ? `linear-gradient(135deg, ${C.blush}, ${C.magenta})` : prof === 1 ? "rgba(194,35,142,.07)" : C.card, marginBottom: 6 }}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", background: prof === 0 ? "rgba(255,255,255,.25)" : "rgba(229,36,126,.10)", color: prof === 0 ? "#fff" : C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 800, flexShrink: 0 }}>{p.niveau}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 12.5, fontWeight: 800, color: prof === 0 ? "#fff" : C.ink }}>{p.titre}</span>
            <span style={{ display: "block", fontSize: 10.5, color: prof === 0 ? "rgba(255,255,255,.85)" : C.inkFaint }}>{occ.length ? occ.map((e) => e.nom.split(" ")[0]).join(", ") : p.branche}</span>
          </span>
          <span style={{ color: prof === 0 ? "#fff" : C.inkFaint }}>›</span>
        </button>
        {kids.map((k) => <Noeud key={k.id} p={k} prof={prof + 1} />)}
      </div>
    );
  };
  return <div>{racines.map((r) => <Noeud key={r.id} p={r} prof={0} />)}</div>;
}

/* ---------- App ---------- */
export default function Carrieres() {
  const [ok, setOk] = useState(() => { try { return sessionStorage.getItem("mt_carr") === "1"; } catch (e) { return false; } });
  const [pwd, setPwd] = useState(""); const [err, setErr] = useState("");
  const [tab, setTab] = useState("orga");
  const [d, setD] = useState(null);
  const [sel, setSel] = useState(null);
  const [moi, setMoi] = useState(() => { try { return sessionStorage.getItem("mt_carr_moi") || ""; } catch (e) { return ""; } });
  const [branche, setBranche] = useState("Pédagogie");
  const [typeF, setTypeF] = useState("tous");

  const entrer = () => { if (pwd === MOT_DE_PASSE) { setOk(true); try { sessionStorage.setItem("mt_carr", "1"); } catch (e) {} } else setErr("Mot de passe incorrect."); };
  const recharger = async () => {
    const [p, f, s, e] = await Promise.all([
      supabase.from("postes").select("*").order("ordre"),
      supabase.from("formations_internes").select("*").order("ordre"),
      supabase.from("suivi_formations").select("*"),
      supabase.from("employes").select("*").eq("actif", true).order("nom"),
    ]);
    setD({ postes: p.data || [], formations: f.data || [], suivi: s.data || [], employes: e.data || [] });
  };
  useEffect(() => { if (ok) recharger(); }, [ok]);

  const shell = { minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.ink };
  if (!ok) return (
    <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Card style={{ padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, textAlign: "center" }}>👑 MISS THANI</div>
        <div style={{ fontSize: 10, letterSpacing: "2px", color: C.magenta, fontWeight: 700, textAlign: "center", marginTop: 4, marginBottom: 20 }}>CARRIÈRES & FORMATION</div>
        <input style={input} type="password" placeholder="Mot de passe de l'équipe" value={pwd} onChange={(e) => { setPwd(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") entrer(); }} autoFocus />
        {err && <p style={{ color: C.danger, fontSize: 12.5, margin: "8px 0 0" }}>{err}</p>}
        <button onClick={entrer} style={{ ...btnPrim, width: "100%", marginTop: 12, padding: "12px" }}>Entrer</button>
      </Card>
    </div>
  );
  if (!d) return <div style={{ ...shell, padding: 30, color: C.inkSoft }}>Chargement…</div>;

  const emp = d.employes.find((e) => e.id === moi);
  const posteDe = (e) => d.postes.find((p) => p.id === (e || {}).poste_id);
  const suiviDe = (fid) => d.suivi.find((s) => s.employe_id === moi && s.formation_id === fid);
  const setStatut = async (fid, statut) => {
    if (!moi) return;
    await supabase.from("suivi_formations").upsert({ employe_id: moi, formation_id: fid, statut, termine_le: statut === "termine" ? new Date().toISOString().slice(0, 10) : null }, { onConflict: "employe_id,formation_id" });
    recharger();
  };
  const choisirMoi = (id) => { setMoi(id); try { sessionStorage.setItem("mt_carr_moi", id); } catch (e) {} };

  const TABS = [{ k: "orga", l: "Organigramme" }, { k: "postes", l: "Postes" }, { k: "formations", l: "Formations" }, { k: "parcours", l: "Mon parcours" }];

  return (
    <div style={shell}>
      <style>{`*{box-sizing:border-box}body{margin:0}.mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}`}</style>
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 10 }}>
            <div style={{ lineHeight: 1 }}><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700 }}>👑 MISS THANI</div><div style={{ fontSize: 9, letterSpacing: "2px", color: C.magenta, fontWeight: 700, marginTop: 3 }}>CARRIÈRES & FORMATION</div></div>
            <select value={moi} onChange={(e) => choisirMoi(e.target.value)} style={{ ...input, width: "auto", maxWidth: 170, padding: "7px 10px", fontSize: 12, fontWeight: 700 }}>
              <option value="">Qui êtes-vous ?</option>{d.employes.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
          </div>
          <div className="mt-row" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {TABS.map((t) => { const on = tab === t.k; return <button key={t.k} onClick={() => { setTab(t.k); setSel(null); }} style={{ flexShrink: 0, padding: "7px 13px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{t.l}</button>; })}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "16px 16px 40px" }}>
        {/* ---------- ORGANIGRAMME ---------- */}
        {tab === "orga" && (
          <>
            <p style={{ margin: "0 0 12px", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>Chaque poste rend compte à celui qui est au-dessus. Touchez un poste pour voir ses missions, ses exigences et le chemin pour monter.</p>
            <Card style={{ padding: 14 }}><Organigramme postes={d.postes} employes={d.employes} onPick={setSel} /></Card>
            {sel && <FichePoste p={sel} postes={d.postes} onClose={() => setSel(null)} />}
          </>
        )}

        {/* ---------- POSTES ---------- */}
        {tab === "postes" && (
          <>
            <div className="mt-row" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
              {BRANCHES.map((b) => { const on = branche === b; return <button key={b} onClick={() => { setBranche(b); setSel(null); }} style={{ flexShrink: 0, padding: "8px 15px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{b}</button>; })}
            </div>
            {d.postes.filter((p) => p.branche === branche).sort((a, b) => a.niveau - b.niveau).map((p) => (
              <Card key={p.id} style={{ padding: 13, marginBottom: 8, cursor: "pointer", borderColor: sel && sel.id === p.id ? "rgba(229,36,126,.45)" : C.line }}>
                <div onClick={() => setSel(sel && sel.id === p.id ? null : p)} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ width: 34, height: 34, borderRadius: 11, background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{p.niveau}</span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{p.titre}</div><div style={{ fontSize: 11, color: C.inkSoft }}>{p.salaire || "—"}{p.suivant_titre ? ` · → ${p.suivant_titre}` : ""}</div></div>
                  <span style={{ color: C.inkFaint }}>{sel && sel.id === p.id ? "▾" : "›"}</span>
                </div>
              </Card>
            ))}
            {sel && sel.branche === branche && <FichePoste p={sel} postes={d.postes} onClose={() => setSel(null)} />}
          </>
        )}

        {/* ---------- FORMATIONS ---------- */}
        {tab === "formations" && (
          <>
            {!moi && <Card style={{ padding: 12, marginBottom: 12, background: "rgba(224,165,10,.09)", borderColor: "rgba(224,165,10,.40)" }}><div style={{ fontSize: 12, color: "#9A7000", fontWeight: 700 }}>Choisissez votre nom en haut pour suivre votre progression.</div></Card>}
            <div className="mt-row" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
              {[["tous", "Toutes"], ["obligatoire", "Obligatoires"], ["metier", "Métier"], ["evolution", "Évolution"]].map(([k, l]) => { const on = typeF === k; return <button key={k} onClick={() => setTypeF(k)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{l}</button>; })}
            </div>
            {d.formations.filter((f) => typeF === "tous" || f.type === typeF).map((f) => {
              const s = suiviDe(f.id); const st = s ? s.statut : "a_faire";
              return (
                <Card key={f.id} style={{ padding: 14, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div style={{ minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{f.titre}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>⏱ {f.duree || "—"} · {f.branche}</div></div>
                    <Badge tone={typeTone(f.type)}>{typeLbl(f.type)}</Badge>
                  </div>
                  {f.description && <p style={{ margin: "9px 0 0", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>{f.description}</p>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 12, paddingTop: 11, borderTop: `1px solid ${C.line}` }}>
                    <Badge tone={st === "termine" ? "ok" : st === "en_cours" ? "info" : "neutral"}>{st === "termine" ? `Terminé${s && s.termine_le ? " · " + fmt(s.termine_le) : ""}` : st === "en_cours" ? "En cours" : "À faire"}</Badge>
                    {moi && <div style={{ display: "flex", gap: 6 }}>
                      {f.video_url && <a href={f.video_url} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, padding: "6px 11px", fontSize: 11.5, textDecoration: "none" }}>▶ Vidéo</a>}
                      {st !== "termine" && <button onClick={() => setStatut(f.id, st === "a_faire" ? "en_cours" : "termine")} style={{ ...btnPrim, padding: "6px 12px", fontSize: 11.5 }}>{st === "a_faire" ? "Commencer" : "✓ Terminer"}</button>}
                    </div>}
                  </div>
                </Card>
              );
            })}
          </>
        )}

        {/* ---------- MON PARCOURS ---------- */}
        {tab === "parcours" && (!moi ? (
          <Card style={{ padding: 24, textAlign: "center" }}><div style={{ fontSize: 28 }}>👤</div><p style={{ margin: "10px 0 0", fontSize: 13, color: C.inkSoft }}>Choisissez votre nom en haut de la page.</p></Card>
        ) : (() => {
          const poste = posteDe(emp);
          const suivant = poste ? d.postes.find((p) => p.titre === poste.suivant_titre) : null;
          const oblig = d.formations.filter((f) => f.type === "obligatoire");
          const faites = (l) => l.filter((f) => (suiviDe(f.id) || {}).statut === "termine").length;
          const requises = poste ? d.formations.filter((f) => lignes(poste.formations).some((x) => f.titre.toLowerCase().includes(x.toLowerCase().slice(0, 12)))) : [];
          const critPromo = poste ? lignes(poste.promotion) : [];
          const chemin = []; let cur = poste; const vus = new Set();
          while (cur && !vus.has(cur.id)) { vus.add(cur.id); chemin.push(cur); cur = d.postes.find((p) => p.titre === cur.suivant_titre); }
          return (
            <>
              <div style={{ borderRadius: 18, padding: "16px 18px", background: `linear-gradient(120deg, ${C.blush}, ${C.magenta})`, color: "#fff", marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".5px", opacity: 0.9 }}>{poste ? `${poste.branche.toUpperCase()} · NIVEAU ${poste.niveau}` : "POSTE NON ATTRIBUÉ"}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, marginTop: 3 }}>{emp.nom}</div>
                <div style={{ fontSize: 12, opacity: 0.92, marginTop: 3 }}>{poste ? poste.titre : "Demandez à la direction d'attribuer votre poste"}{emp.depuis ? ` · depuis ${fmt(emp.depuis)}` : ""}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <Card style={{ padding: 13 }}><div style={{ fontSize: 18, fontWeight: 800, color: faites(oblig) === oblig.length ? C.green : C.gold }}>{faites(oblig)}/{oblig.length}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>Formations obligatoires</div></Card>
                <Card style={{ padding: 13 }}><div style={{ fontSize: 18, fontWeight: 800, color: C.magenta }}>{faites(requises)}/{requises.length}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>Formations de mon poste</div></Card>
              </div>
              {suivant && (
                <Card style={{ padding: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>VERS {suivant.titre.toUpperCase()}</div>
                  {critPromo.map((c) => <div key={c} style={{ display: "flex", gap: 9, alignItems: "flex-start", padding: "6px 0", borderTop: `1px solid ${C.line}`, fontSize: 12.5, color: C.ink }}><span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(58,14,51,.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.inkFaint, flexShrink: 0 }}>○</span>{c}</div>)}
                  <button onClick={() => { setSel(suivant); setTab("postes"); setBranche(suivant.branche); }} style={{ ...btnGhost, width: "100%", marginTop: 10 }}>Voir la fiche « {suivant.titre} »</button>
                </Card>
              )}
              {chemin.length > 1 && (
                <Card style={{ padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 10 }}>MON CHEMIN</div>
                  {chemin.map((p, i) => (
                    <div key={p.id} style={{ display: "flex", gap: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <span style={{ width: 26, height: 26, borderRadius: "50%", background: i === 0 ? `linear-gradient(135deg, ${C.blush}, ${C.magenta})` : "rgba(58,14,51,.05)", color: i === 0 ? "#fff" : C.inkFaint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{i === 0 ? "●" : i + 1}</span>
                        {i < chemin.length - 1 && <span style={{ width: 2, flex: 1, minHeight: 22, background: C.line }} />}
                      </div>
                      <div style={{ paddingBottom: 12 }}><div style={{ fontSize: 13, fontWeight: i === 0 ? 800 : 700, color: i === 0 ? C.blush : C.ink }}>{p.titre}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{i === 0 ? "Poste actuel" : `Niveau ${p.niveau}${p.salaire ? " · " + p.salaire : ""}`}</div></div>
                    </div>
                  ))}
                </Card>
              )}
            </>
          );
        })())}
      </main>
    </div>
  );
}
