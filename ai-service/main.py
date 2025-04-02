from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pre-trained model (in production, you'd train this properly)
try:
    model = joblib.load('model.joblib')
except:
    # Create a dummy model if none exists
    from sklearn.linear_model import LinearRegression
    model = LinearRegression()
    # Train with dummy data
    X = np.array([[1, 0.5, 3], [2, 0.7, 4], [3, 0.9, 5]])
    y = np.array([100, 150, 200])
    model.fit(X, y)
    joblib.dump(model, 'model.joblib')

class PricingRequest(BaseModel):
    complexity: int  # 1-5
    demand: float    # 0-1 (location demand)
    rating: float    # 1-5 (artisan rating)

@app.post("/predict-price")
def predict_price(request: PricingRequest):
    features = np.array([[request.complexity, request.demand, request.rating]])
    prediction = model.predict(features)
    return {"suggested_price": max(50, float(prediction[0]))}  # Ensure minimum price