import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — PARAMÈTRES  (/parametres)
   Modifye tèks, nimewo, koulè, seksyon — san kode.
   ============================================================ */

const MOT_DE_PASSE = "admin2026";

const C = {
  bg: "#F7F2F6", card: "#FFFFFF", ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.58)", inkFaint: "rgba(58,14,51,.38)",
  blush: "#E5247E", magenta: "#C2238E", gold: "#E0A50A",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};
const GROUPES = [
  { k: "identite", l: "Identité", e: "👑" },
  { k: "public", l: "Page publique", e: "🏠" },
  { k: "inscription", l: "Inscription", e: "📝" },
  { k: "paiement", l: "Paiement", e: "💳" },
  { k: "reglement", l: "Règlement", e: "📜" },
  { k: "partenaires", l: "Partenaires", e: "🤝" },
  { k: "messages", l: "Messages", e: "💬" },
];

function Card({ children, style }) { return <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: "0 6px 20px rgba(142,44,154,.06)", ...style }}>{children}</div>; }
const btnPrim = { border: "none", borderRadius: 999, padding: "11px 16px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif" };
const btnGhost = { border: `1.3px solid ${C.line}`, borderRadius: 999, padding: "9px 14px", background: "#fff", color: C.ink, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 11, border: `1.3px solid ${C.line}`, background: "#fff", color: C.ink, fontSize: 13.5, fontFamily: "'Inter',sans-serif", outline: "none" };

function Switch({ on, onChange }) {
  return <button onClick={() => onChange(!on)} style={{ width: 42, height: 24, borderRadius: 999, border: "none", cursor: "pointer", padding: 3, background: on ? `linear-gradient(135deg, ${C.blush}, ${C.magenta})` : "rgba(58,14,51,.16)", display: "flex", justifyContent: on ? "flex-end" : "flex-start", flexShrink: 0 }}><span style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", display: "block" }} /></button>;
}

function Champ({ p, val, set }) {
  if (p.type === "switch") return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: `1px solid ${C.line}` }}>
      <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.ink }}>{p.libelle}</div>
      <Switch on={val === "oui"} onChange={(v) => set(v ? "oui" : "non")} />
    </div>
  );
  if (p.type === "liste") {
    const items = String(val || "").split("\n").filter(Boolean);
    return (
      <div style={{ padding: "12px 0", borderTop: `1px solid ${C.line}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 8 }}>{p.libelle}</div>
        {items.map((it, i) => {
          const [t, x] = it.split("|");
          return (
            <div key={i} style={{ marginBottom: 8, padding: "9px 11px", borderRadius: 11, background: "rgba(194,35,142,.04)", border: `1px solid ${C.line}` }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                <input style={{ ...input, padding: "7px 10px", fontWeight: 700 }} value={t || ""} onChange={(e) => set(items.map((z, j) => (j === i ? e.target.value + "|" + (x || "") : z)).join("\n"))} placeholder="Titre" />
                <button onClick={() => set(items.filter((_, j) => j !== i).join("\n"))} style={{ ...btnGhost, padding: "6px 10px", color: C.danger }}>✕</button>
              </div>
              <textarea style={{ ...input, minHeight: 60, fontSize: 12.5 }} value={x || ""} onChange={(e) => set(items.map((z, j) => (j === i ? (t || "") + "|" + e.target.value : z)).join("\n"))} placeholder="Texte" />
            </div>
          );
        })}
        <button onClick={() => set([...items, "Nouvelle règle|"].join("\n"))} style={{ ...btnGhost, padding: "7px 13px", fontSize: 11.5 }}>+ Ajouter</button>
      </div>
    );
  }
  return (
    <div style={{ padding: "12px 0", borderTop: `1px solid ${C.line}` }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{p.libelle}</label>
      {p.type === "textarea" ? <textarea style={{ ...input, minHeight: 78, lineHeight: 1.6 }} value={val || ""} onChange={(e) => set(e.target.value)} />
        : p.type === "color" ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="color" value={val || "#E5247E"} onChange={(e) => set(e.target.value)} style={{ width: 44, height: 36, border: "none", background: "none", cursor: "pointer" }} /><input style={{ ...input, width: 120, fontFamily: "monospace" }} value={val || ""} onChange={(e) => set(e.target.value)} /></div>
        : <input style={input} inputMode={p.type === "number" ? "numeric" : "text"} value={val || ""} onChange={(e) => set(e.target.value)} />}
      {p.groupe === "messages" && <div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 5 }}>Variables : {"{prenom} {programme} {montant} {date_session}"}</div>}
    </div>
  );
}

export default function Parametres() {
  const [ok, setOk] = useState(() => { try { return sessionStorage.getItem("mt_admin") === "1" || sessionStorage.getItem("mt_params") === "1"; } catch (e) { return false; } });
  const [pwd, setPwd] = useState(""); const [err, setErr] = useState("");
  const [groupe, setGroupe] = useState("identite");
  const [rows, setRows] = useState(null);
  const [vals, setVals] = useState({});
  const [base, setBase] = useState({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const entrer = () => { if (pwd === MOT_DE_PASSE) { setOk(true); try { sessionStorage.setItem("mt_params", "1"); } catch (e) {} } else setErr("Mot de passe incorrect."); };
  const recharger = async () => {
    const { data } = await supabase.from("parametres").select("*").order("ordre");
    const v = {}; (data || []).forEach((x) => { v[x.cle] = x.valeur || ""; });
    setRows(data || []); setVals(v); setBase(v);
  };
  useEffect(() => { if (ok) recharger(); }, [ok]);

  const shell = { minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.ink };
  if (!ok) return (
    <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Card style={{ padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, textAlign: "center" }}>👑 MISS THANI</div>
        <div style={{ fontSize: 10, letterSpacing: "2px", color: C.magenta, fontWeight: 700, textAlign: "center", marginTop: 4, marginBottom: 20 }}>PARAMÈTRES</div>
        <input style={input} type="password" placeholder="Mot de passe admin" value={pwd} onChange={(e) => { setPwd(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") entrer(); }} autoFocus />
        {err && <p style={{ color: C.danger, fontSize: 12.5, margin: "8px 0 0" }}>{err}</p>}
        <button onClick={entrer} style={{ ...btnPrim, width: "100%", marginTop: 12, padding: "12px" }}>Entrer</button>
      </Card>
    </div>
  );
  if (!rows) return <div style={{ ...shell, padding: 30, color: C.inkSoft }}>Chargement…</div>;

  const modifs = Object.keys(vals).filter((k) => vals[k] !== base[k]);
  const sauver = async () => {
    setBusy(true);
    for (const k of modifs) await supabase.from("parametres").update({ valeur: vals[k] }).eq("cle", k);
    setBase({ ...vals }); setBusy(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  };
  const liste = rows.filter((r) => r.groupe === groupe);
  const g = GROUPES.find((x) => x.k === groupe) || GROUPES[0];

  return (
    <div style={shell}>
      <style>{`*{box-sizing:border-box}body{margin:0}.mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}`}</style>
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ lineHeight: 1, marginBottom: 10 }}><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700 }}>👑 MISS THANI</div><div style={{ fontSize: 9, letterSpacing: "2px", color: C.magenta, fontWeight: 700, marginTop: 3 }}>PARAMÈTRES · MODIFIER SANS CODER</div></div>
          <div className="mt-row" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {GROUPES.map((x) => { const on = groupe === x.k; return <button key={x.k} onClick={() => setGroupe(x.k)} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 5, padding: "7px 13px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{x.e} {x.l}</button>; })}
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "16px 16px 110px" }}>
        <Card style={{ padding: "6px 16px 14px" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", padding: "10px 0 4px" }}>{g.e} {g.l.toUpperCase()}</div>
          {liste.map((p) => <Champ key={p.cle} p={p} val={vals[p.cle]} set={(v) => { setVals({ ...vals, [p.cle]: v }); setSaved(false); }} />)}
        </Card>
        <p style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 12, lineHeight: 1.5 }}>Ce que vous enregistrez ici s'affiche sur le site public et dans l'inscription dès le prochain chargement de la page.</p>
      </main>
      {(modifs.length > 0 || saved) && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: "#fff", borderTop: `1px solid ${C.line}`, padding: "12px 16px 18px", boxShadow: "0 -6px 18px rgba(142,44,154,.08)", zIndex: 30 }}>
          <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: saved ? C.green : C.ink }}>{saved ? "✓ Enregistré — visible immédiatement." : `${modifs.length} modification${modifs.length > 1 ? "s" : ""} non enregistrée${modifs.length > 1 ? "s" : ""}`}</span>
            {!saved && <><button onClick={() => setVals({ ...base })} style={btnGhost}>Annuler</button><button onClick={sauver} disabled={busy} style={btnPrim}>{busy ? "…" : "✓ Enregistrer"}</button></>}
          </div>
        </div>
      )}
    </div>
  );
}
