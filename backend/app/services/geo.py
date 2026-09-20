import ipaddress
import logging
import time

import requests

from app.services.fx import COUNTRIES

logger = logging.getLogger("codakis")

NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
USER_AGENT = "CODAKIS/1.0 (contact@codakis.cm)"

# Pays de la zone euro : même affichage que la France.
EUROZONE = {
    "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR",
    "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
}

_IP_CACHE: dict[str, tuple[float, str]] = {}
_IP_TTL_SECONDS = 60 * 60


def nominatim_search(query: str, *, country: str | None = None, limit: int = 5) -> list[dict]:
    params: dict = {"q": query.strip(), "format": "json", "limit": limit, "addressdetails": 1}
    if country:
        params["countrycodes"] = country.lower()
    response = requests.get(
        f"{NOMINATIM_BASE}/search",
        params=params,
        headers={"User-Agent": USER_AGENT},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()


def map_iso_country(code: str | None) -> str:
    """Ramène un code ISO-2 vers un pays dont on connaît la devise."""
    iso = (code or "").strip().upper()
    if iso == "UK":
        iso = "GB"
    if iso in COUNTRIES:
        return iso
    if iso in EUROZONE:
        return "FR"
    return "CM"


def _is_public_ip(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip.split("%", 1)[0])
    except ValueError:
        return False
    return not (
        addr.is_private
        or addr.is_loopback
        or addr.is_reserved
        or addr.is_link_local
        or addr.is_unspecified
    )


def lookup_country_from_ip(ip: str) -> str:
    """Pays du visiteur. Réseau local ou service indisponible → Cameroun."""
    if not _is_public_ip(ip):
        return "CM"

    now = time.time()
    cached = _IP_CACHE.get(ip)
    if cached and now - cached[0] < _IP_TTL_SECONDS:
        return cached[1]

    country = "CM"
    try:
        response = requests.get(
            f"https://ipwho.is/{ip}",
            params={"fields": "success,country_code"},
            headers={"User-Agent": USER_AGENT},
            timeout=2.5,
        )
        response.raise_for_status()
        payload = response.json()
        if payload.get("success"):
            country = map_iso_country(payload.get("country_code"))
    except Exception:
        logger.warning("Géolocalisation IP indisponible, pays par défaut CM")

    _IP_CACHE[ip] = (now, country)
    return country


def nominatim_reverse(latitude: float, longitude: float) -> dict:
    response = requests.get(
        f"{NOMINATIM_BASE}/reverse",
        params={"lat": latitude, "lon": longitude, "format": "json", "addressdetails": 1},
        headers={"User-Agent": USER_AGENT},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()
