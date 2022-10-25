import logging
import os
from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

import structlog
import uvicorn
from fastapi import APIRouter, BackgroundTasks, FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from matchedpotato.matcher import get_matching_vinted_results
from matchedpotato.vinted import SearchRequest, VintedResult

timestamper = structlog.processors.TimeStamper(fmt="%Y-%m-%d %H:%M:%S")
shared_processors: list[structlog.types.Processor] = [
    structlog.stdlib.add_log_level,
    timestamper,
]

structlog.configure(
    processors=shared_processors
    + [
        structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

formatter = structlog.stdlib.ProcessorFormatter(
    foreign_pre_chain=shared_processors,
    processors=[
        structlog.stdlib.ProcessorFormatter.remove_processors_meta,
        structlog.processors.dict_tracebacks,
        structlog.processors.JSONRenderer(),
        # structlog.dev.ConsoleRenderer(),
    ],
)

handler = logging.StreamHandler()
handler.setFormatter(formatter)
root_logger = logging.getLogger()
root_logger.addHandler(handler)
root_logger.setLevel(logging.INFO)


class RequestIdResult(BaseModel):
    request_id: UUID


class ItemsResult(BaseModel):
    done: bool
    results: list[VintedResult]


log = structlog.stdlib.get_logger()
app = FastAPI()
api = APIRouter(prefix="/api")
results: dict[UUID, ItemsResult] = {}
pings: dict[UUID, datetime] = {}


@api.post(
    "/search",
    response_model=RequestIdResult,
)
async def search(
    searchRequest: SearchRequest,
    background_tasks: BackgroundTasks,
) -> RequestIdResult:
    request_id = uuid4()
    results[request_id] = ItemsResult(results=[], done=False)
    pings[request_id] = datetime.now()
    background_tasks.add_task(poll_vinted, request_id, searchRequest)
    return RequestIdResult(request_id=request_id)


@api.get("/get-results/{request_id}", response_model=ItemsResult)
async def get_results(request_id: UUID) -> ItemsResult:
    pings[request_id] = datetime.now()
    result = results[request_id]
    if result.done:
        del results[request_id]
    return result


@app.exception_handler(404)
async def custom_404_handler(_: Any, __: Any) -> FileResponse:
    return FileResponse("../frontend/dist/index.html")


async def poll_vinted(request_id: UUID, searchRequest: SearchRequest) -> None:
    gen = get_matching_vinted_results(searchRequest)
    try:
        async for new_results in gen:
            if (datetime.now() - pings[request_id]).seconds > 6:
                del pings[request_id]
                del results[request_id]
                return
            results[request_id] = ItemsResult(
                results=[result for _score, result in new_results], done=False
            )
        results[request_id] = ItemsResult(
            results=results[request_id].results, done=True
        )
    except Exception:
        log.exception("Exception while polling for vinted results")
    finally:
        gen.aclose()


app.include_router(api)

app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT") or 8080),
        log_config={
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {},
            "handlers": {},
            "loggers": {},
        },
    )
