import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialState = {
  email: "",
  password: "",
};

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formValues, setFormValues] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(formValues.email, formValues.password);
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5 text-light" style={{ maxWidth: "480px" }}>
      <h1 className="mb-4 text-center">Iniciar sesión</h1>
      <form className="bg-dark border rounded-4 p-4 shadow" onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            autoComplete="email"
            value={formValues.email}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control"
            autoComplete="current-password"
            value={formValues.password}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
          {submitting ? "Ingresando..." : "Ingresar"}
        </button>
        <p className="mt-4 mb-0 text-center">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="link-light">
            Regístrate aquí
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
