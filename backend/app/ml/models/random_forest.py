"""
Random Forest Regressor for RUL Prediction
"""

class RandomForestRegressorModel:
    def __init__(self, n_estimators=15, max_depth=8, min_samples_split=5):
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.trees = []
        self.feature_importances_ = []

    def fit(self, X, y):
        pass

    def predict(self, X):
        return []
