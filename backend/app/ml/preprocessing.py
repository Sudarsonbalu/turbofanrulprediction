"""
Dataset preprocessing & statistical utilities
"""
import math

def clean_rows(rows):
    cleaned = []
    for r in rows:
        try:
            eng_id = int(r.get('engine_id', 0))
            cycle = int(r.get('cycle', 0))
            if eng_id > 0 and cycle > 0:
                cleaned.append(r)
        except (ValueError, TypeError):
            continue
    return cleaned
