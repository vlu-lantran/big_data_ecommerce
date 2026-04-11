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

SCENARIOS = []

def get_scenarios():
    global SCENARIOS
    if not SCENARIOS:
        SCENARIOS = load_scenarios()
    return SCENARIOS

class SimulationState:
    def __init__(self):
        self.reset()

    def reset(self):
        self.current_round_index = -1
        self.bids: Dict[str, float] = {"SneakerX": 0.0, "TechGadget": 0.0, "GlowBeauty": 0.0, "FitGear": 0.0}
        self.submitted_bids: Dict[str, bool] = {"SneakerX": False, "TechGadget": False, "GlowBeauty": False, "FitGear": False}
        self.profits: Dict[str, float] = {"SneakerX": 0.0, "TechGadget": 0.0, "GlowBeauty": 0.0, "FitGear": 0.0}
        self.result: Optional[Dict[str, Any]] = None
        self.show_phase1_rules = False
        self.show_phase1_summary = False
        self.show_phase2_rules = False
        self.show_final_summary = False
        self.time_left = 0

    def get_dict(self):
        scenarios = get_scenarios()
        return {
            "currentRoundIndex": self.current_round_index,
            "bids": self.bids,
            "submittedBids": self.submitted_bids,
            "profits": self.profits,
            "result": self.result,
            "showPhase1Rules": self.show_phase1_rules,
            "showPhase1Summary": self.show_phase1_summary,
            "showPhase2Rules": self.show_phase2_rules,
            "showFinalSummary": self.show_final_summary,
            "timeLeft": self.time_left,
            "scenariosCount": len(scenarios),
            "currentScenario": scenarios[self.current_round_index] if 0 <= self.current_round_index < len(scenarios) else None
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

# --- Core Logic ---

def execute_auction():
    if state.current_round_index < 0 or state.current_round_index >= len(SCENARIOS):
        return
    
    scenario = SCENARIOS[state.current_round_index]
    bids = state.bids
    parsed_bids = [{"team": team, "amount": float(bids[team])} for team in bids]
    parsed_bids.sort(key=lambda x: x["amount"], reverse=True)
    
    winner = parsed_bids[0]
    second_highest = parsed_bids[1] if len(parsed_bids) > 1 else None
    
    price_paid = (second_highest["amount"] + 0.01) if second_highest and second_highest["amount"] > 0 else 0.01
    price_paid = min(price_paid, winner["amount"])
    
    match_type, revenue = 'Trượt', 0.0
    exact = scenario.get("exact", "")
    broad = scenario.get("broad", "")
    exact_list = [exact] if isinstance(exact, str) else (exact or [])
    broad_list = [broad] if isinstance(broad, str) else (broad or [])

    if exact == 'ALL TEAMS' or winner["team"] in exact_list:
        match_type, revenue = 'Khớp chính xác', 15.0
    elif broad == 'ALL TEAMS' or winner["team"] in broad_list:
        match_type, revenue = 'Khớp mở rộng', 5.0

    net_profit = revenue - price_paid
    state.profits[winner["team"]] += net_profit
    state.result = {
        "winner": winner["team"], "winningBid": winner["amount"], "pricePaid": price_paid,
        "matchType": match_type, "revenue": revenue, "profit": net_profit
    }
    for team in state.submitted_bids:
        state.submitted_bids[team] = False
        state.bids[team] = 0.0

def advance_phase():
    # Logic to move to the next state
    if state.current_round_index == -1 and not state.show_phase1_rules:
        state.show_phase1_rules = True
    elif state.show_phase1_rules:
        state.show_phase1_rules = False
        state.current_round_index = 0
    elif state.show_phase1_summary:
        state.show_phase1_summary = False
        state.show_phase2_rules = True
    elif state.show_phase2_rules:
        state.show_phase2_rules = False
        state.current_round_index = 12
    elif state.show_final_summary:
        state.reset()
    elif state.current_round_index == 11 and state.result: # End of Phase 1
        state.show_phase1_summary = True
        state.result = None
    elif state.current_round_index >= len(SCENARIOS) - 1 and state.result: # End of Game
        state.show_final_summary = True
        state.result = None
    elif state.result: # Move from result to next round
        state.current_round_index += 1
        state.result = None
    else: # If NEXT_PHASE called during bidding, force auction
        execute_auction()

    # Manage Timer
    stop_timer()
    if 0 <= state.current_round_index < len(SCENARIOS) and not state.result and not any([state.show_phase1_rules, state.show_phase2_rules, state.show_phase1_summary, state.show_final_summary]):
        start_timer(90) # Start 90s bidding timer
    elif state.result:
        start_timer(15) # Start 15s auto-next timer for result screen

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

# --- WebSocket Endpoint ---

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    await websocket.send_json({"type": "STATE_UPDATE", "payload": state.get_dict()})
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type, payload = message.get("type"), message.get("payload")
            
            if msg_type == "SUBMIT_BID":
                team, amount = payload.get("team"), float(payload.get("amount", 0))
                state.bids[team], state.submitted_bids[team] = amount, True
                if all(state.submitted_bids.values()):
                    advance_phase()
                await manager.broadcast({"type": "STATE_UPDATE", "payload": state.get_dict()})
                
            elif msg_type == "FORCE_AUCTION":
                advance_phase()
                await manager.broadcast({"type": "STATE_UPDATE", "payload": state.get_dict()})

            elif msg_type == "NEXT_PHASE":
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
