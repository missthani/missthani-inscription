import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — ESPACE CARLA  (/carla)
   Assistante : questions, réponses, prise de contact
   ============================================================ */

const C = {
  ink: "#2B1F2E", inkSoft: "rgba(43,31,46,.62)", inkFaint: "rgba(43,31,46,.42)",
  blush: "#E5247E", magenta: "#C2238E", rose: "#FCE9F3", rose2: "#FDF5F9",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.13)",
};
const DEF_BIENVENUE = "Bonjour ! Je suis Carla, l'assistante de Miss Thani. Je réponds à vos questions sur les formations, les prix et les inscriptions. Par quoi voulez-vous commencer ?";
const DEF_Q = ["Quelles formations proposez-vous ?", "Combien ça coûte ?", "Quand commence la prochaine session ?", "Où êtes-vous situées ?", "Je veux m'inscrire", "Puis-je parler à quelqu'un ?"];

function telOk(v) { let d = String(v || "").replace(/\D/g, ""); if (d.startsWith("00")) d = d.slice(2); if (d.length === 11 && d.startsWith("509")) d = d.slice(3); return /^[234]\d{7}$/.test(d) ? d : ""; }
function refPartenaire() { try { const u = new URLSearchParams(window.location.search || ""); const r = (u.get("ref") || u.get("a") || "").trim(); if (r) { localStorage.setItem("mt_ref", r); return r; } return localStorage.getItem("mt_ref") || ""; } catch (e) { return ""; } }
function useLarge() { const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1000); useEffect(() => { const f = () => setW(window.innerWidth); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []); return w >= 820; }

const input = { width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.4px solid ${C.line}`, background: "#fff", color: C.ink, fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none" };
const btnPrim = { border: "none", borderRadius: 999, padding: "12px 18px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 13.5, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Inter',sans-serif", textDecoration: "none" };
const btnGhost = { border: `1.4px solid ${C.line}`, borderRadius: 999, padding: "11px 16px", background: "#fff", color: C.ink, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Inter',sans-serif", textDecoration: "none" };

export default function Carla() {
  const large = useLarge();
  const [params, setParams] = useState({ nom: "MISS THANI", whatsapp: "50946433016", carla_bienvenue: DEF_BIENVENUE, moncash: "509 4643 3016" });
  const [reponses, setReponses] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [suggestions, setSuggestions] = useState(DEF_Q);
  const [draft, setDraft] = useState("");
  const [ecrit, setEcrit] = useState(false);
  const [contact, setContact] = useState({ ouvert: false, nom: "", whatsapp: "", envoye: false, erreur: "" });
  const convRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    (async () => {
      const [pa, re] = await Promise.all([
        supabase.from("parametres").select("cle, valeur").in("cle", ["nom", "whatsapp", "carla_bienvenue", "moncash", "adresse", "telephone"]),
        supabase.from("carla_reponses").select("*").eq("visible", true).order("ordre"),
      ]);
      const v = { ...params }; (pa.data || []).forEach((x) => { if (x.valeur) v[x.cle] = x.valeur; });
      setParams(v);
      const r = re.data || [];
      setReponses(r);
      if (r.length) setSuggestions(r.slice(0, 4).map((x) => x.question));
      setMsgs([{ a: "carla", t: v.carla_bienvenue || DEF_BIENVENUE }]);
    })();
  }, []);
  useEffect(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs, ecrit]);

  const assurerConv = async () => {
    if (convRef.current) return convRef.current;
    const { data } = await supabase.from("carla_conversations").insert({ etiquette: refPartenaire() || null }).select().single();
    convRef.current = data ? data.id : null;
    return convRef.current;
  };
  const noter = async (auteur, texte) => { try { const id = await assurerConv(); if (id) await supabase.from("carla_messages").insert({ conversation_id: id, auteur, texte }); } catch (e) {} };

  const repondre = (question) => {
    const r = reponses.find((x) => x.question === question);
    const txt = r ? r.reponse : "Merci pour votre message ! Une personne de l'équipe vous répond très vite. Vous pouvez aussi nous écrire sur WhatsApp.";
    setEcrit(true);
    setTimeout(() => {
      setEcrit(false);
      setMsgs((m) => [...m, { a: "carla", t: txt }]);
      noter("carla", txt);
      if (r && r.suite) setSuggestions(r.suite.split("|").filter(Boolean));
      else setSuggestions(reponses.length ? reponses.map((x) => x.question).filter((x) => x !== question).slice(0, 4) : DEF_Q);
      if (/inscrire/i.test(question)) setMsgs((m) => [...m, { a: "action", t: "inscription" }]);
      if (/parler|quelqu/i.test(question)) setContact((c) => ({ ...c, ouvert: true }));
    }, 700);
  };

  const envoyer = (texte) => {
    const t = (texte || draft).trim();
    if (!t) return;
    setMsgs((m) => [...m, { a: "moi", t }]);
    noter("visiteuse", t);
    setDraft("");
    repondre(t);
  };

  const envoyerContact = async () => {
    if (!contact.nom.trim()) { setContact({ ...contact, erreur: "Indiquez votre nom." }); return; }
    if (!telOk(contact.whatsapp)) { setContact({ ...contact, erreur: "Numéro WhatsApp invalide (8 chiffres)." }); return; }
    const id = await assurerConv();
    if (id) await supabase.from("carla_conversations").update({ nom: contact.nom.trim(), whatsapp: telOk(contact.whatsapp) }).eq("id", id);
    setContact({ ...contact, envoye: true, erreur: "" });
    setMsgs((m) => [...m, { a: "carla", t: `Merci ${contact.nom.split(" ")[0]} ! Une personne de l'équipe vous écrit sur WhatsApp très bientôt.` }]);
  };

  const Bulle = ({ m }) => {
    if (m.a === "action") return (
      <div style={{ display: "flex", gap: 8, margin: "2px 0 6px", flexWrap: "wrap" }}>
        <a href="/inscription" style={btnPrim}>📝 Aller à l'inscription</a>
        <a href="/boutique" style={btnGhost}>🛍️ Voir la boutique</a>
      </div>
    );
    const moi = m.a === "moi";
    return (
      <div style={{ display: "flex", justifyContent: moi ? "flex-end" : "flex-start", gap: 9, alignItems: "flex-end" }}>
        {!moi && <span style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>C</span>}
        <div style={{ maxWidth: "78%", padding: "11px 14px", borderRadius: 16, borderBottomRightRadius: moi ? 5 : 16, borderBottomLeftRadius: moi ? 16 : 5, background: moi ? `linear-gradient(135deg, ${C.blush}, ${C.magenta})` : "#fff", color: moi ? "#fff" : C.ink, fontSize: 13.5, lineHeight: 1.6, border: moi ? "none" : `1px solid ${C.line}`, boxShadow: moi ? "0 6px 16px rgba(229,36,126,.22)" : "0 4px 14px rgba(142,44,154,.06)" }}>{m.t}</div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${C.rose2} 0%, ${C.rose} 100%)`, fontFamily: "'Inter',sans-serif", color: C.ink }}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{margin:0}
        .mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}
        input::placeholder{color:rgba(43,31,46,.35)}
        @keyframes pt{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}}
        .pt span{display:inline-block;width:6px;height:6px;border-radius:50%;background:${C.magenta};margin:0 2px;animation:pt 1.1s infinite}
        .pt span:nth-child(2){animation-delay:.15s}.pt span:nth-child(3){animation-delay:.3s}
      `}</style>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: large ? "24px 24px 120px" : "16px 16px 110px" }}>
        {/* Antèt */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <a href="/" style={{ ...btnGhost, padding: "8px 12px", fontSize: 12.5 }}>‹</a>
          <div style={{ flex: 1, textAlign: "center", lineHeight: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700 }}>👑 {params.nom}</div>
            <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 19, color: C.blush, marginTop: -1 }}>Carla, votre assistante</div>
          </div>
          <a href={`https://wa.me/${params.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, padding: "8px 12px", fontSize: 13, color: C.green, borderColor: "rgba(30,132,73,.35)" }}>💬</a>
        </div>

        {/* Kat Carla */}
        <div style={{ borderRadius: 20, overflow: "hidden", background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 14px 36px rgba(142,44,154,.10)" }}>
          <div style={{ background: `linear-gradient(120deg, ${C.blush}, ${C.magenta})`, padding: large ? "20px 22px" : "16px 18px", color: "#fff", display: "flex", alignItems: "center", gap: 13, position: "relative", overflow: "hidden" }}>
            <div aria-hidden style={{ position: "absolute", right: -30, bottom: -40, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
            <span style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,.95)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, flexShrink: 0, position: "relative" }}>C</span>
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Carla</div>
              <div style={{ fontSize: 11.5, opacity: .92, display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}><span style={{ width: 7, height: 7, borderRadius: 999, background: "#4ADE80" }} /> En ligne · répond tout de suite</div>
            </div>
          </div>

          <div ref={listRef} className="mt-row" style={{ height: large ? 400 : 340, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 10, background: C.rose2 }}>
            {msgs.map((m, i) => <Bulle key={i} m={m} />)}
            {ecrit && <div style={{ display: "flex", gap: 9, alignItems: "flex-end" }}><span style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 700 }}>C</span><div className="pt" style={{ padding: "12px 16px", borderRadius: 16, borderBottomLeftRadius: 5, background: "#fff", border: `1px solid ${C.line}` }}><span /><span /><span /></div></div>}

            {contact.ouvert && !contact.envoye && (
              <div style={{ background: "#fff", border: `1.4px solid ${C.blush}`, borderRadius: 16, padding: 14, marginTop: 4 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.blush, marginBottom: 10 }}>LAISSEZ-MOI VOS COORDONNÉES</div>
                <input style={{ ...input, marginBottom: 8 }} placeholder="Votre nom" value={contact.nom} onChange={(e) => setContact({ ...contact, nom: e.target.value, erreur: "" })} />
                <input style={input} inputMode="tel" placeholder="WhatsApp — 3712 3456" value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value, erreur: "" })} />
                {contact.erreur && <p style={{ color: C.danger, fontSize: 12, margin: "8px 0 0" }}>{contact.erreur}</p>}
                <button onClick={envoyerContact} style={{ ...btnPrim, width: "100%", marginTop: 10 }}>Envoyer</button>
              </div>
            )}
          </div>

          {/* Sijesyon */}
          {suggestions.length > 0 && (
            <div className="mt-row" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "12px 16px 4px", background: C.rose2 }}>
              {suggestions.map((s) => <button key={s} onClick={() => envoyer(s)} style={{ flexShrink: 0, padding: "9px 15px", borderRadius: 999, border: `1.3px solid ${C.blush}`, background: "#fff", color: C.blush, fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{s}</button>)}
            </div>
          )}

          {/* Chan ekri */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 16px 16px", background: C.rose2 }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") envoyer(); }} placeholder="Écrivez votre question…" style={{ ...input, borderRadius: 999, background: "#fff" }} />
            <button onClick={() => envoyer()} aria-label="Envoyer" style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 17, cursor: "pointer", flexShrink: 0, boxShadow: "0 8px 18px rgba(229,36,126,.30)" }}>➤</button>
          </div>
        </div>

        {/* Rakoursi */}
        <div style={{ display: "grid", gridTemplateColumns: large ? "repeat(3,1fr)" : "1fr", gap: 12, marginTop: 16 }}>
          {[["📝", "M'inscrire", "Quatre étapes, deux minutes", "/inscription"], ["🛍️", "La boutique", "Kits, matériel et uniformes", "/boutique"], ["💬", "WhatsApp", "Parler à l'équipe directement", `https://wa.me/${params.whatsapp}`]].map(([e, t, s, h]) => (
            <a key={t} href={h} target={h.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.line}`, padding: 14, textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: C.rose, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{e}</span>
              <span><span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: C.ink }}>{t}</span><span style={{ display: "block", fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>{s}</span></span>
            </a>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 11, color: C.inkFaint, marginTop: 18, lineHeight: 1.6 }}>Carla répond aux questions courantes. Pour un cas particulier, l'équipe vous répond sur WhatsApp.</p>
      </div>
    </div>
  );
}
