import { Link, NavLink } from "react-router-dom";
// --- REDUX ---
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectIsAdmin,
} from "../features/auth/authSlice.js";
import { selectCartTotalCantidad } from "../features/cart/cartSlice.js"; // <-- 1. IMPORTAR SELECTOR DEL CARRITO

// Ya no usamos NINGÚN hook de Context
// import { useCart } from "../context/CartContext";
// import { useAuth } from "../context/AuthContext";

const Header = () => {
  // --- REDUX ---
  // Leemos el total de cantidad del estado global del carrito
  const totalCantidad = useSelector(selectCartTotalCantidad); // <-- 2. USAR SELECTOR

  // Leemos los valores del estado global de auth
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  return (
    <nav
      className="navbar navbar-dark bg-dark border-bottom sticky-top position-relative py-3"
      style={{ minHeight: "64px" }}
    >
      <div className="container-fluid">
        {/* Izquierda */}
        <ul className="nav position-absolute start-0 top-50 translate-middle-y ms-3">
          {/* ...código sin cambios... */}
          <li className="nav-item">
            <NavLink to="/shop" className="nav-link text-light">
              Shop
            </NavLink>
          </li>
          {isAdmin && (
            <li className="nav-item">
              <NavLink to="/admin" className="nav-link text-light">
                Admin
              </NavLink>
            </li>
          )}
        </ul>

        {/* Centro */}
        <Link
          to="/"
          className="navbar-brand position-absolute top-50 start-50 translate-middle fw-bold"
        >
          ocaso
        </Link>

        {/* Derecha */}
        <div className="d-flex gap-3 position-absolute end-0 top-50 translate-middle-y me-3">
          {/* ...código sin cambios... */}
          <NavLink
            to={isAuthenticated ? "/account" : "/login"}
            className="nav-link text-light p-0"
            aria-label={isAuthenticated ? "Perfil" : "Iniciar sesión"}
          >
            <i
              className={`bi ${
                isAuthenticated ? "bi-person" : "bi-box-arrow-in-right"
              }`}
            ></i>
          </NavLink>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-outline-light btn-sm">
              Registrarse
            </Link>
          )}

          {/* Carrito con simbolito de cantidades */}
          <NavLink
            to="/cart"
            className="nav-link text-light p-0 position-relative"
            aria-label="Carrito"
          >
            <i className="bi bi-bag"></i>

            {/* ESTA LÓGICA AHORA VUELVE A FUNCIONAR */}
            {totalCantidad > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "0.6rem" }}
              >
                {totalCantidad}
              </span>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Header;
