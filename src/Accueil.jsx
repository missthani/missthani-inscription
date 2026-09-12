import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — PAGE D'ACCUEIL (vitrine)  "/"
   ============================================================ */

const C = {
  ink: "#2B1F2E", inkSoft: "rgba(43,31,46,.62)", inkFaint: "rgba(43,31,46,.42)",
  blush: "#E5247E", magenta: "#C2238E", rose: "#FCE9F3", rose2: "#FDF5F9",
  gold: "#C9A227", noir: "#231A26", line: "rgba(142,44,154,.13)",
};
const D = {
  nom: "MISS THANI", sous_titre: "MAKE-UP & LACE CLUB",
  hero_sur_titre: "APPRENDRE · SE FORMER · RÉUSSIR", hero_titre: "Plus qu'une école,", hero_titre_script: "une communauté !",
  hero_texte: "Miss Thani Make-up & Lace Club est un espace dédié à la formation, à la beauté et à l'épanouissement personnel. Découvrez nos formations, notre boutique et tous nos services pour révéler votre potentiel.",
  hero_bouton: "Découvrir notre univers", hero_image: "", hero_mode: "fond",
  formations_titre: "Nos Formations", formations_texte: "Apprenez auprès de professionnelles passionnées et développez vos talents avec des formations de qualité.",
  boutique_titre: "La beauté à portée de main", boutique_texte: "Retrouvez vos produits préférés, accessoires et indispensables beauté.",
  services_titre: "Nos Services", services_texte: "Des prestations adaptées à vos besoins pour une beauté complète et durable.",
  temoignages_titre: "Ils nous font confiance", temoignages_texte: "Votre satisfaction est notre plus belle récompense.",
  signature: "Forme · Sublime · Réussis", slogan_bas: "Votre beauté, notre passion ♡",
  email: "missthanimakeupclub@gmail.com", telephone: "+509 4643 3016", adresse: "Pétion-Ville, Haïti",
  instagram: "", facebook: "", tiktok: "", pied: "Miss Thani Make-up & Lace Club · Pétion-Ville",
};
const EMO = { Onglerie: "💅", Maquillage: "💄", Tresse: "🎀", "Tresse africaine": "🎀", Dreadlocks: "🧶", "Flè": "🌸", Accessoires: "👜" };
const emo = (n) => EMO[n] || (/ongl/i.test(n) ? "💅" : /maqui/i.test(n) ? "💄" : /tress/i.test(n) ? "🎀" : /dread|loc/i.test(n) ? "🧶" : "🌸");
const TINTS = ["linear-gradient(150deg,#F7DCEB,#E8A9C6)", "linear-gradient(150deg,#FBE4EE,#F0B9D3)", "linear-gradient(150deg,#EFD6C6,#D8AE92)", "linear-gradient(150deg,#E9D8EE,#C9A2C6)", "linear-gradient(150deg,#FDEBD8,#EFC79A)"];

/* Paj akèy la afiche menm jan sou telefòn ak sou òdinatè:
   nou di navigatè a gade paj la kòm yon ekran 1160 px, epi li zoume l. */
function useLarge(bp = 900) {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => { const f = () => setW(window.innerWidth); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []);
  return w >= bp;
}

const T = typeof window !== "undefined" && window.innerWidth < 760 ? 1.18 : 1;   /* miltiplikatè tèks */
const px = (n) => Math.round(n * T);
const btn = (bg, col) => ({ display: "inline-flex", alignItems: "center", gap: 8, padding: `${px(14)}px ${px(26)}px`, borderRadius: 999, background: bg, color: col, fontSize: px(14), fontWeight: 700, textDecoration: "none", border: "none", cursor: "pointer", fontFamily: "'Inter',sans-serif" });

export default function Accueil() {
  const large = useLarge();
  const mid = useLarge(640);
  const [p, setP] = useState(D);
  const [programmes, setProgrammes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [services, setServices] = useState([]);
  const [temoins, setTemoins] = useState([]);
  const [menu, setMenu] = useState(false);
  const [ti, setTi] = useState(0);

  useEffect(() => {
    (async () => {
      const [pa, pg, pr, se, te] = await Promise.all([
        supabase.from("parametres").select("cle, valeur"),
        supabase.from("programmes").select("*").eq("actif", true).order("ordre"),
        supabase.from("produits").select("*").eq("visible", true).order("ordre").limit(5),
        supabase.from("services").select("*").eq("visible", true).order("ordre"),
        supabase.from("temoignages").select("*").eq("visible", true).order("ordre"),
      ]);
      const v = { ...D }; (pa.data || []).forEach((x) => { if (x.valeur) v[x.cle] = x.valeur; });
      setP(v); setProgrammes(pg.data || []); setProduits(pr.data || []); setServices(se.data || []); setTemoins(te.data || []);
    })();
  }, []);

  const NAV = [["Accueil", "/"], ["À propos", "#apropos"], ["Formations", "#formations"], ["Boutique", "/boutique"], ["Services", "#services"], ["Contact", "#contact"]];
  const wrap = { maxWidth: 1120, margin: "0 auto", padding: large ? "0 32px" : "0 18px" };
  const visibles = temoins.length ? (large ? temoins.slice(ti, ti + 3).concat(temoins.slice(0, Math.max(0, ti + 3 - temoins.length))) : [temoins[ti % temoins.length]]) : [];

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", color: C.ink, background: "#fff" }}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{margin:0}
        html{scroll-behavior:smooth}
        .mt-row::-webkit-scrollbar{display:none}.mt-row{scrollbar-width:none}
        .mt-card{transition:transform .2s ease, box-shadow .2s ease}
        .mt-card:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(142,44,154,.14)}
        a{color:inherit}
      `}</style>

      {/* ================= ANTÈT ================= */}
      <header style={{ borderBottom: `1px solid ${C.line}`, background: "#fff", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", height: 68, gap: 14 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span style={{ fontSize: 30 }}>👑</span>
            <span style={{ lineHeight: 1.05 }}>
              <span style={{ display: "block", fontFamily: "'Cormorant Garamond',serif", fontSize: px(21), fontWeight: 700, letterSpacing: ".5px" }}>{p.nom}</span>
              <span style={{ display: "block", fontSize: 8.5, fontWeight: 800, letterSpacing: "1.8px", color: C.blush }}>{p.sous_titre}</span>
            </span>
          </a>
          {large && (
            <nav style={{ display: "flex", gap: 24 }}>
              {NAV.map(([l, h], i) => <a key={l} href={h} style={{ fontSize: px(14.5), fontWeight: i === 0 ? 700 : 500, color: i === 0 ? C.blush : C.ink, textDecoration: "none", borderBottom: i === 0 ? `2px solid ${C.blush}` : "2px solid transparent", paddingBottom: 4 }}>{l}</a>)}
            </nav>
          )}
          <button onClick={() => setMenu(true)} aria-label="Options" style={{ width: px(42), height: px(42), borderRadius: 12, background: C.rose, border: "none", fontSize: px(17), cursor: "pointer", color: C.blush, flexShrink: 0 }}>☰</button>
        </div>
      </header>

      {/* ================= PANÈL OPTIONS ================= */}
      {menu && (
        <div onClick={() => setMenu(false)} style={{ position: "fixed", inset: 0, background: "rgba(43,31,46,.5)", zIndex: 90, display: "flex", justifyContent: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: large ? 380 : "88%", maxWidth: 400, height: "100%", background: "#fff", overflowY: "auto", padding: "18px 18px 40px", boxShadow: "-10px 0 30px rgba(43,31,46,.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ lineHeight: 1.05 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: px(18), fontWeight: 700 }}>👑 {p.nom}</div>
                <div style={{ fontSize: px(9), fontWeight: 800, letterSpacing: "1.8px", color: C.blush, marginTop: 3 }}>{p.sous_titre}</div>
              </div>
              <button onClick={() => setMenu(false)} style={{ width: px(36), height: px(36), borderRadius: 10, border: "none", background: C.rose, fontSize: px(15), cursor: "pointer", color: C.blush }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 18 }}>
              <a href="/inscription" style={{ ...btn(C.blush, "#fff"), justifyContent: "center" }}>📝 S'inscrire</a>
              <a href="/boutique" style={{ ...btn(C.rose, C.blush), justifyContent: "center" }}>🛍️ Boutique</a>
            </div>

            <div style={{ fontSize: px(10.5), fontWeight: 800, letterSpacing: "1.5px", color: C.inkFaint, marginBottom: 8 }}>NAVIGUER</div>
            {[["🏠", "Accueil", "/"], ["🎓", "Nos formations", "#formations"], ["✨", "Nos services", "#services"], ["💬", "Parler à Carla", "/carla"], ["👤", "Mon espace étudiante", "/etudiante"], ["📞", "Nous contacter", "#contact"]].map(([e, l, h]) => (
              <a key={l} href={h} onClick={() => setMenu(false)} style={{ display: "flex", alignItems: "center", gap: 12, padding: `${px(12)}px 4px`, textDecoration: "none", borderBottom: `1px solid ${C.line}` }}>
                <span style={{ width: px(34), height: px(34), borderRadius: 10, background: C.rose, display: "flex", alignItems: "center", justifyContent: "center", fontSize: px(16), flexShrink: 0 }}>{e}</span>
                <span style={{ fontSize: px(14.5), fontWeight: 600, color: C.ink }}>{l}</span>
                <span style={{ marginLeft: "auto", color: C.inkFaint }}>›</span>
              </a>
            ))}

            <div style={{ fontSize: px(10.5), fontWeight: 800, letterSpacing: "1.5px", color: C.inkFaint, margin: "20px 0 8px" }}>ESPACE ÉQUIPE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {[["Professeur", "/professeur"], ["Secrétariat", "/secretariat"], ["Boutique", "/gestion-boutique"], ["Agent", "/agent"], ["Affiliation", "/affiliation"], ["Ambassadrice", "/ambassadrice"], ["Admin", "/admin"]].map(([l, h]) => (
                <a key={l} href={h} style={{ padding: `${px(7)}px ${px(13)}px`, borderRadius: 999, border: `1.3px solid ${C.line}`, fontSize: px(12), fontWeight: 700, color: C.inkSoft, textDecoration: "none" }}>{l}</a>
              ))}
            </div>

            <div style={{ marginTop: 22, padding: `${px(14)}px`, borderRadius: 14, background: C.rose }}>
              <div style={{ fontSize: px(12.5), fontWeight: 800, color: C.ink, marginBottom: 8 }}>Nous joindre</div>
              {[["📞", p.telephone], ["✉️", p.email], ["📍", p.adresse]].map(([e, v]) => <div key={v} style={{ display: "flex", gap: 8, fontSize: px(12.5), color: C.inkSoft, padding: "3px 0" }}><span>{e}</span>{v}</div>)}
              <a href={`https://wa.me/${(p.whatsapp || "50946433016").replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ ...btn("#25D366", "#fff"), width: "100%", justifyContent: "center", marginTop: 10 }}>💬 WhatsApp</a>
            </div>
          </div>
        </div>
      )}

      {/* ================= BANYÈ ================= */}
      {p.hero_image && p.hero_mode === "image_seule" ? (
        <section style={{ position: "relative" }}>
          <img src={p.hero_image} alt={p.hero_titre} style={{ display: "block", width: "100%", height: "auto" }} />
          {/* Bouton sou imaj la (sou gwo ekran li poze sou bouton ki desine a) */}
          <div style={{ ...wrap, position: large ? "absolute" : "static", left: 0, right: 0, bottom: large ? "12%" : undefined, padding: large ? "0 32px" : "14px 18px 0", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="#formations" style={{ ...btn(C.blush, "#fff"), opacity: large ? 0 : 1, pointerEvents: large ? "none" : "auto" }}>{p.hero_bouton} →</a>
            <a href="/inscription" style={btn("#fff", C.blush)}>S'inscrire</a>
          </div>
          {large && <a href="#formations" aria-label={p.hero_bouton} style={{ position: "absolute", left: "6%", bottom: "14%", width: "17%", height: "13%", borderRadius: 999 }} />}
        </section>
      ) : (
        <section style={{ position: "relative", background: p.hero_image ? `url(${p.hero_image}) center/cover` : "linear-gradient(100deg,#FDF0F6 0%,#FBE4EE 52%,#F5C9DC 100%)", overflow: "hidden" }}>
          {p.hero_image && <div aria-hidden style={{ position: "absolute", inset: 0, background: large ? "linear-gradient(90deg, rgba(255,250,252,.88) 0%, rgba(255,248,251,.62) 30%, rgba(255,248,251,.12) 52%, rgba(255,248,251,0) 68%)" : "linear-gradient(180deg, rgba(255,250,252,.90) 0%, rgba(255,248,251,.74) 45%, rgba(255,248,251,.30) 100%)" }} />}
          <div style={{ ...wrap, position: "relative", display: "grid", gridTemplateColumns: large ? "1.05fr .95fr" : "1fr", alignItems: "center", minHeight: large ? 460 : 380, padding: large ? "48px 32px" : "34px 18px" }}>
            <div style={{ maxWidth: 480, textShadow: p.hero_image ? "0 1px 14px rgba(255,255,255,.85)" : "none" }}>
              <div style={{ fontSize: px(11.5), fontWeight: 800, letterSpacing: "3px", color: C.blush }}>{p.hero_sur_titre}</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: px(46), fontWeight: 700, lineHeight: 1.08, margin: "12px 0 0" }}>{p.hero_titre}</h1>
              <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: px(40), color: C.blush, lineHeight: 1.1, marginTop: 2 }}>{p.hero_titre_script}</div>
              <p style={{ fontSize: px(15), color: C.inkSoft, lineHeight: 1.75, margin: "16px 0 0" }}>{p.hero_texte}</p>
              <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
                <a href="#formations" style={btn(C.blush, "#fff")}>{p.hero_bouton} →</a>
                <a href="/inscription" style={btn("#fff", C.blush)}>S'inscrire</a>
              </div>
            </div>
            {large && !p.hero_image && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <div style={{ textAlign: "center", padding: "28px 34px", borderRadius: 20, background: "rgba(255,255,255,.5)", border: "1px solid rgba(255,255,255,.8)" }}>
                  <div style={{ fontSize: 44, color: C.gold }}>♛</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 700, letterSpacing: "1px", color: C.noir, marginTop: 4 }}>{p.nom}</div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "3px", color: C.blush, marginTop: 4 }}>{p.sous_titre}</div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= 5 PILYE ================= */}
      <section style={{ background: C.rose2, borderBottom: `1px solid ${C.line}` }}>
        <div className="mt-row" style={{ ...wrap, display: "flex", gap: 0, overflowX: "auto", padding: large ? "26px 32px" : "20px 18px" }}>
          {[["🎓", "Formations", "Professionnelles & certifiantes", "#formations"], ["🛍️", "Boutique", "Produits de beauté & accessoires", "/boutique"], ["🍴", "Services", "Soins & prestations beauté", "#services"], ["👥", "Communauté", "Un réseau qui vous soutient", "#apropos"], ["♡", "Accompagnement", "De l'apprentissage à la réussite", "#apropos"]].map(([e, t, s, h], i, arr) => (
            <a key={t} href={h} style={{ flex: 1, minWidth: 150, textAlign: "center", padding: "6px 14px", textDecoration: "none", borderRight: i < arr.length - 1 && large ? `1px solid ${C.line}` : "none" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.rose, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{e}</div>
              <div style={{ fontSize: px(15), fontWeight: 700, marginTop: 9 }}>{t}</div>
              <div style={{ fontSize: px(12), color: C.inkFaint, marginTop: 3, lineHeight: 1.4 }}>{s}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ================= FÒMASYON ================= */}
      <section id="formations" style={{ ...wrap, padding: large ? "60px 32px" : "40px 18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: large ? "300px 1fr" : "1fr", gap: large ? 40 : 22, alignItems: "start" }}>
          <div>
            <div style={{ width: 46, height: 3, background: C.gold, marginBottom: 14 }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: px(34), fontWeight: 700, margin: 0 }}>{p.formations_titre}</h2>
            <p style={{ fontSize: px(15), color: C.inkSoft, lineHeight: 1.7, margin: "12px 0 20px" }}>{p.formations_texte}</p>
            <a href="/app" style={btn("#fff", C.blush)}>Voir toutes les formations →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: large ? "repeat(4,1fr)" : mid ? "repeat(2,1fr)" : "repeat(2,1fr)", gap: 14 }}>
            {programmes.slice(0, 4).map((g, i) => (
              <a key={g.id} href="/app" className="mt-card" style={{ borderRadius: 14, overflow: "hidden", background: "#fff", border: `1px solid ${C.line}`, textDecoration: "none", boxShadow: "0 6px 18px rgba(142,44,154,.06)" }}>
                <div style={{ aspectRatio: "1 / .95", background: TINTS[i % TINTS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>{emo(g.nom)}</div>
                <div style={{ padding: "12px 13px 14px" }}>
                  <div style={{ fontSize: px(15.5), fontWeight: 700 }}>{g.nom}</div>
                  <div style={{ fontSize: px(12.5), color: C.inkFaint, marginTop: 3 }}>{g.duree || "Formation certifiante"}</div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}><span style={{ width: 26, height: 26, borderRadius: "50%", background: C.blush, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>→</span></div>
                </div>
              </a>
            ))}
            {programmes.length === 0 && <div style={{ gridColumn: "1 / -1", padding: 26, textAlign: "center", color: C.inkSoft, fontSize: 13, border: `1px dashed ${C.line}`, borderRadius: 14 }}>Les formations s'afficheront ici.</div>}
          </div>
        </div>
      </section>

      {/* ================= BOUTIK ================= */}
      <section style={{ background: C.rose }}>
        <div style={{ ...wrap, display: "grid", gridTemplateColumns: large ? ".8fr 1fr 1.2fr" : "1fr", gap: large ? 32 : 20, alignItems: "center", padding: large ? "44px 32px" : "32px 18px" }}>
          {large && <div style={{ aspectRatio: "1 / 1", borderRadius: 16, background: "linear-gradient(150deg,#F7DCEB,#E8A9C6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>💄</div>}
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "2.5px", color: C.blush }}>NOTRE BOUTIQUE</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: px(32), fontWeight: 700, margin: "8px 0 0", lineHeight: 1.15 }}>{p.boutique_titre}</h2>
            <div style={{ width: 46, height: 2, background: C.blush, margin: "12px 0" }} />
            <p style={{ fontSize: px(15), color: C.inkSoft, lineHeight: 1.7, margin: "0 0 18px" }}>{p.boutique_texte}</p>
            <a href="/boutique" style={btn("#fff", C.blush)}>Découvrir la boutique →</a>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: large ? "20px 18px" : "16px 14px" }}>
            <div className="mt-row" style={{ display: "flex", gap: 12, overflowX: "auto" }}>
              {(produits.length ? produits : [{ id: 1, nom: "Maquillage", emoji: "💄" }, { id: 2, nom: "Soins visage", emoji: "🧴" }, { id: 3, nom: "Onglerie", emoji: "💅" }, { id: 4, nom: "Accessoires", emoji: "👜" }, { id: 5, nom: "Cheveux", emoji: "🧴" }]).map((x, i) => (
                <a key={x.id} href="/boutique" style={{ flexShrink: 0, width: 92, textAlign: "center", textDecoration: "none" }}>
                  <div style={{ width: 92, height: 92, borderRadius: 12, background: x.image_url ? `url(${x.image_url}) center/cover` : TINTS[i % TINTS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>{!x.image_url && (x.emoji || "📦")}</div>
                  <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 7, lineHeight: 1.3 }}>{(x.categorie || x.nom || "").slice(0, 22)}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SÈVIS ================= */}
      <section id="services" style={{ ...wrap, padding: large ? "56px 32px" : "38px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: px(32), fontWeight: 700, margin: 0 }}>{p.services_titre}</h2>
            <p style={{ fontSize: px(14.5), color: C.inkSoft, margin: "8px 0 0" }}>{p.services_texte}</p>
          </div>
          <a href="#contact" style={btn("#fff", C.blush)}>Voir tous les services →</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: large ? "repeat(4,1fr)" : "repeat(2,1fr)", gap: 14 }}>
          {services.map((s, i) => (
            <a key={s.id} href="#contact" className="mt-card" style={{ position: "relative", aspectRatio: "1 / .78", borderRadius: 14, overflow: "hidden", background: s.image_url ? `url(${s.image_url}) center/cover` : TINTS[i % TINTS.length], textDecoration: "none", display: "block" }}>
              <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(43,31,46,0) 35%, rgba(43,31,46,.62) 100%)" }} />
              {!s.image_url && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, opacity: .85 }}>{s.emoji}</span>}
              <span style={{ position: "absolute", left: 13, bottom: 12, color: "#fff" }}>
                <span style={{ display: "block", fontSize: px(15.5), fontWeight: 700 }}>{s.titre}</span>
                <span style={{ display: "block", fontSize: px(12.5), opacity: .9, marginTop: 2 }}>{s.sous_titre}</span>
              </span>
              <span style={{ position: "absolute", right: 12, bottom: 12, width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,.9)", color: C.blush, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>+</span>
            </a>
          ))}
          {services.length === 0 && <div style={{ gridColumn: "1 / -1", padding: 26, textAlign: "center", color: C.inkSoft, fontSize: 13, border: `1px dashed ${C.line}`, borderRadius: 14 }}>Ajoutez vos services dans Supabase → services.</div>}
        </div>
      </section>

      {/* ================= TEMWAYAJ ================= */}
      <section id="apropos" style={{ background: C.rose2, borderTop: `1px solid ${C.line}` }}>
        <div style={{ ...wrap, padding: large ? "50px 32px" : "36px 18px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: px(30), fontWeight: 700, margin: 0 }}>{p.temoignages_titre}</h2>
              <p style={{ fontSize: px(14.5), color: C.inkSoft, margin: "7px 0 0" }}>{p.temoignages_texte}</p>
            </div>
            {temoins.length > 1 && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setTi((i) => (i - 1 + temoins.length) % temoins.length)} style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer" }}>←</button>
                <button onClick={() => setTi((i) => (i + 1) % temoins.length)} style={{ width: 34, height: 34, borderRadius: "50%", border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer" }}>→</button>
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: large ? "repeat(3,1fr)" : "1fr", gap: 14 }}>
            {visibles.map((t, i) => t && (
              <div key={t.id + "-" + i} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.line}`, padding: 16, display: "flex", gap: 13 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: t.photo_url ? `url(${t.photo_url}) center/cover` : C.rose, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: C.blush, fontWeight: 800 }}>{!t.photo_url && (t.nom || "?")[0]}</div>
                <div>
                  <div style={{ fontSize: px(14), color: C.inkSoft, lineHeight: 1.65, fontStyle: "italic" }}>"{t.texte}"</div>
                  <div style={{ fontSize: px(13.5), fontWeight: 700, marginTop: 8 }}>— {t.nom}</div>
                  <div style={{ color: C.gold, fontSize: 12, marginTop: 3 }}>{"★".repeat(t.note || 5)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PYE PAJ ================= */}
      <footer id="contact" style={{ background: C.noir, color: "#fff" }}>
        <div style={{ ...wrap, display: "grid", gridTemplateColumns: large ? "1.3fr 1fr 1.2fr 1.2fr" : "1fr", gap: large ? 30 : 24, padding: large ? "44px 32px" : "32px 18px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>👑</span>
              <span style={{ lineHeight: 1.05 }}>
                <span style={{ display: "block", fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 700, letterSpacing: ".5px" }}>{p.nom}</span>
                <span style={{ display: "block", fontSize: 8.5, fontWeight: 800, letterSpacing: "1.8px", color: C.blush }}>{p.sous_titre}</span>
              </span>
            </div>
            <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 22, color: C.blush, marginTop: 14 }}>{p.signature}</div>
          </div>
          <div>
            <div style={{ fontSize: px(14), fontWeight: 700, marginBottom: 12 }}>Liens rapides</div>
            {NAV.map(([l, h]) => <a key={l} href={h} style={{ display: "block", fontSize: px(14), color: "rgba(255,255,255,.68)", textDecoration: "none", padding: "4px 0" }}>{l}</a>)}
          </div>
          <div>
            <div style={{ fontSize: px(14), fontWeight: 700, marginBottom: 12 }}>Plus d'infos</div>
            {[["📞", p.telephone], ["✉️", p.email], ["📍", p.adresse]].map(([e, v]) => <div key={v} style={{ display: "flex", gap: 8, fontSize: px(14), color: "rgba(255,255,255,.68)", padding: "4px 0" }}><span>{e}</span>{v}</div>)}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              {[["f", p.facebook], ["◎", p.instagram], ["♪", p.tiktok]].map(([e, h], i) => h ? <a key={i} href={h} target="_blank" rel="noopener noreferrer" style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "#fff", fontSize: 13 }}>{e}</a> : null)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: px(14), fontWeight: 700, marginBottom: 12 }}>Newsletter</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", lineHeight: 1.6, marginBottom: 10 }}>Restez informé(e) de nos nouveautés et offres spéciales.</div>
            <a href={`mailto:${p.email}`} style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 8, overflow: "hidden", textDecoration: "none" }}>
              <span style={{ flex: 1, padding: "11px 12px", fontSize: 12, color: C.inkFaint }}>Votre adresse e-mail</span>
              <span style={{ width: 42, height: 40, background: C.blush, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>➤</span>
            </a>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.10)" }}>
          <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: large ? "14px 32px" : "14px 18px", flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>© {new Date().getFullYear()} {p.pied}. Tous droits réservés.</span>
            <span style={{ fontFamily: "'Dancing Script',cursive", fontSize: 17, color: C.blush }}>{p.slogan_bas}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
