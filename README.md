# Skill-to-Employment Intelligence Platform

This repository is a monorepo for the hackathon prototype.

## Structure
- `/backend`: FastAPI backend (Python 3.11).
- `/frontend`: Next.js 14 frontend (TypeScript, Tailwind).
- `/data`: Synthetic data generation scripts.
- `/infra`: Docker compose for bringing up the whole stack.
- `/docs`: Architecture and design notes.

## Requirements
- Docker and Docker Compose
- Python 3.11 (if running locally without Docker)
- Node.js 18+ (if running locally without Docker)

## How to Run

1. **Database Setup (Local PostgreSQL)**
   We use a local PostgreSQL database with the `pgvector` extension.
   
   If you're on a Mac, you can set it up using Homebrew:
   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   
   # Create the database
   createdb sih_platform
   
   # Connect to the database and enable pgvector
   psql -d sih_platform -c "CREATE EXTENSION vector;"
   ```

   Make sure the `.env` file exists at the root of the project with the `DATABASE_URL`:
   ```env
   DATABASE_URL="<YOUR_DATABASE_URL>"
   ```

   *(Note: If you run the backend inside Docker via `docker-compose`, change `localhost` to `host.docker.internal` in the `.env` file so the container can reach your Mac's local database).*

2. **Start the Platform with Docker Compose**
   ```bash
   cd infra
   docker-compose up --build
   ```
   
   This will bring up:
   - **Backend API**: `http://localhost:8000` (Healthcheck: `/health`)
   - **Frontend App**: `http://localhost:3000`

3. **Generate Synthetic Data** (Optional)
   If you want to generate the sample JSON/CSV files locally:
   ```bash
   cd data
   python generate_synthetic_data.py
   ```
