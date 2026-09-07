import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — SECRÉTARIAT  (/secretariat)
   Jour · Inscrire · Paiements · Dossiers · Sessions
   ============================================================ */

const MOT_DE_PASSE = "secretariat2026";

const C = {
  bg: "#F7F2F6", card: "#FFFFFF", ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.58)", inkFaint: "rgba(58,14,51,.38)",
  blush: "#E5247E", magenta: "#C2238E", gold: "#E0A50A",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};

const gdes = (n) => Number(n || 0).toLocaleString("fr-FR") + " gdes";
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (s) => {
  if (!s) return "";
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  const mois = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return `${d} ${mois[m - 1]} ${y}`;
};
const quand = (iso) => iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "";
function telOk(v) {
  let d = String(v || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("509")) d = d.slice(3);
  return /^[234]\d{7}$/.test(d) ? d : "";
}
const genCode = () => "MT" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 5)).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-7);
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
const label = { display: "block", fontSize: 11, fontWeight: 700, color: C.inkSoft, marginBottom: 5 };

/* Chaje tout done sekretarya a bezwen */
async function chargerTout() {
  const [pf, pr, pg, se, pa] = await Promise.all([
    supabase.from("profils").select("*").order("cree_le", { ascending: false }),
    supabase.from("prospects").select("*"),
    supabase.from("programmes").select("*").order("ordre"),
    supabase.from("sessions").select("*").order("date_debut"),
    supabase.from("paiements").select("*").order("recu_le", { ascending: false }),
  ]);
  return { profils: pf.data || [], prospects: pr.data || [], programmes: pg.data || [], sessions: se.data || [], paiements: pa.data || [] };
}

/* Yon dosye elèv = profil + pwospè li yo + peman li yo */
function dossiers(d) {
  return d.profils.map((p) => {
    const pros = d.prospects.filter((x) => x.profil_id === p.id);
    const pays = d.paiements.filter((x) => x.profil_id === p.id && x.objet === "inscription");
    const du = pros.reduce((s, x) => s + Number((d.programmes.find((g) => g.id === x.programme_id) || {}).prix_inscription || 0), 0);
    const paye = pays.filter((x) => x.statut === "valide").reduce((s, x) => s + Number(x.montant || 0), 0);
    const attente = pays.filter((x) => x.statut === "en_attente").reduce((s, x) => s + Number(x.montant || 0), 0);
    return { p, pros, pays, du, paye, attente, reste: Math.max(0, du - paye), valide: pros.some((x) => x.reglement_accepte_le), progs: pros.map((x) => (d.programmes.find((g) => g.id === x.programme_id) || {}).nom).filter(Boolean) };
  }).filter((x) => x.pros.length > 0);
}

/* ============================ JOU ============================ */
function Jour({ d, go }) {
  const t = today();
  const dos = dossiers(d);
  const inscritsJour = d.prospects.filter((x) => (x.cree_le || "").slice(0, 10) === t).length;
  const caisse = d.paiements.filter((x) => x.statut === "valide" && (x.recu_le || "").slice(0, 10) === t).reduce((s, x) => s + Number(x.montant || 0), 0);
  const aVerifier = d.paiements.filter((x) => x.statut === "en_attente").length;
  const aRappeler = dos.filter((x) => !x.valide && x.pays.length === 0);
  const impayes = dos.filter((x) => x.valide && x.reste > 0);

  const Kpi = ({ l, v, c, onClick }) => (
    <Card style={{ padding: 13 }}><div onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}><div style={{ fontSize: 20, fontWeight: 800, color: c, lineHeight: 1.1 }}>{v}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>{l}</div></div></Card>
  );

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        <Kpi l="Inscriptions du jour" v={String(inscritsJour)} c={C.blush} />
        <Kpi l="Caisse du jour" v={gdes(caisse)} c={C.ink} onClick={() => go("paiements")} />
        <Kpi l="À rappeler" v={String(aRappeler.length)} c={C.gold} />
        <Kpi l="Preuves à vérifier" v={String(aVerifier)} c={aVerifier ? C.danger : C.green} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => go("inscrire")} style={{ ...btnPrim, flex: 1 }}>+ Inscrire une élève</button>
        <button onClick={() => go("paiements")} style={{ ...btnGhost, flex: 1 }}>Encaisser</button>
      </div>

      <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>À RAPPELER — pré-inscrites sans paiement ({aRappeler.length})</div>
      <Card style={{ padding: "4px 14px", marginBottom: 16 }}>
        {aRappeler.length === 0 && <p style={{ margin: "10px 0", fontSize: 12.5, color: C.inkSoft }}>Personne à rappeler.</p>}
        {aRappeler.slice(0, 15).map((x, i) => (
          <div key={x.p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(229,36,126,.10)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 800, flexShrink: 0 }}>{initiales(x.p)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{x.p.prenom} {x.p.nom}</div>
              <div style={{ fontSize: 10.5, color: C.inkFaint }}>{x.progs.join(", ")} · {quand(x.p.cree_le)}</div>
            </div>
            <a href={`https://wa.me/509${x.p.whatsapp}?text=${encodeURIComponent(`Bonjou ${x.p.prenom}, se sekretarya Miss Thani. Nou resevwa pre-enskripsyon w pou ${x.progs.join(", ")}. Èske w vle nou rezève plas ou?`)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, padding: "6px 11px", fontSize: 11, color: C.green, borderColor: "rgba(30,132,73,.35)" }}>WhatsApp</a>
          </div>
        ))}
      </Card>

      <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>SOLDES IMPAYÉS ({impayes.length})</div>
      <Card style={{ padding: "4px 14px" }}>
        {impayes.length === 0 && <p style={{ margin: "10px 0", fontSize: 12.5, color: C.inkSoft }}>Tous les soldes sont réglés.</p>}
        {impayes.slice(0, 15).map((x, i) => (
          <div key={x.p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{x.p.prenom} {x.p.nom}</div>
              <div style={{ fontSize: 10.5, color: C.inkFaint }}>{x.progs.join(", ")}</div>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: C.danger }}>{gdes(x.reste)}</span>
          </div>
        ))}
      </Card>
    </>
  );
}

/* ============================ INSCRIRE ============================ */
function Inscrire({ d, recharger }) {
  const [f, setF] = useState({ nom: "", prenom: "", whatsapp: "", appel: "", adresse: "", programmes: [], montant: "", mode: "especes" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k, v) => { setF({ ...f, [k]: v }); setMsg(""); };
  const toggle = (id) => set("programmes", f.programmes.includes(id) ? f.programmes.filter((x) => x !== id) : [...f.programmes, id]);
  const du = f.programmes.reduce((s, id) => s + Number((d.programmes.find((p) => p.id === id) || {}).prix_inscription || 0), 0);
  const montant = Number(f.montant) || 0;

  const enregistrer = async () => {
    if (!f.nom.trim() || !f.prenom.trim()) { setMsg("Erreur — nom et prénom obligatoires."); return; }
    if (!telOk(f.whatsapp)) { setMsg("Erreur — numéro WhatsApp invalide."); return; }
    if (f.programmes.length === 0) { setMsg("Erreur — choisissez au moins un programme."); return; }
    setBusy(true);
    try {
      /* Moun nan deja egziste? (menm WhatsApp) */
      let profil = d.profils.find((p) => p.whatsapp === telOk(f.whatsapp));
      if (!profil) {
        const { data, error } = await supabase.from("profils").insert({ nom: f.nom.trim(), prenom: f.prenom.trim(), whatsapp: telOk(f.whatsapp), appel: telOk(f.appel) || null, adresse: f.adresse.trim() || null, type: "eleve" }).select().single();
        if (error) throw error; profil = data;
      } else {
        await supabase.from("profils").update({ type: "eleve" }).eq("id", profil.id);
      }
      const code = genCode();
      const rows = f.programmes.map((pid) => {
        const s = d.sessions.find((x) => x.programme_id === pid && x.statut === "ouverte");
        return { profil_id: profil.id, programme_id: pid, session_id: s ? s.id : null, etape: "reserve", source: "secretariat", code_eleve: code, reglement_accepte_le: new Date().toISOString() };
      });
      const { data: pros, error: e2 } = await supabase.from("prospects").insert(rows).select();
      if (e2) throw e2;
      if (montant > 0) {
        const { error: e3 } = await supabase.from("paiements").insert({ profil_id: profil.id, prospect_id: pros[0].id, objet: "inscription", montant, mode: f.mode, statut: "valide", saisi_par: "secretariat", note: "Encaissé à la réception" });
        if (e3) throw e3;
      }
      setMsg(`✓ ${f.prenom} ${f.nom} inscrite — code élève ${code}${montant > 0 ? ` · ${gdes(montant)} encaissés` : ""}${du - montant > 0 ? ` · reste ${gdes(du - montant)}` : ""}.`);
      setF({ nom: "", prenom: "", whatsapp: "", appel: "", adresse: "", programmes: [], montant: "", mode: "especes" });
      recharger();
    } catch (e) { setMsg("Erreur — l'enregistrement a échoué."); }
    setBusy(false);
  };

  return (
    <>
      <Card style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 10 }}>IDENTITÉ</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={label}>Nom</label><input style={input} value={f.nom} onChange={(e) => set("nom", e.target.value)} /></div>
          <div><label style={label}>Prénom</label><input style={input} value={f.prenom} onChange={(e) => set("prenom", e.target.value)} /></div>
          <div><label style={label}>WhatsApp</label><input style={input} inputMode="tel" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="3712 3456" /></div>
          <div><label style={label}>Appel direct</label><input style={input} inputMode="tel" value={f.appel} onChange={(e) => set("appel", e.target.value)} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={label}>Adresse</label><input style={input} value={f.adresse} onChange={(e) => set("adresse", e.target.value)} /></div>
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 10 }}>PROGRAMME(S)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
          {d.programmes.filter((p) => p.actif).map((p) => {
            const on = f.programmes.includes(p.id);
            return <button key={p.id} onClick={() => toggle(p.id)} style={{ padding: "8px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink }}>{on ? "✓ " : ""}{p.nom} · {gdes(p.prix_inscription)}</button>;
          })}
        </div>
      </Card>

      <Card style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: C.magenta, letterSpacing: ".3px" }}>PAIEMENT À LA RÉCEPTION</span>
          <Badge tone="info">Dû : {gdes(du)}</Badge>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={label}>Montant reçu (gdes)</label><input style={input} inputMode="numeric" value={f.montant} onChange={(e) => set("montant", e.target.value.replace(/\D/g, ""))} placeholder="0" /></div>
          <div><label style={label}>Mode</label>
            <select style={input} value={f.mode} onChange={(e) => set("mode", e.target.value)}>
              <option value="especes">Espèces</option><option value="moncash">MonCash</option><option value="natcash">NatCash</option>
            </select>
          </div>
        </div>
        {du > 0 && <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 10, background: du - montant > 0 ? "rgba(192,57,43,.07)" : "rgba(30,132,73,.08)", fontSize: 12.5, fontWeight: 800, color: du - montant > 0 ? C.danger : C.green }}>Reste : {gdes(Math.max(0, du - montant))}</div>}
      </Card>

      {msg && <div style={{ marginBottom: 10, padding: "10px 13px", borderRadius: 12, background: msg.startsWith("Erreur") ? "rgba(192,57,43,.10)" : "rgba(30,132,73,.10)", fontSize: 12.5, fontWeight: 700, color: msg.startsWith("Erreur") ? C.danger : C.green, lineHeight: 1.5 }}>{msg}</div>}
      <button onClick={enregistrer} disabled={busy} style={{ ...btnPrim, width: "100%", padding: "13px", opacity: busy ? 0.6 : 1 }}>{busy ? "…" : "✓ Enregistrer l'inscription"}</button>
      <p style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 8, lineHeight: 1.5 }}>L'élève est marquée comme ayant accepté le règlement (signature papier à la réception). Un code élève est généré automatiquement.</p>
    </>
  );
}

/* ============================ PAIEMENTS ============================ */
function Paiements({ d, recharger }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [montant, setMontant] = useState("");
  const [mode, setMode] = useState("especes");
  const [busy, setBusy] = useState(false);
  const dos = dossiers(d).filter((x) => x.valide);
  const list = dos.filter((x) => (x.p.nom + " " + x.p.prenom + x.p.whatsapp).toLowerCase().includes(q.toLowerCase()));
  const totalDu = dos.reduce((s, x) => s + x.reste, 0);

  const encaisser = async () => {
    const m = Number(montant) || 0;
    if (m <= 0) return;
    setBusy(true);
    await supabase.from("paiements").insert({ profil_id: open.p.id, prospect_id: open.pros[0].id, objet: "inscription", montant: m, mode, statut: "valide", saisi_par: "secretariat", note: "Encaissé à la réception" });
    setBusy(false); setOpen(null); setMontant(""); recharger();
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <input style={{ ...input, borderRadius: 999 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Nom ou numéro…" />
        <Badge tone={totalDu ? "bad" : "ok"}>{gdes(totalDu)} dus</Badge>
      </div>
      {list.length === 0 && <Card style={{ padding: 24, textAlign: "center" }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune élève.</p></Card>}
      {list.map((x) => (
        <Card key={x.p.id} style={{ padding: 13, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{x.p.prenom} {x.p.nom}</div>
              <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 2 }}>{x.progs.join(", ")} · payé {gdes(x.paye)} / {gdes(x.du)}{x.attente ? ` · ${gdes(x.attente)} en vérif.` : ""}</div>
            </div>
            <Badge tone={x.reste === 0 ? "ok" : "bad"}>{x.reste === 0 ? "Soldé" : gdes(x.reste) + " dû"}</Badge>
          </div>
          <div style={{ height: 6, borderRadius: 999, background: "rgba(142,44,154,.12)", overflow: "hidden", margin: "10px 0" }}>
            <div style={{ width: `${x.du ? Math.min(100, (x.paye / x.du) * 100) : 0}%`, height: "100%", background: `linear-gradient(90deg, ${C.blush}, ${C.magenta})` }} />
          </div>
          {x.reste > 0 && <button onClick={() => { setOpen(x); setMontant(String(x.reste)); }} style={{ ...btnPrim, width: "100%", padding: "10px" }}>Encaisser</button>}
        </Card>
      ))}

      {open && (
        <div onClick={() => setOpen(null)} style={{ position: "fixed", inset: 0, background: "rgba(30,10,28,.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 90 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 360, overflow: "hidden" }}>
            <div style={{ padding: "13px 16px", background: `linear-gradient(120deg, ${C.blush}, ${C.magenta})`, color: "#fff" }}>
              <div style={{ fontSize: 13.5, fontWeight: 800 }}>{open.p.prenom} {open.p.nom}</div>
              <div style={{ fontSize: 10.5, opacity: 0.85 }}>Reste : {gdes(open.reste)}</div>
            </div>
            <div style={{ padding: 16 }}>
              <label style={label}>Montant reçu (gdes)</label>
              <input autoFocus style={input} inputMode="numeric" value={montant} onChange={(e) => setMontant(e.target.value.replace(/\D/g, ""))} />
              <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
                {[["especes", "Espèces"], ["moncash", "MonCash"], ["natcash", "NatCash"]].map(([k, l]) => <button key={k} onClick={() => setMode(k)} style={{ flex: 1, padding: "8px 6px", borderRadius: 999, fontSize: 11.5, fontWeight: 800, cursor: "pointer", border: `1.3px solid ${mode === k ? C.magenta : C.line}`, background: mode === k ? C.magenta : "#fff", color: mode === k ? "#fff" : C.ink }}>{l}</button>)}
              </div>
              <button onClick={encaisser} disabled={busy} style={{ ...btnPrim, width: "100%", marginTop: 14, padding: "12px" }}>{busy ? "…" : "✓ Valider le versement"}</button>
              <button onClick={() => setOpen(null)} style={{ ...btnGhost, width: "100%", marginTop: 8 }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================ DOSSIERS ============================ */
function Dossiers({ d, recharger }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);
  const dos = dossiers(d);
  const list = dos.filter((x) => (x.p.nom + " " + x.p.prenom + (x.p.whatsapp || "") + x.pros.map((p) => p.code_eleve || "").join("")).toLowerCase().includes(q.toLowerCase()));
  const x = sel ? dos.find((y) => y.p.id === sel) : null;

  const valider = async () => {
    setBusy(true);
    const code = x.pros[0].code_eleve || genCode();
    await supabase.from("prospects").update({ reglement_accepte_le: new Date().toISOString(), code_eleve: code, etape: "reserve" }).eq("profil_id", x.p.id);
    await supabase.from("profils").update({ type: "eleve" }).eq("id", x.p.id);
    setBusy(false); recharger();
  };
  const setSession = async (prosId, sessionId) => {
    await supabase.from("prospects").update({ session_id: sessionId || null }).eq("id", prosId);
    recharger();
  };

  if (x) {
    return (
      <>
        <button onClick={() => setSel(null)} style={{ ...btnGhost, marginBottom: 12 }}>‹ Retour</button>
        <Card style={{ padding: 0, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ padding: "14px 16px", background: `linear-gradient(120deg, ${C.blush}, ${C.magenta})`, color: "#fff" }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{x.p.prenom} {x.p.nom}</div>
            <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 3 }}>{x.p.whatsapp}{x.p.appel ? ` · ${x.p.appel}` : ""}{x.p.adresse ? ` · ${x.p.adresse}` : ""}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span style={{ background: "rgba(255,255,255,.22)", padding: "3px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 800 }}>{x.valide ? "✓ Validée" : "En attente"}</span>
              {x.pros[0].code_eleve && <span style={{ background: "rgba(255,255,255,.95)", color: C.magenta, padding: "3px 9px", borderRadius: 999, fontSize: 10.5, fontWeight: 800, fontFamily: "monospace" }}>{x.pros[0].code_eleve}</span>}
            </div>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: C.magenta, marginBottom: 8 }}>PROGRAMMES ET SESSIONS</div>
            {x.pros.map((pr) => {
              const g = d.programmes.find((p) => p.id === pr.programme_id) || {};
              const ses = d.sessions.filter((s) => s.programme_id === pr.programme_id);
              return (
                <div key={pr.id} style={{ padding: "9px 0", borderTop: `1px solid ${C.line}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{g.nom} <span style={{ fontSize: 10.5, color: C.inkFaint, fontWeight: 600 }}>· {pr.source}{pr.etiquette ? ` · ${pr.etiquette}` : ""}</span></div>
                  <select style={input} value={pr.session_id || ""} onChange={(e) => setSession(pr.id, e.target.value)}>
                    <option value="">— Aucune session —</option>
                    {ses.map((s) => <option key={s.id} value={s.id}>Session du {fmt(s.date_debut)} ({s.statut})</option>)}
                  </select>
                </div>
              );
            })}
            <div style={{ fontSize: 11.5, fontWeight: 800, color: C.magenta, margin: "14px 0 8px" }}>PAIEMENTS</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}><span style={{ color: C.inkSoft }}>Dû</span><strong>{gdes(x.du)}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}><span style={{ color: C.inkSoft }}>Payé</span><strong style={{ color: C.green }}>{gdes(x.paye)}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}><span style={{ color: C.inkSoft }}>Reste</span><strong style={{ color: x.reste ? C.danger : C.green }}>{gdes(x.reste)}</strong></div>
            {x.pays.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, padding: "6px 0", borderTop: `1px solid ${C.line}`, marginTop: 6 }}>
                <span style={{ color: C.inkSoft }}>{quand(p.recu_le)} · {p.mode || "—"}</span>
                <span style={{ fontWeight: 700, color: p.statut === "valide" ? C.green : p.statut === "rejete" ? C.danger : "#9A7000" }}>{gdes(p.montant)} · {p.statut === "valide" ? "validé" : p.statut === "rejete" ? "rejeté" : "en vérif."}</span>
              </div>
            ))}
            {!x.valide && <button onClick={valider} disabled={busy} style={{ ...btnPrim, width: "100%", marginTop: 14, padding: "12px" }}>{busy ? "…" : "✓ Valider l'inscription (règlement signé)"}</button>}
            <a href={`https://wa.me/509${x.p.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, width: "100%", marginTop: 8, color: C.green, borderColor: "rgba(30,132,73,.35)" }}>WhatsApp</a>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <input style={{ ...input, borderRadius: 999, marginBottom: 12 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Nom, numéro ou code élève…" />
      <div style={{ marginBottom: 10 }}><Badge tone="info">{list.length} dossier{list.length > 1 ? "s" : ""}</Badge></div>
      {list.map((x) => (
        <Card key={x.p.id} style={{ padding: 12, marginBottom: 8 }}>
          <button onClick={() => setSel(x.p.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(229,36,126,.10)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{initiales(x.p)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{x.p.prenom} {x.p.nom}</div>
              <div style={{ fontSize: 10.5, color: C.inkFaint }}>{x.progs.join(", ")} · {x.p.whatsapp}</div>
            </div>
            <Badge tone={x.valide ? (x.reste ? "warn" : "ok") : "neutral"}>{x.valide ? (x.reste ? gdes(x.reste) + " dû" : "Complet") : "Pré-inscrite"}</Badge>
          </button>
        </Card>
      ))}
    </>
  );
}

/* ============================ SESSIONS ============================ */
function Sessions({ d, recharger }) {
  const [nv, setNv] = useState({ programme_id: "", date_debut: "", places: "20" });
  const [busy, setBusy] = useState(false);

  const ajouter = async () => {
    if (!nv.programme_id || !nv.date_debut) return;
    setBusy(true);
    const dl = new Date(nv.date_debut); dl.setDate(dl.getDate() - 10);
    await supabase.from("sessions").insert({ programme_id: nv.programme_id, date_debut: nv.date_debut, date_limite_resa: dl.toISOString().slice(0, 10), places: Number(nv.places) || 20, statut: "ouverte" });
    setNv({ programme_id: "", date_debut: "", places: "20" }); setBusy(false); recharger();
  };
  const statut = async (s, st) => { await supabase.from("sessions").update({ statut: st }).eq("id", s.id); recharger(); };

  return (
    <>
      <Card style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 10 }}>OUVRIR UNE SESSION</div>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr .7fr", gap: 8 }}>
          <select style={input} value={nv.programme_id} onChange={(e) => setNv({ ...nv, programme_id: e.target.value })}><option value="">Programme…</option>{d.programmes.map((p) => <option key={p.id} value={p.id}>{p.nom}</option>)}</select>
          <input style={input} type="date" value={nv.date_debut} onChange={(e) => setNv({ ...nv, date_debut: e.target.value })} />
          <input style={input} inputMode="numeric" value={nv.places} onChange={(e) => setNv({ ...nv, places: e.target.value.replace(/\D/g, "") })} placeholder="Places" />
        </div>
        <button onClick={ajouter} disabled={busy} style={{ ...btnPrim, width: "100%", marginTop: 10, padding: "11px" }}>+ Créer la session</button>
      </Card>

      {d.sessions.length === 0 && <Card style={{ padding: 22, textAlign: "center" }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune session.</p></Card>}
      {d.sessions.map((s) => {
        const g = d.programmes.find((p) => p.id === s.programme_id) || {};
        const n = d.prospects.filter((x) => x.session_id === s.id).length;
        const pct = s.places ? Math.round((n / s.places) * 100) : 0;
        return (
          <Card key={s.id} style={{ padding: 13, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{g.nom}</div>
                <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>Début {fmt(s.date_debut)} · limite {fmt(s.date_limite_resa)}</div>
              </div>
              <Badge tone={s.statut === "ouverte" ? "ok" : "neutral"}>{s.statut}</Badge>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 10 }}>
              <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(142,44,154,.12)", overflow: "hidden" }}><div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: `linear-gradient(90deg, ${C.blush}, ${C.magenta})` }} /></div>
              <span style={{ fontSize: 11, fontWeight: 800, color: C.inkSoft }}>{n}/{s.places}</span>
            </div>
            <div style={{ display: "flex", gap: 7, marginTop: 10 }}>
              {s.statut === "ouverte" ? <button onClick={() => statut(s, "complete")} style={{ ...btnGhost, padding: "6px 12px", fontSize: 11.5 }}>Marquer complète</button> : <button onClick={() => statut(s, "ouverte")} style={{ ...btnGhost, padding: "6px 12px", fontSize: 11.5 }}>Rouvrir</button>}
              {s.statut !== "terminee" && <button onClick={() => statut(s, "terminee")} style={{ ...btnGhost, padding: "6px 12px", fontSize: 11.5, color: C.inkFaint }}>Terminer</button>}
            </div>
          </Card>
        );
      })}
    </>
  );
}

/* ============================ APP ============================ */
export default function Secretariat() {
  const [ok, setOk] = useState(() => { try { return sessionStorage.getItem("mt_sec") === "1"; } catch (e) { return false; } });
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("jour");
  const [d, setD] = useState(null);

  const entrer = () => { if (pwd === MOT_DE_PASSE) { setOk(true); try { sessionStorage.setItem("mt_sec", "1"); } catch (e) {} } else setErr("Mot de passe incorrect."); };
  const recharger = async () => setD(await chargerTout());
  useEffect(() => { if (ok) recharger(); }, [ok]);

  const shell = { minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.ink };
  if (!ok) {
    return (
      <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Card style={{ padding: 24, width: "100%", maxWidth: 360 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, textAlign: "center" }}>👑 MISS THANI</div>
          <div style={{ fontSize: 10, letterSpacing: "2px", color: C.magenta, fontWeight: 700, textAlign: "center", marginTop: 4, marginBottom: 20 }}>SECRÉTARIAT</div>
          <input style={input} type="password" placeholder="Mot de passe" value={pwd} onChange={(e) => { setPwd(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") entrer(); }} autoFocus />
          {err && <p style={{ color: C.danger, fontSize: 12.5, margin: "8px 0 0" }}>{err}</p>}
          <button onClick={entrer} style={{ ...btnPrim, width: "100%", marginTop: 12, padding: "12px" }}>Entrer</button>
        </Card>
      </div>
    );
  }

  const TABS = [{ k: "jour", l: "Jour" }, { k: "inscrire", l: "Inscrire" }, { k: "paiements", l: "Paiements" }, { k: "dossiers", l: "Dossiers" }, { k: "sessions", l: "Sessions" }];

  return (
    <div style={shell}>
      <style>{`*{box-sizing:border-box}body{margin:0}.mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}input::placeholder{color:rgba(58,14,51,.32)}`}</style>
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700 }}>👑 MISS THANI</div>
              <div style={{ fontSize: 9, letterSpacing: "2px", color: C.magenta, fontWeight: 700, marginTop: 3 }}>SECRÉTARIAT</div>
            </div>
            <button onClick={recharger} style={{ ...btnGhost, padding: "6px 12px", fontSize: 11.5 }}>↻</button>
          </div>
          <div className="mt-row" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {TABS.map((t) => { const on = tab === t.k; return <button key={t.k} onClick={() => setTab(t.k)} style={{ flexShrink: 0, padding: "7px 13px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{t.l}</button>; })}
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 40px" }}>
        {!d ? <p style={{ color: C.inkSoft, fontSize: 13 }}>Chargement…</p> : (
          <>
            {tab === "jour" && <Jour d={d} go={setTab} />}
            {tab === "inscrire" && <Inscrire d={d} recharger={recharger} />}
            {tab === "paiements" && <Paiements d={d} recharger={recharger} />}
            {tab === "dossiers" && <Dossiers d={d} recharger={recharger} />}
            {tab === "sessions" && <Sessions d={d} recharger={recharger} />}
          </>
        )}
      </main>
    </div>
  );
}
