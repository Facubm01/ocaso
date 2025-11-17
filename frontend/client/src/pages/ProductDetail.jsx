import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
// --- REDUX ---
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../features/cart/cartSlice.js";
import {
  fetchProductById,
  selectCurrentProduct,
  clearCurrentProduct,
} from "../features/shop/shopSlice.js";
// --- FIN REDUX ---

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  // --- REDUX ---
  // Leemos el estado del producto actual desde el store
  // Renombramos 'data' a 'p' para que el resto del componente no necesite cambios
  const { data: p, status, error } = useSelector(selectCurrentProduct);
  // --- FIN REDUX ---

  // Ya no necesitamos estado local para el producto o el error
  // const [p, setP] = useState(null);
  // const [error, setError] = useState("");

  // Estado local (sigue igual)
  const [talle, setTalle] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [active, setActive] = useState(0);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // --- REDUX ---
  // Reemplazamos el fetch local con un dispatch
  useEffect(() => {
    // Limpiamos el feedback y estado local al cambiar de ID
    setTalle("");
    setCantidad(1);
    setActive(0);
    setFeedback({ type: "", message: "" });

    // Despachamos la acción para buscar el producto por ID
    if (id) {
      dispatch(fetchProductById(id));
    }

    // Función de limpieza: se ejecuta al desmontar el componente
    // Limpia el 'currentProduct' del estado de Redux
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [id, dispatch]);
  // --- FIN REDUX ---

  // (toda la lógica de useMemo, useEffect para maxStock, images, precios...
  // ... sigue exactamente igual, ya que 'p' ahora viene de Redux)
  const tallesDisponibles = useMemo(() => {
    if (!p || !Array.isArray(p.talles)) return [];
    return p.talles.filter((pt) => pt.stock > 0).map((pt) => pt.talle);
  }, [p]);

  const maxStock = useMemo(() => {
    if (!p || !Array.isArray(p.talles) || !talle) return 0;
    const found = p.talles.find(
      (pt) => String(pt.talle).toUpperCase() === String(talle).toUpperCase()
    );
    return Number(found?.stock ?? 0);
  }, [p, talle]);

  useEffect(() => {
    if (maxStock > 0) setCantidad((c) => Math.min(Math.max(1, c), maxStock));
    else setCantidad(1);
  }, [maxStock]);

  useEffect(() => {
    if (talle && feedback.type === "error") {
      setFeedback({ type: "", message: "" });
    }
  }, [talle, feedback.type]);

  const tieneDescuento = p && (p.descuentoPct ?? 0) > 0;

  const images = useMemo(() => {
    const out = [];

    const pushUnique = (url) => {
      if (url && !out.includes(url)) out.push(url);
    };

    if (p?.imageId) {
      pushUnique(`/api/images/${p.imageId}/raw`);
    }

    if (Array.isArray(p?.imageIds) && p.imageIds.length) {
      for (const rawId of p.imageIds) {
        const id = Number(rawId);
        if (Number.isFinite(id) && id !== Number(p.imageId)) {
          pushUnique(`/api/images/${id}/raw`);
        }
      }
    }

    if (out.length === 0) {
      out.push("/img/placeholder.png");
    }

    return out;
  }, [p]);

  const precioOriginal = Number(p?.precioOriginal ?? 0).toLocaleString(
    "es-AR",
    {
      minimumFractionDigits: 2,
    }
  );
  const precioFinal = Number(p?.precioFinal ?? 0).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
  });

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  const handleAddToCart = () => {
    if (!p) return;
    if (!talle) {
      setFeedback({ type: "error", message: "Por favor, elegí un talle." });
      return;
    }
    dispatch(
      addItem({
        productoId: p.id,
        nombre: p.nombre,
        imagenUrl: p.imageId
          ? `/api/images/${p.imageId}/raw`
          : "/img/placeholder.png",
        talle,
        cantidad,
        precioUnitario: Number(p.precioFinal),
        max: maxStock,
      })
    );
    setFeedback({ type: "success", message: "¡Agregado al carrito!" });
    setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
  };

  // --- REDUX ---
  // Actualizamos los mensajes de carga y error para usar el 'status' de Redux
  if (status === "failed" && error) {
    return (
      <main className="bg-white min-vh-100">
        <div className="container py-4">
          <div className="alert alert-danger">{error}</div>
        </div>
      </main>
    );
  }

  // Si está cargando, o si 'p' todavía es null (estado inicial)
  if (status === "loading" || !p) {
    return (
      <main className="bg-white min-vh-100">
        <div className="container py-4">
          <div className="text-muted">Cargando…</div>
        </div>
      </main>
    );
  }
  // --- FIN REDUX ---

  const canAdd =
    !!talle && maxStock > 0 && cantidad >= 1 && cantidad <= maxStock;

  return (
    <main className="bg-white min-vh-100">
      <div className="container py-4">
        <div className="row g-4">
          {/* Galería */}
          <div className="col-12 col-md-6">
            <div
              className="position-relative border overflow-hidden bg-white"
              style={{ aspectRatio: "2.5 / 3", maxHeight: 620 }}
            >
              <img
                key={images[active]}
                src={images[active]}
                alt={p.nombre}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                onError={(e) => (e.currentTarget.src = "/img/placeholder.png")}
                draggable="false"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    className="btn btn-light border rounded-circle shadow-sm position-absolute top-50 start-0 translate-middle-y ms-2"
                    onClick={prev}
                    aria-label="Anterior"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="btn btn-light border rounded-circle shadow-sm position-absolute top-50 end-0 translate-middle-y me-2"
                    onClick={next}
                    aria-label="Siguiente"
                  >
                    ›
                  </button>

                  <div className="position-absolute bottom-0 start-50 translate-middle-x mb-2 d-flex gap-1">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        onClick={() => setActive(i)}
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          cursor: "pointer",
                          background: i === active ? "#212529" : "#ced4da",
                          display: "inline-block",
                        }}
                        title={`Imagen ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="col-12 col-md-6">
            <h2 className="h4 mb-2">{p.nombre}</h2>

            <div className="d-flex align-items-baseline gap-2 mb-2">
              <span className="fw-bold fs-4">${precioFinal}</span>
              {tieneDescuento && (
                <>
                  <small className="text-muted text-decoration-line-through">
                    ${precioOriginal}
                  </small>
                  <span className="badge bg-body-secondary text-dark border">
                    -{p.descuentoPct}%
                  </span>
                </>
              )}
            </div>

            {/* Talles */}
            <div className="mb-3">
              <label className="form-label">Talle</label>
              <div className="d-flex flex-wrap gap-2">
                {tallesDisponibles.length ? (
                  tallesDisponibles.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTalle(t)}
                      className={`btn ${
                        t === talle ? "btn-dark" : "btn-outline-dark"
                      }`}
                    >
                      {t}
                    </button>
                  ))
                ) : (
                  <span className="text-danger">Sin stock</span>
                )}
              </div>
            </div>

            {/* Cantidad */}
            <div className="mb-1">
              <label className="form-label">Cantidad</label>
              <div className="input-group" style={{ maxWidth: 180 }}>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  disabled={cantidad <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  className="form-control text-center"
                  min={1}
                  value={cantidad}
                  onChange={(e) => {
                    const n = Number(e.target.value) || 1;
                    const top = maxStock || 1;
                    setCantidad(Math.max(1, Math.min(n, top)));
                  }}
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setCantidad((c) => Math.min(c + 1, maxStock || 1))
                  }
                  disabled={cantidad >= (maxStock || 1)}
                >
                  +
                </button>
              </div>
              <small className="text-muted d-block">
                {talle ? "" : "Elegí un talle"}
              </small>
            </div>

            {/* Feedback (reemplaza a los alerts) */}
            {feedback.message && (
              <div
                className={`alert ${
                  feedback.type === "success" ? "alert-success" : "alert-danger"
                } mt-3 mb-0`}
                role="alert"
              >
                {feedback.message}
              </div>
            )}

            {/* boton de agregar */}
            <div className="d-grid gap-2 mt-2">
              <button
                className={`btn btn-lg ${
                  canAdd
                    ? "btn-primary"
                    : "btn-outline-dark bg-white text-dark border-dark"
                }`}
                onClick={handleAddToCart}
                disabled={!canAdd}
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>

        {/* Acordeones  para detalles y cosas*/}
        <div className="row mt-4">
          <div className="col-12 col-md-8">
            <details className="border-bottom py-3">
              <summary
                className="d-flex justify-content-between align-items-center pe-2"
                style={{ listStyle: "none", cursor: "pointer" }}
              >
                <span className="fw-semibold">DESCRIPCIÓN</span>
                <span className="text-muted">▾</span>
              </summary>
              <div className="mt-2 text-body-secondary">
                {p.descripcion || "Sin descripción adicional."}
              </div>
            </details>

            <details className="border-bottom py-3">
              <summary
                className="d-flex justify-content-between align-items-center pe-2"
                style={{ listStyle: "none", cursor: "pointer" }}
              >
                <span className="fw-semibold">MEDIOS DE PAGO</span>
                <span className="text-muted">▾</span>
              </summary>
              <div className="mt-2 text-body-secondary">
                Aceptamos tarjetas de crédito y débito, transferencias y
                efectivo.
              </div>
            </details>

            <details className="border-bottom py-3">
              <summary
                className="d-flex justify-content-between align-items-center pe-2"
                style={{ listStyle: "none", cursor: "pointer" }}
              >
                <span className="fw-semibold">NUESTRO LOCAL</span>
                <span className="text-muted">▾</span>
              </summary>
              <div className="mt-2 text-body-secondary">
                Italia 3402 Vte. López, Lun–Sáb 10 a 19 h.
              </div>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
