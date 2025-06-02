import requests
import json
import time

# Test the backtest API with the exact configuration from the frontend
url = "http://localhost:8000/api/backtest/run"
data = {
    "strategyId": "linear_regression",
    "symbol": "AAPL",
    "timeframe": "1d",
    "strategy": "Linear Regression",
    "startDate": "2022-05-01",
    "endDate": "2022-05-15",
    "initialCapital": 10000,
    "commission": 0.1,
    "positionSize": 10,
    "stopLoss": 5,
    "takeProfit": None,
    "parameters": {}
}

print("Testing backtest API...")
print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}")
print("Making request...")

start_time = time.time()
try:
    response = requests.post(url, json=data, timeout=30)  # 30 second timeout
    end_time = time.time()
    print(f"Request completed in {end_time - start_time:.2f} seconds")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print(f"Success! Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Error Response: {response.text}")
except requests.exceptions.Timeout:
    print("Request timed out after 30 seconds")
except Exception as e:
    print(f"Exception: {e}") 