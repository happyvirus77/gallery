import { useState } from 'react'

const tabs = [
  {
    id: 'images',
    label: '이미지',
    title: '이미지 갤러리',
    description:
      '포스터, UI 화면, 그래픽 작업처럼 시각적인 결과물을 모아 보여주는 영역입니다.',
    items: ['브랜드 포스터', 'UI 시안', '그래픽 디자인'],
  },
  {
    id: 'videos',
    label: '영상',
    title: '영상 포트폴리오',
    description:
      '프로젝트 시연 영상, 모션 작업, 발표 자료를 보기 쉽게 정리한 영역입니다.',
    items: ['프로젝트 시연', '모션 그래픽', '발표 영상'],
  },
  {
    id: 'site',
    label: '사이트',
    title: '사이트 미리보기',
    description:
      '개인 작업물을 카테고리별로 탐색하고, 프로젝트 설명과 연락 정보를 함께 확인할 수 있습니다.',
    items: ['상품 분류', '프로젝트 설명', '연락 채널'],
  },
]

function GalleryTabs() {
  const [activeTabId, setActiveTabId] = useState(tabs[0].id)
  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  return (
    <section className="gallery-tabs" aria-labelledby="gallery-tabs-title">
      <div className="section-heading">
        <h2 id="gallery-tabs-title">콘텐츠 보기</h2>
        <p>이미지, 영상, 사이트 소개 내용을 탭으로 전환해 확인하세요.</p>
      </div>

      <div className="tab-list" role="tablist" aria-label="갤러리 콘텐츠">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`${tab.id}-tab`}
            className={`tab-button ${activeTabId === tab.id ? 'is-active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activeTabId === tab.id}
            aria-controls={`${tab.id}-panel`}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id={`${activeTab.id}-panel`}
        className="tab-panel"
        role="tabpanel"
        aria-labelledby={`${activeTab.id}-tab`}
      >
        <h3>{activeTab.title}</h3>
        <p>{activeTab.description}</p>
        <ul>
          {activeTab.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default GalleryTabs
