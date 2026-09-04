import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { AUTH_PATHS } from "../../constants/authPaths";
import { CEMAC_COUNTRIES } from "../../data/cemacCountries";
import { supportedLanguages } from "../../i18n";
import { AuthApiError, getPostLoginPath, isAuthenticatedForRole, registerDrivingSchool } from "../../auth/authStore";
import PageBreadcrumb from "../components/PageBreadcrumb";

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  showLabel,
  hideLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  placeholder: string;
  showLabel: string;
  hideLabel: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="fj-form-group">
      <label className="fj-label" htmlFor={id}>
        {label}
      </label>
      <div className="fj-auth-password">
        <input
          id={id}
          type={visible ? "text" : "password"}
          className="fj-input"
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required
        />
        <button
          type="button"
          className="fj-auth-password__toggle"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
        >
          {visible ? hideLabel : showLabel}
        </button>
      </div>
    </div>
  );
}

export default function SchoolRegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [schoolName, setSchoolName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("cm");
  const [mintRegistration, setMintRegistration] = useState("");
  const [rccm, setRccm] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [fullName, setFullName] = useState("");
  const [managerRole, setManagerRole] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instructorCount, setInstructorCount] = useState("");
  const [vehicleCount, setVehicleCount] = useState("");
  const [yearsOperating, setYearsOperating] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [language, setLanguage] = useState(i18n.language);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticatedForRole("gerant")) {
    return <Navigate to={getPostLoginPath("gerant")} replace />;
  }

  function applyLanguage() {
    if (language !== i18n.language) {
      void i18n.changeLanguage(language);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (
      !schoolName.trim() ||
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !phone.trim() ||
      !city.trim() ||
      !country
    ) {
      setError(t("auth.errors.required"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("schoolRegister.errors.passwordMismatch"));
      return;
    }

    if (!acceptTerms) {
      setError(t("schoolRegister.errors.termsRequired"));
      return;
    }

    applyLanguage();

    void (async () => {
      setLoading(true);
      try {
        const message = await registerDrivingSchool(
          {
            fullName: fullName.trim(),
            username: email.trim(),
            password,
            phone: phone.trim(),
            city: city.trim(),
            country,
            schoolName: schoolName.trim(),
            schoolAddress: schoolAddress.trim() || undefined,
            mintRegistration: mintRegistration.trim() || undefined,
            legalName: legalName.trim() || undefined,
            rccm: rccm.trim() || undefined,
            website: website.trim() || undefined,
            description: description.trim() || undefined,
            managerRole: managerRole.trim() || undefined,
            instructorCount: instructorCount.trim() || undefined,
            vehicleCount: vehicleCount.trim() || undefined,
            yearsOperating: yearsOperating.trim() || undefined,
          },
          language.startsWith("en") ? "en" : "fr",
        );
        setSuccess(message);
        navigate(AUTH_PATHS.login, { replace: true, state: { schoolRegistered: true } });
      } catch (err) {
        setError(err instanceof AuthApiError ? err.message : t("auth.errors.generic"));
      } finally {
        setLoading(false);
      }
    })();
  }

  const benefits = t("schoolRegister.benefits", { returnObjects: true }) as Array<{
    title: string;
    text: string;
  }>;

  return (
    <>
      <PageMeta title={t("schoolRegister.metaTitle")} description={t("schoolRegister.metaDescription")} />

      <div className="ck-auth-register">
        <aside className="ck-auth-register__card" aria-label={t("schoolRegister.benefitsTitle")}>
          <h1 className="ck-page-title" style={{ fontSize: "2.4rem" }}>
            {t("schoolRegister.title")}
          </h1>
          <p className="ck-page-lead">{t("schoolRegister.intro")}</p>
          <p className="ck-page-lead">{t("schoolRegister.verificationHint")}</p>
          <div className="ck-page-stack" style={{ marginTop: "2rem" }}>
            {benefits.map((benefit) => (
              <article key={benefit.title} className="ck-home-step">
                <span className="ck-home-step__num" aria-hidden>
                  ✓
                </span>
                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <div className="ck-auth-register__card">
          <PageBreadcrumb
            items={[
              { label: t("breadcrumb.home"), to: "/" },
              { label: t("schoolRegister.breadcrumb") },
            ]}
          />

          <form className="fj-signup-form-box" onSubmit={handleSubmit} noValidate style={{ border: 0, boxShadow: "none", padding: 0 }}>
            <h2 className="fj-signup-form-heading">{t("schoolRegister.formTitle")}</h2>

                <fieldset className="mb-8 border-0 p-0">
                  <legend className="fj-signup-form-heading text-left justify-start mb-4 text-[1.6rem]">
                    {t("schoolRegister.sections.establishment")}
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="fj-form-group sm:col-span-2">
                      <label className="fj-label" htmlFor="schoolName">
                        {t("auth.fields.schoolName")} *
                      </label>
                      <input
                        id="schoolName"
                        className="fj-input"
                        value={schoolName}
                        onChange={(event) => setSchoolName(event.target.value)}
                        placeholder={t("auth.fields.schoolNamePlaceholder")}
                        required
                      />
                    </div>
                    <div className="fj-form-group sm:col-span-2">
                      <label className="fj-label" htmlFor="legalName">
                        {t("schoolRegister.fields.legalName")}
                      </label>
                      <input
                        id="legalName"
                        className="fj-input"
                        value={legalName}
                        onChange={(event) => setLegalName(event.target.value)}
                        placeholder={t("schoolRegister.fields.legalNamePlaceholder")}
                      />
                    </div>
                    <div className="fj-form-group sm:col-span-2">
                      <label className="fj-label" htmlFor="schoolAddress">
                        {t("auth.fields.schoolAddress")} *
                      </label>
                      <input
                        id="schoolAddress"
                        className="fj-input"
                        value={schoolAddress}
                        onChange={(event) => setSchoolAddress(event.target.value)}
                        placeholder={t("auth.fields.schoolAddressPlaceholder")}
                        required
                      />
                    </div>
                    <div className="fj-form-group">
                      <label className="fj-label" htmlFor="city">
                        {t("auth.fields.city")} *
                      </label>
                      <input
                        id="city"
                        className="fj-input"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        placeholder={t("auth.fields.cityPlaceholder")}
                        required
                      />
                    </div>
                    <div className="fj-form-group">
                      <label className="fj-label" htmlFor="country">
                        {t("auth.fields.country")} *
                      </label>
                      <select
                        id="country"
                        className="fj-select"
                        value={country}
                        onChange={(event) => setCountry(event.target.value)}
                        required
                      >
                        {CEMAC_COUNTRIES.map((item) => (
                          <option key={item.code} value={item.code}>
                            {t(`coverage.countries.${item.nameKey}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="fj-form-group">
                      <label className="fj-label" htmlFor="mintRegistration">
                        {t("auth.fields.mintRegistration")}
                      </label>
                      <input
                        id="mintRegistration"
                        className="fj-input"
                        value={mintRegistration}
                        onChange={(event) => setMintRegistration(event.target.value)}
                        placeholder={t("auth.fields.mintRegistrationPlaceholder")}
                      />
                    </div>
                    <div className="fj-form-group">
                      <label className="fj-label" htmlFor="rccm">
                        {t("schoolRegister.fields.rccm")}
                      </label>
                      <input
                        id="rccm"
                        className="fj-input"
                        value={rccm}
                        onChange={(event) => setRccm(event.target.value)}
                        placeholder={t("schoolRegister.fields.rccmPlaceholder")}
                      />
                    </div>
                    <div className="fj-form-group sm:col-span-2">
                      <label className="fj-label" htmlFor="website">
                        {t("schoolRegister.fields.website")}
                      </label>
                      <input
                        id="website"
                        type="url"
                        className="fj-input"
                        value={website}
                        onChange={(event) => setWebsite(event.target.value)}
                        placeholder={t("schoolRegister.fields.websitePlaceholder")}
                      />
                    </div>
                    <div className="fj-form-group sm:col-span-2">
                      <label className="fj-label" htmlFor="description">
                        {t("schoolRegister.fields.description")}
                      </label>
                      <textarea
                        id="description"
                        className="fj-textarea"
                        rows={4}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder={t("schoolRegister.fields.descriptionPlaceholder")}
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="mb-8 border-0 p-0">
                  <legend className="fj-signup-form-heading text-left justify-start mb-4 text-[1.6rem]">
                    {t("schoolRegister.sections.manager")}
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="fj-form-group sm:col-span-2">
                      <label className="fj-label" htmlFor="fullName">
                        {t("auth.fields.managerName")} *
                      </label>
                      <input
                        id="fullName"
                        className="fj-input"
                        autoComplete="name"
                        value={fullName}
                        onChange={(event) => setFullName(event.target.value)}
                        placeholder={t("auth.fields.managerNamePlaceholder")}
                        required
                      />
                    </div>
                    <div className="fj-form-group">
                      <label className="fj-label" htmlFor="managerRole">
                        {t("schoolRegister.fields.managerRole")}
                      </label>
                      <input
                        id="managerRole"
                        className="fj-input"
                        value={managerRole}
                        onChange={(event) => setManagerRole(event.target.value)}
                        placeholder={t("schoolRegister.fields.managerRolePlaceholder")}
                      />
                    </div>
                    <div className="fj-form-group">
                      <label className="fj-label" htmlFor="phone">
                        {t("auth.fields.phone")} *
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        className="fj-input"
                        autoComplete="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder={t("auth.fields.phonePlaceholder")}
                        required
                      />
                    </div>
                    <div className="fj-form-group sm:col-span-2">
                      <label className="fj-label" htmlFor="email">
                        {t("schoolRegister.fields.email")} *
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="fj-input"
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder={t("auth.fields.emailPlaceholder")}
                        required
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="mb-8 border-0 p-0">
                  <legend className="fj-signup-form-heading text-left justify-start mb-4 text-[1.6rem]">
                    {t("schoolRegister.sections.activity")}
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="fj-form-group">
                      <label className="fj-label" htmlFor="instructorCount">
                        {t("schoolRegister.fields.instructorCount")}
                      </label>
                      <input
                        id="instructorCount"
                        type="number"
                        min={0}
                        className="fj-input"
                        value={instructorCount}
                        onChange={(event) => setInstructorCount(event.target.value)}
                        placeholder="3"
                      />
                    </div>
                    <div className="fj-form-group">
                      <label className="fj-label" htmlFor="vehicleCount">
                        {t("schoolRegister.fields.vehicleCount")}
                      </label>
                      <input
                        id="vehicleCount"
                        type="number"
                        min={0}
                        className="fj-input"
                        value={vehicleCount}
                        onChange={(event) => setVehicleCount(event.target.value)}
                        placeholder="5"
                      />
                    </div>
                    <div className="fj-form-group">
                      <label className="fj-label" htmlFor="yearsOperating">
                        {t("schoolRegister.fields.yearsOperating")}
                      </label>
                      <input
                        id="yearsOperating"
                        type="number"
                        min={0}
                        className="fj-input"
                        value={yearsOperating}
                        onChange={(event) => setYearsOperating(event.target.value)}
                        placeholder="10"
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border-0 p-0">
                  <legend className="fj-signup-form-heading text-left justify-start mb-4 text-[1.6rem]">
                    {t("schoolRegister.sections.account")}
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <PasswordField
                      id="password"
                      label={`${t("auth.fields.password")} *`}
                      value={password}
                      onChange={setPassword}
                      autoComplete="new-password"
                      placeholder={t("auth.fields.passwordPlaceholder")}
                      showLabel={t("auth.password.show")}
                      hideLabel={t("auth.password.hide")}
                    />
                    <PasswordField
                      id="confirmPassword"
                      label={`${t("schoolRegister.fields.confirmPassword")} *`}
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      autoComplete="new-password"
                      placeholder={t("schoolRegister.fields.confirmPasswordPlaceholder")}
                      showLabel={t("auth.password.show")}
                      hideLabel={t("auth.password.hide")}
                    />
                    <div className="fj-form-group sm:col-span-2">
                      <label className="fj-label" htmlFor="language">
                        {t("auth.fields.language")}
                      </label>
                      <select
                        id="language"
                        className="fj-select"
                        value={language}
                        onChange={(event) => setLanguage(event.target.value)}
                      >
                        {supportedLanguages.map((lng) => (
                          <option key={lng} value={lng}>
                            {t(`auth.languages.${lng}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="fj-form-group sm:col-span-2">
                      <label className="flex items-start gap-3 text-[1.4rem] leading-snug">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={acceptTerms}
                          onChange={(event) => setAcceptTerms(event.target.checked)}
                          required
                        />
                        <span>
                          {t("schoolRegister.fields.acceptTermsBefore")}{" "}
                          <Link to="/conditions-d-utilisation" className="fj-link">
                            {t("schoolRegister.fields.acceptTermsLink")}
                          </Link>{" "}
                          {t("schoolRegister.fields.acceptTermsAfter")}
                        </span>
                      </label>
                    </div>
                  </div>
                </fieldset>

                {error ? <p className="text-[#c0392b] text-[1.4rem] mt-4">{error}</p> : null}
                {success ? <p className="text-[#27ae60] text-[1.4rem] mt-4">{success}</p> : null}

                <div className="fj-signup-submit">
                  <button type="submit" className="ck-public-btn ck-public-btn--primary fj-signup-submit__btn" disabled={loading}>
                    {loading ? t("common.loading") : t("schoolRegister.submit")}
                  </button>
                </div>

                <p className="text-center text-[1.4rem] mt-6">
                  {t("auth.register.hasAccount")}{" "}
                  <Link to={AUTH_PATHS.login} className="fj-link">
                    {t("auth.register.loginLink")}
                  </Link>
                </p>
              </form>
        </div>
      </div>
    </>
  );
}
