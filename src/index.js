import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "/styles/styles.css";
import "/styles/center.css";

import App from "/src/App";

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
