import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();

  if (!items.length)
    return (
      <div className="container py-4 text-center">
        <p>Tu carrito está vacío.</p>
        <Link to="/shop" className="btn btn-dark">
          Ir al shop
        </Link>
      </div>
    );

  return (
    <main className="bg-white min-vh-100">
      <div className="container py-4 ">
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
            />
            <div className="flex-grow-1">
              <div className="fw-semibold">{it.nombre}</div>
              <small className="text-muted">Talle: {it.talle}</small>
              <div className="d-flex align-items-center gap-2 mt-1">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() =>
                    setQty(it.productoId, it.talle, it.cantidad - 1)
                  }
                >
                  −
                </button>
                <input
                  className="form-control form-control-sm text-center"
                  style={{ width: 64 }}
                  type="number"
                  min={1}
                  value={it.cantidad}
                  onChange={(e) =>
                    setQty(
                      it.productoId,
                      it.talle,
                      Math.max(1, Number(e.target.value) || 1)
                    )
                  }
                />
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() =>
                    setQty(it.productoId, it.talle, it.cantidad + 1)
                  }
                >
                  +
                </button>
                <div className="ms-auto">
                  <span className="fw-semibold">
                    ${(it.precioUnitario * it.cantidad).toFixed(2)}
                  </span>
                  <button
                    className="btn btn-sm btn-link text-danger ms-2"
                    onClick={() => remove(it.productoId, it.talle)}
                  >
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="d-flex justify-content-between align-items-center mt-3">
          <strong>Subtotal</strong>
          <strong>${subtotal.toFixed(2)}</strong>
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
