import ProductCard from "./ProductCard";

const ProductsGrid = ({ items = [] }) => {
  if (!items.length) {
    return <div className="text-center text-muted py-5">No hay productos.</div>;
  }

  return (
    <div className="row g-3">
      {items.map((p) => (
        <div key={p.id} className="col-12 col-sm-6 col-lg-4">
          <ProductCard p={p} />
        </div>
      ))}
    </div>
  );
};

export default ProductsGrid;
