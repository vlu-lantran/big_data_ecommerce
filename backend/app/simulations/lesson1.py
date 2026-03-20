from fastapi import APIRouter
from pandas import DataFrame

router = APIRouter()


@router.get("/api/simulations/market-basket")
def run_market_basket() -> list[dict[str, float | str]]:
    df = DataFrame(
        [
            {"item": "Mouse", "confidence": 0.8},
            {"item": "Keyboard", "confidence": 0.6},
            {"item": "USB Cable", "confidence": 0.45},
        ]
    )
    return df.to_dict(orient="records")
