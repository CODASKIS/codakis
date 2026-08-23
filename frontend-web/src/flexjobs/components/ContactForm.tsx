import Button from "./Button";

export default function ContactForm() {
  return (
    <form
      className="fj-card"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="fj-card__body">
        <h2 className="text-[2rem] mb-4">Envoyez-nous un message</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="fj-form-group">
            <label className="fj-label" htmlFor="firstName">
              Prénom
            </label>
            <input id="firstName" name="firstName" className="fj-input" required />
          </div>
          <div className="fj-form-group">
            <label className="fj-label" htmlFor="lastName">
              Nom
            </label>
            <input id="lastName" name="lastName" className="fj-input" required />
          </div>
        </div>
        <div className="fj-form-group">
          <label className="fj-label" htmlFor="email">
            E-mail
          </label>
          <input id="email" name="email" type="email" className="fj-input" required />
        </div>
        <div className="fj-form-group">
          <label className="fj-label" htmlFor="subject">
            Objet
          </label>
          <select id="subject" name="subject" className="fj-select" required defaultValue="">
            <option value="" disabled>
              Choisissez un sujet
            </option>
            <option value="forfait">Question sur les forfaits</option>
            <option value="certification">Certification technicien</option>
            <option value="annuaire">Accès à l&apos;annuaire</option>
            <option value="entreprise">Compte entreprise</option>
            <option value="autre">Autre demande</option>
          </select>
        </div>
        <div className="fj-form-group">
          <label className="fj-label" htmlFor="message">
            Message
          </label>
          <textarea id="message" name="message" className="fj-textarea" rows={5} required />
        </div>
        <Button type="submit">Envoyer</Button>
      </div>
    </form>
  );
}
