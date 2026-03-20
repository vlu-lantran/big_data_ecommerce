from __future__ import annotations

import importlib
import logging
import os
import pkgutil
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

logger = logging.getLogger(__name__)


app = FastAPI(title="Big Data Education Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _resolve_bucket_path() -> Path:
    # Primary source for container/local overrides.
    configured_path = os.getenv("MOCK_GCS_BUCKET_PATH")
    if configured_path:
        configured = Path(configured_path).resolve()
        if configured.exists():
            return configured
        raise FileNotFoundError(
            f"MOCK_GCS_BUCKET_PATH points to missing path: {configured}"
        )

    current = Path(__file__).resolve()
    candidates = [
        current.parents[2] / "mock_gcs_bucket",  # local workspace
        current.parents[1] / "mock_gcs_bucket",  # container build layout
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    raise FileNotFoundError("Could not locate mock_gcs_bucket directory.")


def _autoload_simulation_routers() -> None:
    simulations_pkg = importlib.import_module("app.simulations")

    for module_info in pkgutil.iter_modules(
        simulations_pkg.__path__, simulations_pkg.__name__ + "."
    ):
        module_name = module_info.name
        short_name = module_name.rsplit(".", maxsplit=1)[-1]

        if short_name.startswith("_"):
            continue

        module = importlib.import_module(module_name)
        router = getattr(module, "router", None)

        if router is None:
            logger.warning("Skipping %s (no 'router' APIRouter found)", module_name)
            continue

        app.include_router(router)
        logger.info("Included simulation router: %s", module_name)


bucket_path = _resolve_bucket_path()
app.mount("/mock_gcs_bucket", StaticFiles(directory=bucket_path), name="mock_gcs_bucket")
_autoload_simulation_routers()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
