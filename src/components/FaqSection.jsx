import { useState } from 'react'

const faqItems = [
  {
    question: '어떤 작업물을 올릴 수 있나요?',
    answer:
      '이미지, 영상, 사이트 미리보기, 프로젝트 설명처럼 개인 포트폴리오에 필요한 작업물을 자유롭게 정리할 수 있습니다.',
  },
  {
    question: '질문을 클릭하면 어떻게 동작하나요?',
    answer:
      '각 질문을 클릭하면 답변이 열리고, 같은 질문을 다시 클릭하면 답변이 닫힙니다.',
  },
  {
    question: '포트폴리오 갤러리는 어떤 용도로 쓰나요?',
    answer:
      '개인 프로젝트, 디자인 작업, 개발 결과물을 한곳에 모아 방문자가 쉽게 둘러볼 수 있도록 소개하는 용도로 사용합니다.',
  },
]

function FaqSection() {
  const [openItemIds, setOpenItemIds] = useState([])

  const toggleItem = (itemId) => {
    setOpenItemIds((currentIds) =>
      currentIds.includes(itemId)
        ? currentIds.filter((currentId) => currentId !== itemId)
        : [...currentIds, itemId],
    )
  }

  return (
    <section className="faq-section" aria-labelledby="faq-title">
      <div className="section-heading">
        <h2 id="faq-title">자주 묻는 질문</h2>
        <p>포트폴리오 갤러리를 구성할 때 자주 확인하는 내용을 모았습니다.</p>
      </div>

      <div className="faq-list">
        {faqItems.map((item, index) => {
          const itemId = `faq-${index}`
          const isOpen = openItemIds.includes(itemId)

          return (
            <div className="faq-item" key={item.question}>
              <button
                className="faq-question"
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${itemId}-answer`}
                onClick={() => toggleItem(itemId)}
              >
                <span>{item.question}</span>
                <span className="faq-icon" aria-hidden="true">
                  {isOpen ? '-' : '+'}
                </span>
              </button>
              <div
                id={`${itemId}-answer`}
                className="faq-answer"
                hidden={!isOpen}
              >
                <p>{item.answer}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default FaqSection
