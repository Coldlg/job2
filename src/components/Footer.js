export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Facebook",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: "https://www.facebook.com/arvai.autotrade",
    },
    {
      name: "Google Sheets",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      ),
      href: "https://docs.google.com/spreadsheets/d/1zX5F4uMnYUU1xIhjd180OHIgqmmZ-61p3WVfl7Kpb9Q/edit?gid=1758034218#gid=1758034218",
    },
  ];

  const footerLinks = [
    {
      title: "Тусламж",
      links: [
        { label: "Түгээмэл асуултууд", href: "#faq-section" },
        { label: "Холбоо барих", href: "#contact" },
      ],
    },
    {
      title: "Хууль эрх зүй",
      links: [
        { label: "Үйлчилгээний нөхцөл", href: "#" },
        { label: "Нууцлалын бодлого", href: "#" },
      ],
    },
  ];

  return (
    <>
      <style jsx>{`
        .footer {
          background: linear-gradient(135deg, #0a0e1a 0%, #0f1529 100%);
          border-top: 1px solid var(--border);
          padding: 60px 24px 30px;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 1fr;
          gap: 40px;
          margin-bottom: 40px;
        }

        @media (min-width: 768px) {
          .footer-main {
            grid-template-columns: 1.5fr repeat(3, 1fr);
          }
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 700;
          color: var(--text);
        }

        .footer-logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--bg);
        }

        .footer-description {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.6;
          max-width: 300px;
        }

        .footer-social {
          display: flex;
          gap: 12px;
        }

        .footer-social a {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99, 120, 255, 0.1);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }

        .footer-social a:hover {
          background: rgba(99, 120, 255, 0.2);
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-2px);
        }

        .footer-links-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 16px;
        }

        .footer-links-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links-list a {
          font-size: 13px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-links-list a:hover {
          color: var(--accent);
        }

        .footer-bottom {
          border-top: 1px solid var(--border);
          padding-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
          text-align: center;
        }

        @media (min-width: 768px) {
          .footer-bottom {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            text-align: left;
          }
        }

        .footer-copyright {
          font-size: 13px;
          color: var(--text-muted);
        }

        .footer-legal {
          display: flex;
          gap: 20px;
        }

        .footer-legal a {
          font-size: 13px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-legal a:hover {
          color: var(--accent);
        }
      `}</style>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                </div>
                Арвай Авто Сугалаа
              </div>
              <p className="footer-description">
                Итгэж ороод инээгээд хож.<br></br> Амжиж оролцоорой!
              </p>
              <div className="footer-social">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="footer-links-title">{section.title}</h4>
                <ul className="footer-links-list">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))} */}
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">
              &copy; {currentYear} Арвай Авто Худалдаа.
            </p>
            {/* <div className="footer-legal">
              <a href="#">Үйлчилгээний нөхцөл</a>
              <a href="#">Нууцлалын бодлого</a>
            </div> */}
          </div>
        </div>
      </footer>
    </>
  );
}
