import asyncio

from pydantic import BaseModel

from matchedpotato.colours import get_difference
from matchedpotato.vinted import VintedResult, get_vinted_results


async def get_matching_vinted_results(color: str):
    scored = (
        (_score(color, result), result) for result in await get_vinted_results(color)
    )
    return sorted(scored, key=lambda pair: pair[0])


def _score(color: str, result: VintedResult):
    return min(
        get_difference(color, result.dominant_color),
        get_difference(color, result.dominant_color_opaque),
    )


class UserList(BaseModel):
    users: list[VintedResult]


if __name__ == "__main__":
    open("out.txt", "w").write(
        UserList(
            users=[
                result
                for score, result in asyncio.run(get_matching_vinted_results("#a397d9"))
            ]
        ).json()
    )
