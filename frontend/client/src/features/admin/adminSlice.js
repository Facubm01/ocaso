import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// --- Configuración de API ---
const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4002"
).replace(/\/$/, "");

// Helper para manejar errores de fetch
const handleFetchError = async (response) => {
  const text = await response.text().catch(() => "");
  throw new Error(text || `Error HTTP ${response.status}`);
};

/**
 * Helper genérico para peticiones fetch autenticadas (como tu 'fetchAuth')
 * Usa getState() para tomar el token del slice 'auth'
 */
const fetchAuth = async (token, path, init = {}) => {
  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  // --- CORRECCIÓN CLAVE ---
  // A la línea original le faltaba el 'throw'
  if (!res.ok) throw await handleFetchError(res);
  // --- FIN CORRECCIÓN ---

  // Devolvemos el JSON si todo OK, o nada si no hay contenido (ej. DELETE)
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return res.json();
  }
  return;
};

// --- THUNKS ASÍNCRONOS ---
// (Todos los thunks: uploadImage, createCategory, deleteCategory,
// createProduct, updateProduct, deleteProduct... son correctos y no cambian)

export const uploadImage = createAsyncThunk(
  "admin/uploadImage",
  async (file, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) return rejectWithValue("No autenticado");

      // Validaciones que tenías en tu componente
      if (!file || !file.type.startsWith("image/"))
        throw new Error("Seleccioná un archivo de imagen.");
      if (file.size > 5 * 1024 * 1024)
        throw new Error("Máximo 5MB por imagen.");

      const fd = new FormData();
      fd.append("file", file);
      const headers = new Headers();
      headers.set("Authorization", `Bearer ${token}`);

      const res = await fetch(`${API_BASE}/api/images`, {
        method: "POST",
        headers,
        body: fd,
      });
      if (!res.ok) await handleFetchError(res);
      const data = await res.json();
      if (!data?.id) throw new Error("Respuesta inválida al subir imagen.");
      return data; // Devuelve { id, ... }
    } catch (err) {
      return rejectWithValue(err.message || "Error al subir imagen.");
    }
  }
);

/**
 * Thunk para crear una categoría
 * payload: "Nombre de categoría"
 */
export const createCategory = createAsyncThunk(
  "admin/createCategory",
  async (name, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await fetchAuth(token, "/api/categorias", {
        method: "POST",
        body: JSON.stringify({ nombre: name }),
      });
    } catch (err) {
      return rejectWithValue(err.message || "No se pudo crear la categoría.");
    }
  }
);

/**
 * Thunk para borrar una categoría
 * payload: categoryId
 */
export const deleteCategory = createAsyncThunk(
  "admin/deleteCategory",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await fetchAuth(token, `/api/categorias/${id}`, { method: "DELETE" });
      return id; // Devuelve el ID de la categoría borrada
    } catch (err) {
      return rejectWithValue(err.message || "No se pudo borrar la categoría.");
    }
  }
);

/**
 * Thunk para crear un producto
 * payload: { ...datos del producto } (el 'payload' de tu buildPayload)
 */
export const createProduct = createAsyncThunk(
  "admin/createProduct",
  async (productData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await fetchAuth(token, "/api/productos", {
        method: "POST",
        body: JSON.stringify(productData),
      });
    } catch (err) {
      return rejectWithValue(err.message || "No se pudo crear el producto.");
    }
  }
);

/**
 * Thunk para actualizar un producto
 * payload: { id, productData }
 */
export const updateProduct = createAsyncThunk(
  "admin/updateProduct",
  async ({ id, productData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      return await fetchAuth(token, `/api/productos/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      });
    } catch (err) {
      return rejectWithValue(
        err.message || "No se pudo actualizar el producto."
      );
    }
  }
);

/**
 * Thunk para borrar un producto
 * payload: productId
 */
export const deleteProduct = createAsyncThunk(
  "admin/deleteProduct",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await fetchAuth(token, `/api/productos/${id}`, { method: "DELETE" });
      return id; // Devuelve el ID del producto borrado
    } catch (err) {
      return rejectWithValue(err.message || "No se pudo borrar el producto.");
    }
  }
);

// --- ESTADO INICIAL ---
const initialState = {
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// --- EL SLICE ---
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    // --- CORRECCIÓN DE NOMBRE ---
    // Renombrado de 'clearAdminAlert' a 'clearAdminError'
    clearAdminError: (state) => {
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Maneja los 3 estados (pending, fulfilled, rejected) para TODOS los thunks
    builder
      .addMatcher(
        // Matcher para todos los 'pending' de admin
        (action) =>
          action.type.startsWith("admin/") && action.type.endsWith("/pending"),
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        // Matcher para todos los 'fulfilled' de admin
        (action) =>
          action.type.startsWith("admin/") &&
          action.type.endsWith("/fulfilled"),
        (state) => {
          state.status = "succeeded";
        }
      )
      .addMatcher(
        // Matcher para todos los 'rejected' de admin
        (action) =>
          action.type.startsWith("admin/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload; // El 'rejectWithValue'
        }
      );
  },
});

// --- CORRECCIÓN DE NOMBRE ---
export const { clearAdminError } = adminSlice.actions;

// Selectores
export const selectAdminStatus = (state) => state.admin.status;
export const selectAdminError = (state) => state.admin.error;

export default adminSlice.reducer;
