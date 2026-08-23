// Loader dashboard — même panneau CODAKIS que la vitrine

export default function Loader() {
  return (
    <div className="codakis-loader-overlay codakis-loader-overlay--admin">
      <div className="codakis-loader-panel">
        <img
          src="/images/logo-simple.png"
          alt=""
          className="codakis-loader-panel__logo"
          width={40}
          height={40}
          aria-hidden
        />
        <div className="codakis-loader-panel__spinner" aria-hidden />
      </div>
    </div>
  );
}
