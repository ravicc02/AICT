import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { App } from "./App";
export function render(url: string) {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "");
  return renderToString(
    <StaticRouter basename={basename || "/"} location={basename + url}>
      <App />
    </StaticRouter>,
  );
}
