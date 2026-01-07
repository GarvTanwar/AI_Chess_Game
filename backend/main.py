from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chess
import chess.engine
import random
import os
import time
from typing import Optional

app = FastAPI()

# Global Stockfish engine instance
stockfish_engine = None
startup_time = None

# Timing middleware to log request duration
@app.middleware("http")
async def timing_middleware(request: Request, call_next):
    start_time = time.time()
    is_cold_start = startup_time is not None and (start_time - startup_time) < 2

    response = await call_next(request)

    duration = time.time() - start_time
    print(f"[TIMING] {request.method} {request.url.path} - {duration:.3f}s" +
          (" [COLD START]" if is_cold_start else ""))

    return response

# CORS middleware to allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://ai-chess-game-eight.vercel.app",  # Your Vercel domain
        # Add more Vercel preview URLs or custom domains as needed
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Stockfish engine path - different for Windows vs Linux/production
if os.name == 'nt':  # Windows
    STOCKFISH_PATH = os.path.join(os.path.dirname(__file__), "stockfish", "stockfish-windows-x86-64-avx2.exe")
else:  # Linux (production)
    STOCKFISH_PATH = os.path.join(os.path.dirname(__file__), "stockfish", "stockfish-linux")

# AI opponent configurations
OPPONENTS = {
    1: {"name": "Joe", "title": "Beginner", "depth": 1, "blunder_chance": 0.3},
    2: {"name": "Sarah", "title": "Casual Player", "depth": 5, "blunder_chance": 0.15},
    3: {"name": "Marcus", "title": "Club Player", "depth": 8, "blunder_chance": 0.05},
    4: {"name": "Elena", "title": "Master", "depth": 12, "blunder_chance": 0.0},
    5: {"name": "Magnus", "title": "Grandmaster", "depth": 15, "blunder_chance": 0.0},
}

class MoveRequest(BaseModel):
    fen: str
    level: int

class MoveResponse(BaseModel):
    move: str
    fen: str
    is_checkmate: bool
    is_stalemate: bool
    is_check: bool

@app.on_event("startup")
async def startup_event():
    """Initialize Stockfish engine once at startup"""
    global stockfish_engine, startup_time
    startup_time = time.time()
    try:
        print(f"[STARTUP] Initializing Stockfish at: {STOCKFISH_PATH}")
        print(f"[STARTUP] File exists: {os.path.exists(STOCKFISH_PATH)}")
        stockfish_engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)
        print(f"[STARTUP] Stockfish initialized successfully in {time.time() - startup_time:.3f}s")
    except Exception as e:
        print(f"[STARTUP ERROR] Failed to initialize Stockfish: {e}")
        stockfish_engine = None

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up Stockfish engine on shutdown"""
    global stockfish_engine
    if stockfish_engine is not None:
        try:
            print("[SHUTDOWN] Closing Stockfish engine")
            stockfish_engine.quit()
        except Exception as e:
            print(f"[SHUTDOWN ERROR] Failed to close Stockfish: {e}")

@app.get("/")
def read_root():
    return {"message": "Chess AI Backend is running!"}

@app.get("/health")
def health_check():
    """Lightweight health check endpoint for warming up the backend"""
    return {
        "status": "ok",
        "stockfish_ready": stockfish_engine is not None,
        "uptime_seconds": time.time() - startup_time if startup_time else 0
    }

@app.get("/opponents")
def get_opponents():
    return OPPONENTS

@app.post("/get-move", response_model=MoveResponse)
async def get_ai_move(request: MoveRequest):
    try:
        # Validate level
        if request.level not in OPPONENTS:
            raise HTTPException(status_code=400, detail="Invalid level")

        opponent = OPPONENTS[request.level]
        board = chess.Board(request.fen)

        print(f"FEN received: {request.fen}")
        print(f"Turn: {'white' if board.turn == chess.WHITE else 'black'}")

        # Check if game is already over
        if board.is_game_over():
            raise HTTPException(status_code=400, detail="Game is already over")

        # CRITICAL: Ensure it's Black's turn (AI plays as Black)
        if board.turn == chess.WHITE:
            raise HTTPException(status_code=400, detail="It's not AI's turn - White to move")

        print(f"AI (Black) is making a move...")

        # Check if Stockfish engine is available
        if stockfish_engine is None:
            raise HTTPException(status_code=503, detail="Stockfish engine not initialized")

        try:
            # Determine if AI should make a blunder
            make_blunder = random.random() < opponent["blunder_chance"]
            legal_moves = list(board.legal_moves)

            if make_blunder and len(legal_moves) > 1:
                # Make a random legal move (blunder)
                move = random.choice(legal_moves)
                print(f"AI making a blunder move: {move.uci()}")
            else:
                # Get best move from Stockfish (reusing global engine)
                result = stockfish_engine.play(board, chess.engine.Limit(depth=opponent["depth"]))
                move = result.move
                print(f"AI making best move: {move.uci()}")

            # Apply move
            board.push(move)

            return MoveResponse(
                move=move.uci(),
                fen=board.fen(),
                is_checkmate=board.is_checkmate(),
                is_stalemate=board.is_stalemate(),
                is_check=board.is_check()
            )

        except chess.engine.EngineTerminatedError:
            print("Stockfish terminated unexpectedly")
            raise HTTPException(status_code=500, detail="Stockfish terminated unexpectedly")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_ai_move: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/validate-move")
async def validate_move(fen: str, move: str):
    try:
        board = chess.Board(fen)
        chess_move = chess.Move.from_uci(move)

        if chess_move in board.legal_moves:
            board.push(chess_move)
            return {
                "valid": True,
                "fen": board.fen(),
                "is_checkmate": board.is_checkmate(),
                "is_stalemate": board.is_stalemate(),
                "is_check": board.is_check()
            }
        else:
            return {"valid": False}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
