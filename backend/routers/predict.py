from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import os
import pandas as pd
import numpy as np

router = APIRouter(prefix="/predict", tags=["prediction"])

@router.get("/{candidate_uuid}")
def predict_employment(candidate_uuid: str, db: Session = Depends(get_db)):
    """
    Predicts the likelihood of employment for a given candidate using the trained XGBoost model.
    """
    try:
        import joblib
    except ImportError:
        raise HTTPException(status_code=500, detail="joblib not installed")
        
    # Paths relative to the backend directory
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(backend_dir, 'xgb_model.joblib')
    features_path = os.path.join(backend_dir, 'xgb_features.joblib')
    
    if not os.path.exists(model_path) or not os.path.exists(features_path):
        raise HTTPException(status_code=500, detail="Model not trained yet. Run train_model.py first.")
        
    model = joblib.load(model_path)
    features = joblib.load(features_path)
    
    candidate = db.query(models.MasterCandidate).filter(models.MasterCandidate.id == candidate_uuid).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    events = db.query(models.CandidateEvent).filter(models.CandidateEvent.candidate_id == candidate_uuid).all()
    
    row = {
        "district": candidate.district,
        "course": candidate.course,
        "attendance_pct": np.nan,
        "assessment_score": np.nan,
        "nsqf_level": np.nan
    }
    
    for e in events:
        if e.event_type == 'trained':
            row['attendance_pct'] = e.raw_payload.get('attendance_pct', np.nan)
            row['assessment_score'] = e.raw_payload.get('assessment_score', np.nan)
        elif e.event_type == 'certified':
            row['nsqf_level'] = e.raw_payload.get('nsqf_level', np.nan)
            
    df = pd.DataFrame([row])
    
    # Ensure numerics
    df['attendance_pct'] = pd.to_numeric(df['attendance_pct'], errors='coerce')
    df['assessment_score'] = pd.to_numeric(df['assessment_score'], errors='coerce')
    df['nsqf_level'] = pd.to_numeric(df['nsqf_level'], errors='coerce')
    
    # One-hot encode what we have for this single row
    df_encoded = pd.get_dummies(df, columns=['district', 'course'], dummy_na=True)
    
    # Align with training features
    for f in features:
        if f not in df_encoded.columns:
            df_encoded[f] = 0
            
    X = df_encoded[features].astype(float)
    
    try:
        prob = model.predict_proba(X)[0, 1]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
        
    try:
        import shap
    except ImportError:
        raise HTTPException(status_code=500, detail="shap not installed")
        
    # Get per-candidate feature contributions using SHAP
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)
    
    # Handle SHAP returning a list (for some multiclass/sklearn wrappers) or array
    if isinstance(shap_values, list):
        sv = shap_values[1][0] # Positive class
    else:
        sv = shap_values[0]
        
    # Sort by absolute contribution magnitude
    feat_imps = sorted(zip(features, sv), key=lambda x: abs(x[1]), reverse=True)
    
    top_3 = []
    for f, val in feat_imps[:3]:
        top_3.append({
            "feature": f,
            "contribution": float(val),
            "effect": "positive" if val > 0 else "negative"
        })
    
    return {
        "candidate_id": candidate_uuid,
        "propensity_score": float(prob),
        "top_contributing_features": top_3
    }
