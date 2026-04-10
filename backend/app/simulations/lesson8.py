import random
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/simulations/lesson-8-web-advertising", tags=["lesson8"])

class Scenario(BaseModel):
    user_id: int
    age: int
    activity: str
    intent: str
    group_a: str
    group_b: str
    group_c: str

SCENARIOS = [
    {
        "user_id": 8942,
        "age": 30,
        "activity": "reading a tech blog",
        "intent": "noise-cancelling headphones",
        "group_a": "Headphones",
        "group_b": "Coffee",
        "group_c": "Car Insurance"
    },
    {
        "user_id": 2109,
        "age": 45,
        "activity": "checking morning news",
        "intent": "best life insurance rates",
        "group_a": "Headphones",
        "group_b": "Coffee",
        "group_c": "Car Insurance"
    },
    {
        "user_id": 5531,
        "age": 22,
        "activity": "browsing social media",
        "intent": "gourmet espresso beans",
        "group_a": "Headphones",
        "group_b": "Coffee",
        "group_c": "Car Insurance"
    }
]

@router.get("/scenario", response_model=Scenario)
def get_scenario():
    return random.choice(SCENARIOS)

class BidRequest(BaseModel):
    bid_a: float
    bid_b: float
    bid_c: float

class AuctionResult(BaseModel):
    winner: str
    winning_bid: float
    price_paid: float

@router.post("/auction", response_model=AuctionResult)
def run_auction(bids: BidRequest):
    bids_dict = {
        "Group A": bids.bid_a,
        "Group B": bids.bid_b,
        "Group C": bids.bid_c
    }
    sorted_bids = sorted(bids_dict.items(), key=lambda x: x[1], reverse=True)
    winner = sorted_bids[0][0]
    winning_bid = sorted_bids[0][1]
    
    if len(sorted_bids) > 1 and sorted_bids[1][1] > 0:
        second_highest_bid = sorted_bids[1][1]
        price_paid = second_highest_bid + 0.01
    else:
        # If no second bid, or second bid is 0, they pay a minimum, e.g., 0.01
        price_paid = 0.01
        
    # Cap price_paid to the winning_bid in case of ties or logic issues
    price_paid = min(price_paid, winning_bid)
    
    return {
        "winner": winner,
        "winning_bid": winning_bid,
        "price_paid": price_paid
    }
