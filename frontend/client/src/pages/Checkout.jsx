import { useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4002"
).replace(/\/$/, "");

const TALLE_MAP = new Set(["XS", "S", "M", "L", "XL"]); // debe coincidir con el enum del backend

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { isAuthenticated, token } = useAuth();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null); // respuesta del backend

  // Si no hay items, mostramos CTA para volver al shop
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

  // Forzá login antes de pagar
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const payload = useMemo(() => {
    // Mapeo al contrato del backend: { items: [{ productoId, talle, cantidad }] }
    return {
      items: items.map((it) => ({
        productoId: it.productoId,
        talle: String(it.talle).toUpperCase(), // el backend espera el enum Talle
        cantidad: it.cantidad,
      })),
    };
  }, [items]);

  const handlePay = async () => {
    setBusy(true);
    setError("");
    try {
      // Validaciones mínimas de front
      if (!payload.items.length) throw new Error("El carrito está vacío.");
      for (const it of payload.items) {
        if (!Number.isFinite(it.productoId) || it.productoId <= 0)
          throw new Error("Producto inválido.");
        if (!TALLE_MAP.has(it.talle))
          throw new Error(`Talle inválido: ${it.talle}`);
        if (!Number.isFinite(it.cantidad) || it.cantidad < 1)
          throw new Error("Cantidad inválida.");
      }

      const res = await fetch(`${API_BASE}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      // Errores típicos del backend: 400 carrito vacío, 404 producto/variante, 409 stock insuficiente
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Error HTTP ${res.status}`);
      }

      const data = await res.json();
      setReceipt(data); // { items: [...], total }
      clear(); // vaciamos carrito local al confirmar
      // Listo: mostramos resumen debajo
    } catch (e) {
      setError(e.message || "No se pudo procesar el pago.");
    } finally {
      setBusy(false);
    }
  };

  // Si ya tenemos recibo, mostramos “orden confirmada”
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
                          Unitario: ${Number(ln.precioUnitarioFinal).toFixed(2)}
                          {typeof ln.descuentoPctAplicado === "number" &&
                          ln.descuentoPctAplicado > 0
                            ? ` (−${ln.descuentoPctAplicado}%)`
                            : ""}
                        </small>
                      </td>
                      <td>{ln.talle}</td>
                      <td>{ln.cantidad}</td>
                      <td className="text-end">
                        ${Number(ln.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan={3} className="text-end">
                      Total
                    </th>
                    <th className="text-end">
                      ${Number(receipt.total).toFixed(2)}
                    </th>
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

  // Vista previa + botón pagar
  return (
    <main className="bg-white min-vh-100">
      <div className="container py-4">
        <h1 className="h4 mb-3">Checkout</h1>
        {error && <div className="alert alert-danger">{error}</div>}

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
                      ${(it.precioUnitario * it.cantidad).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}

              <div className="d-flex justify-content-between mt-2">
                <strong>Subtotal</strong>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="bg-light border rounded-4 p-3">
              <h2 className="h6">Pago</h2>
              <p className="text-muted mb-2">
                Para el TP, simulamos el pago (sin pasarela).
              </p>
              <button
                className="btn btn-dark w-100"
                onClick={handlePay}
                disabled={busy || !items.length}
              >
                {busy ? "Procesando…" : "Confirmar compra"}
              </button>
              <div className="form-text mt-2">
                Al confirmar, se valida stock por talle y se descuenta en el
                servidor.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
