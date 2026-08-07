import asyncio
import websockets
import sys

async def test_ws():
    uri = "ws://localhost:8080/ws/v1/events?token=dummy"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected successfully!")
            await websocket.close()
    except Exception as e:
        print(f"Connection failed: {e}")

asyncio.get_event_loop().run_until_complete(test_ws())
