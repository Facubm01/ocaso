import { Link } from "react-router-dom";

const ProductCard = ({ p }) => {
  const tieneDescuento = (p.descuentoPct ?? 0) > 0;

  // Formatear precios con separador de miles y coma decimal
  const precioOriginal = Number(p.precioOriginal).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
  });
  const precioFinal = Number(p.precioFinal).toLocaleString("es-AR", {
    minimumFractionDigits: 2,
  });

  const src = p?.imageId
    ? `/api/images/${p.imageId}/raw`
    : "/img/placeholder.png";

  return (
    <div className="card h-100 rounded-0 border shadow-sm position-relative product-card">
      {/* Imagen*/}
      <div className="position-relative overflow-hidden">
        <img
          src={src}
          alt={p.nombre}
          className="card-img-top"
          style={{ objectFit: "cover", height: 280 }}
          onError={(e) => (e.currentTarget.src = "/img/placeholder.png")}
          draggable="false"
        />

        {/* Marca el  descuento */}
        {tieneDescuento && (
          <span
            className="badge position-absolute top-0 start-0 m-2 px-2 py-1 bg-body-secondary text-dark border"
            style={{ borderRadius: "0.5rem" }}
          >
            -{p.descuentoPct}%
          </span>
        )}
      </div>

      {/* Cartita */}
      <div className="card-body p-2">
        <h5 className="card-title mb-1 text-dark">{p.nombre}</h5>

        {/* Precios */}
        <div className="d-flex align-items-baseline gap-2">
          <span className="fw-bold fs-5 text-dark">${precioFinal}</span>
          {tieneDescuento && (
            <small className="text-muted text-decoration-line-through">
              ${precioOriginal}
            </small>
          )}
        </div>

        {/* Toda la card clickeable */}
        <Link
          to={`/producto/${p.id}`}
          className="stretched-link"
          aria-label={`Ver detalle de ${p.nombre}`}
        />
      </div>
    </div>
  );
};

export default ProductCard;
