import csv
import json
from io import StringIO

from app.models.file_preview import ColumnType, ParsedFilePreview, PreviewCellValue, PreviewColumn

MAX_PREVIEW_ROWS = 10000
DEFAULT_TEXT_COLUMN = "value"


def parse_file_preview(file_name: str, file_bytes: bytes) -> ParsedFilePreview:
    """Parse uploaded bytes and return a typed preview payload."""
    file_text = file_bytes.decode("utf-8-sig")

    if file_name.lower().endswith(".json"):
        rows = parse_json_rows(file_text)
    elif file_name.lower().endswith(".tsv"):
        rows = parse_delimited_rows(file_text, "\t")
    elif file_name.lower().endswith(".csv"):
        rows = parse_delimited_rows(file_text, ",")
    else:
        rows = parse_text_rows(file_text)

    columns = infer_columns(rows)
    return ParsedFilePreview(columns=columns, rows=rows[:MAX_PREVIEW_ROWS])


def parse_delimited_rows(file_text: str, delimiter: str) -> list[dict[str, PreviewCellValue]]:
    """Parse delimited text and return preview row dictionaries."""
    reader = csv.DictReader(StringIO(file_text), delimiter=delimiter)
    rows: list[dict[str, PreviewCellValue]] = []

    for row in reader:
        rows.append({key: normalize_cell(value) for key, value in row.items() if key})

    return rows[:MAX_PREVIEW_ROWS]


def parse_json_rows(file_text: str) -> list[dict[str, PreviewCellValue]]:
    """Parse JSON text and return preview row dictionaries."""
    parsed_json: object = json.loads(file_text)

    if isinstance(parsed_json, list):
        return [normalize_json_row(item) for item in parsed_json[:MAX_PREVIEW_ROWS]]

    return [normalize_json_row(parsed_json)]


def parse_text_rows(file_text: str) -> list[dict[str, PreviewCellValue]]:
    """Parse plain text and return preview row dictionaries."""
    lines = file_text.splitlines()[:MAX_PREVIEW_ROWS]
    return [{DEFAULT_TEXT_COLUMN: line} for line in lines if line.strip()]


def normalize_json_row(item: object) -> dict[str, PreviewCellValue]:
    """Normalize a JSON item and return a preview row dictionary."""
    if isinstance(item, dict):
        return {str(key): normalize_cell(value) for key, value in item.items()}

    return {DEFAULT_TEXT_COLUMN: normalize_cell(item)}


def normalize_cell(value: object) -> PreviewCellValue:
    """Normalize raw input and return a preview cell value."""
    if value is None or isinstance(value, bool | int | float):
        return value

    text_value = str(value).strip()
    return text_value if text_value else None


def infer_columns(rows: list[dict[str, PreviewCellValue]]) -> list[PreviewColumn]:
    """Infer and return preview columns from row values."""
    column_names = list(dict.fromkeys(column_name for row in rows for column_name in row.keys()))
    return [PreviewColumn(name=column_name, type=infer_column_type(rows, column_name)) for column_name in column_names]


def infer_column_type(rows: list[dict[str, PreviewCellValue]], column_name: str) -> ColumnType:
    """Infer and return a single column type."""
    values = [row.get(column_name) for row in rows if row.get(column_name) is not None]

    if values and all(is_boolean_value(value) for value in values):
        return "boolean"

    if values and all(is_number_value(value) for value in values):
        return "number"

    if values and all(is_date_value(value) for value in values):
        return "date"

    return "text"


def is_boolean_value(value: PreviewCellValue) -> bool:
    """Return whether a value represents a boolean."""
    return isinstance(value, bool) or str(value).lower() in {"true", "false"}


def is_number_value(value: PreviewCellValue) -> bool:
    """Return whether a value represents a number."""
    try:
        float(str(value))
        return True
    except ValueError:
        return False


def is_date_value(value: PreviewCellValue) -> bool:
    """Return whether a value has a basic date-like shape."""
    text_value = str(value)
    return len(text_value) >= 8 and "-" in text_value
