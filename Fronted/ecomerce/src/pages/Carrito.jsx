// src/pages/Carrito.jsx

export default function Carrito({ cartItems }) {
  // total a pagar
  const total = cartItems.reduce(
    (suma, item) => suma + Number(item.precio || 0),
    0
  );

  return (
    <main style={{ padding: "2rem 0" }}>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "0 2rem",
        }}
      >
        <h1
          style={{
            fontSize: "2.2rem",
            fontWeight: 800,
            marginBottom: "1.5rem",
          }}
        >
          Carrito de compras
        </h1>

        {cartItems.length === 0 ? (
          <p>No hay productos en el carrito.</p>
        ) : (
          <>
            {/* Lista horizontal de productos */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {cartItems.map((item, index) => (
                <article
                  key={index}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    background: "#181818",
                    borderRadius: "12px",
                    padding: "0.9rem 1.1rem",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
                  }}
                >
                  {item.imagen && (
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      style={{
                        width: 90,
                        height: 90,
                        borderRadius: "10px",
                        objectFit: "cover",
                      }}
                    />
                  )}

                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0 }}>{item.nombre}</h3>
                    <p
                      style={{
                        margin: "0.25rem 0",
                        fontSize: "0.9rem",
                        opacity: 0.85,
                      }}
                    >
                      {item.descripcion}
                    </p>
                  </div>

                  <div
                    style={{
                      minWidth: "90px",
                      textAlign: "right",
                      fontWeight: 700,
                    }}
                  >
                    S/ {Number(item.precio).toFixed(2)}
                  </div>
                </article>
              ))}
            </div>

            {/* Total */}
            <div
              style={{
                marginTop: "1.5rem",
                textAlign: "right",
                fontSize: "1.1rem",
              }}
            >
              <strong>Total a pagar:</strong>{" "}
              <span style={{ fontWeight: 800 }}>
                S/ {total.toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
