import re
from typing import cast

import colour


def get_difference(color1: str, color2: str) -> float:
    c1, c2 = (
        colour.XYZ_to_Lab(colour.sRGB_to_XYZ(_parse_color(color1))),
        colour.XYZ_to_Lab(colour.sRGB_to_XYZ(_parse_color(color2))),
    )

    return cast(float, colour.difference.delta_E(c1, c2))


def _parse_color(color: str) -> tuple[float, float, float]:
    return cast(
        tuple[float, float, float],
        tuple(
            int(hex_str, base=16) / 255 for hex_str in re.findall(r"[^#][^#]", color)
        ),
    )
