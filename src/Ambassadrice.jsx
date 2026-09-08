import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — ESPACE AMBASSADRICE  (/ambassadrice)
   Missions · Vidéos · Lien · Paie
   ============================================================ */

const C = {
  bg: "#F7F2F6", card: "#FFFFFF", ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.58)", inkFaint: "rgba(58,14,51,.38)",
  blush: "#E5247E", magenta: "#C2238E", gold: "#E0A50A",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};
const PAR_INSCRITE = 750;
const BONUS_VUES = { palier: 20000, prime: 1500 };

const gdes = (n) => Number(n || 0).toLocaleString("fr-FR") + " gdes";
const kk = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n || 0));
const today = () => new Date().toISOString().slice(0, 10);
const fmt = (s) => { if (!s) return ""; const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return `${d} ${["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."][m - 1]} ${y}`; };
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
const statutVideo = (s) => (s === "publiee" ? ["ok", "Publiée"] : s === "refusee" ? ["bad", "Refusée"] : ["warn", "En révision"]);

/* ---------------- Koneksyon ---------------- */
function Connexion({ liste, onOk }) {
  const [etq, setEtq] = useState(""); const [pin, setPin] = useState(""); const [err, setErr] = useState("");
  const entrer = () => {
    const a = liste.find((x) => x.etiquette === etq);
    if (!a) { setErr("Choisissez votre nom."); return; }
    if (String(a.pin || "") !== pin) { setErr("Code incorrect."); return; }
    try { sessionStorage.setItem("mt_amb", a.id); } catch (e) {}
    onOk(a);
  };
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter',sans-serif" }}>
      <Card style={{ padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, textAlign: "center", color: C.ink }}>👑 MISS THANI</div>
        <div style={{ fontSize: 10, letterSpacing: "2px", color: C.magenta, fontWeight: 700, textAlign: "center", marginTop: 4, marginBottom: 20 }}>ESPACE AMBASSADRICE</div>
        <label style={label}>Votre nom</label>
        <select style={input} value={etq} onChange={(e) => { setEtq(e.target.value); setErr(""); }}><option value="">Choisir…</option>{liste.map((a) => <option key={a.id} value={a.etiquette}>{a.prenom} {a.nom}</option>)}</select>
        <label style={{ ...label, marginTop: 12 }}>Code (4 chiffres)</label>
        <input style={{ ...input, textAlign: "center", letterSpacing: 6, fontSize: 18 }} type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "").slice(0, 4)); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") entrer(); }} placeholder="••••" />
        {err && <p style={{ color: C.danger, fontSize: 12.5, margin: "8px 0 0" }}>{err}</p>}
        <button onClick={entrer} style={{ ...btnPrim, width: "100%", marginTop: 14, padding: "12px" }}>Entrer</button>
        {liste.length === 0 && <p style={{ fontSize: 11.5, color: C.inkFaint, marginTop: 12, textAlign: "center" }}>Aucune ambassadrice enregistrée.</p>}
      </Card>
    </div>
  );
}

/* ---------------- App ---------------- */
export default function Ambassadrice() {
  const [liste, setListe] = useState([]);
  const [moi, setMoi] = useState(null);
  const [tab, setTab] = useState("bord");
  const [d, setD] = useState(null);
  const [form, setForm] = useState({ mission_id: "", titre: "", plateforme: "tiktok", lien: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("profils").select("*").eq("role", "ambassadrice").eq("actif", true).order("prenom");
      setListe(data || []);
      try { const id = sessionStorage.getItem("mt_amb"); const a = (data || []).find((x) => x.id === id); if (a) setMoi(a); } catch (e) {}
    })();
  }, []);

  const recharger = async () => {
    const [m, v, pr] = await Promise.all([
      supabase.from("missions_contenu").select("*").eq("statut", "ouverte").order("date_limite"),
      supabase.from("videos_ambassadrice").select("*").eq("profil_id", moi.id).order("cree_le", { ascending: false }),
      supabase.from("prospects").select("id, cree_le, etape").eq("etiquette", moi.etiquette),
    ]);
    setD({ missions: (m.data || []).filter((x) => !x.pour_profil || x.pour_profil === moi.id), videos: v.data || [], prospects: pr.data || [] });
  };
  useEffect(() => { if (moi) recharger(); }, [moi]);

  if (!moi) return <Connexion liste={liste} onOk={setMoi} />;
  if (!d) return <div style={{ padding: 30, fontFamily: "'Inter',sans-serif", color: C.inkSoft }}>Chargement…</div>;

  const mois = today().slice(0, 7);
  const pub = d.videos.filter((v) => v.statut === "publiee");
  const vues = pub.reduce((s, v) => s + Number(v.vues || 0), 0);
  const likes = pub.reduce((s, v) => s + Number(v.likes || 0), 0);
  const inscrites = d.prospects.length;
  const primesValidees = d.videos.filter((v) => v.prime_validee).reduce((s, v) => s + Number((d.missions.find((m) => m.id === v.mission_id) || {}).prime || 0), 0);
  const primesAttente = d.videos.filter((v) => v.statut === "en_revision" && v.mission_id).reduce((s, v) => s + Number((d.missions.find((m) => m.id === v.mission_id) || {}).prime || 0), 0);
  const bonusVues = Math.floor(vues / BONUS_VUES.palier) * BONUS_VUES.prime;
  const total = primesValidees + bonusVues + inscrites * PAR_INSCRITE;
  const lien = `${window.location.origin}/?ref=${encodeURIComponent(moi.etiquette)}`;
  const urgente = d.missions[0];
  const faitePour = (mid) => d.videos.some((v) => v.mission_id === mid);

  const soumettre = async () => {
    setMsg("");
    if (!form.titre.trim()) { setMsg("Erreur — donnez un titre à votre vidéo."); return; }
    if (!/^https?:\/\//.test(form.lien.trim())) { setMsg("Erreur — collez le lien complet (https://…)."); return; }
    setBusy(true);
    const { error } = await supabase.from("videos_ambassadrice").insert({ profil_id: moi.id, mission_id: form.mission_id || null, titre: form.titre.trim(), plateforme: form.plateforme, lien: form.lien.trim(), statut: "en_revision" });
    setBusy(false);
    if (error) { setMsg("Erreur — l'envoi a échoué."); return; }
    setMsg("✓ Vidéo envoyée à la direction pour validation.");
    setForm({ mission_id: "", titre: "", plateforme: "tiktok", lien: "" });
    recharger(); setTimeout(() => setMsg(""), 4000);
  };

  const sortir = () => { try { sessionStorage.removeItem("mt_amb"); } catch (e) {} setMoi(null); setD(null); };
  const TABS = [{ k: "bord", l: "Bord" }, { k: "missions", l: "Missions" }, { k: "videos", l: "Vidéos" }, { k: "lien", l: "Mon lien" }, { k: "paie", l: "Paie" }];

  const Mission = ({ m }) => {
    const faite = faitePour(m.id);
    const retard = m.date_limite && m.date_limite < today();
    return (
      <Card key={m.id} style={{ padding: 14, marginBottom: 10, borderColor: faite ? C.line : "rgba(229,36,126,.35)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{m.titre}</div>
            <div style={{ fontSize: 11, color: retard ? C.danger : C.inkSoft, marginTop: 3 }}>{m.date_limite ? `À rendre le ${fmt(m.date_limite)}` : "Sans date limite"}</div>
          </div>
          {faite ? <Badge tone="ok">Envoyée</Badge> : <Badge tone={retard ? "bad" : "info"}>{retard ? "En retard" : "Ouverte"}</Badge>}
        </div>
        {m.brief && <p style={{ margin: "10px 0 0", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6 }}>{m.brief}</p>}
        {m.idees && (
          <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 11, background: "rgba(224,165,10,.09)", border: "1px solid rgba(224,165,10,.35)" }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: "#9A7000", marginBottom: 4 }}>💡 IDÉES DE TOURNAGE</div>
            {m.idees.split("\n").filter(Boolean).map((i) => <div key={i} style={{ fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}>• {i}</div>)}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
          <div><div style={{ fontSize: 10.5, color: C.inkFaint, fontWeight: 700 }}>Prime</div><div style={{ fontSize: 16, fontWeight: 800, color: C.magenta }}>{gdes(m.prime)}</div></div>
          {!faite && <button onClick={() => { setForm({ ...form, mission_id: m.id, titre: m.titre }); setTab("videos"); }} style={btnPrim}>Envoyer ma vidéo</button>}
        </div>
      </Card>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.ink }}>
      <style>{`*{box-sizing:border-box}body{margin:0}.mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}input::placeholder{color:rgba(58,14,51,.32)}`}</style>
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>{initiales(moi)}</span>
              <div style={{ lineHeight: 1.15 }}><div style={{ fontSize: 14, fontWeight: 800 }}>{moi.prenom} {moi.nom}</div><div style={{ fontSize: 10, color: C.magenta, fontWeight: 700, letterSpacing: "1px" }}>AMBASSADRICE · {moi.etiquette}</div></div>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[["Vues", kk(vues), C.blush], ["Vidéos publiées", String(pub.length), C.magenta], ["Inscrites via mon lien", String(inscrites), C.green], ["Gains estimés", gdes(total), C.gold]].map(([l, v, c]) => (
                <Card key={l} style={{ padding: 13 }}><div style={{ fontSize: 20, fontWeight: 800, color: c, lineHeight: 1.1 }}>{v}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>{l}</div></Card>
              ))}
            </div>
            {urgente && !faitePour(urgente.id) && (
              <div style={{ borderRadius: 18, padding: "16px 18px", background: `linear-gradient(120deg, ${C.blush}, ${C.magenta})`, color: "#fff", marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".5px", opacity: 0.9 }}>MISSION EN COURS{urgente.date_limite ? ` · À RENDRE LE ${fmt(urgente.date_limite).toUpperCase()}` : ""}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, marginTop: 4 }}>{urgente.titre}</div>
                <div style={{ fontSize: 12, opacity: 0.92, marginTop: 5, lineHeight: 1.5 }}>{urgente.brief}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => setTab("missions")} style={{ ...btnPrim, background: "#fff", color: C.magenta }}>Voir le brief</button>
                  <span style={{ alignSelf: "center", fontSize: 13, fontWeight: 800 }}>Prime {gdes(urgente.prime)}</span>
                </div>
              </div>
            )}
            <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>MES DERNIÈRES VIDÉOS</div>
            {d.videos.length === 0 ? <Card style={{ padding: 22, textAlign: "center" }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune vidéo envoyée pour le moment.</p></Card> : d.videos.slice(0, 3).map((v) => { const [tone, l] = statutVideo(v.statut); return (
              <Card key={v.id} style={{ padding: 12, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{v.titre}</div><div style={{ fontSize: 10.5, color: C.inkFaint }}>{v.plateforme} · {fmt(v.cree_le)}{v.statut === "publiee" ? ` · ${kk(v.vues)} vues` : ""}</div></div>
                  <Badge tone={tone}>{l}</Badge>
                </div>
              </Card>
            ); })}
          </>
        )}

        {tab === "missions" && (
          <>
            <div style={{ marginBottom: 10 }}><Badge tone="info">{d.missions.length} mission{d.missions.length > 1 ? "s" : ""} ouverte{d.missions.length > 1 ? "s" : ""}</Badge></div>
            {d.missions.length === 0 ? <Card style={{ padding: 22, textAlign: "center" }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune mission pour le moment.</p></Card> : d.missions.map((m) => <Mission key={m.id} m={m} />)}
          </>
        )}

        {tab === "videos" && (
          <>
            <Card style={{ padding: 14, marginBottom: 14, borderColor: "rgba(229,36,126,.35)" }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 10 }}>ENVOYER UNE VIDÉO</div>
              <label style={label}>Mission (optionnel)</label>
              <select style={input} value={form.mission_id} onChange={(e) => { const m = d.missions.find((x) => x.id === e.target.value); setForm({ ...form, mission_id: e.target.value, titre: m ? m.titre : form.titre }); }}>
                <option value="">— Vidéo libre —</option>{d.missions.map((m) => <option key={m.id} value={m.id}>{m.titre} · {gdes(m.prime)}</option>)}
              </select>
              <label style={{ ...label, marginTop: 10 }}>Titre</label>
              <input style={input} value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Ex : Pose américaine en 60 secondes" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 8, marginTop: 10 }}>
                <div><label style={label}>Plateforme</label><select style={input} value={form.plateforme} onChange={(e) => setForm({ ...form, plateforme: e.target.value })}><option value="tiktok">TikTok</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="autre">Autre</option></select></div>
                <div><label style={label}>Lien de la vidéo</label><input style={input} value={form.lien} onChange={(e) => setForm({ ...form, lien: e.target.value })} placeholder="https://…" /></div>
              </div>
              <p style={{ fontSize: 10.5, color: C.inkFaint, margin: "8px 0 0", lineHeight: 1.5 }}>Collez le lien TikTok/Instagram, ou un lien Google Drive / WeTransfer si la vidéo n'est pas encore publiée. La direction valide avant toute publication au nom de l'académie.</p>
              {msg && <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 11, background: msg.startsWith("Erreur") ? "rgba(192,57,43,.10)" : "rgba(30,132,73,.10)", fontSize: 12.5, fontWeight: 700, color: msg.startsWith("Erreur") ? C.danger : C.green }}>{msg}</div>}
              <button onClick={soumettre} disabled={busy} style={{ ...btnPrim, width: "100%", marginTop: 12, padding: "12px" }}>{busy ? "…" : "📤 Envoyer à la direction"}</button>
            </Card>

            <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>MES VIDÉOS ({d.videos.length})</div>
            {d.videos.map((v) => { const [tone, l] = statutVideo(v.statut); return (
              <Card key={v.id} style={{ padding: 13, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{v.titre}</div>
                    <div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 2 }}>{v.plateforme} · {fmt(v.cree_le)}</div>
                    {v.statut === "publiee" && <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 11, fontWeight: 700 }}><span style={{ color: C.inkSoft }}>👁 {kk(v.vues)}</span><span style={{ color: C.blush }}>♥ {kk(v.likes)}</span><span style={{ color: C.green }}>✦ {v.inscrites}</span></div>}
                    {v.note_direction && <div style={{ marginTop: 6, fontSize: 11.5, color: C.inkSoft, padding: "7px 10px", borderRadius: 9, background: "rgba(58,14,51,.05)" }}>💬 {v.note_direction}</div>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <Badge tone={tone}>{l}</Badge>
                    {v.lien && <a href={v.lien} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.magenta, fontWeight: 700 }}>Ouvrir ↗</a>}
                  </div>
                </div>
              </Card>
            ); })}
          </>
        )}

        {tab === "lien" && <LienBloc lien={lien} moi={moi} n={inscrites} />}

        {tab === "paie" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <Card style={{ padding: 13 }}><div style={{ fontSize: 17, fontWeight: 800, color: C.green }}>{gdes(primesValidees)}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>Primes validées</div></Card>
              <Card style={{ padding: 13 }}><div style={{ fontSize: 17, fontWeight: 800, color: C.gold }}>{gdes(primesAttente)}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>En attente</div></Card>
              <Card style={{ padding: 13 }}><div style={{ fontSize: 17, fontWeight: 800, color: C.magenta }}>{gdes(bonusVues)}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>Bonus vues ({kk(vues)})</div></Card>
              <Card style={{ padding: 13 }}><div style={{ fontSize: 17, fontWeight: 800, color: C.ink }}>{gdes(inscrites * PAR_INSCRITE)}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 3 }}>{inscrites} inscrite{inscrites > 1 ? "s" : ""} × {PAR_INSCRITE}</div></Card>
            </div>
            <Card style={{ padding: 16, background: "rgba(229,36,126,.07)", borderColor: "rgba(229,36,126,.30)", marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, color: C.inkSoft, fontWeight: 700 }}>Total estimé</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.blush, marginTop: 3 }}>{gdes(total)}</div>
              <div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 2 }}>Versé le 5 du mois suivant, après validation</div>
            </Card>
            <Card style={{ padding: 14 }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>COMMENT SONT CALCULÉES LES PRIMES</div>
              {["Une prime fixe par mission livrée et validée par la direction", `Bonus de ${gdes(BONUS_VUES.prime)} par tranche de ${kk(BONUS_VUES.palier)} vues`, `${gdes(PAR_INSCRITE)} par élève inscrite via votre lien`, "Versement par MonCash ou NatCash"].map((x) => <div key={x} style={{ display: "flex", gap: 8, fontSize: 12.5, color: C.inkSoft, padding: "4px 0", lineHeight: 1.5 }}><span style={{ color: C.green, fontWeight: 800 }}>✓</span>{x}</div>)}
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
  return (
    <>
      <Card style={{ padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink, marginBottom: 6 }}>Mon lien de suivi</div>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: C.inkSoft, lineHeight: 1.55 }}>Mettez ce lien en bio et dans vos stories. Toute inscription qui passe par lui est comptée pour vous (<strong style={{ color: C.magenta }}>{moi.etiquette}</strong>).</p>
        <code style={{ display: "block", background: "rgba(194,35,142,.05)", border: `1px solid ${C.line}`, borderRadius: 11, padding: "10px 12px", fontSize: 12, color: C.ink, wordBreak: "break-all", marginBottom: 10 }}>{lien}</code>
        <button onClick={copier} style={{ ...btnPrim, width: "100%" }}>{ok ? "✓ Copié" : "Copier le lien"}</button>
      </Card>
      <Card style={{ padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0" }}><span style={{ color: C.inkSoft }}>Inscriptions par votre lien</span><strong>{n}</strong></div>
      </Card>
    </>
  );
}
