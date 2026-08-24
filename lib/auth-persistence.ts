export const AUTH_PERSISTENCE_COOKIE = "smartrain-auth-persistence";
export const AUTH_SESSION_COOKIE = "smartrain-auth-session";

const COOKIE_MAX_AGE = 400 * 24 * 60 * 60;

export function setAuthPersistence(rememberMe: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const preference = rememberMe ? "persistent" : "session";

  document.cookie = `${AUTH_PERSISTENCE_COOKIE}=${preference}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;

  if (rememberMe) {
    document.cookie = `${AUTH_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    return;
  }

  document.cookie = `${AUTH_SESSION_COOKIE}=active; Path=/; SameSite=Lax${secure}`;
}
