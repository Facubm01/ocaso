// src/components/SidebarFilters.jsx
import { useEffect, useState } from "react";

const TALLES = ["XS", "S", "M", "L", "XL"];

const SidebarFilters = ({
  categoriaId,
  onChangeCategoria,
  talle,
  onChangeTalle,
  minFinal,
  maxFinal,
  onChangePrecio,
  onClear,
}) => {
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setCategorias)
      .catch(() => setError("No se pudieron cargar las categorías"));
  }, []);

  return (
    <aside className="border rounded-3 p-3 bg-body-tertiary">
      <h6 className="mb-3">Filtros</h6>

      {/* Categoría */}
      <div className="mb-3">
        <label className="form-label">Categoría</label>
        <select
          className="form-select"
          value={categoriaId ?? ""}
          onChange={(e) =>
            onChangeCategoria(e.target.value ? Number(e.target.value) : null)
          }
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        {error && <div className="form-text text-danger">{error}</div>}
      </div>

      {/* Talle */}
      <div className="mb-3">
        <label className="form-label">Talle</label>
        <select
          className="form-select"
          value={talle}
          onChange={(e) => onChangeTalle(e.target.value)}
        >
          <option value="">Todos</option>
          {TALLES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Precio */}
      <div className="mb-3">
        <label className="form-label d-block">Precio final</label>
        <div className="d-flex gap-2">
          <input
            type="number"
            className="form-control"
            placeholder="Mín."
            value={minFinal ?? ""}
            onChange={(e) =>
              onChangePrecio(
                e.target.value ? Number(e.target.value) : null,
                maxFinal
              )
            }
          />
          <input
            type="number"
            className="form-control"
            placeholder="Máx."
            value={maxFinal ?? ""}
            onChange={(e) =>
              onChangePrecio(
                minFinal,
                e.target.value ? Number(e.target.value) : null
              )
            }
          />
        </div>
      </div>

      <button className="btn btn-outline-secondary w-100" onClick={onClear}>
        Limpiar filtros
      </button>
    </aside>
  );
};

export default SidebarFilters;
