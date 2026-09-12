import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — PAGE D'ACCUEIL (vitrine)  "/"
   Menm afichaj sou telefòn ak sou òdinatè (tèks ak bouton
   yon ti jan pi gwo sou telefòn). San emoji.
   ============================================================ */

const C = {
  ink: "#2B1F2E", inkSoft: "rgba(43,31,46,.88)", inkFaint: "rgba(43,31,46,.66)",
  blush: "#E5247E", magenta: "#C2238E", rose: "#FCE9F3", rose2: "#FDF5F9",
  gold: "#C9A227", noir: "#231A26", line: "rgba(142,44,154,.13)",
};
const D = {
  nom: "MISS THANI", sous_titre: "MAKE-UP & LACE CLUB",
  hero_sur_titre: "APPRENDRE · SE FORMER · RÉUSSIR", hero_titre: "Plus qu'une école,", hero_titre_script: "une communauté !",
  hero_texte: "Miss Thani Make-up & Lace Club est un espace dédié à la formation, à la beauté et à l'épanouissement personnel. Découvrez nos formations, notre boutique et tous nos services pour révéler votre potentiel.",
  hero_bouton: "Découvrir notre univers", hero_image: "",
  formations_titre: "Nos Formations", formations_texte: "Apprenez auprès de professionnelles passionnées et développez vos talents avec des formations de qualité.",
  boutique_titre: "La beauté à portée de main", boutique_texte: "Retrouvez vos produits préférés, accessoires et indispensables beauté.",
  services_titre: "Nos Services", services_texte: "Des prestations adaptées à vos besoins pour une beauté complète et durable.",
  temoignages_titre: "Ils nous font confiance", temoignages_texte: "Votre satisfaction est notre plus belle récompense.",
  signature: "Forme · Sublime · Réussis", slogan_bas: "Votre beauté, notre passion",
  email: "missthanimakeupclub@gmail.com", telephone: "+509 4643 3016", adresse: "Pétion-Ville, Haïti", whatsapp: "50946433016",
  instagram: "", facebook: "", tiktok: "", pied: "Miss Thani Make-up & Lace Club · Pétion-Ville",
};
const TINTS = ["linear-gradient(150deg,#F7DCEB,#E8A9C6)", "linear-gradient(150deg,#FBE4EE,#F0B9D3)", "linear-gradient(150deg,#EFD6C6,#D8AE92)", "linear-gradient(150deg,#E9D8EE,#C9A2C6)", "linear-gradient(150deg,#FDEBD8,#EFC79A)"];

/* ---- Menm afichaj ak òdinatè: paj la mezire 1160 px tout kote ---- */
const LARGEUR = 1160;
const TEL = typeof window !== "undefined" && window.innerWidth < 760;
const T = TEL ? 1.15 : 1;   /* telefòn: tèks +15 % */
const H = TEL ? 1.55 : 1;   /* telefòn: antèt ak bouton prensipal yo +55 % */
const N = TEL ? 2 : 1;      /* telefòn: non MISS THANI 2 fwa pi gwo */
const F = TEL ? 2 : 1;      /* telefòn: tit seksyon Nos Formations 2 fwa pi laj */
const px = (n) => Math.round(n * T * 10) / 10;
const hx = (n) => Math.round(n * H * 10) / 10;
function useVueOrdi() {
  useEffect(() => {
    const m = document.querySelector('meta[name="viewport"]');
    const avant = m ? m.getAttribute("content") : null;
    if (m) m.setAttribute("content", `width=${LARGEUR}`);
    return () => { if (m && avant) m.setAttribute("content", avant); };
  }, []);
}

const btn = (bg, col, border) => ({ display: "inline-flex", alignItems: "center", gap: 8, padding: `${px(13)}px ${px(24)}px`, borderRadius: 999, background: bg, color: col, fontSize: px(13.5), fontWeight: 700, textDecoration: "none", border: border || "none", cursor: "pointer", fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap" });

/* ---- Ti icòn SVG (olye emoji) ---- */
const Ico = ({ d, size = 22, color = C.blush }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const I = {
  cap: <><path d="M22 10L12 5 2 10l10 5 10-5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>,
  bag: <><path d="M6 2l-2 5v13a2 2 0 002 2h12a2 2 0 002-2V7l-2-5z" /><path d="M4 7h16M9 11a3 3 0 006 0" /></>,
  scissors: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12" /></>,
  users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8" /></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />,
  phone: <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.9 2z" />,
  mail: <><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" /><path d="M22 6l-10 7L2 6" /></>,
  pin: <><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  arrow: <path d="M5 12h14M12 5l7 7-7 7" />,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  crown: <path d="M2 18h20l-2-11-5 5-3-7-3 7-5-5-2 11z" />,
};

/* Logo: kouwòn + monogram, san emoji */
function Logo({ p, sombre }) {
  const col = sombre ? "#fff" : C.ink;
  return (
    <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
      <span style={{ width: Math.round(21 * N * 2), height: Math.round(21 * N * 2), borderRadius: 12, background: sombre ? "rgba(255,255,255,.10)" : C.rose, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico d={I.crown} size={Math.round(22 * N)} color={C.gold} /></span>
      <span style={{ lineHeight: 1.05 }}>
        <span style={{ display: "block", fontFamily: "'Cormorant Garamond',serif", fontSize: Math.round(21 * N), fontWeight: 700, letterSpacing: ".5px", color: col, whiteSpace: "nowrap" }}>{p.nom}</span>
        <span style={{ display: "block", fontSize: Math.round(9 * N), fontWeight: 800, letterSpacing: "1.8px", color: C.blush, whiteSpace: "nowrap" }}>{p.sous_titre}</span>
      </span>
    </a>
  );
}

/* ---- Tchat Carla sou paj akèy la — yon sèl blòk ---- */
function BlocCarla({ p }) {
  const [reponses, setReponses] = useState([]);
  const [ouvert, setOuvert] = useState(false);          // vin tchat apre premye mesaj la
  const [msgs, setMsgs] = useState([]);
  const [sugg, setSugg] = useState(["Quelles formations proposez-vous ?", "Combien ça coûte ?", "Quand commence la prochaine session ?", "Je veux m'inscrire"]);
  const [draft, setDraft] = useState("");
  const [ecrit, setEcrit] = useState(false);
  const listRef = React.useRef(null);

  useEffect(() => {
    supabase.from("carla_reponses").select("*").eq("visible", true).order("ordre").then(({ data }) => { const r = data || []; setReponses(r); if (r.length) setSugg(r.slice(0, 4).map((x) => x.question)); });
  }, []);
  useEffect(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs, ecrit]);

  const envoyer = (texte) => {
    const t = (texte || draft).trim(); if (!t) return;
    if (!ouvert) { setOuvert(true); setMsgs([{ a: "carla", t: p.carla_bienvenue || "Bonjour ! Je suis Carla, l'assistante de Miss Thani." }, { a: "moi", t }]); }
    else setMsgs((m) => [...m, { a: "moi", t }]);
    setDraft(""); setEcrit(true);
    const r = reponses.find((x) => x.question === t);
    setTimeout(() => {
      setEcrit(false);
      setMsgs((m) => [...m, { a: "carla", t: r ? r.reponse : "Merci ! Une personne de l'équipe vous répond très vite. Vous pouvez aussi ouvrir la conversation complète ou nous écrire sur WhatsApp." }]);
      if (r && r.suite) setSugg(r.suite.split("|").filter(Boolean)); else if (reponses.length) setSugg(reponses.map((x) => x.question).filter((x) => x !== t).slice(0, 4));
      if (/inscrire/i.test(t)) setMsgs((m) => [...m, { a: "action" }]);
    }, 650);
  };

  return (
    <div style={{ borderRadius: 22, overflow: "hidden", background: "#fff", border: `1px solid ${C.line}`, boxShadow: "0 14px 36px rgba(142,44,154,.10)" }}>
      {/* Antèt */}
      <div style={{ background: `linear-gradient(120deg, ${C.blush}, ${C.magenta})`, padding: `${hx(18)}px ${hx(22)}px`, color: "#fff", display: "flex", alignItems: "center", gap: hx(14), position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", right: -30, bottom: -44, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
        <span style={{ width: hx(46), height: hx(46), borderRadius: "50%", background: "rgba(255,255,255,.95)", color: C.magenta, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: hx(22), fontWeight: 700, flexShrink: 0, position: "relative" }}>C</span>
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: hx(16), fontWeight: 800 }}>Carla, votre assistante</div>
          <div style={{ fontSize: hx(11.5), opacity: .92, display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}><span style={{ width: 7, height: 7, borderRadius: 999, background: "#4ADE80" }} />En ligne · répond tout de suite</div>
        </div>
        {ouvert && <a href="/carla" style={{ position: "relative", padding: `${hx(8)}px ${hx(14)}px`, borderRadius: 999, background: "rgba(255,255,255,.92)", color: C.magenta, fontSize: hx(12), fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}>Plein écran</a>}
      </div>

      {/* Kò a */}
      <div style={{ background: C.rose2, padding: `${hx(16)}px ${hx(20)}px ${hx(18)}px` }}>
        {!ouvert ? (
          <p style={{ margin: `0 0 ${hx(14)}px`, fontSize: px(14.5), color: C.inkSoft, lineHeight: 1.7, maxWidth: 640 }}>
            Formations, prix, dates de session, inscription — posez votre question, Carla répond tout de suite.
          </p>
        ) : (
          <div ref={listRef} style={{ maxHeight: 300, overflowY: "auto", display: "flex", flexDirection: "column", gap: 9, marginBottom: hx(12) }}>
            {msgs.map((m, i) => m.a === "action" ? (
              <div key={i}><a href="/inscription" style={{ ...btn(C.blush, "#fff"), padding: `${hx(10)}px ${hx(18)}px`, fontSize: hx(13) }}>Aller à l'inscription</a></div>
            ) : (
              <div key={i} style={{ display: "flex", justifyContent: m.a === "moi" ? "flex-end" : "flex-start" }}>
                <div style={{ maxWidth: "82%", padding: `${hx(11)}px ${hx(14)}px`, borderRadius: 16, borderBottomRightRadius: m.a === "moi" ? 5 : 16, borderBottomLeftRadius: m.a === "moi" ? 16 : 5, background: m.a === "moi" ? `linear-gradient(135deg, ${C.blush}, ${C.magenta})` : "#fff", color: m.a === "moi" ? "#fff" : C.ink, fontSize: px(13.5), lineHeight: 1.6, border: m.a === "moi" ? "none" : `1px solid ${C.line}` }}>{m.t}</div>
              </div>
            ))}
            {ecrit && <div style={{ fontSize: px(12.5), color: C.inkFaint, fontStyle: "italic" }}>Carla écrit…</div>}
          </div>
        )}

        {/* Chan ekri a — toujou la */}
        <div style={{ display: "flex", alignItems: "center", gap: hx(10) }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") envoyer(); }} placeholder="Écrivez votre question à Carla…" style={{ flex: 1, padding: `${hx(14)}px ${hx(18)}px`, borderRadius: 999, border: `1.4px solid ${C.line}`, background: "#fff", color: C.ink, fontSize: hx(14), fontFamily: "'Inter',sans-serif", outline: "none" }} />
          <button onClick={() => envoyer()} aria-label="Envoyer" style={{ width: hx(50), height: hx(50), borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 8px 18px rgba(229,36,126,.30)" }}><Ico d={I.send} size={hx(20)} color="#fff" /></button>
        </div>

        {/* Sijesyon */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: hx(12) }}>
          {sugg.map((q) => <button key={q} onClick={() => envoyer(q)} style={{ flexShrink: 0, padding: `${hx(9)}px ${hx(15)}px`, borderRadius: 999, border: `1.3px solid ${C.blush}`, background: "#fff", color: C.blush, fontSize: hx(12.5), fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{q}</button>)}
        </div>
      </div>
    </div>
  );
}

export default function Accueil() {
  useVueOrdi();
  const [p, setP] = useState(D);
  const [programmes, setProgrammes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [services, setServices] = useState([]);
  const [temoins, setTemoins] = useState([]);
  const [menu, setMenu] = useState(false);
  const [ti, setTi] = useState(0);
  const [ratio, setRatio] = useState(2.75);   /* lajè / wotè foto banyè a */

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
      if (v.hero_image) { const im = new Image(); im.onload = () => { if (im.naturalHeight) setRatio(im.naturalWidth / im.naturalHeight); }; im.src = v.hero_image; }
    })();
  }, []);

  const NAV = [["Accueil", "/"], ["Inscription", "/inscription"], ["Boutique", "/boutique"]];
  const wrap = { maxWidth: LARGEUR, margin: "0 auto", padding: "0 32px" };
  const visibles = temoins.length ? temoins.slice(ti, ti + 3).concat(temoins.slice(0, Math.max(0, ti + 3 - temoins.length))) : [];
  const wa = `https://wa.me/${String(p.whatsapp || "50946433016").replace(/\D/g, "")}`;

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", color: C.ink, background: "#fff" }}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{margin:0}html{scroll-behavior:smooth}
        .mt-card{transition:transform .2s ease, box-shadow .2s ease}
        .mt-card:hover{transform:translateY(-3px);box-shadow:0 14px 30px rgba(142,44,154,.14)}
      `}</style>

      {/* ================= ANTÈT ================= */}
      <header style={{ borderBottom: `1px solid ${C.line}`, background: "#fff", position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", height: Math.round(72 * (TEL ? 1.9 : 1)), gap: 20 }}>
          <Logo p={p} />
          <div style={{ display: "flex", alignItems: "center", gap: hx(24) }}>
            <nav style={{ display: "flex", gap: hx(24) }}>
              {NAV.map(([l, h], i) => <a key={l} href={h} style={{ fontSize: hx(15), fontWeight: i === 0 ? 800 : 600, color: i === 0 ? C.blush : C.ink, textDecoration: "none", borderBottom: i === 0 ? `2.5px solid ${C.blush}` : "2.5px solid transparent", paddingBottom: 5, whiteSpace: "nowrap" }}>{l}</a>)}
            </nav>
            <button onClick={() => setMenu(true)} aria-label="Options" style={{ width: hx(44), height: hx(44), borderRadius: 12, background: C.rose, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Ico d={I.menu} size={hx(22)} /></button>
          </div>
        </div>
      </header>

      {/* ================= PANÈL OPTIONS ================= */}
      {menu && (
        <div onClick={() => setMenu(false)} style={{ position: "fixed", inset: 0, background: "rgba(43,31,46,.5)", zIndex: 90, display: "flex", justifyContent: "flex-end" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 400, height: "100%", background: "#fff", overflowY: "auto", padding: "20px 22px 40px", boxShadow: "-10px 0 30px rgba(43,31,46,.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <Logo p={p} />
              <button onClick={() => setMenu(false)} style={{ width: px(38), height: px(38), borderRadius: 10, border: "none", background: C.rose, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico d={I.close} size={px(18)} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 20 }}>
              <a href="/inscription" style={{ ...btn(C.blush, "#fff"), justifyContent: "center" }}>S'inscrire</a>
              <a href="/boutique" style={{ ...btn(C.rose, C.blush), justifyContent: "center" }}>Boutique</a>
            </div>
            <div style={{ fontSize: px(10.5), fontWeight: 800, letterSpacing: "1.5px", color: C.inkFaint, marginBottom: 6 }}>NAVIGUER</div>
            {[["Nos formations", "#formations"], ["Nos services", "#services"], ["Parler à Carla", "/carla"], ["Mon espace étudiante", "/etudiante"], ["Nous contacter", "#contact"]].map(([l, h]) => (
              <a key={l} href={h} onClick={() => setMenu(false)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${px(13)}px 2px`, textDecoration: "none", borderBottom: `1px solid ${C.line}`, fontSize: px(15), fontWeight: 600, color: C.ink }}>{l}<Ico d={I.arrow} size={16} color={C.inkFaint} /></a>
            ))}
            <div style={{ fontSize: px(10.5), fontWeight: 800, letterSpacing: "1.5px", color: C.inkFaint, margin: "22px 0 8px" }}>ESPACE ÉQUIPE</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {[["Professeur", "/professeur"], ["Secrétariat", "/secretariat"], ["Gestion boutique", "/gestion-boutique"], ["Agent", "/agent"], ["Affiliation", "/affiliation"], ["Ambassadrice", "/ambassadrice"], ["Administration", "/admin"]].map(([l, h]) => (
                <a key={l} href={h} style={{ padding: `${px(7)}px ${px(13)}px`, borderRadius: 999, border: `1.3px solid ${C.line}`, fontSize: px(12), fontWeight: 700, color: C.inkSoft, textDecoration: "none" }}>{l}</a>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: 16, borderRadius: 14, background: C.rose }}>
              <div style={{ fontSize: px(12.5), fontWeight: 800, color: C.ink, marginBottom: 10 }}>Nous joindre</div>
              {[[I.phone, p.telephone], [I.mail, p.email], [I.pin, p.adresse]].map(([d, v]) => <div key={v} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: px(12.5), color: C.inkSoft, padding: "4px 0" }}><Ico d={d} size={15} color={C.magenta} />{v}</div>)}
              <a href={wa} target="_blank" rel="noopener noreferrer" style={{ ...btn("#25D366", "#fff"), width: "100%", justifyContent: "center", marginTop: 12 }}>Écrire sur WhatsApp</a>
            </div>
          </div>
        </div>
      )}

      {/* ================= BANYÈ — foto a parèt nèt, san koupe ================= */}
      <section style={{ position: "relative", width: "100%", aspectRatio: String(ratio), background: p.hero_image ? `url(${p.hero_image}) center/cover no-repeat` : "linear-gradient(100deg,#FDF0F6 0%,#FBE4EE 52%,#F5C9DC 100%)", overflow: "hidden", minHeight: 380 }}>
        {p.hero_image && <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(255,250,252,.86) 0%, rgba(255,248,251,.58) 32%, rgba(255,248,251,.10) 52%, rgba(255,248,251,0) 66%)" }} />}
        <div style={{ ...wrap, position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
          <div style={{ maxWidth: 520, textShadow: p.hero_image ? "0 1px 14px rgba(255,255,255,.9)" : "none" }}>
            <div style={{ fontSize: px(11), fontWeight: 800, letterSpacing: "3px", color: C.blush }}>{p.hero_sur_titre}</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: px(46), fontWeight: 700, lineHeight: 1.06, margin: "10px 0 0" }}>{p.hero_titre}</h1>
            <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: px(40), color: C.blush, lineHeight: 1.1, marginTop: 2 }}>{p.hero_titre_script}</div>
            <p style={{ fontSize: px(14.5), color: C.inkSoft, lineHeight: 1.7, margin: "14px 0 0" }}>{p.hero_texte}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              {!TEL && <a href="#formations" style={{ ...btn(C.blush, "#fff"), fontSize: hx(15), padding: `${hx(14)}px ${hx(26)}px`, boxShadow: "0 8px 20px rgba(229,36,126,.30)" }}>{p.hero_bouton} <Ico d={I.arrow} size={hx(17)} color="#fff" /></a>}
              <a href="/inscription" style={{ ...btn(C.blush, "#fff"), fontSize: hx(16), padding: `${hx(15)}px ${hx(30)}px`, boxShadow: "0 8px 20px rgba(229,36,126,.30)" }}>S'inscrire</a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BLÒK CARLA ================= */}
      <section style={{ background: C.rose2, borderBottom: `1px solid ${C.line}` }}>
        <div style={{ ...wrap, padding: "30px 32px" }}>
          <BlocCarla p={p} />
        </div>
      </section>

      {/* ================= FÒMASYON ================= */}
      <section id="formations" style={{ ...wrap, padding: "60px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 40, alignItems: "start" }}>
          <div>
            <div style={{ width: 46, height: 3, background: C.gold, marginBottom: 14 }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: Math.round(34 * F), fontWeight: 700, margin: 0, lineHeight: 1.1 }}>{p.formations_titre}</h2>
            <p style={{ fontSize: Math.round(14.5 * F), color: C.inkSoft, lineHeight: 1.6, margin: "14px 0 22px" }}>{p.formations_texte}</p>
            <a href="/inscription" style={btn("#fff", C.blush, `1.5px solid ${C.blush}`)}>Voir toutes les formations <Ico d={I.arrow} size={16} /></a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: TEL ? 20 : 14 }}>
            {programmes.slice(0, 6).map((g, i) => (
              <a key={g.id} href={`/inscription?prog=${g.id}`} className="mt-card" style={{ borderRadius: 14, overflow: "hidden", background: "#fff", border: `1px solid ${C.line}`, textDecoration: "none", boxShadow: "0 6px 18px rgba(142,44,154,.06)" }}>
                <div style={{ aspectRatio: "1 / .95", background: g.image_url ? `url(${g.image_url}) center/cover` : TINTS[i % TINTS.length], display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {!g.image_url && <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: TEL ? 92 : 56, fontWeight: 700, color: "rgba(43,31,46,.35)" }}>{(g.nom || "?")[0]}</span>}
                </div>
                <div style={{ padding: TEL ? "16px 16px 18px" : "12px 13px 14px" }}>
                  <div style={{ fontSize: Math.round(14.5 * (TEL ? 1.7 : 1)), fontWeight: 700, color: C.ink, lineHeight: 1.25 }}>{g.nom}</div>
                  <div style={{ fontSize: Math.round(11.5 * (TEL ? 1.7 : 1)), color: C.inkFaint, marginTop: 5 }}>{g.duree || "Formation certifiante"}</div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}><span style={{ width: TEL ? 42 : 26, height: TEL ? 42 : 26, borderRadius: "50%", background: C.blush, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico d={I.arrow} size={TEL ? 20 : 13} color="#fff" /></span></div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BOUTIK ================= */}
      <section style={{ background: C.rose }}>
        <div style={{ ...wrap, display: "grid", gridTemplateColumns: ".8fr 1fr 1.2fr", gap: 32, alignItems: "center", padding: "44px 32px" }}>
          <div style={{ aspectRatio: "1 / 1", borderRadius: 16, background: produits[0] && produits[0].image_url ? `url(${produits[0].image_url}) center/cover` : "linear-gradient(150deg,#F7DCEB,#E8A9C6)" }} />
          <div>
            <div style={{ fontSize: px(10.5), fontWeight: 800, letterSpacing: "2.5px", color: C.blush }}>NOTRE BOUTIQUE</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: px(32), fontWeight: 700, margin: "8px 0 0", lineHeight: 1.15 }}>{p.boutique_titre}</h2>
            <div style={{ width: 46, height: 2, background: C.blush, margin: "12px 0" }} />
            <p style={{ fontSize: px(14.5), color: C.inkSoft, lineHeight: 1.7, margin: "0 0 18px" }}>{p.boutique_texte}</p>
            <a href="/boutique" style={btn("#fff", C.blush, `1.5px solid ${C.blush}`)}>Découvrir la boutique <Ico d={I.arrow} size={16} /></a>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 18px" }}>
            <div style={{ display: "flex", gap: 12, justifyContent: "space-between" }}>
              {(produits.length ? produits : [{ id: 1, nom: "Maquillage" }, { id: 2, nom: "Soins visage" }, { id: 3, nom: "Onglerie" }, { id: 4, nom: "Accessoires" }, { id: 5, nom: "Cheveux" }]).slice(0, 5).map((x, i) => (
                <a key={x.id} href="/boutique" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>
                  <div style={{ aspectRatio: "1 / 1", borderRadius: 12, background: x.image_url ? `url(${x.image_url}) center/cover` : TINTS[i % TINTS.length] }} />
                  <div style={{ fontSize: px(11), color: C.inkSoft, marginTop: 7, lineHeight: 1.3 }}>{(x.categorie || x.nom || "").slice(0, 22)}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= SÈVIS ================= */}
      <section id="services" style={{ ...wrap, padding: "56px 32px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: px(32), fontWeight: 700, margin: 0 }}>{p.services_titre}</h2>
            <p style={{ fontSize: px(14), color: C.inkSoft, margin: "8px 0 0" }}>{p.services_texte}</p>
          </div>
          <a href="#contact" style={btn("#fff", C.blush, `1.5px solid ${C.blush}`)}>Voir tous les services <Ico d={I.arrow} size={16} /></a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {services.map((s, i) => (
            <a key={s.id} href="#contact" className="mt-card" style={{ position: "relative", aspectRatio: "1 / .78", borderRadius: 14, overflow: "hidden", background: s.image_url ? `url(${s.image_url}) center/cover` : TINTS[i % TINTS.length], textDecoration: "none", display: "block" }}>
              <span style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(43,31,46,0) 35%, rgba(43,31,46,.62) 100%)" }} />
              <span style={{ position: "absolute", left: 13, bottom: 12, color: "#fff" }}>
                <span style={{ display: "block", fontSize: px(14.5), fontWeight: 700 }}>{s.titre}</span>
                <span style={{ display: "block", fontSize: px(11.5), opacity: .9, marginTop: 2 }}>{s.sous_titre}</span>
              </span>
              <span style={{ position: "absolute", right: 12, bottom: 12, width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,.9)", color: C.blush, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800 }}>+</span>
            </a>
          ))}
        </div>
      </section>

      {/* ================= TEMWAYAJ ================= */}
      <section id="temoignages" style={{ background: C.rose2, borderTop: `1px solid ${C.line}` }}>
        <div style={{ ...wrap, padding: "50px 32px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: px(30), fontWeight: 700, margin: 0 }}>{p.temoignages_titre}</h2>
              <p style={{ fontSize: px(14), color: C.inkSoft, margin: "7px 0 0" }}>{p.temoignages_texte}</p>
            </div>
            {temoins.length > 3 && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setTi((i) => (i - 1 + temoins.length) % temoins.length)} style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(180deg)" }}><Ico d={I.arrow} size={16} /></button>
                <button onClick={() => setTi((i) => (i + 1) % temoins.length)} style={{ width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico d={I.arrow} size={16} /></button>
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {visibles.map((t, i) => t && (
              <div key={t.id + "-" + i} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.line}`, padding: 16, display: "flex", gap: 13 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: t.photo_url ? `url(${t.photo_url}) center/cover` : C.rose, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: C.blush, fontWeight: 800 }}>{!t.photo_url && (t.nom || "?")[0]}</div>
                <div>
                  <div style={{ fontSize: px(13.5), color: C.inkSoft, lineHeight: 1.65, fontStyle: "italic" }}>"{t.texte}"</div>
                  <div style={{ fontSize: px(13), fontWeight: 700, marginTop: 8 }}>— {t.nom}</div>
                  <div style={{ color: C.gold, fontSize: 12, marginTop: 3, letterSpacing: 1 }}>{"★".repeat(t.note || 5)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PYE PAJ ================= */}
      <footer id="contact" style={{ background: C.noir, color: "#fff" }}>
        <div style={{ ...wrap, display: "grid", gridTemplateColumns: "1.3fr 1fr 1.2fr 1.2fr", gap: 30, padding: "44px 32px" }}>
          <div>
            <Logo p={p} sombre />
            <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: Math.round(22 * N), color: C.blush, marginTop: 16 }}>{p.signature}</div>
          </div>
          <div>
            <div style={{ fontSize: px(13.5), fontWeight: 700, marginBottom: 12 }}>Liens rapides</div>
            {[["Accueil", "/"], ["Inscription", "/inscription"], ["Formations", "#formations"], ["Boutique", "/boutique"], ["Services", "#services"], ["Contact", "#contact"]].map(([l, h]) => <a key={l} href={h} style={{ display: "block", fontSize: px(13), color: "rgba(255,255,255,.68)", textDecoration: "none", padding: "4px 0" }}>{l}</a>)}
          </div>
          <div>
            <div style={{ fontSize: px(13.5), fontWeight: 700, marginBottom: 12 }}>Plus d'infos</div>
            {[[I.phone, p.telephone], [I.mail, p.email], [I.pin, p.adresse]].map(([d, v]) => <div key={v} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: px(13), color: "rgba(255,255,255,.68)", padding: "4px 0" }}><Ico d={d} size={15} color={C.blush} />{v}</div>)}
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              {[["Facebook", p.facebook], ["Instagram", p.instagram], ["TikTok", p.tiktok]].map(([l, h]) => h ? <a key={l} href={h} target="_blank" rel="noopener noreferrer" style={{ padding: "6px 12px", borderRadius: 999, background: "rgba(255,255,255,.10)", textDecoration: "none", color: "#fff", fontSize: px(11.5), fontWeight: 700 }}>{l}</a> : null)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: px(13.5), fontWeight: 700, marginBottom: 12 }}>Newsletter</div>
            <div style={{ fontSize: px(12.5), color: "rgba(255,255,255,.6)", lineHeight: 1.6, marginBottom: 10 }}>Restez informé(e) de nos nouveautés et offres spéciales.</div>
            <a href={`mailto:${p.email}`} style={{ display: "flex", alignItems: "center", background: "#fff", borderRadius: 8, overflow: "hidden", textDecoration: "none" }}>
              <span style={{ flex: 1, padding: "11px 12px", fontSize: px(12.5), color: C.inkFaint }}>Votre adresse e-mail</span>
              <span style={{ width: 42, height: 40, background: C.blush, display: "flex", alignItems: "center", justifyContent: "center" }}><Ico d={I.send} size={16} color="#fff" /></span>
            </a>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.10)" }}>
          <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 32px" }}>
            <span style={{ fontSize: Math.round(11.5 * N), color: "rgba(255,255,255,.72)" }}>© {new Date().getFullYear()} {p.pied}. Tous droits réservés.</span>
            <span style={{ fontFamily: "'Dancing Script',cursive", fontSize: Math.round(17 * N), color: C.blush }}>{p.slogan_bas}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
