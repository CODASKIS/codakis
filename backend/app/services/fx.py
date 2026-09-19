"""Devises par pays — les prix affichés et facturés viennent de la même table."""

from __future__ import annotations

from dataclasses import dataclass

# Franc CFA arrimé à l'euro (parité officielle).
XAF_PER_EUR = 655.957

# Taux de secours EUR → devise (XAF/XOF sont fixes).
RATES_FROM_EUR: dict[str, float] = {
    "EUR": 1.0,
    "XAF": XAF_PER_EUR,
    "XOF": XAF_PER_EUR,
    "USD": 1.08,
    "GBP": 0.85,
    "CAD": 1.48,
}


@dataclass(frozen=True)
class CountryQuote:
    country: str
    name: str
    currency: str
    symbol: str
    # Code ISO-3 attendu par PawaPay. None = pas de Mobile Money sur ce pays.
    pawapay_country: str | None


COUNTRIES: dict[str, CountryQuote] = {
    "CM": CountryQuote("CM", "Cameroun", "XAF", "FCFA", "CMR"),
    "GA": CountryQuote("GA", "Gabon", "XAF", "FCFA", "GAB"),
    "CG": CountryQuote("CG", "Congo-Brazzaville", "XAF", "FCFA", "COG"),
    "TD": CountryQuote("TD", "Tchad", "XAF", "FCFA", "TCD"),
    "CF": CountryQuote("CF", "Centrafrique", "XAF", "FCFA", "CAF"),
    "GQ": CountryQuote("GQ", "Guinée Équatoriale", "XAF", "FCFA", "GNQ"),
    "CI": CountryQuote("CI", "Côte d'Ivoire", "XOF", "FCFA", "CIV"),
    "SN": CountryQuote("SN", "Sénégal", "XOF", "FCFA", "SEN"),
    "FR": CountryQuote("FR", "France / Zone Euro", "EUR", "€", None),
    "US": CountryQuote("US", "États-Unis / Autre", "USD", "$", None),
    "GB": CountryQuote("GB", "Royaume-Uni", "GBP", "£", None),
    "CA": CountryQuote("CA", "Canada", "CAD", "CA$", None),
}


def resolve_country(country_code: str | None) -> CountryQuote:
    code = (country_code or "CM").strip().upper()
    return COUNTRIES.get(code, COUNTRIES["CM"])


def convert_from_xaf(amount_xaf: int, currency: str) -> int:
    """Convertit un montant de référence XAF vers la devise du pays."""
    if amount_xaf <= 0:
        return 0
    target = currency.upper()
    if target in {"XAF", "XOF"}:
        return int(amount_xaf)
    rate = RATES_FROM_EUR.get(target)
    if not rate:
        return int(amount_xaf)
    amount = (amount_xaf / XAF_PER_EUR) * rate
    return max(1, int(round(amount)))
