import { Link } from "react-router-dom";
// --- REDUX ---
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartSubtotal,
  updateItemQuantity,
  removeItem,
} from "../features/cart/cartSlice.js";

// Ya no usamos el hook de Context
// import { useCart } from "../context/CartContext";

export default function CartPage() {
  // --- REDUX ---
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);

  // El estado vacío ahora funciona con los 'items' de Redux
  if (!items.length)
    return (
      <main className="bg-white min-vh-100 d-flex flex-column justify-content-center">
        <div className="container text-center">
          <p className="mb-3">Tu carrito está vacío.</p>
          <Link to="/shop" className="btn btn-dark">
            Ir al shop
          </Link>
        </div>
      </main>
    );

  // Esta función local 'clamp' sigue siendo útil para el input
  const clamp = (n, min, max) =>
    Math.max(min, Math.min(n, Number.isFinite(max) ? max : n));

  // Esta función local de formato sigue perfecta
  const formatPrice = (n) =>
    Number(n ?? 0).toLocaleString("es-AR", { minimumFractionDigits: 2 });

  return (
    <main className="bg-white min-vh-100">
      <div className="container py-4 ">
        {items.map((it) => {
          const max = it.max ?? Infinity;
          const canInc = it.cantidad < max;

          return (
            <div
              key={`${it.productoId}-${it.talle}`}
              className="d-flex align-items-center border rounded-3 p-2 mb-2"
            >
              <img
                src={it.imagenUrl}
                alt={it.nombre}
                style={{ width: 72, height: 72, objectFit: "cover" }}
                className="rounded me-3"
                onError={(e) => (e.currentTarget.src = "/img/placeholder.png")}
              />
              <div className="flex-grow-1">
                <div className="fw-semibold">{it.nombre}</div>
                <small className="text-muted d-block">Talle: {it.talle}</small>

                <div className="d-flex align-items-center gap-2 mt-1">
                  {/* Botón de decrementar */}
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      dispatch(
                        updateItemQuantity({
                          productoId: it.productoId,
                          talle: it.talle,
                          cantidad: it.cantidad - 1,
                        })
                      )
                    }
                    disabled={it.cantidad <= 1}
                  >
                    −
                  </button>

                  {/* Input de cantidad */}
                  <input
                    className="form-control form-control-sm text-center"
                    style={{ width: 64 }}
                    type="number"
                    min={1}
                    value={it.cantidad}
                    onChange={(e) => {
                      const n = Number(e.target.value) || 1;
                      const nuevaCantidad = clamp(n, 1, max);
                      dispatch(
                        updateItemQuantity({
                          productoId: it.productoId,
                          talle: it.talle,
                          cantidad: nuevaCantidad,
                        })
                      );
                    }}
                  />

                  {/* Botón de incrementar */}
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() =>
                      dispatch(
                        updateItemQuantity({
                          productoId: it.productoId,
                          talle: it.talle,
                          cantidad: it.cantidad + 1,
                        })
                      )
                    }
                    disabled={!canInc}
                  >
                    +
                  </button>

                  <div className="ms-auto">
                    <span className="fw-semibold">
                      ${formatPrice(it.precioUnitario * it.cantidad)}
                    </span>
                    {/* Botón de Quitar */}
                    <button
                      className="btn btn-sm btn-link text-danger ms-2"
                      onClick={() =>
                        dispatch(
                          removeItem({
                            productoId: it.productoId,
                            talle: it.talle,
                          })
                        )
                      }
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="d-flex justify-content-between align-items-center mt-3">
          <strong>Subtotal</strong>
          {/* El subtotal ahora viene de Redux */}
          <strong>${formatPrice(subtotal)}</strong>
        </div>

        <div className="d-grid gap-2 mt-3">
          <Link to="/checkout" className="btn btn-primary">
            Ir a pagar
          </Link>
        </div>
      </div>
    </main>
  );
}
