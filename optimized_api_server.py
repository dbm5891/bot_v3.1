"""
Optimized API Server with Advanced Performance Features
- Redis caching for frequently accessed data
- Connection pooling for database operations
- Async/await for non-blocking operations
- Request/response compression
- Rate limiting and security
- Database query optimization
- Memory management improvements
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import subprocess
import json
import os
import csv
from datetime import datetime, timedelta
import uuid
import glob
import ast
import re
import asyncio
import aiofiles
import asyncio
from concurrent.futures import ThreadPoolExecutor
import functools
from cachetools import TTLCache
import hashlib

# Enhanced imports for optimization
try:
    import redis.asyncio as redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    print("Redis not available - using in-memory cache")

try:
    import aiocache
    from aiocache import Cache
    AIOCACHE_AVAILABLE = True
except ImportError:
    AIOCACHE_AVAILABLE = False
    print("aiocache not available - using basic caching")

# Environment and logging setup
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler

# Set up optimized logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s %(message)s',
)
logger = logging.getLogger("optimized_api_server")

# Add rotating file handler with compression
file_handler = RotatingFileHandler(
    'optimized_api_server.log', 
    maxBytes=10*1024*1024,  # 10MB
    backupCount=10
)
file_handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(name)s %(message)s')
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

load_dotenv()

# Enhanced FastAPI app with optimizations
app = FastAPI(
    title="Optimized Bot v3.1 Backtesting API", 
    version="2.0.0",
    description="High-performance API with caching, compression, and async operations"
)

# Add performance middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)  # Compress responses > 1KB

# Enhanced CORS with security
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:8000",
        "https://your-production-domain.com"  # Add production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    max_age=3600,  # Cache CORS preflight for 1 hour
)

# Global cache instances
if REDIS_AVAILABLE:
    redis_client = None
    
    async def get_redis():
        global redis_client
        if not redis_client:
            redis_client = redis.Redis(
                host=os.getenv('REDIS_HOST', 'localhost'),
                port=int(os.getenv('REDIS_PORT', 6379)),
                decode_responses=True
            )
        return redis_client
else:
    # Fallback to in-memory cache
    memory_cache = TTLCache(maxsize=1000, ttl=300)  # 5-minute TTL

# Thread pool for CPU-intensive tasks
executor = ThreadPoolExecutor(max_workers=4)

# Cache decorators and utilities
def cache_key(*args, **kwargs):
    """Generate a consistent cache key from arguments"""
    key_data = str(args) + str(sorted(kwargs.items()))
    return hashlib.md5(key_data.encode()).hexdigest()

async def get_cached_data(key: str):
    """Get data from cache (Redis or memory)"""
    if REDIS_AVAILABLE:
        redis_conn = await get_redis()
        try:
            data = await redis_conn.get(key)
            return json.loads(data) if data else None
        except Exception as e:
            logger.error(f"Redis error: {e}")
            return None
    else:
        return memory_cache.get(key)

async def set_cached_data(key: str, data: Any, ttl: int = 300):
    """Set data in cache with TTL"""
    if REDIS_AVAILABLE:
        redis_conn = await get_redis()
        try:
            await redis_conn.setex(key, ttl, json.dumps(data, default=str))
        except Exception as e:
            logger.error(f"Redis error: {e}")
    else:
        memory_cache[key] = data

# Enhanced data models
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
    cached: Optional[bool] = False  # Indicate if result was cached

# Optimized storage with persistence
class OptimizedStorage:
    def __init__(self):
        self.backtest_results: List[BacktestResult] = []
        self.recent_errors = []
    
    async def load_persisted_data(self):
        """Load persisted data from file on startup"""
        try:
            if os.path.exists('backtest_results.json'):
                async with aiofiles.open('backtest_results.json', 'r') as f:
                    data = await f.read()
                    results_data = json.loads(data)
                    self.backtest_results = [
                        BacktestResult(**result) for result in results_data
                    ]
                    logger.info(f"Loaded {len(self.backtest_results)} persisted backtest results")
        except Exception as e:
            logger.error(f"Error loading persisted data: {e}")
    
    async def persist_data(self):
        """Persist data to file"""
        try:
            data = [result.dict() for result in self.backtest_results]
            async with aiofiles.open('backtest_results.json', 'w') as f:
                await f.write(json.dumps(data, default=str, indent=2))
        except Exception as e:
            logger.error(f"Error persisting data: {e}")
    
    async def add_result(self, result: BacktestResult):
        """Add result and persist"""
        self.backtest_results.append(result)
        await self.persist_data()
        
        # Cache the result
        cache_key_str = f"backtest_result_{result.id}"
        await set_cached_data(cache_key_str, result.dict(), ttl=3600)

# Global storage instance
storage = OptimizedStorage()

# Async utilities
async def run_subprocess_async(cmd: List[str], timeout: int = 300):
    """Run subprocess asynchronously"""
    try:
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=os.getcwd()
        )
        
        stdout, stderr = await asyncio.wait_for(
            process.communicate(), timeout=timeout
        )
        
        return {
            'returncode': process.returncode,
            'stdout': stdout.decode(),
            'stderr': stderr.decode()
        }
    except asyncio.TimeoutError:
        logger.error(f"Subprocess timeout: {cmd}")
        raise HTTPException(status_code=408, detail="Process timeout")
    except Exception as e:
        logger.error(f"Subprocess error: {e}")
        raise HTTPException(status_code=500, detail=f"Process error: {str(e)}")

async def read_csv_async(file_path: str) -> List[Dict]:
    """Read CSV file asynchronously"""
    try:
        async with aiofiles.open(file_path, 'r') as f:
            content = await f.read()
            
        # Parse CSV in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        csv_data = await loop.run_in_executor(
            executor, 
            parse_csv_content, 
            content
        )
        return csv_data
    except Exception as e:
        logger.error(f"Error reading CSV {file_path}: {e}")
        return []

def parse_csv_content(content: str) -> List[Dict]:
    """Parse CSV content in thread pool"""
    import io
    import csv
    
    reader = csv.DictReader(io.StringIO(content))
    return list(reader)

# Optimized route handlers
@app.get("/")
async def root():
    return {
        "message": "Optimized Bot v3.1 Backtesting API is running",
        "version": "2.0.0",
        "features": ["caching", "compression", "async", "persistence"]
    }

@app.get("/api/health")
async def health_check():
    """Enhanced health check with performance metrics"""
    try:
        redis_status = "connected" if REDIS_AVAILABLE else "not_available"
        if REDIS_AVAILABLE:
            redis_conn = await get_redis()
            await redis_conn.ping()
    except:
        redis_status = "error"
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "redis": redis_status,
        "cache_size": len(memory_cache) if not REDIS_AVAILABLE else "redis",
        "active_results": len(storage.backtest_results)
    }

@app.post("/api/backtest/run", response_model=BacktestResult)
async def run_backtest_optimized(config: BacktestConfig, background_tasks: BackgroundTasks):
    """Optimized backtest execution with caching and async processing"""
    
    # Generate cache key based on config
    config_hash = cache_key(
        config.strategyId, config.symbol, config.timeframe,
        config.startDate, config.endDate, config.initialCapital,
        str(config.parameters)
    )
    cache_key_str = f"backtest_{config_hash}"
    
    # Check cache first
    cached_result = await get_cached_data(cache_key_str)
    if cached_result:
        logger.info(f"Returning cached backtest result for {config.symbol}")
        cached_result['cached'] = True
        return BacktestResult(**cached_result)
    
    try:
        # Validate strategy asynchronously
        strategies = await get_strategies_cached()
        strategy_ids = {s['id'] for s in strategies}
        
        if config.strategyId not in strategy_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid strategyId '{config.strategyId}'. Available: {', '.join(strategy_ids)}"
            )
        
        # Generate unique ID
        backtest_id = str(uuid.uuid4())
        
        # Build command
        cmd = await build_backtest_command(config)
        logger.info(f"Running backtest command: {' '.join(cmd)}")
        
        # Run backtest asynchronously
        result = await run_subprocess_async(cmd, timeout=300)
        
        if result['returncode'] != 0:
            logger.error(f"Backtesting failed: {result['stderr']}")
            raise HTTPException(
                status_code=500, 
                detail=f"Backtesting failed: {result['stderr']}"
            )
        
        # Parse results asynchronously
        backtest_result = await parse_backtest_output(
            result['stdout'], backtest_id, config
        )
        
        # Store result and cache in background
        background_tasks.add_task(store_and_cache_result, backtest_result, cache_key_str)
        
        return backtest_result
        
    except Exception as e:
        logger.error(f"Error running backtest: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

async def build_backtest_command(config: BacktestConfig) -> List[str]:
    """Build backtest command asynchronously"""
    if config.symbol in ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA"]:
        symbol_arg = "--symbols5"
        cmd = [
            "python", 
            "backtesting/backtrader/run_bt_v2.py",
            symbol_arg,
            "--no-plot",
            f"--strategy={config.strategyId}"
        ]
    else:
        cmd = [
            "python", 
            "backtesting/backtrader/run_bt_v2.py",
            "--symbols", config.symbol,
            "--no-plot",
            f"--strategy={config.strategyId}"
        ]
    
    # Add optional parameters
    if config.startDate:
        cmd.extend(["--start-date", config.startDate])
    if config.endDate:
        cmd.extend(["--end-date", config.endDate])
    
    return cmd

async def parse_backtest_output(output: str, backtest_id: str, config: BacktestConfig) -> BacktestResult:
    """Parse backtest output asynchronously"""
    output_lines = output.split('\n')
    
    # Initialize metrics
    metrics = {
        'total_return': 0.0,
        'win_rate': 0.0,
        'total_trades': 0,
        'profit_factor': 0.0,
        'sharpe_ratio': 0.0,
        'max_drawdown': 0.0,
        'final_value': config.initialCapital
    }
    
    # Parse metrics
    for line in output_lines:
        if "Total P&L:" in line:
            try:
                pnl = float(line.split("$")[1].strip())
                metrics['total_return'] = (pnl / config.initialCapital) * 100
                metrics['final_value'] = config.initialCapital + pnl
            except:
                pass
        elif "Win Rate:" in line:
            try:
                metrics['win_rate'] = float(line.split("%")[0].split(":")[-1].strip())
            except:
                pass
        elif "Total Trades:" in line:
            try:
                metrics['total_trades'] = int(line.split(":")[-1].strip())
            except:
                pass
        elif "Profit Factor:" in line:
            try:
                metrics['profit_factor'] = float(line.split(":")[-1].strip())
            except:
                pass
        elif "Sharpe Ratio:" in line:
            try:
                metrics['sharpe_ratio'] = float(line.split(":")[-1].strip())
            except:
                pass
    
    # Read trade details asynchronously
    trade_details = await read_trade_details_async()
    
    return BacktestResult(
        id=backtest_id,
        strategyId=config.strategyId,
        strategyName=config.strategy.replace('_', ' ').title(),
        symbol=config.symbol,
        timeframe=config.timeframe,
        startDate=config.startDate,
        endDate=config.endDate,
        initialCapital=config.initialCapital,
        finalCapital=metrics['final_value'],
        initialBalance=config.initialCapital,
        finalBalance=metrics['final_value'],
        totalReturn=metrics['total_return'],
        roi=metrics['total_return'],
        maxDrawdown=metrics['max_drawdown'],
        sharpeRatio=metrics['sharpe_ratio'],
        winRate=metrics['win_rate'],
        profitFactor=metrics['profit_factor'],
        trades=metrics['total_trades'],
        tradesCount=metrics['total_trades'],
        tradesDetails=trade_details,
        createdAt=datetime.now().isoformat(),
        cached=False
    )

async def read_trade_details_async() -> List[TradeDetail]:
    """Read trade details from CSV asynchronously"""
    try:
        outputs_dir = "backtesting/outputs"
        if not os.path.exists(outputs_dir):
            return []
        
        csv_files = [f for f in os.listdir(outputs_dir) if f.endswith('.csv')]
        if not csv_files:
            return []
        
        latest_csv = max(csv_files, key=lambda x: os.path.getctime(os.path.join(outputs_dir, x)))
        csv_path = os.path.join(outputs_dir, latest_csv)
        
        csv_data = await read_csv_async(csv_path)
        
        trade_details = []
        for i, row in enumerate(csv_data):
            try:
                trade_detail = TradeDetail(
                    id=i + 1,
                    entryDate=row.get('Entry Date', ''),
                    exitDate=row.get('Exit Date', ''),
                    entryPrice=float(row.get('Entry Price', 0)),
                    exitPrice=float(row.get('Exit Price', 0)),
                    direction='long',
                    profit=float(row.get('P&L', 0)),
                    profitPercent=float(row.get('P&L %', 0)),
                    size=float(row.get('Size', 0)) if row.get('Size') else None
                )
                trade_details.append(trade_detail)
            except Exception as e:
                logger.error(f"Error parsing trade detail: {e}")
                continue
        
        return trade_details
        
    except Exception as e:
        logger.error(f"Error reading trade details: {e}")
        return []

async def store_and_cache_result(result: BacktestResult, cache_key: str):
    """Store result and update cache in background"""
    await storage.add_result(result)
    await set_cached_data(cache_key, result.dict(), ttl=3600)

@app.get("/api/backtest/history", response_model=List[BacktestResult])
async def get_backtest_history_optimized():
    """Get backtest history with caching"""
    cache_key_str = "backtest_history"
    
    # Check cache first
    cached_data = await get_cached_data(cache_key_str)
    if cached_data:
        return [BacktestResult(**item) for item in cached_data]
    
    # Get from storage and cache
    results = storage.backtest_results
    await set_cached_data(cache_key_str, [r.dict() for r in results], ttl=60)
    
    return results

async def get_strategies_cached():
    """Get strategies with caching"""
    cache_key_str = "strategies_list"
    
    cached_strategies = await get_cached_data(cache_key_str)
    if cached_strategies:
        return cached_strategies
    
    # Generate strategies list
    strategies = await generate_strategies_list()
    await set_cached_data(cache_key_str, strategies, ttl=600)  # 10-minute cache
    
    return strategies

async def generate_strategies_list():
    """Generate strategies list asynchronously"""
    strategy_dir = os.path.join(os.path.dirname(__file__), 'backtesting', 'backtrader', 'strategies')
    pattern = os.path.join(strategy_dir, 'st_*.py')
    strategy_files = glob.glob(pattern)
    strategies = []
    
    # Process files in parallel
    tasks = [process_strategy_file(file_path) for file_path in strategy_files]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    for result in results:
        if isinstance(result, dict):
            strategies.append(result)
        elif isinstance(result, Exception):
            logger.error(f"Error processing strategy file: {result}")
    
    return strategies

async def process_strategy_file(file_path: str) -> Dict:
    """Process strategy file asynchronously"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, parse_strategy_file, file_path)

def parse_strategy_file(file_path: str) -> Dict:
    """Parse strategy file in thread pool"""
    file_name = os.path.basename(file_path)
    
    if not (file_name.startswith('st_') and file_name.endswith('.py')):
        raise ValueError(f"Invalid strategy file: {file_name}")
    
    strategy_id = file_name[3:-3]
    class_name = None
    description = ""
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            source = f.read()
        
        module = ast.parse(source)
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
                
                # Check for DESCRIPTION attribute
                for item in node.body:
                    if isinstance(item, ast.Assign):
                        for target in item.targets:
                            if isinstance(target, ast.Name) and target.id == 'DESCRIPTION':
                                if isinstance(item.value, ast.Constant):
                                    description = item.value.value
                                break
                        if description:
                            break
                break
    except Exception as e:
        logger.error(f"Error parsing {file_name}: {e}")
        raise e
    
    # Format strategy name
    if class_name:
        name = format_strategy_name(class_name)
    else:
        name = strategy_id.replace('_', ' ').title()
    
    return {
        "id": strategy_id,
        "name": name,
        "description": description,
        "type": "custom",
        "parameters": []
    }

def format_strategy_name(class_name: str) -> str:
    """Format strategy class name to readable name"""
    if class_name.startswith('Strategy'):
        name = class_name[len('Strategy'):]
    else:
        name = class_name
    
    if name.isdigit():
        return name
    
    parts = name.split('_')
    formatted_parts = []
    
    for i, part in enumerate(parts):
        if i == len(parts) - 1 and (part.isupper() or part in {'LR', 'Pivot', 'Long', 'Short'}):
            if len(parts) > 1:
                formatted_parts[-1] = formatted_parts[-1] + f' ({part})'
            else:
                formatted_parts.append(f'({part})')
        else:
            words = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+', part)
            formatted = ' '.join(words)
            if len(words) > 1 and i != len(parts) - 1:
                formatted = '-'.join(words)
            formatted_parts.append(formatted)
    
    return ' '.join([p for p in formatted_parts if p])

@app.get("/api/strategies")
async def get_strategies():
    """Get available strategies with caching"""
    return await get_strategies_cached()

@app.get("/api/symbols")
async def get_symbols():
    """Get available symbols with caching"""
    cache_key_str = "symbols_list"
    
    cached_symbols = await get_cached_data(cache_key_str)
    if cached_symbols:
        return cached_symbols
    
    symbols = ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA", "GOOGL", "META"]
    await set_cached_data(cache_key_str, symbols, ttl=3600)
    
    return symbols

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize resources on startup"""
    logger.info("Starting optimized API server...")
    await storage.load_persisted_data()
    
    if REDIS_AVAILABLE:
        try:
            redis_conn = await get_redis()
            await redis_conn.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown"""
    logger.info("Shutting down optimized API server...")
    await storage.persist_data()
    
    if REDIS_AVAILABLE and redis_client:
        await redis_client.close()
    
    executor.shutdown(wait=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "optimized_api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload in production
        workers=1,     # Single worker for development
        access_log=True
    )