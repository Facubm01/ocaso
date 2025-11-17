import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Las URLs de la API que estaban en AuthContext
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4002";
const REGISTER_ENDPOINT = `${API_BASE_URL}/api/auth/register`;
const LOGIN_ENDPOINT = `${API_BASE_URL}/api/auth/login`;
const PROFILE_ENDPOINT = `${API_BASE_URL}/api/auth/me`;

// ---- ACCIONES ASÍNCRONAS (THUNKS) ----
// Aquí va toda la lógica de API.
// Ya no están en los componentes, ni en el context.

/**
 * Thunk para registrar un nuevo usuario.
 * Al completarse (fulfilled), devuelve los datos del usuario y el token.
 */
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ firstName, lastName, email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Error al registrarse.");
      }
      if (!data.access_token) {
        throw new Error("El servidor no devolvió un token.");
      }

      // Lo que retornemos aquí irá al 'action.payload' del extraReducer
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Thunk para iniciar sesión.
 * Al completarse (fulfilled), devuelve los datos del usuario y el token.
 */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Credenciales incorrectas.");
      }
      if (!data.access_token) {
        throw new Error("El servidor no devolvió un token.");
      }

      // Lo que retornemos aquí irá al 'action.payload' del extraReducer
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Thunk para obtener el perfil del usuario usando el token.
 * NOTA: Esta versión es más simple, la llamaremos después del login/register.
 */
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(PROFILE_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo obtener el perfil.");
      }

      // Devuelve solo el perfil
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---- ESTADO INICIAL ----
// Refleja lo que tenías en tu AuthContext, pero sin localStorage.
const initialState = {
  token: null,
  profile: null,
  isAuthenticated: false,
  isAdmin: false,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// ---- EL SLICE ----
const authSlice = createSlice({
  name: "auth",
  initialState,
  // Reducers síncronos. El logout es una acción síncrona.
  reducers: {
    logout: (state) => {
      state.token = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.status = "idle";
      state.error = null;
    },
  },
  // Reducers asíncronos: manejan los estados de las promesas (thunks)
  extraReducers: (builder) => {
    builder
      // Casos para loginUser
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        // action.payload es lo que retornamos del thunk (data)
        state.status = "succeeded";
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        // Podríamos intentar obtener el perfil aquí si la API no lo devuelve
        // state.profile = { email: action.meta.arg.email }; // Perfil temporal
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload; // action.payload es el error de rejectWithValue
      })

      // Casos para registerUser
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        // const { firstName, lastName, email } = action.meta.arg;
        // state.profile = { firstName, lastName, email }; // Perfil temporal
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Casos para fetchUserProfile (lo usaremos para obtener los datos completos)
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = "loading"; // O un 'profile_loading'
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
        state.isAdmin = action.payload.role === "ADMIN";
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        // Si falla el fetch de perfil, probablemente el token es malo. Deslogueamos.
        Object.assign(state, initialState); // Resetea al estado inicial
      });
  },
});

// Exportamos la acción síncrona de logout
export const { logout } = authSlice.actions;

// Exportamos el reducer para el store
export default authSlice.reducer;

// Exportamos selectores para leer el estado fácilmente en los componentes
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectUserProfile = (state) => state.auth.profile;
export const selectIsAdmin = (state) => state.auth.isAdmin;
