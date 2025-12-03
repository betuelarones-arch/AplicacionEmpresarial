// src/pages/shop/MyAccountPage.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API_BASE_URL from '../../api/config';

const MyAccountPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Estado para editar perfil
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    default_address: '',
    default_city: '',
    default_country: 'PE',
    postal_code: '',
    birth_date: ''
  });

  // Estado para cambiar contraseña
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        default_address: user.profile?.default_address || '',
        default_city: user.profile?.default_city || '',
        default_country: user.profile?.default_country || 'PE',
        postal_code: user.profile?.postal_code || '',
        birth_date: user.profile?.birth_date || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar perfil');
      }

      setSuccess('¡Perfil actualizado correctamente!');
      
      // Actualizar usuario en localStorage
      const updatedUser = { ...user, ...data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Scroll al mensaje de éxito
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validaciones
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(passwordData.new_password)) {
      setError('La contraseña debe contener letras y números');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
          confirm_password: passwordData.confirm_password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar contraseña');
      }

      setSuccess('¡Contraseña actualizada correctamente!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Inicio</Link>
          </li>
          <li className="breadcrumb-item active">Mi Cuenta</li>
        </ol>
      </nav>

      <h2 className="mb-4">
        <i className="bi bi-person-circle text-danger me-2"></i>
        Mi Cuenta
      </h2>

      {/* Mensajes */}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="row">
        {/* Sidebar */}
        <div className="col-lg-3 mb-4">
          <div className="card">
            <div className="card-body">
              {/* Avatar */}
              <div className="text-center mb-4">
                <div 
                  className="rounded-circle bg-danger text-white d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                >
                  {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <h5 className="mb-0">{user?.first_name} {user?.last_name}</h5>
                <p className="text-muted small">{user?.email}</p>
              </div>

              {/* Menú */}
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person me-2"></i>
                  Mi Perfil
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'password' ? 'active' : ''}`}
                  onClick={() => setActiveTab('password')}
                >
                  <i className="bi bi-shield-lock me-2"></i>
                  Cambiar Contraseña
                </button>
                <Link
                  to="/mis-pedidos"
                  className="list-group-item list-group-item-action"
                >
                  <i className="bi bi-bag me-2"></i>
                  Mis Pedidos
                </Link>
                <hr className="my-0" />
                <button
                  className="list-group-item list-group-item-action text-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="col-lg-9">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-body p-4">
                <h5 className="card-title mb-4">
                  <i className="bi bi-person-lines-fill text-danger me-2"></i>
                  Información Personal
                </h5>

                <form onSubmit={handleProfileSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombre *</label>
                      <input
                        type="text"
                        name="first_name"
                        className="form-control"
                        value={profileData.first_name}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Apellido *</label>
                      <input
                        type="text"
                        name="last_name"
                        className="form-control"
                        value={profileData.last_name}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Correo Electrónico *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="+51 999 888 777"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Fecha de Nacimiento</label>
                      <input
                        type="date"
                        name="birth_date"
                        className="form-control"
                        value={profileData.birth_date}
                        onChange={handleProfileChange}
                      />
                    </div>
                  </div>

                  <hr className="my-4" />

                  <h6 className="mb-3">
                    <i className="bi bi-geo-alt text-danger me-2"></i>
                    Dirección Predeterminada
                  </h6>

                  <div className="mb-3">
                    <label className="form-label">Dirección</label>
                    <input
                      type="text"
                      name="default_address"
                      className="form-control"
                      value={profileData.default_address}
                      onChange={handleProfileChange}
                      placeholder="Av. Principal 123, Dpto 456"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Ciudad</label>
                      <input
                        type="text"
                        name="default_city"
                        className="form-control"
                        value={profileData.default_city}
                        onChange={handleProfileChange}
                        placeholder="Lima"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Código Postal</label>
                      <input
                        type="text"
                        name="postal_code"
                        className="form-control"
                        value={profileData.postal_code}
                        onChange={handleProfileChange}
                        placeholder="15001"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">País</label>
                      <select
                        name="default_country"
                        className="form-select"
                        value={profileData.default_country}
                        onChange={handleProfileChange}
                      >
                        <option value="PE">Perú</option>
                        <option value="US">Estados Unidos</option>
                        <option value="MX">México</option>
                        <option value="CO">Colombia</option>
                        <option value="AR">Argentina</option>
                        <option value="CL">Chile</option>
                      </select>
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <small>
                      Esta información se usará para auto-completar tus datos en futuras compras.
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="card">
              <div className="card-body p-4">
                <h5 className="card-title mb-4">
                  <i className="bi bi-shield-lock text-danger me-2"></i>
                  Cambiar Contraseña
                </h5>

                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Contraseña Actual *</label>
                    <input
                      type="password"
                      name="current_password"
                      className="form-control"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nueva Contraseña *</label>
                    <input
                      type="password"
                      name="new_password"
                      className="form-control"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      required
                    />
                    <small className="text-muted">
                      Mínimo 8 caracteres, debe contener letras y números
                    </small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Confirmar Nueva Contraseña *</label>
                    <input
                      type="password"
                      name="confirm_password"
                      className="form-control"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-danger btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Cambiando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-shield-check me-2"></i>
                        Cambiar Contraseña
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;