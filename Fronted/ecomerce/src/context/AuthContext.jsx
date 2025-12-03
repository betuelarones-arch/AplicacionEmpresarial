// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import authAPI from "../api/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al inicio si hay token
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authAPI.isAuthenticated()) {
          const response = await authAPI.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            await authAPI.logout();
          }
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        await authAPI.logout();
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // 🔹 Registro de CLIENTE
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.success && response.data && response.data.user) {
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.message || "Error al registrar usuario",
      };
    }
  };

  // 🔹 LOGIN CLIENTE (tienda)
  const loginClient = async (emailOrUsername, password) => {
    try {
      const response = await authAPI.loginClient(emailOrUsername, password);
      if (response.success && response.data && response.data.user) {
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.message || "Error al iniciar sesión",
      };
    }
  };

  // 🔹 LOGIN ADMIN (panel admin)
  const loginAdmin = async (emailOrUsername, password) => {
    try {
      const response = await authAPI.loginAdmin(emailOrUsername, password);
      if (response.success && response.data && response.data.user) {
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.message || "Error al iniciar sesión",
      };
    }
  };

  // (OPCIONAL) mantener un login genérico que use loginClient por compatibilidad
  const login = (emailOrUsername, password) => {
    return loginClient(emailOrUsername, password);
  };

  // 🔹 Logout
  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    localStorage.removeItem("cartItems"); // tu lógica anterior
  };

  const isAdmin = () => {
    return user && (user.is_staff || user.is_superuser);
  };

  const value = {
    user,
    loading,
    register,
    // para usar según el caso:
    loginClient,
    loginAdmin,
    // y login genérico por si tu código viejo lo usa:
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
