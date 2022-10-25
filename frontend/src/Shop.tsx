import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useBoolean, useInterval } from "usehooks-ts";

import { api } from "./api";
import { ItemsResult } from "./client";
import { FiltersSelector } from "./Filters";
import { Loading } from "./Loading";
import { Filters, useStore } from "./store";

export const Shop: React.FC<Record<string, never>> = React.memo(
  function Shop() {
    const { color: _color } = useParams();
    const color = useMemo(() => `#${_color}`, [_color]);
    const [results, setResults] = useState<ItemsResult>({
      done: false,
      results: [],
    });
    const [requestId, setRequestId] = useState<string | undefined>();

    const filters = useStore((s) => s.filters);
    const setFilters = useStore((s) => s.setFilters);

    useEffect(() => {
      (async () => {
        setRequestId(
          await (
            await api.searchApiSearchPost({
              searchRequest: {
                ...filters,
                color: color,
              },
            })
          ).requestId
        );
      })();
    }, [color, setRequestId, filters]);

    useInterval(
      async () => {
        if (requestId != null) {
          setResults(
            await api.getResultsApiGetResultsRequestIdGet({ requestId })
          );
        }
      },
      requestId == null || results.done ? null : 2000
    );

    const {
      value: filtersOpen,
      setTrue: openFilters,
      setFalse: closeFilters,
    } = useBoolean();

    const onSaveFilters = useCallback(
      (filters: Filters) => {
        setRequestId(undefined);
        setResults({ done: false, results: [] });
        setFilters(filters);
        closeFilters();
      },
      [setRequestId, setResults, setFilters, closeFilters]
    );

    return filtersOpen ? (
      <FiltersSelector onSave={onSaveFilters} />
    ) : (
      <div className="flex-1 flex flex-col px-1.5">
        <div className="flex justify-end mb-5">
          <button
            onClick={openFilters}
            className="border border-black font-medium p-4 rounded-xl leading-none flex gap-2"
          >
            <AdjustmentsHorizontalIcon className="block h-[16px]" />
            <div>Filters</div>
          </button>
        </div>
        {results.results.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Loading />
          </div>
        ) : null}
        <div className="flex flex-wrap items-start">
          {results.results.map(({ url, thumbnailUrl, price, size }) => (
            <div className="w-1/2 p-0.5 flex flex-col" key={url}>
              <div className="flex">
                <div className="flex-1 aspect-[2/3]">
                  <a className="block w-full h-full" href={url}>
                    <img
                      src={thumbnailUrl}
                      className="w-full h-full object-cover"
                    />
                  </a>
                </div>
              </div>
              <div className="leading-3.5 text-sm mt-2">{price}</div>
              <div className="leading-3.5 text-muted text-xs mt-1 mb-1.5">
                {size}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
