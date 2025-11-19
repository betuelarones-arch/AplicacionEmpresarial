// src/App.jsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";

import DashboardProductos from "./pages/DashboardProductos";
import CrearProductosYCategorias from "./pages/CrearProductosYCategorias";
import Carrito from "./pages/Carrito";

function App() {
  const [cartItems, setCartItems] = useState([]);

  const handleAddToCart = (producto) => {
    setCartItems((prev) => [...prev, producto]);
  };

  return (
    <BrowserRouter>
      {/* NAVBAR */}
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          padding: "1rem 2rem",
          borderBottom: "1px solid #333",
          alignItems: "center",
        }}
      >
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/admin">Crear productos/categorías</Link>

        <div style={{ flex: 1 }} />

        {/* Carrito como link */}
        <Link
          to="/carrito"
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: "999px",
            background: "#222",
            fontSize: "0.9rem",
          }}
        >
          🛒 Carrito ({cartItems.length})
        </Link>
      </nav>

      {/* RUTAS */}
      <Routes>
        <Route
          path="/dashboard"
          element={<DashboardProductos onAddToCart={handleAddToCart} />}
        />
        <Route path="/admin" element={<CrearProductosYCategorias />} />
        <Route
          path="/carrito"
          element={<Carrito cartItems={cartItems} />}
        />
        {/* ruta por defecto que lleve al dashboard */}
        <Route
          path="/"
          element={<DashboardProductos onAddToCart={handleAddToCart} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
