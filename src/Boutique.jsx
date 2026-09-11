import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — BOUTIQUE v2
   Banyè · filtè sou kote · gri pwodwi · panye · kòmand · prèv
   ============================================================ */

const C = {
  card: "#FFFFFF", ink: "#2B1F2E", inkSoft: "rgba(43,31,46,.62)", inkFaint: "rgba(43,31,46,.42)",
  blush: "#E5247E", magenta: "#C2238E", rose: "#FBE4EE", roseBg: "#FDF3F7", gold: "#D4A017",
  green: "#1E8449", danger: "#C0392B", line: "rgba(142,44,154,.14)",
};
const PAIEMENT = { moncash: "509 4643 3016", natcash: "509 4643 3016", whatsapp: "50946433016" };
supabase.from("parametres").select("cle, valeur").in("cle", ["moncash", "natcash", "whatsapp"]).then(({ data }) => { (data || []).forEach((x) => { if (x.valeur) PAIEMENT[x.cle] = x.valeur; }); });

const gdes = (n) => Number(n || 0).toLocaleString("fr-FR") + " Gdes";
const CAT_ICONS = { Onglerie: "💅", Maquillage: "💄", Tresse: "🎀", "Tresse africaine": "🎀", Dreadlocks: "🧶", "Flè": "🌸", Accessoires: "👜", "Académie": "🎓" };
const PAR_PAGE = 12;

function telOk(v) { let d = String(v || "").replace(/\D/g, ""); if (d.startsWith("00")) d = d.slice(2); if (d.length === 11 && d.startsWith("509")) d = d.slice(3); return /^[234]\d{7}$/.test(d) ? d : ""; }
function refPartenaire() { try { const u = new URLSearchParams(window.location.search || ""); const r = (u.get("ref") || u.get("a") || "").trim(); if (r) { localStorage.setItem("mt_ref", r); return r; } return localStorage.getItem("mt_ref") || ""; } catch (e) { return ""; } }
function useLarge() { const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1000); useEffect(() => { const f = () => setW(window.innerWidth); window.addEventListener("resize", f); return () => window.removeEventListener("resize", f); }, []); return w >= 900; }

const input = { width: "100%", padding: "11px 13px", borderRadius: 10, border: `1.4px solid ${C.line}`, background: "#fff", color: C.ink, fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none" };
const label = { display: "block", fontSize: 11.5, fontWeight: 700, color: C.inkSoft, marginBottom: 6 };
const btnPrim = { border: "none", borderRadius: 8, padding: "11px 16px", background: C.blush, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Inter',sans-serif", textDecoration: "none" };
const btnGhost = { border: `1.4px solid ${C.line}`, borderRadius: 8, padding: "11px 16px", background: "#fff", color: C.ink, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Inter',sans-serif", textDecoration: "none" };

function Etoiles({ n = 5, avis }) {
  const full = Math.round(Number(n) || 0);
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 1, fontSize: 11 }}>{[1, 2, 3, 4, 5].map((i) => <span key={i} style={{ color: i <= full ? C.gold : "rgba(43,31,46,.18)" }}>★</span>)}{avis ? <span style={{ color: C.inkFaint, fontSize: 10.5, marginLeft: 4 }}>({avis})</span> : null}</span>;
}
function Carte({ children, style }) { return <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.line}`, ...style }}>{children}</div>; }

/* ===================== PWODWI (kat) ===================== */
function Produit({ p, q, ajouter, retirer }) {
  const rupture = Number(p.stock) <= 0;
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.line}`, overflow: "hidden", display: "flex", flexDirection: "column", opacity: rupture ? 0.65 : 1, boxShadow: "0 4px 16px rgba(142,44,154,.05)" }}>
      <div style={{ aspectRatio: "1 / 1", background: p.image_url ? `url(${p.image_url}) center/cover` : "linear-gradient(150deg,#F7DCEB,#F2C6DC)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46 }}>
        {!p.image_url && (p.emoji || "📦")}
        {p.nouveau && <span style={{ position: "absolute", top: 10, left: 10, background: C.blush, color: "#fff", fontSize: 9.5, fontWeight: 800, padding: "3px 8px", borderRadius: 999, letterSpacing: ".4px" }}>NOUVEAU</span>}
        {rupture && <span style={{ position: "absolute", top: 10, right: 10, background: "rgba(43,31,46,.8)", color: "#fff", fontSize: 9.5, fontWeight: 800, padding: "3px 8px", borderRadius: 999 }}>RUPTURE</span>}
      </div>
      <div style={{ padding: "12px 13px 13px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: C.blush, marginBottom: 3 }}>{p.categorie || "—"}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.ink, lineHeight: 1.35, minHeight: 35 }}>{p.nom}</div>
        <div style={{ marginTop: 8 }}>
          {p.prix_barre && Number(p.prix_barre) > Number(p.prix_public) && <div style={{ fontSize: 11, color: C.inkFaint, textDecoration: "line-through" }}>{gdes(p.prix_barre)}</div>}
          <div style={{ fontSize: 14.5, fontWeight: 800, color: C.ink }}>{gdes(p.prix_public)}</div>
        </div>
        <div style={{ marginTop: 5 }}><Etoiles n={p.note} avis={p.nb_avis} /></div>
        <div style={{ marginTop: "auto", paddingTop: 11 }}>
          {rupture ? <button disabled style={{ ...btnPrim, width: "100%", background: "rgba(43,31,46,.15)", cursor: "not-allowed" }}>Indisponible</button>
            : q === 0 ? <button onClick={() => ajouter(p.id)} style={{ ...btnPrim, width: "100%" }}>🛒 Ajouter au panier</button>
            : <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={() => retirer(p.id)} style={{ ...btnGhost, flex: 1, padding: "9px" }}>−</button>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.ink, minWidth: 22, textAlign: "center" }}>{q}</span>
                <button onClick={() => ajouter(p.id)} style={{ ...btnPrim, flex: 1, padding: "9px" }}>+</button>
              </div>}
        </div>
      </div>
    </div>
  );
}

/* ===================== BOUTIK ===================== */
export default function Boutique() {
  const large = useLarge();
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [cat, setCat] = useState("Tous");
  const [marques, setMarques] = useState([]);
  const [nouveaux, setNouveaux] = useState(false);
  const [prixMax, setPrixMax] = useState(50000);
  const [tri, setTri] = useState("vedette");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  const [panier, setPanier] = useState({});
  const [phase, setPhase] = useState("boutique");   // boutique · panier · paiement · recu
  const [f, setF] = useState({ nom: "", telephone: "", adresse: "", mode: "retrait" });
  const [erreur, setErreur] = useState("");
  const [busy, setBusy] = useState(false);
  const [cmdId, setCmdId] = useState(null);

  useEffect(() => { (async () => { const { data } = await supabase.from("produits").select("*").eq("visible", true).order("ordre"); setProduits(data || []); setChargement(false); })(); }, []);
  useEffect(() => { setPage(1); }, [cat, marques, nouveaux, prixMax, tri, q]);

  const cats = useMemo(() => Array.from(new Set(produits.map((p) => p.categorie).filter(Boolean))), [produits]);
  const toutesMarques = useMemo(() => Array.from(new Set(produits.map((p) => p.marque).filter(Boolean))), [produits]);
  const plafond = useMemo(() => Math.max(1000, ...produits.map((p) => Number(p.prix_public) || 0)), [produits]);
  useEffect(() => { setPrixMax(plafond); }, [plafond]);

  const liste = useMemo(() => {
    let l = produits.filter((p) => (cat === "Tous" || p.categorie === cat) && (marques.length === 0 || marques.includes(p.marque)) && (!nouveaux || p.nouveau) && Number(p.prix_public) <= prixMax && p.nom.toLowerCase().includes(q.toLowerCase()));
    if (tri === "prix_asc") l = [...l].sort((a, b) => a.prix_public - b.prix_public);
    if (tri === "prix_desc") l = [...l].sort((a, b) => b.prix_public - a.prix_public);
    if (tri === "nouveau") l = [...l].sort((a, b) => (b.nouveau ? 1 : 0) - (a.nouveau ? 1 : 0));
    if (tri === "vedette") l = [...l].sort((a, b) => (b.en_vedette ? 1 : 0) - (a.en_vedette ? 1 : 0));
    return l;
  }, [produits, cat, marques, nouveaux, prixMax, tri, q]);
  const nbPages = Math.max(1, Math.ceil(liste.length / PAR_PAGE));
  const visibles = liste.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  const qte = (id) => panier[id] || 0;
  const ajouter = (id) => setPanier((x) => ({ ...x, [id]: (x[id] || 0) + 1 }));
  const retirer = (id) => setPanier((x) => { const n = (x[id] || 0) - 1; const c = { ...x }; if (n <= 0) delete c[id]; else c[id] = n; return c; });
  const lignes = Object.keys(panier).map((id) => { const p = produits.find((x) => x.id === id); return p ? { p, q: panier[id], sous: Number(p.prix_public) * panier[id] } : null; }).filter(Boolean);
  const total = lignes.reduce((s, l) => s + l.sous, 0);
  const nb = lignes.reduce((s, l) => s + l.q, 0);

  const commander = async () => {
    setErreur("");
    if (!f.nom.trim()) { setErreur("Indiquez votre nom."); return; }
    if (!telOk(f.telephone)) { setErreur("Le numéro doit contenir 8 chiffres et commencer par 2, 3 ou 4."); return; }
    if (f.mode === "livraison" && !f.adresse.trim()) { setErreur("Indiquez l'adresse de livraison."); return; }
    setBusy(true);
    try {
      const { data: cmd, error: e1 } = await supabase.from("commandes").insert({ nom_client: f.nom.trim(), telephone: telOk(f.telephone), adresse: f.adresse.trim() || null, total, mode_livraison: f.mode, statut: "a_preparer", etiquette: refPartenaire() || null, source: refPartenaire() ? "partenaire" : "direct" }).select().single();
      if (e1) throw e1;
      setCmdId(cmd.id);
      const { error: e2 } = await supabase.from("commande_lignes").insert(lignes.map((l) => ({ commande_id: cmd.id, produit_id: l.p.id, nom_produit: l.p.nom, quantite: l.q, prix_unitaire: Number(l.p.prix_public) })));
      if (e2) throw e2;
      setPhase("paiement");
    } catch (e) { setErreur("La commande n'a pas abouti. Réessayez."); }
    setBusy(false);
  };
  const envoyerPreuve = async (file, mode) => {
    if (!file) return; setBusy(true); setErreur("");
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const chemin = `boutique/${cmdId}/${Date.now()}.${ext}`;
      const { error: eUp } = await supabase.storage.from("preuves").upload(chemin, file); if (eUp) throw eUp;
      const { data: pub } = supabase.storage.from("preuves").getPublicUrl(chemin);
      const { data: paiement, error: e1 } = await supabase.from("paiements").insert({ objet: "commande", commande_id: cmdId, montant: total, mode, statut: "en_attente" }).select().single(); if (e1) throw e1;
      const { error: e2 } = await supabase.from("preuves_paiement").insert({ paiement_id: paiement.id, image_url: pub.publicUrl }); if (e2) throw e2;
      setPhase("recu");
    } catch (e) { setErreur("L'envoi de la photo a échoué. Réessayez avec une image plus légère."); }
    setBusy(false);
  };
  const recommencer = () => { setPanier({}); setPhase("boutique"); setErreur(""); setF({ nom: "", telephone: "", adresse: "", mode: "retrait" }); setCmdId(null); };

  /* ---------- Ekran apre kòmand ---------- */
  if (phase === "recu") return (
    <Carte style={{ padding: "30px 24px", textAlign: "center", maxWidth: 480, margin: "20px auto" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.blush, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 800 }}>✓</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 12 }}>Commande reçue, {f.nom.split(" ")[0]} !</div>
      <p style={{ margin: "8px 0 0", fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>Nous vérifions votre paiement et préparons votre commande.{f.mode === "retrait" ? " Vous serez prévenue dès qu'elle est prête au local." : " La livraison vous sera confirmée sur WhatsApp."}</p>
      <button onClick={recommencer} style={{ ...btnGhost, marginTop: 16 }}>Retour à la boutique</button>
    </Carte>
  );
  if (phase === "paiement") return (
    <Carte style={{ padding: 22, maxWidth: 480, margin: "20px auto" }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: C.ink }}>Finalisez votre commande</div>
      <p style={{ margin: "8px 0 14px", fontSize: 13, color: C.inkSoft, lineHeight: 1.55 }}>Payez via MonCash ou NatCash, puis envoyez-nous la photo de la preuve de paiement.</p>
      {[["MonCash", PAIEMENT.moncash], ["NatCash", PAIEMENT.natcash]].map(([n, num]) => <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.line}`, background: C.roseBg, marginBottom: 8 }}><span style={{ fontSize: 12.5, fontWeight: 800, color: C.blush }}>{n}</span><span style={{ fontSize: 14, fontWeight: 700 }}>{num}</span></div>)}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: C.rose, margin: "8px 0 14px" }}><span style={{ fontSize: 12.5, fontWeight: 700, color: C.inkSoft }}>Montant à payer</span><span style={{ fontSize: 18, fontWeight: 800, color: C.blush }}>{gdes(total)}</span></div>
      {erreur && <p style={{ color: C.danger, fontSize: 12.5, margin: "0 0 10px" }}>{erreur}</p>}
      <label style={{ ...btnPrim, width: "100%", padding: "13px", opacity: busy ? 0.6 : 1 }}>{busy ? "Envoi en cours…" : "📷 Envoyer la preuve de paiement"}<input type="file" accept="image/*" style={{ display: "none" }} disabled={busy} onChange={(e) => envoyerPreuve(e.target.files && e.target.files[0], "moncash")} /></label>
      <a href={`https://wa.me/${PAIEMENT.whatsapp}?text=${encodeURIComponent(`Bonjou, mwen se ${f.nom}. Mwen fè yon kòmand nan boutik la pou ${gdes(total)}.`)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, width: "100%", marginTop: 8 }}>Écrire sur WhatsApp</a>
    </Carte>
  );
  if (phase === "panier") return (
    <div style={{ maxWidth: 560, margin: "20px auto" }}>
      <button onClick={() => setPhase("boutique")} style={{ ...btnGhost, marginBottom: 12 }}>‹ Continuer mes achats</button>
      <Carte style={{ padding: 20, marginBottom: 14 }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 10 }}>Votre panier</div>
        {lignes.map((l) => (
          <div key={l.p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: `1px solid ${C.line}` }}>
            <div style={{ width: 54, height: 54, borderRadius: 10, background: l.p.image_url ? `url(${l.p.image_url}) center/cover` : C.rose, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{!l.p.image_url && l.p.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{l.p.nom}</div><div style={{ fontSize: 11.5, color: C.inkSoft }}>{gdes(l.p.prix_public)} × {l.q}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}><button onClick={() => retirer(l.p.id)} style={{ ...btnGhost, padding: "5px 11px" }}>−</button><b>{l.q}</b><button onClick={() => ajouter(l.p.id)} style={{ ...btnPrim, padding: "5px 11px" }}>+</button></div>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, borderTop: `2px solid ${C.line}`, marginTop: 4 }}><span style={{ fontSize: 14, fontWeight: 700, color: C.inkSoft }}>Total</span><span style={{ fontSize: 20, fontWeight: 800, color: C.blush }}>{gdes(total)}</span></div>
      </Carte>
      <Carte style={{ padding: 20 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: C.blush, letterSpacing: ".4px", marginBottom: 12 }}>VOS COORDONNÉES</div>
        <div style={{ display: "grid", gridTemplateColumns: large ? "1fr 1fr" : "1fr", gap: 12 }}>
          <div><label style={label}>Nom complet</label><input style={input} value={f.nom} onChange={(e) => { setF({ ...f, nom: e.target.value }); setErreur(""); }} /></div>
          <div><label style={label}>WhatsApp</label><input style={input} inputMode="tel" value={f.telephone} onChange={(e) => { setF({ ...f, telephone: e.target.value }); setErreur(""); }} placeholder="3712 3456" /></div>
        </div>
        <label style={{ ...label, marginTop: 12 }}>Mode de réception</label>
        <div style={{ display: "flex", gap: 8 }}>{[["retrait", "Retrait au local"], ["livraison", "Livraison"]].map(([k, t]) => <button key={k} onClick={() => setF({ ...f, mode: k })} style={{ ...(f.mode === k ? btnPrim : btnGhost), flex: 1 }}>{t}</button>)}</div>
        {f.mode === "livraison" && <div style={{ marginTop: 12 }}><label style={label}>Adresse de livraison</label><input style={input} value={f.adresse} onChange={(e) => { setF({ ...f, adresse: e.target.value }); setErreur(""); }} /></div>}
        {erreur && <p style={{ color: C.danger, fontSize: 12.5, margin: "10px 0 0" }}>{erreur}</p>}
        <button onClick={commander} disabled={busy} style={{ ...btnPrim, width: "100%", marginTop: 16, padding: "13px", opacity: busy ? 0.6 : 1 }}>{busy ? "…" : "Valider la commande"}</button>
      </Carte>
    </div>
  );

  /* ---------- BOUTIK ---------- */
  const Filtres = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Carte style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 18, height: 18, borderRadius: 6, background: C.rose, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>▤</span> Catégories</div>
        {["Tous", ...cats].map((c) => { const on = cat === c; return <button key={c} onClick={() => setCat(c)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 8px", borderRadius: 8, border: "none", background: on ? C.rose : "transparent", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: on ? 700 : 500, color: on ? C.blush : C.ink }}><span style={{ fontSize: 17 }}>{c === "Tous" ? "✨" : CAT_ICONS[c] || "🛍️"}</span>{c}</button>; })}
      </Carte>
      <Carte style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 10 }}>Prix</div>
        <input type="range" min={0} max={plafond} step={100} value={prixMax} onChange={(e) => setPrixMax(Number(e.target.value))} style={{ width: "100%", accentColor: C.blush }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.inkSoft, marginTop: 4 }}><span>0 Gdes</span><span>{gdes(prixMax)}</span></div>
      </Carte>
      {toutesMarques.length > 0 && <Carte style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 8 }}>Marque</div>
        {toutesMarques.map((m) => { const on = marques.includes(m); return <label key={m} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", fontSize: 13, color: C.ink, cursor: "pointer" }}><input type="checkbox" checked={on} onChange={() => setMarques(on ? marques.filter((x) => x !== m) : [...marques, m])} style={{ accentColor: C.blush }} />{m}</label>; })}
      </Carte>}
      <Carte style={{ padding: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 8 }}>Nouveautés</div>
        <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: C.ink, cursor: "pointer" }}><input type="checkbox" checked={nouveaux} onChange={(e) => setNouveaux(e.target.checked)} style={{ accentColor: C.blush }} />Nouveautés uniquement</label>
      </Carte>
      <div style={{ borderRadius: 14, padding: "22px 18px", background: C.rose, textAlign: "center" }}>
        <div style={{ fontSize: 28 }}>🎁</div>
        <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 24, color: C.blush, lineHeight: 1.15, marginTop: 4 }}>Offrez-vous le meilleur !</div>
        <div style={{ fontSize: 12.5, color: C.inkSoft, marginTop: 8, lineHeight: 1.5 }}>Des produits de qualité pour des résultats professionnels.</div>
        <button onClick={() => { setNouveaux(false); setCat("Tous"); setTri("vedette"); }} style={{ ...btnPrim, background: C.gold, marginTop: 12, padding: "9px 16px" }}>Voir nos offres →</button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", color: C.ink }}>
      {/* ---------- BANYÈ ---------- */}
      <div style={{ borderRadius: 16, overflow: "hidden", background: "linear-gradient(100deg, #FBE4EE 0%, #F9D9E7 55%, #F5C6DA 100%)", padding: large ? "36px 40px" : "24px 20px", position: "relative", marginBottom: 18 }}>
        <div aria-hidden style={{ position: "absolute", right: -40, top: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,.35)" }} />
        <div aria-hidden style={{ position: "absolute", right: 30, bottom: -60, width: 180, height: 180, borderRadius: "50%", background: "rgba(229,36,126,.10)" }} />
        <div style={{ position: "relative", maxWidth: 520 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "4px", color: C.blush }}>BOUTIQUE</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: large ? 46 : 32, fontWeight: 700, color: C.ink, lineHeight: 1.05, marginTop: 6 }}>Nos Produits</div>
          <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: large ? 26 : 20, color: C.blush, marginTop: 4 }}>La beauté à portée de main ♡</div>
          <p style={{ fontSize: 13.5, color: C.inkSoft, lineHeight: 1.6, margin: "12px 0 0", maxWidth: 380 }}>Découvrez notre sélection de produits professionnels pour sublimer votre talent et révéler votre beauté.</p>
        </div>
        {large && <div style={{ position: "absolute", right: 60, top: "50%", transform: "translateY(-50%) rotate(-8deg)", textAlign: "center", fontFamily: "'Dancing Script',cursive", fontSize: 26, color: C.ink, lineHeight: 1.2 }}><div style={{ fontSize: 30, color: C.gold }}>♛</div>Qualité<br />Proximité<br />Passion ♡</div>}
      </div>

      {/* ---------- BAR TRI ---------- */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: C.inkSoft }}>🏠 Accueil › <span style={{ color: C.ink, fontWeight: 700 }}>Boutique</span> <span style={{ color: C.inkFaint }}>· {liste.length} produit{liste.length > 1 ? "s" : ""}</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!large && <button onClick={() => setFiltresOuverts((v) => !v)} style={{ ...btnGhost, padding: "8px 12px", fontSize: 12 }}>☰ Filtres</button>}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Rechercher" style={{ ...input, width: large ? 180 : 130, padding: "8px 11px", fontSize: 12.5 }} />
          <select value={tri} onChange={(e) => setTri(e.target.value)} style={{ ...input, width: "auto", padding: "8px 11px", fontSize: 12.5 }}>
            <option value="vedette">En vedette</option><option value="nouveau">Nouveautés</option><option value="prix_asc">Prix croissant</option><option value="prix_desc">Prix décroissant</option>
          </select>
        </div>
      </div>

      {/* ---------- KÒ ---------- */}
      <div style={{ display: "grid", gridTemplateColumns: large ? "220px 1fr" : "1fr", gap: 18, alignItems: "start" }}>
        {(large || filtresOuverts) && <div><Filtres /></div>}
        <div>
          {chargement ? <Carte style={{ padding: 30, textAlign: "center", color: C.inkSoft }}>Chargement…</Carte>
            : visibles.length === 0 ? <Carte style={{ padding: 30, textAlign: "center" }}><div style={{ fontSize: 30 }}>🛍️</div><p style={{ margin: "10px 0 0", fontSize: 13, color: C.inkSoft }}>Aucun produit ne correspond à ces filtres.</p></Carte>
            : <div style={{ display: "grid", gridTemplateColumns: large ? "repeat(auto-fill, minmax(190px, 1fr))" : "repeat(2, 1fr)", gap: 14 }}>
                {visibles.map((p) => <Produit key={p.id} p={p} q={qte(p.id)} ajouter={ajouter} retirer={retirer} />)}
              </div>}
          {nbPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 22 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ ...btnGhost, padding: "7px 11px", opacity: page === 1 ? 0.4 : 1 }}>‹</button>
              {Array.from({ length: nbPages }, (_, i) => i + 1).map((n) => <button key={n} onClick={() => setPage(n)} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer", background: n === page ? C.blush : "#fff", color: n === page ? "#fff" : C.ink, fontWeight: 700, fontSize: 13 }}>{n}</button>)}
              <button onClick={() => setPage((p) => Math.min(nbPages, p + 1))} disabled={page === nbPages} style={{ ...btnGhost, padding: "7px 11px", opacity: page === nbPages ? 0.4 : 1 }}>›</button>
            </div>
          )}
        </div>
      </div>

      {/* ---------- PYE ---------- */}
      <div style={{ marginTop: 28, borderRadius: 14, background: C.rose, padding: large ? "22px 28px" : "18px 16px", display: "grid", gridTemplateColumns: large ? "1fr 1fr 1fr auto" : "1fr", gap: 14, alignItems: "center" }}>
        {[["🚚", "Livraison rapide", "à travers le pays"], ["🛡️", "Produits authentiques", "et de qualité"], ["🎧", "Service client", "à votre écoute"]].map(([e, t, s]) => <div key={t} style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 22 }}>{e}</span><div><div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{t}</div><div style={{ fontSize: 11.5, color: C.inkSoft }}>{s}</div></div></div>)}
        <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 24, color: C.blush, textAlign: large ? "right" : "center" }}>Miss Thani ♡</div>
      </div>

      {/* ---------- BOUTON PANYE ---------- */}
      {nb > 0 && (
        <div style={{ position: "fixed", right: 18, bottom: large ? 24 : 84, zIndex: 40 }}>
          <button onClick={() => setPhase("panier")} style={{ ...btnPrim, borderRadius: 999, padding: "13px 20px", boxShadow: "0 10px 24px rgba(229,36,126,.40)", fontSize: 13.5 }}>🛒 {nb} · {gdes(total)} · Commander ›</button>
        </div>
      )}
    </div>
  );
}
