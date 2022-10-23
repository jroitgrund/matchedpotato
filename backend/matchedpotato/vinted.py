import asyncio
import json
from datetime import datetime
from typing import cast

from bs4 import BeautifulSoup, Tag
from pydantic import BaseModel

from matchedpotato.colours import get_difference

NUM_PAGES = 10
PAGES_PER_MINUTE = 10

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


async def _get_results(time: int, color_id: int, page_num: int) -> list[VintedResult]:
    url = (
        "https://www.vinted.fr/vetements?catalog[]=2050&catalog[]=4"
        f"&color_id[]={color_id}&page={page_num}&time={time}"
    )
    html = await get_url(url)
    soup = BeautifulSoup(html, "html.parser")
    script_tag = cast(
        Tag, soup.find(attrs={"data-js-react-on-rails-store": "MainStore"})
    )
    if not isinstance(script_tag, Tag):
        raise RuntimeError()

    json_contents = script_tag.string
    if json_contents is None:
        raise RuntimeError()

    data = json.loads(json_contents)
    items: dict[str, dict] = data["items"]["catalogItems"]["byId"]
    results = [
        VintedResult.from_page_item(_VintedPageItem(**item))
        for item in items.values()
        if "photo" in item
    ]
    return results


async def get_url(url: str):
    proc = await asyncio.create_subprocess_exec(
        "curl", url, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )

    stdout, _ = await proc.communicate()

    return stdout


async def get_vinted_results(color: str) -> list[VintedResult]:
    closest_vinted_color_id = min(
        VINTED_COLORS.items(), key=lambda item: get_difference(color, item[1])
    )[0]
    time = int(datetime.now().timestamp())
    results_pages: list[list[VintedResult]] = await asyncio.gather(
        *(
            _get_results(time, closest_vinted_color_id, page_num)
            for page_num in range(1, NUM_PAGES + 1)
        )
    )

    return [result for results_page in results_pages for result in results_page]
