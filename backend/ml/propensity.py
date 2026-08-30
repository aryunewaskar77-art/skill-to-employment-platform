import pandas as pd
import numpy as np
import joblib
import os
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import LogisticRegression

def train_and_save_pipeline():
    np.random.seed(42)
    n_samples = 1000

    # Synthetic Data Generation
    attendance_rate = np.random.uniform(50, 100, n_samples)
    assessment_score = np.random.uniform(40, 100, n_samples)
    nsqf_level = np.random.randint(1, 6, n_samples)
    district_demand_score = np.random.uniform(0, 1, n_samples)
    
    prior_education_options = ['Below 10th', '10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate']
    prior_education_level = np.random.choice(prior_education_options, n_samples)
    
    course_category_options = ['IT', 'Healthcare', 'Construction', 'Retail', 'Electronics', 'Plumbing']
    course_category = np.random.choice(course_category_options, n_samples)

    # Compute a latent score to determine is_placed
    score = (
        (attendance_rate - 50) / 50 * 2.0 +
        (assessment_score - 40) / 60 * 2.5 +
        nsqf_level * 0.5 +
        district_demand_score * 3.0
    )
    
    score += np.where(prior_education_level == 'Graduate', 1.0, 0.0)
    score += np.where(course_category == 'IT', 1.5, 0.0)

    prob = 1 / (1 + np.exp(- (score - 5)))
    is_placed = np.random.binomial(1, prob)

    df = pd.DataFrame({
        'attendance_rate': attendance_rate,
        'assessment_score': assessment_score,
        'nsqf_level': nsqf_level,
        'district_demand_score': district_demand_score,
        'prior_education_level': prior_education_level,
        'course_category': course_category,
        'is_placed': is_placed
    })

    X = df.drop('is_placed', axis=1)
    y = df['is_placed']

    numeric_features = ['attendance_rate', 'assessment_score', 'nsqf_level', 'district_demand_score']
    categorical_features = ['prior_education_level', 'course_category']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])

    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(random_state=42))
    ])

    pipeline.fit(X, y)

    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    model_path = os.path.join(os.path.dirname(__file__), 'pipeline.joblib')
    joblib.dump(pipeline, model_path)
    print(f"Pipeline trained and saved to {model_path}")

if __name__ == "__main__":
    train_and_save_pipeline()
