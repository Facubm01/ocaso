import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // cargar y guardar en localStorage
  useEffect(() => {
    const raw = localStorage.getItem("cart");
    if (raw) setItems(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // acciones
  const add = (item) => {
    // item puede traer "max" (stock del talle). Si no viene, no topeamos.
    setItems((prev) => {
      const i = prev.findIndex(
        (x) => x.productoId === item.productoId && x.talle === item.talle
      );

      // cantidad objetivo respetando tope
      const tope = Number.isFinite(item.max) ? item.max : Infinity;

      if (i >= 0) {
        const next = [...prev];
        const prevMax = next[i].max ?? Infinity;
        const max = Math.min(Math.max(prevMax, tope), Infinity); // mantener el mayor conocido
        const nueva = Math.min(next[i].cantidad + item.cantidad, max);
        next[i] = { ...next[i], cantidad: nueva, max };
        return next;
      }

      const nueva = Math.min(item.cantidad, tope);
      return [...prev, { ...item, cantidad: nueva }];
    });
  };

  const setQty = (productoId, talle, cantidad) =>
    setItems((prev) =>
      prev.map((x) => {
        if (x.productoId === productoId && x.talle === talle) {
          const max = x.max ?? Infinity;
          const target = Math.max(1, Math.min(cantidad, max));
          return { ...x, cantidad: target };
        }
        return x;
      })
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

export const useCart = () => useContext(CartContext);
