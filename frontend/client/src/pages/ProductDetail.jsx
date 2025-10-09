import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();

  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  const [talle, setTalle] = useState("");
  const [cantidad, setCantidad] = useState(1);

  // índice del carrusel
  const [active, setActive] = useState(0);

  useEffect(() => {
    setError("");
    setP(null);
    setActive(0);

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

  const tieneDescuento = p && (p.descuentoPct ?? 0) > 0;

  // Armo el array de imágenes para el carrusel:
  // soporta imageIds, imagenUrl, o placeholder.
  const images = useMemo(() => {
    const out = [];
    if (Array.isArray(p?.imageIds) && p.imageIds.length) {
      for (const id of p.imageIds) out.push(`/api/images/${id}/raw`);
    } else if (p?.imageId) {
      out.push(`/api/images/${p.imageId}/raw`);
    } else if (Array.isArray(p?.galeriaUrls) && p.galeriaUrls.length) {
      out.push(...p.galeriaUrls);
    } else if (p?.imagenUrl) {
      out.push(p.imagenUrl);
    }
    return out.length ? out : ["/img/placeholder.png"];
  }, [p]);

  const precioOriginal = Number(p?.precioOriginal ?? 0).toFixed(2);
  const precioFinal = Number(p?.precioFinal ?? 0).toFixed(2);

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  const handleAddToCart = () => {
    if (!p) return;
    if (!talle) {
      alert("Elegí un talle");
      return;
    }
    const item = {
      productoId: p.id,
      nombre: p.nombre,
      // guardo la 1ra imagen para miniaturas del carrito
      imagenUrl: images[0],
      talle,
      cantidad,
      precioUnitario: Number(p.precioFinal),
    };

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex(
      (x) => x.productoId === item.productoId && x.talle === item.talle
    );
    if (idx >= 0) cart[idx].cantidad += item.cantidad;
    else cart.push(item);

    localStorage.setItem("cart", JSON.stringify(cart));
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

  return (
    <main className="bg-white min-vh-100">
      <div className="container py-4">
        <div className="row g-4">
          {/* Galería (rectangular) */}
          <div className="col-12 col-md-6">
            <div
              className="position-relative border rounded-0 overflow-hidden bg-white"
              style={{ aspectRatio: "2.5 / 3", maxHeight: 620 }} // más vertical
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
                  {/* Descuento en gris */}
                  <span className="badge bg-body-secondary text-dark border">
                    -{p.descuentoPct}%
                  </span>
                </>
              )}
            </div>

            {p.descripcion && (
              <p className="text-body-secondary">{p.descripcion}</p>
            )}

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
            <div className="mb-3">
              <label className="form-label">Cantidad</label>
              <div className="input-group" style={{ maxWidth: 180 }}>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  className="form-control text-center"
                  min={1}
                  value={cantidad}
                  onChange={(e) =>
                    setCantidad(Math.max(1, Number(e.target.value) || 1))
                  }
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setCantidad((c) => c + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* CTA */}
            <div className="d-grid gap-2">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAddToCart}
                disabled={!talle || !tallesDisponibles.length}
              >
                Agregar al carrito
              </button>
              {/* ya NO mostramos “Stock total” */}
            </div>
          </div>
        </div>

        {/* Desplegables tipo acordeón flush (sin JS, con <details>) */}
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
                Av. Siempre Viva 742, Lun–Sáb 10 a 19 h.
              </div>
            </details>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
