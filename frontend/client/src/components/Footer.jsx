export default function Footer() {
  return (
    <footer className="bg-dark text-light border-top border-secondary mt-4">
      <div className="container py-4">
        <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <ul className="nav gap-3">
            <li className="nav-item">
              <span className="nav-link px-0 text-secondary">Contacto</span>
            </li>
            <li className="nav-item">
              <span className="nav-link px-0 text-secondary">
                Preguntas Frecuentes
              </span>
            </li>
            <li className="nav-item">
              <span className="nav-link px-0 text-secondary">
                Política de Privacidad
              </span>
            </li>
          </ul>
          <small className="text-secondary">
            © 2024 Ocaso. Todos los derechos reservados.
          </small>
        </div>
      </div>
    </footer>
  );
}
