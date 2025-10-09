export default function Community() {
  // Reemplazá los IDs de YouTube por los de tus videos reales
  const videos = [
    { id: "dQw4w9WgXcQ", title: "Campaña Ocaso — FW" },
    { id: "oHg5SJYRHA0", title: "Backstage & Making Of" },
  ];

  const gallery = [
    "https://picsum.photos/seed/ocaso1/900/700",
    "https://picsum.photos/seed/ocaso2/900/700",
    "https://picsum.photos/seed/ocaso3/900/700",
    "https://picsum.photos/seed/ocaso4/900/700",
    "https://picsum.photos/seed/ocaso5/900/700",
    "https://picsum.photos/seed/ocaso6/900/700",
  ];

  return (
    <div className="bg-dark text-light">
      {/* HERO con parallax */}
      <section className="community-hero d-flex align-items-center justify-content-center text-center">
        <div className="container">
          <h1 className="display-5 fw-bold mb-2">Comunidad Ocaso</h1>
          <p className="lead text-secondary mb-3">
            Historias, campañas y detrás de escena. Lo que nos inspira.
          </p>
          <a href="#videos" className="btn btn-primary btn-lg">
            Ver videos
          </a>
        </div>
      </section>

      {/* Bloque editorial corto */}
      <section className="container py-5">
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <img
              src="https://picsum.photos/seed/editorial1/1200/800"
              alt="Editorial Ocaso"
              className="img-fluid rounded-4 border border-secondary"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="col-lg-6">
            <h2 className="h3">Cultura urbana, colaboración y diseño</h2>
            <p className="text-secondary">
              Ocaso nace de la calle y vuelve a ella en cada colección.
              Trabajamos con artistas locales, skaters y músicos para crear
              piezas con identidad. Esta sección reúne nuestras campañas y el
              proceso creativo detrás de cada lanzamiento.
            </p>
            <a href="#gallery" className="btn btn-outline-secondary">
              Ver galería
            </a>
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section id="videos" className="container pb-5">
        <h3 className="h4 mb-3">Videos</h3>
        <div className="row g-4">
          {videos.map((v) => (
            <div key={v.id} className="col-12 col-lg-6">
              <div className="ratio ratio-16x9 rounded-4 overflow-hidden border border-secondary">
                <iframe
                  src={`https://www.youtube.com/embed/${v.id}`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="small text-secondary mt-2">{v.title}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GALERÍA tipo revista */}
      <section id="gallery" className="container pb-5">
        <h3 className="h4 mb-3">Galería</h3>
        <div className="row g-3">
          {gallery.map((src, i) => (
            <div
              key={src}
              className={`col-12 ${i % 3 === 0 ? "col-md-8" : "col-md-4"}`}
            >
              <div className="rounded-4 overflow-hidden border border-secondary">
                <img
                  src={src}
                  alt={`Ocaso ${i + 1}`}
                  className="w-100"
                  style={{ objectFit: "cover", height: 320 }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="text-center border-top border-secondary py-5">
        <h4 className="mb-2">Sumate a la comunidad</h4>
        <p className="text-secondary mb-3">
          Seguinos para ver lanzamientos, eventos y colaboraciones.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <a href="#" className="text-light fs-4" aria-label="Instagram">
            <i className="bi bi-instagram"></i>
          </a>
          <a href="#" className="text-light fs-4" aria-label="TikTok">
            <i className="bi bi-tiktok"></i>
          </a>
          <a href="#" className="text-light fs-4" aria-label="YouTube">
            <i className="bi bi-youtube"></i>
          </a>
        </div>
      </section>
    </div>
  );
}
