FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY backend /app
# We remove the mock_gcs_bucket COPY step because Cloud Run 
# will mount the real bucket at runtime via FUSE!

# Cloud Run uses the $PORT environment variable (default 8080)
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"