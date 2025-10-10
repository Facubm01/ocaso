import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
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
    if (formValues.password !== formValues.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await register({
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        password: formValues.password,
      });
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5 text-light" style={{ maxWidth: "540px" }}>
      <h1 className="mb-4 text-center">Crear cuenta</h1>
      <form className="bg-dark border rounded-4 p-4 shadow" onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="firstName" className="form-label">
              Nombre
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              className="form-control"
              autoComplete="given-name"
              value={formValues.firstName}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="lastName" className="form-label">
              Apellido
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              className="form-control"
              autoComplete="family-name"
              value={formValues.lastName}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>
          <div className="col-12">
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
          <div className="col-md-6">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              autoComplete="new-password"
              value={formValues.password}
              onChange={handleChange}
              required
              disabled={submitting}
              minLength={6}
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-control"
              autoComplete="new-password"
              value={formValues.confirmPassword}
              onChange={handleChange}
              required
              disabled={submitting}
              minLength={6}
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-100 mt-4" disabled={submitting}>
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
        <p className="mt-4 mb-0 text-center">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="link-light">
            Inicia sesión aquí
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
