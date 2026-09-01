"""Scénarios de simulation — stockage et génération IA."""

from __future__ import annotations

import json
import logging
import re
import uuid

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models import SimulationScenario, Utilisateur
from app.schemas.simulation import (
    DrivingScenarioData,
    SimulationCreateRequest,
    SimulationGenerateRequest,
    SimulationUpdateRequest,
)
from app.services.mistral import MistralError, is_configured as mistral_configured

logger = logging.getLogger("codakis.simulation")

MISTRAL_CHAT_URL = "https://api.mistral.ai/v1/chat/completions"

GENERATE_SYSTEM = """Tu es un concepteur pédagogique CODAKIS pour le code de la route CEMAC.
Tu produis UNIQUEMENT un objet JSON valide (sans markdown) décrivant une scène de simulation 2D de conduite.
Canvas : largeur ~1100px, hauteur ~420px, route horizontale vers y≈230.
Champs obligatoires : id (slug), label, description, player {x,y,tx,ty}, buildings (4-12).
Optionnels : vehicles[], obstacles[], pedestrians[], traffic_lights[{x,y,state}], trees[{x,y}].
kind obstacle : barrier | parked | building.
state feu : red | green | amber.
Adapte la scène au contexte pédagogique (priorité, piéton, carrefour, dépassement, etc.)."""


def _scenario_to_public(row: SimulationScenario) -> dict:
    data = row.scenario_json if isinstance(row.scenario_json, dict) else {}
    scenario = DrivingScenarioData.model_validate(data)
    return {
        "id": row.id,
        "title": row.title,
        "description": row.description,
        "scenario": scenario.model_dump(),
        "source": row.source,
        "theme_id": row.theme_id,
        "created_at": row.created_at,
        "updated_at": row.updated_at,
    }


def list_scenarios(db: Session, theme_id: uuid.UUID | None = None) -> list[dict]:
    query = db.query(SimulationScenario).order_by(SimulationScenario.created_at.desc())
    if theme_id:
        query = query.filter(SimulationScenario.theme_id == theme_id)
    return [_scenario_to_public(row) for row in query.limit(100).all()]


def get_scenario(db: Session, scenario_id: uuid.UUID) -> SimulationScenario | None:
    return db.get(SimulationScenario, scenario_id)


def create_scenario(db: Session, user: Utilisateur, payload: SimulationCreateRequest) -> dict:
    row = SimulationScenario(
        theme_id=payload.theme_id,
        title=payload.title.strip(),
        description=(payload.description or "").strip() or None,
        scenario_json=payload.scenario.model_dump(),
        source="manual",
        created_by=user.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _scenario_to_public(row)


def update_scenario(db: Session, scenario_id: uuid.UUID, payload: SimulationUpdateRequest) -> dict:
    row = db.get(SimulationScenario, scenario_id)
    if row is None:
        raise ValueError("Scénario introuvable")
    if payload.title is not None:
        row.title = payload.title.strip()
    if payload.description is not None:
        row.description = payload.description.strip() or None
    if payload.theme_id is not None:
        row.theme_id = payload.theme_id
    if payload.scenario is not None:
        row.scenario_json = payload.scenario.model_dump()
    db.commit()
    db.refresh(row)
    return _scenario_to_public(row)


def delete_scenario(db: Session, scenario_id: uuid.UUID) -> None:
    row = db.get(SimulationScenario, scenario_id)
    if row is None:
        raise ValueError("Scénario introuvable")
    db.delete(row)
    db.commit()


def _extract_json(raw: str) -> dict:
    text = raw.strip()
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fence:
        text = fence.group(1).strip()
    return json.loads(text)


def generate_scenario_with_ai(db: Session, user: Utilisateur, payload: SimulationGenerateRequest) -> dict:
    if not mistral_configured():
        raise MistralError("Assistant IA non configuré (MISTRAL_API_KEY manquante)")

    lang = payload.language
    user_prompt = (
        f"Langue des libellés : {'français' if lang == 'fr' else 'english'}.\n"
        f"Titre souhaité : {payload.title.strip()}\n"
        f"Contexte pédagogique :\n{payload.context.strip()[:4000]}\n\n"
        "Réponds avec le JSON de la scène uniquement."
    )
    body = {
        "model": settings.mistral_model,
        "messages": [
            {"role": "system", "content": GENERATE_SYSTEM},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.35,
        "max_tokens": 1800,
        "response_format": {"type": "json_object"},
    }
    headers = {
        "Authorization": f"Bearer {settings.mistral_api_key.strip()}",
        "Content-Type": "application/json",
    }
    try:
        response = httpx.post(MISTRAL_CHAT_URL, headers=headers, json=body, timeout=60.0)
    except httpx.HTTPError as exc:
        raise MistralError("Service Mistral indisponible") from exc

    if response.status_code >= 400:
        raise MistralError(response.text[:240] or "Erreur Mistral", status_code=response.status_code)

    choices = response.json().get("choices") or []
    content = ((choices[0] or {}).get("message") or {}).get("content") or ""
    if not content.strip():
        raise MistralError("Réponse vide de Mistral")

    try:
        parsed = _extract_json(content)
        scenario = DrivingScenarioData.model_validate(parsed)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.warning("JSON simulation invalide : %s", content[:500])
        raise MistralError("Scénario IA invalide — réessayez avec un contexte plus précis") from exc

    row = SimulationScenario(
        theme_id=payload.theme_id,
        title=payload.title.strip(),
        description=scenario.description,
        scenario_json=scenario.model_dump(),
        source="ai",
        created_by=user.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _scenario_to_public(row)
