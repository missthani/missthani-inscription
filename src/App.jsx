import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — PAJ INSCRIPTION
   Fòm 4 etap → peman → prèv → règleman → byenvini
   Tout done yo ale nan Supabase.
   ============================================================ */

const C = {
  bg: "#FBEDF5",
  bg2: "#F7DCEB",
  card: "#FFFFFF",
  ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.58)",
  inkFaint: "rgba(58,14,51,.38)",
  blush: "#E5247E",
  magenta: "#C2238E",
  gold: "#E0A50A",
  green: "#1E8449",
  danger: "#C0392B",
  line: "rgba(142,44,154,.14)",
};

/* Nimewo peman yo — chanje yo isit la */
const PAIEMENT = {
  moncash: "509 4643 3016",
  natcash: "509 4643 3016",
};

/* Règleman entèn — moun nan aksepte yo youn apre lòt */
const REGLES = [
  {
    titre: "Port de l'uniforme",
    texte:
      "Le port de l'uniforme de l'académie est obligatoire à chaque séance de cours. Toute élève qui se présente sans son uniforme peut être renvoyée pour la journée.",
  },
  {
    titre: "Ponctualité et présence",
    texte:
      "Les cours commencent à l'heure indiquée. Trois absences non justifiées peuvent entraîner le retrait de votre place dans la session.",
  },
  {
    titre: "Matériel de l'académie",
    texte:
      "Le matériel prêté par l'académie reste sa propriété. Tout matériel perdu ou endommagé est à la charge de l'élève.",
  },
];

const ETAPES = [
  { t: "Étape 1", s: "Choisissez vos programmes" },
  { t: "Étape 2", s: "Inscrivez votre nom et prénom" },
  { t: "Étape 3", s: "Entrez vos numéros de contact" },
  { t: "Étape 4", s: "Inscrivez votre adresse" },
];

/* ---------------------- Zouti ---------------------- */

/* Verifye yon nimewo Ayiti: 8 chif ki kòmanse ak 2, 3 oswa 4 */
function telOk(v) {
  let d = String(v || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("509")) d = d.slice(3);
  return /^[234]\d{7}$/.test(d) ? d : "";
}

/* Kòd referans nan URL la: ?ref=Naika */
function refAgent() {
  try {
    const u = new URLSearchParams(window.location.search || "");
    const r = (u.get("ref") || u.get("a") || "").trim();
    if (r) {
      localStorage.setItem("mt_ref", r);
      return r;
    }
    return localStorage.getItem("mt_ref") || "";
  } catch (e) {
    return "";
  }
}

const fmtDate = (s) => {
  if (!s) return "";
  const [y, m, d] = String(s).split("-").map(Number);
  const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  return `${d} ${mois[m - 1]} ${y}`;
};

/* ---------------------- Estil ---------------------- */
const input = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  border: `1.4px solid ${C.line}`,
  background: "#FCF7FA",
  color: C.ink,
  fontSize: 15,
  fontFamily: "'Inter', sans-serif",
  outline: "none",
};

const label = { display: "block", fontSize: 11.5, fontWeight: 700, color: C.inkSoft, marginBottom: 6 };

const btnPrim = {
  border: "none",
  borderRadius: 999,
  padding: "13px 18px",
  background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`,
  color: "#fff",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  boxShadow: "0 8px 18px rgba(229,36,126,.28)",
  fontFamily: "'Inter', sans-serif",
};

const btnGhost = {
  border: `1.4px solid ${C.line}`,
  borderRadius: 999,
  padding: "13px 18px",
  background: "#fff",
  color: C.ink,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  fontFamily: "'Inter', sans-serif",
};

/* ---------------------- App ---------------------- */
export default function App() {
  const [programmes, setProgrammes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [chargement, setChargement] = useState(true);

  const [etape, setEtape] = useState(0);
  const [phase, setPhase] = useState("form"); // form · paiement · recu · regles · fini
  const [regleIdx, setRegleIdx] = useState(0);

  const [f, setF] = useState({ programmes: [], nom: "", prenom: "", whatsapp: "", appel: "", adresse: "" });
  const [erreur, setErreur] = useState("");
  const [busy, setBusy] = useState(false);
  const [preuve, setPreuve] = useState("");

  const idsRef = useRef({ profil: null, prospects: [], paiement: null });
  const railRef = useRef(null);

  /* Chaje pwogram ak sesyon yo */
  useEffect(() => {
    (async () => {
      const { data: pr } = await supabase.from("programmes").select("*").eq("actif", true).order("ordre");
      const { data: se } = await supabase.from("sessions").select("*").eq("statut", "ouverte").order("date_debut");
      setProgrammes(pr || []);
      setSessions(se || []);
      setChargement(false);
    })();
  }, []);

  /* Defileman otomatik chips yo — li pa janm kanpe */
  useEffect(() => {
    if (etape !== 0 || phase !== "form") return;
    const el = railRef.current;
    if (!el) return;
    let raf;
    const tick = () => {
      const half = el.scrollWidth / 2;
      if (half > 0) {
        el.scrollLeft += 0.45;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
        else if (el.scrollLeft <= 0) el.scrollLeft += half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [etape, phase, programmes.length]);

  const set = (k, v) => { setF((x) => ({ ...x, [k]: v })); setErreur(""); };

  const toggleProg = (id) =>
    setF((x) => ({
      ...x,
      programmes: x.programmes.includes(id) ? x.programmes.filter((p) => p !== id) : [...x.programmes, id],
    }));

  const peutContinuer = () => {
    if (etape === 0) return f.programmes.length > 0;
    if (etape === 1) return f.nom.trim() && f.prenom.trim();
    if (etape === 2) return !!telOk(f.whatsapp);
    if (etape === 3) return f.adresse.trim();
    return false;
  };

  /* Sesyon ki pi pre pou yon pwogram */
  const sessionDe = (progId) => sessions.find((s) => s.programme_id === progId) || null;

  /* ---------- Anrejistre pre-enskripsyon an ---------- */
  const envoyer = async () => {
    setErreur("");
    if (!telOk(f.whatsapp)) {
      setErreur("Le numéro WhatsApp doit contenir 8 chiffres et commencer par 2, 3 ou 4.");
      setEtape(2);
      return;
    }
    setBusy(true);
    try {
      /* 1. Moun nan */
      const { data: profil, error: e1 } = await supabase
        .from("profils")
        .insert({
          nom: f.nom.trim(),
          prenom: f.prenom.trim(),
          whatsapp: telOk(f.whatsapp),
          appel: telOk(f.appel) || null,
          adresse: f.adresse.trim(),
          type: "prospect",
        })
        .select()
        .single();
      if (e1) throw e1;
      idsRef.current.profil = profil.id;

      /* 2. Yon liy pa pwogram chwazi */
      const lignes = f.programmes.map((pid) => ({
        profil_id: profil.id,
        programme_id: pid,
        session_id: sessionDe(pid) ? sessionDe(pid).id : null,
        etape: "nouveau",
        source: refAgent() ? "agent" : "direct",
        etiquette: refAgent() || null,
      }));
      const { data: prospects, error: e2 } = await supabase.from("prospects").insert(lignes).select();
      if (e2) throw e2;
      idsRef.current.prospects = (prospects || []).map((p) => p.id);

      setPhase("paiement");
    } catch (err) {
      setErreur("L'enregistrement n'a pas abouti. Vérifiez votre connexion et réessayez.");
    }
    setBusy(false);
  };

  /* ---------- Voye prèv peman an ---------- */
  const envoyerPreuve = async (file, mode) => {
    if (!file) return;
    setBusy(true);
    setErreur("");
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const chemin = `${idsRef.current.profil}/${Date.now()}.${ext}`;

      const { error: eUp } = await supabase.storage.from("preuves").upload(chemin, file, { upsert: false });
      if (eUp) throw eUp;

      const { data: pub } = supabase.storage.from("preuves").getPublicUrl(chemin);

      const montant = programmes
        .filter((p) => f.programmes.includes(p.id))
        .reduce((s, p) => s + Number(p.prix_inscription || 0), 0);

      const { data: paiement, error: e3 } = await supabase
        .from("paiements")
        .insert({
          profil_id: idsRef.current.profil,
          prospect_id: idsRef.current.prospects[0] || null,
          objet: "inscription",
          montant,
          mode,
          statut: "en_attente",
        })
        .select()
        .single();
      if (e3) throw e3;
      idsRef.current.paiement = paiement.id;

      const { error: e4 } = await supabase
        .from("preuves_paiement")
        .insert({ paiement_id: paiement.id, image_url: pub.publicUrl });
      if (e4) throw e4;

      setPreuve(file.name);
      setPhase("recu");

      /* Pwovizwa: n ap fè kòm si validasyon an fèt.
         Lè entèfas admin nan prè, se li k ap deklanche etap règleman an. */
      setTimeout(() => { setPhase("regles"); setRegleIdx(0); }, 2600);
    } catch (err) {
      setErreur("L'envoi de la photo a échoué. Réessayez avec une image plus légère.");
    }
    setBusy(false);
  };

  /* ---------- Aksepte règleman an ---------- */
  const accepterRegle = async () => {
    if (regleIdx < REGLES.length - 1) {
      setRegleIdx((i) => i + 1);
      return;
    }
    try {
      await supabase
        .from("prospects")
        .update({ reglement_accepte_le: new Date().toISOString() })
        .in("id", idsRef.current.prospects);
    } catch (e) {}
    setPhase("fini");
  };

  const recommencer = () => {
    idsRef.current = { profil: null, prospects: [], paiement: null };
    setF({ programmes: [], nom: "", prenom: "", whatsapp: "", appel: "", adresse: "" });
    setEtape(0);
    setPhase("form");
    setPreuve("");
    setRegleIdx(0);
    setErreur("");
  };

  const total = programmes
    .filter((p) => f.programmes.includes(p.id))
    .reduce((s, p) => s + Number(p.prix_inscription || 0), 0);

  /* ---------------------- Rendu ---------------------- */
  const Cadre = ({ children }) => (
    <div style={{ background: C.card, borderRadius: 20, padding: "18px 20px", boxShadow: "0 10px 28px rgba(142,44,154,.10)" }}>
      {children}
    </div>
  );

  const Titre = ({ children }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 4, height: 26, borderRadius: 999, background: `linear-gradient(180deg, ${C.blush}, ${C.magenta})`, flexShrink: 0 }} />
      <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>
        {children}
      </h1>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg2} 100%)`, fontFamily: "'Inter', sans-serif", padding: "22px 16px 44px" }}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        .mt-row::-webkit-scrollbar{display:none}
        .mt-row{scrollbar-width:none}
        input:focus,textarea:focus{border-color:${C.magenta}!important;box-shadow:0 0 0 3px rgba(194,35,142,.12)}
        input::placeholder,textarea::placeholder{color:rgba(58,14,51,.32)}
        @keyframes mt-in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .mt-anim{animation:mt-in .28s ease both}
        @media (min-width:640px){ .mt-wrap{max-width:520px;margin:0 auto} }
      `}</style>

      <div className="mt-wrap">
        {/* Antèt */}
        <div style={{ textAlign: "center", marginBottom: 20, lineHeight: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 700, color: C.ink, letterSpacing: ".5px" }}>
            👑 MISS THANI
          </div>
          <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 22, fontWeight: 700, color: C.blush, marginTop: 2 }}>
            Online Club
          </div>
        </div>

        {chargement ? (
          <Cadre>
            <p style={{ margin: 0, fontSize: 13.5, color: C.inkSoft, textAlign: "center" }}>Chargement…</p>
          </Cadre>
        ) : phase === "form" ? (
          /* ================= FÒM 4 ETAP ================= */
          <Cadre>
            <Titre>Inscrivez-vous à nos programmes</Titre>

            <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "14px 0 14px" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#fff", background: C.magenta, padding: "3px 9px", borderRadius: 999 }}>
                {ETAPES[etape].t}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.inkSoft }}>{ETAPES[etape].s}</span>
            </div>

            <div key={etape} className="mt-anim">
              {etape === 0 && (
                <div ref={railRef} className="mt-row" style={{ width: "100%", overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" }}>
                  <div style={{ display: "flex", gap: 8, width: "max-content", padding: "3px 0" }}>
                    {[...programmes, ...programmes].map((p, i) => {
                      const on = f.programmes.includes(p.id);
                      return (
                        <button
                          key={p.id + "-" + i}
                          onClick={() => toggleProg(p.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "10px 16px", borderRadius: 999,
                            border: `1.4px solid ${on ? C.magenta : C.line}`,
                            background: on ? C.magenta : "#fff",
                            color: on ? "#fff" : C.ink,
                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                            flexShrink: 0, whiteSpace: "nowrap",
                          }}
                        >
                          {on ? "✓ " : ""}{p.nom}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {etape === 1 && (
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={label}>Nom</label>
                    <input style={input} value={f.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Pierre" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={label}>Prénom</label>
                    <input style={input} value={f.prenom} onChange={(e) => set("prenom", e.target.value)} placeholder="Naïka" />
                  </div>
                </div>
              )}

              {etape === 2 && (
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={label}>WhatsApp</label>
                    <input style={input} inputMode="tel" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="3712 3456" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={label}>Appel direct</label>
                    <input style={input} inputMode="tel" value={f.appel} onChange={(e) => set("appel", e.target.value)} placeholder="4812 3456" />
                  </div>
                </div>
              )}

              {etape === 3 && (
                <div>
                  <label style={label}>Où résidez-vous ?</label>
                  <input style={input} value={f.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder="Pétion-Ville, Morne Hercule" />
                </div>
              )}
            </div>

            {erreur && <p style={{ fontSize: 12.5, color: C.danger, margin: "10px 0 0", lineHeight: 1.5 }}>{erreur}</p>}

            {/* Navigasyon */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
              <div style={{ display: "flex", gap: 4, flex: 1 }}>
                {ETAPES.map((_, i) => (
                  <span key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= etape ? `linear-gradient(90deg, ${C.blush}, ${C.magenta})` : "rgba(142,44,154,.14)" }} />
                ))}
              </div>
              {etape > 0 && (
                <button onClick={() => setEtape((e) => e - 1)} style={{ ...btnGhost, padding: "9px 14px", fontSize: 12.5 }}>
                  Retour
                </button>
              )}
              <button
                onClick={() => (etape === 3 ? envoyer() : setEtape((e) => e + 1))}
                disabled={!peutContinuer() || busy}
                style={{ ...btnPrim, padding: "10px 18px", fontSize: 13, opacity: !peutContinuer() || busy ? 0.45 : 1, cursor: !peutContinuer() || busy ? "not-allowed" : "pointer" }}
              >
                {busy ? "…" : etape === 3 ? "Envoyer" : "Continuer"}
              </button>
            </div>
          </Cadre>
        ) : phase === "paiement" ? (
          /* ================= PEMAN ================= */
          <Cadre>
            <Titre>Félicitations {f.prenom} !</Titre>
            <p style={{ margin: "12px 0 14px", fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>
              Votre pré-inscription est enregistrée. Finalisez-la en payant les frais via MonCash ou NatCash, puis envoyez-nous la photo de la preuve de paiement.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {[["MonCash", PAIEMENT.moncash], ["NatCash", PAIEMENT.natcash]].map(([nom, num]) => (
                <div key={nom} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "11px 14px", borderRadius: 12, border: `1px solid ${C.line}`, background: "#FCF7FA" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: C.magenta }}>{nom}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.ink, letterSpacing: ".3px" }}>{num}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 12, background: "rgba(229,36,126,.07)", border: "1px solid rgba(229,36,126,.25)", marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.inkSoft }}>Montant à payer</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: C.blush }}>{total.toLocaleString("fr-FR")} gdes</span>
            </div>

            <p style={{ margin: "0 0 14px", fontSize: 10.5, color: C.inkFaint, lineHeight: 1.55 }}>
              Ces frais demeurent intégralement remboursables dans l'hypothèse où, après avoir pris connaissance du règlement intérieur de l'établissement, vous choisiriez de ne pas y souscrire.
            </p>

            {erreur && <p style={{ fontSize: 12.5, color: C.danger, margin: "0 0 12px", lineHeight: 1.5 }}>{erreur}</p>}

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              <label style={{ ...btnPrim, width: "100%", opacity: busy ? 0.6 : 1 }}>
                {busy ? "Envoi en cours…" : "📷 Envoyer la preuve de paiement"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  disabled={busy}
                  onChange={(e) => envoyerPreuve(e.target.files && e.target.files[0], "moncash")}
                />
              </label>

              <a
                href={`https://wa.me/50946433016?text=${encodeURIComponent(`Bonjou, mwen se ${f.prenom} ${f.nom}. Mwen fè yon pre-enskripsyon epi mwen ta renmen pale ak yon ajan anvan.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...btnGhost, width: "100%", textDecoration: "none" }}
              >
                Je souhaite d'abord parler à un agent
              </a>
            </div>
          </Cadre>
        ) : phase === "recu" ? (
          /* ================= FOTO RESEVWA ================= */
          <Cadre>
            <Titre>Nous avons reçu votre photo</Titre>
            <p style={{ margin: "12px 0 14px", fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>
              Félicitations {f.prenom} ! Nous vérifions votre transaction. Vous pouvez nous appeler à tout moment sur nos numéros pour un suivi plus rapide.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", borderRadius: 12, background: "rgba(224,165,10,.10)", border: "1px solid rgba(224,165,10,.45)" }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: C.gold, flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>Vérification en cours…</span>
            </div>
            {preuve && (
              <p style={{ margin: "10px 0 0", fontSize: 11, color: C.inkFaint }}>Fichier reçu : {preuve}</p>
            )}
          </Cadre>
        ) : phase === "regles" ? (
          /* ================= RÈGLEMAN ================= */
          <Cadre>
            <Titre>Notre règlement intérieur</Titre>

            <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "14px 0 10px" }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, color: "#fff", background: C.magenta, padding: "3px 9px", borderRadius: 999 }}>
                {regleIdx + 1}/{REGLES.length}
              </span>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{REGLES[regleIdx].titre}</span>
            </div>

            <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500, color: C.ink, lineHeight: 1.6 }}>
              {REGLES[regleIdx].texte}
            </p>

            <div style={{ paddingTop: 10, borderTop: `1px solid ${C.line}`, marginBottom: 14 }}>
              <p style={{ margin: 0, fontSize: 10, color: C.inkFaint, lineHeight: 1.5 }}>
                En cliquant sur « J'accepte », vous reconnaissez avoir pris connaissance du règlement intérieur de l'établissement et vous en approuvez l'intégralité des dispositions. Cette acceptation conditionne votre admission au sein de l'école. À défaut d'acceptation, les frais d'inscription vous seront intégralement restitués et votre intégration ne pourra être effectuée.
              </p>
            </div>

            <button onClick={accepterRegle} style={{ ...btnPrim, width: "100%" }}>✓ J'accepte</button>

            <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
              {REGLES.map((r, i) => (
                <span key={r.titre} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= regleIdx ? `linear-gradient(90deg, ${C.blush}, ${C.magenta})` : "rgba(142,44,154,.14)" }} />
              ))}
            </div>
          </Cadre>
        ) : (
          /* ================= BYENVINI ================= */
          <Cadre>
            <div style={{ textAlign: "center", padding: "6px 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(150deg, ${C.blush}, ${C.magenta})`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 800 }}>
                ✓
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 21, fontWeight: 700, color: C.ink, marginTop: 12 }}>
                Bienvenue au Club, {f.prenom} !
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>
                Votre inscription est complète pour{" "}
                <strong style={{ color: C.magenta }}>
                  {programmes.filter((p) => f.programmes.includes(p.id)).map((p) => p.nom).join(", ")}
                </strong>
                . Vous recevrez la date de votre session sur WhatsApp.
              </p>
              <button onClick={recommencer} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.inkFaint, marginTop: 14 }}>
                Faire une nouvelle inscription
              </button>
            </div>
          </Cadre>
        )}

        <p style={{ textAlign: "center", fontSize: 10.5, color: C.inkFaint, marginTop: 18 }}>
          Miss Thani Make-up &amp; Lace Club · Pétion-Ville
        </p>
      </div>
    </div>
  );
}
