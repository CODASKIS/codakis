DEFAULT_SCHOOL_HOURS = {
    "mon": "08:00 – 18:00",
    "tue": "08:00 – 18:00",
    "wed": "08:00 – 18:00",
    "thu": "08:00 – 18:00",
    "fri": "08:00 – 18:00",
    "sat": "08:00 – 13:00",
    "sun": "closed",
}


def normalize_school_hours(raw: dict | None) -> dict:
    if not raw:
        return dict(DEFAULT_SCHOOL_HOURS)
    merged = dict(DEFAULT_SCHOOL_HOURS)
    for key in DEFAULT_SCHOOL_HOURS:
        value = raw.get(key)
        if isinstance(value, str) and value.strip():
            merged[key] = value.strip()
    return merged
