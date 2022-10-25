import asyncio
import itertools
import json
from datetime import datetime
from typing import AsyncGenerator, Iterable, cast

import cloudscraper
import structlog
from bs4 import BeautifulSoup, Tag
from pydantic import BaseModel

from matchedpotato.colours import get_difference

scraper = cloudscraper.create_scraper()
sem = asyncio.Semaphore(1)

log = structlog.stdlib.get_logger()

VINTED_COLORS = {
    1: "#000000",
    3: "#919191",
    12: "#FFFFFF",
    20: "#F8F8E1",
    4: "#f4e0c8",
    21: "#FFCC98",
    11: "#FFA500",
    22: "#FE7F5D",
    7: "#CC3300",
    23: "#AE2E3D",
    5: "#ff0080",
    24: "#FFCCCA",
    6: "#800080",
    25: "#D297D2",
    26: "#89CFF0",
    9: "#007bc4",
    27: "#35358D",
    17: "#B7DEE8",
    30: "#A2FFBC",
    10: "#369a3d",
    28: "#356639",
    16: "#86814A",
    2: "#663300",
    29: "#E5B539",
    8: "#fff200",
    13: "#dddddd",
    14: "#be9927",
}


class _VintedPageItemPhoto(BaseModel):
    url: str
    dominant_color: str
    dominant_color_opaque: str


class _VintedPageItem(BaseModel):
    url: str
    photo: _VintedPageItemPhoto


class VintedResult(BaseModel):
    url: str
    thumbnail_url: str
    dominant_color: str
    dominant_color_opaque: str

    @classmethod
    def from_page_item(cls, item: _VintedPageItem) -> "VintedResult":
        return cls(
            url=item.url,
            thumbnail_url=item.photo.url,
            dominant_color=item.photo.dominant_color,
            dominant_color_opaque=item.photo.dominant_color_opaque,
        )


def _get_page_items(html: str) -> list[VintedResult]:
    soup = BeautifulSoup(html, "html.parser")
    script_tag = cast(
        Tag, soup.find(attrs={"data-js-react-on-rails-store": "MainStore"})
    )
    if not isinstance(script_tag, Tag):
        log.error("Bad HTML", html=html)
        raise RuntimeError()

    json_contents = script_tag.string
    if json_contents is None:
        raise RuntimeError()

    data = json.loads(json_contents)
    items: dict[str, dict] = data["items"]["catalogItems"]["byId"]
    results = [
        VintedResult.from_page_item(_VintedPageItem(**item))
        for item in items.values()
        if "photo" in item and item["photo"] is not None
    ]
    return results


async def get_url(url: str) -> str:
    async with sem:
        while True:
            response = await asyncio.to_thread(lambda: scraper.get(url))
            if response.text == "Request rate limit exceeded":
                retry_after = int(response.headers["retry-after"])
                await asyncio.sleep(retry_after)
            else:
                return response.text


async def get_urls(urls: Iterable[str], queue: asyncio.Queue[str]) -> None:
    try:
        for url in urls:
            await queue.put(await get_url(url))
    except asyncio.CancelledError:
        return


async def get_vinted_results(
    color: str,
) -> AsyncGenerator[list[VintedResult], None]:
    closest_vinted_color_id = min(
        VINTED_COLORS.items(), key=lambda item: get_difference(color, item[1])
    )[0]
    time = int(datetime.now().timestamp())
    queue: asyncio.Queue[str] = asyncio.Queue()
    get_urls_task = asyncio.create_task(
        get_urls(
            (
                "https://www.vinted.fr/vetements?catalog[]=2050&catalog[]=4"
                f"&color_id[]={closest_vinted_color_id}&page={page_num}&time={time}"
                for page_num in itertools.count(1)
            ),
            queue,
        )
    )
    try:
        while True:
            get_queue = asyncio.create_task(queue.get())
            tasks: list[asyncio.Task] = [get_queue, get_urls_task]
            done, _pending = await asyncio.wait(
                tasks, return_when=asyncio.FIRST_COMPLETED
            )
            if get_queue in done:
                yield _get_page_items(await queue.get())
            if get_urls_task in done:
                exception = get_urls_task.exception()
                if exception is not None:
                    raise exception
                raise RuntimeError("Early return from get_urls")
    finally:
        get_urls_task.cancel()
