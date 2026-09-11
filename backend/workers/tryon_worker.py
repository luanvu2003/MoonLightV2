import asyncio
import concurrent.futures
from typing import Dict, Any, Callable

# ThreadPoolExecutor xử lý các tác vụ AI nặng không làm block event loop của FastAPI
_executor = concurrent.futures.ThreadPoolExecutor(max_workers=3)

async def run_in_worker(func: Callable, *args, **kwargs) -> Any:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(_executor, lambda: func(*args, **kwargs))
