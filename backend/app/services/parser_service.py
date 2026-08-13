import re
from typing import Dict, List, Any, Tuple, Optional

CMAPSS_COLUMNS = [
    'engine_id', 'cycle',
    'setting_1', 'setting_2', 'setting_3',
    'sensor_1', 'sensor_2', 'sensor_3', 'sensor_4', 'sensor_5',
    'sensor_6', 'sensor_7', 'sensor_8', 'sensor_9', 'sensor_10',
    'sensor_11', 'sensor_12', 'sensor_13', 'sensor_14', 'sensor_15',
    'sensor_16', 'sensor_17', 'sensor_18', 'sensor_19', 'sensor_20',
    'sensor_21'
]

def parse_dataset_file(content_bytes: bytes, filename: str) -> Dict[str, Any]:
    text = content_bytes.decode('utf-8', errors='ignore')
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    if not lines:
        return {
            "format": "UNKNOWN",
            "columns": [],
            "rows": [],
            "error": "File is empty or contains no valid lines."
        }

    is_csv = filename.lower().endswith('.csv') or (',' in lines[0] and '\t' not in lines[0])

    if is_csv:
        return _parse_csv(lines)
    else:
        return _parse_txt(lines, filename)

def _parse_csv(lines: List[str]) -> Dict[str, Any]:
    header = [h.strip().strip('"\'') for h in lines[0].split(',')]
    
    engine_col = None
    for col in header:
        if col.lower() in ['engine_id', 'engine', 'unit', 'unit_id', 'id']:
            engine_col = col
            break

    cycle_col = None
    for col in header:
        if col.lower() in ['cycle', 'operating_cycle', 'time', 'step']:
            cycle_col = col
            break

    if not engine_col or not cycle_col:
        return {
            "format": "CSV",
            "columns": header,
            "rows": [],
            "error": "Unable to identify the required engine and cycle columns."
        }

    rows = []
    for line in lines[1:]:
        tokens = [t.strip().strip('"\'') for t in line.split(',')]
        if len(tokens) < len(header):
            continue
        row_dict = {}
        for idx, col in enumerate(header):
            val_str = tokens[idx]
            try:
                row_dict[col] = float(val_str) if '.' in val_str else int(val_str)
            except ValueError:
                row_dict[col] = val_str if val_str else None
        rows.append(row_dict)

    return {
        "format": "CSV",
        "columns": header,
        "rows": rows,
        "engine_col": engine_col,
        "cycle_col": cycle_col
    }

def _parse_txt(lines: List[str], filename: str) -> Dict[str, Any]:
    is_rul = 'rul' in filename.lower()
    first_line_tokens = re.split(r'\s+', lines[0])

    if is_rul or len(first_line_tokens) == 1:
        rows = []
        for idx, line in enumerate(lines):
            tokens = re.split(r'\s+', line)
            if not tokens or not tokens[0]:
                continue
            if len(tokens) == 1:
                try:
                    rul_val = float(tokens[0])
                except ValueError:
                    rul_val = None
                rows.append({"engine_id": idx + 1, "rul": rul_val})
            else:
                try:
                    eng_id = int(tokens[0])
                    rul_val = float(tokens[1])
                except ValueError:
                    eng_id = idx + 1
                    rul_val = None
                rows.append({"engine_id": eng_id, "rul": rul_val})

        return {
            "format": "NASA_CMAPSS_RUL",
            "columns": ["engine_id", "rul"],
            "rows": rows,
            "engine_col": "engine_id",
            "cycle_col": None
        }

    rows = []
    for line in lines:
        tokens = re.split(r'\s+', line)
        if len(tokens) < 2:
            continue
        row_dict = {}
        for idx, col in enumerate(CMAPSS_COLUMNS):
            if idx < len(tokens):
                try:
                    val = float(tokens[idx])
                    row_dict[col] = int(val) if val.is_integer() else val
                except ValueError:
                    row_dict[col] = tokens[idx]
            else:
                row_dict[col] = None
        rows.append(row_dict)

    return {
        "format": "NASA_CMAPSS",
        "columns": CMAPSS_COLUMNS,
        "rows": rows,
        "engine_col": "engine_id",
        "cycle_col": "cycle"
    }
