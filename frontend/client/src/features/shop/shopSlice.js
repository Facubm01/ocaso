import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// --- ¡ESTO ES NUEVO! ---
// Importamos las acciones de adminSlice para reaccionar a ellas
import {
  createCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../admin/adminSlice.js"; // Asegúrate que esta ruta sea correcta (ej. ../admin/adminSlice.js)
// --- FIN NUEVO ---

// URL base de tu API
const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4002"
).replace(/\/$/, "");

// Helper para manejar errores de fetch
const handleFetchError = async (response) => {
  const text = await response.text().catch(() => "");
  throw new Error(text || `Error HTTP ${response.status}`);
};

// --- THUNKS ASÍNCRONOS (Aquí va el fetch) ---

/**
 * Thunk para buscar la lista de CATEGORÍAS
 * (Usado en SidebarFilters y Admin)
 */
export const fetchCategories = createAsyncThunk(
  "shop/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/api/categorias`);
      if (!res.ok) return handleFetchError(res);
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Thunk para buscar un PRODUCTO por su ID
 * (Usado en ProductDetail)
 */
export const fetchProductById = createAsyncThunk(
  "shop/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/api/productos/${id}`);
      if (!res.ok) return handleFetchError(res);
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Thunk para buscar la lista de PRODUCTOS (filtrados o todos)
 * (Usado en Shop y FeaturedProducts)
 * 'filters' es un objeto: { categoriaId, minFinal, maxFinal, orden }
 */
export const fetchProducts = createAsyncThunk(
  "shop/fetchProducts",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.categoriaId != null)
        params.set("categoriaId", String(filters.categoriaId));
      if (filters.minFinal != null)
        params.set("minFinal", String(filters.minFinal));
      if (filters.maxFinal != null)
        params.set("maxFinal", String(filters.maxFinal));
      if (
        filters.orden === "precio_final_asc" ||
        filters.orden === "precio_final_desc"
      ) {
        params.set("orden", filters.orden);
      }

      const url = `${API_BASE}/api/productos${
        params.toString() ? `?${params}` : ""
      }`;

      const res = await fetch(url);
      if (!res.ok) return handleFetchError(res);
      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// --- ESTADO INICIAL ---
const initialState = {
  // Para la lista de productos de la tienda (Shop.jsx)
  productsList: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  // Para las categorías (SidebarFilters.jsx y Admin.jsx)
  categoryList: {
    items: [],
    status: "idle",
    error: null,
  },
  // Para el producto individual (ProductDetail.jsx)
  currentProduct: {
    data: null,
    status: "idle",
    error: null,
  },
};

// --- EL SLICE ---
const shopSlice = createSlice({
  name: "shop",
  initialState,
  // Reducers síncronos
  reducers: {
    // Acción para limpiar el producto actual cuando salimos de ProductDetail
    clearCurrentProduct: (state) => {
      state.currentProduct.data = null;
      state.currentProduct.status = "idle";
      state.currentProduct.error = null;
    },
  },
  // Reducers asíncronos (manejan los thunks)
  extraReducers: (builder) => {
    builder
      // Casos para fetchCategories
      .addCase(fetchCategories.pending, (state) => {
        state.categoryList.status = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoryList.status = "succeeded";
        state.categoryList.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoryList.status = "failed";
        state.categoryList.error = action.payload;
      })
      // Casos para fetchProducts (para Shop.jsx y FeaturedProducts.jsx)
      .addCase(fetchProducts.pending, (state) => {
        state.productsList.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.productsList.status = "succeeded";
        state.productsList.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.productsList.status = "failed";
        state.productsList.error = action.payload;
      })
      // Casos para fetchProductById (para ProductDetail.jsx)
      .addCase(fetchProductById.pending, (state) => {
        state.currentProduct.status = "loading";
        state.currentProduct.data = null; // Limpiamos data anterior
        state.currentProduct.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.currentProduct.status = "succeeded";
        state.currentProduct.data = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.currentProduct.status = "failed";
        state.currentProduct.error = action.payload;
      })
      // --- ¡ESTA ES LA PARTE QUE FALTA! ---
      // Reacciona a las acciones del adminSlice
      .addMatcher(
        (action) =>
          [
            createCategory.fulfilled.type,
            deleteCategory.fulfilled.type,
          ].includes(action.type),
        (state) => {
          // Marca la lista de categorías como 'idle' para forzar un refetch
          state.categoryList.status = "idle";
        }
      )
      .addMatcher(
        (action) =>
          [
            createProduct.fulfilled.type,
            updateProduct.fulfilled.type,
            deleteProduct.fulfilled.type,
          ].includes(action.type),
        (state) => {
          // Marca la lista de productos como 'idle' para forzar un refetch
          state.productsList.status = "idle";
        }
      );
    // --- FIN DE LA CORRECCIÓN ---
  },
});

// Exportamos la acción síncrona
export const { clearCurrentProduct } = shopSlice.actions;

// Exportamos el reducer
export default shopSlice.reducer;

// Exportamos selectores para fácil acceso en los componentes
export const selectCategories = (state) => state.shop.categoryList;
export const selectProducts = (state) => state.shop.productsList;
export const selectCurrentProduct = (state) => state.shop.currentProduct;
