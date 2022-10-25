import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import colorNamer from "color-namer";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { useStore } from "./store";
import { useNavigate, Navigate } from "react-router-dom";
import { checkNotNull } from "./utils";

export const PixelChooser: React.FC<Record<string, never>> = React.memo(
  function PixelChooser() {
    const imageDataUrl = useStore((s) => s.imageData);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [color, setColor] = useState<string>("#000000");

    const navigate = useNavigate();

    const chooseColor = useCallback(() => {
      if (imageDataUrl != null) {
        URL.revokeObjectURL(imageDataUrl);
      }
      navigate(`/shop/${color.substring(1)}`);
    }, [color, imageDataUrl]);

    const setColorFromData = useCallback(
      (data: Uint8ClampedArray) => {
        setColor(
          `#${`0${data[0].toString(16)}`.slice(-2)}${`0${data[1].toString(
            16
          )}`.slice(-2)}${`0${data[2].toString(16)}`.slice(-2)}`
        );
      },
      [setColor]
    );

    useEffect(() => {
      if (canvasRef.current != null && imageDataUrl != null) {
        const ctx = checkNotNull(canvasRef.current.getContext("2d"));
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          const data = ctx.getImageData(
            Math.round(checkNotNull(canvasRef.current).clientWidth / 2),
            Math.round(checkNotNull(canvasRef.current).clientHeight / 2),
            1,
            1
          ).data;
          setColorFromData(data);
        };
        img.src = imageDataUrl;
      }
    }, [canvasRef, imageDataUrl]);

    const onClickCanvas = useCallback(
      (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = (e.target as any).getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        const data = checkNotNull(
          canvasRef.current?.getContext("2d")
        ).getImageData(x, y, 1, 1).data;
        setColorFromData(data);
      },
      []
    );

    return imageDataUrl == null ? (
      <Navigate to="/" replace={true} />
    ) : (
      <div className="h-full w-full flex">
        <div className="flex flex-col flex-1 gap-5">
          <div className="flex-1 flex items-center justify-center">
            <canvas onClick={onClickCanvas} ref={canvasRef} />
          </div>
          <div
            style={{
              backgroundColor: color,
              color: getForegroundColor(color),
            }}
            className="p-5 flex flex-col gap-3"
          >
            <button
              className="flex bg-primary p-6 rounded-full text-white justify-center items-center gap-2"
              onClick={chooseColor}
            >
              <div>Shop for this color</div>
              <ShoppingBagIcon className="block h-6" />
            </button>
            <div className="flex justify-center">{color}</div>
            <div className="flex justify-center">
              {colorNamer(color).pantone[0].name}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

function getForegroundColor(bg: string) {
  const [red, green, blue] = [...bg.matchAll(/[a-fA-F0-9]{2}/g)].map((match) =>
    parseInt(match[0], 16)
  );
  if (red * 0.299 + green * 0.587 + blue * 0.114 > 150) {
    return "#000000";
  } else {
    return "#ffffff";
  }
}
