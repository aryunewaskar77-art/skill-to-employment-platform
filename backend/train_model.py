import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score
from collections import defaultdict
import joblib
import os
import sys

# Add backend dir to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import SessionLocal
import models

def train_and_save():
    db = SessionLocal()
    candidates = db.query(models.MasterCandidate).all()
    events = db.query(models.CandidateEvent).all()
    db.close()

    candidate_events = defaultdict(list)
    for e in events:
        candidate_events[e.candidate_id].append(e)

    data = []
    for c in candidates:
        row = {
            "candidate_id": c.id,
            "district": c.district,
            "course": c.course,
            "attendance_pct": np.nan,
            "assessment_score": np.nan,
            "nsqf_level": np.nan,
            "employed": 0
        }
        for e in candidate_events[c.id]:
            if e.event_type == 'trained':
                att = e.raw_payload.get('attendance_pct')
                if att is not None: row['attendance_pct'] = att
                
                score = e.raw_payload.get('assessment_score')
                if score is not None: row['assessment_score'] = score
            elif e.event_type == 'certified':
                nsqf = e.raw_payload.get('nsqf_level')
                if nsqf is not None: row['nsqf_level'] = nsqf
            elif e.event_type in ('placed', 'verified_employed'):
                row['employed'] = 1
                
        data.append(row)

    df = pd.DataFrame(data)
    
    # Feature engineering
    df['attendance_pct'] = pd.to_numeric(df['attendance_pct'], errors='coerce')
    df['assessment_score'] = pd.to_numeric(df['assessment_score'], errors='coerce')
    df['nsqf_level'] = pd.to_numeric(df['nsqf_level'], errors='coerce')

    # One-hot encode categoricals
    df_encoded = pd.get_dummies(df, columns=['district', 'course'], dummy_na=True)
    
    # Save the feature columns so the endpoint knows exactly what to feed the model
    features = [c for c in df_encoded.columns if c not in ('candidate_id', 'employed')]
    
    X = df_encoded[features]
    y = df_encoded['employed']
    
    print("\n=== Data Statistics ===")
    print(f"Class Balance (Employed=1): {y.sum()} / {len(y)} ({y.mean():.2%})")
    
    print("\nFeature Correlations with Employment:")
    for col in ['attendance_pct', 'assessment_score', 'nsqf_level']:
        if col in df.columns:
            corr = df[col].corr(df['employed'])
            print(f"  {col}: {corr:.4f}")
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train
    model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, preds)
    # AUC might fail if there's only 1 class in test, wrap in try-except
    try:
        auc = roc_auc_score(y_test, probs)
    except ValueError:
        auc = 0.0
        
    print("=== Model Evaluation ===")
    print(f"Accuracy: {acc:.4f}")
    print(f"AUC:      {auc:.4f}")
    print("========================")
    
    # Feature Importance
    importances = model.feature_importances_
    feat_imps = sorted(zip(features, importances), key=lambda x: x[1], reverse=True)
    print("Top 5 Important Features:")
    for f, imp in feat_imps[:5]:
        print(f"  {f}: {imp:.4f}")
        
    # Save model and feature names
    model_path = os.path.join(os.path.dirname(__file__), 'xgb_model.joblib')
    features_path = os.path.join(os.path.dirname(__file__), 'xgb_features.joblib')
    
    joblib.dump(model, model_path)
    joblib.dump(features, features_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_and_save()
