"""
ML Model Evaluation Metrics (MAE, RMSE, R^2)
"""
import math

def calculate_metrics(y_true, y_pred, training_time_ms=0):
    n = len(y_true)
    if n == 0:
        return {"mae": 0.0, "rmse": 0.0, "r2": 0.0, "training_time_ms": training_time_ms}
    
    abs_err = sum(abs(y_true[i] - y_pred[i]) for i in range(n))
    sq_err = sum((y_true[i] - y_pred[i])**2 for i in range(n))
    
    mae = abs_err / n
    rmse = math.sqrt(sq_err / n)
    
    y_mean = sum(y_true) / n
    tot_var = sum((y_true[i] - y_mean)**2 for i in range(n))
    
    r2 = 1.0 - (sq_err / tot_var) if tot_var > 1e-6 else 0.0
    
    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "r2": round(r2, 4),
        "training_time_ms": training_time_ms
    }
