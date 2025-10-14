// src/components/FeaturedProducts.jsx
import { useEffect, useMemo, useState } from "react";
import ProductsGrid from "./ProductsGrid";

function resolveImagenUrl(p) {
  if (Array.isArray(p.imageIds) && p.imageIds.length)
    return `/api/images/${p.imageIds[0]}/raw`;
  if (p.imageId) return `/api/images/${p.imageId}/raw`;
  if (p.imagenUrl) return p.imagenUrl; // por si ya viene armado
  return "/img/placeholder.png";
}

export default function FeaturedProducts() {
  const [all, setAll] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    fetch(`/api/productos`)
      .then(async (res) => {
        if (!res.ok)
          throw new Error(
            (await res.text().catch(() => "")) || `HTTP ${res.status}`
          );
        return res.json();
      })
      .then((list) => {
        if (!alive) return;
        const normalized = (Array.isArray(list) ? list : []).map((p) => ({
          ...p,
          imagenUrl: resolveImagenUrl(p), // <- para tu ProductCard
        }));
        setAll(normalized);
      })
      .catch((e) => setErr(e.message || "No se pudieron cargar productos."))
      .finally(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // últimos 6: createdAt desc si existe; si no, id desc
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
