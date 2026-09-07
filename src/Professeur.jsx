import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — ESPACE PROFESSEUR  (/professeur)
   Appel · Notes · Historique — ekri dirèk nan dosye elèv yo
   ============================================================ */

const MOT_DE_PASSE = "prof2026";

const C = {
  bg: "#F7F2F6", card: "#FFFFFF", ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.58)", inkFaint: "rgba(58,14,51,.38)",
  blush: "#E5247E", magenta: "#C2238E", gold: "#E0A50A",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};

const today = () => new Date().toISOString().slice(0, 10);
const fmt = (s) => {
  if (!s) return "";
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  const mois = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return `${d} ${mois[m - 1]} ${y}`;
};
const initiales = (p) => ((p.prenom || "?")[0] + (p.nom || "")[0]).toUpperCase();

function Card({ children, style }) {
  return <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: "0 6px 20px rgba(142,44,154,.06)", ...style }}>{children}</div>;
}
function Badge({ tone = "neutral", children }) {
  const map = { ok: ["rgba(30,132,73,.10)", C.green], warn: ["rgba(224,165,10,.16)", "#9A7000"], info: ["rgba(194,35,142,.10)", C.magenta], bad: ["rgba(192,57,43,.10)", C.danger], neutral: ["rgba(58,14,51,.06)", C.inkSoft] };
  const [bg, fg] = map[tone] || map.neutral;
  return <span style={{ background: bg, color: fg, fontSize: 10.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
}
const btnPrim = { border: "none", borderRadius: 999, padding: "11px 16px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif" };
const btnGhost = { border: `1.3px solid ${C.line}`, borderRadius: 999, padding: "9px 14px", background: "#fff", color: C.ink, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 11, border: `1.3px solid ${C.line}`, background: "#fff", color: C.ink, fontSize: 13.5, fontFamily: "'Inter',sans-serif", outline: "none" };
const label = { display: "block", fontSize: 11, fontWeight: 700, color: C.inkSoft, marginBottom: 5 };

/* ---------------- Chwazi klas la ---------------- */
function Selecteur({ programmes, prog, setProg }) {
  return (
    <div className="mt-row" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
      {programmes.map((p) => {
        const on = prog === p.id;
        return <button key={p.id} onClick={() => setProg(p.id)} style={{ flexShrink: 0, padding: "8px 15px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{p.nom}</button>;
      })}
    </div>
  );
}

/* ---------------- APPEL ---------------- */
function Appel({ eleves, prog, progNom }) {
  const [date, setDate] = useState(today());
  const [intitule, setIntitule] = useState("");
  const [etat, setEtat] = useState({});
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");
  const [dejaFait, setDejaFait] = useState(false);

  useEffect(() => {
    const e = {}; eleves.forEach((x) => { e[x.id] = true; }); setEtat(e);
    (async () => {
      const { data } = await supabase.from("presences").select("id").eq("programme_id", prog).eq("date_cours", date).limit(1);
      setDejaFait((data || []).length > 0);
    })();
  }, [eleves, prog, date]);

  const presents = Object.values(etat).filter(Boolean).length;

  const enregistrer = async () => {
    if (eleves.length === 0) return;
    setBusy(true);
    const rows = eleves.map((e) => ({ profil_id: e.id, programme_id: prog, date_cours: date, intitule: intitule.trim() || progNom, present: !!etat[e.id] }));
    const { error } = await supabase.from("presences").insert(rows);
    setBusy(false);
    if (error) { setOk("Erreur — l'appel n'a pas été enregistré."); return; }
    setOk(`Appel enregistré : ${presents} présente${presents > 1 ? "s" : ""} sur ${eleves.length}.`);
    setDejaFait(true);
    setTimeout(() => setOk(""), 4000);
  };

  return (
    <>
      <Card style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 10 }}>
          <div><label style={label}>Date du cours</label><input style={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label style={label}>Sujet (optionnel)</label><input style={input} value={intitule} onChange={(e) => setIntitule(e.target.value)} placeholder="Ex : Pose américaine" /></div>
        </div>
        {dejaFait && <p style={{ margin: "10px 0 0", fontSize: 11.5, color: "#9A7000", padding: "8px 11px", borderRadius: 10, background: "rgba(224,165,10,.10)" }}>Un appel existe déjà pour cette date. Enregistrer à nouveau créera un doublon.</p>}
      </Card>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{eleves.length} élève{eleves.length > 1 ? "s" : ""}</span>
        <Badge tone="ok">{presents}/{eleves.length} présentes</Badge>
      </div>

      {eleves.length === 0 ? (
        <Card style={{ padding: 24, textAlign: "center" }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune élève inscrite dans ce programme.</p></Card>
      ) : (
        <Card style={{ padding: "4px 14px", marginBottom: 12 }}>
          {eleves.map((e, i) => {
            const p = !!etat[e.id];
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                <span style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(229,36,126,.10)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{initiales(e)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{e.prenom} {e.nom}</div>
                  <div style={{ fontSize: 10.5, color: C.inkFaint }}>{e.whatsapp}</div>
                </div>
                <button onClick={() => setEtat((s) => ({ ...s, [e.id]: !p }))} style={{ display: "flex", alignItems: "center", gap: 5, border: `1.3px solid ${p ? "transparent" : C.line}`, background: p ? "rgba(30,132,73,.12)" : "#fff", color: p ? C.green : C.inkFaint, fontSize: 11.5, fontWeight: 800, padding: "7px 13px", borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap" }}>
                  {p ? "✓ Présente" : "Absente"}
                </button>
              </div>
            );
          })}
        </Card>
      )}

      {ok && <div style={{ marginBottom: 10, padding: "10px 13px", borderRadius: 12, background: ok.startsWith("Erreur") ? "rgba(192,57,43,.10)" : "rgba(30,132,73,.10)", fontSize: 12.5, fontWeight: 700, color: ok.startsWith("Erreur") ? C.danger : C.green }}>{ok}</div>}
      <button onClick={enregistrer} disabled={busy || eleves.length === 0} style={{ ...btnPrim, width: "100%", padding: "13px", opacity: busy || eleves.length === 0 ? 0.5 : 1 }}>{busy ? "…" : "✓ Enregistrer l'appel"}</button>
    </>
  );
}

/* ---------------- NOTES ---------------- */
function Notes({ eleves, prog }) {
  const [intitule, setIntitule] = useState("");
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState({});
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");

  useEffect(() => { setNotes({}); }, [prog]);

  const remplies = eleves.filter((e) => notes[e.id] !== undefined && notes[e.id] !== "");
  const moy = remplies.length ? (remplies.reduce((s, e) => s + Number(notes[e.id]), 0) / remplies.length).toFixed(1) : null;

  const enregistrer = async () => {
    if (!intitule.trim()) { setOk("Erreur — indiquez l'intitulé de l'évaluation."); return; }
    if (remplies.length === 0) { setOk("Erreur — aucune note saisie."); return; }
    setBusy(true);
    const rows = remplies.map((e) => ({ profil_id: e.id, programme_id: prog, intitule: intitule.trim(), note: Math.max(0, Math.min(20, Number(notes[e.id]))), date_eval: date }));
    const { error } = await supabase.from("evaluations").insert(rows);
    setBusy(false);
    if (error) { setOk("Erreur — les notes n'ont pas été enregistrées."); return; }
    setOk(`${remplies.length} note${remplies.length > 1 ? "s" : ""} enregistrée${remplies.length > 1 ? "s" : ""} — moyenne ${moy}/20.`);
    setNotes({}); setIntitule("");
    setTimeout(() => setOk(""), 4000);
  };

  const tone = (n) => (n >= 16 ? C.green : n >= 12 ? C.magenta : C.gold);

  return (
    <>
      <Card style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10 }}>
          <div><label style={label}>Intitulé de l'évaluation</label><input style={input} value={intitule} onChange={(e) => setIntitule(e.target.value)} placeholder="Ex : Évaluation 1 — Matériel" /></div>
          <div><label style={label}>Date</label><input style={input} type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
      </Card>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>Notes sur 20</span>
        {moy !== null && <Badge tone="info">Moyenne {moy}/20 · {remplies.length}/{eleves.length}</Badge>}
      </div>

      {eleves.length === 0 ? (
        <Card style={{ padding: 24, textAlign: "center" }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune élève inscrite dans ce programme.</p></Card>
      ) : (
        <Card style={{ padding: "4px 14px", marginBottom: 12 }}>
          {eleves.map((e, i) => {
            const v = notes[e.id];
            const n = v === undefined || v === "" ? null : Number(v);
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                <span style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(229,36,126,.10)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{initiales(e)}</span>
                <div style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: C.ink }}>{e.prenom} {e.nom}</div>
                <input inputMode="decimal" value={v === undefined ? "" : v} onChange={(ev) => setNotes((s) => ({ ...s, [e.id]: ev.target.value.replace(/[^\d.,]/g, "").replace(",", ".") }))} placeholder="—" style={{ ...input, width: 62, textAlign: "center", padding: "8px 6px", fontWeight: 800, color: n === null ? C.ink : tone(n) }} />
                <span style={{ fontSize: 11, color: C.inkFaint, fontWeight: 700 }}>/20</span>
              </div>
            );
          })}
        </Card>
      )}

      {ok && <div style={{ marginBottom: 10, padding: "10px 13px", borderRadius: 12, background: ok.startsWith("Erreur") ? "rgba(192,57,43,.10)" : "rgba(30,132,73,.10)", fontSize: 12.5, fontWeight: 700, color: ok.startsWith("Erreur") ? C.danger : C.green }}>{ok}</div>}
      <button onClick={enregistrer} disabled={busy || eleves.length === 0} style={{ ...btnPrim, width: "100%", padding: "13px", opacity: busy || eleves.length === 0 ? 0.5 : 1 }}>{busy ? "…" : "✓ Enregistrer les notes"}</button>
    </>
  );
}

/* ---------------- HISTORIQUE ---------------- */
function Historique({ eleves, prog }) {
  const [pres, setPres] = useState(null);
  const [evals, setEvals] = useState(null);

  useEffect(() => {
    (async () => {
      const [a, b] = await Promise.all([
        supabase.from("presences").select("*").eq("programme_id", prog).order("date_cours", { ascending: false }),
        supabase.from("evaluations").select("*").eq("programme_id", prog).order("date_eval", { ascending: false }),
      ]);
      setPres(a.data || []); setEvals(b.data || []);
    })();
  }, [prog]);

  if (!pres || !evals) return <p style={{ color: C.inkSoft, fontSize: 13 }}>Chargement…</p>;

  const nomDe = (id) => { const e = eleves.find((x) => x.id === id); return e ? `${e.prenom} ${e.nom}` : "—"; };

  /* Rezime pa elèv */
  const resume = eleves.map((e) => {
    const p = pres.filter((x) => x.profil_id === e.id);
    const ev = evals.filter((x) => x.profil_id === e.id);
    const taux = p.length ? Math.round((p.filter((x) => x.present).length / p.length) * 100) : null;
    const moy = ev.length ? (ev.reduce((s, x) => s + Number(x.note), 0) / ev.length).toFixed(1) : null;
    const abs = p.filter((x) => !x.present).length;
    return { e, taux, moy, abs, n: p.length };
  });

  /* Jou apèl yo */
  const jours = Array.from(new Set(pres.map((x) => x.date_cours))).map((d) => ({ d, n: pres.filter((x) => x.date_cours === d).length, pr: pres.filter((x) => x.date_cours === d && x.present).length, t: (pres.find((x) => x.date_cours === d) || {}).intitule }));

  return (
    <>
      <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>PAR ÉLÈVE</div>
      <Card style={{ padding: "4px 14px", marginBottom: 16 }}>
        {resume.length === 0 && <p style={{ margin: "10px 0", fontSize: 12.5, color: C.inkSoft }}>Aucune élève.</p>}
        {resume.map((r, i) => (
          <div key={r.e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(229,36,126,.10)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 800, flexShrink: 0 }}>{initiales(r.e)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{r.e.prenom} {r.e.nom}</div>
              <div style={{ fontSize: 10.5, color: C.inkFaint }}>{r.n} cours · {r.abs} absence{r.abs > 1 ? "s" : ""}</div>
            </div>
            <Badge tone={r.taux === null ? "neutral" : r.taux >= 80 ? "ok" : "warn"}>{r.taux === null ? "—" : r.taux + " %"}</Badge>
            <Badge tone={r.moy === null ? "neutral" : Number(r.moy) >= 12 ? "info" : "bad"}>{r.moy === null ? "—" : r.moy + "/20"}</Badge>
          </div>
        ))}
      </Card>

      <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>APPELS ({jours.length})</div>
      <Card style={{ padding: "4px 14px", marginBottom: 16 }}>
        {jours.length === 0 && <p style={{ margin: "10px 0", fontSize: 12.5, color: C.inkSoft }}>Aucun appel enregistré.</p>}
        {jours.map((j, i) => (
          <div key={j.d} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{j.t || "Cours"}</div>
              <div style={{ fontSize: 10.5, color: C.inkFaint }}>{fmt(j.d)}</div>
            </div>
            <Badge tone="ok">{j.pr}/{j.n} présentes</Badge>
          </div>
        ))}
      </Card>

      <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>DERNIÈRES NOTES</div>
      <Card style={{ padding: "4px 14px" }}>
        {evals.length === 0 && <p style={{ margin: "10px 0", fontSize: 12.5, color: C.inkSoft }}>Aucune note enregistrée.</p>}
        {evals.slice(0, 20).map((ev, i) => (
          <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{nomDe(ev.profil_id)}</div>
              <div style={{ fontSize: 10.5, color: C.inkFaint }}>{ev.intitule} · {fmt(ev.date_eval)}</div>
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, color: Number(ev.note) >= 16 ? C.green : Number(ev.note) >= 12 ? C.magenta : C.gold }}>{Number(ev.note)}/20</span>
          </div>
        ))}
      </Card>
    </>
  );
}

/* ---------------- APP ---------------- */
export default function Professeur() {
  const [ok, setOk] = useState(() => { try { return sessionStorage.getItem("mt_prof") === "1"; } catch (e) { return false; } });
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("appel");
  const [programmes, setProgrammes] = useState([]);
  const [prog, setProg] = useState("");
  const [eleves, setEleves] = useState([]);

  const entrer = () => {
    if (pwd === MOT_DE_PASSE) { setOk(true); try { sessionStorage.setItem("mt_prof", "1"); } catch (e) {} }
    else setErr("Mot de passe incorrect.");
  };

  useEffect(() => {
    if (!ok) return;
    (async () => {
      const { data } = await supabase.from("programmes").select("*").eq("actif", true).order("ordre");
      setProgrammes(data || []);
      if (data && data.length && !prog) setProg(data[0].id);
    })();
  }, [ok]);

  useEffect(() => {
    if (!prog) return;
    (async () => {
      const { data: pr } = await supabase.from("prospects").select("profil_id").eq("programme_id", prog).not("reglement_accepte_le", "is", null);
      const ids = Array.from(new Set((pr || []).map((x) => x.profil_id)));
      if (ids.length === 0) { setEleves([]); return; }
      const { data: pf } = await supabase.from("profils").select("*").in("id", ids).order("nom");
      setEleves(pf || []);
    })();
  }, [prog]);

  const progNom = (programmes.find((p) => p.id === prog) || {}).nom || "";
  const shell = { minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.ink };

  if (!ok) {
    return (
      <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Card style={{ padding: 24, width: "100%", maxWidth: 360 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, textAlign: "center" }}>👑 MISS THANI</div>
          <div style={{ fontSize: 10, letterSpacing: "2px", color: C.magenta, fontWeight: 700, textAlign: "center", marginTop: 4, marginBottom: 20 }}>ESPACE PROFESSEUR</div>
          <input style={input} type="password" placeholder="Mot de passe" value={pwd} onChange={(e) => { setPwd(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") entrer(); }} autoFocus />
          {err && <p style={{ color: C.danger, fontSize: 12.5, margin: "8px 0 0" }}>{err}</p>}
          <button onClick={entrer} style={{ ...btnPrim, width: "100%", marginTop: 12, padding: "12px" }}>Entrer</button>
        </Card>
      </div>
    );
  }

  const TABS = [{ k: "appel", l: "Appel" }, { k: "notes", l: "Notes" }, { k: "historique", l: "Historique" }];

  return (
    <div style={shell}>
      <style>{`*{box-sizing:border-box}body{margin:0}.mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}input::placeholder{color:rgba(58,14,51,.32)}`}</style>
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700 }}>👑 MISS THANI</div>
            <div style={{ fontSize: 9, letterSpacing: "2px", color: C.magenta, fontWeight: 700, marginTop: 3 }}>ESPACE PROFESSEUR</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {TABS.map((t) => {
              const on = tab === t.k;
              return <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: "7px 13px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink }}>{t.l}</button>;
            })}
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "16px 16px 40px" }}>
        <Selecteur programmes={programmes} prog={prog} setProg={setProg} />
        {!prog ? <p style={{ color: C.inkSoft, fontSize: 13 }}>Chargement…</p> : (
          <>
            {tab === "appel" && <Appel key={prog} eleves={eleves} prog={prog} progNom={progNom} />}
            {tab === "notes" && <Notes key={prog} eleves={eleves} prog={prog} />}
            {tab === "historique" && <Historique key={prog} eleves={eleves} prog={prog} />}
          </>
        )}
      </main>
    </div>
  );
}
