// src/pages/Shop.jsx
import { useEffect, useMemo, useState } from "react";
import ProductsGrid from "../components/ProductsGrid";
import SidebarFilters from "../components/SidebarFilters";
import SortBar from "../components/SortBar";

const Shop = () => {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");

  // Filtros
  const [categoriaId, setCategoriaId] = useState(null);
  const [talle, setTalle] = useState(""); // "", "XS"..."XL"
  const [minFinal, setMinFinal] = useState(null); // number | null
  const [maxFinal, setMaxFinal] = useState(null); // number | null
  const [orden, setOrden] = useState("ultimos"); // "ultimos" | "precio_final_asc" | "precio_final_desc"

  // Fetch al backend (categoría + rango + orden de precio)
  useEffect(() => {
    const params = new URLSearchParams();
    if (categoriaId != null) params.set("categoriaId", String(categoriaId));
    if (minFinal != null) params.set("minFinal", String(minFinal));
    if (maxFinal != null) params.set("maxFinal", String(maxFinal));
    if (orden === "precio_final_asc" || orden === "precio_final_desc") {
      params.set("orden", orden);
    }

    const url = `/api/productos${params.toString() ? `?${params}` : ""}`;
    setError("");

    fetch(url)
      .then(async (res) => {
        if (!res.ok)
          throw new Error(
            (await res.text().catch(() => "")) || `HTTP ${res.status}`
          );
        return res.json();
      })
      .then(setProductos)
      .catch((e) => setError(e.message || "No se pudo cargar el catálogo."));
  }, [categoriaId, minFinal, maxFinal, orden]);

  // Filtro de talle en el front
  const productosFiltrados = useMemo(() => {
    if (!talle) return productos;
    return productos.filter(
      (p) =>
        Array.isArray(p.talles) &&
        p.talles.some((pt) => pt.talle === talle && pt.stock > 0)
    );
  }, [productos, talle]);

  // Orden en el front para "últimos" (id DESC). Para precio confías en el backend.
  const productosOrdenados = useMemo(() => {
    if (orden === "ultimos") {
      return [...productosFiltrados].sort(
        (a, b) => Number(b.id) - Number(a.id)
      );
    }
    return productosFiltrados; // backend ya los ordenó por precio
  }, [productosFiltrados, orden]);

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
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row g-4">
            {/* Sidebar */}
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
              {/* Barra de orden (separada de la sidebar) */}
              <SortBar value={orden} onChange={setOrden} />

              {/* Grid */}
              <ProductsGrid items={productosOrdenados} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Shop;
