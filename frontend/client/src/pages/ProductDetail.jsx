import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const { add } = useCart();

  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  const [talle, setTalle] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setError("");
    setP(null);
    setActive(0);
    setTalle("");
    setCantidad(1);
    fetch(`/api/productos/${id}`)
      .then(async (res) => {
        if (!res.ok)
          throw new Error(
            (await res.text().catch(() => "")) || `HTTP ${res.status}`
          );
        return res.json();
      })
      .then(setP)
      .catch((e) => setError(e.message || "No se pudo cargar el producto."));
  }, [id]);

  const tallesDisponibles = useMemo(() => {
    if (!p || !Array.isArray(p.talles)) return [];
    return p.talles.filter((pt) => pt.stock > 0).map((pt) => pt.talle);
  }, [p]);

  // stock del talle seleccionado
  const maxStock = useMemo(() => {
    if (!p || !Array.isArray(p.talles) || !talle) return 0;
    const found = p.talles.find(
      (pt) => String(pt.talle).toUpperCase() === String(talle).toUpperCase()
    );
    return Number(found?.stock ?? 0);
  }, [p, talle]);

  // clamp cantidad al cambiar talle o stock
  useEffect(() => {
    if (maxStock > 0) setCantidad((c) => Math.min(Math.max(1, c), maxStock));
    else setCantidad(1);
  }, [maxStock]);

  const tieneDescuento = p && (p.descuentoPct ?? 0) > 0;

  const images = useMemo(() => {
    const out = [];

    // Si existe la portada principal, la ponemos primero
    if (p?.imageId) {
      out.push(`/api/images/${p.imageId}/raw`);
    }

    // Luego agregamos las imágenes de galería (sin duplicar la portada)
    if (Array.isArray(p?.imageIds) && p.imageIds.length) {
      for (const id of p.imageIds) {
        if (id !== p.imageId) {
          out.push(`/api/images/${id}/raw`);
        }
      }
    }

    // Si no hay nada, usamos placeholder
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
    if (!talle) return alert("Elegí un talle");

    // pasamos max = stock del talle para topear dentro del carrito también
    add({
      productoId: p.id,
      nombre: p.nombre,
      imagenUrl: p.imageId
        ? `/api/images/${p.imageId}/raw`
        : "/img/placeholder.png",
      talle,
      cantidad,
      precioUnitario: Number(p.precioFinal),
      max: maxStock,
    });
    alert("Agregado al carrito");
  };

  if (error) {
    return (
      <main className="bg-white min-vh-100">
        <div className="container py-4">
          <div className="alert alert-danger">{error}</div>
        </div>
      </main>
    );
  }

  if (!p) {
    return (
      <main className="bg-white min-vh-100">
        <div className="container py-4">
          <div className="text-muted">Cargando…</div>
        </div>
      </main>
    );
  }

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
