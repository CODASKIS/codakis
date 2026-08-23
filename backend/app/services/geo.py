import requests

NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
USER_AGENT = "CODAKIS/1.0 (contact@codakis.cm)"


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


def nominatim_reverse(latitude: float, longitude: float) -> dict:
    response = requests.get(
        f"{NOMINATIM_BASE}/reverse",
        params={"lat": latitude, "lon": longitude, "format": "json", "addressdetails": 1},
        headers={"User-Agent": USER_AGENT},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()
