import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import cartReducer from "../features/cart/cartSlice.js";
import shopReducer from "../features/shop/shopSlice.js"; // <-- 1. IMPORTAR
import adminReduecer from "../features/admin/adminSlice.js";
import checkoutReducer from "../features/checkout/checkoutSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    shop: shopReducer, // <-- 2. AGREGAR
    admin: adminReduecer,
    checkout: checkoutReducer,
  },
});
