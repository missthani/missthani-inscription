import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import Boutique from "./Boutique";
import GestionBoutique from "./GestionBoutique";
import EspaceEtudiante from "./EspaceEtudiante";
import Professeur from "./Professeur";
import Secretariat from "./Secretariat";
import Agent from "./Agent";
import Ambassadrice from "./Ambassadrice";
import Affiliation from "./Affiliation";
import Comptabilite from "./Comptabilite";
import Carrieres from "./Carrieres";
import Memoire from "./Memoire";
import Admin from "./Admin";
import Parametres from "./Parametres";
import Accueil from "./Accueil";
import Carla from "./Carla";

/* ============================================================
   MISS THANI ONLINE CLUB
   App konplè: Accueil · Inscription · Formation · Boutique ·
   Plateforme · Profil — enskripsyon an konekte ak Supabase.
   ============================================================ */

const C = {
  bg: "#FBEDF5",
  bg2: "#F7DCEB",
  card: "#FFFFFF",
  ink: "#3A0E33",
  inkSoft: "rgba(58,14,51,.55)",
  inkFaint: "rgba(58,14,51,.35)",
  blush: "#E5247E",
  magenta: "#C2238E",
  gold: "#E0A50A",
  green: "#1E8449",
  danger: "#C0392B",
  line: "rgba(142,44,154,.14)",
};

/* Paramèt yo (tab `parametres`) — ak valè default si tab la vid */
const DEFAUTS = {
  nom: "MISS THANI", sous_titre: "Online Club", pied: "Miss Thani Make-up & Lace Club · Pétion-Ville",
  couleur_1: "#E5247E", couleur_2: "#C2238E",
  carla_actif: "oui", carla_bienvenue: "Bonjour ! Je suis Carla, votre assistante. Comment puis-je vous aider ?",
  carla_reponse: "Merci ! Un membre de notre équipe vous répond très vite. Vous pouvez aussi nous écrire sur WhatsApp.",
  sec_categories: "oui", sec_reprendre: "oui", sec_dernieres: "oui", credits_actif: "oui",
  insc_titre: "Inscrivez-vous à nos programmes", insc_e1: "Choisissez vos programmes", insc_e2: "Inscrivez votre nom et prénom", insc_e3: "Entrez vos numéros de contact", insc_e4: "Inscrivez votre adresse",
  insc_felicitations: "Votre pré-inscription est enregistrée. Finalisez-la en payant les frais via MonCash ou NatCash, puis envoyez-nous la photo de la preuve de paiement.",
  insc_recu: "Nous vérifions votre transaction. Vous pouvez nous appeler à tout moment sur nos numéros pour un suivi plus rapide.",
  insc_bienvenue: "Vous recevrez la date de votre session sur WhatsApp.",
  moncash: "509 4643 3016", natcash: "509 4643 3016", whatsapp: "50946433016",
  note_remboursement: "Ces frais demeurent intégralement remboursables dans l'hypothèse où, après avoir pris connaissance du règlement intérieur de l'établissement, vous choisiriez de ne pas y souscrire.",
  regles: "Port de l'uniforme|Le port de l'uniforme de l'académie est obligatoire à chaque séance de cours. Toute élève qui se présente sans son uniforme peut être renvoyée pour la journée.\nPonctualité et présence|Les cours commencent à l'heure indiquée. Trois absences non justifiées peuvent entraîner le retrait de votre place dans la session.\nMatériel de l'académie|Le matériel prêté par l'académie reste sa propriété. Tout matériel perdu ou endommagé est à la charge de l'élève.",
  regles_note: "En cliquant sur « J'accepte », vous reconnaissez avoir pris connaissance du règlement intérieur de l'établissement et vous en approuvez l'intégralité des dispositions. Cette acceptation conditionne votre admission au sein de l'école. À défaut d'acceptation, les frais d'inscription vous seront intégralement restitués et votre intégration ne pourra être effectuée.",
};
let PARAMS = { ...DEFAUTS };
async function chargerParams() {
  try {
    const { data } = await supabase.from("parametres").select("cle, valeur");
    (data || []).forEach((x) => { if (x.valeur !== null && x.valeur !== "") PARAMS[x.cle] = x.valeur; });
  } catch (e) {}
  C.blush = PARAMS.couleur_1 || C.blush;
  C.magenta = PARAMS.couleur_2 || C.magenta;
  return PARAMS;
}
const reglesDe = () => String(PARAMS.regles || "").split("\n").filter(Boolean).map((l) => { const [titre, texte] = l.split("|"); return { titre: titre || "", texte: texte || "" }; });


const etapesDe = () => [
  { t: "Étape 1", s: PARAMS.insc_e1 }, { t: "Étape 2", s: PARAMS.insc_e2 }, { t: "Étape 3", s: PARAMS.insc_e3 }, { t: "Étape 4", s: PARAMS.insc_e4 },
];

const TABS = [
  { key: "accueil", label: "Accueil", icon: "🏠" },
  { key: "inscription", label: "Inscription", icon: "📝" },
  { key: "formation", label: "Formation", icon: "🎓" },
  { key: "boutique", label: "Boutique", icon: "🛍️" },
  { key: "plateforme", label: "Plateforme", icon: "🔗" },
  { key: "profil", label: "Profil", icon: "👤" },
];

const FORMATIONS = [
  { titre: "Maquillage", sous: "Peau noire parfaite", duree: "31:20", tint: "linear-gradient(140deg,#7B2D8E,#2C0B2E)" },
  { titre: "Tresse africaine", sous: "Braids tendances", duree: "22:45", tint: "linear-gradient(140deg,#8E2C63,#3A0E33)" },
  { titre: "Dreadlocks", sous: "Entretien et soins", duree: "18:30", tint: "linear-gradient(140deg,#5E3A1E,#2C1A0E)" },
];

const LECONS = [
  { label: "Matériel", emoji: "🧰", pct: 100 },
  { label: "Préparation", emoji: "🧴", pct: 100 },
  { label: "Pose", emoji: "💅", pct: 39 },
  { label: "Limage", emoji: "📏", pct: 0 },
  { label: "Finition", emoji: "✨", pct: 0 },
];

/* ---------------------- Zouti ---------------------- */
function telOk(v) {
  let d = String(v || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("509")) d = d.slice(3);
  return /^[234]\d{7}$/.test(d) ? d : "";
}

function enregistrerClic(cible) {
  try {
    const u = new URLSearchParams(window.location.search || "");
    const r = (u.get("ref") || u.get("a") || "").trim();
    if (!r) return;
    const k = "mt_clic_" + r + "_" + cible;
    if (sessionStorage.getItem(k)) return;
    sessionStorage.setItem(k, "1");
    supabase.from("clics").insert({ etiquette: r, cible: u.get("c") || cible }).then(() => {});
  } catch (e) {}
}

function refAgent() {
  try {
    const u = new URLSearchParams(window.location.search || "");
    const r = (u.get("ref") || u.get("a") || "").trim();
    if (r) { localStorage.setItem("mt_ref", r); return r; }
    return localStorage.getItem("mt_ref") || "";
  } catch (e) { return ""; }
}

const fmtDate = (s) => {
  if (!s) return "";
  const [y, m, d] = String(s).split("-").map(Number);
  const mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  return `${d} ${mois[m - 1]} ${y}`;
};

const emojiProg = (nom) => {
  const s = (nom || "").toLowerCase();
  if (/ongl/.test(s)) return "💅";
  if (/maqui/.test(s)) return "💄";
  if (/tress/.test(s)) return "🎀";
  if (/dread|loc/.test(s)) return "🧶";
  return "🌸";
};

/* ---------------------- Estil ---------------------- */
const input = { width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.4px solid ${C.line}`, background: "#FCF7FA", color: C.ink, fontSize: 15, fontFamily: "'Inter', sans-serif", outline: "none" };
const label = { display: "block", fontSize: 11.5, fontWeight: 700, color: C.inkSoft, marginBottom: 6 };
const btnPrim = { border: "none", borderRadius: 999, padding: "13px 18px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 8px 18px rgba(229,36,126,.28)", fontFamily: "'Inter', sans-serif" };
const btnGhost = { border: `1.4px solid ${C.line}`, borderRadius: 999, padding: "13px 18px", background: "#fff", color: C.ink, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Inter', sans-serif" };
const BLOC_H = 224;

function Carte({ children, style }) {
  return <div style={{ background: C.card, borderRadius: 20, padding: "18px 20px", boxShadow: "0 10px 28px rgba(142,44,154,.10)", ...style }}>{children}</div>;
}

function TitreBloc({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 4, height: 26, borderRadius: 999, background: `linear-gradient(180deg, ${C.blush}, ${C.magenta})`, flexShrink: 0 }} />
      <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 18.5, fontWeight: 700, color: C.ink, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{children}</h1>
    </div>
  );
}

function TitreSection({ children, action }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "0 0 12px" }}>
      <h2 style={{ margin: 0, fontSize: 16.5, fontWeight: 700, color: C.ink }}>{children}</h2>
      {action}
    </div>
  );
}

/* ==================== BLÒK CARLA ==================== */
function BlocCarla() {
  const [msgs, setMsgs] = useState([{ from: "carla", text: PARAMS.carla_bienvenue }]);
  const [draft, setDraft] = useState("");
  const listRef = useRef(null);

  useEffect(() => { const el = listRef.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs]);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setMsgs((m) => [...m, { from: "moi", text: t }]);
    setDraft("");
    setTimeout(() => {
      setMsgs((m) => [...m, { from: "carla", text: PARAMS.carla_reponse }]);
    }, 700);
  };

  return (
    <div style={{ borderRadius: 22, padding: "14px 14px 12px", background: `linear-gradient(120deg, ${C.blush} 0%, ${C.magenta} 65%)`, position: "relative", overflow: "hidden", height: 210, display: "flex", flexDirection: "column" }}>
      <div aria-hidden style={{ position: "absolute", right: -24, bottom: -24, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, marginBottom: 9, flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: C.magenta, flexShrink: 0 }}>C</div>
        <div style={{ lineHeight: 1.15, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: "#fff" }}>Carla</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,.8)" }}>Assistante Miss Thani</div>
        </div>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: "#4ADE80", flexShrink: 0 }} />
      </div>

      <div ref={listRef} className="mt-row" style={{ position: "relative", flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingRight: 2 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "moi" ? "flex-end" : "flex-start" }}>
            <span style={{ maxWidth: "82%", padding: "7px 11px", borderRadius: 14, borderBottomRightRadius: m.from === "moi" ? 4 : 14, borderBottomLeftRadius: m.from === "moi" ? 14 : 4, fontSize: 11.5, lineHeight: 1.45, background: m.from === "moi" ? "rgba(255,255,255,.95)" : "rgba(255,255,255,.20)", color: m.from === "moi" ? C.ink : "#fff", fontWeight: m.from === "moi" ? 600 : 500 }}>{m.text}</span>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 7, marginTop: 9, flexShrink: 0 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder="Écrivez à Carla…" style={{ flex: 1, minWidth: 0, padding: "9px 13px", borderRadius: 999, border: "none", outline: "none", background: "rgba(255,255,255,.95)", color: C.ink, fontSize: 12.5, fontFamily: "'Inter',sans-serif" }} />
        <button onClick={send} aria-label="Envoyer" style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: C.magenta, fontSize: 15 }}>➤</button>
      </div>
    </div>
  );
}

/* ==================== BLÒK KREDI ==================== */
function BlocCredits() {
  return (
    <div style={{ background: C.card, borderRadius: 20, padding: "18px 20px", boxShadow: "0 10px 28px rgba(142,44,154,.10)", display: "flex", alignItems: "center", justifyContent: "space-between", height: BLOC_H }}>
      <div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, fontWeight: 600 }}>Mes crédits</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: C.ink, margin: "2px 0" }}>250</div>
        <div style={{ fontSize: 11.5, color: C.inkFaint, marginBottom: 10 }}>crédits disponibles</div>
        <button style={{ border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13.5, padding: "11px 20px", borderRadius: 999, background: "rgba(229,36,126,.12)", color: C.blush }}>Acheter des crédits</button>
      </div>
      <div style={{ width: 64, height: 58, borderRadius: 16, background: `linear-gradient(150deg, ${C.blush}, ${C.magenta})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 18px rgba(229,36,126,.35)", flexShrink: 0, fontSize: 26 }}>👛</div>
    </div>
  );
}

/* ==================== BLÒK INSCRIPTION (Supabase) ==================== */
function BlocInscription({ programmes, sessions }) {
  const [etape, setEtape] = useState(0);
  const [phase, setPhase] = useState("form"); // form · paiement · recu · regles · fini
  const [regleIdx, setRegleIdx] = useState(0);
  const [f, setF] = useState({ programmes: [], nom: "", prenom: "", whatsapp: "", appel: "", adresse: "" });
  const [erreur, setErreur] = useState("");
  const [busy, setBusy] = useState(false);
  const [preuve, setPreuve] = useState("");
  const idsRef = useRef({ profil: null, prospects: [], paiement: null });
  const railRef = useRef(null);

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

  const ETAPES = etapesDe();
  const REGLES = reglesDe();
  const set = (k, v) => { setF((x) => ({ ...x, [k]: v })); setErreur(""); };
  const toggleProg = (id) => setF((x) => ({ ...x, programmes: x.programmes.includes(id) ? x.programmes.filter((p) => p !== id) : [...x.programmes, id] }));

  const peutContinuer = () => {
    if (etape === 0) return f.programmes.length > 0;
    if (etape === 1) return f.nom.trim() && f.prenom.trim();
    if (etape === 2) return !!telOk(f.whatsapp);
    if (etape === 3) return f.adresse.trim();
    return false;
  };

  const sessionDe = (pid) => sessions.find((s) => s.programme_id === pid) || null;
  const total = programmes.filter((p) => f.programmes.includes(p.id)).reduce((s, p) => s + Number(p.prix_inscription || 0), 0);

  const envoyer = async () => {
    setErreur("");
    if (!telOk(f.whatsapp)) { setErreur("Le numéro WhatsApp doit contenir 8 chiffres et commencer par 2, 3 ou 4."); setEtape(2); return; }
    setBusy(true);
    try {
      const { data: profil, error: e1 } = await supabase.from("profils").insert({
        nom: f.nom.trim(), prenom: f.prenom.trim(), whatsapp: telOk(f.whatsapp),
        appel: telOk(f.appel) || null, adresse: f.adresse.trim(), type: "prospect",
      }).select().single();
      if (e1) throw e1;
      idsRef.current.profil = profil.id;

      /* Ki kalite patnè ki voye moun sa a? */
      let source = "direct";
      const ref = refAgent();
      if (ref) {
        const { data: pt } = await supabase.from("profils").select("role").eq("etiquette", ref).maybeSingle();
        source = (pt && pt.role) || "agent";
      }
      const lignes = f.programmes.map((pid) => ({
        profil_id: profil.id, programme_id: pid,
        session_id: sessionDe(pid) ? sessionDe(pid).id : null,
        etape: "nouveau", source, etiquette: ref || null,
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

  const envoyerPreuve = async (file, mode) => {
    if (!file) return;
    setBusy(true); setErreur("");
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const chemin = `${idsRef.current.profil}/${Date.now()}.${ext}`;
      const { error: eUp } = await supabase.storage.from("preuves").upload(chemin, file);
      if (eUp) throw eUp;
      const { data: pub } = supabase.storage.from("preuves").getPublicUrl(chemin);
      const { data: paiement, error: e3 } = await supabase.from("paiements").insert({
        profil_id: idsRef.current.profil, prospect_id: idsRef.current.prospects[0] || null,
        objet: "inscription", montant: total, mode, statut: "en_attente",
      }).select().single();
      if (e3) throw e3;
      idsRef.current.paiement = paiement.id;
      const { error: e4 } = await supabase.from("preuves_paiement").insert({ paiement_id: paiement.id, image_url: pub.publicUrl });
      if (e4) throw e4;
      setPreuve(file.name);
      setPhase("recu");
      /* Tann validasyon admin nan (tcheke chak 8 segond) */
      const pid = paiement.id;
      const iv = setInterval(async () => {
        const { data } = await supabase.from("paiements").select("statut").eq("id", pid).maybeSingle();
        if (data && data.statut === "valide") { clearInterval(iv); setPhase("regles"); setRegleIdx(0); }
        if (data && data.statut === "rejete") { clearInterval(iv); setErreur("Votre preuve n'a pas pu être validée. Contactez-nous sur WhatsApp."); setPhase("paiement"); }
      }, 8000);
    } catch (err) {
      setErreur("L'envoi de la photo a échoué. Réessayez avec une image plus légère.");
    }
    setBusy(false);
  };

  const accepterRegle = async () => {
    if (regleIdx < REGLES.length - 1) { setRegleIdx((i) => i + 1); return; }
    try {
      await supabase.from("prospects").update({ reglement_accepte_le: new Date().toISOString() }).in("id", idsRef.current.prospects);
    } catch (e) {}
    setPhase("fini");
  };

  const recommencer = () => {
    idsRef.current = { profil: null, prospects: [], paiement: null };
    setF({ programmes: [], nom: "", prenom: "", whatsapp: "", appel: "", adresse: "" });
    setEtape(0); setPhase("form"); setPreuve(""); setRegleIdx(0); setErreur("");
  };

  const shell = { background: C.card, borderRadius: 20, padding: "16px 18px", boxShadow: "0 10px 28px rgba(142,44,154,.10)", display: "flex", flexDirection: "column", overflow: "hidden" };

  /* ---- Peman ---- */
  if (phase === "paiement") {
    return (
      <div style={{ ...shell, minHeight: BLOC_H }}>
        <TitreBloc>Félicitations {f.prenom} !</TitreBloc>
        <p style={{ margin: "10px 0 12px", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5 }}>{PARAMS.insc_felicitations}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
          {[["MonCash", PARAMS.moncash], ["NatCash", PARAMS.natcash]].map(([nom, num]) => (
            <div key={nom} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 13px", borderRadius: 12, border: `1px solid ${C.line}`, background: "#FCF7FA" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.magenta }}>{nom}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{num}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", borderRadius: 12, background: "rgba(229,36,126,.07)", border: "1px solid rgba(229,36,126,.25)", marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft }}>Montant à payer</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.blush }}>{total.toLocaleString("fr-FR")} gdes</span>
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 10, color: C.inkFaint, lineHeight: 1.5 }}>{PARAMS.note_remboursement}</p>
        {erreur && <p style={{ fontSize: 12, color: C.danger, margin: "0 0 10px", lineHeight: 1.5 }}>{erreur}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ ...btnPrim, width: "100%", opacity: busy ? 0.6 : 1 }}>
            {busy ? "Envoi en cours…" : "📷 Envoyer la preuve de paiement"}
            <input type="file" accept="image/*" style={{ display: "none" }} disabled={busy} onChange={(e) => envoyerPreuve(e.target.files && e.target.files[0], "moncash")} />
          </label>
          <a href={`https://wa.me/${PARAMS.whatsapp}?text=${encodeURIComponent(`Bonjou, mwen se ${f.prenom} ${f.nom}. Mwen fè yon pre-enskripsyon epi mwen ta renmen pale ak yon ajan anvan.`)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, width: "100%", textDecoration: "none" }}>
            Je souhaite d'abord parler à un agent
          </a>
        </div>
      </div>
    );
  }

  /* ---- Foto resevwa ---- */
  if (phase === "recu") {
    return (
      <div style={{ ...shell, minHeight: BLOC_H }}>
        <TitreBloc>Nous avons reçu votre photo</TitreBloc>
        <p style={{ margin: "12px 0 12px", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>
          Félicitations {f.prenom} ! {PARAMS.insc_recu}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", borderRadius: 12, background: "rgba(224,165,10,.10)", border: "1px solid rgba(224,165,10,.45)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: C.gold, flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>Vérification en cours…</span>
        </div>
        {preuve && <p style={{ margin: "9px 0 0", fontSize: 10.5, color: C.inkFaint }}>Fichier reçu : {preuve}</p>}
      </div>
    );
  }

  /* ---- Règleman ---- */
  if (phase === "regles") {
    return (
      <div style={{ ...shell, minHeight: BLOC_H }}>
        <TitreBloc>Notre règlement intérieur</TitreBloc>
        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "12px 0 10px" }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: "#fff", background: C.magenta, padding: "2.5px 8px", borderRadius: 999 }}>{regleIdx + 1}/{REGLES.length}</span>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{REGLES[regleIdx].titre}</span>
        </div>
        <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 500, color: C.ink, lineHeight: 1.6 }}>{REGLES[regleIdx].texte}</p>
        <div style={{ paddingTop: 10, borderTop: `1px solid ${C.line}`, marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 10, color: C.inkFaint, lineHeight: 1.5 }}>{PARAMS.regles_note}</p>
        </div>
        <button onClick={accepterRegle} style={{ ...btnPrim, width: "100%" }}>✓ J'accepte</button>
        <div style={{ display: "flex", gap: 4, marginTop: 12 }}>
          {REGLES.map((r, i) => (<span key={r.titre} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= regleIdx ? `linear-gradient(90deg, ${C.blush}, ${C.magenta})` : "rgba(142,44,154,.14)" }} />))}
        </div>
      </div>
    );
  }

  /* ---- Byenvini ---- */
  if (phase === "fini") {
    return (
      <div style={{ ...shell, minHeight: BLOC_H, alignItems: "center", justifyContent: "center", textAlign: "center", gap: 8 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(150deg, ${C.blush}, ${C.magenta})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 21, fontWeight: 800 }}>✓</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 700, color: C.ink }}>Bienvenue au Club, {f.prenom} !</div>
        <p style={{ margin: 0, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5 }}>
          Votre inscription est complète pour <strong style={{ color: C.magenta }}>{programmes.filter((p) => f.programmes.includes(p.id)).map((p) => p.nom).join(", ")}</strong>. {PARAMS.insc_bienvenue}
        </p>
        <button onClick={recommencer} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 700, color: C.inkFaint, marginTop: 4 }}>Faire une nouvelle inscription</button>
      </div>
    );
  }

  /* ---- Fòm 4 etap ---- */
  return (
    <div style={{ ...shell, height: BLOC_H }}>
      <TitreBloc>{PARAMS.insc_titre}</TitreBloc>

      <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "12px 0 10px" }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: "#fff", background: C.magenta, padding: "2.5px 8px", borderRadius: 999, flexShrink: 0 }}>{ETAPES[etape].t}</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.inkSoft, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ETAPES[etape].s}</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center" }}>
        {etape === 0 && (
          <div ref={railRef} className="mt-row" style={{ width: "100%", overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" }}>
            <div style={{ display: "flex", gap: 8, width: "max-content", padding: "2px 0" }}>
              {[...programmes, ...programmes].map((p, i) => {
                const on = f.programmes.includes(p.id);
                return (
                  <button key={p.id + "-" + i} onClick={() => toggleProg(p.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 15px", borderRadius: 999, border: `1.4px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, fontSize: 12.5, fontWeight: 700, cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" }}>
                    {on ? "✓ " : ""}{p.nom}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {etape === 1 && (
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <div style={{ flex: 1, minWidth: 0 }}><label style={{ ...label, fontSize: 11 }}>Nom</label><input style={{ ...input, padding: "10px 12px", fontSize: 13.5 }} value={f.nom} onChange={(e) => set("nom", e.target.value)} placeholder="Pierre" /></div>
            <div style={{ flex: 1, minWidth: 0 }}><label style={{ ...label, fontSize: 11 }}>Prénom</label><input style={{ ...input, padding: "10px 12px", fontSize: 13.5 }} value={f.prenom} onChange={(e) => set("prenom", e.target.value)} placeholder="Naïka" /></div>
          </div>
        )}

        {etape === 2 && (
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            <div style={{ flex: 1, minWidth: 0 }}><label style={{ ...label, fontSize: 11 }}>WhatsApp</label><input style={{ ...input, padding: "10px 12px", fontSize: 13.5 }} inputMode="tel" value={f.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="3712 3456" /></div>
            <div style={{ flex: 1, minWidth: 0 }}><label style={{ ...label, fontSize: 11 }}>Appel direct</label><input style={{ ...input, padding: "10px 12px", fontSize: 13.5 }} inputMode="tel" value={f.appel} onChange={(e) => set("appel", e.target.value)} placeholder="4812 3456" /></div>
          </div>
        )}

        {etape === 3 && (
          <div style={{ width: "100%" }}><label style={{ ...label, fontSize: 11 }}>Où résidez-vous ?</label><input style={{ ...input, padding: "10px 12px", fontSize: 13.5 }} value={f.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder="Pétion-Ville, Morne Hercule" /></div>
        )}
      </div>

      {erreur && <p style={{ fontSize: 11.5, color: C.danger, margin: "6px 0 0", lineHeight: 1.4 }}>{erreur}</p>}

      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 12 }}>
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          {ETAPES.map((_, i) => (<span key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= etape ? `linear-gradient(90deg, ${C.blush}, ${C.magenta})` : "rgba(142,44,154,.14)" }} />))}
        </div>
        {etape > 0 && <button onClick={() => setEtape((e) => e - 1)} style={{ width: 30, height: 30, borderRadius: 999, border: `1.2px solid ${C.line}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, color: C.ink }}>‹</button>}
        <button onClick={() => (etape === 3 ? envoyer() : setEtape((e) => e + 1))} disabled={!peutContinuer() || busy} style={{ ...btnPrim, padding: "9px 16px", fontSize: 12.5, opacity: !peutContinuer() || busy ? 0.45 : 1, cursor: !peutContinuer() || busy ? "not-allowed" : "pointer", flexShrink: 0 }}>
          {busy ? "…" : etape === 3 ? "Envoyer" : "Continuer ›"}
        </button>
      </div>
    </div>
  );
}

/* ==================== PAJ ACCUEIL ==================== */
function VueAccueil({ programmes }) {
  const progres = 39;
  return (
    <>
      {PARAMS.carla_actif === "oui" && <BlocCarla />}

      {PARAMS.sec_categories === "oui" && <div style={{ marginTop: 22 }}>
        <TitreSection action={<button style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: C.blush }}>Voir tout</button>}>Catégories populaires</TitreSection>
        <div className="mt-row" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
          {programmes.map((p) => (
            <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flexShrink: 0, width: 64 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(229,36,126,.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{emojiProg(p.nom)}</div>
              <span style={{ fontSize: 11, color: C.ink, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{p.nom.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>}

      {PARAMS.sec_reprendre === "oui" && <div style={{ marginTop: 22 }}>
        <TitreSection action={<button style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: C.blush }}>Voir tout</button>}>Reprendre la lecture</TitreSection>
        <Carte style={{ padding: 12, display: "flex", gap: 12 }}>
          <div style={{ width: 84, height: 84, borderRadius: 14, flexShrink: 0, background: "linear-gradient(150deg,#F2CFE0,#E8A9C6)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
            💅
            <span style={{ position: "absolute", inset: 0, borderRadius: 14, background: "rgba(58,14,51,.18)" }} />
            <span style={{ position: "relative", width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "flex", alignItems: "center", justifyContent: "center", color: C.magenta, fontSize: 12 }}>▶</span>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
            <div style={{ fontWeight: 800, fontSize: 14.5, color: C.ink }}>Onglerie</div>
            <div style={{ fontSize: 12, color: C.inkSoft }}>Techniques modernes</div>
            <div style={{ fontSize: 11, color: C.inkFaint, marginTop: 2 }}>Chapitre 4 · Pose américaine</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <div style={{ flex: 1, height: 5, borderRadius: 999, background: "rgba(142,44,154,.12)", overflow: "hidden" }}>
                <div style={{ width: `${progres}%`, height: "100%", background: `linear-gradient(90deg, ${C.blush}, ${C.magenta})` }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.inkSoft }}>{progres}%</span>
            </div>
          </div>
        </Carte>
      </div>}

      {PARAMS.sec_dernieres === "oui" && <div style={{ marginTop: 22 }}>
        <TitreSection action={<button style={{ border: "none", background: "none", padding: 0, cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: C.blush }}>Voir tout</button>}>Dernières formations</TitreSection>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {FORMATIONS.map((f, i) => (
            <div key={f.titre} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < FORMATIONS.length - 1 ? `1px solid ${C.line}` : "none" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: f.tint, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink }}>{f.titre}</div>
                <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 1 }}>{f.sous}</div>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: "rgba(58,14,51,.75)", padding: "4px 9px", borderRadius: 999, flexShrink: 0 }}>{f.duree}</span>
            </div>
          ))}
        </div>
      </div>}
    </>
  );
}

/* ==================== PAJ INSCRIPTION ==================== */
function VueInscription({ programmes, sessions }) {
  const [choix, setChoix] = useState(null);
  useEffect(() => { if (!choix && programmes.length) setChoix(programmes[0].id); }, [programmes, choix]);
  const prog = programmes.find((p) => p.id === choix);
  const sess = sessions.find((s) => s.programme_id === choix);

  return (
    <>
      <BlocInscription programmes={programmes} sessions={sessions} />

      <div style={{ marginTop: 22 }}>
        <TitreSection>Information sur les programmes</TitreSection>
        <div className="mt-row" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
          {programmes.map((p) => {
            const on = choix === p.id;
            return (
              <button key={p.id} onClick={() => setChoix(p.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flexShrink: 0, width: 64 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: on ? `linear-gradient(150deg, ${C.blush}, ${C.magenta})` : "rgba(229,36,126,.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: on ? "0 8px 16px rgba(229,36,126,.32)" : "none" }}>{emojiProg(p.nom)}</div>
                <span style={{ fontSize: 11, color: on ? C.blush : C.ink, fontWeight: on ? 800 : 600, textAlign: "center", lineHeight: 1.2 }}>{p.nom.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {prog && (
          <div style={{ marginTop: 14, background: C.card, borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 24px rgba(142,44,154,.08)" }}>
            <div style={{ padding: "10px 14px", background: `linear-gradient(120deg, ${C.blush}, ${C.magenta})` }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Nouvelle session — {prog.nom}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.85)", marginTop: 1 }}>
                {sess ? `Début : ${fmtDate(sess.date_debut)}` : "Date de session bientôt annoncée"}
              </div>
            </div>
            <div style={{ height: 150, background: "linear-gradient(150deg,#F2CFE0,#E8A9C6)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46 }}>
              {emojiProg(prog.nom)}
              <span style={{ position: "absolute", inset: 0, background: "rgba(58,14,51,.18)" }} />
              <span style={{ position: "relative", width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,.94)", display: "flex", alignItems: "center", justifyContent: "center", color: C.magenta, fontSize: 18, boxShadow: "0 8px 18px rgba(0,0,0,.18)" }}>▶</span>
            </div>
            <div style={{ padding: "12px 14px", fontSize: 11.5, color: C.inkSoft, lineHeight: 1.6 }}>
              Inscription : <strong style={{ color: C.ink }}>{Number(prog.prix_inscription).toLocaleString("fr-FR")} gdes</strong>
              {prog.duree ? <> · Durée : <strong style={{ color: C.ink }}>{prog.duree}</strong></> : null}
              {prog.horaires ? <><br />Horaires : {prog.horaires}</> : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ==================== PAJ FORMATION ==================== */
function VueFormation({ programmes }) {
  const [prog, setProg] = useState("");
  const [idx, setIdx] = useState(0);
  useEffect(() => { if (!prog && programmes.length) setProg(programmes[0].nom); }, [programmes, prog]);
  const cur = LECONS[idx];

  return (
    <>
      <div style={{ borderRadius: 22, padding: "13px 0 13px 14px", background: `linear-gradient(120deg, ${C.blush} 0%, ${C.magenta} 65%)`, position: "relative", overflow: "hidden", height: 210, display: "flex", flexDirection: "column" }}>
        <div aria-hidden style={{ position: "absolute", right: -24, bottom: -24, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingRight: 14, marginBottom: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Mes cours</div>
          <select value={prog} onChange={(e) => setProg(e.target.value)} style={{ border: "none", outline: "none", borderRadius: 999, padding: "6px 10px", background: "rgba(255,255,255,.95)", color: C.magenta, fontSize: 11.5, fontWeight: 800, fontFamily: "'Inter',sans-serif", cursor: "pointer", maxWidth: 150 }}>
            {programmes.map((p) => (<option key={p.id} value={p.nom}>{p.nom}</option>))}
          </select>
        </div>
        <div className="mt-row" style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", gap: 10, overflowX: "auto", paddingRight: 14 }}>
          {[{ t: "Techniques modernes", m: "12 leçons", p: 39 }, { t: "Pose américaine", m: "8 leçons", p: 72 }, { t: "Nail art avancé", m: "10 leçons", p: 15 }].map((c) => (
            <div key={c.t} style={{ width: 152, flexShrink: 0, background: "rgba(255,255,255,.96)", borderRadius: 14, padding: "11px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink, lineHeight: 1.25 }}>{c.t}</div>
                <div style={{ fontSize: 10.5, color: C.inkFaint, marginTop: 2 }}>{c.m}</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: C.inkSoft, marginBottom: 4 }}>{c.p}% terminé</div>
                <div style={{ height: 4, borderRadius: 999, background: "rgba(142,44,154,.14)", overflow: "hidden" }}>
                  <div style={{ width: `${c.p}%`, height: "100%", background: `linear-gradient(90deg, ${C.blush}, ${C.magenta})` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <TitreSection>Leçons du cours</TitreSection>
        <div className="mt-row" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4 }}>
          {LECONS.map((l, i) => {
            const on = i === idx;
            return (
              <button key={l.label} onClick={() => setIdx(i)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flexShrink: 0, width: 64 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", position: "relative", background: on ? `linear-gradient(150deg, ${C.blush}, ${C.magenta})` : "rgba(229,36,126,.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, boxShadow: on ? "0 8px 16px rgba(229,36,126,.32)" : "none" }}>
                  {l.emoji}
                  {l.pct === 100 && <span style={{ position: "absolute", bottom: -1, right: -1, width: 18, height: 18, borderRadius: "50%", background: C.green, border: "2px solid #FBEDF5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9 }}>✓</span>}
                </div>
                <span style={{ fontSize: 11, color: on ? C.blush : C.ink, fontWeight: on ? 800 : 600, textAlign: "center" }}>{l.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 14, background: C.card, borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 24px rgba(142,44,154,.08)" }}>
          <div style={{ height: 150, background: "linear-gradient(150deg,#F2CFE0,#E8A9C6)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
            {cur.emoji}
            <span style={{ position: "absolute", inset: 0, background: "rgba(58,14,51,.18)" }} />
            <span style={{ position: "relative", width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,.94)", display: "flex", alignItems: "center", justifyContent: "center", color: C.magenta, fontSize: 18 }}>▶</span>
          </div>
          <div style={{ padding: "12px 14px" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{cur.label}</div>
            <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 2 }}>Leçon {idx + 1} sur {LECONS.length}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
              <div style={{ flex: 1, height: 5, borderRadius: 999, background: "rgba(142,44,154,.12)", overflow: "hidden" }}>
                <div style={{ width: `${cur.pct}%`, height: "100%", background: `linear-gradient(90deg, ${C.blush}, ${C.magenta})` }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.inkSoft }}>{cur.pct}%</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ==================== PAJ K AP VINI ==================== */
function VueBientot({ titre, texte, emoji }) {
  return (
    <>
      <BlocCredits />
      <Carte style={{ marginTop: 22, textAlign: "center", padding: "30px 22px" }}>
        <div style={{ fontSize: 34 }}>{emoji}</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: C.ink, marginTop: 10 }}>{titre}</div>
        <p style={{ margin: "8px 0 0", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6 }}>{texte}</p>
      </Carte>
    </>
  );
}

/* ==================== BAR NAVIGASYON GLOBAL ==================== */
const LIENS = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/inscription", label: "Inscription", icon: "📝" },
  { href: "/app", label: "Formation", icon: "🎓" },
  { href: "/boutique", label: "Boutique", icon: "🛍️" },
  { href: "/carla", label: "Carla", icon: "💬" },
  { href: "/etudiante", label: "Profil", icon: "👤" },
];
function BarreNav({ actif }) {
  return (
    <nav style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: "#fff", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-around", padding: "10px 2px 18px", boxShadow: "0 -6px 18px rgba(142,44,154,.08)", zIndex: 60 }}>
      {LIENS.map((t) => {
        const on = actif === t.href;
        return (
          <a key={t.href} href={t.href} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, minWidth: 0, padding: "2px 0", opacity: on ? 1 : 0.5 }}>
            <span style={{ fontSize: 18, filter: on ? "none" : "grayscale(1)" }}>{t.icon}</span>
            <span style={{ fontSize: 9.5, fontWeight: on ? 800 : 500, color: on ? C.blush : C.inkFaint, whiteSpace: "nowrap" }}>{t.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

/* ==================== BOUTIK PIBLIK POUKONT LI (/boutique) ==================== */
function PageBoutique() {
  const [pret, setPret] = useState(false);
  useEffect(() => { enregistrerClic("boutique"); chargerParams().then(() => setPret(true)); }, []);
  if (!pret) return null;
  const nav = [["Accueil", "/"], ["Formations", "/#formation"], ["Boutique", "/boutique"], ["Mon espace", "/etudiante"]];
  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "'Inter', sans-serif", color: C.ink }}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{margin:0}
        .mt-row::-webkit-scrollbar{display:none}
        .mt-row{scrollbar-width:none}
        input::placeholder{color:rgba(58,14,51,.32)}
      `}</style>
      {/* Antèt boutik la */}
      <header style={{ borderBottom: `1px solid ${C.line}`, background: "#fff", position: "sticky", top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <span style={{ fontSize: 26 }}>👑</span>
            <span style={{ lineHeight: 1.05 }}>
              <span style={{ display: "block", fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 700, color: C.ink, letterSpacing: ".5px" }}>{PARAMS.nom}</span>
              <span style={{ display: "block", fontSize: 9, fontWeight: 800, letterSpacing: "2px", color: C.blush }}>MAKE-UP & LACE CLUB</span>
            </span>
          </a>
          <nav className="mt-row" style={{ display: "flex", gap: 18, overflowX: "auto" }}>
            {nav.map(([l, h]) => <a key={l} href={h} style={{ fontSize: 13.5, fontWeight: l === "Boutique" ? 800 : 600, color: l === "Boutique" ? C.blush : C.ink, textDecoration: "none", borderBottom: l === "Boutique" ? `2px solid ${C.blush}` : "2px solid transparent", paddingBottom: 3, whiteSpace: "nowrap" }}>{l}</a>)}
          </nav>
        </div>
      </header>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 20px 60px" }}>
        <Boutique />
        <p style={{ textAlign: "center", fontSize: 11, color: C.inkFaint, marginTop: 26 }}>{PARAMS.pied}</p>
      </div>
    </div>
  );
}

/* ==================== APP ==================== */
export default function App() {
  /* Wout separe yo */
  const chemin = typeof window !== "undefined" ? window.location.pathname.replace(/\/+$/, "") : "";
  if (chemin === "/gestion-boutique") return <GestionBoutique />;
  if (chemin === "/boutique") return <><PageBoutique /><BarreNav actif="/boutique" /></>;
  if (chemin === "" || chemin === "/") return <><Accueil /><div style={{ height: 78 }} /><BarreNav actif="/" /></>;
  if (chemin === "/inscription") return <AppPrincipale depart="inscription" />;
  if (chemin === "/carla") return <><Carla /><BarreNav actif="/carla" /></>;
  if (chemin === "/etudiante") return <><EspaceEtudiante /><BarreNav actif="/etudiante" /></>;
  if (chemin === "/professeur") return <Professeur />;
  if (chemin === "/secretariat") return <Secretariat />;
  if (chemin === "/agent") return <Agent />;
  if (chemin === "/ambassadrice") return <Ambassadrice />;
  if (chemin === "/affiliation") return <Affiliation />;
  if (chemin === "/comptabilite") return <Comptabilite />;
  if (chemin === "/carrieres") return <Carrieres />;
  if (chemin === "/memoire") return <Memoire />;
  if (chemin === "/admin") return <Admin />;
  if (chemin === "/parametres") return <Parametres />;

  return <AppPrincipale />;
}

function AppPrincipale({ depart }) {
  const [tab, setTab] = useState(depart || "accueil");
  const [programmes, setProgrammes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    (async () => {
      await chargerParams();
      const { data: pr } = await supabase.from("programmes").select("*").eq("actif", true).order("ordre");
      const { data: se } = await supabase.from("sessions").select("*").eq("statut", "ouverte").order("date_debut");
      setProgrammes(pr || []);
      setSessions(se || []);
      setChargement(false);
    })();
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [tab]);
  useEffect(() => { enregistrerClic("accueil"); }, []);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${C.bg} 0%, ${C.bg2} 100%)`, fontFamily: "'Inter', sans-serif", color: C.ink }}>
      <style>{`
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{margin:0}
        .mt-row::-webkit-scrollbar{display:none}
        .mt-row{scrollbar-width:none}
        input:focus,select:focus{border-color:${C.magenta}!important}
        input::placeholder{color:rgba(58,14,51,.32)}
        @media (min-width:640px){ .mt-wrap{max-width:520px;margin:0 auto} }
      `}</style>

      <div className="mt-wrap" style={{ padding: "18px 20px 110px" }}>
        {/* Antèt */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <button style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(229,36,126,.10)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.magenta, fontSize: 16 }}>☰</button>
          <div style={{ textAlign: "center", lineHeight: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "'Cormorant Garamond',serif", fontSize: 19, fontWeight: 700, color: C.ink, letterSpacing: ".5px" }}>
              <span>👑</span> {PARAMS.nom}
            </div>
            <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 20, fontWeight: 700, color: C.blush, marginTop: -2 }}>{PARAMS.sous_titre}</div>
          </div>
          <button style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "rgba(229,36,126,.10)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", color: C.magenta, fontSize: 15 }}>
            🔔<span style={{ position: "absolute", top: 8, right: 9, width: 6, height: 6, borderRadius: 999, background: C.blush }} />
          </button>
        </div>

        {chargement ? (
          <Carte><p style={{ margin: 0, fontSize: 13, color: C.inkSoft, textAlign: "center" }}>Chargement…</p></Carte>
        ) : (
          <>
            {tab === "accueil" && (<>{PARAMS.credits_actif === "oui" && <BlocCredits />}<div style={{ marginTop: PARAMS.credits_actif === "oui" ? 16 : 0 }}><VueAccueil programmes={programmes} /></div></>)}
            {tab === "inscription" && <VueInscription programmes={programmes} sessions={sessions} />}
            {tab === "formation" && <VueFormation programmes={programmes} />}
            {tab === "boutique" && <Boutique />}
            {tab === "plateforme" && <VueBientot emoji="🔗" titre="Espace Plateforme" texte="Sessions en direct, communauté et certificats. Cet espace ouvre très bientôt." />}
            {tab === "profil" && (
              <>
                <BlocCredits />
                <Carte style={{ marginTop: 22, textAlign: "center", padding: "26px 22px" }}>
                  <div style={{ fontSize: 34 }}>👤</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: C.ink, marginTop: 10 }}>Mon espace étudiante</div>
                  <p style={{ margin: "8px 0 14px", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6 }}>Vos cours, votre présence, vos notes et vos paiements.</p>
                  <a href="/etudiante" style={{ ...btnPrim, textDecoration: "none" }}>Ouvrir mon espace ›</a>
                </Carte>
              </>
            )}
          </>
        )}

        <p style={{ textAlign: "center", fontSize: 10.5, color: C.inkFaint, marginTop: 22 }}>{PARAMS.pied}</p>
      </div>

      {/* Bar navigasyon fikse */}
      <nav style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: "#fff", borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-around", padding: "10px 2px 18px", boxShadow: "0 -6px 18px rgba(142,44,154,.08)", zIndex: 30 }}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button key={t.key} onClick={() => { if (t.key === "carla") { window.location.href = "/carla"; return; } setTab(t.key); }} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1, minWidth: 0, padding: "2px 0", opacity: on ? 1 : 0.45 }}>
              <span style={{ fontSize: 18, filter: on ? "none" : "grayscale(1)" }}>{t.icon}</span>
              <span style={{ fontSize: 9.5, fontWeight: on ? 800 : 500, color: on ? C.blush : C.inkFaint, whiteSpace: "nowrap" }}>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
