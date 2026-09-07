import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — ESPACE ÉTUDIANTE  (/etudiante)
   Koneksyon: nimewo WhatsApp + non fanmi
   ============================================================ */

const C = {
  bg: "#FBEDF5", bg2: "#F7DCEB", card: "#FFFFFF", ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.55)", inkFaint: "rgba(58,14,51,.35)",
  blush: "#E5247E", magenta: "#C2238E", gold: "#E0A50A",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};

const PAIEMENT = { moncash: "509 4643 3016", natcash: "509 4643 3016" };
const gdes = (n) => Number(n || 0).toLocaleString("fr-FR") + " gdes";
const fmt = (s) => {
  if (!s) return "";
  const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
  const mois = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return `${d} ${mois[m - 1]} ${y}`;
};
function telOk(v) {
  let d = String(v || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("509")) d = d.slice(3);
  return /^[234]\d{7}$/.test(d) ? d : "";
}
const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const input = { width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.4px solid ${C.line}`, background: "#FCF7FA", color: C.ink, fontSize: 15, fontFamily: "'Inter',sans-serif", outline: "none" };
const btnPrim = { border: "none", borderRadius: 999, padding: "13px 18px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 8px 18px rgba(229,36,126,.28)", fontFamily: "'Inter',sans-serif" };
const btnGhost = { border: `1.4px solid ${C.line}`, borderRadius: 999, padding: "12px 16px", background: "#fff", color: C.ink, fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Inter',sans-serif", textDecoration: "none" };

function Carte({ children, style }) {
  return <div style={{ background: C.card, borderRadius: 20, padding: "16px 18px", boxShadow: "0 10px 28px rgba(142,44,154,.10)", ...style }}>{children}</div>;
}
function Badge({ tone = "neutral", children }) {
  const map = { ok: ["rgba(30,132,73,.10)", C.green], warn: ["rgba(224,165,10,.16)", "#9A7000"], info: ["rgba(194,35,142,.10)", C.magenta], bad: ["rgba(192,57,43,.10)", C.danger], neutral: ["rgba(58,14,51,.06)", C.inkSoft] };
  const [bg, fg] = map[tone] || map.neutral;
  return <span style={{ background: bg, color: fg, fontSize: 10.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
}
function Titre({ children }) {
  return <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800, color: C.ink }}>{children}</h2>;
}
function Barre({ pct, h = 6 }) {
  return (
    <div style={{ height: h, borderRadius: 999, background: "rgba(142,44,154,.12)", overflow: "hidden" }}>
      <div style={{ width: `${Math.max(0, Math.min(100, pct))}%`, height: "100%", background: `linear-gradient(90deg, ${C.blush}, ${C.magenta})` }} />
    </div>
  );
}

/* ---------------------- Koneksyon ---------------------- */
function Connexion({ onOk }) {
  const [tel, setTel] = useState("");
  const [nom, setNom] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const entrer = async () => {
    setErr("");
    const t = telOk(tel);
    if (!t) { setErr("Entrez un numéro WhatsApp valide (8 chiffres)."); return; }
    if (!nom.trim()) { setErr("Entrez votre nom de famille."); return; }
    setBusy(true);
    const { data } = await supabase.from("profils").select("*").eq("whatsapp", t);
    const match = (data || []).find((p) => norm(p.nom) === norm(nom));
    setBusy(false);
    if (!match) { setErr("Aucun dossier ne correspond. Vérifiez le numéro et le nom utilisés à l'inscription."); return; }
    try { sessionStorage.setItem("mt_etud", match.id); } catch (e) {}
    onOk(match);
  };

  return (
    <Carte style={{ padding: 22 }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: C.ink }}>Mon espace</div>
      <p style={{ margin: "6px 0 16px", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>
        Connectez-vous avec le numéro WhatsApp et le nom de famille utilisés lors de votre inscription.
      </p>
      <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>Numéro WhatsApp</label>
      <input style={input} inputMode="tel" value={tel} onChange={(e) => { setTel(e.target.value); setErr(""); }} placeholder="3712 3456" />
      <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: C.inkSoft, margin: "12px 0 6px" }}>Nom de famille</label>
      <input style={input} value={nom} onChange={(e) => { setNom(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") entrer(); }} placeholder="Pierre" />
      {err && <p style={{ color: C.danger, fontSize: 12.5, margin: "10px 0 0", lineHeight: 1.5 }}>{err}</p>}
      <button onClick={entrer} disabled={busy} style={{ ...btnPrim, width: "100%", marginTop: 16, opacity: busy ? 0.6 : 1 }}>{busy ? "…" : "Entrer"}</button>
      <p style={{ margin: "14px 0 0", fontSize: 11, color: C.inkFaint, textAlign: "center", lineHeight: 1.5 }}>
        Pas encore inscrite ? <a href="/" style={{ color: C.magenta, fontWeight: 700 }}>Faire une pré-inscription</a>
      </p>
    </Carte>
  );
}

/* ---------------------- Espas la ---------------------- */
export default function EspaceEtudiante() {
  const [profil, setProfil] = useState(null);
  const [tab, setTab] = useState("espace");
  const [d, setD] = useState(null);

  useEffect(() => {
    (async () => {
      let id = "";
      try { id = sessionStorage.getItem("mt_etud") || ""; } catch (e) {}
      if (!id) return;
      const { data } = await supabase.from("profils").select("*").eq("id", id).maybeSingle();
      if (data) setProfil(data);
    })();
  }, []);

  useEffect(() => {
    if (!profil) return;
    (async () => {
      const [pr, pg, se, pa, ps, ev, ce] = await Promise.all([
        supabase.from("prospects").select("*").eq("profil_id", profil.id),
        supabase.from("programmes").select("*"),
        supabase.from("sessions").select("*"),
        supabase.from("paiements").select("*").eq("profil_id", profil.id).order("recu_le", { ascending: false }),
        supabase.from("presences").select("*").eq("profil_id", profil.id).order("date_cours", { ascending: false }),
        supabase.from("evaluations").select("*").eq("profil_id", profil.id).order("date_eval", { ascending: false }),
        supabase.from("certificats").select("*").eq("profil_id", profil.id),
      ]);
      setD({
        prospects: pr.data || [], programmes: pg.data || [], sessions: se.data || [],
        paiements: pa.data || [], presences: ps.data || [], evaluations: ev.data || [], certificats: ce.data || [],
      });
    })();
  }, [profil]);

  const sortir = () => { try { sessionStorage.removeItem("mt_etud"); } catch (e) {} setProfil(null); setD(null); setTab("espace"); };

  const shell = (children) => (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg2} 100%)`, fontFamily: "'Inter',sans-serif", color: C.ink }}>
      <style>{`*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{margin:0}.mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}input::placeholder{color:rgba(58,14,51,.32)}@media (min-width:640px){.mt-wrap{max-width:520px;margin:0 auto}}`}</style>
      <div className="mt-wrap" style={{ padding: "18px 20px 110px" }}>
        <div style={{ textAlign: "center", lineHeight: 1, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 700, color: C.ink }}><span>👑</span> MISS THANI</div>
          <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 20, fontWeight: 700, color: C.blush, marginTop: -2 }}>Espace étudiante</div>
        </div>
        {children}
        <p style={{ textAlign: "center", fontSize: 10.5, color: C.inkFaint, marginTop: 22 }}>
          Miss Thani Make-up &amp; Lace Club · <a href="/" style={{ color: C.magenta, fontWeight: 700 }}>Retour à l'app</a>
        </p>
      </div>
    </div>
  );

  if (!profil) return shell(<Connexion onOk={setProfil} />);
  if (!d) return shell(<Carte><p style={{ margin: 0, fontSize: 13, color: C.inkSoft, textAlign: "center" }}>Chargement…</p></Carte>);

  /* ---- Kalkil ---- */
  const progNom = (id) => (d.programmes.find((p) => p.id === id) || {}).nom || "—";
  const sessionDe = (pid) => d.sessions.find((s) => s.programme_id === pid);
  const presents = d.presences.filter((p) => p.present).length;
  const tauxPres = d.presences.length ? Math.round((presents / d.presences.length) * 100) : null;
  const moyenne = d.evaluations.length ? (d.evaluations.reduce((s, e) => s + Number(e.note), 0) / d.evaluations.length).toFixed(1) : null;
  const paye = d.paiements.filter((p) => p.statut === "valide").reduce((s, p) => s + Number(p.montant || 0), 0);
  const attente = d.paiements.filter((p) => p.statut === "en_attente").reduce((s, p) => s + Number(p.montant || 0), 0);
  const du = d.prospects.reduce((s, pr) => s + Number((d.programmes.find((p) => p.id === pr.programme_id) || {}).prix_inscription || 0), 0);
  const reste = Math.max(0, du - paye);
  const valide = d.prospects.some((p) => p.reglement_accepte_le);

  const TABS = [{ k: "espace", l: "Mon espace" }, { k: "cours", l: "Mes cours" }, { k: "suivi", l: "Suivi" }, { k: "paiements", l: "Paiements" }];

  return shell(
    <>
      {/* Byenvini */}
      <div style={{ borderRadius: 22, padding: "18px 20px", background: `linear-gradient(120deg, ${C.blush}, ${C.magenta})`, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", right: -30, bottom: -34, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700 }}>Bonjour {profil.prenom} 👋</div>
            <div style={{ fontSize: 12, opacity: 0.92, marginTop: 4 }}>
              {d.prospects.map((p) => progNom(p.programme_id)).join(" · ") || "Aucun programme"}
            </div>
            <div style={{ marginTop: 8 }}><Badge tone={valide ? "ok" : "warn"}>{valide ? "Inscription validée" : "En attente de validation"}</Badge></div>
          </div>
          <button onClick={sortir} style={{ border: "1.3px solid rgba(255,255,255,.6)", background: "transparent", color: "#fff", borderRadius: 999, padding: "7px 12px", fontSize: 11.5, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Quitter</button>
        </div>
      </div>

      {/* Onglè */}
      <div className="mt-row" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "14px 0 4px" }}>
        {TABS.map((t) => {
          const on = tab === t.k;
          return <button key={t.k} onClick={() => setTab(t.k)} style={{ flexShrink: 0, padding: "8px 15px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{t.l}</button>;
        })}
      </div>

      {/* ---------- MON ESPACE ---------- */}
      {tab === "espace" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            {[
              { l: "Présence", v: tauxPres === null ? "—" : tauxPres + " %", c: C.green },
              { l: "Moyenne", v: moyenne === null ? "—" : moyenne + "/20", c: C.gold },
              { l: "Cours suivis", v: String(d.presences.length), c: C.magenta },
              { l: "Solde à payer", v: gdes(reste), c: reste > 0 ? C.danger : C.green },
            ].map((s) => (
              <Carte key={s.l} style={{ padding: 14 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.c, lineHeight: 1.1 }}>{s.v}</div>
                <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 3 }}>{s.l}</div>
              </Carte>
            ))}
          </div>

          {reste > 0 && (
            <Carte style={{ marginTop: 12, background: "rgba(192,57,43,.05)", border: "1px solid rgba(192,57,43,.25)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>Solde de {gdes(reste)}</div>
              <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>{attente > 0 ? `${gdes(attente)} en cours de vérification.` : "Réglez-le avant le début de votre session."}</div>
              <button onClick={() => setTab("paiements")} style={{ ...btnPrim, width: "100%", marginTop: 11, padding: "11px" }}>Voir comment payer</button>
            </Carte>
          )}

          <Carte style={{ marginTop: 12 }}>
            <Titre>Prochaines séances</Titre>
            {d.prospects.length === 0 ? <p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune session prévue.</p> : d.prospects.map((pr) => {
              const s = sessionDe(pr.programme_id);
              return (
                <div key={pr.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderTop: `1px solid ${C.line}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{progNom(pr.programme_id)}</div>
                    <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>{s ? `Session du ${fmt(s.date_debut)}` : "Date bientôt annoncée"}</div>
                  </div>
                  {pr.code_eleve && <span style={{ fontFamily: "monospace", fontSize: 11, color: C.magenta, fontWeight: 700 }}>{pr.code_eleve}</span>}
                </div>
              );
            })}
          </Carte>

          <a href="https://wa.me/50946433016" target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, width: "100%", marginTop: 12, color: C.green, borderColor: "rgba(30,132,73,.35)" }}>💬 Contacter l'académie</a>
        </>
      )}

      {/* ---------- MES COURS ---------- */}
      {tab === "cours" && (
        <div style={{ marginTop: 12 }}>
          {d.prospects.length === 0 ? <Carte><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Vous n'êtes inscrite à aucun programme.</p></Carte> : d.prospects.map((pr) => {
            const p = d.programmes.find((x) => x.id === pr.programme_id) || {};
            const s = sessionDe(pr.programme_id);
            const nbPres = d.presences.filter((x) => x.programme_id === pr.programme_id).length;
            return (
              <Carte key={pr.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.ink }}>{p.nom}</div>
                  <Badge tone={pr.reglement_accepte_le ? "ok" : "warn"}>{pr.reglement_accepte_le ? "Active" : "En attente"}</Badge>
                </div>
                <div style={{ fontSize: 12, color: C.inkSoft, marginTop: 5, lineHeight: 1.6 }}>
                  {p.duree ? <>Durée : {p.duree}<br /></> : null}
                  {p.horaires ? <>Horaires : {p.horaires}<br /></> : null}
                  {s ? <>Début : {fmt(s.date_debut)}</> : "Date de session bientôt annoncée"}
                </div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.inkFaint, whiteSpace: "nowrap" }}>{nbPres} cours suivi{nbPres > 1 ? "s" : ""}</span>
                  <div style={{ flex: 1 }}><Barre pct={Math.min(100, nbPres * 8)} h={5} /></div>
                </div>
                <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, background: "rgba(229,36,126,.06)", fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}>
                  📹 Les leçons vidéo de ce programme seront disponibles ici dès l'ouverture du club en ligne.
                </div>
              </Carte>
            );
          })}
        </div>
      )}

      {/* ---------- SUIVI ---------- */}
      {tab === "suivi" && (
        <>
          <Carte style={{ marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <Titre>Ma présence</Titre>
              {tauxPres !== null && <Badge tone={tauxPres >= 80 ? "ok" : "warn"}>{tauxPres} %</Badge>}
            </div>
            {d.presences.length === 0 ? <p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucun cours enregistré pour le moment.</p> : d.presences.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `1px solid ${C.line}` }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: p.present ? "rgba(30,132,73,.10)" : "rgba(192,57,43,.10)", color: p.present ? C.green : C.danger, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{p.present ? "✓" : "✕"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{p.intitule || progNom(p.programme_id)}</div>
                  <div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 1 }}>{fmt(p.date_cours)}</div>
                </div>
                <Badge tone={p.present ? "ok" : "bad"}>{p.present ? "Présente" : "Absente"}</Badge>
              </div>
            ))}
            {tauxPres !== null && tauxPres < 80 && (
              <p style={{ margin: "12px 0 0", fontSize: 11.5, color: "#9A7000", lineHeight: 1.5, padding: "9px 12px", borderRadius: 11, background: "rgba(224,165,10,.10)" }}>
                Trois absences non justifiées peuvent entraîner le retrait de votre place.
              </p>
            )}
          </Carte>

          <Carte style={{ marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <Titre>Mes notes</Titre>
              {moyenne !== null && <Badge tone="info">Moyenne {moyenne}/20</Badge>}
            </div>
            {d.evaluations.length === 0 ? <p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune évaluation pour le moment.</p> : d.evaluations.map((e) => (
              <div key={e.id} style={{ padding: "9px 0", borderTop: `1px solid ${C.line}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{e.intitule}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: Number(e.note) >= 16 ? C.green : Number(e.note) >= 12 ? C.magenta : C.gold }}>{Number(e.note)}/20</span>
                </div>
                <div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 2 }}>{fmt(e.date_eval)}</div>
              </div>
            ))}
          </Carte>

          <Carte style={{ marginTop: 12 }}>
            <Titre>Certificats</Titre>
            {d.certificats.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>Votre certificat sera disponible ici à la fin de votre formation, si vous avez au moins 80 % de présence, une moyenne de 12/20 et un solde à zéro.</p>
            ) : d.certificats.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `1px solid ${C.line}` }}>
                <span style={{ fontSize: 22 }}>🏅</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{progNom(c.programme_id)}</div>
                  <div style={{ fontSize: 11, color: C.inkSoft }}>Délivré le {fmt(c.delivre_le)} · {c.numero}</div>
                </div>
                {c.fichier_url && <a href={c.fichier_url} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, padding: "7px 12px", fontSize: 11.5 }}>PDF</a>}
              </div>
            ))}
          </Carte>
        </>
      )}

      {/* ---------- PAIEMENTS ---------- */}
      {tab === "paiements" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
            <Carte style={{ padding: 14 }}><div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{gdes(paye)}</div><div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 3 }}>Déjà payé</div></Carte>
            <Carte style={{ padding: 14 }}><div style={{ fontSize: 18, fontWeight: 800, color: reste > 0 ? C.danger : C.green }}>{gdes(reste)}</div><div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 3 }}>Reste à payer</div></Carte>
          </div>

          <Carte style={{ marginTop: 12 }}>
            <Titre>Historique</Titre>
            {d.paiements.length === 0 ? <p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucun paiement enregistré.</p> : d.paiements.map((p) => {
              const tone = p.statut === "valide" ? "ok" : p.statut === "rejete" ? "bad" : "warn";
              const lbl = p.statut === "valide" ? "Validé" : p.statut === "rejete" ? "Rejeté" : "En vérification";
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `1px solid ${C.line}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{gdes(p.montant)}</div>
                    <div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 1 }}>{p.objet} · {p.mode || "—"} · {fmt(p.recu_le)}</div>
                  </div>
                  <Badge tone={tone}>{lbl}</Badge>
                </div>
              );
            })}
          </Carte>

          {reste > 0 && (
            <Carte style={{ marginTop: 12 }}>
              <Titre>Comment payer</Titre>
              {[["MonCash", PAIEMENT.moncash], ["NatCash", PAIEMENT.natcash]].map(([n, num]) => (
                <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", borderRadius: 11, border: `1px solid ${C.line}`, background: "#FCF7FA", marginBottom: 7 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: C.magenta }}>{n}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{num}</span>
                </div>
              ))}
              <p style={{ margin: "8px 0 10px", fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}>Après votre transfert, envoyez la photo de la preuve au secrétariat sur WhatsApp. Votre solde sera mis à jour après vérification.</p>
              <a href={`https://wa.me/50946433016?text=${encodeURIComponent(`Bonjou, mwen se ${profil.prenom} ${profil.nom}. Men prèv peman mwen pou sòlt mwen an.`)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnPrim, width: "100%", textDecoration: "none" }}>📷 Envoyer ma preuve sur WhatsApp</a>
            </Carte>
          )}
        </>
      )}
    </>
  );
}
