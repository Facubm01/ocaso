import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { totalCantidad } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <nav
      className="navbar navbar-dark bg-dark border-bottom sticky-top position-relative py-3"
      style={{ minHeight: "64px" }}
    >
      <div className="container-fluid">
        {/* Izquierda */}
        <ul className="nav position-absolute start-0 top-50 translate-middle-y ms-3">
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
          <NavLink
            to={isAuthenticated ? "/account" : "/login"} //si está autenticado va a account, sino a login
            className="nav-link text-light p-0"
            aria-label={isAuthenticated ? "Perfil" : "Iniciar sesión"}
          >
            <i
              className={`bi ${
                isAuthenticated ? "bi-person" : "bi-box-arrow-in-right" //si está autenticado muestra el ícono de persona, sino el de iniciar sesión
              }`}
            ></i>
          </NavLink>
          {!isAuthenticated && ( //si no está autenticado, muestra el botón de registrarse
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
