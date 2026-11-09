import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTPPasswordReset } from "./passwordReset";

/** Anmeldung mit E-Mail und Passwort (Convex Auth), „Passwort vergessen“ per Code an die E-Mail. Weitere Anbieter (Apple, Google) später hier ergänzen. */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ reset: ResendOTPPasswordReset })],
});
