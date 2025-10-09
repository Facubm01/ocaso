const SortBar = ({ value, onChange }) => {
  return (
    <div className="d-flex justify-content-end mb-3">
      <div className="d-inline-flex align-items-center gap-2">
        <label className="form-label mb-0">Ordenar por:</label>
        <select
          className="form-select"
          style={{ maxWidth: 260 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="ultimos">Últimos</option>
          <option value="precio_final_asc">Precio: menor a mayor</option>
          <option value="precio_final_desc">Precio: mayor a menor</option>
        </select>
      </div>
    </div>
  );
};

export default SortBar;
