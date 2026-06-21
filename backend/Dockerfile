FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml .
COPY uv.lock .

RUN pip install uv

RUN uv pip install --system \
    fastapi \
    uvicorn \
    sqlalchemy \
    pymysql \
    python-dotenv

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
