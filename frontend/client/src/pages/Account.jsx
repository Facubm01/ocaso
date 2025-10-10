import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Account = () => {
  const navigate = useNavigate();
  const { isAuthenticated, profile, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const displayName = profile?.firstName
    ? `${profile.firstName} ${profile.lastName ?? ""}`.trim()
    : profile?.email ?? "Tu cuenta";

  return (
    <div className="container py-5 text-light" style={{ maxWidth: "640px" }}>
      <div className="bg-dark border rounded-4 p-4 p-md-5 shadow">
        <h1 className="mb-3">Hola, {displayName}!</h1>
        <p className="text-secondary mb-4">
          Tu sesión está activa. Desde aquí pronto podrás administrar tus datos,
          direcciones y pedidos.
        </p>
        <button type="button" className="btn btn-outline-light" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

export default Account;
