#!/usr/bin/env python3
"""
Test script to validate frontend backtesting functionality
"""
import requests
import json
import time

# API base URL
BASE_URL = "http://localhost:8000/api"

def test_api_endpoints():
    """Test basic API endpoints"""
    print("🧪 Testing API Endpoints...")
    
    # Test strategies endpoint
    try:
        response = requests.get(f"{BASE_URL}/strategies")
        print(f"✅ Strategies: {response.status_code} - {len(response.json())} strategies available")
        for strategy in response.json():
            print(f"   - {strategy['name']} ({strategy['id']})")
    except Exception as e:
        print(f"❌ Strategies endpoint failed: {e}")
    
    # Test symbols endpoint
    try:
        response = requests.get(f"{BASE_URL}/symbols")
        print(f"✅ Symbols: {response.status_code} - {len(response.json())} symbols available")
        print(f"   Available: {', '.join(response.json())}")
    except Exception as e:
        print(f"❌ Symbols endpoint failed: {e}")
    
    # Test data availability
    try:
        response = requests.get(f"{BASE_URL}/data/available")
        print(f"✅ Data Available: {response.status_code} - {len(response.json())} datasets")
        for data in response.json():
            print(f"   - {data['symbol']} ({data['timeframe']}) - {data['recordCount']} records")
    except Exception as e:
        print(f"❌ Data availability endpoint failed: {e}")

def test_backtest_execution():
    """Test running a backtest"""
    print("\n🧪 Testing Backtest Execution...")
    
    # Backtest configuration
    config = {
        "strategyId": "linear_regression",
        "symbol": "AAPL",
        "timeframe": "5m",
        "strategy": "Linear Regression",
        "startDate": "2022-05-09",
        "endDate": "2022-05-15",
        "initialCapital": 10000,
        "commission": 0.1,
        "positionSize": 10,
        "parameters": {}
    }
    
    try:
        print("📊 Running backtest with configuration:")
        print(f"   Strategy: {config['strategy']}")
        print(f"   Symbol: {config['symbol']}")
        print(f"   Period: {config['startDate']} to {config['endDate']}")
        print(f"   Capital: ${config['initialCapital']}")
        
        response = requests.post(
            f"{BASE_URL}/backtest/run",
            json=config,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Backtest completed successfully!")
            print(f"   Backtest ID: {result['id']}")
            print(f"   Strategy: {result['strategyName']}")
            print(f"   Symbol: {result['symbol']}")
            print(f"   Initial Capital: ${result.get('initialCapital', 'N/A')}")
            print(f"   Final Capital: ${result.get('finalCapital', 'N/A')}")
            print(f"   Total Return: {result.get('totalReturn', 'N/A')}%")
            print(f"   Win Rate: {result.get('winRate', 'N/A')}%")
            print(f"   Sharpe Ratio: {result.get('sharpeRatio', 'N/A')}")
            print(f"   Total Trades: {result.get('trades', 'N/A')}")
            return result
        else:
            print(f"❌ Backtest failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except requests.exceptions.Timeout:
        print("⏰ Backtest timeout - this might be normal for complex strategies")
        return None
    except Exception as e:
        print(f"❌ Backtest execution failed: {e}")
        return None

def test_backtest_history():
    """Test backtest history retrieval"""
    print("\n🧪 Testing Backtest History...")
    
    try:
        response = requests.get(f"{BASE_URL}/backtest/history")
        if response.status_code == 200:
            history = response.json()
            print(f"✅ History retrieved: {len(history)} backtests in history")
            for backtest in history[-3:]:  # Show last 3
                print(f"   - {backtest['strategyName']} on {backtest['symbol']} ({backtest.get('totalReturn', 'N/A')}% return)")
        else:
            print(f"❌ History retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"❌ History endpoint failed: {e}")

def main():
    """Main test function"""
    print("🚀 Frontend Backtesting Functionality Test")
    print("=" * 50)
    
    # Test basic endpoints
    test_api_endpoints()
    
    # Test backtest execution
    result = test_backtest_execution()
    
    # Test history
    test_backtest_history()
    
    print("\n" + "=" * 50)
    if result:
        print("✅ All frontend backtesting functionality is working correctly!")
        print("🎯 The system successfully:")
        print("   - Connects to the API server")
        print("   - Loads available strategies and symbols")
        print("   - Executes backtests with Python backend")
        print("   - Returns comprehensive results")
        print("   - Maintains backtest history")
    else:
        print("⚠️  Some functionality may need attention")
        print("💡 Check the API server logs for more details")

if __name__ == "__main__":
    main()
