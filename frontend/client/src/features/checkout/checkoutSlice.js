import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4002"
).replace(/\/$/, "");

const handleFetchError = async (response) => {
  const text = await response.text().catch(() => "");
  throw new Error(text || `Error HTTP ${response.status}`);
};

const TALLE_MAP = new Set(["XS", "S", "M", "L", "XL"]);

export const processCheckout = createAsyncThunk(
  "checkout/processCheckout",
  async (items, { getState, rejectWithValue }) => {
    try {
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("El carrito está vacío.");
      }

      const payload = {
        items: items.map((it) => ({
          productoId: it.productoId,
          talle: String(it.talle ?? "").toUpperCase(),
          cantidad: it.cantidad,
        })),
      };

      for (const it of payload.items) {
        if (!Number.isFinite(it.productoId) || it.productoId <= 0) {
          throw new Error("Producto inválido.");
        }
        if (!TALLE_MAP.has(it.talle)) {
          throw new Error(`Talle inválido: ${it.talle}`);
        }
        if (!Number.isFinite(it.cantidad) || it.cantidad < 1) {
          throw new Error("Cantidad inválida.");
        }
      }

      const { auth } = getState();
      const token = auth?.token;

      const res = await fetch(`${API_BASE}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw await handleFetchError(res);
      }

      return await res.json();
    } catch (err) {
      return rejectWithValue(err.message || "No se pudo procesar el pago.");
    }
  }
);

const initialState = {
  status: "idle",
  error: null,
  receipt: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    resetCheckout: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(processCheckout.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.receipt = null;
      })
      .addCase(processCheckout.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.receipt = action.payload;
        state.error = null;
      })
      .addCase(processCheckout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { resetCheckout } = checkoutSlice.actions;

export const selectCheckoutStatus = (state) => state.checkout.status;
export const selectCheckoutError = (state) => state.checkout.error;
export const selectCheckoutReceipt = (state) => state.checkout.receipt;

export default checkoutSlice.reducer;
