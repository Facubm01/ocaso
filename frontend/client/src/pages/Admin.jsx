import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4002"
).replace(/\/$/, "");

const VALID_TALLES = new Set(["XS", "S", "M", "L", "XL"]);

// --- helpers compactos ---
const fetchAuth = (token, path, init = {}) => {
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  return fetch(`${API_BASE}${path}`, { ...init, headers });
};

const parseImageIds = (txt) =>
  (txt || "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

const parseTalles = (txt) => {
  const s = (txt || "").trim();
  if (!s) return null;
  const out = [];
  for (const chunk of s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)) {
    const [talleRaw, stockRaw] = chunk.split(":");
    const talle = (talleRaw || "").trim().toUpperCase();
    const stock = Number((stockRaw || "").trim());
    if (!VALID_TALLES.has(talle) || !Number.isFinite(stock) || stock < 0)
      return null;
    out.push({ talle, stock: Math.trunc(stock) });
  }
  return out;
};

export default function Admin() {
  const { isAuthenticated, isAdmin, token, profile } = useAuth();

  // datos
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // ui
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState(null); // {type,msg}

  // formularios
  const [categoryName, setCategoryName] = useState("");
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    precio: "",
    descuentoPct: "",
    categoriaId: "",
    descripcion: "",
    imageId: "",
    imageIds: "",
    talles: "",
  });

  // previews
  const [mainPreview, setMainPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  // carga inicial
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;
    reloadAll();
  }, [isAuthenticated, isAdmin]);

  async function reloadAll() {
    try {
      const [catsRes, prodsRes] = await Promise.all([
        fetch(`${API_BASE}/api/categorias`),
        fetch(`${API_BASE}/api/productos`),
      ]);
      setCategories((await catsRes.json()) || []);
      setProducts((await prodsRes.json()) || []);
    } catch {
      setAlert({ type: "danger", msg: "No se pudieron cargar los datos." });
    }
  }

  // --- imágenes (subida con FormData) ---
  async function uploadImage(file) {
    if (!file || !file.type.startsWith("image/"))
      throw new Error("Seleccioná un archivo de imagen.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Máximo 5MB por imagen.");

    const fd = new FormData();
    fd.append("file", file);
    const headers = new Headers();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${API_BASE}/api/images`, {
      method: "POST",
      headers,
      body: fd,
    });
    if (!res.ok) throw new Error("No se pudo subir la imagen.");
    const data = await res.json();
    if (!data?.id) throw new Error("Respuesta inválida al subir imagen.");
    return data.id;
  }

  const onFormChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // IMAGEN PRINCIPAL
  const handleMainImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setAlert(null);
    try {
      const id = await uploadImage(file);
      setForm((f) => ({ ...f, imageId: String(id) }));
      setMainPreview(URL.createObjectURL(file)); // (simple: sin revoke para no alargar)
      setAlert({ type: "success", msg: "Imagen principal subida." });
    } catch (err) {
      setAlert({
        type: "danger",
        msg: err?.message || "Error al subir imagen.",
      });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  // gallery images
  const handleGalleryImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setBusy(true);
    setAlert(null);
    try {
      const ids = [];
      const previews = [];
      for (const f of files) {
        ids.push(await uploadImage(f));
        previews.push(URL.createObjectURL(f));
      }
      setForm((f) => {
        const prev = parseImageIds(f.imageIds);
        return { ...f, imageIds: [...prev, ...ids].join(", ") };
      });
      setGalleryPreviews((prev) => [...prev, ...previews]);
      setAlert({ type: "success", msg: "Imágenes de galería subidas." });
    } catch (err) {
      setAlert({
        type: "danger",
        msg: err?.message || "Error al subir galería.",
      });
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const clearMainImage = () => {
    setForm((f) => ({ ...f, imageId: "" }));
    setMainPreview(null);
  };
  const clearGalleryImages = () => {
    setForm((f) => ({ ...f, imageIds: "" }));
    setGalleryPreviews([]);
  };

  // --- categorías (compacto) ---
  const createCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim())
      return setAlert({ type: "danger", msg: "El nombre es obligatorio." });
    setBusy(true);
    setAlert(null);
    try {
      const ok = await fetchAuth(token, "/api/categorias", {
        method: "POST",
        body: JSON.stringify({ nombre: categoryName.trim() }),
      });
      if (!ok?.ok) throw new Error();
      setCategoryName("");
      await reloadAll();
      setAlert({ type: "success", msg: "Categoría creada." });
    } catch {
      setAlert({ type: "danger", msg: "No se pudo crear la categoría." });
    } finally {
      setBusy(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("¿Eliminar categoría?")) return;
    setBusy(true);
    setAlert(null);
    try {
      const ok = await fetchAuth(token, `/api/categorias/${id}`, {
        method: "DELETE",
      });
      if (!ok?.ok) throw new Error();
      await reloadAll();
      setAlert({ type: "success", msg: "Categoría eliminada." });
    } catch {
      setAlert({ type: "danger", msg: "No se pudo eliminar la categoría." });
    } finally {
      setBusy(false);
    }
  };

  // productos
  const editProduct = (p) => {
    clearMainImage();
    clearGalleryImages();
    setForm({
      id: p.id,
      nombre: p.nombre ?? "",
      precio: p.precioOriginal != null ? String(p.precioOriginal) : "",
      descuentoPct: p.descuentoPct != null ? String(p.descuentoPct) : "",
      categoriaId: p.categoriaId != null ? String(p.categoriaId) : "",
      descripcion: p.descripcion ?? "",
      imageId: p.imageId != null ? String(p.imageId) : "",
      imageIds: Array.isArray(p.imageIds) ? p.imageIds.join(", ") : "",
      talles: Array.isArray(p.talles)
        ? p.talles.map((t) => `${t.talle}:${t.stock}`).join(", ")
        : "",
    });
  };

  const resetForm = () => {
    clearMainImage();
    clearGalleryImages();
    setForm({
      id: null,
      nombre: "",
      precio: "",
      descuentoPct: "",
      categoriaId: "",
      descripcion: "",
      imageId: "",
      imageIds: "",
      talles: "",
    });
  };

  const buildPayload = () => {
    const nombre = form.nombre.trim();
    const precio = Number(form.precio);
    const categoriaId = Number(form.categoriaId);
    if (!nombre) throw new Error("Nombre obligatorio.");
    if (!Number.isFinite(precio) || precio <= 0)
      throw new Error("Precio inválido.");
    if (!Number.isFinite(categoriaId) || categoriaId <= 0)
      throw new Error("Categoría inválida.");

    const descuentoPct = form.descuentoPct.trim()
      ? Number(form.descuentoPct)
      : null;
    const imageId = form.imageId.trim() ? Number(form.imageId) : null;
    const imageIds = parseImageIds(form.imageIds);
    const talles = parseTalles(form.talles);
    if (!talles) throw new Error("Talles inválidos. Ej: XS:5, S:10, M:0");

    return {
      nombre,
      precio,
      descuentoPct,
      categoriaId,
      descripcion: form.descripcion.trim() || null,
      imageId,
      imageIds,
      talles,
    };
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    setBusy(true);
    setAlert(null);
    try {
      const payload = buildPayload();
      const edit = !!form.id;
      const res = await fetchAuth(
        token,
        edit ? `/api/productos/${form.id}` : "/api/productos",
        { method: edit ? "PUT" : "POST", body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error();
      resetForm();
      await reloadAll();
      setAlert({
        type: "success",
        msg: edit ? "Producto actualizado." : "Producto creado.",
      });
    } catch (err) {
      setAlert({
        type: "danger",
        msg: err?.message || "No se pudo guardar el producto.",
      });
    } finally {
      setBusy(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    setBusy(true);
    setAlert(null);
    try {
      const res = await fetchAuth(token, `/api/productos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      if (form.id === id) resetForm();
      await reloadAll();
      setAlert({ type: "success", msg: "Producto eliminado." });
    } catch {
      setAlert({ type: "danger", msg: "No se pudo eliminar el producto." });
    } finally {
      setBusy(false);
    }
  };

  // maps
  const catName = new Map(categories.map((c) => [c.id, c.nombre]));

  // guards
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!profile || profile.role == null)
    return (
      <div className="container py-5 text-light">
        <div className="bg-dark border rounded-4 p-4 p-md-5 shadow">
          Cargando tu perfil…
        </div>
      </div>
    );
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="container py-5 text-light">
      <h1 className="mb-4">Panel de administración</h1>
      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      <div className="row g-4">
        {/* CATEGORÍAS */}
        <div className="col-12 col-lg-4">
          <section className="bg-dark border rounded-4 p-4 h-100">
            <h2 className="h4 mb-3">Categorías</h2>

            <form className="mb-4" onSubmit={createCategory}>
              <div className="mb-3">
                <label className="form-label">Nueva categoría</label>
                <input
                  type="text"
                  className="form-control"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  disabled={busy}
                  placeholder="Nombre de la categoría"
                />
              </div>
              <button
                type="submit"
                className="btn btn-outline-light"
                disabled={busy}
              >
                {busy ? "Guardando..." : "Crear categoría"}
              </button>
            </form>

            <h3 className="h5">Listado</h3>
            {categories.length === 0 ? (
              <p className="text-secondary">Aún no hay categorías.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {categories.map((c) => (
                  <li
                    key={c.id}
                    className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center px-0"
                  >
                    <span>{c.nombre}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteCategory(c.id)}
                      disabled={busy}
                    >
                      Eliminar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* PRODUCTOS */}
        <div className="col-12 col-lg-8">
          <section className="bg-dark border rounded-4 p-4">
            <h2 className="h4 mb-3">Productos</h2>

            <form className="mb-4" onSubmit={submitProduct}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label">Nombre</label>
                  <input
                    name="nombre"
                    type="text"
                    className="form-control"
                    value={form.nombre}
                    onChange={onFormChange}
                    disabled={busy}
                    required
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">Precio</label>
                  <input
                    name="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={form.precio}
                    onChange={onFormChange}
                    disabled={busy}
                    required
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label className="form-label">Descuento (%)</label>
                  <input
                    name="descuentoPct"
                    type="number"
                    min="0"
                    max="90"
                    className="form-control"
                    value={form.descuentoPct}
                    onChange={onFormChange}
                    disabled={busy}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Categoría</label>
                  <select
                    name="categoriaId"
                    className="form-select"
                    value={form.categoriaId}
                    onChange={onFormChange}
                    disabled={busy}
                    required
                  >
                    <option value="">Seleccioná una categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subida de imagen principal */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Imagen principal</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleMainImageChange}
                    disabled={busy}
                  />
                  {form.imageId && (
                    <div className="form-text">
                      ID asignado: <code>{form.imageId}</code>
                    </div>
                  )}
                  {mainPreview && (
                    <div className="mt-2 d-flex align-items-center gap-2">
                      <img
                        src={mainPreview}
                        alt="preview principal"
                        style={{
                          width: 72,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={clearMainImage}
                        disabled={busy}
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </div>

                {/* Subida de galería */}
                <div className="col-12">
                  <label className="form-label">Galería (múltiples)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="form-control"
                    onChange={handleGalleryImagesChange}
                    disabled={busy}
                  />
                  {form.imageIds && (
                    <div className="form-text">
                      IDs asignados: <code>{form.imageIds}</code>
                    </div>
                  )}
                  {galleryPreviews.length > 0 && (
                    <div className="mt-2 d-flex flex-wrap gap-2">
                      {galleryPreviews.map((u, i) => (
                        <img
                          key={i}
                          src={u}
                          alt={`preview-${i}`}
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      ))}
                      <div className="w-100"></div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={clearGalleryImages}
                        disabled={busy}
                      >
                        Limpiar galería
                      </button>
                    </div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label">Descripción</label>
                  <textarea
                    name="descripcion"
                    className="form-control"
                    rows={3}
                    value={form.descripcion}
                    onChange={onFormChange}
                    disabled={busy}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Talles y stock</label>
                  <textarea
                    name="talles"
                    className="form-control"
                    rows={2}
                    value={form.talles}
                    onChange={onFormChange}
                    disabled={busy}
                    placeholder="Ej: XS:5, S:10, M:8"
                    required
                  />
                  <div className="form-text">
                    Formato: TALLE:STOCK (coma). Válidos: XS, S, M, L, XL.
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-outline-light"
                  disabled={busy}
                >
                  {busy
                    ? "Guardando..."
                    : form.id
                    ? "Actualizar producto"
                    : "Crear producto"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                  disabled={busy}
                >
                  Limpiar formulario
                </button>
              </div>
            </form>

            <h3 className="h5 mb-3">Listado</h3>
            {products.length === 0 ? (
              <p className="text-secondary">Aún no hay productos.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-striped align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Precio</th>
                      <th>Descuento</th>
                      <th>Stock total</th>
                      <th>Categoría</th>
                      <th>Talles</th>
                      <th className="text-end">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nombre}</td>
                        <td>
                          {typeof p.precioOriginal === "number"
                            ? `$${p.precioOriginal.toFixed(2)}`
                            : "-"}
                        </td>
                        <td>
                          {p.descuentoPct != null ? `${p.descuentoPct}%` : "-"}
                        </td>
                        <td>{p.stockTotal}</td>
                        <td>{catName.get(p.categoriaId) || "Sin categoría"}</td>
                        <td>
                          {Array.isArray(p.talles)
                            ? p.talles
                                .map((t) => `${t.talle}(${t.stock})`)
                                .join(", ")
                            : "-"}
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm" role="group">
                            <button
                              className="btn btn-outline-light"
                              onClick={() => editProduct(p)}
                              disabled={busy}
                            >
                              Editar
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => deleteProduct(p.id)}
                              disabled={busy}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
