from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

from simulation import Simulation
from agent import QAgent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sim = Simulation(width=15, height=10, num_boats=3)
agent = QAgent(alpha=0.2, gamma=0.8, epsilon=0.1)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

def run_ai_turn():
    for boat in sim.boats:
        if boat.status == "idle" and not boat.target:
            action = agent.select_action(boat, sim.get_state()["grid"])
            if action:
                tx, ty = action
                sim.assign_boat(boat.id, tx, ty)

async def simulation_loop():
    while True:
        if sim.mode == "ai":
            run_ai_turn()
            
        state = sim.tick()
        await manager.broadcast(json.dumps(state))
        await asyncio.sleep(2.0) # Real-time behavior 

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial state immediately
        await websocket.send_text(json.dumps(sim.get_state()))
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            action = payload.get("action")
            
            if action == "set_mode":
                sim.mode = payload.get("mode", "ai")
            elif action == "set_scenario":
                sim.set_scenario(payload.get("scenario", "low"))
            elif action == "assign_boat" and sim.mode == "manual":
                boat_id = payload.get("boat_id")
                tx = payload.get("target_x")
                ty = payload.get("target_y")
                sim.assign_boat(boat_id, tx, ty)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
