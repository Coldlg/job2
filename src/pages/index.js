import Head from "next/head";
import { Header } from "@/components/header";
import { LotteryCard } from "@/components/LotteryCard";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";
import { ScrollToFAQ } from "@/components/ScrollToFAQ";
import prisma from "@/lib/prisma";

export default function Home({ lotteries }) {
  return (
    <>
      <Head>
        <title>Итгэж ороод инээгээд хож</title>
        <meta
          name="description"
          content="Арвай Авто Худалдаа. Амжиж ороод атгаад ав."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Итгэж ороод инээгээд хож" />
        <meta
          property="og:description"
          content="Арвай Авто Худалдаа. Амжиж ороод атгаад ав."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Итгэж ороод инээгээд хож" />
        <meta
          name="twitter:description"
          content="Арвай Авто Худалдаа. Амжиж ороод атгаад ав."
        />
      </Head>

      <style jsx global>{`
        .page-wrapper {
          min-height: 100vh;
          background: var(--bg);
        }

        .page-header {
          background: linear-gradient(135deg, #0f1529 0%, #161b30 100%);
          border-bottom: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }

        .page-header::before {
          content: "";
          position: absolute;
          top: -60px;
          left: -60px;
          width: 300px;
          height: 300px;
          background: radial-gradient(
            circle,
            rgba(99, 120, 255, 0.08) 0%,
            transparent 70%
          );
          pointer-events: none;
        }

        .main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        .page-title-section {
          text-align: center;
          margin-bottom: 40px;
        }

        .lottery-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--gold-dim);
          border: 1px solid rgba(244, 185, 66, 0.3);
          color: var(--gold);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 16px;
        }

        .page-title {
          font-size: clamp(24px, 4vw, 32px);
          font-weight: 700;
          color: var(--text);
          line-height: 1.2;
          margin-bottom: 8px;
        }

        .page-sub {
          font-size: 14px;
          color: var(--text-muted);
        }

        #faq-section {
          scroll-margin-top: 80px;
        }

        .lottery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        @media (max-width: 768px) {
          .lottery-grid {
            grid-template-columns: 1fr;
          }
        }

        #faq-section {
          scroll-margin-top: 80px;
        }
      `}</style>

      <div className="page-wrapper">
        <div className="page-header">
          <Header />
        </div>

        <main className="main">
          <div className="page-title-section">
            <div className="lottery-badge">
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="currentColor"
              >
                <circle cx="5" cy="5" r="5" />
              </svg>
              Сугалаанууд
            </div>
            <h1 className="page-title">Итгэж ороод инээгээд хож</h1>
            <p className="page-sub">
              Арван мянгаар автомашинтай болох алтан боломжийг арвай авто
              худалдаа Танд олгож байна. Амжилт хүсье
            </p>
          </div>

          <div className="lottery-grid">
            {lotteries.map((lottery) => (
              <LotteryCard key={lottery.id} lottery={lottery} />
            ))}
          </div>

          {lotteries.length === 0 && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px dashed var(--border)",
                borderRadius: "var(--radius)",
                padding: "52px 24px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "38px", marginBottom: "14px" }}>🎰</div>
              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "600",
                  color: "var(--text)",
                  marginBottom: "6px",
                }}
              >
                Сугалаа олдсонгүй
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                }}
              >
                Удахгүй шинэ сугалаанууд нэмэгдэнэ
              </div>
            </div>
          )}
        </main>

        <HowItWorks />

        <div id="faq-section">
          <FAQSection />
        </div>

        <Footer />

        <ScrollToFAQ />
      </div>
    </>
  );
}

export async function getStaticProps() {
  const lotteries = await prisma.lottery.findMany({
    where: { isHidden: false },
  });

  const now = new Date();

  const serializedLotteries = lotteries.map((lottery) => ({
    ...lottery,
    drawDate: lottery.drawDate.toISOString(),
  }));

  serializedLotteries.sort((a, b) => {
    const aExpired = new Date(a.drawDate) <= now;
    const bExpired = new Date(b.drawDate) <= now;

    if (aExpired && !bExpired) return 1;
    if (!aExpired && bExpired) return -1;

    if (aExpired) {
      return new Date(b.drawDate) - new Date(a.drawDate);
    } else {
      return new Date(a.drawDate) - new Date(b.drawDate);
    }
  });

  return {
    props: {
      lotteries: serializedLotteries,
    },
    revalidate: 10,
  };
}
