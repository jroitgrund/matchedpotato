import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useInterval } from "usehooks-ts";

import { api } from "./api";
import { ItemsResult } from "./client";

export const Shop: React.FC<Record<string, never>> = React.memo(
  function Shop() {
    const { color: _color } = useParams();
    const color = useMemo(() => `#${_color}`, [_color]);
    const [results, setResults] = useState<ItemsResult>({
      done: false,
      results: [],
    });
    const [requestId, setRequestId] = useState<string | undefined>();

    useEffect(() => {
      (async () => {
        setRequestId(
          await (
            await api.searchApiSearchPost({ searchRequest: { color: color } })
          ).requestId
        );
      })();
    }, [color, setRequestId]);

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

    return (
      <div className="flex-1 flex flex-col px-1.5">
        <div className="flex flex-wrap items-start">
          {results.results.map(({ url, thumbnailUrl }) => (
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
              <div className="leading-3.5 text-sm mt-2">20,00€</div>
              <div className="leading-3.5 text-muted text-xs mt-1 mb-1.5">
                Small
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
