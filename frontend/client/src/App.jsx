import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import Checkout from "./pages/Checkout";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* antes mostraba el div “Home” */}
        <Route path="/shop" element={<Shop />} />
        <Route
          path="/last-call"
          element={<div className="container py-4 text-light">Last Call</div>}
        />
        <Route
          path="/search"
          element={<div className="container py-4 text-light">Buscar</div>}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/producto/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
      <Footer />
    </>
  );
}
