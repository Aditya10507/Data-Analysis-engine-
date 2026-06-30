from io import BytesIO, StringIO
from pathlib import PurePath
from typing import Callable

import pandas as pd

CSV_EXTENSION = ".csv"
JSON_EXTENSION = ".json"
TSV_EXTENSION = ".tsv"
TXT_EXTENSION = ".txt"
TEXT_ENCODING = "utf-8"


def parse_dataframe(filename: str, file_bytes: bytes) -> pd.DataFrame:
    """Parse uploaded bytes into a pandas DataFrame and return it."""
    extension = PurePath(filename).suffix.lower()
    parser = get_parser(extension)
    dataframe = parser(file_bytes)
    return validate_dataframe(dataframe)


def get_parser(extension: str) -> Callable[[bytes], pd.DataFrame]:
    """Get and return the parser for a supported file extension."""
    parsers = {
        CSV_EXTENSION: parse_csv_bytes,
        JSON_EXTENSION: parse_json_bytes,
        TSV_EXTENSION: parse_tsv_bytes,
        TXT_EXTENSION: parse_text_bytes,
    }

    if extension not in parsers:
        raise ValueError("Unsupported file type for processing.")

    return parsers[extension]


def parse_csv_bytes(file_bytes: bytes) -> pd.DataFrame:
    """Parse CSV bytes and return a DataFrame."""
    return pd.read_csv(BytesIO(file_bytes))


def parse_tsv_bytes(file_bytes: bytes) -> pd.DataFrame:
    """Parse TSV bytes and return a DataFrame."""
    return pd.read_csv(BytesIO(file_bytes), sep="\t")


def parse_json_bytes(file_bytes: bytes) -> pd.DataFrame:
    """Parse JSON bytes and return a DataFrame."""
    return pd.read_json(BytesIO(file_bytes))


def parse_text_bytes(file_bytes: bytes) -> pd.DataFrame:
    """Parse delimited text bytes and return a DataFrame."""
    text = file_bytes.decode(TEXT_ENCODING)
    return pd.read_csv(StringIO(text), sep=None, engine="python")


def validate_dataframe(dataframe: pd.DataFrame) -> pd.DataFrame:
    """Validate parsed data and return the DataFrame."""
    if dataframe.empty:
        raise ValueError("Uploaded file did not contain any rows.")

    return dataframe
