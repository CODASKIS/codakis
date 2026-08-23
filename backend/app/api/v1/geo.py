from fastapi import APIRouter, HTTPException, Query, status

from app.services.geo import nominatim_reverse, nominatim_search

router = APIRouter(prefix="/geo", tags=["geo"])


@router.get("/search")
def geo_search(
    q: str = Query(min_length=3),
    country: str | None = Query(default="cm"),
    limit: int = Query(default=5, ge=1, le=10),
):
    try:
        return nominatim_search(q, country=country, limit=limit)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Géocodage indisponible") from exc


@router.get("/resolve")
def geo_resolve(
    lat: float = Query(),
    lng: float = Query(),
):
    try:
        data = nominatim_reverse(lat, lng)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Géocodage inverse indisponible") from exc
    address = data.get("address") or {}
    return {
        "region_id": None,
        "city_id": None,
        "neighborhood_id": None,
        "address_hint": data.get("display_name"),
        "label": data.get("display_name"),
        "city": address.get("city") or address.get("town") or address.get("village"),
        "district": address.get("suburb") or address.get("neighbourhood") or address.get("quarter"),
    }
