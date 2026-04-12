import json
import os
import logging
import asyncio
from pathlib import Path
from typing import Dict, List, Optional, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/simulations/lesson-8-sync", tags=["lesson8-sync"])

# --- Hardcoded Simulation Data ---

SCENARIOS = [
  { "round": 1, "userId": 1042, "age": 25, "activity": "đọc tạp chí thể dục", "intent": "giày chạy bộ", "notes": "Khởi đầu dễ dàng.", "exact": "SneakerX", "broad": "FitGear", "miss": "TechGadget, GlowBeauty" },
  { "round": 2, "userId": 3821, "age": 30, "activity": "xem video review đồ công nghệ", "intent": "tai nghe chống ồn", "notes": "Kiểm tra khớp chính xác hoàn toàn.", "exact": "TechGadget", "broad": "None", "miss": "SneakerX, GlowBeauty, FitGear" },
  { "round": 3, "userId": 9345, "age": 22, "activity": "lướt diễn đàn làm đẹp", "intent": "son môi thuần chay", "notes": "Kiểm tra khớp chính xác hoàn toàn.", "exact": "GlowBeauty", "broad": "None", "miss": "SneakerX, TechGadget, FitGear" },
  { "round": 4, "userId": 2843, "age": 28, "activity": "đọc blog sức khỏe", "intent": "quần áo tập thể dục", "notes": "Xây dựng sự tự tin.", "exact": "FitGear", "broad": "SneakerX", "miss": "TechGadget, GlowBeauty" },
  { "round": 5, "userId": 5521, "age": 45, "activity": "xem trang web mẹ và bé", "intent": "quà cho tuổi teen", "notes": "BẪY: Cơn sốt khớp mở rộng. Cám dỗ đặt giá thầu quá cao cho giá trị thấp.", "exact": "None", "broad": "ALL TEAMS", "miss": "None" },
  { "round": 6, "userId": 8329, "age": 24, "activity": "xem diễn đàn thời trang đường phố", "intent": "giày sneaker hiếm bản giới hạn", "notes": "Phần thưởng cao cho SneakerX ngay sau một cái bẫy mở rộng.", "exact": "SneakerX", "broad": "None", "miss": "TechGadget, GlowBeauty, FitGear" },
  { "round": 7, "userId": 1024, "age": 35, "activity": "tìm hiểu về leo núi", "intent": "bình nước thể thao", "notes": "Vòng tiêu chuẩn.", "exact": "FitGear", "broad": "SneakerX", "miss": "TechGadget, GlowBeauty" },
  { "round": 8, "userId": 4721, "age": 21, "activity": "xem stream game", "intent": "màn hình gaming 4k", "notes": "Vòng tiêu chuẩn.", "exact": "TechGadget", "broad": "None", "miss": "SneakerX, GlowBeauty, FitGear" },
  { "round": 9, "userId": 6512, "age": 27, "activity": "đọc bài viết chăm sóc bản thân", "intent": "các bước chăm sóc da", "notes": "Vòng tiêu chuẩn.", "exact": "GlowBeauty", "broad": "None", "miss": "SneakerX, TechGadget, FitGear" },
  { "round": 10, "userId": 3310, "age": 19, "activity": "lướt trang tổng hợp giảm giá", "intent": "giày rẻ", "notes": "Ý định thấp, nhưng vẫn khớp chính xác.", "exact": "SneakerX", "broad": "FitGear", "miss": "TechGadget, GlowBeauty" },
  { "round": 11, "userId": 5123, "age": 40, "activity": "đọc báo sức khỏe", "intent": "cách giảm cân", "notes": "BẪY: Ý định mơ hồ. Khớp mở rộng thường chi tiêu quá mức.", "exact": "None", "broad": "FitGear", "miss": "SneakerX, TechGadget, GlowBeauty" },
  { "round": 12, "userId": 7731, "age": 32, "activity": "đọc trang tin tức mua sắm tổng hợp", "intent": "mua mọi thứ giảm giá", "notes": "BẪY Miền Tây Hoang Dã cuối cùng: Cám dỗ các đội dồn hết ngân sách còn lại trước giai đoạn 2.", "exact": "None", "broad": "ALL TEAMS", "miss": "None" },
  { "round": 13, "userId": 9123, "age": 26, "activity": "xem video trang điểm", "intent": "mascara chống nước", "notes": "Thử nghiệm thuật toán.", "exact": "GlowBeauty", "broad": "None", "miss": "SneakerX, TechGadget, FitGear" },
  { "round": 14, "userId": 2284, "age": 29, "activity": "đọc blog lập trình", "intent": "bàn phím cơ", "notes": "Thử nghiệm thuật toán.", "exact": "TechGadget", "broad": "None", "miss": "SneakerX, GlowBeauty, FitGear" },
  { "round": 15, "userId": 4412, "age": 33, "activity": "xem lịch thi đấu thể thao", "intent": "quần đùi tập gym", "notes": "Thử nghiệm thuật toán.", "exact": "FitGear", "broad": "SneakerX", "miss": "TechGadget, GlowBeauty" },
  { "round": 16, "userId": 8812, "age": 31, "activity": "đọc tin tức điền kinh", "intent": "đồ chạy marathon", "notes": "Thử nghiệm thuật toán.", "exact": "SneakerX", "broad": "FitGear", "miss": "TechGadget, GlowBeauty" },
  { "round": 17, "userId": 1121, "age": 38, "activity": "lướt trang tổng hợp khuyến mãi", "intent": "ưu đãi black friday", "notes": "CÚ SỐC: Lưu lượng truy cập tăng vọt. Thuật toán đặt giá thầu mở rộng có thể chi tiêu quá mức.", "exact": "None", "broad": "ALL TEAMS", "miss": "None" },
  { "round": 18, "userId": 2931, "age": 36, "activity": "tìm kiếm đồ điện tử", "intent": "ưu đãi cyber monday", "notes": "CÚ SỐC: Lưu lượng truy cập tăng vọt phần 2. Trừng phạt đặt giá thầu mở rộng quá tích cực.", "exact": "None", "broad": "ALL TEAMS", "miss": "None" },
  { "round": 19, "userId": 6621, "age": 41, "activity": "xem tạp chí thời trang", "intent": "kem nền cao cấp", "notes": "Phần thưởng cho việc bảo toàn ngân sách.", "exact": "GlowBeauty", "broad": "None", "miss": "SneakerX, TechGadget, FitGear" },
  { "round": 20, "userId": 3812, "age": 23, "activity": "xem đánh giá phụ kiện máy tính", "intent": "chuột không dây", "notes": "Phần thưởng cho việc bảo toàn ngân sách.", "exact": "TechGadget", "broad": "None", "miss": "SneakerX, GlowBeauty, FitGear" },
  { "round": 21, "userId": 5543, "age": 27, "activity": "đọc hướng dẫn yoga", "intent": "áo ngực thể thao", "notes": "Vòng tiêu chuẩn.", "exact": "FitGear", "broad": "None", "miss": "SneakerX, TechGadget, GlowBeauty" },
  { "round": 22, "userId": 9912, "age": 20, "activity": "xem highlight bóng rổ", "intent": "giày bóng rổ", "notes": "Vòng tiêu chuẩn.", "exact": "SneakerX", "broad": "FitGear", "miss": "TechGadget, GlowBeauty" },
  { "round": 23, "userId": "Ẩn", "age": "??", "activity": "đọc báo thời tiết địa phương", "intent": "Không xác định (Chặn Cookie)", "notes": "CÚ SỐC: Cookie bị chặn. Bạn không biết tuổi hay sở thích, chỉ biết ngữ cảnh trang web (Contextual Targeting).", "exact": "None", "broad": "None", "miss": "ALL TEAMS" },
  { "round": 24, "userId": "Ẩn", "age": "??", "activity": "chơi game giải đố trên điện thoại", "intent": "Không xác định (Chặn Cookie)", "notes": "Cookie bị chặn phần 2. Ngữ cảnh trang web không liên quan đến thương hiệu nào.", "exact": "None", "broad": "None", "miss": "ALL TEAMS" },
  { "round": 25, "userId": "Ẩn", "age": "??", "activity": "đọc bài viết chăm sóc da mùa đông", "intent": "Không xác định (Chặn Cookie)", "notes": "Không có cookie, nhưng ngữ cảnh trang web (Contextual Targeting) rất phù hợp với GlowBeauty.", "exact": "GlowBeauty", "broad": "None", "miss": "SneakerX, TechGadget, FitGear" },
  { "round": 26, "userId": "Ẩn", "age": "??", "activity": "đọc trang đánh giá đồ công nghệ wearable", "intent": "Không xác định (Chặn Cookie)", "notes": "Nhắm mục tiêu theo ngữ cảnh. Giá trị cao cho TechGadget.", "exact": "TechGadget", "broad": "FitGear", "miss": "SneakerX, GlowBeauty" },
  { "round": 27, "userId": "Ẩn", "age": "??", "activity": "xem video hướng dẫn tập yoga tại nhà", "intent": "Không xác định (Chặn Cookie)", "notes": "Vòng cuối. Không có cookie, chỉ có ngữ cảnh trang web. Các đội có thể dồn hết ngân sách.", "exact": "FitGear", "broad": "None", "miss": "SneakerX, TechGadget, GlowBeauty" }
]

# --- State Management ---

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
        bad_links = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                bad_links.append(connection)
        
        for link in bad_links:
            self.disconnect(link)

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

async def advance_phase_with_broadcast():
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
        start_timer(33)
    elif state.result:
        start_timer(7)
    
    await manager.broadcast({"type": "STATE_UPDATE", "payload": state.get_dict()})

async def run_timer():
    try:
        while state.time_left > 0:
            await asyncio.sleep(1)
            state.time_left -= 1
            if state.time_left == 0:
                await advance_phase_with_broadcast()
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
    # Initial catch-up for reconnecting clients
    await websocket.send_json({"type": "STATE_UPDATE", "payload": state.get_dict()})
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type, payload = message.get("type"), message.get("payload")
            
            if msg_type == "PING":
                await websocket.send_json({"type": "PONG"})
                continue

            if msg_type == "JOIN_GAME":
                name, archetype = payload.get("name"), payload.get("archetype")
                if name not in state.players:
                    state.players[name] = {"archetype": archetype, "profit": 0.0, "bid": 0.0, "submitted": False}
                else:
                    state.players[name]["archetype"] = archetype
                await manager.broadcast({"type": "STATE_UPDATE", "payload": state.get_dict()})

            elif msg_type == "SUBMIT_BID":
                name, amount = payload.get("name"), float(payload.get("amount", 0))
                if name in state.players:
                    state.players[name]["bid"], state.players[name]["submitted"] = amount, True
                if all(p["submitted"] for p in state.players.values()):
                    await advance_phase_with_broadcast()
                else:
                    await manager.broadcast({"type": "STATE_UPDATE", "payload": state.get_dict()})

            elif msg_type == "FORCE_AUCTION" or msg_type == "NEXT_PHASE":
                await advance_phase_with_broadcast()

            elif msg_type == "RESTART":
                stop_timer()
                state.reset()
                await manager.broadcast({"type": "STATE_UPDATE", "payload": state.get_dict()})

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
