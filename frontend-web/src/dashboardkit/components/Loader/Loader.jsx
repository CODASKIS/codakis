// Loader dashboard — logo CODAKIS animé

export default function Loader() {
  return (
    <div className="codakis-loader-overlay codakis-loader-overlay--admin">
      <div className="codakis-loader-panel">
        <img
          src="/images/logo-simple.png"
          alt=""
          className="codakis-loader-panel__logo codakis-loader-panel__logo--spin"
          width={48}
          height={48}
          aria-hidden
        />
      </div>
    </div>
  );
}
