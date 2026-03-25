import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "dramaquickcut_token";
const EVENT_NAME = "dramaquickcut-auth-changed";

function readToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY);
}

function writeToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => readToken());

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === STORAGE_KEY) {
        setToken(readToken());
      }
    };

    const handleCustom = () => {
      setToken(readToken());
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(EVENT_NAME, handleCustom as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(EVENT_NAME, handleCustom as EventListener);
    };
  }, []);

  const login = useCallback((nextToken: string) => {
    writeToken(nextToken);
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    writeToken(null);
    setToken(null);
  }, []);

  useEffect(() => {
    writeToken(token);
  }, [token]);

  const state = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [login, logout, token],
  );

  return state;
}
