import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // cargar y guardar en localStorage
  useEffect(() => {
    const raw = localStorage.getItem("cart");
    if (raw) setItems(JSON.parse(raw));
  }, []);
  useEffect(() => localStorage.setItem("cart", JSON.stringify(items)), [items]);

  // acciones
  const add = (item) => {
    setItems((prev) => {
      const i = prev.findIndex(
        (x) => x.productoId === item.productoId && x.talle === item.talle
      );
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], cantidad: next[i].cantidad + item.cantidad };
        return next;
      }
      return [...prev, item];
    });
  };
  const setQty = (productoId, talle, cantidad) =>
    setItems((prev) =>
      prev.map((x) =>
        x.productoId === productoId && x.talle === talle
          ? { ...x, cantidad: Math.max(1, cantidad) }
          : x
      )
    );
  const remove = (productoId, talle) =>
    setItems((prev) =>
      prev.filter((x) => !(x.productoId === productoId && x.talle === talle))
    );
  const clear = () => setItems([]);

  // derivados
  const totalCantidad = useMemo(
    () => items.reduce((a, it) => a + it.cantidad, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((a, it) => a + it.cantidad * it.precioUnitario, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, add, setQty, remove, clear, totalCantidad, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
