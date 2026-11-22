export default function CategoryLoading() {
  return (
    <main className="shop-page" aria-busy="true" aria-label="Loading collection">
      <div className="shop-breadcrumb"><span className="loading-line loading-line--short" /></div>
      <section className="shop-heading">
        <div className="loading-line loading-line--eyebrow" />
        <div className="loading-line loading-line--title" />
        <div className="loading-line loading-line--description" />
      </section>
      <div className="catalog">
        <div className="catalog-toolbar"><div className="loading-line loading-line--toolbar" /><div className="loading-line loading-line--toolbar loading-line--sort" /></div>
        <div className="product-grid">{Array.from({ length: 6 }, (_, i) => <div className="product-skeleton" key={i}><div className="product-skeleton-image" /><div className="product-skeleton-copy"><div className="loading-line loading-line--name" /><div className="loading-line loading-line--price" /></div></div>)}</div>
      </div>
    </main>
  );
}
