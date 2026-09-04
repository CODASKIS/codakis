import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import Loader from "../../../components/common/Loader";
import { clearSession, getSession, setSession } from "../../../auth/authStore";
import { fetchMe, updateProfile, userToSession } from "../../../lib/authApi";

type Tab = "compte" | "securite";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("compte");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [typePermis, setTypePermis] = useState("");
  const [parcours, setParcours] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetchMe()
      .then((user) => {
        if (cancelled) return;
        setFirstName(user.first_name);
        setLastName(user.last_name);
        setPhone(user.phone ?? "");
        setTypePermis(user.type_permis ?? "");
        setParcours(user.parcours_souhaite ?? "");
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Profil indisponible");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const user = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
      });
      setSession(userToSession(user));
      setMessage("Profil mis à jour.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    clearSession();
    navigate("/connexion", { replace: true });
  }

  if (loading) return <Loader variant="page" />;

  return (
    <div className="ck-settings">
      <nav className="ck-settings__nav" aria-label="Paramètres">
        <button type="button" className={tab === "compte" ? "is-active" : undefined} onClick={() => setTab("compte")}>
          Gérer le compte
        </button>
        <button type="button" className={tab === "securite" ? "is-active" : undefined} onClick={() => setTab("securite")}>
          Mot de passe
        </button>
        <Link to="/espace/candidat/preferences" className={undefined}>
          Préférences
        </Link>
      </nav>

      <div className="ck-settings__panel">
        {tab === "compte" ? (
          <>
            <h1 className="ck-title">Gérer le compte</h1>
            <p className="ck-subtitle">{getSession()?.email}</p>

            <div className="ck-settings__section">
              <h2>Cours</h2>
              <label className="ck-form" style={{ display: "block" }}>
                <select value={typePermis || "permis_b"} disabled>
                  <option value="permis_b">Permis B</option>
                  <option value="permis_a">Permis A</option>
                  <option value="permis_c">Permis C</option>
                </select>
              </label>
              {parcours ? (
                <p className="ck-subtitle" style={{ marginTop: "0.8rem", marginBottom: 0 }}>
                  Parcours : {parcours}
                </p>
              ) : null}
            </div>

            <form className="ck-form ck-settings__section" onSubmit={(e) => void onSubmit(e)}>
              <h2>Identité</h2>
              <label>
                Prénom
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </label>
              <label>
                Nom
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </label>
              <label>
                Téléphone
                <input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </label>
              {error ? <p className="ck-empty">{error}</p> : null}
              {message ? (
                <p className="ck-empty" style={{ color: "var(--ck-green)" }}>
                  {message}
                </p>
              ) : null}
              <button type="submit" className="ck-btn ck-btn--primary" disabled={saving}>
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </form>

            <div className="ck-settings__section">
              <h2>Liens</h2>
              <Link to="/espace/candidat/consort" className="ck-settings__link">
                Dossier Consort
              </Link>
              <Link to="/espace/candidat/auto-ecole" className="ck-settings__link">
                Auto-école & forfaits
              </Link>
              <a href="/mentions-legales" className="ck-settings__link">
                Termes et conditions
              </a>
              <a href="/confidentialite" className="ck-settings__link">
                Politique de confidentialité
              </a>
            </div>

            <button type="button" className="ck-settings__danger" onClick={logout}>
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            <h1 className="ck-title">Mot de passe</h1>
            <p className="ck-subtitle">Sécurité de votre compte.</p>

            <div className="ck-settings__section">
              <h2>Sécurité</h2>
              <Link to="/mot-de-passe-oublie" className="ck-settings__link">
                Changer le mot de passe
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
