import { useEffect } from "react"; // Ya no se usa useState
// --- REDUX ---
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  selectCategories,
} from "../features/shop/shopSlice.js";

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
  // --- REDUX ---
  const dispatch = useDispatch();
  // Leemos el estado de las categorías desde el store global
  // Renombramos 'items' a 'categorias' para que el JSX funcione sin cambios
  const { items: categorias, error, status } = useSelector(selectCategories);
  // --- FIN REDUX ---

  // Ya no necesitamos el estado local para categorías
  // const [categorias, setCategorias] = useState([]);
  // const [error, setError] = useState("");

  // --- REDUX ---
  // Reemplazamos el fetch local con un dispatch
  useEffect(() => {
    // Solo buscamos las categorías si no lo hemos hecho ya (status === 'idle')
    if (status === "idle") {
      dispatch(fetchCategories());
    }
  }, [status, dispatch]);

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
          // Mostramos 'Cargando...' mientras el status es 'loading'
          disabled={status === "loading"}
        >
          <option value="">
            {status === "loading" ? "Cargando..." : "Todas"}
          </option>
          {/* 'categorias' ahora viene del useSelector */}
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        {/* 'error' ahora viene del useSelector */}
        {error && <div className="form-text text-danger">{error}</div>}
      </div>

      {/* Talle (Sin cambios) */}
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

      {/* Precio (Sin cambios) */}
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

      {/* Botón Limpiar (Sin cambios) */}
      <button className="btn btn-outline-secondary w-100" onClick={onClear}>
        Limpiar filtros
      </button>
    </aside>
  );
};

export default SidebarFilters;
