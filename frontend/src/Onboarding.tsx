import { CameraIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import React, { ChangeEvent, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useStore } from "./store";

export const Onboarding: React.FC<Record<string, never>> = React.memo(
  function Onboarding() {
    const navigate = useNavigate();

    const setImageData = useStore((s) => s.setImageData);

    const usePicture = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files != null && e.target.files.length > 0) {
          setImageData(URL.createObjectURL(e.target.files[0]));
          navigate("/colorpicker");
        }
      },
      [setImageData, navigate]
    );

    return (
      <div className="flex-1 flex px-3.5">
        <div className="flex flex-col flex-1 justify-between">
          <div className="flex flex-col">
            <div className="uppercase font-bold text-2xl leading-none mb-9">
              Matched Potato
            </div>
            <div className="text-lg leading-none mb-11 font-medium">
              Find the perfect{" "}
              <span className="custom-gradient text-transparent bg-clip-text bg-gradient-to-r">
                color
              </span>{" "}
              for your next outfit
            </div>
            <div className="grid grid-flow-col grid-cols-[auto_1fr] grid-rows-3 gap-x-7 gap-y-3">
              <div className=" justify-center items-center justify-items-center">
                <div className="text-primary border-primary flex items-center justify-center leading-tight border rounded-full h-6 aspect-square">
                  1
                </div>
              </div>
              <div className="">
                <div className="text-primary border-primary flex items-center justify-center leading-tight border rounded-full h-6 aspect-square">
                  2
                </div>
              </div>
              <div className="">
                <div className="text-primary border-primary flex items-center justify-center leading-tight border rounded-full h-6 aspect-square">
                  3
                </div>
              </div>
              <div className="">
                <div className="leading-tight">Take or upload a picture</div>
              </div>
              <div className="">
                <div className="leading-tight">
                  Select the color you&apos;re looking for
                </div>
              </div>
              <div className="">
                <div className="leading-tight">
                  Browse vinted.com results and find the perfect match
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 mb-6">
            <label
              htmlFor="take-picture"
              className="bg-primary flex gap-3.5 p-2 rounded-full text-white font-medium justify-center items-center"
            >
              <input
                type="file"
                id="take-picture"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={usePicture}
              />
              <div>Shoot your color</div>
              <CameraIcon className="block h-6" />
            </label>
            <label
              htmlFor="import-picture"
              className="bg-primary flex gap-3.5 p-2 rounded-full text-white font-medium justify-center items-center"
            >
              <input
                type="file"
                id="import-picture"
                className="hidden"
                accept="image/*"
                onChange={usePicture}
              />
              <div>Import picture</div> <PaperClipIcon className="block h-6" />
            </label>
          </div>
        </div>
      </div>
    );
  }
);
