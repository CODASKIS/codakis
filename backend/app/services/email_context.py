"""Contexte client pour les e-mails de sécurité."""

from __future__ import annotations

import re
from datetime import datetime
from zoneinfo import ZoneInfo


def parse_user_agent(user_agent: str | None) -> str:
    ua = (user_agent or "").strip()
    if not ua:
        return "Appareil inconnu"

    browser = "Navigateur"
    if "Edg/" in ua or "Edge/" in ua:
        browser = "Edge"
    elif "Chrome/" in ua and "Chromium" not in ua:
        browser = "Chrome"
    elif "Firefox/" in ua:
        browser = "Firefox"
    elif "Safari/" in ua and "Chrome" not in ua:
        browser = "Safari"

    os_name = "Inconnu"
    if "Android" in ua:
        os_name = "Android"
    elif "iPhone" in ua or "iPad" in ua:
        os_name = "iOS"
    elif "Windows" in ua:
        os_name = "Windows"
    elif "Mac OS X" in ua or "Macintosh" in ua:
        os_name = "macOS"
    elif "Linux" in ua:
        os_name = "Linux"

    return f"{browser} · {os_name}"


def client_ip(forwarded_for: str | None, direct_host: str | None) -> str:
    if forwarded_for:
        first = forwarded_for.split(",")[0].strip()
        if first:
            return first
    return direct_host or "Inconnue"


def login_timestamp() -> datetime:
    return datetime.now(ZoneInfo("Africa/Douala"))


def format_location_hint(ip_address: str) -> str:
    if ip_address.startswith("192.168.") or ip_address.startswith("10.") or ip_address.startswith("127."):
        return "Réseau local"
    if re.match(r"^172\.(1[6-9]|2\d|3[01])\.", ip_address):
        return "Réseau local"
    return "Cameroun / CEMAC"
