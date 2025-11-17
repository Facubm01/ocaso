import { useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
// --- REDUX ---
import { useSelector, useDispatch } from "react-redux";
import { selectIsAuthenticated } from "../features/auth/authSlice.js";
import {
  selectCartItems,
  selectCartSubtotal,
  clearCart,
} from "../features/cart/cartSlice.js";
import {
  processCheckout,
  selectCheckoutError,
  selectCheckoutStatus,
  selectCheckoutReceipt,
  resetCheckout,
} from "../features/checkout/checkoutSlice.js";

// Ya no usamos los hooks de Context
// import { useCart } from "../context/CartContext";
// import { useAuth } from "../context/AuthContext";

export default function CheckoutPage() {
  // --- REDUX ---
  const dispatch = useDispatch();
  // Leemos el estado del carrito desde Redux
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  // Leemos el estado de autenticación desde Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const status = useSelector(selectCheckoutStatus);
  const apiError = useSelector(selectCheckoutError);
  const receipt = useSelector(selectCheckoutReceipt);
  const busy = status === "loading";

  useEffect(() => {
    dispatch(resetCheckout());
    return () => {
      dispatch(resetCheckout());
    };
  }, [dispatch]);

  // formato argentino
  const formatPrice = (n) =>
    Number(n ?? 0).toLocaleString("es-AR", { minimumFractionDigits: 2 });

  // Si no hay items
  if (!items.length && !receipt) {
    return (
      <main className="bg-white min-vh-100">
        <div className="container py-4 text-center">
          <p>Tu carrito está vacío.</p>
          <Link to="/shop" className="btn btn-dark">
            Ir al shop
          </Link>
        </div>
      </main>
    );
  }

  // Forzar login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handlePay = async () => {
    try {
      await dispatch(processCheckout(items)).unwrap();
      dispatch(clearCart());
    } catch (err) {
      // El error ya se maneja en el slice de checkout
    }
  };

  // Recibo confirmado
  if (receipt) {
    return (
      <main className="bg-white min-vh-100">
        <div className="container py-4">
          <div className="bg-light border rounded-4 p-4">
            <h1 className="h4 mb-3">¡Compra confirmada!</h1>
            <p className="text-muted">Resumen de compra:</p>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Talle</th>
                    <th>Cant.</th>
                    <th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((ln, i) => (
                    <tr key={i}>
                      <td>
                        <div className="fw-semibold">{ln.nombre}</div>
                        <small className="text-muted">
                          Unitario: ${formatPrice(ln.precioUnitarioFinal)}
                          {typeof ln.descuentoPctAplicado === "number" &&
                          ln.descuentoPctAplicado > 0
                            ? ` (−${ln.descuentoPctAplicado}%)`
                            : ""}
                        </small>
                      </td>
                      <td>{ln.talle}</td>
                      <td>{ln.cantidad}</td>
                      <td className="text-end">${formatPrice(ln.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3} className="text-end">
                      Total
                    </th>
                    <th className="text-end">${formatPrice(receipt.total)}</th>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="d-flex gap-2 mt-3">
              <Link to="/shop" className="btn btn-outline-dark">
                Seguir comprando
              </Link>
              <Link to="/" className="btn btn-dark">
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Vista previa + pagar
  return (
    <main className="bg-white min-vh-100">
      <div className="container py-4">
        <h1 className="h4 mb-3">Checkout</h1>
        {apiError && <div className="alert alert-danger">{apiError}</div>}

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="bg-light border rounded-4 p-3">
              {items.map((it) => (
                <div
                  key={`${it.productoId}-${it.talle}`}
                  className="d-flex align-items-center border rounded-3 p-2 mb-2"
                >
                  <img
                    src={it.imagenUrl}
                    alt={it.nombre}
                    style={{ width: 72, height: 72, objectFit: "cover" }}
                    className="rounded me-3"
                    onError={(e) =>
                      (e.currentTarget.src = "/img/placeholder.png")
                    }
                  />
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{it.nombre}</div>
                    <small className="text-muted">Talle: {it.talle}</small>
                  </div>
                  <div className="text-end">
                    <div className="small text-muted">x{it.cantidad}</div>
                    <div className="fw-semibold">
                      ${formatPrice(it.precioUnitario * it.cantidad)}
                    </div>
                  </div>
                </div>
              ))}

              <div className="d-flex justify-content-between mt-2">
                <strong>Subtotal</strong>
                <strong>${formatPrice(subtotal)}</strong>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="bg-light border rounded-4 p-3">
              <h2 className="h6">Pago</h2>

              <button
                className="btn btn-dark w-100"
                onClick={handlePay}
                disabled={busy || !items.length}
              >
                {busy ? "Procesando…" : "Confirmar compra"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
