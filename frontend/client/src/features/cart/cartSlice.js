import { createSlice } from "@reduxjs/toolkit";

// --- Funciones de Utilidad ---
// Ponemos los cálculos de totales en una función
// para reutilizarla en todos los reducers que modifican 'items'.
const calculateTotals = (items) => {
  const totalCantidad = items.reduce((a, it) => a + it.cantidad, 0);
  const subtotal = items.reduce(
    (a, it) => a + it.cantidad * it.precioUnitario,
    0
  );
  return { totalCantidad, subtotal };
};

// --- Estado Inicial ---
const initialState = {
  items: [],
  totalCantidad: 0,
  subtotal: 0,
};

// --- EL SLICE ---
const cartSlice = createSlice({
  name: "cart",
  initialState,
  // Reducers síncronos. Todas las acciones del carrito son síncronas.
  reducers: {
    /**
     * Agrega un item al carrito.
     * Payload: { productoId, talle, cantidad, precioUnitario, max, ...otrosDatos }
     */
    addItem: (state, action) => {
      const item = action.payload;
      const i = state.items.findIndex(
        (x) => x.productoId === item.productoId && x.talle === item.talle
      );
      const tope = Number.isFinite(item.max) ? item.max : Infinity;

      if (i >= 0) {
        // Si el item ya existe, actualizamos cantidad
        const prevMax = state.items[i].max ?? Infinity;
        const max = Math.min(Math.max(prevMax, tope), Infinity);
        const nueva = Math.min(state.items[i].cantidad + item.cantidad, max);
        state.items[i].cantidad = nueva;
        state.items[i].max = max; // Actualizamos el max por si viene uno nuevo
      } else {
        // Si es un item nuevo, lo agregamos
        const nueva = Math.min(item.cantidad, tope);
        state.items.push({ ...item, cantidad: nueva });
      }

      // Actualizamos totales
      const { totalCantidad, subtotal } = calculateTotals(state.items);
      state.totalCantidad = totalCantidad;
      state.subtotal = subtotal;
    },

    /**
     * Setea la cantidad de un item específico.
     * Payload: { productoId, talle, cantidad }
     */
    updateItemQuantity: (state, action) => {
      const { productoId, talle, cantidad } = action.payload;
      const item = state.items.find(
        (x) => x.productoId === productoId && x.talle === talle
      );

      if (item) {
        const max = item.max ?? Infinity;
        item.cantidad = Math.max(1, Math.min(cantidad, max)); // Clampeado entre 1 y max
      }

      // Actualizamos totales
      const { totalCantidad, subtotal } = calculateTotals(state.items);
      state.totalCantidad = totalCantidad;
      state.subtotal = subtotal;
    },

    /**
     * Remueve un item del carrito.
     * Payload: { productoId, talle }
     */
    removeItem: (state, action) => {
      const { productoId, talle } = action.payload;
      state.items = state.items.filter(
        (x) => !(x.productoId === productoId && x.talle === talle)
      );

      // Actualizamos totales
      const { totalCantidad, subtotal } = calculateTotals(state.items);
      state.totalCantidad = totalCantidad;
      state.subtotal = subtotal;
    },

    /**
     * Vacía el carrito por completo.
     * No necesita payload.
     */
    clearCart: (state) => {
      // Resetea al estado inicial
      Object.assign(state, initialState);
    },
  },
});

// Exportamos las acciones para usarlas en los componentes
export const { addItem, updateItemQuantity, removeItem, clearCart } =
  cartSlice.actions;

// Exportamos el reducer para el store
export default cartSlice.reducer;

// Exportamos selectores para leer el estado fácilmente
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotalCantidad = (state) => state.cart.totalCantidad;
export const selectCartSubtotal = (state) => state.cart.subtotal;
