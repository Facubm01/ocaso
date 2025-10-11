import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const API_BASE_URL = rawBaseUrl ? rawBaseUrl.replace(/\/$/, "") : "";

const resolveApiUrl = (path) =>
  API_BASE_URL ? `${API_BASE_URL}${path}` : path;

const VALID_TALLES = new Set(["XS", "S", "M", "L", "XL"]);

const readErrorMessage = async (response) => {
  const raw = await response.text().catch(() => "");
  if (!raw) {
    return `HTTP ${response.status}`;
  }
  try {
    const data = JSON.parse(raw);
    return data?.message ?? data?.error ?? `HTTP ${response.status}`;
  } catch (error) {
    return raw;
  }
};

const ensureSuccess = async (response) => {
  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
  return response;
};

const EMPTY_PRODUCT_FORM = {
  id: null,
  nombre: "",
  precio: "",
  descuentoPct: "",
  categoriaId: "",
  descripcion: "",
  imageId: "",
  imageIds: "",
  talles: "",
};

const formatTallesForForm = (talles) =>
  Array.isArray(talles)
    ? talles
        .map((item) => `${item.talle}:${item.stock}`)
        .join(", ")
    : "";

const parseImageIds = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }
  return trimmed
    .split(",")
    .map((part) => {
      const normalized = part.trim();
      if (!normalized) {
        return null;
      }
      const parsed = Number(normalized);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`El ID de imagen "${normalized}" no es válido.`);
      }
      return parsed;
    })
    .filter((id) => id != null);
};

const parseTallesInput = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(
      "Debes indicar al menos un talle usando el formato TALLE:STOCK separados por coma."
    );
  }

  const items = trimmed.split(",").map((chunk) => chunk.trim()).filter(Boolean);
  if (items.length === 0) {
    throw new Error(
      "Debes indicar al menos un talle usando el formato TALLE:STOCK separados por coma."
    );
  }

  return items.map((item) => {
    const [talleRaw, stockRaw] = item.split(":");
    if (!talleRaw || stockRaw === undefined) {
      throw new Error(
        "Formato inválido. Usá pares TALLE:STOCK (por ejemplo, M:10, L:5)."
      );
    }
    const talle = talleRaw.trim().toUpperCase();
    if (!VALID_TALLES.has(talle)) {
      throw new Error(
        `El talle "${talle}" no es válido. Usa XS, S, M, L o XL.`
      );
    }
    const stock = Number(stockRaw.trim());
    if (!Number.isFinite(stock) || stock < 0) {
      throw new Error(
        `El stock para ${talle} debe ser un número mayor o igual a 0.`
      );
    }
    return { talle, stock: Math.trunc(stock) };
  });
};

const buildProductPayload = (form) => {
  if (!form.nombre.trim()) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  const precio = Number(form.precio);
  if (!Number.isFinite(precio) || precio <= 0) {
    throw new Error("El precio debe ser un número mayor a 0.");
  }

  const categoriaId = Number(form.categoriaId);
  if (!Number.isFinite(categoriaId) || categoriaId <= 0) {
    throw new Error("Debes seleccionar una categoría válida.");
  }

  const descuentoPct = form.descuentoPct.trim()
    ? Number(form.descuentoPct)
    : null;
  if (
    descuentoPct != null &&
    (!Number.isInteger(descuentoPct) || descuentoPct < 0 || descuentoPct > 90)
  ) {
    throw new Error("El descuento debe ser un número entero entre 0 y 90.");
  }

  const imageId = form.imageId.trim() ? Number(form.imageId) : null;
  if (imageId != null && (!Number.isFinite(imageId) || imageId <= 0)) {
    throw new Error("El ID de imagen principal debe ser un número positivo.");
  }

  const imageIds = parseImageIds(form.imageIds);
  const talles = parseTallesInput(form.talles);

  return {
    nombre: form.nombre.trim(),
    precio,
    descuentoPct,
    categoriaId,
    descripcion: form.descripcion.trim() ? form.descripcion.trim() : null,
    imageId,
    imageIds,
    talles,
  };
};

const Admin = () => {
  const { isAuthenticated, isAdmin, profile, token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryLoadError, setCategoryLoadError] = useState("");
  const [categoryAlert, setCategoryAlert] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [categorySubmitting, setCategorySubmitting] = useState(false);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productLoadError, setProductLoadError] = useState("");
  const [productAlert, setProductAlert] = useState(null);
  const [productForm, setProductForm] = useState({ ...EMPTY_PRODUCT_FORM });
  const [productSubmitting, setProductSubmitting] = useState(false);

  const categoryById = useMemo(() => {
    const map = new Map();
    categories.forEach((cat) => {
      map.set(cat.id, cat.nombre);
    });
    return map;
  }, [categories]);

  const authorizedFetch = useCallback(
    (path, options = {}) => {
      if (!token) {
        return Promise.reject(
          new Error("No hay token de autenticación disponible.")
        );
      }
      const headers = new Headers(options.headers ?? {});
      if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      headers.set("Authorization", `Bearer ${token}`);
      return fetch(resolveApiUrl(path), {
        ...options,
        headers,
      });
    },
    [token]
  );

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoryLoadError("");
    try {
      const response = await fetch(resolveApiUrl("/api/categorias"));
      await ensureSuccess(response);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("No se pudieron cargar las categorías", error);
      setCategoryLoadError(
        error.message || "No se pudieron cargar las categorías."
      );
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductLoadError("");
    try {
      const response = await fetch(resolveApiUrl("/api/productos"));
      await ensureSuccess(response);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("No se pudieron cargar los productos", error);
      setProductLoadError(
        error.message || "No se pudieron cargar los productos."
      );
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      return;
    }
    loadCategories();
    loadProducts();
  }, [isAuthenticated, isAdmin, loadCategories, loadProducts]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || profile.role == null) {
    return (
      <div className="container py-5 text-light">
        <div className="bg-dark border rounded-4 p-4 p-md-5 shadow">
          <p className="mb-0">Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    if (!categoryName.trim()) {
      setCategoryAlert({
        type: "error",
        message: "El nombre de la categoría es obligatorio.",
      });
      return;
    }

    setCategorySubmitting(true);
    setCategoryAlert(null);
    try {
      const response = await authorizedFetch("/api/categorias", {
        method: "POST",
        body: JSON.stringify({ nombre: categoryName.trim() }),
      });
      await ensureSuccess(response);
      setCategoryAlert({
        type: "success",
        message: "Categoría creada correctamente.",
      });
      setCategoryName("");
      await loadCategories();
    } catch (error) {
      console.error("No se pudo crear la categoría", error);
      setCategoryAlert({
        type: "error",
        message: error.message || "No se pudo crear la categoría.",
      });
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) {
      return;
    }
    setCategorySubmitting(true);
    setCategoryAlert(null);
    try {
      const response = await authorizedFetch(`/api/categorias/${id}`, {
        method: "DELETE",
      });
      await ensureSuccess(response);
      setCategoryAlert({
        type: "success",
        message: "Categoría eliminada correctamente.",
      });
      await loadCategories();
    } catch (error) {
      console.error("No se pudo eliminar la categoría", error);
      setCategoryAlert({
        type: "error",
        message: error.message || "No se pudo eliminar la categoría.",
      });
    } finally {
      setCategorySubmitting(false);
    }
  };

  const handleProductFormChange = (event) => {
    const { name, value } = event.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditProduct = (product) => {
    setProductAlert(null);
    setProductForm({
      id: product.id,
      nombre: product.nombre ?? "",
      precio: product.precioOriginal != null ? String(product.precioOriginal) : "",
      descuentoPct:
        product.descuentoPct != null ? String(product.descuentoPct) : "",
      categoriaId:
        product.categoriaId != null ? String(product.categoriaId) : "",
      descripcion: product.descripcion ?? "",
      imageId: product.imageId != null ? String(product.imageId) : "",
      imageIds: Array.isArray(product.imageIds)
        ? product.imageIds.join(", ")
        : "",
      talles: formatTallesForForm(product.talles),
    });
  };

  const resetProductForm = () => {
    setProductForm({ ...EMPTY_PRODUCT_FORM });
    setProductAlert(null);
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setProductSubmitting(true);
    setProductAlert(null);
    try {
      const payload = buildProductPayload(productForm);
      const isEditing = Boolean(productForm.id);
      const response = await authorizedFetch(
        isEditing ? `/api/productos/${productForm.id}` : "/api/productos",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );
      await ensureSuccess(response);
      setProductAlert({
        type: "success",
        message: isEditing
          ? "Producto actualizado correctamente."
          : "Producto creado correctamente.",
      });
      setProductForm({ ...EMPTY_PRODUCT_FORM });
      await loadProducts();
    } catch (error) {
      console.error("No se pudo guardar el producto", error);
      setProductAlert({
        type: "error",
        message: error.message || "No se pudo guardar el producto.",
      });
    } finally {
      setProductSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) {
      return;
    }
    setProductSubmitting(true);
    setProductAlert(null);
    try {
      const response = await authorizedFetch(`/api/productos/${id}`, {
        method: "DELETE",
      });
      await ensureSuccess(response);
      setProductAlert({
        type: "success",
        message: "Producto eliminado correctamente.",
      });
      if (productForm.id === id) {
        setProductForm({ ...EMPTY_PRODUCT_FORM });
      }
      await loadProducts();
    } catch (error) {
      console.error("No se pudo eliminar el producto", error);
      setProductAlert({
        type: "error",
        message: error.message || "No se pudo eliminar el producto.",
      });
    } finally {
      setProductSubmitting(false);
    }
  };

  const renderAlert = (alert) => {
    if (!alert) {
      return null;
    }
    const variant = alert.type === "success" ? "success" : "danger";
    return (
      <div className={`alert alert-${variant}`} role="alert">
        {alert.message}
      </div>
    );
  };

  return (
    <div className="container py-5 text-light">
      <h1 className="mb-4">Panel de administración</h1>
      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <section className="bg-dark border rounded-4 p-4 h-100">
            <h2 className="h4 mb-3">Categorías</h2>
            {renderAlert(categoryAlert)}
            <form className="mb-4" onSubmit={handleCategorySubmit}>
              <div className="mb-3">
                <label htmlFor="categoryName" className="form-label">
                  Nueva categoría
                </label>
                <input
                  id="categoryName"
                  type="text"
                  className="form-control"
                  value={categoryName}
                  onChange={(event) => setCategoryName(event.target.value)}
                  placeholder="Nombre de la categoría"
                  disabled={categorySubmitting}
                />
              </div>
              <button
                type="submit"
                className="btn btn-outline-light"
                disabled={categorySubmitting}
              >
                {categorySubmitting ? "Guardando..." : "Crear categoría"}
              </button>
            </form>

            <h3 className="h5">Listado</h3>
            {categoriesLoading && <p>Cargando categorías...</p>}
            {categoryLoadError && (
              <div className="alert alert-danger" role="alert">
                {categoryLoadError}
              </div>
            )}
            {!categoriesLoading && !categoryLoadError && categories.length === 0 && (
              <p className="text-secondary">Aún no hay categorías creadas.</p>
            )}
            <ul className="list-group list-group-flush">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="list-group-item bg-dark text-light d-flex justify-content-between align-items-center px-0"
                >
                  <span>{category.nombre}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteCategory(category.id)}
                    disabled={categorySubmitting}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <div className="col-12 col-lg-8">
          <section className="bg-dark border rounded-4 p-4">
            <h2 className="h4 mb-3">Productos</h2>
            {renderAlert(productAlert)}
            <form className="mb-4" onSubmit={handleProductSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="productName" className="form-label">
                    Nombre
                  </label>
                  <input
                    id="productName"
                    name="nombre"
                    type="text"
                    className="form-control"
                    value={productForm.nombre}
                    onChange={handleProductFormChange}
                    disabled={productSubmitting}
                    required
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label htmlFor="productPrice" className="form-label">
                    Precio
                  </label>
                  <input
                    id="productPrice"
                    name="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    value={productForm.precio}
                    onChange={handleProductFormChange}
                    disabled={productSubmitting}
                    required
                  />
                </div>
                <div className="col-6 col-md-3">
                  <label htmlFor="productDiscount" className="form-label">
                    Descuento (%)
                  </label>
                  <input
                    id="productDiscount"
                    name="descuentoPct"
                    type="number"
                    min="0"
                    max="90"
                    className="form-control"
                    value={productForm.descuentoPct}
                    onChange={handleProductFormChange}
                    disabled={productSubmitting}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="productCategory" className="form-label">
                    Categoría
                  </label>
                  <select
                    id="productCategory"
                    name="categoriaId"
                    className="form-select"
                    value={productForm.categoriaId}
                    onChange={handleProductFormChange}
                    disabled={productSubmitting}
                    required
                  >
                    <option value="">Seleccioná una categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="productImageId" className="form-label">
                    Imagen principal (ID)
                  </label>
                  <input
                    id="productImageId"
                    name="imageId"
                    type="number"
                    min="0"
                    className="form-control"
                    value={productForm.imageId}
                    onChange={handleProductFormChange}
                    disabled={productSubmitting}
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="productImageIds" className="form-label">
                    Galería (IDs separados por coma)
                  </label>
                  <input
                    id="productImageIds"
                    name="imageIds"
                    type="text"
                    className="form-control"
                    value={productForm.imageIds}
                    onChange={handleProductFormChange}
                    disabled={productSubmitting}
                    placeholder="Ej: 12, 13, 14"
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="productDescription" className="form-label">
                    Descripción
                  </label>
                  <textarea
                    id="productDescription"
                    name="descripcion"
                    className="form-control"
                    rows={3}
                    value={productForm.descripcion}
                    onChange={handleProductFormChange}
                    disabled={productSubmitting}
                  ></textarea>
                </div>
                <div className="col-12">
                  <label htmlFor="productTalles" className="form-label">
                    Talles y stock
                  </label>
                  <textarea
                    id="productTalles"
                    name="talles"
                    className="form-control"
                    rows={2}
                    value={productForm.talles}
                    onChange={handleProductFormChange}
                    disabled={productSubmitting}
                    placeholder="Ej: XS:5, S:10, M:8"
                    required
                  ></textarea>
                  <div className="form-text">
                    Usa pares TALLE:STOCK separados por coma. Talles válidos: XS, S, M, L, XL.
                  </div>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <button
                  type="submit"
                  className="btn btn-outline-light"
                  disabled={productSubmitting}
                >
                  {productSubmitting
                    ? "Guardando..."
                    : productForm.id
                    ? "Actualizar producto"
                    : "Crear producto"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetProductForm}
                  disabled={productSubmitting}
                >
                  Limpiar formulario
                </button>
              </div>
            </form>

            <h3 className="h5 mb-3">Listado</h3>
            {productsLoading && <p>Cargando productos...</p>}
            {productLoadError && (
              <div className="alert alert-danger" role="alert">
                {productLoadError}
              </div>
            )}
            {!productsLoading && !productLoadError && products.length === 0 && (
              <p className="text-secondary">Aún no hay productos cargados.</p>
            )}
            {!productsLoading && !productLoadError && products.length > 0 && (
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
                    {products.map((product) => {
                      const categoryName =
                        categoryById.get(product.categoriaId) ?? "Sin categoría";
                      const tallesResumen = Array.isArray(product.talles)
                        ? product.talles
                            .map((item) => `${item.talle}(${item.stock})`)
                            .join(", ")
                        : "-";
                      const precioBase =
                        typeof product.precioOriginal === "number"
                          ? product.precioOriginal.toFixed(2)
                          : null;
                      const descuentoTexto =
                        product.descuentoPct != null
                          ? `${product.descuentoPct}%`
                          : "-";
                      return (
                        <tr key={product.id}>
                          <td>{product.nombre}</td>
                          <td>{precioBase != null ? `$${precioBase}` : "-"}</td>
                          <td>{descuentoTexto}</td>
                          <td>{product.stockTotal}</td>
                          <td>{categoryName}</td>
                          <td>{tallesResumen}</td>
                          <td className="text-end">
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                type="button"
                                className="btn btn-outline-light"
                                onClick={() => handleEditProduct(product)}
                                disabled={productSubmitting}
                              >
                                Editar
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteProduct(product.id)}
                                disabled={productSubmitting}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Admin;
