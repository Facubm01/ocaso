import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const REGISTER_ENDPOINT = `${API_BASE_URL}/api/auth/register`;
const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;

const TOKEN_STORAGE_KEY = "authToken";
const PROFILE_STORAGE_KEY = "authProfile";

const readStoredProfile = () => {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("No se pudo leer el perfil almacenado", error);
    return null;
  }
};

const parseAuthResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data?.message ??
      data?.error ??
      "No se pudo procesar la solicitud. Inténtalo nuevamente.";
    throw new Error(message);
  }
  if (!data?.access_token) {
    throw new Error("La respuesta del servidor no incluye el token de acceso.");
  }
  return data;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [profile, setProfile] = useState(() => readStoredProfile());

  const saveSession = useCallback((accessToken, userProfile) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setToken(accessToken);

    if (userProfile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
      setProfile(userProfile);
    } else {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      setProfile(null);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    setToken(null);
    setProfile(null);
  }, []);

  const register = useCallback(
    async ({ firstName, lastName, email, password }) => {
      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await parseAuthResponse(response);
      saveSession(data.access_token, { firstName, lastName, email });
      return data;
    },
    [saveSession]
  );

  const login = useCallback(
    async (email, password) => {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await parseAuthResponse(response);
      const storedProfile = readStoredProfile();
      saveSession(data.access_token, storedProfile ?? { email });
      return data;
    },
    [saveSession]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      token,
      profile,
      isAuthenticated: Boolean(token),
      register,
      login,
      logout,
    }),
    [token, profile, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de un AuthProvider");
  }
  return context;
};
