import { Link } from "react-router";

export default function GerantHomePage() {
  return (
    <div className="ck-card">
      <h1 className="ck-title">Espace gérant</h1>
      <p className="ck-subtitle">Gérez forfaits, inscriptions et séances.</p>
      <div className="ck-list">
        <Link to="/espace/gerant/forfaits" className="ck-list__row">
          <span style={{ flex: 1 }}>
            <strong>Forfaits</strong>
            <small>Offres publiées sur la vitrine</small>
          </span>
        </Link>
        <Link to="/espace/gerant/inscriptions" className="ck-list__row">
          <span style={{ flex: 1 }}>
            <strong>Inscriptions</strong>
            <small>Élèves rattachés à votre auto-école</small>
          </span>
        </Link>
        <Link to="/espace/gerant/seances" className="ck-list__row">
          <span style={{ flex: 1 }}>
            <strong>Séances</strong>
            <small>Planifier et suivre la conduite</small>
          </span>
        </Link>
      </div>
    </div>
  );
}
