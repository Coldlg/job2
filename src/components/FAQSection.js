import { useState } from "react";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Сугалааны дугаараа яаж харах вэ?",
      answer:
        "Та хайлтын талбарт утасны дугаараа оруулж хайхад гарч ирнэ. Мөн энэ доор харагдаж байгаа шийтнүүдээс өөрийн орсон сугалааг сонгож өөрийн гүйлгээ хийсэн өдөр цаг минут секундээрээ хайгаад харж болно.",
    },
    {
      question: "Сугалаа буцааж болох уу?",
      answer:
        "Боломжгүй. Таны хийсэн гүйлгээний дарааллаар шууд дугаарлагдаад сугалааны дугаар үүссэн тул БУЦААХ БОЛОМЖГҮЙ.",
    },
    {
      question: "Сугалаа шилжүүлж болох уу?",
      answer:
        "Боломжгүй ээ. Сугалаа болгон өөр өөр дансаар мөн өөр дүнгээр явагддаг.",
    },
    {
      question: "Код ирэхгүй байна?",
      answer:
        "‼️‼️УТАСНЫ ДУГААРТ КОД ОЧИХГҮЙ‼️‼️☝️☝️дугаар харах линкрүү ороод сугалаанд орсон машинаа сонгож ороод өөрийн гүйлгээ хийсэн цаг минутаар харна шүү.",
    },
    {
      question: "Миний дугаар байхгүй байна?",
      answer: "Та гүйлгээ хийгээд 3-4 цагийн дараа шивэлт орно.",
    },
    {
      question: "Утасны дугаараа бичихээ мартсан байна? эсвэл буруу биччихжээ?",
      answer:
        "Та манай пэйж хуудасруу чатаар гүйлгээ хийсэн дансны хуулгаа илгээж утасны дугаараа засуулах боломжтой.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <style jsx>{`
        .faq-section {
          max-width: 800px;
          margin: 0 auto;
          padding: 60px 24px;
        }

        .faq-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .faq-title {
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 700;
          color: var(--text);
          margin-bottom: 12px;
        }

        .faq-sub {
          font-size: 14px;
          color: var(--text-muted);
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          transition: border-color 0.2s ease;
        }

        .faq-item:hover {
          border-color: rgba(99, 120, 255, 0.3);
        }

        .faq-question {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          cursor: pointer;
          user-select: none;
          transition: background 0.2s ease;
        }

        .faq-question:hover {
          background: rgba(99, 120, 255, 0.05);
        }

        .faq-question-text {
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          flex: 1;
          padding-right: 16px;
        }

        .faq-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(99, 120, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition:
            background 0.2s ease,
            transform 0.3s ease;
        }

        .faq-item.open .faq-icon {
          background: rgba(99, 120, 255, 0.2);
          transform: rotate(180deg);
        }

        .faq-icon svg {
          width: 14px;
          height: 14px;
          color: var(--primary);
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .faq-item.open .faq-answer {
          max-height: 300px;
        }

        .faq-answer-inner {
          padding: 0 24px 20px 24px;
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-muted);
          border-top: 1px solid transparent;
          padding-top: 16px;
        }

        .faq-item.open .faq-answer-inner {
          border-top-color: var(--border);
        }
      `}</style>

      <section className="faq-section">
        <div className="faq-header">
          <h2 className="faq-title">Түгээмэл асуултууд</h2>
          <p className="faq-sub">
            Таны асуусан асуултуудын хариултыг эндээс олно уу
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openIndex === index ? "open" : ""}`}
            >
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <span className="faq-question-text">{faq.question}</span>
                <div className="faq-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div className="faq-answer">
                <div className="faq-answer-inner">{faq.answer}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
