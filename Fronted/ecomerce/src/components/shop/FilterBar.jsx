// src/components/shop/FilterBar.jsx
const FilterBar = ({ categorias, filters, onFilterChange }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title fw-bold mb-4">Filtros</h5>

        {/* Categorías */}
        <div className="mb-4">
          <h6 className="fw-semibold mb-3">Categoría</h6>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="categoria"
              id="cat-all"
              checked={filters.categoria === ''}
              onChange={() => onFilterChange({ categoria: '' })}
            />
            <label className="form-check-label" htmlFor="cat-all">
              Todas
            </label>
          </div>
          {categorias.map(categoria => (
            <div key={categoria.id} className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="categoria"
                id={`cat-${categoria.id}`}
                checked={filters.categoria === categoria.id.toString()}
                onChange={() => onFilterChange({ categoria: categoria.id.toString() })}
              />
              <label className="form-check-label" htmlFor={`cat-${categoria.id}`}>
                {categoria.nombre}
              </label>
            </div>
          ))}
        </div>

        {/* Precio */}
        <div className="mb-4">
          <h6 className="fw-semibold mb-3">Rango de Precio</h6>
          <div className="mb-3">
            <label className="form-label small text-muted">Precio mínimo</label>
            <input
              type="number"
              className="form-control"
              placeholder="$0"
              value={filters.precio_min}
              onChange={(e) => onFilterChange({ precio_min: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label small text-muted">Precio máximo</label>
            <input
              type="number"
              className="form-control"
              placeholder="$100"
              value={filters.precio_max}
              onChange={(e) => onFilterChange({ precio_max: e.target.value })}
            />
          </div>
        </div>

        {/* Limpiar */}
        <button
          onClick={() => onFilterChange({ categoria: '', precio_min: '', precio_max: '', search: '' })}
          className="btn btn-outline-danger w-100"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default FilterBar;