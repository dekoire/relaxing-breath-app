import { ConvexReactClient } from "convex/react";

/** Convex-Deployment aus .env.local (schreibt `npx convex dev`). Ohne URL läuft die App im Demo-Modus im Browser. */
export const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string | undefined;
export const convex = CONVEX_URL ? new ConvexReactClient(CONVEX_URL) : undefined;
