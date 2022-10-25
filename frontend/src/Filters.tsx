import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";
import omitBy from "lodash/omitBy";
import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";

import { Garment, Gender, Size } from "./client";
import { Filters, useStore } from "./store";

interface FiltersProps {
  onSave: (filters: Filters) => void;
}

type FormFields = {
  minPrice: string;
  maxPrice: string;
} & Record<Garment, boolean> &
  Record<Size, boolean> &
  Record<Gender, boolean> &
  Record<SHOE_SIZE, boolean>;

const SHOE_SIZES = [
  "35",
  "35-5",
  "36",
  "36-5",
  "37",
  "37-5",
  "38",
  "38-5",
  "39",
  "39-5",
  "40",
  "40-5",
  "41",
  "41-5",
  "42",
  "42-5",
  "43",
  "43-5",
  "44",
  "44-5",
  "45",
  "45-5",
  "46",
  "47",
  "48",
  "49",
] as const;

type SHOE_SIZE = typeof SHOE_SIZES[number];

export const FiltersSelector: React.FC<FiltersProps> = React.memo(
  function FiltersSelector({ onSave }: FiltersProps) {
    const filters = useStore((s) => s.filters);

    const {
      register,
      handleSubmit,
      formState: { errors },
      setValue,
      getValues,
      watch,
    } = useForm<FormFields>({
      mode: "onChange",
    });

    const [clothes, shoes] = [watch("clothes"), watch("shoes")];

    useEffect(() => {
      setValue("men", filters.gender?.includes(Gender.Men) ?? false);
      setValue("women", filters.gender?.includes(Gender.Women) ?? false);
      setValue("clothes", filters.garment?.includes(Garment.Clothes) ?? false);
      setValue("shoes", filters.garment?.includes(Garment.Shoes) ?? false);
      Object.values(Size).forEach((size) =>
        setValue(size, filters.size?.includes(size) ?? false)
      );
      SHOE_SIZES.forEach((shoeSize) =>
        setValue(
          shoeSize as SHOE_SIZE,
          filters.shoeSizes?.includes(Number(shoeSize.replaceAll(/-/g, "."))) ??
            false
        )
      );
      setValue(
        "minPrice",
        filters.priceMin == null ? "" : String(filters.priceMin)
      );
      setValue(
        "maxPrice",
        filters.priceMax == null ? "" : String(filters.priceMax)
      );
    }, [filters, setValue]);

    const onSubmit = useCallback(
      (data: { minPrice: string; maxPrice: string }) => {
        const filters: Filters = {
          ...(!isNaN(parseInt(data.minPrice))
            ? { priceMin: parseInt(data.minPrice) }
            : {}),
          ...(!isNaN(parseInt(data.maxPrice))
            ? { priceMax: parseInt(data.maxPrice) }
            : {}),
          shoeSizes: SHOE_SIZES.filter((shoeSize) => getValues(shoeSize)).map(
            (shoeSize) => Number(shoeSize.replaceAll(/-/g, "."))
          ),
          size: Object.values(Size).filter((size) => getValues(size)),
          gender: Object.values(Gender).filter((gender) => getValues(gender)),
          garment: Object.values(Garment).filter((garment) =>
            getValues(garment)
          ),
        };
        const fixed = omitBy(filters, (v) => isArray(v) && isEmpty(v));
        onSave(fixed);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [onSave]
    );

    console.log(getValues());

    return (
      <form
        className="bg-white flex-1 flex flex-col p-5 justify-between"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <div className="border-border pb-4 border-b mb-6">
            <div className="font-lg leading-none font-medium mb-4">Style</div>
            <div className="flex justify-between">
              <div className="leading-none mb-2">Men</div>
              <input
                type="checkbox"
                className="accent-primary border-blackborder-2 checked:border-0 rounded w-4 h-4"
                {...register("men")}
              />
            </div>
            <div className="flex justify-between">
              <div className="leading-none mb-2">Women</div>
              <input
                type="checkbox"
                className="accent-primary border-blackborder-2 checked:border-0 rounded w-4 h-4"
                {...register("women")}
              />
            </div>
          </div>
          <div className="border-border pb-4 border-b mb-6">
            <div className="font-lg leading-none font-medium mb-4">Type</div>
            <div className="flex justify-between">
              <div className="leading-none mb-2">Clothes</div>
              <input
                type="checkbox"
                className="accent-primary border-blackborder-2 checked:border-0 rounded w-4 h-4"
                {...register("clothes")}
              />
            </div>
            <div className="flex justify-between">
              <div className="leading-none mb-2">Shoes</div>
              <input
                type="checkbox"
                className="accent-primary border-blackborder-2 checked:border-0 rounded w-4 h-4"
                {...register("shoes")}
              />
            </div>
          </div>
          {clothes || (!shoes && !clothes) ? (
            <div className="border-border pb-4 border-b mb-6">
              <div className="font-lg leading-none font-medium mb-4">Size</div>
              {Object.values(Size).map((size) => (
                <div className="flex justify-between" key={size}>
                  <div className="leading-none mb-2">{size}</div>
                  <input
                    {...register(size)}
                    type="checkbox"
                    className="accent-primary border-blackborder-2 checked:border-0 rounded w-4 h-4"
                  />
                </div>
              ))}
            </div>
          ) : null}
          {shoes || (!shoes && !clothes) ? (
            <div className="border-border pb-4 border-b mb-6">
              <div className="font-lg leading-none font-medium mb-4">
                Shoe Size
              </div>
              {SHOE_SIZES.map((shoeSize) => (
                <div className="flex justify-between" key={shoeSize}>
                  <div className="leading-none mb-2">
                    {shoeSize.replaceAll(/-/g, ".")}
                  </div>
                  <input
                    {...register(shoeSize)}
                    type="checkbox"
                    className="accent-primary border-blackborder-2 checked:border-0 rounded w-4 h-4"
                  />
                </div>
              ))}
            </div>
          ) : null}
          <div className="border-border">
            <div className="font-lg leading-none font-medium mb-4">Price</div>
            <div className="flex justify-between">
              <div>
                <div className="text-muted leading-none text-xs mb-1">
                  Minimum price
                </div>
                <div className="flex pr-10">
                  <input
                    type="text"
                    className="focus-visible:border-primary focus-visible:text-primary invalid:border-warning w-full block focus-visible:outline-none border-b border-black"
                    {...register("minPrice", { pattern: /^[0-9]+$/ })}
                  />
                </div>
              </div>
              <div>
                <div className="text-muted leading-none text-xs mb-1">
                  Maximum price
                </div>
                <div className="flex pr-10">
                  <input
                    type="text"
                    className="focus-visible:border-primary focus-visible:text-primary invalid:border-warning w-full block focus-visible:outline-none border-b border-black"
                    {...register("maxPrice", { pattern: /^[0-9]+$/ })}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex p-2">
          <input
            type="submit"
            value="Save filters"
            disabled={errors.maxPrice != null || errors.minPrice != null}
            className="bg-primary disabled:bg-muted flex-1 flex gap-3.5 p-2 rounded-full text-white font-medium justify-center items-center"
          ></input>
        </div>
      </form>
    );
  }
);
