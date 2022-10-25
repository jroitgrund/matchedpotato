import { CameraIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import React, { ChangeEvent, useCallback } from "react";
import { Logo } from "./Logo";
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
      <div className="h-full w-full flex p-5">
        <div className="flex flex-col flex-1 justify-between">
          <div className="flex flex-col">
            <div className="flex justify-around">
              <Logo />
            </div>
            <div className="uppercase font-bold text-4xl mt-10">
              Matched Potato
            </div>
            <div className="mt-4 font-medium">
              Find the perfect{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r custom-gradient">
                color
              </span>{" "}
              for your next outfit
            </div>
            <div className="mt-8 flex flex-col gap-4">
              <div className="flex gap-4 items-start">
                <div className="flex text-primary border border-primary rounded-full justify-center items-center h-6 aspect-square">
                  1
                </div>
                <div>Take or upload a picture</div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex text-primary border border-primary rounded-full justify-center items-center h-6 aspect-square">
                  2
                </div>
                <div>Select the color you&apos;re looking for</div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="flex text-primary border border-primary rounded-full justify-center items-center h-6 aspect-square">
                  3
                </div>
                <div>Browse vinted.com results and find the perfect match</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <label
              htmlFor="take-picture"
              className="flex gap-2 bg-primary p-6 rounded-full text-white justify-center items-center"
            >
              <input
                type="file"
                id="take-picture"
                className="hidden"
                accept="image/*"
                onChange={usePicture}
              />
              <div>Shoot your color</div>
              <CameraIcon className="block h-6" />
            </label>
            <label
              htmlFor="import-picture"
              className="flex gap-2 bg-primary p-6 rounded-full text-white justify-center items-center"
            >
              <input
                type="file"
                id="import-picture"
                className="hidden"
                accept="image/*"
                capture="environment"
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
