from pydantic import BaseModel, Field


class AdminSearchResultItem(BaseModel):
    type: str = Field(..., pattern="^(user|school|payment)$")
    id: str
    label: str
    subtitle: str | None = None


class AdminSearchResponse(BaseModel):
    query: str
    results: list[AdminSearchResultItem]
