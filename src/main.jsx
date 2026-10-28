import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";
import "./styles/careers-sliders.css";
import "./styles/brand.css";
import "./styles/review-content.css";
import "./styles/review-letter-footer.css";
import "./styles/review-sliders.css";
import "./styles/ai-adoption.css";
import "./styles/review-layout-oct20.css";
import "./styles/builder-detail.css";
import "./styles/review-home-oct21.css";
import "./styles/careers-page.css";
import "./styles/story-flow.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
