import { ChangeEvent, useCallback, useRef, useState } from "react";
import { useInterval } from "usehooks-ts";
import { Configuration, DefaultApi, ItemsResult, VintedResult } from "./client";

const api = new DefaultApi(new Configuration({ basePath: "" }));

function App() {
  const [color, setColor] = useState("");
  const [itemsResult, setItemsResult] = useState<ItemsResult>({
    results: [],
    done: false,
  });
  const requestId = useRef<string | undefined>();

  useInterval(
    async () => {
      if (requestId.current != null) {
        setItemsResult(
          await api.getResultsApiGetResultsRequestIdGet({
            requestId: requestId.current,
          })
        );
      }
    },
    itemsResult.done ? null : 2000
  );

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setColor(e.target.value),
    [setColor]
  );

  const fetchItems = useCallback(async () => {
    requestId.current = (
      await api.searchApiSearchColorGet({ color })
    ).requestId;
    setItemsResult({
      results: [],
      done: false,
    });
  }, [requestId, color]);

  return (
    <>
      <div className="flex gap-2">
        <input type="text" onChange={onChange} placeholder="color" />
        <button onClick={fetchItems}>Go!</button>
      </div>
      <div className="flex flex-wrap items-start">
        {itemsResult.results.map(({ url, thumbnailUrl }) => (
          <div className="py-0.5 px-0.5 w-1/5 aspect-[2/3]" key={url}>
            <a className="block w-full h-full" href={url}>
              <img src={thumbnailUrl} className="w-full h-full object-cover" />
            </a>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
