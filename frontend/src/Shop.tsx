import React, { useEffect, useMemo, useState } from "react";
import { ItemsResult } from "./client";
import { useInterval } from "usehooks-ts";
import { useParams } from "react-router-dom";
import { api } from "./api";

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
            await api.searchApiSearchColorGet({ color: color })
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
      <div className="h-full w-full flex-col p-5">
        <div className="flex flex-wrap items-start">
          {results.results.map(({ url, thumbnailUrl }) => (
            <div className="py-0.5 px-0.5 w-1/2 aspect-[2/3]" key={url}>
              <a className="block w-full h-full" href={url}>
                <img
                  src={thumbnailUrl}
                  className="w-full h-full object-cover"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }
);
