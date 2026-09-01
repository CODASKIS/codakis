from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class SimPlayer(BaseModel):
    x: float
    y: float
    tx: float
    ty: float


class SimVehicle(BaseModel):
    id: str
    x: float
    y: float
    tx: float
    ty: float
    ai: bool | None = True


class SimObstacle(BaseModel):
    x: float
    y: float
    w: float
    h: float
    kind: str | None = "barrier"


class SimPedestrian(BaseModel):
    x: float
    y: float
    dir: int = Field(ge=-1, le=1)
    speed: float = 0.4


class SimTrafficLight(BaseModel):
    x: float
    y: float
    state: str = "red"


class SimTree(BaseModel):
    x: float
    y: float


class DrivingScenarioData(BaseModel):
    id: str = "custom"
    label: str
    description: str
    player: SimPlayer
    vehicles: list[SimVehicle] = Field(default_factory=list)
    obstacles: list[SimObstacle] = Field(default_factory=list)
    pedestrians: list[SimPedestrian] = Field(default_factory=list)
    traffic_lights: list[SimTrafficLight] = Field(default_factory=list)
    trees: list[SimTree] = Field(default_factory=list)
    buildings: int = 8


class SimulationScenarioPublic(BaseModel):
    id: UUID
    title: str
    description: str | None
    scenario: DrivingScenarioData
    source: str
    created_at: datetime

    model_config = {"from_attributes": True}


class SimulationScenarioAdmin(SimulationScenarioPublic):
    theme_id: UUID | None
    updated_at: datetime


class SimulationCreateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    theme_id: UUID | None = None
    scenario: DrivingScenarioData


class SimulationUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    theme_id: UUID | None = None
    scenario: DrivingScenarioData | None = None


class SimulationGenerateRequest(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    context: str = Field(min_length=10, max_length=4000)
    theme_id: UUID | None = None
    language: str = Field(default="fr", pattern="^(fr|en)$")
