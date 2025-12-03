// src/api/orders.js
import API_BASE_URL from './config';

export const ordersAPI = {
  // POST /api/orders/create_order/ - Crear orden e iniciar pago
  createOrder: async (orderData) => {
    const token = localStorage.getItem('authToken');
    
    console.log('=== CREANDO ORDEN ===');
    console.log('URL:', `${API_BASE_URL}/orders/create_order/`);
    console.log('Token:', token);
    console.log('Datos enviados:', JSON.stringify(orderData, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/orders/create_order/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    console.log('Status de respuesta:', response.status);
    
    // Intentar leer la respuesta como JSON
    let responseData;
    try {
      responseData = await response.json();
      console.log('Respuesta completa del backend:', responseData);
    } catch (e) {
      console.error('No se pudo parsear la respuesta como JSON');
      throw new Error('Error al procesar la respuesta del servidor');
    }
    
    if (!response.ok) {
      // Mostrar el error completo del backend
      const errorMessage = responseData?.error 
        || responseData?.message 
        || responseData?.detail
        || JSON.stringify(responseData)
        || 'Error al crear la orden';
      
      console.error('❌ ERROR DEL BACKEND:', errorMessage);
      throw new Error(errorMessage);
    }
    
    // Verificar que tenga los campos necesarios
    if (!responseData.client_secret) {
      console.error('❌ Respuesta sin client_secret:', responseData);
      throw new Error('El backend no devolvió client_secret');
    }
    
    if (!responseData.order_id && !responseData.id) {
      console.error('❌ Respuesta sin order_id:', responseData);
      throw new Error('El backend no devolvió order_id');
    }
    
    // Normalizar la respuesta (por si usa "id" en lugar de "order_id")
    const normalizedResponse = {
      client_secret: responseData.client_secret,
      order_id: responseData.order_id || responseData.id,
      ...responseData
    };
    
    console.log('✅ Orden creada correctamente:', normalizedResponse);
    return normalizedResponse;
  },

  // POST /api/orders/confirm_payment/ - Confirmar pago
  confirmPayment: async (orderId, paymentIntentId) => {
    const token = localStorage.getItem('authToken');
    
    console.log('=== CONFIRMANDO PAGO ===');
    console.log('Order ID:', orderId);
    console.log('Payment Intent ID:', paymentIntentId);
    
    const response = await fetch(`${API_BASE_URL}/orders/confirm_payment/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
      },
      body: JSON.stringify({
        order_id: orderId,
        payment_intent_id: paymentIntentId
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error al confirmar pago:', error);
      throw new Error(error.message || 'Error al confirmar el pago');
    }
    
    const result = await response.json();
    console.log('✅ Pago confirmado:', result);
    return result;
  },

  // GET /api/orders/ - Listar órdenes del usuario
  getMyOrders: async () => {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/orders/`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener las órdenes');
    }
    
    return response.json();
  },

  // GET /api/orders/{id}/ - Detalle de orden
  getOrderById: async (id) => {
    const token = localStorage.getItem('authToken');
    
    console.log('=== OBTENIENDO ORDEN ===');
    console.log('Order ID:', id);
    console.log('URL:', `${API_BASE_URL}/orders/${id}/`);
    
    const response = await fetch(`${API_BASE_URL}/orders/${id}/`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    if (!response.ok) {
      console.error('❌ Error al obtener orden:', response.status);
      throw new Error('Error al obtener el detalle de la orden');
    }
    
    const data = await response.json();
    console.log('✅ Orden obtenida:', data);
    return data;
  }
};