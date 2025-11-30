// src/components/shop/SearchBar.jsx
import { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="input-group input-group-lg">
        <span className="input-group-text bg-white">
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control"
          placeholder="Buscar pasteles, tartas, cupcakes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setSearchTerm('');
              onSearch('');
            }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;