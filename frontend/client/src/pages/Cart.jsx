import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export default function Cart() {
  // MOCK: datos de prueba por ahora
  const [items, setItems] = useState([
    {
      id: 1,
      nombre: "Chaqueta Bomber",
      precio: 79999,
      imagenUrl: "https://picsum.photos/seed/bomber/480/360",
      talla: "L",
      qty: 1,
    },
    {
      id: 2,
      nombre: "Sudadera con Capucha",
      precio: 49999,
      imagenUrl: "https://picsum.photos/seed/hoodie/480/360",
      talla: "M",
      qty: 1,
    },
  ]);

  const fmt = (cents) => `€${(cents / 100).toFixed(2)}`;

  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + it.precio * it.qty, 0),
    [items]
  );
  const envio = subtotal >= 150000 ? 0 : 10000; // envío gratis desde 150 €
  const total = subtotal + envio;

  const inc = (id) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: it.qty + 1 } : it))
    );
  const dec = (id) =>
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, it.qty - 1) } : it
      )
    );
  const removeItem = (id) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  if (items.length === 0) {
    return (
      <div className="container  py-5">
        <h1 className="h4 mb-3">Tu Carrito</h1>
        <div className="card bg-dark border-secondary p-4">
          <p className="mb-3">Tu carrito está vacío.</p>
          <Link className="btn btn-primary" to="/shop">
            Ir a la Tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container text-light py-4">
      <div className="row g-4">
        {/* Lista de productos */}
        <section className="col-12 col-lg-8">
          <h1 className="h4 mb-3">Tu Carrito</h1>

          <div className="vstack gap-3">
            {items.map((it) => (
              <div key={it.id} className="card bg-dark border-secondary p-2">
                <div className="d-flex gap-3 align-items-center">
                  <img
                    src={it.imagenUrl}
                    alt={it.nombre}
                    className="rounded"
                    style={{ width: 96, height: 96, objectFit: "cover" }}
                  />

                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">{it.nombre}</div>
                        <small className="text-secondary">
                          Talla: {it.talla}
                        </small>
                      </div>
                      <div className="fw-bold">{fmt(it.precio)}</div>
                    </div>

                    <div className="d-flex align-items-center gap-2 mt-2">
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => dec(it.id)}
                        >
                          <i className="bi bi-dash" />
                        </button>
                        <span className="btn btn-outline-secondary btn-sm disabled">
                          {it.qty}
                        </span>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => inc(it.id)}
                        >
                          <i className="bi bi-plus" />
                        </button>
                      </div>

                      <button
                        className="btn btn-outline-danger btn-sm ms-auto"
                        onClick={() => removeItem(it.id)}
                        title="Quitar"
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Resumen */}
        <aside className="col-12 col-lg-4">
          <div
            className="card bg-dark border-secondary p-3 position-sticky"
            style={{ top: 88 }}
          >
            <h2 className="h5">Resumen del Pedido</h2>
            <div className="d-flex justify-content-between mt-2">
              <span className="text-secondary">Subtotal</span>
              <span>{fmt(subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-secondary">Envío</span>
              <span>{envio === 0 ? "Gratis" : fmt(envio)}</span>
            </div>
            <hr className="border-secondary" />
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>

            <button className="btn btn-primary w-100 mt-3">
              Proceder al Pago
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
