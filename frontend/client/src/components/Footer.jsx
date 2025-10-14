export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light border-top border-secondary mt-4">
      <div className="container py-4">
        <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <nav aria-label="Footer">
            <ul className="nav gap-3">
              <li className="nav-item">
                <a
                  href="mailto:contacto@ocaso.com"
                  className="nav-link px-0 link-secondary link-underline-opacity-0 link-underline-opacity-100-hover"
                >
                  Contacto
                </a>
              </li>
              <li className="nav-item">
                <span
                  className="nav-link px-0 text-secondary"
                  role="button"
                  title="Próximamente"
                >
                  Preguntas Frecuentes
                </span>
              </li>
              <li className="nav-item">
                <span
                  className="nav-link px-0 text-secondary"
                  role="button"
                  title="Próximamente"
                >
                  Política de Privacidad
                </span>
              </li>
            </ul>
          </nav>

          <small className="text-secondary">
            © {year} Ocaso · Todos los derechos reservados
          </small>
        </div>
      </div>
    </footer>
  );
}
