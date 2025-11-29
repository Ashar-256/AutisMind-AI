import requests
import websocket
import json
import time

def test_http():
    try:
        response = requests.get("http://localhost:8000/")
        print(f"HTTP Test: SUCCESS - {response.json()}")
        return True
    except Exception as e:
        print(f"HTTP Test: FAILED - {e}")
        return False

def test_websocket():
    try:
        ws = websocket.create_connection("ws://localhost:8000/ws/analyze")
        
        # Send test message
        test_message = json.dumps({"task": "eye_contact", "image": "test"})
        ws.send(test_message)
        
        # Receive response
        result = ws.recv()
        print(f"WebSocket Test: SUCCESS - {result}")
        ws.close()
        return True
    except Exception as e:
        print(f"WebSocket Test: FAILED - {e}")
        return False

if __name__ == "__main__":
    print("Testing backend connectivity...")
    
    # Wait a bit for server to start
    time.sleep(2)
    
    http_ok = test_http()
    ws_ok = test_websocket()
    
    if http_ok and ws_ok:
        print("\n✅ All tests passed! Backend is working correctly.")
    else:
        print("\n❌ Some tests failed. Check server logs.")