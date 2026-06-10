const priceFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
})

const typeLabels = {
  image: '이미지',
  video: '영상',
  site: '사이트',
  plan: '기획서',
}

function ProductThumbnail({ product }) {
  return (
    <div className={`product-thumbnail product-thumbnail-${product.type}`}>
      <img src={product.thumbnail} alt={`${product.title} 썸네일`} />
      <span>{typeLabels[product.type] ?? product.type}</span>
      {product.type === 'video' && <b aria-hidden="true">재생</b>}
      {product.type === 'site' && <b aria-hidden="true">열기</b>}
      {product.type === 'plan' && <b aria-hidden="true">문서</b>}
    </div>
  )
}

function ProductCard({
  product,
  selectedTag,
  onTagClick,
  onProductClick,
  onToggleLike,
  onToggleFavorite,
  onAddToCart,
  onEditProduct,
  onDeleteProduct,
  isInCart,
}) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onProductClick(product)
    }
  }

  return (
    <li
      className="product-item"
      role="button"
      tabIndex="0"
      onClick={() => onProductClick(product)}
      onKeyDown={handleKeyDown}
    >
      <ProductThumbnail product={product} />
      <div className="product-content">
        <div>
          <span className="product-type">
            {typeLabels[product.type] ?? product.type}
          </span>
          <h3>{product.title}</h3>
          <p>{product.description}</p>
          <ul className="product-tags" aria-label={`${product.title} 태그`}>
            {product.tags.map((tag) => (
              <li key={tag}>
                <button
                  type="button"
                  className={`product-tag-button${
                    selectedTag === tag ? ' is-active' : ''
                  }`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onTagClick(tag)
                  }}
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="product-card-footer">
          <strong>{priceFormatter.format(product.price)}</strong>
          <button
            type="button"
            className={`product-like-button${product.isLiked ? ' is-active' : ''}`}
            aria-pressed={product.isLiked}
            onClick={(event) => {
              event.stopPropagation()
              onToggleLike(product.id)
            }}
          >
            {product.isLiked ? '좋아요 완료' : '좋아요'}
          </button>
          <button
            type="button"
            className={`product-favorite-button${
              product.isFavorite ? ' is-active' : ''
            }`}
            aria-pressed={product.isFavorite}
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavorite(product.id)
            }}
          >
            {product.isFavorite ? '즐겨찾기 완료' : '즐겨찾기'}
          </button>
          <button
            type="button"
            className={`product-cart-button${isInCart ? ' is-active' : ''}`}
            disabled={isInCart}
            onClick={(event) => {
              event.stopPropagation()
              onAddToCart(product)
            }}
          >
            {isInCart ? '장바구니 담김' : '장바구니 담기'}
          </button>
        </div>
        <div className="product-admin-actions">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onEditProduct(product)
            }}
          >
            수정
          </button>
          <button
            type="button"
            className="product-admin-delete-button"
            onClick={(event) => {
              event.stopPropagation()
              onDeleteProduct(product)
            }}
          >
            삭제
          </button>
        </div>
      </div>
    </li>
  )
}

export default ProductCard
