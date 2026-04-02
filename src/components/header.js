import Link from "next/link";
import { useRouter } from "next/router";

export function Header() {
  const router = useRouter();

  return (
    <>
      <style jsx>{`
        .header {
          background: linear-gradient(135deg, #0f1529 0%, #161b30 100%);
          border-bottom: 1px solid var(--border);
          padding: 16px 24px;
          position: relative;
          overflow: hidden;
        }

        .header::before {
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

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .logo-area:hover {
          opacity: 0.8;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: rgba(244, 185, 66, 0.15);
          border: 1px solid rgba(244, 185, 66, 0.3);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .logo-area:hover .logo-icon {
          background: rgba(244, 185, 66, 0.25);
          border-color: rgba(244, 185, 66, 0.5);
        }

        .logo-icon svg {
          width: 22px;
          height: 22px;
          color: var(--gold);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .logo-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.02em;
        }

        .logo-title .accent {
          color: var(--gold);
        }

        .logo-subtitle {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-link {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link:hover {
          color: var(--text);
          background: var(--surface);
        }

        .nav-link.active {
          color: var(--gold);
          background: var(--gold-dim);
        }

        .nav-link svg {
          width: 16px;
          height: 16px;
          opacity: 0.8;
        }
      `}</style>

      <header className="header">
        <div className="header-content">
          <div
            className="logo-area"
            onClick={() => router.push("/")}
            style={{ cursor: "pointer" }}
          >
            <div className="logo-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 22h14" />
                <path d="M17 22v-5" />
                <path d="M7 22v-5" />
                <path d="M12 22v-5" />
                <path d="M5 8h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2z" />
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-title">
                <span className="accent">Арвай</span> Авто
              </span>
              <span className="logo-subtitle">Баталгаатай • Найдвартай</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
