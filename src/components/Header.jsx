import { useState } from 'react'

function Header({ theme, onToggleTheme, onToast }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    contactType: 'account',
  })
  const [termsAgreement, setTermsAgreement] = useState({
    service: false,
    privacy: false,
    marketing: false,
  })
  const [loginErrors, setLoginErrors] = useState({})
  const [loginMessage, setLoginMessage] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const isDarkTheme = theme === 'dark'

  const dropdownItems = [
    { href: '#product-title', label: '전체 상품' },
    { href: '#product-title', label: '이미지 프로젝트' },
    { href: '#product-title', label: '영상 프로젝트' },
    { href: '#product-title', label: '사이트 미리보기' },
  ]
  const contactTypeLabels = {
    account: '계정',
    payment: '결제',
    product: '상품',
    partnership: '제휴',
  }

  const closeMenus = () => {
    setIsMenuOpen(false)
    setIsDropdownOpen(false)
  }

  const openLoginForm = () => {
    closeMenus()
    setIsLoginOpen(true)
  }

  const closeLoginForm = () => {
    setIsLoginOpen(false)
    setLoginErrors({})
    setLoginMessage('')
  }

  const resetLoginForm = () => {
    setLoginForm({
      email: '',
      password: '',
      contactType: 'account',
    })
    setTermsAgreement({
      service: false,
      privacy: false,
      marketing: false,
    })
    setLoginErrors({})
    setLoginMessage('')
    setIsPasswordVisible(false)
  }

  const handleLoginInputChange = (event) => {
    const { name, value } = event.target

    setLoginForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
    setLoginErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }))
    setLoginMessage('')
  }

  const handleTermsChange = (event) => {
    const { name, checked } = event.target

    if (name === 'allTerms') {
      setTermsAgreement({
        service: checked,
        privacy: checked,
        marketing: checked,
      })
      return
    }

    setTermsAgreement((currentAgreement) => ({
      ...currentAgreement,
      [name]: checked,
    }))
  }

  const validateLoginForm = () => {
    const nextErrors = {}

    if (!loginForm.email.trim()) {
      nextErrors.email = '이메일을 입력해 주세요.'
    }

    if (!loginForm.password.trim()) {
      nextErrors.password = '비밀번호를 입력해 주세요.'
    }

    return nextErrors
  }

  const handleLoginSubmit = (event) => {
    event.preventDefault()

    const nextErrors = validateLoginForm()

    if (Object.keys(nextErrors).length > 0) {
      setLoginErrors(nextErrors)
      setLoginMessage('')
      return
    }

    setLoginErrors({})
    setLoginMessage(
      `로그인 폼이 제출 준비되었습니다. 문의 유형: ${
        contactTypeLabels[loginForm.contactType]
      }.`,
    )
    onToast('로그인 폼을 제출했습니다.')
  }

  const isAllTermsChecked = Object.values(termsAgreement).every(Boolean)

  return (
    <header className="site-header">
      <a className="site-logo" href="/">
        포트폴리오 갤러리
      </a>
      <button
        className="menu-button"
        type="button"
        aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation"
        onClick={() => setIsMenuOpen((currentState) => !currentState)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav
        id="primary-navigation"
        className={`site-nav ${isMenuOpen ? 'is-open' : ''}`}
        aria-label="주요 메뉴"
      >
        <a href="#center" onClick={closeMenus}>
          홈
        </a>
        <div
          className={`nav-dropdown ${isDropdownOpen ? 'is-open' : ''}`}
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button
            className="nav-dropdown-button"
            type="button"
            aria-expanded={isDropdownOpen}
            aria-controls="gallery-dropdown"
            onClick={() => setIsDropdownOpen((currentState) => !currentState)}
          >
            갤러리
          </button>
          <div id="gallery-dropdown" className="dropdown-menu">
            {dropdownItems.map((item) => (
              <a key={item.label} href={item.href} onClick={closeMenus}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <a href="#next-steps" onClick={closeMenus}>
          소개
        </a>
        <a href="#next-steps" onClick={closeMenus}>
          문의
        </a>
      </nav>
      <button
        className="theme-toggle-button"
        type="button"
        aria-label={isDarkTheme ? '라이트 모드로 전환' : '다크 모드로 전환'}
        aria-pressed={isDarkTheme}
        onClick={onToggleTheme}
      >
        
        {isDarkTheme ? '라이트 모드' : '다크 모드'}
      </button>
      <button className="login-button" type="button" onClick={openLoginForm}>
        로그인
      </button>
      {isLoginOpen && (
        <div
          className="login-modal-backdrop"
          role="presentation"
          onClick={closeLoginForm}
        >
          <form
            className="login-form"
            aria-labelledby="login-form-title"
            noValidate
            onSubmit={handleLoginSubmit}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="login-form-heading">
              <h2 id="login-form-title">로그인</h2>
              <button
                className="login-form-close"
                type="button"
                aria-label="로그인 폼 닫기"
                onClick={closeLoginForm}
              >
                닫기
              </button>
            </div>
            <label className="login-field" htmlFor="login-email">
              <span>
                이메일
                <small>{loginForm.email.length}자</small>
              </span>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={loginForm.email}
                aria-invalid={Boolean(loginErrors.email)}
                aria-describedby={
                  loginErrors.email ? 'login-email-error' : undefined
                }
                onChange={handleLoginInputChange}
              />
            </label>
            {loginErrors.email && (
              <p className="login-error" id="login-email-error">
                {loginErrors.email}
              </p>
            )}
            <label className="login-field" htmlFor="login-password">
              <span>
                비밀번호
                <small>{loginForm.password.length}자</small>
              </span>
              <div className="password-input-wrap">
                <input
                  id="login-password"
                  name="password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={loginForm.password}
                  aria-invalid={Boolean(loginErrors.password)}
                  aria-describedby={
                    loginErrors.password ? 'login-password-error' : undefined
                  }
                  onChange={handleLoginInputChange}
                />
                <button
                  className="password-toggle-button"
                  type="button"
                  aria-label={
                    isPasswordVisible ? '비밀번호 숨기기' : '비밀번호 보이기'
                  }
                  aria-pressed={isPasswordVisible}
                  onClick={() =>
                    setIsPasswordVisible((currentState) => !currentState)
                  }
                >
                  {isPasswordVisible ? '숨기기' : '보이기'}
                </button>
              </div>
            </label>
            {loginErrors.password && (
              <p className="login-error" id="login-password-error">
                {loginErrors.password}
              </p>
            )}
            <fieldset className="login-terms">
              <legend>약관</legend>
              <label>
                <input
                  name="allTerms"
                  type="checkbox"
                  checked={isAllTermsChecked}
                  onChange={handleTermsChange}
                />
                전체 약관 동의
              </label>
              <label>
                <input
                  name="service"
                  type="checkbox"
                  checked={termsAgreement.service}
                  onChange={handleTermsChange}
                />
                서비스 이용약관
              </label>
              <label>
                <input
                  name="privacy"
                  type="checkbox"
                  checked={termsAgreement.privacy}
                  onChange={handleTermsChange}
                />
                개인정보 처리방침
              </label>
              <label>
                <input
                  name="marketing"
                  type="checkbox"
                  checked={termsAgreement.marketing}
                  onChange={handleTermsChange}
                />
                마케팅 정보 수신
              </label>
            </fieldset>
            <label className="login-field" htmlFor="contact-type">
              <span>문의 유형</span>
              <select
                id="contact-type"
                name="contactType"
                value={loginForm.contactType}
                onChange={handleLoginInputChange}
              >
                <option value="account">계정</option>
                <option value="payment">결제</option>
                <option value="product">상품</option>
                <option value="partnership">제휴</option>
              </select>
            </label>
            {loginMessage && <p className="login-message">{loginMessage}</p>}
            <div className="login-form-actions">
              <button
                className="login-reset-button"
                type="button"
                onClick={resetLoginForm}
              >
                초기화
              </button>
              <button className="login-submit-button" type="submit">
                로그인
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  )
}

export default Header
