import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — ADMINISTRATION  (/admin)
   Bord · Validations · Élèves · Programmes · Contenus · Comptes · Espaces
   ============================================================ */

const MOT_DE_PASSE = "admin2026";

const C = {
  bg: "#F7F2F6", card: "#FFFFFF", ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.58)", inkFaint: "rgba(58,14,51,.38)",
  blush: "#E5247E", magenta: "#C2238E", gold: "#E0A50A",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};

/* Tout espas yo ak modpas yo — chanje isit la si w chanje yo nan fichye yo */
const ESPACES = [
  { chemin: "/", l: "Site public", d: "Inscription, Carla, formations", pwd: "—", e: "🏠" },
  { chemin: "/boutique", l: "Boutique", d: "Ouverte à tous", pwd: "—", e: "🛍️" },
  { chemin: "/etudiante", l: "Espace étudiante", d: "WhatsApp + nom", pwd: "—", e: "🎓" },
  { chemin: "/professeur", l: "Professeur", d: "Appel, notes", pwd: "prof2026", e: "👩‍🏫" },
  { chemin: "/secretariat", l: "Secrétariat", d: "Inscriptions, caisse, dossiers", pwd: "secretariat2026", e: "🗂️" },
  { chemin: "/gestion-boutique", l: "Gestion boutique", d: "Commandes, stock", pwd: "boutique2026", e: "📦" },
  { chemin: "/agent", l: "Agents", d: "Nom + code 4 chiffres", pwd: "—", e: "📱" },
  { chemin: "/affiliation", l: "Affiliation", d: "Nom + code 4 chiffres", pwd: "—", e: "🔗" },
  { chemin: "/ambassadrice", l: "Ambassadrices", d: "Nom + code 4 chiffres", pwd: "—", e: "🎬" },
  { chemin: "/comptabilite", l: "Comptabilité", d: "Revenus, dépenses, taxes", pwd: "compta2026", e: "📊" },
  { chemin: "/carrieres", l: "Carrières", d: "Postes, formations internes", pwd: "equipe2026", e: "🧭" },
  { chemin: "/memoire", l: "Mémoire", d: "Protocoles, documents, décisions", pwd: "equipe2026", e: "📚" },
];

const gdes = (n) => Number(n || 0).toLocaleString("fr-FR") + " gdes";
const today = () => new Date().toISOString().slice(0, 10);
const quand = (iso) => iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) + " " + new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";
const fmt = (s) => { if (!s) return ""; const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return `${d} ${["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."][m - 1]} ${y}`; };
const genCode = () => "MT" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 5)).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(-7);
const initiales = (p) => (((p.prenom || p.nom || "?")[0]) + ((p.nom || "")[0] || "")).toUpperCase();

function Card({ children, style }) { return <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: "0 6px 20px rgba(142,44,154,.06)", ...style }}>{children}</div>; }
function Badge({ tone = "neutral", children }) {
  const map = { ok: ["rgba(30,132,73,.10)", C.green], warn: ["rgba(224,165,10,.16)", "#9A7000"], info: ["rgba(194,35,142,.10)", C.magenta], bad: ["rgba(192,57,43,.10)", C.danger], neutral: ["rgba(58,14,51,.06)", C.inkSoft] };
  const [bg, fg] = map[tone] || map.neutral;
  return <span style={{ background: bg, color: fg, fontSize: 10.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
}
const btnPrim = { border: "none", borderRadius: 999, padding: "10px 15px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif", textDecoration: "none" };
const btnGhost = { border: `1.3px solid ${C.line}`, borderRadius: 999, padding: "8px 13px", background: "#fff", color: C.ink, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif", textDecoration: "none" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 11, border: `1.3px solid ${C.line}`, background: "#fff", color: C.ink, fontSize: 13.5, fontFamily: "'Inter',sans-serif", outline: "none" };
const label = { display: "block", fontSize: 11, fontWeight: 700, color: C.inkSoft, marginBottom: 5 };
const Titre = ({ children, right }) => <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}><span style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px" }}>{children}</span>{right}</div>;

async function journal(action, cible, detail) { try { await supabase.from("journal").insert({ action, cible, detail }); } catch (e) {} }

export default function Admin() {
  const [ok, setOk] = useState(() => { try { return sessionStorage.getItem("mt_admin") === "1"; } catch (e) { return false; } });
  const [pwd, setPwd] = useState(""); const [err, setErr] = useState("");
  const [tab, setTab] = useState("bord");
  const [d, setD] = useState(null);
  const [msg, setMsg] = useState("");

  const entrer = () => { if (pwd === MOT_DE_PASSE) { setOk(true); try { sessionStorage.setItem("mt_admin", "1"); } catch (e) {} } else setErr("Mot de passe incorrect."); };
  const recharger = async () => {
    const [pf, pr, pg, se, pa, pv, cm, vi, mi, rt, em, po, jo] = await Promise.all([
      supabase.from("profils").select("*").order("cree_le", { ascending: false }),
      supabase.from("prospects").select("*"),
      supabase.from("programmes").select("*").order("ordre"),
      supabase.from("sessions").select("*").order("date_debut"),
      supabase.from("paiements").select("*").order("recu_le", { ascending: false }),
      supabase.from("preuves_paiement").select("*"),
      supabase.from("commandes").select("*"),
      supabase.from("videos_ambassadrice").select("*").order("cree_le", { ascending: false }),
      supabase.from("missions_contenu").select("*").order("date_limite"),
      supabase.from("retraits").select("*").order("cree_le", { ascending: false }),
      supabase.from("employes").select("*").order("nom"),
      supabase.from("postes").select("*").order("ordre"),
      supabase.from("journal").select("*").order("cree_le", { ascending: false }).limit(30),
    ]);
    setD({ profils: pf.data || [], prospects: pr.data || [], programmes: pg.data || [], sessions: se.data || [], paiements: pa.data || [], preuves: pv.data || [], commandes: cm.data || [], videos: vi.data || [], missions: mi.data || [], retraits: rt.data || [], employes: em.data || [], postes: po.data || [], journal: jo.data || [] });
  };
  useEffect(() => { if (ok) recharger(); }, [ok]);
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 3500); };

  const shell = { minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.ink };
  if (!ok) return (
    <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Card style={{ padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, textAlign: "center" }}>👑 MISS THANI</div>
        <div style={{ fontSize: 10, letterSpacing: "2px", color: C.magenta, fontWeight: 700, textAlign: "center", marginTop: 4, marginBottom: 20 }}>ADMINISTRATION</div>
        <input style={input} type="password" placeholder="Mot de passe" value={pwd} onChange={(e) => { setPwd(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") entrer(); }} autoFocus />
        {err && <p style={{ color: C.danger, fontSize: 12.5, margin: "8px 0 0" }}>{err}</p>}
        <button onClick={entrer} style={{ ...btnPrim, width: "100%", marginTop: 12, padding: "12px" }}>Entrer</button>
      </Card>
    </div>
  );
  if (!d) return <div style={{ ...shell, padding: 30, color: C.inkSoft }}>Chargement…</div>;

  /* ---------- Zouti ---------- */
  const profilDe = (id) => d.profils.find((p) => p.id === id) || {};
  const progNom = (id) => (d.programmes.find((p) => p.id === id) || {}).nom || "—";
  const preuveDe = (pid) => d.preuves.find((x) => x.paiement_id === pid);
  const attente = d.paiements.filter((p) => p.statut === "en_attente");
  const t = today();
  const inscritsJour = d.prospects.filter((p) => (p.cree_le || "").slice(0, 10) === t).length;
  const elevesActifs = new Set(d.prospects.filter((p) => p.reglement_accepte_le).map((p) => p.profil_id)).size;
  const encaisse = d.paiements.filter((p) => p.statut === "valide" && (p.recu_le || "").slice(0, 7) === t.slice(0, 7)).reduce((s, p) => s + Number(p.montant || 0), 0);

  /* ---------- Aksyon ---------- */
  const deciderPaiement = async (p, statut, motif) => {
    await supabase.from("paiements").update({ statut }).eq("id", p.id);
    const pr = preuveDe(p.id);
    if (pr) await supabase.from("preuves_paiement").update({ valide_le: new Date().toISOString(), motif_rejet: motif || null }).eq("id", pr.id);
    if (statut === "valide" && p.objet === "inscription" && p.profil_id) {
      const pros = d.prospects.filter((x) => x.profil_id === p.profil_id);
      const code = (pros.find((x) => x.code_eleve) || {}).code_eleve || genCode();
      await supabase.from("prospects").update({ etape: "reserve", code_eleve: code }).eq("profil_id", p.profil_id);
      await supabase.from("profils").update({ type: "eleve" }).eq("id", p.profil_id);
    }
    if (statut === "valide" && p.objet === "commande" && p.commande_id) await supabase.from("commandes").update({ statut: "prete" }).eq("id", p.commande_id).eq("statut", "a_preparer");
    await journal(statut === "valide" ? "Paiement validé" : "Paiement rejeté", profilDe(p.profil_id).nom || p.objet, gdes(p.montant));
    flash(statut === "valide" ? "✓ Paiement validé" : "Paiement rejeté"); recharger();
  };
  const majProg = async (p, patch) => { await supabase.from("programmes").update(patch).eq("id", p.id); await journal("Programme modifié", p.nom, JSON.stringify(patch)); recharger(); };
  const majVideo = async (v, patch) => { await supabase.from("videos_ambassadrice").update(patch).eq("id", v.id); await journal("Vidéo " + (patch.statut || "modifiée"), v.titre); recharger(); };
  const majRetrait = async (r, statut) => { await supabase.from("retraits").update({ statut, paye_le: statut === "paye" ? new Date().toISOString() : null }).eq("id", r.id); await journal("Retrait " + statut, profilDe(r.profil_id).prenom, gdes(r.montant)); recharger(); };
  const majProfil = async (p, patch) => { await supabase.from("profils").update(patch).eq("id", p.id); await journal("Compte modifié", p.prenom + " " + p.nom); recharger(); };
  const creerCompte = async (f) => { await supabase.from("profils").insert({ ...f, type: "partenaire", actif: true }); await journal("Compte créé", f.prenom + " " + f.nom, f.role); flash("✓ Compte créé"); recharger(); };
  const majEmploye = async (e, patch) => { await supabase.from("employes").update(patch).eq("id", e.id); recharger(); };
  const creerMission = async (f) => { await supabase.from("missions_contenu").insert(f); await journal("Mission créée", f.titre); flash("✓ Mission créée"); recharger(); };

  const TABS = [{ k: "bord", l: "Bord" }, { k: "valid", l: `Validations${attente.length ? " · " + attente.length : ""}` }, { k: "eleves", l: "Élèves" }, { k: "prog", l: "Programmes" }, { k: "contenus", l: "Contenus" }, { k: "comptes", l: "Comptes" }, { k: "espaces", l: "Espaces" }];

  return (
    <div style={shell}>
      <style>{`*{box-sizing:border-box}body{margin:0}.mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}input::placeholder{color:rgba(58,14,51,.32)}`}</style>
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ lineHeight: 1 }}><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700 }}>👑 MISS THANI</div><div style={{ fontSize: 9, letterSpacing: "2px", color: C.magenta, fontWeight: 700, marginTop: 3 }}>ADMINISTRATION</div></div>
            <button onClick={recharger} style={{ ...btnGhost, padding: "6px 12px" }}>↻</button>
          </div>
          <div className="mt-row" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {TABS.map((x) => { const on = tab === x.k; return <button key={x.k} onClick={() => setTab(x.k)} style={{ flexShrink: 0, padding: "7px 13px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{x.l}</button>; })}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "16px 16px 40px" }}>
        {msg && <div style={{ marginBottom: 12, padding: "10px 13px", borderRadius: 12, background: "rgba(30,132,73,.10)", fontSize: 12.5, fontWeight: 700, color: C.green }}>{msg}</div>}

        {/* ================= BORD ================= */}
        {tab === "bord" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[["Pré-inscriptions", String(d.prospects.length), C.blush, "eleves"], ["Élèves validées", String(elevesActifs), C.magenta, "eleves"], ["Encaissé ce mois", gdes(encaisse), C.ink, null], ["À valider", String(attente.length), attente.length ? C.danger : C.green, "valid"]].map(([l, v, c, go]) => (
                <Card key={l} style={{ padding: 13, cursor: go ? "pointer" : "default" }}><div onClick={() => go && setTab(go)}><div style={{ fontSize: 20, fontWeight: 800, color: c, lineHeight: 1.1 }}>{v}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>{l}</div></div></Card>
              ))}
            </div>
            <Card style={{ padding: 14, marginBottom: 14 }}>
              <Titre right={<Badge tone="info">{inscritsJour} aujourd'hui</Badge>}>PAR PROGRAMME</Titre>
              {d.programmes.map((p) => { const n = d.prospects.filter((x) => x.programme_id === p.id).length; const max = Math.max(1, ...d.programmes.map((g) => d.prospects.filter((x) => x.programme_id === g.id).length)); return (
                <div key={p.id} style={{ marginBottom: 9 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}><span style={{ fontWeight: 700 }}>{p.nom}</span><span style={{ fontWeight: 800, color: C.inkSoft }}>{n}</span></div><div style={{ height: 6, borderRadius: 999, background: "rgba(142,44,154,.10)", overflow: "hidden" }}><div style={{ width: `${(n / max) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.blush}, ${C.magenta})` }} /></div></div>
              ); })}
            </Card>
            <Card style={{ padding: 14, marginBottom: 14 }}>
              <Titre right={<Badge tone="warn">{d.videos.filter((v) => v.statut === "en_revision").length} vidéos · {d.retraits.filter((r) => r.statut === "demande").length} retraits</Badge>}>EN ATTENTE DE VOUS</Titre>
              {attente.slice(0, 3).map((p) => <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0", borderTop: `1px solid ${C.line}` }}><span>Paiement {p.objet} · {profilDe(p.profil_id).prenom || "boutique"}</span><strong>{gdes(p.montant)}</strong></div>)}
              {attente.length === 0 && <p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucun paiement en attente.</p>}
            </Card>
            <Card style={{ padding: 14 }}>
              <Titre>JOURNAL</Titre>
              {d.journal.slice(0, 10).map((j) => <div key={j.id} style={{ fontSize: 11.5, color: C.inkSoft, padding: "5px 0", borderTop: `1px solid ${C.line}` }}><strong style={{ color: C.ink }}>{j.action}</strong> · {j.cible}{j.detail ? ` · ${j.detail}` : ""} <span style={{ color: C.inkFaint }}>· {quand(j.cree_le)}</span></div>)}
              {d.journal.length === 0 && <p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune action encore.</p>}
            </Card>
          </>
        )}

        {/* ================= VALIDATIONS ================= */}
        {tab === "valid" && (
          <>
            <Titre right={<Badge tone={attente.length ? "warn" : "ok"}>{attente.length} en attente</Badge>}>PREUVES DE PAIEMENT</Titre>
            {attente.length === 0 && <Card style={{ padding: 26, textAlign: "center" }}><div style={{ fontSize: 26 }}>✅</div><p style={{ margin: "8px 0 0", fontSize: 13, color: C.inkSoft }}>Tout est à jour.</p></Card>}
            {attente.map((p) => { const pr = preuveDe(p.id); const pf = profilDe(p.profil_id); return (
              <Card key={p.id} style={{ overflow: "hidden", marginBottom: 12 }}>
                {pr && <a href={pr.image_url} target="_blank" rel="noopener noreferrer" style={{ display: "block", height: 160, background: `url(${pr.image_url}) center/cover`, position: "relative" }}><span style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(255,255,255,.94)", color: C.magenta, fontSize: 11, fontWeight: 800, padding: "5px 11px", borderRadius: 999 }}>Voir en grand</span></a>}
                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                    <div><div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{pf.prenom ? `${pf.prenom} ${pf.nom}` : "Commande boutique"}</div><div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>{p.objet}{pf.whatsapp ? ` · ${pf.whatsapp}` : ""} · {quand(p.recu_le)}</div>{pf.id && <div style={{ fontSize: 11, color: C.inkFaint, marginTop: 2 }}>{d.prospects.filter((x) => x.profil_id === pf.id).map((x) => progNom(x.programme_id)).join(", ")}</div>}</div>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: 16, fontWeight: 800, color: C.magenta }}>{gdes(p.montant)}</div><Badge tone="info">{p.mode || "—"}</Badge></div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button onClick={() => deciderPaiement(p, "valide")} style={{ ...btnPrim, flex: 1 }}>✓ Valider</button>
                    <button onClick={() => { const m = window.prompt("Motif du rejet (envoyé à la personne) :"); if (m !== null) deciderPaiement(p, "rejete", m); }} style={{ ...btnGhost, color: C.danger, borderColor: "rgba(192,57,43,.35)" }}>Rejeter</button>
                    {pf.whatsapp && <a href={`https://wa.me/509${pf.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, color: C.green, borderColor: "rgba(30,132,73,.35)" }}>WA</a>}
                  </div>
                </div>
              </Card>
            ); })}

            <Titre right={<Badge tone="warn">{d.videos.filter((v) => v.statut === "en_revision").length}</Badge>}>VIDÉOS DES AMBASSADRICES</Titre>
            {d.videos.filter((v) => v.statut === "en_revision").map((v) => { const pf = profilDe(v.profil_id); return (
              <Card key={v.id} style={{ padding: 13, marginBottom: 10 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{v.titre}</div>
                <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>{pf.prenom} · {v.plateforme} · {quand(v.cree_le)}</div>
                {v.lien && <a href={v.lien} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.magenta, fontWeight: 700 }}>Ouvrir la vidéo ↗</a>}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => majVideo(v, { statut: "publiee", prime_validee: !!v.mission_id })} style={{ ...btnPrim, flex: 1 }}>✓ Publier{v.mission_id ? " + prime" : ""}</button>
                  <button onClick={() => { const n = window.prompt("Note pour l'ambassadrice :"); if (n !== null) majVideo(v, { statut: "refusee", note_direction: n }); }} style={{ ...btnGhost, color: C.danger, borderColor: "rgba(192,57,43,.35)" }}>Refuser</button>
                </div>
              </Card>
            ); })}
            {d.videos.filter((v) => v.statut === "en_revision").length === 0 && <p style={{ fontSize: 12.5, color: C.inkSoft, margin: "0 0 14px" }}>Aucune vidéo à valider.</p>}

            <Titre right={<Badge tone="warn">{d.retraits.filter((r) => r.statut === "demande").length}</Badge>}>DEMANDES DE RETRAIT</Titre>
            {d.retraits.filter((r) => r.statut === "demande").map((r) => { const pf = profilDe(r.profil_id); return (
              <Card key={r.id} style={{ padding: 13, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{pf.prenom} {pf.nom}</div><div style={{ fontSize: 11.5, color: C.inkSoft }}>{pf.role} · {r.mode} {r.numero} · {fmt(r.cree_le)}</div></div>
                  <strong style={{ color: C.magenta, fontSize: 15 }}>{gdes(r.montant)}</strong>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => majRetrait(r, "paye")} style={{ ...btnPrim, flex: 1 }}>✓ Marquer payé</button>
                  <button onClick={() => majRetrait(r, "refuse")} style={{ ...btnGhost, color: C.danger, borderColor: "rgba(192,57,43,.35)" }}>Refuser</button>
                </div>
              </Card>
            ); })}
            {d.retraits.filter((r) => r.statut === "demande").length === 0 && <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>Aucune demande de retrait.</p>}
          </>
        )}

        {/* ================= ÉLÈVES ================= */}
        {tab === "eleves" && <Eleves d={d} progNom={progNom} profilDe={profilDe} />}

        {/* ================= PROGRAMMES ================= */}
        {tab === "prog" && (
          <>
            <Titre>PROGRAMMES ET PRIX</Titre>
            {d.programmes.map((p) => <ProgLigne key={p.id} p={p} onSave={(patch) => majProg(p, patch)} sessions={d.sessions.filter((s) => s.programme_id === p.id)} />)}
          </>
        )}

        {/* ================= CONTENUS ================= */}
        {tab === "contenus" && <Contenus d={d} onCreer={creerMission} profilDe={profilDe} majVideo={majVideo} />}

        {/* ================= COMPTES ================= */}
        {tab === "comptes" && <Comptes d={d} onCreer={creerCompte} majProfil={majProfil} majEmploye={majEmploye} />}

        {/* ================= ESPACES ================= */}
        {tab === "espaces" && (
          <>
            <p style={{ margin: "0 0 12px", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>Toutes les interfaces de l'académie. Les mots de passe se changent dans le fichier de chaque espace (constante MOT_DE_PASSE).</p>
            {ESPACES.map((e) => (
              <Card key={e.chemin} style={{ padding: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ fontSize: 20 }}>{e.e}</span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{e.l}</div><div style={{ fontSize: 11, color: C.inkSoft }}>{e.d}{e.pwd !== "—" ? ` · mot de passe : ${e.pwd}` : ""}</div></div>
                  <a href={e.chemin} target="_blank" rel="noopener noreferrer" style={btnPrim}>Ouvrir ↗</a>
                </div>
              </Card>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

/* ---------------- Sous-konpozan yo ---------------- */
function Eleves({ d, progNom, profilDe }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("tous");
  const dos = d.profils.filter((p) => d.prospects.some((x) => x.profil_id === p.id)).map((p) => {
    const pros = d.prospects.filter((x) => x.profil_id === p.id);
    const paye = d.paiements.filter((x) => x.profil_id === p.id && x.statut === "valide").reduce((s, x) => s + Number(x.montant || 0), 0);
    const du = pros.reduce((s, x) => s + Number((d.programmes.find((g) => g.id === x.programme_id) || {}).prix_inscription || 0), 0);
    return { p, pros, paye, du, reste: Math.max(0, du - paye), valide: pros.some((x) => x.reglement_accepte_le) };
  }).filter((x) => (f === "tous" || (f === "valide" ? x.valide : f === "attente" ? !x.valide : x.reste > 0 && x.valide)) && (x.p.nom + " " + x.p.prenom + (x.p.whatsapp || "") + (x.pros[0].etiquette || "")).toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <input style={{ ...input, borderRadius: 999, marginBottom: 10 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Nom, numéro, étiquette…" />
      <div className="mt-row" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
        {[["tous", "Toutes"], ["valide", "Validées"], ["attente", "En attente"], ["impaye", "Solde dû"]].map(([k, l]) => { const on = f === k; return <button key={k} onClick={() => setF(k)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink }}>{l}</button>; })}
      </div>
      <div style={{ marginBottom: 8 }}><Badge tone="info">{dos.length} dossier{dos.length > 1 ? "s" : ""}</Badge></div>
      {dos.map((x) => (
        <Card key={x.p.id} style={{ padding: 12, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(229,36,126,.10)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{initiales(x.p)}</span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{x.p.prenom} {x.p.nom}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{x.pros.map((pr) => progNom(pr.programme_id)).join(", ")} · {x.p.whatsapp}{x.pros[0].etiquette ? ` · via ${x.pros[0].etiquette}` : ""}{x.pros[0].code_eleve ? ` · ${x.pros[0].code_eleve}` : ""}</div></div>
            <Badge tone={x.valide ? (x.reste ? "warn" : "ok") : "neutral"}>{x.valide ? (x.reste ? gdes(x.reste) + " dû" : "Complet") : "Pré-inscrite"}</Badge>
          </div>
        </Card>
      ))}
    </>
  );
}

function ProgLigne({ p, onSave, sessions }) {
  const [e, setE] = useState(false);
  const [f, setF] = useState({ prix_inscription: p.prix_inscription, duree: p.duree || "", horaires: p.horaires || "" });
  return (
    <Card style={{ padding: 13, marginBottom: 10, opacity: p.actif ? 1 : 0.6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{p.nom}</div><div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>{gdes(p.prix_inscription)} · {p.duree || "—"} · {sessions.filter((s) => s.statut === "ouverte").length} session(s) ouverte(s)</div></div>
        <Badge tone={p.actif ? "ok" : "neutral"}>{p.actif ? "Visible" : "Masqué"}</Badge>
      </div>
      {e ? (
        <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><label style={label}>Prix (gdes)</label><input style={input} inputMode="numeric" value={f.prix_inscription} onChange={(ev) => setF({ ...f, prix_inscription: ev.target.value.replace(/\D/g, "") })} /></div>
          <div><label style={label}>Durée</label><input style={input} value={f.duree} onChange={(ev) => setF({ ...f, duree: ev.target.value })} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label style={label}>Horaires</label><input style={input} value={f.horaires} onChange={(ev) => setF({ ...f, horaires: ev.target.value })} /></div>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}><button onClick={() => { onSave({ prix_inscription: Number(f.prix_inscription) || 0, duree: f.duree, horaires: f.horaires }); setE(false); }} style={{ ...btnPrim, flex: 1 }}>✓ Enregistrer</button><button onClick={() => setE(false)} style={btnGhost}>Annuler</button></div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 7, marginTop: 10, justifyContent: "flex-end" }}><button onClick={() => setE(true)} style={btnGhost}>Modifier</button><button onClick={() => onSave({ actif: !p.actif })} style={{ ...btnGhost, color: p.actif ? C.danger : C.green }}>{p.actif ? "Masquer" : "Afficher"}</button></div>
      )}
    </Card>
  );
}

function Contenus({ d, onCreer, profilDe, majVideo }) {
  const [f, setF] = useState({ titre: "", brief: "", idees: "", prime: "", date_limite: "" });
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontSize: 12, fontWeight: 800, color: C.magenta }}>MISSIONS AMBASSADRICES</span><button onClick={() => setOpen((v) => !v)} style={btnPrim}>+ Mission</button></div>
      {open && (
        <Card style={{ padding: 14, marginBottom: 12, borderColor: "rgba(229,36,126,.4)" }}>
          <label style={label}>Titre</label><input style={input} value={f.titre} onChange={(e) => setF({ ...f, titre: e.target.value })} />
          <label style={{ ...label, marginTop: 8 }}>Brief</label><textarea style={{ ...input, minHeight: 70 }} value={f.brief} onChange={(e) => setF({ ...f, brief: e.target.value })} />
          <label style={{ ...label, marginTop: 8 }}>Idées de tournage (une par ligne)</label><textarea style={{ ...input, minHeight: 60 }} value={f.idees} onChange={(e) => setF({ ...f, idees: e.target.value })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <div><label style={label}>Prime (gdes)</label><input style={input} inputMode="numeric" value={f.prime} onChange={(e) => setF({ ...f, prime: e.target.value.replace(/\D/g, "") })} /></div>
            <div><label style={label}>Date limite</label><input style={input} type="date" value={f.date_limite} onChange={(e) => setF({ ...f, date_limite: e.target.value })} /></div>
          </div>
          <button onClick={() => { if (!f.titre.trim()) return; onCreer({ ...f, prime: Number(f.prime) || 0, date_limite: f.date_limite || null }); setF({ titre: "", brief: "", idees: "", prime: "", date_limite: "" }); setOpen(false); }} style={{ ...btnPrim, width: "100%", marginTop: 10 }}>Enregistrer</button>
        </Card>
      )}
      {d.missions.map((m) => <Card key={m.id} style={{ padding: 12, marginBottom: 8 }}><div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{m.titre}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{m.date_limite ? fmt(m.date_limite) : "sans date"} · {gdes(m.prime)} · {d.videos.filter((v) => v.mission_id === m.id).length} vidéo(s)</div></div><Badge tone={m.statut === "ouverte" ? "ok" : "neutral"}>{m.statut}</Badge></div></Card>)}
      <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, margin: "16px 0 8px" }}>VIDÉOS PUBLIÉES — METTRE À JOUR LES VUES</div>
      {d.videos.filter((v) => v.statut === "publiee").map((v) => <VideoLigne key={v.id} v={v} pf={profilDe(v.profil_id)} onSave={(patch) => majVideo(v, patch)} />)}
      {d.videos.filter((v) => v.statut === "publiee").length === 0 && <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>Aucune vidéo publiée.</p>}
    </>
  );
}
function VideoLigne({ v, pf, onSave }) {
  const [f, setF] = useState({ vues: v.vues || 0, likes: v.likes || 0, inscrites: v.inscrites || 0 });
  return (
    <Card style={{ padding: 12, marginBottom: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{v.titre} <span style={{ fontSize: 11, color: C.inkFaint, fontWeight: 600 }}>· {pf.prenom}</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 6, marginTop: 8, alignItems: "end" }}>
        {[["vues", "Vues"], ["likes", "J'aime"], ["inscrites", "Inscrites"]].map(([k, l]) => <div key={k}><label style={label}>{l}</label><input style={{ ...input, padding: "7px 9px" }} inputMode="numeric" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value.replace(/\D/g, "") })} /></div>)}
        <button onClick={() => onSave({ vues: Number(f.vues) || 0, likes: Number(f.likes) || 0, inscrites: Number(f.inscrites) || 0 })} style={{ ...btnPrim, padding: "8px 12px" }}>✓</button>
      </div>
    </Card>
  );
}

function Comptes({ d, onCreer, majProfil, majEmploye }) {
  const [f, setF] = useState({ prenom: "", nom: "", whatsapp: "", role: "agent", etiquette: "", pin: "" });
  const [open, setOpen] = useState(false);
  const partenaires = d.profils.filter((p) => p.role);
  const ROLES = [["agent", "Agent"], ["affilie", "Affiliée"], ["ambassadrice", "Ambassadrice"]];
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontSize: 12, fontWeight: 800, color: C.magenta }}>PARTENAIRES ({partenaires.length})</span><button onClick={() => setOpen((v) => !v)} style={btnPrim}>+ Compte</button></div>
      {open && (
        <Card style={{ padding: 14, marginBottom: 12, borderColor: "rgba(229,36,126,.4)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><label style={label}>Prénom</label><input style={input} value={f.prenom} onChange={(e) => setF({ ...f, prenom: e.target.value })} /></div>
            <div><label style={label}>Nom</label><input style={input} value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} /></div>
            <div><label style={label}>WhatsApp</label><input style={input} inputMode="tel" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value.replace(/\D/g, "") })} /></div>
            <div><label style={label}>Rôle</label><select style={input} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{ROLES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            <div><label style={label}>Étiquette (dans le lien ?ref=)</label><input style={input} value={f.etiquette} onChange={(e) => setF({ ...f, etiquette: e.target.value.replace(/[^A-Za-z0-9]/g, "") })} placeholder="Naika" /></div>
            <div><label style={label}>Code 4 chiffres</label><input style={input} inputMode="numeric" maxLength={4} value={f.pin} onChange={(e) => setF({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 4) })} /></div>
          </div>
          <button onClick={() => { if (!f.prenom.trim() || !f.etiquette.trim() || f.pin.length !== 4) return; onCreer(f); setF({ prenom: "", nom: "", whatsapp: "", role: "agent", etiquette: "", pin: "" }); setOpen(false); }} style={{ ...btnPrim, width: "100%", marginTop: 10 }}>Créer le compte</button>
        </Card>
      )}
      {partenaires.map((p) => (
        <Card key={p.id} style={{ padding: 12, marginBottom: 8, opacity: p.actif === false ? 0.55 : 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(229,36,126,.10)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{initiales(p)}</span>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{p.prenom} {p.nom}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{p.role} · ?ref={p.etiquette} · code {p.pin} · {d.prospects.filter((x) => x.etiquette === p.etiquette).length} inscription(s)</div></div>
            <button onClick={() => majProfil(p, { actif: p.actif === false })} style={{ ...btnGhost, padding: "6px 11px", color: p.actif === false ? C.green : C.danger }}>{p.actif === false ? "Activer" : "Désactiver"}</button>
          </div>
        </Card>
      ))}
      <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, margin: "16px 0 8px" }}>EMPLOYÉS — POSTE DANS L'ORGANIGRAMME</div>
      {d.employes.map((e) => (
        <Card key={e.id} style={{ padding: 12, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{e.nom}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{e.poste || "—"} · {e.entite}</div></div>
            <select value={e.poste_id || ""} onChange={(ev) => majEmploye(e, { poste_id: ev.target.value || null })} style={{ ...input, width: "auto", maxWidth: 190, padding: "7px 9px", fontSize: 12 }}><option value="">— Poste —</option>{d.postes.map((p) => <option key={p.id} value={p.id}>{p.titre}</option>)}</select>
          </div>
        </Card>
      ))}
      {d.employes.length === 0 && <p style={{ fontSize: 12.5, color: C.inkSoft, margin: 0 }}>Ajoutez les employés dans Comptabilité → Salaires.</p>}
    </>
  );
}
