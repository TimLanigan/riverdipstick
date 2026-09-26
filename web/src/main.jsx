import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { StarsProvider } from "./stars.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <StarsProvider>
        <App />
      </StarsProvider>
    </BrowserRouter>
  </StrictMode>,
);
