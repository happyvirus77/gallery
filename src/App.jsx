import { useEffect, useState } from 'react'
import { Footer, Header, Main } from './components'
import './App.css'
import './styles/home.css'

const themeStorageKey = 'gallery-theme'
const dDayTarget = new Date('2026-12-31T23:59:59')

function getSavedTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  try {
    const savedTheme = window.localStorage.getItem(themeStorageKey)

    return savedTheme === 'dark' || savedTheme === 'light'
      ? savedTheme
      : 'light'
  } catch {
    return 'light'
  }
}

function App() {
  const [theme, setTheme] = useState(getSavedTheme)
  const [now, setNow] = useState(() => new Date())
  const [isBackTopVisible, setIsBackTopVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    try {
      window.localStorage.setItem(themeStorageKey, theme)
    } catch {
      // Keep theme switching usable even when localStorage is blocked.
    }
  }, [theme])

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsBackTopVisible(window.scrollY > 360)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!toastMessage) {
      return undefined
    }

    const timerId = window.setTimeout(() => {
      setToastMessage('')
    }, 2600)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [toastMessage])

  const showToast = (message) => {
    setToastMessage(message)
  }

  const handleToggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark'
      showToast(`${nextTheme === 'dark' ? '다크' : '라이트'} 모드로 변경되었습니다.`)

      return nextTheme
    })
  }

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
    showToast('맨 위로 이동했습니다.')
  }

  return (
    <>
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onToast={showToast}
      />
      <Main now={now} dDayTarget={dDayTarget} />
      <Footer />
      <button
        className={`back-to-top-button${isBackTopVisible ? ' is-visible' : ''}`}
        type="button"
        aria-label="맨 위로 이동"
        onClick={handleBackToTop}
      >
        맨 위
      </button>
      <div
        className={`toast${toastMessage ? ' is-visible' : ''}`}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
    </>
  )
}

export default App
