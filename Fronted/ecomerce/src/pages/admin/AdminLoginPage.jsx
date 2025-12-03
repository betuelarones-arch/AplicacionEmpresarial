// src/pages/admin/AdminLoginPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminLoginPage = () => {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    emailOrUsername: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await loginAdmin(form.emailOrUsername, form.password);

    if (res.success) {
      // ✅ Login admin OK → al panel admin
      navigate("/admin");
    } else {
      setError(
        res.message ||
          "Error al iniciar sesión como administrador. Verifica tus credenciales."
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1
                    className="fw-bold mb-2"
                    style={{
                      color: "#ff6b6b",
                      fontFamily: "Playfair Display, Georgia, serif",
                      fontSize: "2.3rem",
                    }}
                  >
                    cooking • admin
                  </h1>
                  <p className="text-muted">
                    Inicia sesión en el panel de administración
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Usuario o correo
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-person-badge"></i>
                      </span>
                      <input
                        type="text"
                        name="emailOrUsername"
                        className="form-control"
                        placeholder="admin o admin@cooking.com"
                        value={form.emailOrUsername}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      Contraseña
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-dark w-100 py-3 fw-semibold mb-3"
                    style={{ borderRadius: "10px" }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Iniciar sesión como admin
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <Link to="/" className="text-decoration-none text-muted small">
                      <i className="bi bi-arrow-left me-1"></i>
                      Volver a la tienda
                    </Link>
                  </div>
                </form>

                <div className="mt-4 p-3 bg-light rounded small text-muted">
                  <strong>🔐 Credenciales de prueba admin:</strong>
                  <br />
                  <code>Usuario/Email: admin@cooking.com</code>
                  <br />
                  <code>Contraseña: admin123</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
