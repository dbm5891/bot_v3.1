from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import subprocess
import json
import os
import csv
from datetime import datetime
import uuid
import glob
import ast
import re
import requests
# Add dotenv support
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Bot v3.1 Backtesting API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class BacktestConfig(BaseModel):
    strategyId: str
    symbol: str
    timeframe: str
    strategy: str
    startDate: str
    endDate: str
    initialCapital: float
    commission: float
    positionSize: float
    stopLoss: Optional[float] = None
    takeProfit: Optional[float] = None
    parameters: Dict[str, Any] = {}

class TradeDetail(BaseModel):
    id: Optional[int] = None
    entryDate: str
    exitDate: str
    entryPrice: float
    exitPrice: float
    direction: str
    profit: float
    profitPercent: float
    size: Optional[float] = None
    type: Optional[str] = None

class BacktestResult(BaseModel):
    id: str
    strategyId: Optional[str] = None
    strategyName: str
    symbol: str
    timeframe: str
    startDate: str
    endDate: str
    initialBalance: Optional[float] = None
    finalBalance: Optional[float] = None
    initialCapital: Optional[float] = None
    finalCapital: Optional[float] = None
    totalReturn: Optional[float] = None
    roi: Optional[float] = None
    annualizedReturn: Optional[float] = None
    maxDrawdown: Optional[float] = None
    sharpeRatio: float
    drawdown: Optional[float] = None
    winRate: float
    profitFactor: Optional[float] = None
    trades: int
    tradesCount: Optional[int] = None
    tradesDetails: Optional[List[TradeDetail]] = None
    createdAt: Optional[str] = None

# In-memory storage for demonstration
backtest_results: List[BacktestResult] = []

@app.get("/")
async def root():
    return {"message": "Bot v3.1 Backtesting API is running"}

@app.post("/api/backtest/run", response_model=BacktestResult)
async def run_backtest(config: BacktestConfig):
    """Run a backtest using the Python backtesting script"""
    try:
        # Validate strategyId
        allowed_strategies = {"linear_regression", "time_based"}
        if config.strategyId not in allowed_strategies:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid strategyId '{config.strategyId}'. Must be one of: {', '.join(allowed_strategies)}."
            )
        
        # Generate unique ID for this backtest
        backtest_id = str(uuid.uuid4())
        
        # Map frontend config to Python script parameters
        if config.symbol in ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA"]:
            symbol_arg = "--symbols5"
        else:
            symbol_arg = "--symbols"
            symbol_value = config.symbol
        
        strategy_arg = f"--strategy={config.strategyId}"
        
        # Build command to run the Python backtesting script
        cmd = [
            "python", 
            "backtesting/backtrader/run_bt_v2.py",
            symbol_arg,
            "--no-plot",  # Disable plotting for API usage
        ]
        
        # Add symbol value if not using predefined list
        if symbol_arg == "--symbols":
            cmd.append(symbol_value)
        
        # Add strategy
        cmd.append(strategy_arg)
        
        # Add optional parameters if provided
        if config.startDate:
            cmd.extend(["--start-date", config.startDate])
        if config.endDate:
            cmd.extend(["--end-date", config.endDate])
        
        print(f"Running command: {' '.join(cmd)}")
        
        # Run the backtesting script
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            cwd=os.getcwd(),
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode != 0:
            raise HTTPException(
                status_code=500, 
                detail=f"Backtesting failed: {result.stderr}"
            )
        
        # Parse the output to extract results
        output_lines = result.stdout.split('\n')
        
        # Extract key metrics from the output
        total_return = 0.0
        win_rate = 0.0
        total_trades = 0
        profit_factor = 0.0
        sharpe_ratio = 0.0
        max_drawdown = 0.0
        final_value = config.initialCapital
        
        # Parse the summary output for metrics
        for line in output_lines:
            if "Total P&L:" in line:
                try:
                    pnl = float(line.split("$")[1].strip())
                    total_return = (pnl / config.initialCapital) * 100
                    final_value = config.initialCapital + pnl
                except:
                    pass
            elif "Win Rate:" in line:
                try:
                    win_rate = float(line.split("%")[0].split(":")[-1].strip())
                except:
                    pass
            elif "Total Trades:" in line:
                try:
                    total_trades = int(line.split(":")[-1].strip())
                except:
                    pass
            elif "Profit Factor:" in line:
                try:
                    profit_factor = float(line.split(":")[-1].strip())
                except:
                    pass
            elif "Sharpe Ratio:" in line:
                try:
                    sharpe_ratio = float(line.split(":")[-1].strip())
                except:
                    pass
        
        # Try to read detailed results from CSV if available
        trade_details = []
        try:
            # Look for the most recent CSV file in outputs directory
            outputs_dir = "backtesting/outputs"
            csv_files = [f for f in os.listdir(outputs_dir) if f.endswith('.csv')]
            if csv_files:
                latest_csv = max(csv_files, key=lambda x: os.path.getctime(os.path.join(outputs_dir, x)))
                csv_path = os.path.join(outputs_dir, latest_csv)
                
                # Read the CSV file for trade details
                with open(csv_path, 'r') as f:
                    reader = csv.DictReader(f)
                    for i, row in enumerate(reader):
                        try:
                            trade_detail = TradeDetail(
                                id=i + 1,
                                entryDate=row.get('Entry Date', ''),
                                exitDate=row.get('Exit Date', ''),
                                entryPrice=float(row.get('Entry Price', 0)),
                                exitPrice=float(row.get('Exit Price', 0)),
                                direction='long',  # Default assumption
                                profit=float(row.get('P&L', 0)),
                                profitPercent=float(row.get('P&L %', 0)),
                                size=float(row.get('Size', 0)) if row.get('Size') else None
                            )
                            trade_details.append(trade_detail)
                        except Exception as e:
                            print(f"Error parsing trade detail: {e}")
                            continue
        except Exception as e:
            print(f"Error reading CSV file: {e}")
        
        # Create the backtest result
        backtest_result = BacktestResult(
            id=backtest_id,
            strategyId=config.strategyId,
            strategyName=config.strategy.replace('_', ' ').title(),
            symbol=config.symbol,
            timeframe=config.timeframe,
            startDate=config.startDate,
            endDate=config.endDate,
            initialCapital=config.initialCapital,
            finalCapital=final_value,
            initialBalance=config.initialCapital,
            finalBalance=final_value,
            totalReturn=total_return,
            roi=total_return,
            maxDrawdown=max_drawdown,
            sharpeRatio=sharpe_ratio,
            winRate=win_rate,
            profitFactor=profit_factor,
            trades=total_trades,
            tradesCount=total_trades,
            tradesDetails=trade_details,
            createdAt=datetime.now().isoformat()
        )
        
        # Store the result
        backtest_results.append(backtest_result)
        
        return backtest_result
        
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Backtesting timeout")
    except Exception as e:
        print(f"Error running backtest: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/backtest/history", response_model=List[BacktestResult])
async def get_backtest_history():
    """Get the history of all backtests"""
    return backtest_results

@app.get("/api/backtest/{backtest_id}", response_model=BacktestResult)
async def get_backtest(backtest_id: str):
    """Get a specific backtest by ID"""
    for result in backtest_results:
        if result.id == backtest_id:
            return result
    raise HTTPException(status_code=404, detail="Backtest not found")

@app.get("/api/strategies")
async def get_strategies():
    """Get available strategies from st_*.py files"""
    strategy_dir = os.path.join(os.path.dirname(__file__), 'backtesting', 'backtrader', 'strategies')
    pattern = os.path.join(strategy_dir, 'st_*.py')
    strategy_files = glob.glob(pattern)
    strategies = []

    def format_strategy_name(class_name):
        # Remove 'Strategy' prefix
        if class_name.startswith('Strategy'):
            name = class_name[len('Strategy'):]
        else:
            name = class_name
        # If only digits, return as is
        if name.isdigit():
            return name
        # Split by underscores
        parts = name.split('_')
        formatted_parts = []
        for i, part in enumerate(parts):
            # If last part and all uppercase or known suffix, wrap in parentheses
            if i == len(parts) - 1 and (part.isupper() or part in {'LR', 'Pivot', 'Long', 'Short'}):
                if len(parts) > 1:
                    formatted_parts[-1] = formatted_parts[-1] + f' ({part})'
                else:
                    formatted_parts.append(f'({part})')
            else:
                # Split CamelCase into words
                words = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+', part)
                formatted = ' '.join(words)
                # If this is a multi-word segment, join with hyphen
                if len(words) > 1 and i != len(parts) - 1:
                    formatted = '-'.join(words)
                formatted_parts.append(formatted)
        # Join all parts with spaces
        return ' '.join([p for p in formatted_parts if p])

    for file_path in strategy_files:
        file_name = os.path.basename(file_path)
        # id: remove 'st_' prefix and '.py' suffix
        if file_name.startswith('st_') and file_name.endswith('.py'):
            strategy_id = file_name[3:-3]
        else:
            continue
        # Defaults
        class_name = None
        description = ""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                source = f.read()
            module = ast.parse(source)
            # Try to get module-level docstring
            module_doc = ast.get_docstring(module)
            if module_doc:
                description = module_doc
            # Find the first class definition
            for node in module.body:
                if isinstance(node, ast.ClassDef):
                    class_name = node.name
                    class_doc = ast.get_docstring(node)
                    if class_doc:
                        description = class_doc

                    # Check for a DESCRIPTION attribute on the class
                    for item in node.body:
                        if isinstance(item, ast.Assign):
                            for target in item.targets:
                                if isinstance(target, ast.Name) and target.id == 'DESCRIPTION':
                                    if isinstance(item.value, ast.Constant):
                                        description = item.value.value
                                    break
                            if description: # If description found, no need to check further assignments
                                break
                    break
        except Exception as e:
            print(f"Error parsing {file_name}: {e}")
        # Fallbacks
        if class_name:
            name = format_strategy_name(class_name)
        else:
            # If no class, fallback to id
            name = strategy_id.replace('_', ' ').title()
        strategies.append({
            "id": strategy_id,
            "name": name,
            "description": description,
            "type": "custom",
            "parameters": []
        })
    return strategies

@app.get("/api/symbols")
async def get_symbols():
    """Get available symbols for backtesting"""
    return ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA", "GOOGL", "META"]

@app.get("/api/data/available")
async def get_available_data():
    """Get available market data information"""
    return [
        {
            "id": "1",
            "symbol": "AAPL",
            "timeframe": "5m",
            "startDate": "2022-05-02",
            "endDate": "2022-05-31",
            "recordCount": 921276,
            "source": "csv",
            "hasIndicators": True,
            "fileSize": "52MB",
            "lastUpdated": "2024-04-15"
        },
        {
            "id": "2",
            "symbol": "Multiple Symbols",
            "timeframe": "5m",
            "startDate": "2022-05-02", 
            "endDate": "2022-05-31",
            "recordCount": 921276,
            "source": "csv",
            "hasIndicators": True,
            "fileSize": "52MB",
            "lastUpdated": "2024-04-15"
        }
    ]

@app.get("/api/portfolio/performance")
async def get_portfolio_performance(timeRange: str = "ALL"):
    """Get portfolio performance data"""
    # Mock portfolio performance data
    from datetime import datetime, timedelta
    import random
    
    # Generate mock performance data based on time range
    end_date = datetime.now()
    if timeRange == "1D":
        start_date = end_date - timedelta(days=1)
        data_points = 24  # Hourly data
    elif timeRange == "1W":
        start_date = end_date - timedelta(weeks=1)
        data_points = 7  # Daily data
    elif timeRange == "1M":
        start_date = end_date - timedelta(days=30)
        data_points = 30  # Daily data
    elif timeRange == "3M":
        start_date = end_date - timedelta(days=90)
        data_points = 90  # Daily data
    elif timeRange == "1Y":
        start_date = end_date - timedelta(days=365)
        data_points = 52  # Weekly data
    else:  # ALL
        start_date = end_date - timedelta(days=365 * 2)
        data_points = 104  # Weekly data for 2 years
    
    # Generate mock performance data with some volatility
    performance_data = []
    benchmark_data = []
    base_value = 10000
    benchmark_base = 10000
    
    for i in range(data_points):
        date = start_date + timedelta(days=i * (365 * 2 / data_points))
        
        # Portfolio performance with some random walk
        portfolio_return = random.uniform(-0.02, 0.03)  # -2% to +3% daily
        base_value *= (1 + portfolio_return)
        
        # Benchmark performance (slightly more conservative)
        benchmark_return = random.uniform(-0.015, 0.025)  # -1.5% to +2.5% daily
        benchmark_base *= (1 + benchmark_return)
        
        performance_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "value": round(base_value, 2)
        })
        
        benchmark_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "value": round(benchmark_base, 2)
        })
    
    # Calculate metrics
    total_return = ((base_value - 10000) / 10000) * 100
    max_drawdown = random.uniform(5, 15)  # Mock drawdown
    sharpe_ratio = random.uniform(0.8, 2.5)  # Mock Sharpe ratio
    
    return {
        "performanceData": performance_data,
        "benchmarkData": benchmark_data,
        "metrics": {
            "totalReturn": round(total_return, 2),
            "maxDrawdown": round(max_drawdown, 2),
            "sharpeRatio": round(sharpe_ratio, 2)
        }
    }

@app.get("/api/market/indices")
async def get_market_indices():
    """Fetch S&P 500, NASDAQ, and Dow Jones index data from Yahoo Finance"""
    import yfinance as yf
    from datetime import datetime
    
    INDEX_SYMBOLS = [
        {"symbol": "^GSPC", "name": "S&P 500"},
        {"symbol": "^IXIC", "name": "NASDAQ"},
        {"symbol": "^DJI", "name": "Dow Jones"},
    ]
    results = []
    
    for idx in INDEX_SYMBOLS:
        try:
            print(f"Debug: Fetching data for {idx['symbol']} from Yahoo Finance")
            ticker = yf.Ticker(idx["symbol"])
            info = ticker.info
            print(f"Debug: Yahoo Finance info for {idx['symbol']}: {info}")
            
            price = info.get("regularMarketPrice", 0)
            previous_close = info.get("regularMarketPreviousClose", 0)
            open_price = info.get("regularMarketOpen", 0)
            day_low = info.get("regularMarketDayLow", 0)
            day_high = info.get("regularMarketDayHigh", 0)
            volume = info.get("regularMarketVolume", 0)
            
            change = info.get("regularMarketChange", 0)
            changes_percentage = info.get("regularMarketChangePercent", 0)
            
            results.append({
                "symbol": idx["symbol"],
                "name": idx["name"],
                "price": price,
                "changesPercentage": changes_percentage,
                "change": change,
                "dayLow": day_low,
                "dayHigh": day_high,
                "yearHigh": info.get("yearHigh", 0),
                "yearLow": info.get("yearLow", 0),
                "marketCap": info.get("marketCap", None),
                "priceAvg50": info.get("fiftyDayAverage", 0),
                "priceAvg200": info.get("twoHundredDayAverage", 0),
                "volume": volume,
                "avgVolume": info.get("averageVolume", 0),
                "exchange": info.get("exchange", ""),
                "open": open_price,
                "previousClose": previous_close,
                "eps": info.get("epsTrailingTwelveMonths", None),
                "pe": info.get("trailingPE", None),
                "earningsAnnouncement": info.get("earningsTimestamp", None),
                "sharesOutstanding": info.get("sharesOutstanding", None),
                "timestamp": int(datetime.now().timestamp() * 1000),
            })
        except Exception as e:
            print(f"Error fetching {idx['symbol']} from Yahoo Finance: {e}")
            results.append({
                "symbol": idx["symbol"],
                "name": idx["name"],
                "price": 0,
                "changesPercentage": 0,
                "change": 0,
                "dayLow": 0,
                "dayHigh": 0,
                "yearHigh": 0,
                "yearLow": 0,
                "marketCap": None,
                "priceAvg50": 0,
                "priceAvg200": 0,
                "volume": 0,
                "avgVolume": 0,
                "exchange": "",
                "open": 0,
                "previousClose": 0,
                "eps": None,
                "pe": None,
                "earningsAnnouncement": None,
                "sharesOutstanding": None,
                "timestamp": int(datetime.now().timestamp() * 1000),
            })
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
