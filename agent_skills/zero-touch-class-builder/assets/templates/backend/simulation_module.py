from fastapi import APIRouter, Query

router = APIRouter()


@router.get('/api/simulations/topic-name')
def run_topic_simulation(k: int = Query(3, ge=2, le=10)) -> list[dict]:
    # Replace with real dataset and algorithm.
    return [
        {'x_field': 'A', 'y_field': 12},
        {'x_field': 'B', 'y_field': 7},
        {'x_field': 'C', 'y_field': 5},
    ]
