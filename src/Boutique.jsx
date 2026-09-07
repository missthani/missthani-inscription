import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================
   MISS THANI — BOUTIQUE
   Ouverte aux élèves et au public.
   Panier → commande → preuve de paiement (Supabase).
   ============================================================ */

const C = {
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

const PAIEMENT = { moncash: "509 4643 3016", natcash: "509 4643 3016" };

const gdes = (n) => Number(n || 0).toLocaleString("fr-FR") + " gdes";

function telOk(v) {
  let d = String(v || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("509")) d = d.slice(3);
  return /^[234]\d{7}$/.test(d) ? d : "";
}

const input = { width: "100%", padding: "11px 13px", borderRadius: 12, border: `1.4px solid ${C.line}`, background: "#FCF7FA", color: C.ink, fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none" };
const label = { display: "block", fontSize: 11.5, fontWeight: 700, color: C.inkSoft, marginBottom: 6 };
const btnPrim = { border: "none", borderRadius: 999, padding: "13px 18px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, boxShadow: "0 8px 18px rgba(229,36,126,.28)", fontFamily: "'Inter',sans-serif" };
const btnGhost = { border: `1.4px solid ${C.line}`, borderRadius: 999, padding: "13px 18px", background: "#fff", color: C.ink, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Inter',sans-serif" };

function Carte({ children, style }) {
  return <div style={{ background: C.card, borderRadius: 20, padding: "18px 20px", boxShadow: "0 10px 28px rgba(142,44,154,.10)", ...style }}>{children}</div>;
}

function TitreBloc({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 4, height: 26, borderRadius: 999, background: `linear-gradient(180deg, ${C.blush}, ${C.magenta})`, flexShrink: 0 }} />
      <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: 18.5, fontWeight: 700, color: C.ink, lineHeight: 1.15 }}>{children}</h1>
    </div>
  );
}

export default function Boutique() {
  const [produits, setProduits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [cat, setCat] = useState("Tous");
  const [panier, setPanier] = useState({});          // { produit_id: quantite }
  const [phase, setPhase] = useState("boutique");    // boutique · panier · paiement · recu
  const [f, setF] = useState({ nom: "", telephone: "", adresse: "", mode: "retrait" });
  const [erreur, setErreur] = useState("");
  const [busy, setBusy] = useState(false);
  const idsRef = useRef({ commande: null, profil: null });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("produits").select("*").eq("visible", true).order("ordre");
      setProduits(data || []);
      setChargement(false);
    })();
  }, []);

  const cats = ["Tous", ...Array.from(new Set(produits.map((p) => p.categorie).filter(Boolean)))];
  const liste = produits.filter((p) => cat === "Tous" || p.categorie === cat);

  const qte = (id) => panier[id] || 0;
  const ajouter = (id) => setPanier((x) => ({ ...x, [id]: (x[id] || 0) + 1 }));
  const retirer = (id) => setPanier((x) => {
    const n = (x[id] || 0) - 1;
    const c = { ...x };
    if (n <= 0) delete c[id]; else c[id] = n;
    return c;
  });

  const lignes = Object.keys(panier).map((id) => {
    const p = produits.find((x) => x.id === id);
    return p ? { p, q: panier[id], sous: Number(p.prix_public) * panier[id] } : null;
  }).filter(Boolean);

  const total = lignes.reduce((s, l) => s + l.sous, 0);
  const nbArticles = lignes.reduce((s, l) => s + l.q, 0);

  /* ---- Anrejistre kòmand la ---- */
  const commander = async () => {
    setErreur("");
    if (!f.nom.trim()) { setErreur("Indiquez votre nom."); return; }
    if (!telOk(f.telephone)) { setErreur("Le numéro doit contenir 8 chiffres et commencer par 2, 3 ou 4."); return; }
    if (f.mode === "livraison" && !f.adresse.trim()) { setErreur("Indiquez l'adresse de livraison."); return; }
    setBusy(true);
    try {
      const { data: cmd, error: e1 } = await supabase.from("commandes").insert({
        nom_client: f.nom.trim(),
        telephone: telOk(f.telephone),
        adresse: f.adresse.trim() || null,
        total,
        mode_livraison: f.mode,
        statut: "a_preparer",
      }).select().single();
      if (e1) throw e1;
      idsRef.current.commande = cmd.id;

      const rows = lignes.map((l) => ({
        commande_id: cmd.id,
        produit_id: l.p.id,
        nom_produit: l.p.nom,
        quantite: l.q,
        prix_unitaire: Number(l.p.prix_public),
      }));
      const { error: e2 } = await supabase.from("commande_lignes").insert(rows);
      if (e2) throw e2;

      setPhase("paiement");
    } catch (err) {
      setErreur("La commande n'a pas abouti. Vérifiez votre connexion et réessayez.");
    }
    setBusy(false);
  };

  /* ---- Voye prèv peman an ---- */
  const envoyerPreuve = async (file, mode) => {
    if (!file) return;
    setBusy(true); setErreur("");
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const chemin = `boutique/${idsRef.current.commande}/${Date.now()}.${ext}`;
      const { error: eUp } = await supabase.storage.from("preuves").upload(chemin, file);
      if (eUp) throw eUp;
      const { data: pub } = supabase.storage.from("preuves").getPublicUrl(chemin);

      const { data: paiement, error: e1 } = await supabase.from("paiements").insert({
        objet: "commande",
        commande_id: idsRef.current.commande,
        montant: total,
        mode,
        statut: "en_attente",
      }).select().single();
      if (e1) throw e1;

      const { error: e2 } = await supabase.from("preuves_paiement").insert({ paiement_id: paiement.id, image_url: pub.publicUrl });
      if (e2) throw e2;

      setPhase("recu");
    } catch (err) {
      setErreur("L'envoi de la photo a échoué. Réessayez avec une image plus légère.");
    }
    setBusy(false);
  };

  const recommencer = () => {
    setPanier({}); setPhase("boutique"); setErreur("");
    setF({ nom: "", telephone: "", adresse: "", mode: "retrait" });
    idsRef.current = { commande: null, profil: null };
  };

  /* ================= EKRAN: KONFIMASYON ================= */
  if (phase === "recu") {
    return (
      <Carte style={{ textAlign: "center", padding: "28px 22px" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(150deg, ${C.blush}, ${C.magenta})`, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 800 }}>✓</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: C.ink, marginTop: 12 }}>Commande reçue, {f.nom.split(" ")[0]} !</div>
        <p style={{ margin: "8px 0 0", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.6 }}>
          Nous vérifions votre paiement et préparons votre commande.
          {f.mode === "retrait" ? " Vous serez prévenue dès qu'elle est prête au local." : " La livraison vous sera confirmée sur WhatsApp."}
        </p>
        <button onClick={recommencer} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: C.inkFaint, marginTop: 14 }}>Retour à la boutique</button>
      </Carte>
    );
  }

  /* ================= EKRAN: PEMAN ================= */
  if (phase === "paiement") {
    return (
      <Carte>
        <TitreBloc>Finalisez votre commande</TitreBloc>
        <p style={{ margin: "10px 0 12px", fontSize: 12.5, color: C.inkSoft, lineHeight: 1.55 }}>
          Payez via MonCash ou NatCash, puis envoyez-nous la photo de la preuve de paiement.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
          {[["MonCash", PAIEMENT.moncash], ["NatCash", PAIEMENT.natcash]].map(([nom, num]) => (
            <div key={nom} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 13px", borderRadius: 12, border: `1px solid ${C.line}`, background: "#FCF7FA" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.magenta }}>{nom}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: C.ink }}>{num}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 13px", borderRadius: 12, background: "rgba(229,36,126,.07)", border: "1px solid rgba(229,36,126,.25)", marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.inkSoft }}>Montant à payer</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: C.blush }}>{gdes(total)}</span>
        </div>
        {erreur && <p style={{ fontSize: 12, color: C.danger, margin: "0 0 10px" }}>{erreur}</p>}
        <label style={{ ...btnPrim, width: "100%", opacity: busy ? 0.6 : 1 }}>
          {busy ? "Envoi en cours…" : "📷 Envoyer la preuve de paiement"}
          <input type="file" accept="image/*" style={{ display: "none" }} disabled={busy} onChange={(e) => envoyerPreuve(e.target.files && e.target.files[0], "moncash")} />
        </label>
        <a href={`https://wa.me/50946433016?text=${encodeURIComponent(`Bonjou, mwen se ${f.nom}. Mwen fè yon kòmand nan boutik la pou ${gdes(total)}.`)}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGhost, width: "100%", textDecoration: "none", marginTop: 8 }}>
          Écrire sur WhatsApp
        </a>
      </Carte>
    );
  }

  /* ================= EKRAN: PANYE ================= */
  if (phase === "panier") {
    return (
      <>
        <Carte>
          <TitreBloc>Votre panier</TitreBloc>
          <div style={{ marginTop: 14 }}>
            {lignes.map((l) => (
              <div key={l.p.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: `1px solid ${C.line}` }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(229,36,126,.10)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{l.p.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{l.p.nom}</div>
                  <div style={{ fontSize: 11, color: C.inkSoft, marginTop: 1 }}>{gdes(l.p.prix_public)} × {l.q}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <button onClick={() => retirer(l.p.id)} style={{ width: 26, height: 26, borderRadius: "50%", border: `1.2px solid ${C.line}`, background: "#fff", cursor: "pointer", color: C.ink, fontSize: 14 }}>−</button>
                  <span style={{ width: 18, textAlign: "center", fontSize: 13, fontWeight: 800, color: C.ink }}>{l.q}</span>
                  <button onClick={() => ajouter(l.p.id)} style={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, cursor: "pointer", color: "#fff", fontSize: 14 }}>+</button>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.inkSoft }}>Total</span>
              <span style={{ fontSize: 19, fontWeight: 800, color: C.blush }}>{gdes(total)}</span>
            </div>
          </div>
        </Carte>

        <Carte style={{ marginTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.magenta, letterSpacing: ".3px", marginBottom: 12 }}>VOS COORDONNÉES</div>
          <div style={{ marginBottom: 12 }}>
            <label style={label}>Nom complet</label>
            <input style={input} value={f.nom} onChange={(e) => { setF({ ...f, nom: e.target.value }); setErreur(""); }} placeholder="Naïka Pierre" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={label}>WhatsApp</label>
            <input style={input} inputMode="tel" value={f.telephone} onChange={(e) => { setF({ ...f, telephone: e.target.value }); setErreur(""); }} placeholder="3712 3456" />
          </div>
          <label style={label}>Mode de réception</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[["retrait", "Retrait au local"], ["livraison", "Livraison"]].map(([k, t]) => {
              const on = f.mode === k;
              return (
                <button key={k} onClick={() => setF({ ...f, mode: k })} style={{ flex: 1, padding: "10px 8px", borderRadius: 999, fontSize: 12.5, fontWeight: 700, cursor: "pointer", border: `1.4px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink }}>{t}</button>
              );
            })}
          </div>
          {f.mode === "livraison" && (
            <div style={{ marginBottom: 12 }}>
              <label style={label}>Adresse de livraison</label>
              <input style={input} value={f.adresse} onChange={(e) => { setF({ ...f, adresse: e.target.value }); setErreur(""); }} placeholder="Pétion-Ville, Morne Hercule" />
            </div>
          )}
          {erreur && <p style={{ fontSize: 12, color: C.danger, margin: "0 0 10px", lineHeight: 1.5 }}>{erreur}</p>}
          <div style={{ display: "flex", gap: 9 }}>
            <button onClick={() => setPhase("boutique")} style={{ ...btnGhost, flex: 1 }}>Retour</button>
            <button onClick={commander} disabled={busy} style={{ ...btnPrim, flex: 2, opacity: busy ? 0.6 : 1 }}>
              {busy ? "…" : "Valider la commande"}
            </button>
          </div>
        </Carte>
      </>
    );
  }

  /* ================= EKRAN: BOUTIK ================= */
  return (
    <>
      {/* Blòk anlè */}
      <div style={{ borderRadius: 22, padding: "18px 20px", background: `linear-gradient(120deg, ${C.blush} 0%, ${C.magenta} 65%)`, position: "relative", overflow: "hidden", color: "#fff" }}>
        <div aria-hidden style={{ position: "absolute", right: -26, bottom: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.12)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".5px", opacity: 0.9 }}>OUVERTE À TOUS</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, marginTop: 3 }}>La boutique</div>
          <div style={{ fontSize: 12, opacity: 0.92, marginTop: 4, maxWidth: 300, lineHeight: 1.5 }}>
            Kits, matériel et uniformes — commandez sans créer de compte.
          </div>
          {nbArticles > 0 && (
            <button onClick={() => setPhase("panier")} style={{ marginTop: 14, border: "none", borderRadius: 999, padding: "11px 18px", background: "#fff", color: C.magenta, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
              🛒 Voir le panier · {nbArticles} article{nbArticles > 1 ? "s" : ""} · {gdes(total)}
            </button>
          )}
        </div>
      </div>

      {/* Kategori */}
      <div className="mt-row" style={{ display: "flex", gap: 7, overflowX: "auto", padding: "16px 0 4px" }}>
        {cats.map((k) => {
          const on = cat === k;
          return (
            <button key={k} onClick={() => setCat(k)} style={{ flexShrink: 0, padding: "8px 15px", borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1.3px solid ${on ? C.magenta : C.line}`, background: on ? C.magenta : "#fff", color: on ? "#fff" : C.ink, whiteSpace: "nowrap" }}>{k}</button>
          );
        })}
      </div>

      {/* Pwodwi yo */}
      {chargement ? (
        <Carte style={{ marginTop: 12 }}><p style={{ margin: 0, fontSize: 13, color: C.inkSoft, textAlign: "center" }}>Chargement…</p></Carte>
      ) : liste.length === 0 ? (
        <Carte style={{ marginTop: 12, textAlign: "center", padding: "26px 20px" }}>
          <div style={{ fontSize: 30 }}>🛍️</div>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: C.inkSoft }}>Aucun produit dans cette catégorie pour le moment.</p>
        </Carte>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 12 }}>
          {liste.map((p) => {
            const q = qte(p.id);
            const rupture = Number(p.stock) <= 0;
            return (
              <Carte key={p.id} style={{ padding: 13, opacity: rupture ? 0.6 : 1 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 62, height: 62, borderRadius: 14, background: "linear-gradient(150deg,#F2CFE0,#E8A9C6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{p.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{p.nom}</span>
                      {rupture && <span style={{ fontSize: 9.5, fontWeight: 800, color: C.danger, background: "rgba(192,57,43,.10)", padding: "2px 8px", borderRadius: 999 }}>RUPTURE</span>}
                      {!rupture && Number(p.stock) <= 5 && <span style={{ fontSize: 9.5, fontWeight: 800, color: "#9A7000", background: "rgba(224,165,10,.16)", padding: "2px 8px", borderRadius: 999 }}>{p.stock} restants</span>}
                    </div>
                    {p.description && <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 3, lineHeight: 1.45 }}>{p.description}</div>}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9, gap: 10 }}>
                      <div>
                        <span style={{ fontSize: 16, fontWeight: 800, color: C.magenta }}>{gdes(p.prix_public)}</span>
                        {p.prix_eleve && <span style={{ fontSize: 10.5, color: C.inkFaint, marginLeft: 7 }}>élève : {gdes(p.prix_eleve)}</span>}
                      </div>
                      {rupture ? null : q === 0 ? (
                        <button onClick={() => ajouter(p.id)} style={{ border: "none", borderRadius: 999, padding: "8px 15px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 12.5, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>Ajouter</button>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                          <button onClick={() => retirer(p.id)} style={{ width: 28, height: 28, borderRadius: "50%", border: `1.2px solid ${C.line}`, background: "#fff", cursor: "pointer", color: C.ink, fontSize: 15 }}>−</button>
                          <span style={{ width: 18, textAlign: "center", fontSize: 13.5, fontWeight: 800, color: C.ink }}>{q}</span>
                          <button onClick={() => ajouter(p.id)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, cursor: "pointer", color: "#fff", fontSize: 15 }}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Carte>
            );
          })}
        </div>
      )}

      {/* Bar panye ki kole anba a */}
      {nbArticles > 0 && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 74, display: "flex", justifyContent: "center", padding: "0 20px", zIndex: 25, pointerEvents: "none" }}>
          <button onClick={() => setPhase("panier")} style={{ pointerEvents: "auto", width: "100%", maxWidth: 480, border: "none", borderRadius: 999, padding: "13px 20px", background: `linear-gradient(135deg, ${C.blush}, ${C.magenta})`, color: "#fff", fontSize: 13.5, fontWeight: 800, cursor: "pointer", boxShadow: "0 10px 24px rgba(229,36,126,.40)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>🛒 {nbArticles} article{nbArticles > 1 ? "s" : ""}</span>
            <span>{gdes(total)} · Commander ›</span>
          </button>
        </div>
      )}
    </>
  );
}
