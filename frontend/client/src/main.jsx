import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App.jsx";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./index.css";

// --- REDUX ---
import { Provider } from "react-redux";
import { store } from "./app/store";

// Ya no necesitamos los Contexts
// import { CartProvider } from "./context/CartContext";
// import { AuthProvider } from "./context/AuthContext";

// Renderizado
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Envolvemos toda la App con el Provider de Redux */}
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </StrictMode>
);
