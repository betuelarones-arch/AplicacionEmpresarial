// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  // Obtener clave de localStorage específica por usuario
  const getCartKey = () => {
    return user?.id ? `cartItems_${user.id}` : 'cartItems_guest';
  };

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
        setItems([]);
      }
    } else {
      setItems([]);
    }
  }, [user]); // Recargar cuando cambie el usuario

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (items.length > 0) {
      const cartKey = getCartKey();
      localStorage.setItem(cartKey, JSON.stringify(items));
    }
  }, [items, user]);

  const addToCart = (product, cantidad = 1) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Si ya existe, aumentar cantidad
        return currentItems.map(item =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        );
      } else {
        // Si no existe, agregarlo
        return [...currentItems, { 
          ...product, 
          cantidad,
          precio: parseFloat(product.precio) || 0
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(item => item.id !== productId);
      const cartKey = getCartKey();
      if (newItems.length === 0) {
        localStorage.removeItem(cartKey);
      } else {
        localStorage.setItem(cartKey, JSON.stringify(newItems));
      }
      return newItems;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId
          ? { ...item, cantidad: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    const cartKey = getCartKey();
    localStorage.removeItem(cartKey);
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      const precio = parseFloat(item.precio) || 0;
      return total + (precio * item.cantidad);
    }, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.cantidad, 0);
  };

  const isInCart = (productId) => {
    return items.some(item => item.id === productId);
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getTotalItems,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};  