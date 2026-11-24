export default function ProductLoading() {
  return (
    <main className="product-page" aria-busy="true" aria-label="Loading product">
      <div className="shop-breadcrumb"><span className="loading-line loading-line--short" /></div>
      <div className="product-detail product-detail--loading">
        <div className="product-gallery"><div className="product-skeleton-image product-skeleton-image--detail" /></div>
        <section className="product-detail-copy">
          <div className="loading-line loading-line--eyebrow" />
          <div className="loading-line loading-line--product-title" />
          <div className="loading-line loading-line--price" />
          <div className="loading-line loading-line--description" />
          <div className="loading-line loading-line--option" />
          <div className="loading-line loading-line--option" />
          <div className="loading-line loading-line--button" />
        </section>
      </div>
    </main>
  );
}
