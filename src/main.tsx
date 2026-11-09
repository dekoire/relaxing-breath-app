import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { App } from "./App";
import { convex } from "./lib/convex";
import "./styles/app.css";
import "./styles/brand.css";

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

createRoot(document.getElementById("root")!).render(convex ? <ConvexAuthProvider client={convex}>{app}</ConvexAuthProvider> : app);
