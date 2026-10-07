import { KaTeXProvider } from "@liqvid/katex";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import symbols from "../public/symbols.tex?raw";

import App from "./App.tsx";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);

root.render(
  <StrictMode>
    <KaTeXProvider macros={symbols}>
      <App />
    </KaTeXProvider>
  </StrictMode>,
);
