import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="hero-ocaso d-flex align-items-center justify-content-center text-center text-light">
      <div className="container">
        <h1 className="display-3 fw-bold mb-3">Nueva Colección Ocaso</h1>
        <Link to="/shop" className="btn btn-primary btn-lg px-4">
          Ver catálogo
        </Link>
      </div>
    </section>
  );
}
