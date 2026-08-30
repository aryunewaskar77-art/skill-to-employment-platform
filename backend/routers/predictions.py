from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import numpy as np
import os

router = APIRouter(prefix="/api/v1/predict", tags=["prediction"])

class PropensityRequest(BaseModel):
    attendance_rate: float = Field(..., description="Candidate's training attendance percentage (0-100)")
    assessment_score: float = Field(..., description="Final assessment score (0-100)")
    nsqf_level: int = Field(..., description="NSQF Certification Level (1-10)")
    district_demand_score: float = Field(..., description="Normalized demand score for candidate's district (0-1)")
    prior_education_level: str = Field(..., description="Candidate's highest prior education level")
    course_category: str = Field(..., description="Broad category of the training course")

class PropensityResponse(BaseModel):
    propensity_score: float = Field(..., description="Probability of employment (0-1)")
    risk_category: str = Field(..., description="'HIGH', 'MEDIUM', or 'LOW' risk of unemployment")
    key_factors: list[dict] = Field(..., description="Top contributing factors (positive or negative) to the score")

# Load model pipeline lazily
_model_pipeline = None

def get_model():
    global _model_pipeline
    if _model_pipeline is None:
        model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml', 'pipeline.joblib')
        if not os.path.exists(model_path):
            raise HTTPException(status_code=500, detail="ML pipeline not found. Train the model first.")
        _model_pipeline = joblib.load(model_path)
    return _model_pipeline

@router.post(
    "/employment-propensity", 
    response_model=PropensityResponse,
    summary="Predict Employment Propensity",
    description="**NOTE: This endpoint uses a synthetic ML model meant for SIH demonstration purposes only.** It predicts the likelihood of a candidate gaining employment based on training and demographic metrics."
)
def predict_employment_propensity(req: PropensityRequest):
    model = get_model()
    
    # Prepare DataFrame
    input_data = {
        'attendance_rate': [req.attendance_rate],
        'assessment_score': [req.assessment_score],
        'nsqf_level': [req.nsqf_level],
        'district_demand_score': [req.district_demand_score],
        'prior_education_level': [req.prior_education_level],
        'course_category': [req.course_category]
    }
    df = pd.DataFrame(input_data)
    
    try:
        # Get probabilities
        prob = model.predict_proba(df)[0, 1]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction failed: {str(e)}")
        
    # Determine risk category
    if prob >= 0.70:
        risk_category = "LOW"
    elif prob >= 0.40:
        risk_category = "MEDIUM"
    else:
        risk_category = "HIGH"
        
    # Explainability: extracting coefficients from LR
    # We do a quick approximation of feature contribution for this specific sample
    preprocessor = model.named_steps['preprocessor']
    classifier = model.named_steps['classifier']
    
    X_transformed = preprocessor.transform(df)
    
    # Get feature names
    cat_features = preprocessor.named_transformers_['cat'].get_feature_names_out(['prior_education_level', 'course_category'])
    num_features = ['attendance_rate', 'assessment_score', 'nsqf_level', 'district_demand_score']
    all_features = num_features + list(cat_features)
    
    coefficients = classifier.coef_[0]
    
    # Contribution = transformed_value * coefficient
    contributions = X_transformed[0] * coefficients
    
    # Sort by absolute contribution to find top factors
    factor_indices = np.argsort(np.abs(contributions))[::-1]
    
    key_factors = []
    for idx in factor_indices[:3]:
        feat_name = all_features[idx]
        val = float(contributions[idx])
        if val == 0.0:
            continue
            
        effect = "positive" if val > 0 else "negative"
        
        # Make feature name readable
        readable_name = feat_name.replace("_", " ").title()
        if "Prior Education Level" in readable_name:
            readable_name = "Prior Education: " + readable_name.split("_")[-1]
        elif "Course Category" in readable_name:
            readable_name = "Course Category: " + readable_name.split("_")[-1]
            
        key_factors.append({
            "feature": readable_name,
            "contribution": round(val, 3),
            "effect": effect
        })

    return {
        "propensity_score": round(float(prob), 4),
        "risk_category": risk_category,
        "key_factors": key_factors
    }
