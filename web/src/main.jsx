import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { LevelsProvider } from "./levels.jsx";
import { StarsProvider } from "./stars.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <StarsProvider>
        <LevelsProvider>
          <App />
        </LevelsProvider>
      </StarsProvider>
    </BrowserRouter>
  </StrictMode>,
);
