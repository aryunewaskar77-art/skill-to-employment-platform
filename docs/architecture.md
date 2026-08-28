# Architecture Notes

## Overview
The **Skill-to-Employment Intelligence Platform** uses a modern, scalable architecture designed for a hackathon prototype but adaptable to production.

## Components

### 1. Frontend (Next.js 14)
- **Framework**: Next.js (App router)
- **Styling**: Tailwind CSS
- **Role**: Provides the user interface for candidates and employers.

### 2. Backend (FastAPI)
- **Framework**: FastAPI (Python 3.11)
- **Role**: Exposes RESTful APIs, handles data processing, orchestrates ML predictions using scikit-learn and xgboost.
- **Dependencies**: SQLAlchemy, Pandas, Pydantic.

### 3. Database (PostgreSQL + pgvector)
- **Version**: PostgreSQL 16
- **Extension**: `pgvector` for vector similarity search (useful for semantic matching between skills and jobs).
- **Role**: Persistent data store for users, jobs, and embeddings.

## Data Flow
1. **User Interaction**: Users interact with the Next.js frontend.
2. **API Requests**: Frontend communicates with the FastAPI backend via REST.
3. **Data Retrieval/Storage**: FastAPI queries PostgreSQL via SQLAlchemy. Vector searches (if implemented) utilize `pgvector`.
4. **Machine Learning**: ML models (scikit-learn/xgboost) make predictions based on retrieved data.
