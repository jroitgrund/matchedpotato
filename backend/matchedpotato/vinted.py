import asyncio
import itertools
import json
import re
from datetime import datetime
from enum import Enum
from typing import AsyncGenerator, Iterable, Optional, cast

import cloudscraper
import structlog
from bs4 import BeautifulSoup, Tag
from pydantic import BaseModel, ConstrainedStr, ValidationError

from matchedpotato.colours import get_difference

scraper = cloudscraper.create_scraper()
sem = asyncio.Semaphore(1)

log = structlog.stdlib.get_logger()


class Garment(str, Enum):
    CLOTHES = "clothes"
    SHOES = "shoes"


class Gender(str, Enum):
    WOMEN = "women"
    MEN = "men"


class Size(str, Enum):
    XXXS = "XXXS"
    XXS = "XXS"
    XS = "XS"
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"
    XXL = "XXL"
    XXXL = "XXXL"
    FOURXL = "FOURXL"
    FIVEXL = "FIVEXL"
    SIXXL = "SIXXL"
    SEVENXL = "SEVENXL"
    EIGHTXL = "EIGHTXL"
    NINEXL = "NINEXL"


VINTED_GENDERS_CLOTHES = {Gender.MEN: [2050], Gender.WOMEN: [4]}
VINTED_GENDERS_SHOES = {Gender.MEN: [1231], Gender.WOMEN: [16]}
VINTED_SIZES: dict[Size, list[int]] = {
    Size.XXXS: [1226],
    Size.XXS: [102],
    Size.XS: [2, 206],
    Size.S: [3, 207],
    Size.M: [4, 208],
    Size.L: [5, 209],
    Size.XL: [6, 210],
    Size.XXL: [7, 211],
    Size.XXXL: [310, 212],
    Size.FOURXL: [311, 308],
    Size.FIVEXL: [312, 309],
    Size.SIXXL: [1227, 1192],
    Size.SEVENXL: [1228, 1193],
    Size.EIGHTXL: [1229, 1194],
    Size.NINEXL: [1230],
}
VINTED_SHOE_SIZES: dict[float, list[int]] = {
    35: [55],
    35.5: [1195],
    36: [56],
    36.5: [1196],
    37: [57],
    37.5: [1197],
    38: [58, 776],
    38.5: [1198],
    39: [59, 778],
    39.5: [1199],
    40: [60, 780],
    40.5: [1200],
    41: [61, 782],
    41.5: [1201],
    42: [62, 784],
    42.5: [785],
    43: [63, 786],
    43.5: [787],
    44: [788],
    44.5: [789],
    45: [790],
    45.5: [791],
    46: [792],
    47: [792],
    48: [1190],
    49: [1191],
}


class Color(ConstrainedStr):
    regex = re.compile(r"^\#[a-fA-F0-9]{6}$")


class SearchRequest(BaseModel):
    color: ConstrainedStr
    garment: list[Garment] = list(Garment)
    gender: list[Gender] = list(Gender)
    size: list[Size] = list(Size)
    shoeSizes: list[float] = list(VINTED_SHOE_SIZES.keys())
    priceMin: Optional[int]
    priceMax: Optional[int]


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
    price: str
    currency: str
    size_title: str

    @classmethod
    def safe_init(cls, **kwargs: dict) -> Optional["_VintedPageItem"]:
        try:
            return _VintedPageItem(**kwargs)
        except ValidationError:
            return None


class VintedResult(BaseModel):
    url: str
    thumbnail_url: str
    dominant_color: str
    dominant_color_opaque: str
    price: str
    size: str

    @classmethod
    def from_page_item(cls, item: _VintedPageItem) -> "VintedResult":
        return cls(
            url=item.url,
            thumbnail_url=item.photo.url,
            dominant_color=item.photo.dominant_color,
            dominant_color_opaque=item.photo.dominant_color_opaque,
            price=f"{item.price} {item.currency}",
            size=item.size_title,
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
        VintedResult.from_page_item(item)
        for item in (_VintedPageItem.safe_init(**item) for item in items.values())
        if item is not None
    ]
    return results


async def get_results_page(params: dict[str, str | int | list[str] | list[int]]) -> str:
    async with sem:
        while True:
            response = await asyncio.to_thread(
                lambda: scraper.get("https://www.vinted.fr/vetements", params=params)
            )
            if response.text == "Request rate limit exceeded":
                retry_after = int(response.headers["retry-after"])
                await asyncio.sleep(retry_after)
            else:
                return response.text


async def get_results(
    params_iter: Iterable[dict[str, str | int | list[str] | list[int]]],
    queue: asyncio.Queue[str],
) -> None:
    try:
        for params in params_iter:
            await queue.put(await get_results_page(params))
    except asyncio.CancelledError:
        return


async def get_vinted_results(
    searchRequest: SearchRequest,
) -> AsyncGenerator[list[VintedResult], None]:
    closest_vinted_color_id = min(
        VINTED_COLORS.items(),
        key=lambda item: get_difference(searchRequest.color, item[1]),
    )[0]
    time = int(datetime.now().timestamp())
    queue: asyncio.Queue[str] = asyncio.Queue()
    get_urls_task = asyncio.create_task(
        get_results(
            (
                vinted_params(searchRequest, closest_vinted_color_id, page_num, time)
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


def vinted_params(
    searchRequest: SearchRequest, closest_vinted_color_id: int, page_num: int, time: int
) -> dict[str, str | int | list[str] | list[int]]:
    return {
        "catalog[]": (
            [
                vinted_gender
                for gender in searchRequest.gender
                for vinted_gender in VINTED_GENDERS_CLOTHES[gender]
            ]
            if Garment.CLOTHES in searchRequest.garment
            else []
        )
        + (
            [
                vinted_gender
                for gender in searchRequest.gender
                for vinted_gender in VINTED_GENDERS_SHOES[gender]
            ]
            if Garment.SHOES in searchRequest.garment
            else []
        ),
        "size_id[]": [
            vinted_size
            for size in searchRequest.size
            for vinted_size in VINTED_SIZES[size]
        ]
        + [90, 97]
        + [
            vinted_size
            for size in searchRequest.shoeSizes or []
            for vinted_size in VINTED_SHOE_SIZES[size]
        ]
        + [94, 99],
        "price_from": searchRequest.priceMin or 0,
        "price_to": searchRequest.priceMax or 2147483647,
        "color_id[]": [closest_vinted_color_id],
        "page": page_num,
        "time": time,
        "currency": "EUR",
    }
