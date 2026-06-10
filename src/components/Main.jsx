import heroImg from '../assets/hero.png'
import { galleryLinks, portfolioLinks } from '../data/siteLinks'
import FaqSection from './FaqSection'
import GalleryTabs from './GalleryTabs'
import ProductList from './ProductList'
import ResourceLinks from './ResourceLinks'

function formatClock(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(date)
}

function getCountdownParts(now, target) {
  const remainingTime = Math.max(0, target.getTime() - now.getTime())
  const totalSeconds = Math.floor(remainingTime / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { days, hours, minutes, seconds }
}

function Main({ now, dDayTarget }) {
  const countdown = getCountdownParts(now, dDayTarget)

  return (
    <main>
      <section id="center">
        <div>
          <h1>개인 포트폴리오 갤러리</h1>
          <p>
            나의 프로젝트, 디자인 작업, 개발 결과물을 한곳에 모아 보여주는
            개인 포트폴리오 갤러리입니다.
          </p>
        </div>
        <div className="time-dashboard" aria-label="실시간 정보">
          <div>
            <span>현재 시간</span>
            <strong>{formatClock(now)}</strong>
          </div>
          <div>
            <span>디데이</span>
            <strong>D-{countdown.days}</strong>
          </div>
          <div>
            <span>카운트다운</span>
            <strong>
              {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </strong>
          </div>
        </div>
      </section>

      <div className="ticks"></div>

      <GalleryTabs />

      <div className="ticks"></div>

      <ProductList />

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>갤러리 컬렉션</h2>
          <p>카테고리별 상품과 프로젝트를 보기 좋게 정리했습니다.</p>
          <ResourceLinks links={galleryLinks} />
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>포트폴리오 정보</h2>
          <p>작업 설명, 사용 기술, 연락 채널을 함께 제공합니다.</p>
          <ResourceLinks links={portfolioLinks} />
        </div>
      </section>

      <div className="ticks"></div>

      <FaqSection />
    </main>
  )
}

export default Main
