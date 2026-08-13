"""
NASA C-MAPSS RUL Target Generator
Calculates actual Remaining Useful Life (RUL) = max_cycle - current_cycle dynamically.
"""

def generate_training_rul(rows):
    if not rows:
        return []
    
    max_cycles = {}
    for r in rows:
        eng_id = int(r.get('engine_id', 0))
        cycle = int(r.get('cycle', 0))
        if eng_id > 0:
            max_cycles[eng_id] = max(max_cycles.get(eng_id, 0), cycle)
            
    result = []
    for r in rows:
        eng_id = int(r.get('engine_id', 0))
        cycle = int(r.get('cycle', 0))
        if eng_id > 0:
            max_c = max_cycles.get(eng_id, cycle)
            row_copy = dict(r)
            row_copy['rul'] = max(0, max_c - cycle)
            result.append(row_copy)
            
    return result
