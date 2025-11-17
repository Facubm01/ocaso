import { useState, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
// --- REDUX ---
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  fetchUserProfile,
  selectIsAuthenticated,
  selectAuthStatus,
  selectAuthError,
} from "../features/auth/authSlice";

// Ya no usamos el hook de Context
// import { useAuth } from "../context/AuthContext";

const initialState = {
  email: "",
  password: "",
};

const Login = () => {
  const navigate = useNavigate();
  // --- REDUX ---
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const [formValues, setFormValues] = useState(initialState);
  // El error local ya no es necesario, lo leemos de Redux (authError)
  // const [error, setError] = useState("");

  // El estado 'submitting' ahora deriva del 'authStatus'
  const submitting = authStatus === "loading";

  // Redirige si ya está autenticado
  if (isAuthenticated) {
    return <Navigate to="/account" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Despachamos la acción asíncrona de login
    // 'unwrap' nos permite capturar el resultado o el error del thunk
    try {
      const loginAction = await dispatch(
        loginUser({
          email: formValues.email,
          password: formValues.password,
        })
      ).unwrap();

      // Si el login fue exitoso (obtenemos el token)
      // Buscamos el perfil completo del usuario
      if (loginAction.access_token) {
        await dispatch(fetchUserProfile(loginAction.access_token)).unwrap();
      }

      // La redirección la manejaremos con un useEffect o
      // simplemente dejamos que el componente se re-renderice
      // y el <Navigate> de arriba haga su trabajo.
      // Por claridad, podemos navegar aquí también:
      navigate("/account", { replace: true });
    } catch (err) {
      // El error ya está siendo seteado en el estado de Redux por el thunk
      // No necesitamos hacer setError(err.message)
      console.error("Fallo el login:", err);
    }
  };

  return (
    <div className="container py-5 text-light" style={{ maxWidth: "480px" }}>
      <h1 className="mb-4 text-center">Iniciar sesión</h1>
      <form
        className="bg-dark border rounded-4 p-4 shadow"
        onSubmit={handleSubmit}
      >
        {/* Leemos el error del estado de Redux */}
        {authError && authStatus === "failed" && (
          <div className="alert alert-danger" role="alert">
            {authError}
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
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={submitting}
        >
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
