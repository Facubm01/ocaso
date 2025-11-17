import { useEffect, useMemo } from "react"; // Quitamos useState
import ProductsGrid from "./ProductsGrid";
// --- REDUX ---
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, selectProducts } from "../features/shop/shopSlice.js";
// --- FIN REDUX ---

function resolveImagenUrl(p) {
  if (Array.isArray(p.imageIds) && p.imageIds.length)
    return `/api/images/${p.imageIds[0]}/raw`;
  if (p.imageId) return `/api/images/${p.imageId}/raw`;
  if (p.imagenUrl) return p.imagenUrl; // por si ya viene armado
  return "/img/placeholder.png";
}

export default function FeaturedProducts() {
  // --- REDUX ---
  const dispatch = useDispatch();
  // Leemos el estado de la lista de productos
  // Renombramos 'items' a 'productsFromRedux' para claridad
  const {
    items: productsFromRedux,
    status,
    error: err,
  } = useSelector(selectProducts);
  const loading = status === "loading";
  // --- FIN REDUX ---

  // Ya no necesitamos los useState locales
  // const [all, setAll] = useState([]);
  // const [err, setErr] = useState("");
  // const [loading, setLoading] = useState(true);

  // --- REDUX ---
  // Reemplazamos el fetch con un dispatch
  useEffect(() => {
    // Si los productos no se han cargado (ej. el usuario entró directo al Home),
    // los buscamos. Si ya se cargaron (ej. viene del Shop), reutilizamos.
    if (status === "idle") {
      dispatch(fetchProducts()); // Despachamos sin filtros
    }
  }, [status, dispatch]);
  // --- FIN REDUX ---

  // Mantenemos tu lógica de normalización
  // Ahora se alimenta de 'productsFromRedux'
  const all = useMemo(() => {
    const normalized = (
      Array.isArray(productsFromRedux) ? productsFromRedux : []
    ).map((p) => ({
      ...p,
      imagenUrl: resolveImagenUrl(p), // <- para tu ProductCard
    }));
    return normalized;
  }, [productsFromRedux]);

  // Mantenemos tu lógica de sorting
  // Se alimenta de la lista 'all' normalizada
  const featured = useMemo(() => {
    const sorted = [...all].sort((a, b) => {
      const ad = a.createdAt ? new Date(a.createdAt).getTime() : null;
      const bd = b.createdAt ? new Date(b.createdAt).getTime() : null;
      if (ad != null && bd != null) return bd - ad;
      return (b.id ?? 0) - (a.id ?? 0);
    });
    return sorted.slice(0, 6);
  }, [all]);

  return (
    <section className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container">
        <h2 className="h3 mb-4 text-center">Destacados</h2>

        {/* El JSX de loading/error ahora usa las variables de Redux */}
        {loading && <p className="text-center text-muted">Cargando…</p>}
        {err && <div className="alert alert-danger text-center">{err}</div>}
        {!loading && !err && featured.length === 0 && (
          <p className="text-center text-muted">
            No hay productos para mostrar.
          </p>
        )}

        {featured.length > 0 && <ProductsGrid items={featured} />}
      </div>
    </section>
  );
}
