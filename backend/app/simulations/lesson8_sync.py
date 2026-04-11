import json
import os
import logging
import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/simulations/lesson-8-sync", tags=["lesson8-sync"])

# --- Simulation State Management ---

def load_scenarios():
    env_path = os.getenv("MOCK_GCS_BUCKET_PATH")
    if env_path:
        path = Path(env_path) / "classes" / "lesson-8-lab-web-advertising" / "scenarios.json"
        if path.exists():
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)

    current = Path(__file__).resolve()
    path = current.parents[3] / "mock_gcs_bucket" / "classes" / "lesson-8-lab-web-advertising" / "scenarios.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

SCENARIOS = load_scenarios()

class SimulationState:
    def __init__(self):
        self.reset()

    def reset(self):
        self.current_round_index = -1
        self.players: Dict[str, Dict[str, Any]] = {}
        self.result: Optional[Dict[str, Any]] = None
        self.show_phase1_rules = False
        self.show_phase1_summary = False
        self.show_phase2_rules = False
        self.show_final_summary = False
        self.time_left = 0

    def get_dict(self):
        return {
            "currentRoundIndex": self.current_round_index,
            "players": self.players,
            "result": self.result,
            "showPhase1Rules": self.show_phase1_rules,
            "showPhase1Summary": self.show_phase1_summary,
            "showPhase2Rules": self.show_phase2_rules,
            "showFinalSummary": self.show_final_summary,
            "timeLeft": self.time_left,
            "scenariosCount": len(SCENARIOS),
            "currentScenario": SCENARIOS[self.current_round_index] if 0 <= self.current_round_index < len(SCENARIOS) else None
        }

state = SimulationState()
timer_task: Optional[asyncio.Task] = None

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

def execute_auction():
    if state.current_round_index < 0 or state.current_round_index >= len(SCENARIOS):
        return
    
    scenario = SCENARIOS[state.current_round_index]
    bidding_players = [{"name": name, "bid": data["bid"], "archetype": data["archetype"]} 
                       for name, data in state.players.items()]
    
    if not bidding_players:
        state.result = {
            "winner": "KHÔNG CÓ", "archetype": "N/A", "winningBid": 0.0, "pricePaid": 0.0,
            "matchType": "Không có người chơi", "revenue": 0.0, "profit": 0.0
        }
        return

    bidding_players.sort(key=lambda x: x["bid"], reverse=True)
    winner = bidding_players[0]
    second_highest_bid = bidding_players[1]["bid"] if len(bidding_players) > 1 else 0.0
    price_paid = min(second_highest_bid + 0.01, winner["bid"])
    
    match_type, revenue = 'Trượt', 0.0
    exact = scenario.get("exact", "")
    broad = scenario.get("broad", "")
    exact_list = [exact] if isinstance(exact, str) else (exact or [])
    broad_list = [broad] if isinstance(broad, str) else (broad or [])

    if exact == 'ALL TEAMS' or winner["archetype"] in exact_list:
        match_type, revenue = 'Khớp chính xác', 15.0
    elif broad == 'ALL TEAMS' or winner["archetype"] in broad_list:
        match_type, revenue = 'Khớp mở rộng', 5.0

    net_profit = revenue - price_paid
    state.players[winner["name"]]["profit"] += net_profit
    state.result = {
        "winner": winner["name"], "archetype": winner["archetype"], "winningBid": winner["bid"], 
        "pricePaid": price_paid, "matchType": match_type, "revenue": revenue, "profit": net_profit
    }
    for name in state.players:
        state.players[name]["submitted"] = False
        state.players[name]["bid"] = 0.0

def advance_phase():
    if state.current_round_index == -1 and not state.show_phase1_rules:
        state.show_phase1_rules = True
    elif state.show_phase1_rules:
        state.show_phase1_rules = False
        state.current_round_index = 0
        state.result = None
    elif state.show_phase1_summary:
        state.show_phase1_summary = False
        state.show_phase2_rules = True
        state.result = None
    elif state.show_phase2_rules:
        state.show_phase2_rules = False
        state.current_round_index = 12
        state.result = None
    elif state.show_final_summary:
        state.reset()
    elif state.result:
        if state.current_round_index == 11:
            state.show_phase1_summary = True
            state.result = None
        elif state.current_round_index >= len(SCENARIOS) - 1:
            state.show_final_summary = True
            state.result = None
        else:
            state.current_round_index += 1
            state.result = None
    else:
        execute_auction()

    stop_timer()
    if (0 <= state.current_round_index < len(SCENARIOS) and not state.result and 
        not any([state.show_phase1_rules, state.show_phase2_rules, state.show_phase1_summary, state.show_final_summary])):
        start_timer(90)
    elif state.result:
        start_timer(15)

async def run_timer():
    try:
        while state.time_left > 0:
            await asyncio.sleep(1)
            state.time_left -= 1
            if state.time_left == 0:
                advance_phase()
                await manager.broadcast({"type": "STATE_UPDATE", "payload": state.get_dict()})
                return
            else:
                await manager.broadcast({"type": "TIMER_TICK", "payload": {"timeLeft": state.time_left}})
    except asyncio.CancelledError:
        pass

def start_timer(seconds: int):
    stop_timer()
    state.time_left = seconds
    global timer_task
    timer_task = asyncio.create_task(run_timer())

def stop_timer():
    global timer_task
    if timer_task:
        timer_task.cancel()
        timer_task = None
    state.time_left = 0

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    await websocket.send_json({"type": "STATE_UPDATE", "payload": state.get_dict()})
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type, payload = message.get("type"), message.get("payload")
            if msg_type == "JOIN_GAME":
                name, archetype = payload.get("name"), payload.get("archetype")
                if name not in state.players:
                    state.players[name] = {"archetype": archetype, "profit": 0.0, "bid": 0.0, "submitted": False}
                await manager.broadcast({"type": "STATE_UPDATE", "payload": state.get_dict()})
            elif msg_type == "SUBMIT_BID":
                name, amount = payload.get("name"), float(payload.get("amount", 0))
                if name in state.players:
                    state.players[name]["bid"], state.players[name]["submitted"] = amount, True
                if all(p["submitted"] for p in state.players.values()):
                    advance_phase()
                await manager.broadcast({"type": "STATE_UPDATE", "payload": state.get_dict()})
            elif msg_type == "FORCE_AUCTION" or msg_type == "NEXT_PHASE":
                advance_phase()
                await manager.broadcast({"type": "STATE_UPDATE", "payload": state.get_dict()})
            elif msg_type == "RESTART":
                stop_timer()
                state.reset()
                await manager.broadcast({"type": "STATE_UPDATE", "payload": state.get_dict()})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WS Error: {e}")
        manager.disconnect(websocket)
