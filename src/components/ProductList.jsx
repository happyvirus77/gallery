import { useCallback, useEffect, useState } from 'react'
import productsDataUrl from '../data/products.json?url'
import { getPublicAssetUrl } from '../utils/assets'
import ProductCard from './ProductCard'

const categories = [
  { value: 'all', label: '전체' },
  { value: 'image', label: '이미지' },
  { value: 'video', label: '영상' },
  { value: 'site', label: '사이트' },
  { value: 'plan', label: '기획서' },
]

const sectionCategories = categories.filter((category) => category.value !== 'all')

const sortOptions = [
  { value: 'price-low', label: '낮은 가격순' },
  { value: 'price-high', label: '높은 가격순' },
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
]

const priceFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
})

const couponDiscounts = {
  ART10: 10,
  GALLERY20: 20,
  VIP30: 30,
}

const paymentMethodLabels = {
  card: '카드',
  bank: '계좌이체',
  mobile: '모바일 결제',
}

const initialAdminProductForm = {
  title: '',
  description: '',
  price: '',
  type: 'image',
  tags: '',
  thumbnail: '',
}

const maxRecentViewedProducts = 4

const storageKeys = {
  cart: 'gallery-cart',
  likedProducts: 'gallery-liked-products',
  favoriteProducts: 'gallery-favorite-products',
  recentViewedProducts: 'gallery-recent-viewed-products',
}

function readStorageValue(key, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue
  }

  try {
    const savedValue = window.localStorage.getItem(key)

    return savedValue ? JSON.parse(savedValue) : fallbackValue
  } catch {
    return fallbackValue
  }
}

function writeStorageValue(key, value) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors so the gallery still works when storage is blocked.
  }
}

function createProductLookup(productList) {
  if (!Array.isArray(productList)) {
    return new Map()
  }

  return new Map(productList.map((product) => [product.id, product]))
}

function applySavedProductFlags(productList) {
  const likedProductIds = readStorageValue(storageKeys.likedProducts, [])
  const favoriteProductIds = readStorageValue(storageKeys.favoriteProducts, [])
  const likedProductIdSet = new Set(likedProductIds)
  const favoriteProductIdSet = new Set(favoriteProductIds)

  return productList.map((product) => ({
    ...product,
    isLiked: likedProductIdSet.has(product.id),
    isFavorite: favoriteProductIdSet.has(product.id),
  }))
}

function resolveProductAssetUrls(productList) {
  return productList.map((product) => ({
    ...product,
    thumbnail: getPublicAssetUrl(product.thumbnail),
    previewUrl: getPublicAssetUrl(product.previewUrl),
  }))
}

function getSavedCartItems(productList) {
  const productLookup = createProductLookup(productList)
  const savedCartItems = readStorageValue(storageKeys.cart, [])

  if (!Array.isArray(savedCartItems)) {
    return []
  }

  return savedCartItems
    .map((cartItem) => {
      const product = productLookup.get(cartItem.productId)
      const quantity = Number(cartItem.quantity)

      if (!product || !Number.isInteger(quantity) || quantity < 1) {
        return null
      }

      return { product, quantity }
    })
    .filter(Boolean)
}

function getSavedRecentViewedProducts(productList) {
  const productLookup = createProductLookup(productList)
  const savedProductIds = readStorageValue(storageKeys.recentViewedProducts, [])

  if (!Array.isArray(savedProductIds)) {
    return []
  }

  return savedProductIds
    .map((productId) => productLookup.get(productId))
    .filter(Boolean)
    .slice(0, maxRecentViewedProducts)
}

function getDateValue(date) {
  return Number(date.replace('.', ''))
}

function ProductList() {
  const [productItems, setProductItems] = useState([])
  const [isProductsLoading, setIsProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTag, setSelectedTag] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortType, setSortType] = useState('latest')
  const [adminProductForm, setAdminProductForm] = useState(initialAdminProductForm)
  const [adminProductErrors, setAdminProductErrors] = useState({})
  const [adminProductMessage, setAdminProductMessage] = useState('')
  const [editingProductId, setEditingProductId] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [cart, setCart] = useState([])
  const [couponCode, setCouponCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [productReviews, setProductReviews] = useState({})
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    content: '',
  })
  const [reviewError, setReviewError] = useState('')
  const [productComments, setProductComments] = useState({})
  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState('')
  const [recentViewedProducts, setRecentViewedProducts] = useState([])

  const loadProducts = useCallback(async () => {
    setIsProductsLoading(true)
    setProductsError('')

    try {
      const response = await fetch(productsDataUrl)

      if (!response.ok) {
        throw new Error(`요청 실패: ${response.status}`)
      }

      const loadedProducts = await response.json()

      if (!Array.isArray(loadedProducts)) {
        throw new Error('상품 JSON 데이터는 배열이어야 합니다.')
      }

      const nextProducts = applySavedProductFlags(
        resolveProductAssetUrls(loadedProducts),
      )

      setProductItems(nextProducts)
      setCart(getSavedCartItems(nextProducts))
      setRecentViewedProducts(getSavedRecentViewedProducts(nextProducts))
    } catch {
      setProductsError('상품 데이터를 불러오지 못했습니다. 다시 시도해 주세요.')
      setProductItems([])
      setCart([])
      setRecentViewedProducts([])
    } finally {
      setIsProductsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (!selectedProduct) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedProduct(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedProduct])

  useEffect(() => {
    if (isProductsLoading || productsError) {
      return
    }

    writeStorageValue(
      storageKeys.likedProducts,
      productItems
        .filter((product) => product.isLiked)
        .map((product) => product.id),
    )
    writeStorageValue(
      storageKeys.favoriteProducts,
      productItems
        .filter((product) => product.isFavorite)
        .map((product) => product.id),
    )
  }, [isProductsLoading, productItems, productsError])

  useEffect(() => {
    if (isProductsLoading || productsError) {
      return
    }

    writeStorageValue(
      storageKeys.cart,
      cart.map((cartItem) => ({
        productId: cartItem.product.id,
        quantity: cartItem.quantity,
      })),
    )
  }, [cart, isProductsLoading, productsError])

  useEffect(() => {
    if (isProductsLoading || productsError) {
      return
    }

    writeStorageValue(
      storageKeys.recentViewedProducts,
      recentViewedProducts.map((product) => product.id),
    )
  }, [isProductsLoading, productsError, recentViewedProducts])

  const keyword = searchText.trim().toLowerCase()
  const minPriceValue = minPrice === '' ? null : Number(minPrice)
  const maxPriceValue = maxPrice === '' ? null : Number(maxPrice)
  const resetFilters = () => {
    setSearchText('')
    setSelectedCategory('all')
    setSelectedTag('')
    setMinPrice('')
    setMaxPrice('')
    setSortType('latest')
  }

  const handleAdminProductInputChange = (event) => {
    const { name, value } = event.target

    setAdminProductForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
    setAdminProductErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
    setAdminProductMessage('')
  }

  const validateAdminProductForm = () => {
    const nextErrors = {}
    const priceValue = Number(adminProductForm.price)

    if (!adminProductForm.title.trim()) {
      nextErrors.title = '상품 제목을 입력해 주세요.'
    }

    if (!adminProductForm.description.trim()) {
      nextErrors.description = '상품 설명을 입력해 주세요.'
    }

    if (!adminProductForm.price.trim()) {
      nextErrors.price = '가격을 입력해 주세요.'
    } else if (!Number.isFinite(priceValue) || priceValue <= 0) {
      nextErrors.price = '가격은 0보다 커야 합니다.'
    }

    if (!adminProductForm.tags.trim()) {
      nextErrors.tags = '태그를 하나 이상 입력해 주세요.'
    }

    if (!adminProductForm.thumbnail.trim()) {
      nextErrors.thumbnail = '썸네일 URL을 입력해 주세요.'
    }

    return nextErrors
  }

  const resetAdminProductForm = () => {
    setAdminProductForm(initialAdminProductForm)
    setAdminProductErrors({})
    setAdminProductMessage('')
    setEditingProductId(null)
  }

  const updateProductReferences = (updatedProduct) => {
    setCart((currentCart) =>
      currentCart.map((cartItem) =>
        cartItem.product.id === updatedProduct.id
          ? { ...cartItem, product: updatedProduct }
          : cartItem,
      ),
    )
    setRecentViewedProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product,
      ),
    )
    setSelectedProduct((currentProduct) =>
      currentProduct?.id === updatedProduct.id ? updatedProduct : currentProduct,
    )
  }

  const deleteProductById = (productId) => {
    setProductItems((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId),
    )
    setCart((currentCart) =>
      currentCart.filter((cartItem) => cartItem.product.id !== productId),
    )
    setRecentViewedProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId),
    )
    setProductReviews((currentReviews) => {
      const remainingReviews = { ...currentReviews }
      delete remainingReviews[productId]

      return remainingReviews
    })
    setProductComments((currentComments) => {
      const remainingComments = { ...currentComments }
      delete remainingComments[productId]

      return remainingComments
    })
    setSelectedProduct((currentProduct) =>
      currentProduct?.id === productId ? null : currentProduct,
    )

    if (editingProductId === productId) {
      resetAdminProductForm()
    }
  }

  const handleAdminProductSubmit = (event) => {
    event.preventDefault()

    const nextErrors = validateAdminProductForm()

    if (Object.keys(nextErrors).length > 0) {
      setAdminProductErrors(nextErrors)
      setAdminProductMessage('')
      return
    }

    const tags = adminProductForm.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (editingProductId !== null) {
      const productToUpdate = productItems.find(
        (product) => product.id === editingProductId,
      )

      if (!productToUpdate) {
        setAdminProductErrors({})
        setAdminProductMessage('상품을 찾을 수 없습니다.')
        setEditingProductId(null)
        return
      }

      const updatedProduct = {
        ...productToUpdate,
        type: adminProductForm.type,
        title: adminProductForm.title.trim(),
        description: adminProductForm.description.trim(),
        price: Number(adminProductForm.price),
        thumbnail: adminProductForm.thumbnail.trim(),
        previewUrl: adminProductForm.thumbnail.trim(),
        tags,
      }

      setProductItems((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProductId ? updatedProduct : product,
        ),
      )
      updateProductReferences(updatedProduct)
      setAdminProductMessage(`"${updatedProduct.title}" 상품을 수정했습니다.`)

      setAdminProductForm(initialAdminProductForm)
      setAdminProductErrors({})
      setEditingProductId(null)
      return
    }

    const date = new Date()
    const formattedDate = `${date.getFullYear()}.${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}`
    const nextProduct = {
      id: Math.max(0, ...productItems.map((product) => product.id)) + 1,
      type: adminProductForm.type,
      title: adminProductForm.title.trim(),
      description: adminProductForm.description.trim(),
      price: Number(adminProductForm.price),
      thumbnail: adminProductForm.thumbnail.trim(),
      previewUrl: adminProductForm.thumbnail.trim(),
      tags,
      date: formattedDate,
      popularity: 0,
      isLiked: false,
      isFavorite: false,
    }

    setProductItems((currentProducts) => [nextProduct, ...currentProducts])
    setAdminProductForm(initialAdminProductForm)
    setAdminProductErrors({})
    setAdminProductMessage(`"${nextProduct.title}" 상품을 추가했습니다.`)
  }

  const handleEditAdminProduct = (product) => {
    setAdminProductForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      type: product.type,
      tags: product.tags.join(', '),
      thumbnail: product.thumbnail,
    })
    setAdminProductErrors({})
    setAdminProductMessage(`"${product.title}" 상품을 수정하는 중입니다.`)
    setEditingProductId(product.id)
  }

  const handleDeleteAdminProduct = (product) => {
    const shouldDelete = window.confirm(
      `"${product.title}" 상품을 목록에서 삭제할까요?`,
    )

    if (!shouldDelete) {
      return
    }

    deleteProductById(product.id)
    setAdminProductMessage(`"${product.title}" 상품을 삭제했습니다.`)
  }

  const handleDeleteProduct = () => {
    if (!selectedProduct) {
      return
    }

    const shouldDelete = window.confirm(
      `"${selectedProduct.title}" 상품을 목록에서 삭제할까요?`,
    )

    if (!shouldDelete) {
      return
    }

    deleteProductById(selectedProduct.id)
  }

  const handleViewProduct = (product) => {
    setSelectedProduct(product)
    setRecentViewedProducts((currentProducts) => [
      product,
      ...currentProducts.filter((recentProduct) => recentProduct.id !== product.id),
    ].slice(0, maxRecentViewedProducts))
  }

  const handleToggleLike = (productId) => {
    setProductItems((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? { ...product, isLiked: !product.isLiked }
          : product,
      ),
    )

    setSelectedProduct((currentProduct) =>
      currentProduct?.id === productId
        ? { ...currentProduct, isLiked: !currentProduct.isLiked }
        : currentProduct,
    )
  }

  const handleToggleFavorite = (productId) => {
    setProductItems((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? { ...product, isFavorite: !product.isFavorite }
          : product,
      ),
    )

    setSelectedProduct((currentProduct) =>
      currentProduct?.id === productId
        ? { ...currentProduct, isFavorite: !currentProduct.isFavorite }
        : currentProduct,
    )
  }

  const handleAddToCart = (product) => {
    setCart((currentCart) => {
      const isAlreadyInCart = currentCart.some(
        (cartItem) => cartItem.product.id === product.id,
      )

      if (isAlreadyInCart) {
        return currentCart.map((cartItem) =>
          cartItem.product.id === product.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        )
      }

      return [...currentCart, { product, quantity: 1 }]
    })
  }

  const handleIncreaseCartQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart.map((cartItem) =>
        cartItem.product.id === productId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      ),
    )
  }

  const handleDecreaseCartQuantity = (productId) => {
    setCart((currentCart) =>
      currentCart
        .map((cartItem) =>
          cartItem.product.id === productId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem,
        )
        .filter((cartItem) => cartItem.quantity > 0),
    )
  }

  const handleReviewSubmit = (event) => {
    event.preventDefault()

    if (!selectedProduct) {
      return
    }

    const trimmedReview = reviewForm.content.trim()

    if (reviewForm.rating === 0) {
      setReviewError('별점을 선택해 주세요.')
      return
    }

    if (!trimmedReview) {
      setReviewError('리뷰 내용을 입력해 주세요.')
      return
    }

    const nextReview = {
      id: Date.now(),
      rating: reviewForm.rating,
      content: trimmedReview,
    }

    setProductReviews((currentReviews) => ({
      ...currentReviews,
      [selectedProduct.id]: [
        nextReview,
        ...(currentReviews[selectedProduct.id] ?? []),
      ],
    }))
    setReviewForm({
      rating: 0,
      content: '',
    })
    setReviewError('')
  }

  const handleCommentSubmit = (event) => {
    event.preventDefault()

    if (!selectedProduct) {
      return
    }

    const trimmedComment = commentText.trim()

    if (!trimmedComment) {
      setCommentError('댓글 내용을 입력해 주세요.')
      return
    }

    const nextComment = {
      id: Date.now(),
      content: trimmedComment,
    }

    setProductComments((currentComments) => ({
      ...currentComments,
      [selectedProduct.id]: [
        nextComment,
        ...(currentComments[selectedProduct.id] ?? []),
      ],
    }))
    setCommentText('')
    setCommentError('')
  }

  const handleDeleteComment = (productId, commentId) => {
    setProductComments((currentComments) => ({
      ...currentComments,
      [productId]: (currentComments[productId] ?? []).filter(
        (comment) => comment.id !== commentId,
      ),
    }))
  }

  const filteredProducts = productItems.filter((product) => {
    const matchesCategory =
      selectedCategory === 'all' || product.type === selectedCategory
    const matchesSearch =
      !keyword ||
      product.title.toLowerCase().includes(keyword) ||
      product.description.toLowerCase().includes(keyword)
    const matchesTag = !selectedTag || product.tags.includes(selectedTag)
    const matchesMinPrice =
      minPriceValue === null || product.price >= minPriceValue
    const matchesMaxPrice =
      maxPriceValue === null || product.price <= maxPriceValue

    return (
      matchesCategory &&
      matchesSearch &&
      matchesTag &&
      matchesMinPrice &&
      matchesMaxPrice
    )
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortType === 'price-low') {
      return a.price - b.price
    }

    if (sortType === 'price-high') {
      return b.price - a.price
    }

    if (sortType === 'popular') {
      return b.popularity - a.popularity
    }

    return getDateValue(b.date) - getDateValue(a.date)
  })
  const visibleSections =
    selectedCategory === 'all'
      ? sectionCategories
      : sectionCategories.filter((category) => category.value === selectedCategory)
  const productSections = visibleSections.map((category) => ({
    ...category,
    products: sortedProducts.filter((product) => product.type === category.value),
  }))
  const cartTotalQuantity = cart.reduce(
    (total, cartItem) => total + cartItem.quantity,
    0,
  )
  const cartTotalPrice = cart.reduce(
    (total, cartItem) => total + cartItem.product.price * cartItem.quantity,
    0,
  )
  const normalizedCouponCode = couponCode.trim().toUpperCase()
  const discountRate = couponDiscounts[normalizedCouponCode] ?? 0
  const discountAmount = Math.floor((cartTotalPrice * discountRate) / 100)
  const finalPaymentAmount = cartTotalPrice - discountAmount
  const hasCouponCode = normalizedCouponCode.length > 0
  const isValidCoupon = discountRate > 0
  const selectedProductReviews = selectedProduct
    ? productReviews[selectedProduct.id] ?? []
    : []
  const selectedProductComments = selectedProduct
    ? productComments[selectedProduct.id] ?? []
    : []

  return (
    <section className="product-section" aria-labelledby="product-title">
      <div className="section-heading">
        <h2 id="product-title">상품 목록</h2>
        <p>이미지, 영상, 사이트 미리보기 상품을 둘러보세요.</p>
      </div>

      <form className="admin-product-form" onSubmit={handleAdminProductSubmit}>
        <div className="admin-product-heading">
          <h3>{editingProductId === null ? '상품 추가' : '상품 수정'}</h3>
          {adminProductMessage && <p>{adminProductMessage}</p>}
        </div>
        <div className="admin-product-grid">
          <label>
            상품 제목
            <input
              name="title"
              type="text"
              value={adminProductForm.title}
              aria-invalid={Boolean(adminProductErrors.title)}
              onChange={handleAdminProductInputChange}
            />
            {adminProductErrors.title && (
              <span>{adminProductErrors.title}</span>
            )}
          </label>
          <label>
            가격
            <input
              name="price"
              type="number"
              min="0"
              inputMode="numeric"
              value={adminProductForm.price}
              aria-invalid={Boolean(adminProductErrors.price)}
              onChange={handleAdminProductInputChange}
            />
            {adminProductErrors.price && (
              <span>{adminProductErrors.price}</span>
            )}
          </label>
          <label>
            타입
            <select
              name="type"
              value={adminProductForm.type}
              onChange={handleAdminProductInputChange}
            >
              <option value="image">이미지</option>
              <option value="video">영상</option>
              <option value="site">사이트</option>
              <option value="plan">기획서</option>
            </select>
          </label>
          <label>
            태그
            <input
              name="tags"
              type="text"
              placeholder="갤러리, 포트폴리오, UI"
              value={adminProductForm.tags}
              aria-invalid={Boolean(adminProductErrors.tags)}
              onChange={handleAdminProductInputChange}
            />
            {adminProductErrors.tags && <span>{adminProductErrors.tags}</span>}
          </label>
          <label>
            썸네일 URL
            <input
              name="thumbnail"
              type="url"
              placeholder="/images/example.jpg"
              value={adminProductForm.thumbnail}
              aria-invalid={Boolean(adminProductErrors.thumbnail)}
              onChange={handleAdminProductInputChange}
            />
            {adminProductErrors.thumbnail && (
              <span>{adminProductErrors.thumbnail}</span>
            )}
          </label>
          <label className="admin-product-description">
            설명
            <textarea
              name="description"
              rows="3"
              value={adminProductForm.description}
              aria-invalid={Boolean(adminProductErrors.description)}
              onChange={handleAdminProductInputChange}
            />
            {adminProductErrors.description && (
              <span>{adminProductErrors.description}</span>
            )}
          </label>
        </div>
        <div className="admin-product-actions">
          <button
            type="button"
            onClick={resetAdminProductForm}
          >
            {editingProductId === null ? '초기화' : '수정 취소'}
          </button>
          <button type="submit">
            {editingProductId === null ? '상품 추가' : '수정 저장'}
          </button>
        </div>
      </form>

      <div className="product-search">
        <label htmlFor="product-search-input">상품 검색</label>
        <input
          id="product-search-input"
          type="search"
          placeholder="제목 또는 설명으로 검색"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      <div className="category-filter" aria-label="상품 카테고리">
        {categories.map((category) => (
          <button
            key={category.value}
            type="button"
            className={`category-button${
              selectedCategory === category.value ? ' is-active' : ''
            }`}
            onClick={() => setSelectedCategory(category.value)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="price-filter">
        <label>
          최소 가격
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="0"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
        </label>
        <label>
          최대 가격
          <input
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="600000"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </label>
      </div>

      <label className="sort-filter">
        정렬
        <select
          value={sortType}
          onChange={(event) => setSortType(event.target.value)}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className="reset-filter-button" onClick={resetFilters}>
        필터 초기화
      </button>

      <div className="cart-panel" aria-label="장바구니">
        <p className="cart-summary">
          장바구니: 상품 {cartTotalQuantity}개 / 합계{' '}
          {priceFormatter.format(cartTotalPrice)}
        </p>
        <label className="coupon-field" htmlFor="coupon-code-input">
          쿠폰 코드
          <input
            id="coupon-code-input"
            type="text"
            placeholder="ART10, GALLERY20, VIP30"
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
          />
        </label>
        {hasCouponCode && (
          <p
            className={`coupon-message${isValidCoupon ? ' is-valid' : ' is-error'}`}
          >
            {isValidCoupon
              ? `${normalizedCouponCode} 쿠폰 적용: ${discountRate}% 할인`
              : '사용할 수 없는 쿠폰 코드입니다.'}
          </p>
        )}
        <dl className="cart-payment-summary">
          <div>
            <dt>상품 합계</dt>
            <dd>{priceFormatter.format(cartTotalPrice)}</dd>
          </div>
          <div>
            <dt>할인</dt>
            <dd>
              {discountRate > 0 ? `${discountRate}% ` : ''}
              {priceFormatter.format(discountAmount)}
            </dd>
          </div>
          <div className="cart-payment-total">
            <dt>최종 결제 금액</dt>
            <dd>{priceFormatter.format(finalPaymentAmount)}</dd>
          </div>
          <div>
            <dt>결제수단</dt>
            <dd>{paymentMethodLabels[paymentMethod]}</dd>
          </div>
        </dl>
        <fieldset className="payment-methods">
          <legend>결제수단</legend>
          <label>
            <input
              name="paymentMethod"
              type="radio"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />
            카드
          </label>
          <label>
            <input
              name="paymentMethod"
              type="radio"
              value="bank"
              checked={paymentMethod === 'bank'}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />
            계좌이체
          </label>
          <label>
            <input
              name="paymentMethod"
              type="radio"
              value="mobile"
              checked={paymentMethod === 'mobile'}
              onChange={(event) => setPaymentMethod(event.target.value)}
            />
            모바일 결제
          </label>
        </fieldset>
        {cart.length > 0 && (
          <ul className="cart-list">
            {cart.map(({ product, quantity }) => (
              <li key={product.id} className="cart-item">
                <div className="cart-item-info">
                  <span>{product.title}</span>
                  <small>
                    {priceFormatter.format(product.price)} x {quantity} ={' '}
                    {priceFormatter.format(product.price * quantity)}
                  </small>
                </div>
                <div className="cart-quantity-controls">
                  <button
                    type="button"
                    aria-label={`${product.title} 수량 줄이기`}
                    onClick={() => handleDecreaseCartQuantity(product.id)}
                  >
                    -
                  </button>
                  <strong aria-label={`${product.title} 수량`}>
                    {quantity}
                  </strong>
                  <button
                    type="button"
                    aria-label={`${product.title} 수량 늘리기`}
                    onClick={() => handleIncreaseCartQuantity(product.id)}
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedTag && (
        <div className="selected-tag-filter">
          <span>태그: {selectedTag}</span>
          <button type="button" onClick={() => setSelectedTag('')}>
            해제
          </button>
        </div>
      )}

      {isProductsLoading ? (
        <div className="product-loading" role="status" aria-live="polite">
          <span></span>
          상품을 불러오는 중입니다...
        </div>
      ) : productsError ? (
        <div className="product-error" role="alert">
          <p>{productsError}</p>
          <button type="button" onClick={loadProducts}>
            다시 시도
          </button>
        </div>
      ) : (
        <>
          {recentViewedProducts.length > 0 && (
            <section
              className="recent-products"
              aria-labelledby="recent-products-title"
            >
              <h3 id="recent-products-title">최근 본 상품</h3>
              <ul className="recent-products-list">
                {recentViewedProducts.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      className="recent-product-button"
                      onClick={() => handleViewProduct(product)}
                    >
                      <img src={product.thumbnail} alt="" />
                      <span>
                        <b>{product.title}</b>
                        <small>{priceFormatter.format(product.price)}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {sortedProducts.length > 0 ? (
            <div className="product-section-grid">
              {productSections.map((section) => (
                <section
                  key={section.value}
                  className="product-type-section"
                  aria-labelledby={`product-section-${section.value}`}
                >
                  <div className="product-type-section-heading">
                    <h3 id={`product-section-${section.value}`}>
                      {section.label} 섹션
                    </h3>
                    <span>{section.products.length}개</span>
                  </div>
                  {section.products.length > 0 ? (
                    <ul className="product-list product-list-stacked">
                      {section.products.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          selectedTag={selectedTag}
                          onTagClick={setSelectedTag}
                          onProductClick={handleViewProduct}
                          onToggleLike={handleToggleLike}
                          onToggleFavorite={handleToggleFavorite}
                          onAddToCart={handleAddToCart}
                          onEditProduct={handleEditAdminProduct}
                          onDeleteProduct={handleDeleteAdminProduct}
                          isInCart={cart.some(
                            (cartItem) => cartItem.product.id === product.id,
                          )}
                        />
                      ))}
                    </ul>
                  ) : (
                    <p className="empty-section-products">등록된 상품이 없습니다.</p>
                  )}
                </section>
              ))}
            </div>
          ) : (
            <p className="empty-products">
              선택한 조건에 맞는 상품이 없습니다.
            </p>
          )}
        </>
      )}

      {selectedProduct && (
        <div
          className="product-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className={`product-modal${
              selectedProduct.type === 'image' ? ' product-modal-image-detail' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="product-modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              닫기
            </button>
            {selectedProduct.type === 'site' ? (
              <iframe
                className="product-modal-image product-modal-site-preview"
                src={selectedProduct.previewUrl}
                title={`${selectedProduct.title} 사이트 미리보기`}
                loading="lazy"
              />
            ) : selectedProduct.type === 'video' &&
              !selectedProduct.previewUrl.endsWith('.svg') ? (
              <video
                className="product-modal-image"
                src={selectedProduct.previewUrl}
                poster={selectedProduct.thumbnail}
                controls
                preload="metadata"
              >
                <track kind="captions" />
              </video>
            ) : (
              <img
                className="product-modal-image"
                src={selectedProduct.thumbnail}
                alt={`${selectedProduct.title} 미리보기`}
              />
            )}
            <div className="product-modal-content">
              <span className="product-type">
                {categories.find((category) => category.value === selectedProduct.type)
                  ?.label ?? selectedProduct.type}
              </span>
              <h3 id="product-modal-title">{selectedProduct.title}</h3>
              <p>{selectedProduct.description}</p>
              <dl className="product-modal-details">
                <div>
                  <dt>가격</dt>
                  <dd>{priceFormatter.format(selectedProduct.price)}</dd>
                </div>
                <div>
                  <dt>등록일</dt>
                  <dd>{selectedProduct.date}</dd>
                </div>
                <div>
                  <dt>인기도</dt>
                  <dd>{selectedProduct.popularity}</dd>
                </div>
              </dl>
              <ul className="product-tags" aria-label={`${selectedProduct.title} 태그`}>
                {selectedProduct.tags.map((tag) => (
                  <li key={tag}>
                    <span className="product-modal-tag">{tag}</span>
                  </li>
                ))}
              </ul>
              <form className="product-review-form" onSubmit={handleReviewSubmit}>
                <div className="review-form-heading">
                  <h4>리뷰</h4>
                  <span>{reviewForm.rating} / 5</span>
                </div>
                <div className="star-rating" aria-label="별점 선택">
                  {[1, 2, 3, 4, 5].map((ratingValue) => (
                    <button
                      key={ratingValue}
                      type="button"
                      className={
                        ratingValue <= reviewForm.rating ? 'is-active' : ''
                      }
                      aria-label={`${ratingValue}점 별점`}
                      aria-pressed={ratingValue === reviewForm.rating}
                      onClick={() => {
                        setReviewForm((currentForm) => ({
                          ...currentForm,
                          rating: ratingValue,
                        }))
                        setReviewError('')
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <label className="review-field" htmlFor="product-review-input">
                  리뷰 내용
                  <textarea
                    id="product-review-input"
                    rows="3"
                    value={reviewForm.content}
                    onChange={(event) => {
                      setReviewForm((currentForm) => ({
                        ...currentForm,
                        content: event.target.value,
                      }))
                      setReviewError('')
                    }}
                  />
                </label>
                {reviewError && <p className="review-error">{reviewError}</p>}
                <button className="review-submit-button" type="submit">
                  리뷰 등록
                </button>
              </form>
              <div className="product-review-list">
                <h4>등록된 리뷰</h4>
                {selectedProductReviews.length > 0 ? (
                  <ul>
                    {selectedProductReviews.map((review) => (
                      <li key={review.id}>
                        <strong>{'★'.repeat(review.rating)}</strong>
                        <p>{review.content}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>아직 등록된 리뷰가 없습니다.</p>
                )}
              </div>
              <form className="product-comment-form" onSubmit={handleCommentSubmit}>
                <h4>댓글</h4>
                <label className="comment-field" htmlFor="product-comment-input">
                  댓글 내용
                  <textarea
                    id="product-comment-input"
                    rows="3"
                    value={commentText}
                    onChange={(event) => {
                      setCommentText(event.target.value)
                      setCommentError('')
                    }}
                  />
                </label>
                {commentError && <p className="comment-error">{commentError}</p>}
                <button className="comment-submit-button" type="submit">
                  댓글 등록
                </button>
              </form>
              <div className="product-comment-list">
                {selectedProductComments.length > 0 ? (
                  <ul>
                    {selectedProductComments.map((comment) => (
                      <li key={comment.id}>
                        <p>{comment.content}</p>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteComment(selectedProduct.id, comment.id)
                          }
                        >
                          삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>아직 등록된 댓글이 없습니다.</p>
                )}
              </div>
              <div className="product-modal-actions">
                <button type="button" onClick={() => setSelectedProduct(null)}>
                  닫기
                </button>
                <button
                  type="button"
                  className="product-delete-button"
                  onClick={handleDeleteProduct}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ProductList
