import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — MÉMOIRE DE L'ACADÉMIE  (/memoire)
   Culture · Protocoles · Documents · Vidéos · Décisions
   ============================================================ */

const MOT_DE_PASSE = "equipe2026";

const C = {
  bg: "#F7F2F6", card: "#FFFFFF", ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.58)", inkFaint: "rgba(58,14,51,.38)",
  blush: "#E5247E", magenta: "#C2238E", gold: "#E0A50A",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};
const FONCTIONS = [
  { k: "eleves", l: "Pour les élèves", d: "Ce qu'on remet à une élève", e: "🎓" },
  { k: "employees", l: "Pour les employées", d: "Ce que l'équipe utilise", e: "👥" },
  { k: "recrutement", l: "Recrutement", d: "Évaluer et accueillir", e: "🤝" },
  { k: "commercial", l: "Commercial", d: "Agents, affiliées, boutique", e: "📣" },
  { k: "legal", l: "Légal", d: "Documents officiels", e: "⚖️" },
];
const fmt = (s) => { if (!s) return ""; const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return `${d} ${["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."][m - 1]} ${y}`; };
const lignes = (t) => String(t || "").split("\n").map((x) => x.trim()).filter(Boolean);

function Card({ children, style }) { return <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.line}`, boxShadow: "0 6px 20px rgba(142,44,154,.06)", ...style }}>{children}</div>; }
function Badge({ tone = "neutral", children }) {
  const map = { ok: ["rgba(30,132,73,.10)", C.green], warn: ["rgba(224,165,10,.16)", "#9A7000"], info: ["rgba(194,35,142,.10)", C.magenta], neutral: ["rgba(58,14,51,.06)", C.inkSoft] };
  const [bg, fg] = map[tone] || map.neutral;
  return <span style={{ background: bg, color: fg, fontSize: 10.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>{children}</span>;
}
const btnPrim = { border: "none", borderRadius: 999, padding: "11px 16px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif", textDecoration: "none" };
const btnGhost = { border: `1.3px solid ${C.line}`, borderRadius: 999, padding: "9px 14px", background: "#fff", color: C.ink, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Inter',sans-serif", textDecoration: "none" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 11, border: `1.3px solid ${C.line}`, background: "#fff", color: C.ink, fontSize: 13.5, fontFamily: "'Inter',sans-serif", outline: "none" };
const label = { display: "block", fontSize: 11, fontWeight: 700, color: C.inkSoft, marginBottom: 5 };
const Titre = ({ children }) => <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 8 }}>{children}</div>;

export default function Memoire() {
  const [ok, setOk] = useState(() => { try { return sessionStorage.getItem("mt_mem") === "1"; } catch (e) { return false; } });
  const [pwd, setPwd] = useState(""); const [err, setErr] = useState("");
  const [tab, setTab] = useState("culture");
  const [d, setD] = useState(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tous");
  const [fonction, setFonction] = useState("toutes");
  const [ouvert, setOuvert] = useState("");
  const [ajout, setAjout] = useState(null);   // 'protocole' · 'document' · 'video' · 'decision'
  const [f, setF] = useState({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const entrer = () => { if (pwd === MOT_DE_PASSE) { setOk(true); try { sessionStorage.setItem("mt_mem", "1"); } catch (e) {} } else setErr("Mot de passe incorrect."); };
  const recharger = async () => {
    const [p, doc, v, dec, cu] = await Promise.all([
      supabase.from("protocoles").select("*").eq("actif", true).order("ordre"),
      supabase.from("documents").select("*").order("ordre"),
      supabase.from("videos_formation").select("*").order("ordre"),
      supabase.from("decisions").select("*").order("date_dec", { ascending: false }),
      supabase.from("culture").select("*"),
    ]);
    const cul = {}; (cu.data || []).forEach((x) => { cul[x.cle] = x.valeur; });
    setD({ protocoles: p.data || [], documents: doc.data || [], videos: v.data || [], decisions: dec.data || [], culture: cul });
  };
  useEffect(() => { if (ok) recharger(); }, [ok]);

  const shell = { minHeight: "100vh", background: C.bg, fontFamily: "'Inter',system-ui,sans-serif", color: C.ink };
  if (!ok) return (
    <div style={{ ...shell, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Card style={{ padding: 24, width: "100%", maxWidth: 360 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, textAlign: "center" }}>👑 MISS THANI</div>
        <div style={{ fontSize: 10, letterSpacing: "2px", color: C.magenta, fontWeight: 700, textAlign: "center", marginTop: 4, marginBottom: 20 }}>MÉMOIRE DE L'ACADÉMIE</div>
        <input style={input} type="password" placeholder="Mot de passe de l'équipe" value={pwd} onChange={(e) => { setPwd(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") entrer(); }} autoFocus />
        {err && <p style={{ color: C.danger, fontSize: 12.5, margin: "8px 0 0" }}>{err}</p>}
        <button onClick={entrer} style={{ ...btnPrim, width: "100%", marginTop: 12, padding: "12px" }}>Entrer</button>
      </Card>
    </div>
  );
  if (!d) return <div style={{ ...shell, padding: 30, color: C.inkSoft }}>Chargement…</div>;

  /* ---- Anrejistre yon nouvo eleman ---- */
  const enregistrer = async () => {
    setBusy(true); setMsg("");
    let fichier_url = null;
    try {
      if (f.fichier) {
        const ext = (f.fichier.name.split(".").pop() || "pdf").toLowerCase();
        const chemin = `${ajout}/${Date.now()}.${ext}`;
        const { error: e1 } = await supabase.storage.from("archives").upload(chemin, f.fichier);
        if (e1) throw e1;
        fichier_url = supabase.storage.from("archives").getPublicUrl(chemin).data.publicUrl;
      }
      if (ajout === "protocole") await supabase.from("protocoles").insert({ titre: f.titre, categorie: f.categorie || "Toutes branches", pourquoi: f.pourquoi, etapes: f.etapes, ordre: d.protocoles.length + 1 });
      if (ajout === "document") await supabase.from("documents").insert({ titre: f.titre, fonction: f.fonction || "employees", categorie: f.categorie, version: f.version || "v1", usage: f.usage, fichier_url, ordre: d.documents.length + 1 });
      if (ajout === "video") await supabase.from("videos_formation").insert({ titre: f.titre, categorie: f.categorie || "Accueil", description: f.description, duree: f.duree, url: f.url, ordre: d.videos.length + 1 });
      if (ajout === "decision") await supabase.from("decisions").insert({ titre: f.titre, pourquoi: f.pourquoi, date_dec: f.date_dec || new Date().toISOString().slice(0, 10) });
      setMsg("✓ Enregistré."); setAjout(null); setF({}); recharger(); setTimeout(() => setMsg(""), 3000);
    } catch (e) { setMsg("Erreur — l'enregistrement a échoué."); }
    setBusy(false);
  };

  const Form = () => {
    const ch = (k) => (e) => setF({ ...f, [k]: e.target.value });
    return (
      <Card style={{ padding: 14, marginBottom: 14, borderColor: "rgba(229,36,126,.40)" }}>
        <Titre>{{ protocole: "NOUVEAU PROTOCOLE", document: "NOUVEAU DOCUMENT", video: "NOUVELLE VIDÉO", decision: "NOTER UNE DÉCISION" }[ajout]}</Titre>
        <label style={label}>Titre</label><input style={input} value={f.titre || ""} onChange={ch("titre")} />
        {ajout === "protocole" && <>
          <label style={{ ...label, marginTop: 10 }}>Catégorie</label><input style={input} value={f.categorie || ""} onChange={ch("categorie")} placeholder="Secrétariat, Pédagogie, Marketing…" />
          <label style={{ ...label, marginTop: 10 }}>Pourquoi on fait ainsi</label><textarea style={{ ...input, minHeight: 70 }} value={f.pourquoi || ""} onChange={ch("pourquoi")} />
          <label style={{ ...label, marginTop: 10 }}>Étapes (une par ligne)</label><textarea style={{ ...input, minHeight: 90 }} value={f.etapes || ""} onChange={ch("etapes")} />
        </>}
        {ajout === "document" && <>
          <label style={{ ...label, marginTop: 10 }}>À qui sert-il ?</label>
          <select style={input} value={f.fonction || "employees"} onChange={ch("fonction")}>{FONCTIONS.map((x) => <option key={x.k} value={x.k}>{x.l}</option>)}</select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            <div><label style={label}>Catégorie</label><input style={input} value={f.categorie || ""} onChange={ch("categorie")} /></div>
            <div><label style={label}>Version</label><input style={input} value={f.version || ""} onChange={ch("version")} placeholder="v1" /></div>
          </div>
          <label style={{ ...label, marginTop: 10 }}>Quand et comment s'en servir</label><input style={input} value={f.usage || ""} onChange={ch("usage")} />
          <label style={{ ...label, marginTop: 10 }}>Fichier (PDF, image…)</label><input type="file" onChange={(e) => setF({ ...f, fichier: e.target.files && e.target.files[0] })} style={{ fontSize: 12 }} />
        </>}
        {ajout === "video" && <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            <div><label style={label}>Catégorie</label><input style={input} value={f.categorie || ""} onChange={ch("categorie")} placeholder="Accueil, Pédagogie…" /></div>
            <div><label style={label}>Durée</label><input style={input} value={f.duree || ""} onChange={ch("duree")} placeholder="12:40" /></div>
          </div>
          <label style={{ ...label, marginTop: 10 }}>Lien de la vidéo</label><input style={input} value={f.url || ""} onChange={ch("url")} placeholder="https://…" />
          <label style={{ ...label, marginTop: 10 }}>Description</label><input style={input} value={f.description || ""} onChange={ch("description")} />
        </>}
        {ajout === "decision" && <>
          <label style={{ ...label, marginTop: 10 }}>Date</label><input style={input} type="date" value={f.date_dec || new Date().toISOString().slice(0, 10)} onChange={ch("date_dec")} />
          <label style={{ ...label, marginTop: 10 }}>Pourquoi cette décision</label><textarea style={{ ...input, minHeight: 80 }} value={f.pourquoi || ""} onChange={ch("pourquoi")} />
        </>}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={() => { setAjout(null); setF({}); }} style={{ ...btnGhost, flex: 1 }}>Annuler</button>
          <button onClick={enregistrer} disabled={busy || !(f.titre || "").trim()} style={{ ...btnPrim, flex: 2, opacity: busy || !(f.titre || "").trim() ? 0.5 : 1 }}>{busy ? "…" : "✓ Enregistrer"}</button>
        </div>
      </Card>
    );
  };

  const TABS = [{ k: "culture", l: "Culture" }, { k: "protocoles", l: "Protocoles" }, { k: "documents", l: "Documents" }, { k: "videos", l: "Vidéos" }, { k: "decisions", l: "Décisions" }];
  const cats = ["Tous", ...Array.from(new Set(d.protocoles.map((p) => p.categorie).filter(Boolean)))];
  const protos = d.protocoles.filter((p) => (cat === "Tous" || p.categorie === cat) && (p.titre + " " + (p.pourquoi || "")).toLowerCase().includes(q.toLowerCase()));
  const docs = d.documents.filter((x) => (fonction === "toutes" || x.fonction === fonction) && (x.titre + " " + (x.categorie || "")).toLowerCase().includes(q.toLowerCase()));
  const principes = [1, 2, 3, 4].map((i) => (d.culture["principe_" + i] || "").split("|")).filter((x) => x[0]);
  const histoire = lignes(d.culture.histoire).map((l) => l.split("|"));

  return (
    <div style={shell}>
      <style>{`*{box-sizing:border-box}body{margin:0}.mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}input::placeholder,textarea::placeholder{color:rgba(58,14,51,.32)}`}</style>
      <header style={{ background: "#fff", borderBottom: `1px solid ${C.line}`, padding: "12px 16px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ lineHeight: 1, marginBottom: 10 }}><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700 }}>👑 MISS THANI</div><div style={{ fontSize: 9, letterSpacing: "2px", color: C.magenta, fontWeight: 700, marginTop: 3 }}>MÉMOIRE DE L'ACADÉMIE</div></div>
          <div className="mt-row" style={{ display: "flex", gap: 6, overflowX: "auto" }}>
            {TABS.map((t) => { const on = tab === t.k; return <button key={t.k} onClick={() => { setTab(t.k); setAjout(null); setQ(""); }} style={{ flexShrink: 0, padding: "7px 13px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{t.l}</button>; })}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "16px 16px 40px" }}>
        {msg && <div style={{ marginBottom: 12, padding: "10px 13px", borderRadius: 12, background: msg.startsWith("Erreur") ? "rgba(192,57,43,.10)" : "rgba(30,132,73,.10)", fontSize: 12.5, fontWeight: 700, color: msg.startsWith("Erreur") ? C.danger : C.green }}>{msg}</div>}

        {/* ---------- CULTURE ---------- */}
        {tab === "culture" && (
          <>
            <div style={{ borderRadius: 18, padding: "22px 20px", background: `linear-gradient(120deg, ${C.blush}, ${C.magenta})`, color: "#fff", marginBottom: 16 }}>
              <div style={{ fontSize: 22, opacity: 0.7 }}>“</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, lineHeight: 1.35 }}>{d.culture.citation}</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 10 }}>— {d.culture.auteur}</div>
            </div>
            <Titre>NOS PRINCIPES</Titre>
            {principes.map(([t, desc], i) => (
              <Card key={i} style={{ padding: 14, marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(229,36,126,.10)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                  <div><div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{t}</div><div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4, lineHeight: 1.6 }}>{desc}</div></div>
                </div>
              </Card>
            ))}
            <Titre>D'OÙ NOUS VENONS</Titre>
            <Card style={{ padding: "16px 18px" }}>
              {histoire.map(([a, t, desc], i) => (
                <div key={a} style={{ display: "flex", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <span style={{ width: 46, height: 24, borderRadius: 999, background: "rgba(229,36,126,.10)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 800 }}>{a}</span>
                    {i < histoire.length - 1 && <span style={{ width: 2, flex: 1, minHeight: 22, background: C.line, marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingBottom: i < histoire.length - 1 ? 14 : 0 }}><div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{t}</div><div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 2, lineHeight: 1.55 }}>{desc}</div></div>
                </div>
              ))}
            </Card>
          </>
        )}

        {/* ---------- PROTOCOLES ---------- */}
        {tab === "protocoles" && (
          <>
            {ajout === "protocole" ? <Form /> : <div style={{ display: "flex", gap: 8, marginBottom: 12 }}><input style={{ ...input, borderRadius: 999 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Chercher un protocole…" /><button onClick={() => { setAjout("protocole"); setF({}); }} style={btnPrim}>+</button></div>}
            <div className="mt-row" style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
              {cats.map((c) => { const on = cat === c; return <button key={c} onClick={() => setCat(c)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{c}</button>; })}
            </div>
            {protos.map((p) => { const on = ouvert === p.id; return (
              <Card key={p.id} style={{ overflow: "hidden", marginBottom: 10, borderColor: on ? "rgba(229,36,126,.40)" : C.line }}>
                <button onClick={() => setOuvert(on ? "" : p.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", background: on ? "rgba(229,36,126,.04)" : "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(229,36,126,.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>📋</span>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink, lineHeight: 1.3 }}>{p.titre}</div><div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 2 }}>{p.categorie} · mis à jour {fmt(p.maj_le)}</div></div>
                  <span style={{ color: C.inkFaint }}>{on ? "▾" : "›"}</span>
                </button>
                {on && (
                  <div style={{ padding: "0 15px 15px" }}>
                    {p.pourquoi && <div style={{ padding: "11px 13px", borderRadius: 12, background: "rgba(224,165,10,.09)", border: "1px solid rgba(224,165,10,.35)", marginBottom: 12 }}><div style={{ fontSize: 10.5, fontWeight: 800, color: "#9A7000", marginBottom: 4 }}>POURQUOI ON FAIT AINSI</div><div style={{ fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6 }}>{p.pourquoi}</div></div>}
                    {lignes(p.etapes).map((e, i) => (
                      <div key={i} style={{ display: "flex", gap: 11, padding: "7px 0", borderTop: i ? `1px solid ${C.line}` : "none" }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.55 }}>{e}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ); })}
          </>
        )}

        {/* ---------- DOCUMENTS ---------- */}
        {tab === "documents" && (
          <>
            {ajout === "document" ? <Form /> : <div style={{ display: "flex", gap: 8, marginBottom: 12 }}><input style={{ ...input, borderRadius: 999 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Chercher un document…" /><button onClick={() => { setAjout("document"); setF({}); }} style={btnPrim}>+</button></div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {FONCTIONS.map((fo) => { const on = fonction === fo.k; const n = d.documents.filter((x) => x.fonction === fo.k).length; return (
                <button key={fo.k} onClick={() => setFonction(on ? "toutes" : fo.k)} style={{ textAlign: "left", padding: "11px 12px", borderRadius: 13, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? "rgba(229,36,126,.07)" : C.card }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 18 }}>{fo.e}</span><span style={{ fontSize: 11, fontWeight: 800, color: C.inkFaint }}>{n}</span></div>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: on ? C.blush : C.ink, marginTop: 6 }}>{fo.l}</div>
                  <div style={{ fontSize: 10.5, color: C.inkSoft, marginTop: 2 }}>{fo.d}</div>
                </button>
              ); })}
            </div>
            {docs.map((x) => (
              <Card key={x.id} style={{ padding: 13, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  <span style={{ width: 36, height: 36, borderRadius: 11, background: "rgba(229,36,126,.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📄</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}><span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{x.titre}</span><Badge tone="neutral">{x.version}</Badge></div>
                    <div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 3 }}>{x.categorie || "—"} · mis à jour {fmt(x.maj_le)}</div>
                    {x.usage && <div style={{ marginTop: 8, padding: "8px 11px", borderRadius: 10, background: "rgba(224,165,10,.09)", border: "1px solid rgba(224,165,10,.30)", fontSize: 11.5, color: C.inkSoft, lineHeight: 1.5 }}>⏱ {x.usage}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                  {x.fichier_url ? <a href={x.fichier_url} target="_blank" rel="noopener noreferrer" style={{ ...btnPrim, padding: "7px 14px", fontSize: 11.5 }}>⬇ Ouvrir</a> : <Badge tone="warn">Fichier à déposer</Badge>}
                </div>
              </Card>
            ))}
          </>
        )}

        {/* ---------- VIDÉOS ---------- */}
        {tab === "videos" && (
          <>
            {ajout === "video" ? <Form /> : <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}><button onClick={() => { setAjout("video"); setF({}); }} style={btnPrim}>+ Ajouter une vidéo</button></div>}
            {d.videos.length === 0 && <Card style={{ padding: 22, textAlign: "center" }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune vidéo pour le moment. Filmez une fois, formez toutes celles qui arrivent après.</p></Card>}
            {d.videos.map((v) => (
              <Card key={v.id} style={{ padding: 13, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <a href={v.url || "#"} target="_blank" rel="noopener noreferrer" style={{ width: 64, height: 48, borderRadius: 11, background: "linear-gradient(150deg,#F2CFE0,#E8A9C6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: C.magenta, fontSize: 18, textDecoration: "none" }}>▶</a>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{v.titre}</div><div style={{ fontSize: 11, color: C.inkSoft, marginTop: 2 }}>{v.description}</div><div style={{ marginTop: 5, display: "flex", gap: 6 }}><Badge tone="info">{v.categorie}</Badge>{v.duree && <Badge tone="neutral">{v.duree}</Badge>}</div></div>
                </div>
              </Card>
            ))}
          </>
        )}

        {/* ---------- DÉCISIONS ---------- */}
        {tab === "decisions" && (
          <>
            {ajout === "decision" ? <Form /> : <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}><p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5, flex: 1 }}>Chaque règle est née d'une situation réelle. On garde la raison, pour ne pas défaire demain ce qu'on a compris hier.</p><button onClick={() => { setAjout("decision"); setF({}); }} style={{ ...btnPrim, marginLeft: 10 }}>+</button></div>}
            <Card style={{ padding: "16px 18px" }}>
              {d.decisions.map((x, i) => (
                <div key={x.id} style={{ display: "flex", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: i === 0 ? C.magenta : C.line, marginTop: 5 }} />
                    {i < d.decisions.length - 1 && <span style={{ width: 2, flex: 1, minHeight: 26, background: C.line, marginTop: 4 }} />}
                  </div>
                  <div style={{ paddingBottom: i < d.decisions.length - 1 ? 18 : 0 }}>
                    <div style={{ fontSize: 10.5, color: C.inkFaint, fontWeight: 700, letterSpacing: ".3px" }}>{fmt(x.date_dec).toUpperCase()} · {x.prise_par}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginTop: 3 }}>{x.titre}</div>
                    {x.pourquoi && <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 4, lineHeight: 1.6 }}>{x.pourquoi}</div>}
                  </div>
                </div>
              ))}
              {d.decisions.length === 0 && <p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft }}>Aucune décision notée.</p>}
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
