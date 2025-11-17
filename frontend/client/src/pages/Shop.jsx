import { useEffect, useMemo, useState } from "react";
import ProductsGrid from "../components/ProductsGrid";
import SidebarFilters from "../components/SidebarFilters";
import SortBar from "../components/SortBar";
// --- REDUX ---
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, selectProducts } from "../features/shop/shopSlice.js";
// --- FIN REDUX ---

const Shop = () => {
  // --- REDUX ---
  const dispatch = useDispatch();
  // Leemos la lista de productos y el estado de la API desde Redux
  const { items: productos, status, error } = useSelector(selectProducts);
  // --- FIN REDUX ---

  // Ya no necesitamos estado local para productos o error
  // const [productos, setProductos] = useState([]);
  // const [error, setError] = useState("");

  // Filtros (ESTO SIGUE SIENDO ESTADO LOCAL Y ESTÁ PERFECTO)
  const [categoriaId, setCategoriaId] = useState(null);
  const [talle, setTalle] = useState(""); // "", "XS"..."XL"
  const [minFinal, setMinFinal] = useState(null); // number | null
  const [maxFinal, setMaxFinal] = useState(null); // number | null
  const [orden, setOrden] = useState("ultimos"); // "ultimos" | "precio_final_asc" | "precio_final_desc"

  // --- REDUX ---
  // Reemplazamos el fetch con un dispatch
  useEffect(() => {
    // Creamos el objeto de filtros basado en el estado local
    const filters = {
      categoriaId,
      minFinal,
      maxFinal,
      orden,
    };
    // Despachamos la acción
    dispatch(fetchProducts(filters));
  }, [categoriaId, minFinal, maxFinal, orden, dispatch]);
  // --- FIN REDUX ---

  // Filtro de talle en el front (ESTO SIGUE IGUAL)
  // 'productos' ahora viene de Redux
  const productosFiltrados = useMemo(() => {
    if (!talle) return productos;
    return productos.filter(
      (p) =>
        Array.isArray(p.talles) &&
        p.talles.some((pt) => pt.talle === talle && pt.stock > 0)
    );
  }, [productos, talle]);

  // Orden en el front para "últimos" (id DESC). (ESTO SIGUE IGUAL)
  const productosOrdenados = useMemo(() => {
    if (orden === "ultimos") {
      return [...productosFiltrados].sort(
        (a, b) => Number(b.id) - Number(a.id)
      );
    }
    return productosFiltrados; // backend ya los ordenó por precio
  }, [productosFiltrados, orden]);

  // Handlers de estado local (ESTO SIGUE IGUAL)
  const handleChangePrecio = (min, max) => {
    setMinFinal(min);
    setMaxFinal(max);
  };

  const handleClear = () => {
    setCategoriaId(null);
    setTalle("");
    setMinFinal(null);
    setMaxFinal(null);
    setOrden("ultimos");
  };

  return (
    <>
      <main className="bg-white min-vh-100">
        <div className="container py-4">
          {/* 'error' ahora viene de Redux */}
          {status === "failed" && error && (
            <div className="alert alert-danger">{error}</div>
          )}

          <div className="row g-4">
            {/* Sidebar (Sin cambios) */}
            <div className="col-12 col-md-3">
              <SidebarFilters
                categoriaId={categoriaId}
                onChangeCategoria={setCategoriaId}
                talle={talle}
                onChangeTalle={setTalle}
                minFinal={minFinal}
                maxFinal={maxFinal}
                onChangePrecio={handleChangePrecio}
                onClear={handleClear}
              />
            </div>

            {/* Contenido */}
            <div className="col-12 col-md-9">
              {/* Barra de orden (Sin cambios) */}
              <SortBar value={orden} onChange={setOrden} />

              {/* Grid */}
              {status === "loading" && (
                <div className="text-muted">Cargando productos…</div>
              )}
              {status !== "loading" && (
                <ProductsGrid items={productosOrdenados} />
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Shop;
