import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RenderApp } from "./App";
import { ProvideAuth } from "./context/AuthContext";
import "./index.css";

const ROOT_ELEMENT_ID = "root";

const rootElement = document.getElementById(ROOT_ELEMENT_ID);

if (!rootElement) {
  throw new Error("Application root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <ProvideAuth>
      <RenderApp />
    </ProvideAuth>
  </StrictMode>,
);
