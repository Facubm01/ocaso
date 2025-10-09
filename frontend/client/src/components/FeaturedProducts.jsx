export default function FeaturedProducts() {
  const products = [
    {
      id: 1,
      name: "Chaqueta Bomber",
      description: "Nueva chaqueta bomber",
      price: 79999,
      img: "https://picsum.photos/seed/bomber/600/400",
    },
    {
      id: 2,
      name: "Sudadera con Capucha",
      description: "Cómoda y con estilo",
      price: 49999,
      img: "https://picsum.photos/seed/hoodie/600/400",
    },
    {
      id: 3,
      name: "Gorra de Béisbol",
      description: "Diseño exclusivo",
      price: 29999,
      img: "https://picsum.photos/seed/cap/600/400",
    },
  ];

  return (
    <section className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="container">
        <h2 className="h3 mb-4 text-center">Destacados</h2>

        <div className="row g-4">
          {products.map((p) => (
            <div key={p.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm rounded-4 border-0">
                <img
                  src={p.img}
                  alt={p.name}
                  className="card-img-top"
                  style={{ objectFit: "cover", height: 260 }}
                />

                <div className="card-body">
                  <h5 className="card-title mb-2 text-dark">{p.name}</h5>
                  <p className="card-text text-muted small">{p.description}</p>
                  <p className="fw-bold fs-5 mb-3">
                    €{(p.price / 100).toFixed(2)}
                  </p>
                  <button className="btn btn-primary w-100">
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
