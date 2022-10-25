import { ShoppingBagIcon } from "@heroicons/react/24/solid";
import { useGesture } from "@use-gesture/react";
import colorNamer from "color-namer";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useElementSize } from "usehooks-ts";

import { useStore } from "./store";
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
    }, [color, imageDataUrl, navigate]);

    const [scale, setScale] = useState(1);

    const [{ xOffset, yOffset }, setOffset] = useState({
      xOffset: 0,
      yOffset: 0,
    });

    const img = useRef(new Image());
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      if (imageDataUrl != null) {
        img.current.src = imageDataUrl;
        img.current.onload = () => setLoaded(true);
      }
    });

    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas != null && loaded) {
        const ctx = checkNotNull(canvas.getContext("2d"));
        ctx.fillStyle = "black";
        const hRatio = canvas.width / img.current.width;
        const vRatio = canvas.height / img.current.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.current.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.current.height * ratio) / 2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
          img.current,
          xOffset,
          yOffset,
          img.current.width / scale,
          img.current.height / scale,
          centerShift_x,
          centerShift_y,
          img.current.width * ratio,
          img.current.height * ratio
        );
        const data = ctx.getImageData(
          Math.round(canvas.width / 2),
          Math.round(canvas.height / 2),
          1,
          1
        ).data;
        const color = dataToColor(data);
        setColor(color);
        ctx.strokeStyle = getForegroundColor(color);
        ctx.arc(canvas.width / 2, canvas.height / 2, 10, 0, Math.PI * 2);
        ctx.stroke();
      }
    }, [canvasRef, imageDataUrl, setColor, scale, xOffset, yOffset, loaded]);

    const [canvasDifRef, { width, height }] = useElementSize();

    const bind = useGesture(
      {
        onDrag: ({ offset: [xOffset, yOffset] }) => {
          setOffset({ xOffset, yOffset });
        },
        onPinch: ({ offset: [scale] }) => {
          setScale(scale);
        },
      },
      {
        drag: {
          bounds: {
            top: -img.current.height / scale / 2,
            left: -img.current.width / scale / 2,
            bottom: img.current.height - img.current.height / scale / 2,
            right: img.current.width - img.current.width / scale / 2,
          },
        },
      }
    );

    return imageDataUrl == null ? (
      <Navigate to="/" replace={true} />
    ) : (
      <div className="flex-1 flex">
        <div className="flex flex-col flex-1">
          <div className="flex-1 flex justify-center">
            <div className="flex-1" ref={canvasDifRef}>
              <canvas
                className="flex-1 touch-none"
                ref={canvasRef}
                height={height}
                width={width}
                {...bind()}
              />
            </div>
          </div>
          <div
            style={{
              backgroundColor: color,
              color: getForegroundColor(color),
            }}
            className="py-6 px-2 flex flex-col gap-4"
          >
            <button
              className="bg-primary flex py-2 rounded-full text-white justify-center items-center gap-3.5 font-medium"
              onClick={chooseColor}
            >
              <div>Shop for this color</div>
              <ShoppingBagIcon className="block h-6" />
            </button>
            <div className="flex justify-center uppercase leading-none text-sm font-medium">
              {colorNamer(color).pantone[0].name}
            </div>
            <div className="flex justify-center leading-none">{color}</div>
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

function dataToColor(data: Uint8ClampedArray) {
  return `#${`0${data[0].toString(16)}`.slice(-2)}${`0${data[1].toString(
    16
  )}`.slice(-2)}${`0${data[2].toString(16)}`.slice(-2)}`;
}
