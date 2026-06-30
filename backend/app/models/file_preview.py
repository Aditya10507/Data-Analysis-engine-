from typing import Literal

from pydantic import BaseModel

ColumnType = Literal["number", "text", "date", "boolean"]
PreviewCellValue = str | int | float | bool | None


class PreviewColumn(BaseModel):
    """Represent a parsed preview column and inferred type."""

    name: str
    type: ColumnType


class ParsedFilePreview(BaseModel):
    """Represent parsed preview rows and column metadata."""

    columns: list[PreviewColumn]
    rows: list[dict[str, PreviewCellValue]]
