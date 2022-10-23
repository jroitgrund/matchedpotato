import { DATA } from "./data";
import uniqBy from "lodash/uniqBy";

function App() {
  return (
    <div className="flex flex-wrap items-start">
      {uniqBy(DATA, ({ url }) => url).map(({ url, thumbnail_url }) => (
        <div className="py-3 px-0.5 flex">
          <a href={url}>
            <img src={thumbnail_url} className="w-[20vw] h-[auto]" />
          </a>
        </div>
      ))}
    </div>
  );
}

export default App;
