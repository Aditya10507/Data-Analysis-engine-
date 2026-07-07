from typing import Literal

from pydantic import BaseModel, Field

CleaningActionName = Literal["fill_nulls", "remove_duplicates", "clip_outliers", "parse_dates"]


class CleaningReviewAction(BaseModel):
    """Represent one proposed cleaning action and return serializable data."""

    action: CleaningActionName
    column_count: int = Field(ge=0)
    description: str
    is_enabled: bool
    label: str
    row_count: int = Field(ge=0)


class CleaningReviewPlan(BaseModel):
    """Represent proposed cleaning actions and return serializable data."""

    actions: list[CleaningReviewAction]
    initial_rows: int = Field(ge=0)


class CleaningActionChoice(BaseModel):
    """Represent one user cleaning choice and return validated data."""

    action: CleaningActionName
    is_enabled: bool


class CleaningReviewSubmission(BaseModel):
    """Represent user cleaning choices and return validated data."""

    choices: list[CleaningActionChoice] = Field(min_length=1)
