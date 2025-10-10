import { Link, NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Header = () => {
  const { totalCantidad } = useCart(); // 👈 cantidad total en el carrito

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
          <li className="nav-item">
            <NavLink to="/last-call" className="nav-link text-light">
              Last Call
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/community" className="nav-link text-light">
              Community
            </NavLink>
          </li>
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
            to="/search"
            className="nav-link text-light p-0"
            aria-label="Buscar"
          >
            <i className="bi bi-search"></i>
          </NavLink>
          <NavLink
            to="/account"
            className="nav-link text-light p-0"
            aria-label="Perfil"
          >
            <i className="bi bi-person"></i>
          </NavLink>

          {/* Carrito con badge */}
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
