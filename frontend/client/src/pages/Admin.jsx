import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
// --- REDUX ---
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectIsAdmin,
  selectUserProfile,
} from "../features/auth/authSlice.js";
import {
  fetchCategories,
  fetchProducts,
  selectCategories,
  selectProducts,
} from "../features/shop/shopSlice.js";
import {
  uploadImage,
  createCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  selectAdminStatus,
  selectAdminError,
  clearAdminError,
} from "../features/admin/adminSlice.js";
// --- FIN REDUX ---

const VALID_TALLES = new Set(["XS", "S", "M", "L", "XL"]);

// --- helpers (ya no necesitan 'fetchAuth') ---
const parseImageIds = (txt) =>
  (txt || "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

const createEmptyTalleState = () => {
  const base = {};
  for (const talle of VALID_TALLES) {
    base[talle] = { enabled: false, value: "" };
  }
  return base;
};

export default function Admin() {
  // --- REDUX ---
  const dispatch = useDispatch();
  // Estado de Autenticación
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const profile = useSelector(selectUserProfile);
  // Estado de la Tienda (Datos)
  const { items: categories, status: categoriesStatus } =
    useSelector(selectCategories);
  const { items: products, status: productsStatus } =
    useSelector(selectProducts);
  // Estado de Admin (API C/U/D)
  const busy = useSelector(selectAdminStatus) === "loading";
  const apiError = useSelector(selectAdminError); // Errores de la API
  // --- FIN REDUX ---

  // --- Estado Local ---
  // (Formularios)
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
  });
  const [talleStocks, setTalleStocks] = useState(() => createEmptyTalleState());
  // (Previews de UI)
  const [mainPreview, setMainPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  // (Alertas de UI para éxito o validación)
  const [uiAlert, setUiAlert] = useState(null); // {type, msg}
  // --- Fin Estado Local ---

  // Helper para limpiar todas las alertas
  const clearAlerts = () => {
    dispatch(clearAdminError());
    setUiAlert(null);
  };

  // Carga inicial de datos (reemplaza a reloadAll)
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      // Si las categorías no se han cargado, las pedimos
      if (categoriesStatus === "idle") {
        dispatch(fetchCategories());
      }
      // Si los productos no se han cargado, los pedimos
      if (productsStatus === "idle") {
        dispatch(fetchProducts());
      }
    }
  }, [isAuthenticated, isAdmin, categoriesStatus, productsStatus, dispatch]);

  const onFormChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // --- IMÁGENES (ahora despachan) ---
  const handleMainImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearAlerts();

    // Validaciones locales (del componente original)
    if (!file.type.startsWith("image/"))
      return setUiAlert({
        type: "danger",
        msg: "Seleccioná un archivo de imagen.",
      });
    if (file.size > 5 * 1024 * 1024)
      return setUiAlert({ type: "danger", msg: "Máximo 5MB por imagen." });

    try {
      // Despachamos el thunk y esperamos el resultado con .unwrap()
      const data = await dispatch(uploadImage(file)).unwrap();
      setForm((f) => ({ ...f, imageId: String(data.id) }));
      setMainPreview(URL.createObjectURL(file));
      setUiAlert({ type: "success", msg: "Imagen principal subida." });
    } catch (err) {
      // El error de Redux (apiError) se seteará automáticamente
      // 'err' aquí es el 'rejectWithValue'
    } finally {
      e.target.value = "";
    }
  };

  const handleGalleryImagesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    clearAlerts();

    try {
      const ids = [];
      const previews = [];
      for (const f of files) {
        // Validaciones por archivo (de tu código original)
        if (!f.type.startsWith("image/"))
          throw new Error("Seleccioná solo archivos de imagen.");
        if (f.size > 5 * 1024 * 1024) throw new Error("Máximo 5MB por imagen.");

        // Despachamos el thunk
        const data = await dispatch(uploadImage(f)).unwrap();
        ids.push(data.id);
        previews.push(URL.createObjectURL(f));
      }
      setForm((f) => {
        const prev = parseImageIds(f.imageIds);
        return { ...f, imageIds: [...prev, ...ids].join(", ") };
      });
      setGalleryPreviews((prev) => [...prev, ...previews]);
      setUiAlert({ type: "success", msg: "Imágenes de galería subidas." });
    } catch (err) {
      // Si falla una, 'err' será el error de validación o de la API
      setUiAlert({
        type: "danger",
        msg: err.message || "Error al subir galería.",
      });
    } finally {
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
  const resetTalleStocks = () => {
    setTalleStocks(createEmptyTalleState());
  };
  const hydrateTalleStocks = (product) => {
    setTalleStocks(() => {
      const base = createEmptyTalleState();
      if (product && Array.isArray(product.talles)) {
        for (const entry of product.talles) {
          const talle = String(entry.talle || "").toUpperCase();
          if (!VALID_TALLES.has(talle)) continue;
          const stock = Number(entry.stock);
          base[talle] = {
            enabled: true,
            value:
              Number.isFinite(stock) && stock >= 0
                ? String(Math.trunc(stock))
                : "0",
          };
        }
      }
      return base;
    });
  };
  const handleToggleTalle = (talle, enabled) => {
    setTalleStocks((prev) => {
      const next = { ...prev };
      const current = prev[talle] || { enabled: false, value: "" };
      next[talle] = {
        enabled,
        value: enabled ? current.value || "0" : "",
      };
      return next;
    });
  };
  const handleTalleValueChange = (talle, raw) => {
    const sanitized = raw.replace(/[^0-9]/g, "");
    setTalleStocks((prev) => {
      const next = { ...prev };
      const current = prev[talle] || { enabled: true, value: "" };
      next[talle] = {
        enabled: current.enabled,
        value: sanitized,
      };
      return next;
    });
  };

  // --- CATEGORÍAS (ahora despachan) ---
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    clearAlerts();
    if (!categoryName.trim())
      return setUiAlert({ type: "danger", msg: "El nombre es obligatorio." });

    try {
      await dispatch(createCategory(categoryName.trim())).unwrap();
      setUiAlert({ type: "success", msg: "Categoría creada." });
      setCategoryName("");
      // No necesitamos refetch manual, el shopSlice lo detectará
    } catch (err) {
      // El error de API se mostrará vía apiError
    }
  };

  const handleDeleteCategory = async (id) => {
    // if (!confirm("¿Eliminar categoría?")) return; // <-- LÍNEA ELIMINADA
    clearAlerts();
    try {
      await dispatch(deleteCategory(id)).unwrap();
      setUiAlert({ type: "success", msg: "Categoría eliminada." });
      // No necesitamos refetch manual, el shopSlice lo detectará
    } catch (err) {
      // El error de API se mostrará vía apiError
    }
  };

  // --- PRODUCTOS (ahora despachan) ---
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
    });
    hydrateTalleStocks(p);
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
    });
    resetTalleStocks();
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
    const talles = [];
    for (const [talle, data] of Object.entries(talleStocks)) {
      if (!data.enabled) continue;
      if (data.value === "") {
        throw new Error(`Ingresá el stock para el talle ${talle}.`);
      }
      const stock = Number(data.value);
      if (!Number.isFinite(stock) || stock < 0) {
        throw new Error(`Stock inválido para el talle ${talle}.`);
      }
      talles.push({ talle, stock: Math.trunc(stock) });
    }
    if (talles.length === 0) {
      throw new Error("Seleccioná al menos un talle y cargá su stock.");
    }

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
    clearAlerts();
    try {
      // 1. buildPayload() puede lanzar un error de validación (ej. "Nombre obligatorio")
      const payload = buildPayload();
      const edit = !!form.id;

      // 2. Despachamos la acción
      if (edit) {
        await dispatch(
          updateProduct({ id: form.id, productData: payload })
        ).unwrap();
        setUiAlert({ type: "success", msg: "Producto actualizado." });
      } else {
        await dispatch(createProduct(payload)).unwrap();
        setUiAlert({ type: "success", msg: "Producto creado." });
      }

      resetForm();
      // 3. Ya no forzamos refetch, el shopSlice lo hace solo
    } catch (err) {
      // Capturamos el error de buildPayload() o del .unwrap()
      // Si el error viene de .unwrap(), apiError se setea.
      // Si viene de buildPayload(), usamos uiAlert.
      if (!apiError) {
        setUiAlert({
          type: "danger",
          msg: err.message || "No se pudo guardar el producto.",
        });
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    // if (!confirm("¿Eliminar producto?")) return; // <-- LÍNEA ELIMINADA
    clearAlerts();
    try {
      await dispatch(deleteProduct(id)).unwrap();
      if (form.id === id) resetForm();
      setUiAlert({ type: "success", msg: "Producto eliminado." });
      // No necesitamos refetch manual, el shopSlice lo detectará
    } catch (err) {
      // El error de API se mostrará vía apiError
    }
  };

  // maps
  const catName = new Map(categories.map((c) => [c.id, c.nombre]));

  // guards (Leen de Redux, no cambian)
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

  // --- TU JSX ORIGINAL ---
  // Esta parte es tu JSX original, sin ninguna modificación,
  // solo conectada a las variables de Redux (busy, categories, products)
  return (
    <div className="container py-5 text-light">
      <h1 className="mb-4">Panel de administración</h1>
      {/* Mostramos el error de la API (de Redux) O la alerta de UI (local) */}
      {apiError && <div className={`alert alert-danger`}>{apiError}</div>}
      {!apiError && uiAlert && (
        <div className={`alert alert-${uiAlert.type}`}>{uiAlert.msg}</div>
      )}

      <div className="row g-4">
        {/* CATEGORÍAS */}
        <div className="col-12 col-lg-4">
          <section className="bg-dark border rounded-4 p-4 h-100">
            <h2 className="h4 mb-3">Categorías</h2>

            <form className="mb-4" onSubmit={handleCreateCategory}>
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
                      onClick={() => handleDeleteCategory(c.id)}
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
                  <div className="row g-3">
                    {Array.from(VALID_TALLES).map((talle) => {
                      const data = talleStocks[talle] ?? {
                        enabled: false,
                        value: "",
                      };
                      return (
                        <div
                          key={talle}
                          className="col-12 col-sm-6 col-lg-4"
                        >
                          <div className="border rounded-4 p-3 h-100">
                            <div className="form-check form-switch mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id={`talle-${talle}`}
                                checked={data.enabled}
                                disabled={busy}
                                onChange={(e) =>
                                  handleToggleTalle(talle, e.target.checked)
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`talle-${talle}`}
                              >
                                {talle}
                              </label>
                            </div>
                            <input
                              type="number"
                              min="0"
                              className="form-control"
                              placeholder="Stock"
                              value={data.enabled ? data.value : ""}
                              disabled={!data.enabled || busy}
                              onChange={(e) =>
                                handleTalleValueChange(talle, e.target.value)
                              }
                            />
                            <small className="text-muted">
                              Unidades para {talle}
                            </small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="form-text">
                    Activá los talles que querés vender y definí su stock.
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
                              onClick={() => handleDeleteProduct(p.id)}
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
