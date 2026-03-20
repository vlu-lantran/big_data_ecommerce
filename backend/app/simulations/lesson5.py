from __future__ import annotations

from math import cos, pi, sin
from typing import Literal

from fastapi import APIRouter, Query
from pandas import DataFrame

router = APIRouter()

DATASETS = {
    'spending-frequency': {
        'label': 'User Segments: Spending vs Purchase Frequency',
        'x_key': 'spending',
        'y_key': 'frequency',
        'x_label': 'Monthly Spending (USD)',
        'y_label': 'Monthly Purchase Frequency',
        'rows': [
            {'id': 'U01', 'name': 'Ava', 'spending': 1450, 'frequency': 15},
            {'id': 'U02', 'name': 'Ben', 'spending': 1320, 'frequency': 14},
            {'id': 'U03', 'name': 'Chloe', 'spending': 1180, 'frequency': 12},
            {'id': 'U04', 'name': 'Dylan', 'spending': 960, 'frequency': 11},
            {'id': 'U05', 'name': 'Ella', 'spending': 760, 'frequency': 8},
            {'id': 'U06', 'name': 'Finn', 'spending': 710, 'frequency': 7},
            {'id': 'U07', 'name': 'Grace', 'spending': 520, 'frequency': 6},
            {'id': 'U08', 'name': 'Hugo', 'spending': 470, 'frequency': 5},
            {'id': 'U09', 'name': 'Iris', 'spending': 340, 'frequency': 4},
            {'id': 'U10', 'name': 'Jasper', 'spending': 260, 'frequency': 3},
            {'id': 'U11', 'name': 'Kira', 'spending': 190, 'frequency': 2},
            {'id': 'U12', 'name': 'Liam', 'spending': 140, 'frequency': 1},
        ],
    },
    'session-engagement': {
        'label': 'Visitor Segments: Session Duration vs Pages Viewed',
        'x_key': 'session_minutes',
        'y_key': 'pages_viewed',
        'x_label': 'Session Duration (minutes)',
        'y_label': 'Pages Viewed',
        'rows': [
            {'id': 'S01', 'name': 'Visitor 1', 'session_minutes': 26, 'pages_viewed': 19},
            {'id': 'S02', 'name': 'Visitor 2', 'session_minutes': 22, 'pages_viewed': 16},
            {'id': 'S03', 'name': 'Visitor 3', 'session_minutes': 21, 'pages_viewed': 15},
            {'id': 'S04', 'name': 'Visitor 4', 'session_minutes': 18, 'pages_viewed': 13},
            {'id': 'S05', 'name': 'Visitor 5', 'session_minutes': 15, 'pages_viewed': 11},
            {'id': 'S06', 'name': 'Visitor 6', 'session_minutes': 14, 'pages_viewed': 10},
            {'id': 'S07', 'name': 'Visitor 7', 'session_minutes': 10, 'pages_viewed': 8},
            {'id': 'S08', 'name': 'Visitor 8', 'session_minutes': 9, 'pages_viewed': 7},
            {'id': 'S09', 'name': 'Visitor 9', 'session_minutes': 7, 'pages_viewed': 5},
            {'id': 'S10', 'name': 'Visitor 10', 'session_minutes': 6, 'pages_viewed': 4},
            {'id': 'S11', 'name': 'Visitor 11', 'session_minutes': 4, 'pages_viewed': 3},
            {'id': 'S12', 'name': 'Visitor 12', 'session_minutes': 3, 'pages_viewed': 2},
        ],
    },
}

DatasetKey = Literal['spending-frequency', 'session-engagement']


def _expand_points(dataset: dict, base_rows: list[dict]) -> list[dict]:
    x_key = dataset['x_key']
    y_key = dataset['y_key']
    df = DataFrame(base_rows)

    x_range = float(df[x_key].max() - df[x_key].min()) if not df.empty else 1.0
    y_range = float(df[y_key].max() - df[y_key].min()) if not df.empty else 1.0

    # Deterministic offsets create denser clusters without random jitter.
    # Exactly 3x points relative to the source rows.
    offset_templates = [
        (0.0, 0.0),
        (-0.9, -0.4),
        (0.8, 0.52),
    ]
    x_step = max(x_range * 0.11, 0.8)
    y_step = max(y_range * 0.22, 0.8)

    points: list[dict] = []
    for row_idx, row in enumerate(base_rows):
        theta = ((row_idx * 37) % 360) * (pi / 180.0)
        cos_t = cos(theta)
        sin_t = sin(theta)

        for idx, (ox, oy) in enumerate(offset_templates, start=1):
            # Rotate offsets by row index to scatter points in many directions.
            rx = ox * cos_t - oy * sin_t
            ry = ox * sin_t + oy * cos_t

            x_value = max(float(row[x_key]) + rx * x_step, 0.0)
            y_value = max(float(row[y_key]) + ry * y_step, 0.0)
            points.append(
                {
                    'id': f"{row['id']}-{idx}",
                    'name': row['name'],
                    'x': x_value,
                    'y': y_value,
                    'raw': row,
                }
            )

    return points


def _prepare_points(dataset_key: DatasetKey) -> tuple[dict, list[dict], list[dict]]:
    dataset = DATASETS[dataset_key]
    base_rows = DataFrame(dataset['rows']).to_dict(orient='records')
    points = _expand_points(dataset, base_rows)

    return dataset, points, base_rows


def _seed_centroids(points: list[dict], k: int) -> list[dict]:
    if k == 1:
        return [{'cluster': 0, 'x': points[0]['x'], 'y': points[0]['y']}]

    # Use a deterministic but less-ideal initialization to show more k-means updates.
    indices = list(range(k))
    return [
        {'cluster': cluster_id, 'x': points[idx]['x'], 'y': points[idx]['y']}
        for cluster_id, idx in enumerate(indices)
    ]


def _nearest_cluster(point: dict, centroids: list[dict]) -> int:
    best_cluster = 0
    best_distance = float('inf')

    for centroid in centroids:
        distance = (point['x'] - centroid['x']) ** 2 + (point['y'] - centroid['y']) ** 2
        if distance < best_distance:
            best_distance = distance
            best_cluster = centroid['cluster']

    return best_cluster


def _recompute_centroids(
    points: list[dict], assignments: list[int], old_centroids: list[dict]
) -> list[dict]:
    centroids: list[dict] = []

    for centroid in old_centroids:
        cluster_id = centroid['cluster']
        members = [point for point, assigned in zip(points, assignments) if assigned == cluster_id]

        if not members:
            centroids.append({'cluster': cluster_id, 'x': centroid['x'], 'y': centroid['y']})
            continue

        centroids.append(
            {
                'cluster': cluster_id,
                'x': sum(member['x'] for member in members) / len(members),
                'y': sum(member['y'] for member in members) / len(members),
            }
        )

    return centroids


def _centroids_shifted(old_centroids: list[dict], new_centroids: list[dict], tol: float = 1e-9) -> bool:
    for old, new in zip(old_centroids, new_centroids):
        if abs(old['x'] - new['x']) > tol or abs(old['y'] - new['y']) > tol:
            return True
    return False


def _build_frame(
    iteration: int,
    phase: str,
    points: list[dict],
    assignments: list[int],
    centroids: list[dict],
    changed_count: int,
) -> dict:
    frame_points = []
    for point, cluster_id in zip(points, assignments):
        frame_points.append(
            {
                'id': point['id'],
                'name': point['name'],
                'x': point['x'],
                'y': point['y'],
                'cluster': cluster_id,
            }
        )

    return {
        'iteration': iteration,
        'phase': phase,
        'changed_count': changed_count,
        'points': frame_points,
        'centroids': centroids,
    }


@router.get('/api/simulations/clustering')
def run_clustering(
    dataset: DatasetKey = Query('spending-frequency'),
    k: int = Query(3, ge=2, le=6),
    max_iter: int = Query(10, ge=2, le=20),
) -> dict:
    dataset_meta, points, base_rows = _prepare_points(dataset)

    safe_k = min(k, len(points))
    centroids = _seed_centroids(points, safe_k)

    history: list[dict] = []
    previous_assignments = [-1] * len(points)

    history.append(
        _build_frame(
            iteration=0,
            phase='initialization',
            points=points,
            assignments=previous_assignments,
            centroids=centroids,
            changed_count=0,
        )
    )

    converged = False
    convergence_iteration: int | None = None

    for iteration in range(1, max_iter + 1):
        assignments = [_nearest_cluster(point, centroids) for point in points]
        changed_count = sum(
            1 for current, previous in zip(assignments, previous_assignments) if current != previous
        )

        history.append(
            _build_frame(
                iteration=iteration,
                phase='assignment',
                points=points,
                assignments=assignments,
                centroids=centroids,
                changed_count=changed_count,
            )
        )

        updated_centroids = _recompute_centroids(points, assignments, centroids)

        history.append(
            _build_frame(
                iteration=iteration,
                phase='update',
                points=points,
                assignments=assignments,
                centroids=updated_centroids,
                changed_count=changed_count,
            )
        )

        if changed_count == 0 and not _centroids_shifted(centroids, updated_centroids):
            converged = True
            convergence_iteration = iteration
            break

        centroids = updated_centroids
        previous_assignments = assignments

    if convergence_iteration is None:
        convergence_iteration = max_iter

    message = (
        f'K-Means converged at iteration {convergence_iteration}.'
        if converged
        else f'Max iterations ({max_iter}) reached before full convergence.'
    )

    table_rows = []
    for row in base_rows:
        table_rows.append(
            {
                'id': row['id'],
                'name': row['name'],
                dataset_meta['x_key']: row[dataset_meta['x_key']],
                dataset_meta['y_key']: row[dataset_meta['y_key']],
            }
        )

    return {
        'dataset': dataset,
        'dataset_label': dataset_meta['label'],
        'k': safe_k,
        'max_iter': max_iter,
        'features': {
            'x_key': dataset_meta['x_key'],
            'y_key': dataset_meta['y_key'],
            'x_label': dataset_meta['x_label'],
            'y_label': dataset_meta['y_label'],
        },
        'table_rows': table_rows,
        'history': history,
        'converged': converged,
        'convergence_iteration': convergence_iteration,
        'message': message,
    }
