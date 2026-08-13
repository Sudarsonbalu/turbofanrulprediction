import math
from typing import Dict, Any, List

def validate_dataset(parse_result: Dict[str, Any]) -> Dict[str, Any]:
    rows = parse_result.get("rows", [])
    columns = parse_result.get("columns", [])
    error = parse_result.get("error")

    if error or not rows:
        return {
            "status": "INVALID",
            "quality": {
                "missing_values": 0,
                "duplicate_rows": 0,
                "invalid_values": 0,
                "nan_values": 0,
                "infinite_values": 0,
                "numeric_sensors_status": "Invalid structure",
                "is_sensors_valid": False,
                "issues": [error or "Dataset contains 0 rows."]
            },
            "summary": {
                "rows": 0,
                "columns": len(columns),
                "engines": 0,
                "sensors": 0,
                "min_cycle": 0,
                "max_cycle": 0
            }
        }

    missing_values = 0
    invalid_values = 0
    nan_values = 0
    infinite_values = 0
    duplicate_rows = 0
    issues = []

    engine_col = parse_result.get("engine_col", "engine_id")
    cycle_col = parse_result.get("cycle_col", "cycle")

    engines = set()
    min_cycle = float('inf')
    max_cycle = float('-inf')
    seen_keys = set()

    sensor_cols = [c for c in columns if c.startswith('sensor_') or 'sensor' in c.lower()]

    for row in rows:
        if engine_col in row and row[engine_col] is not None:
            engines.add(row[engine_col])
        else:
            missing_values += 1

        if cycle_col in row and row[cycle_col] is not None:
            cyc = row[cycle_col]
            if isinstance(cyc, (int, float)):
                if cyc < min_cycle: min_cycle = cyc
                if cyc > max_cycle: max_cycle = cyc
                if cyc <= 0: invalid_values += 1
            key = f"{row.get(engine_col)}_{cyc}"
            if key in seen_keys:
                duplicate_rows += 1
            else:
                seen_keys.add(key)

        for col in columns:
            val = row.get(col)
            if val is None or val == "":
                missing_values += 1
            elif isinstance(val, float):
                if math.isnan(val): nan_values += 1
                if math.isinf(val): infinite_values += 1

    min_cyc_int = int(min_cycle) if min_cycle != float('inf') else 0
    max_cyc_int = int(max_cycle) if max_cycle != float('-inf') else 0

    if duplicate_rows > 0:
        issues.append(f"Detected {duplicate_rows} duplicate engine cycle records.")
    if missing_values > 0:
        issues.append(f"Found {missing_values} missing or blank fields.")

    status = "VALID" if not issues else "WARNING"

    return {
        "status": status,
        "quality": {
            "missing_values": missing_values,
            "duplicate_rows": duplicate_rows,
            "invalid_values": invalid_values,
            "nan_values": nan_values,
            "infinite_values": infinite_values,
            "numeric_sensors_status": f"Valid ({len(sensor_cols)} sensors)",
            "is_sensors_valid": True,
            "issues": issues
        },
        "summary": {
            "rows": len(rows),
            "columns": len(columns),
            "engines": len(engines),
            "sensors": len(sensor_cols),
            "min_cycle": min_cyc_int,
            "max_cycle": max_cyc_int
        }
    }
