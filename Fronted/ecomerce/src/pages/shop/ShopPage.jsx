// src/pages/shop/ShopPage.jsx
import { useState, useEffect } from 'react';
import { productosAPI } from '../../api/productos';
import { categoriasAPI } from '../../api/categorias';
import ProductCard from '../../components/shop/ProductCard';
import FilterBar from '../../components/shop/FilterBar';
import SearchBar from '../../components/shop/SearchBar';

const ShopPage = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoria: '',
    search: '',
    precio_min: '',
    precio_max: ''
  });

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const data = await categoriasAPI.getAll();
        setCategorias(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    fetchCategorias();
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      try {
        const data = await productosAPI.getAll(filters);
        setProductos(data);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="bg-light min-vh-100">
      {/* Header */}
      <div className="bg-white shadow-sm mb-4">
        <div className="container py-4">
          <h1 className="fw-bold">Nuestra Tienda</h1>
          <p className="text-muted mb-0">Deliciosos pasteles y postres artesanales</p>
        </div>
      </div>

      <div className="container py-4">
        {/* Búsqueda */}
        <SearchBar onSearch={(search) => handleFilterChange({ search })} />

        <div className="row mt-4">
          {/* Sidebar */}
          <div className="col-lg-3 mb-4">
            <FilterBar
              categorias={categorias}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Productos */}
          <div className="col-lg-9">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-danger spinner-custom" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-muted">Cargando productos...</p>
              </div>
            ) : productos.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted fs-5">No se encontraron productos</p>
              </div>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {productos.map(producto => (
                  <div key={producto.id} className="col">
                    <ProductCard producto={producto} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;