from typing import AsyncGenerator

from matchedpotato.colours import get_difference
from matchedpotato.vinted import VintedResult, get_vinted_results


async def get_matching_vinted_results(
    color: str,
) -> AsyncGenerator[list[tuple[float, VintedResult]], None]:
    results: list[tuple[float, VintedResult]] = []
    seen_urls: set[str] = set()
    results_generator = get_vinted_results(color)
    try:
        async for new_results in results_generator:
            unseen = [result for result in new_results if result.url not in seen_urls]
            seen_urls.update(result.url for result in unseen)
            scored = [(_score(color, result), result) for result in unseen]
            results = sorted(
                results + [(score, result) for score, result in scored if score < 10],
                key=lambda pair: pair[0],
            )
            yield results
            if len(results) >= 100:
                return
    finally:
        results_generator.aclose()


def _score(color: str, result: VintedResult) -> float:
    return min(
        get_difference(color, result.dominant_color),
        get_difference(color, result.dominant_color_opaque),
    )
