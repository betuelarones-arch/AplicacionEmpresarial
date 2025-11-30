// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/shop/Navbar';

// Páginas de la Tienda
import ShopPage from './pages/shop/ShopPage';
import ProductDetailPage from './pages/shop/ProductDetailPage';
import CartPage from './pages/shop/CartPage';

// Páginas de Autenticación
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Páginas de Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductos from './pages/admin/AdminProductos';
import ProductoForm from './pages/admin/ProductoForm';
import AdminCategorias from './pages/admin/AdminCategorias';
import CategoriaForm from './pages/admin/CategoriaForm';

// Componente para proteger rutas de admin
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<ShopPage />} />
        <Route path="/producto/:id" element={<ProductDetailPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        {/* Rutas de Admin (Protegidas) */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/productos" 
          element={
            <ProtectedRoute>
              <AdminProductos />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/productos/nuevo" 
          element={
            <ProtectedRoute>
              <ProductoForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/productos/editar/:id" 
          element={
            <ProtectedRoute>
              <ProductoForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/categorias" 
          element={
            <ProtectedRoute>
              <AdminCategorias />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/categorias/nueva" 
          element={
            <ProtectedRoute>
              <CategoriaForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/categorias/editar/:id" 
          element={
            <ProtectedRoute>
              <CategoriaForm />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;