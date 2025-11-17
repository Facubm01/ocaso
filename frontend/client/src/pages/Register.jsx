import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
// --- REDUX ---
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  fetchUserProfile,
  selectIsAuthenticated,
  selectAuthStatus,
  selectAuthError,
} from "../features/auth/authSlice.js";

// Ya no usamos el hook de Context
// import { useAuth } from "../context/AuthContext";

const initialState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const Register = () => {
  const navigate = useNavigate();
  // --- REDUX ---
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const [formValues, setFormValues] = useState(initialState);
  // 'submitting' ahora se deriva del estado de Redux
  const submitting = authStatus === "loading";
  // 'error' local solo para validación de cliente (contraseñas no coinciden)
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

    // Validación local
    if (formValues.password !== formValues.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // Limpiamos el error local antes de enviar
    setError("");

    try {
      // Despachamos la acción de registro
      const registerAction = await dispatch(
        registerUser({
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          email: formValues.email,
          password: formValues.password,
        })
      ).unwrap(); // .unwrap() nos permite usar try/catch

      // Si el registro fue exitoso (obtenemos el token)
      // Buscamos el perfil completo del usuario
      if (registerAction.access_token) {
        await dispatch(fetchUserProfile(registerAction.access_token)).unwrap();
      }

      // Dejamos que el <Navigate> de arriba maneje la redirección,
      // o navegamos explícitamente:
      navigate("/account", { replace: true });
    } catch (err) {
      // El 'err' es el error de 'rejectWithValue' de nuestro thunk.
      // Ya está en el estado de Redux (authError), así que no necesitamos 'setError(err.message)'
      console.error("Fallo el registro:", err);
    }
  };

  return (
    <div className="container py-5 text-light" style={{ maxWidth: "540px" }}>
      <h1 className="mb-4 text-center text-secondary">Crear cuenta</h1>
      <form
        className="bg-dark border rounded-4 p-4 shadow"
        onSubmit={handleSubmit}
      >
        {/* Mostramos el error local de validación */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {/* Mostramos el error de la API (de Redux) si no hay error local */}
        {!error && authError && authStatus === "failed" && (
          <div className="alert alert-danger" role="alert">
            {authError}
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
        <button
          type="submit"
          className="btn btn-primary w-100 mt-4"
          disabled={submitting}
        >
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
